from __future__ import annotations

import uuid
from typing import Any

import requests

from .metrics import metrics_to_json
from .models import GroupInfo, SpeakerMetric, TranscriptChunk
from .settings import Settings


class SupabaseRestClient:
    def __init__(self, url: str, key: str, timeout: float = 30.0) -> None:
        self.url = url.rstrip("/")
        self.key = key
        self.timeout = timeout

    def _headers(self, prefer: str | None = None) -> dict[str, str]:
        headers = {
            "apikey": self.key,
            "Authorization": f"Bearer {self.key}",
            "Content-Type": "application/json",
        }
        if prefer:
            headers["Prefer"] = prefer
        return headers

    def upsert(self, table: str, rows: list[dict[str, Any]], on_conflict: str | None = None) -> Any:
        if not rows:
            return []
        params = {"on_conflict": on_conflict} if on_conflict else None
        response = requests.post(
            f"{self.url}/rest/v1/{table}",
            params=params,
            headers=self._headers("resolution=merge-duplicates,return=representation"),
            json=rows,
            timeout=self.timeout,
        )
        response.raise_for_status()
        return response.json() if response.content else []

    def insert(self, table: str, rows: list[dict[str, Any]]) -> Any:
        if not rows:
            return []
        response = requests.post(
            f"{self.url}/rest/v1/{table}",
            headers=self._headers("return=representation"),
            json=rows,
            timeout=self.timeout,
        )
        response.raise_for_status()
        return response.json() if response.content else []


def persist_analysis(
    *,
    settings: Settings,
    session_id: str,
    session_name: str,
    topic: str,
    description: str | None,
    group: GroupInfo,
    audio_url: str,
    duration_minutes: int,
    duration_sec: float,
    metrics: list[SpeakerMetric],
    turns: list[TranscriptChunk],
    structured: dict[str, Any],
    report_text: str,
) -> dict[str, Any]:
    if not settings.supabase_url or not settings.supabase_key:
        return {"persisted": False, "reason": "Supabase URL/key not configured"}

    client = SupabaseRestClient(settings.supabase_url, settings.supabase_key, settings.request_timeout_sec)
    speaker_map = {
        metric.speaker_label: {
            "student_id": metric.student_id,
            "student_name": metric.student_name,
            "display_name": metric.display_name,
        }
        for metric in metrics
    }

    try:
        if group.id:
            client.upsert(
                "groups",
                [
                    {
                        "id": group.id,
                        "name": group.name or group.id,
                        "grade": group.grade,
                        "student_count": group.student_count or len(group.students) or len(metrics),
                        "topic": topic or None,
                    }
                ],
                on_conflict="id",
            )

        student_rows = [
            {
                "id": student.id,
                "group_id": group.id,
                "display_name": student.name,
                "age_range": student.age_range,
            }
            for student in group.students
            if student.id
        ]
        client.upsert("students", student_rows, on_conflict="id")

        client.upsert(
            "sessions",
            [
                {
                    "id": session_id,
                    "session_name": session_name,
                    "topic": topic,
                    "description": description,
                    "duration_minutes": duration_minutes,
                    "group_id": group.id,
                    "audio_url": audio_url,
                    "status": "processed",
                    "analysis_status": "processed",
                    "speaker_map": speaker_map,
                }
            ],
            on_conflict="id",
        )

        metric_rows = [metric_row(session_id, group.id, metric) for metric in metrics]
        client.upsert("session_metrics", metric_rows, on_conflict="session_id,speaker_label")

        follow_rows = follow_up_rows(session_id, group.id, metrics)
        client.upsert("follow_ups", follow_rows, on_conflict="id")

        client.insert(
            "session_reports",
            [
                {
                    "session_id": session_id,
                    "audio_url": audio_url,
                    "report_text": report_text,
                    "report_json": {
                        "session_duration_sec": duration_sec,
                        "speaker_map": speaker_map,
                        "transcript": [turn_json(turn) for turn in turns],
                        "metrics": metrics_to_json(metrics),
                        "important_numbers": structured,
                    },
                }
            ],
        )
    except requests.HTTPError as exc:
        detail = exc.response.text[:500] if exc.response is not None else str(exc)
        return {"persisted": False, "reason": f"Supabase write failed: {detail}"}
    except Exception as exc:
        return {"persisted": False, "reason": f"Supabase write failed: {exc}"}

    return {"persisted": True}


def metric_row(session_id: str, group_id: str | None, metric: SpeakerMetric) -> dict[str, Any]:
    return {
        "session_id": session_id,
        "group_id": group_id,
        "student_id": metric.student_id,
        "student_name": metric.student_name,
        "speaker_label": metric.speaker_label,
        "display_name": metric.display_name,
        "speaking_turns": metric.speaking_turns,
        "total_turn_duration_sec": metric.total_turn_duration_sec,
        "avg_turn_duration_sec": metric.avg_turn_duration_sec,
        "interruptions": metric.interruptions,
        "response_latency_sec": metric.response_latency_sec,
        "words_per_turn": metric.words_per_turn,
        "questions_asked": metric.questions_asked,
        "tone_register": metric.tone_register,
        "topic_relevance": metric.topic_relevance,
        "participation_pct": metric.participation_pct,
        "observation_flags": metric.observation_flags,
        "raw_metrics": metric.raw,
    }


def follow_up_rows(session_id: str, group_id: str | None, metrics: list[SpeakerMetric]) -> list[dict[str, Any]]:
    rows: list[dict[str, Any]] = []
    for metric in metrics:
        for flag in metric.observation_flags:
            rows.append(
                {
                    "id": str(uuid.uuid5(uuid.NAMESPACE_URL, f"{session_id}:{metric.student_id}:{metric.speaker_label}:{flag}")),
                    "session_id": session_id,
                    "group_id": group_id,
                    "student_id": metric.student_id,
                    "student_name": metric.student_name,
                    "speaker_label": metric.speaker_label,
                    "title": readable_follow_up_title(flag, metric.student_name or metric.speaker_label),
                    "body": readable_follow_up_body(flag),
                    "flag": flag,
                    "status": "pending",
                }
            )
    return rows


def readable_follow_up_title(flag: str, name: str) -> str:
    return {
        "no_detected_speech": f"Review participation for {name}",
        "low_participation": f"Review participation balance for {name}",
        "frequent_interruptions": f"Review turn-taking pattern for {name}",
        "long_direct_response_latency": f"Review response latency for {name}",
        "low_topic_overlap": f"Review topic connection for {name}",
    }.get(flag, f"Review observation for {name}")


def readable_follow_up_body(flag: str) -> str:
    return {
        "no_detected_speech": "No speech was assigned to this speaker label in the processed audio.",
        "low_participation": "The student had lower detected speaking time than the rest of the group.",
        "frequent_interruptions": "Several turns began very close to the previous speaker's turn.",
        "long_direct_response_latency": "A direct invitation was followed by a longer-than-usual response gap.",
        "low_topic_overlap": "The transcript text had little keyword overlap with the session topic.",
    }.get(flag, "A conversation pattern needs teacher review.")


def turn_json(turn: TranscriptChunk) -> dict[str, Any]:
    return {
        "speaker": turn.speaker_label,
        "start": round(turn.start, 2),
        "end": round(turn.end, 2),
        "text": turn.text,
        "pitch_hz": round(turn.pitch_hz, 2),
        "energy": round(turn.energy, 5),
    }
