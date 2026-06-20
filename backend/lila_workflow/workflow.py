from __future__ import annotations

import uuid
from typing import Any

from .audio import (
    assign_speakers,
    download_audio_url,
    enrich_with_audio_features,
    load_mono_audio,
    merge_adjacent_turns,
    temporary_audio_dir,
    transcribe_audio,
)
from .database import persist_analysis, turn_json
from .metrics import build_structured_output, compute_observational_metrics, metrics_to_json
from .models import GroupInfo, StudentInfo
from .report import build_report_text
from .settings import Settings, get_settings


def run_analysis(payload: dict[str, Any], settings: Settings | None = None) -> dict[str, Any]:
    settings = settings or get_settings()
    audio_url = str(payload.get("audio_url") or "").strip()
    if not audio_url:
        raise ValueError("audio_url is required")

    session_id = normalize_session_id(payload.get("session_id"))
    session_name = str(payload.get("session_name") or payload.get("name") or "Lila discussion").strip()
    topic = str(payload.get("topic") or "General discussion").strip()
    description = payload.get("description")
    description = str(description).strip() if description else None
    duration_minutes = int(payload.get("duration_minutes") or payload.get("duration") or 20)
    group = parse_group(payload, settings)
    speaker_count = bounded_speaker_count(group, settings)

    with temporary_audio_dir() as tmp:
        audio_path = download_audio_url(audio_url, target_dir=tmp_path(tmp), settings=settings)
        chunks, duration_sec = transcribe_audio(audio_path, settings)
        try:
            samples, sample_rate = load_mono_audio(audio_path)
            enrich_with_audio_features(chunks, samples, sample_rate)
        except Exception:
            pass

    speaker_labels = assign_speakers(chunks, speaker_count)
    turns = merge_adjacent_turns(chunks, settings.silence_gap_sec)
    metrics = compute_observational_metrics(
        turns=turns,
        speaker_labels=speaker_labels,
        group=group,
        topic=topic,
        description=description,
    )
    structured = build_structured_output(metrics=metrics, turns=turns, session_duration_sec=duration_sec)
    report_text = build_report_text(session_name=session_name, topic=topic, metrics=metrics, turns=turns)
    persistence = persist_analysis(
        settings=settings,
        session_id=session_id,
        session_name=session_name,
        topic=topic,
        description=description,
        group=group,
        audio_url=audio_url,
        duration_minutes=duration_minutes,
        duration_sec=duration_sec,
        metrics=metrics,
        turns=turns,
        structured=structured,
        report_text=report_text,
    )

    speaker_map = {
        metric.speaker_label: {
            "student_id": metric.student_id,
            "student_name": metric.student_name,
            "display_name": metric.display_name,
        }
        for metric in metrics
    }
    full = {
        "session_id": session_id,
        "audio_url": audio_url,
        "session_name": session_name,
        "topic": topic,
        "group": group_to_json(group),
        "students": metrics_to_json(metrics),
        "transcript": [turn_json(turn) for turn in turns],
        "speaker_map": speaker_map,
        "speaker_durations": {metric.speaker_label: metric.total_turn_duration_sec for metric in metrics},
        "session_duration_sec": round(duration_sec, 2),
        "turn_count_processed": len(turns),
    }

    return {
        "ok": True,
        "session_id": session_id,
        "report": report_text,
        "report_text": report_text,
        "full": full,
        "important_numbers": structured,
        "assessment": structured,
        "persistence": persistence,
    }


def tmp_path(value: str):
    from pathlib import Path

    return Path(value)


def normalize_session_id(value: Any) -> str:
    if value:
        raw = str(value)
        try:
            return str(uuid.UUID(raw))
        except ValueError:
            return str(uuid.uuid5(uuid.NAMESPACE_URL, raw))
    return str(uuid.uuid4())


def parse_group(payload: dict[str, Any], settings: Settings) -> GroupInfo:
    group_payload = payload.get("group") if isinstance(payload.get("group"), dict) else {}
    students_payload = payload.get("students") or group_payload.get("students") or []
    students: list[StudentInfo] = []
    if isinstance(students_payload, list):
        for index, item in enumerate(students_payload, start=1):
            if not isinstance(item, dict):
                continue
            name = str(item.get("name") or item.get("display_name") or f"Student {index}").strip()
            student_id = str(item.get("id") or slug_id(name, index)).strip()
            students.append(StudentInfo(id=student_id, name=name, age_range=item.get("age_range")))

    group_id = payload.get("group_id") or group_payload.get("id")
    group_name = payload.get("group_name") or group_payload.get("name")
    student_count_raw = payload.get("student_count") or group_payload.get("student_count") or len(students) or settings.default_speaker_count
    try:
        student_count = int(student_count_raw)
    except (TypeError, ValueError):
        student_count = settings.default_speaker_count

    return GroupInfo(
        id=str(group_id).strip() if group_id else None,
        name=str(group_name).strip() if group_name else None,
        grade=payload.get("grade") or group_payload.get("grade"),
        student_count=student_count,
        students=students,
    )


def bounded_speaker_count(group: GroupInfo, settings: Settings) -> int:
    count = group.student_count or len(group.students) or settings.default_speaker_count
    return max(1, min(settings.max_speaker_count, count))


def slug_id(name: str, index: int) -> str:
    slug = "".join(ch.lower() if ch.isalnum() else "-" for ch in name).strip("-")
    return slug or f"student-{index}"


def group_to_json(group: GroupInfo) -> dict[str, Any]:
    return {
        "id": group.id,
        "name": group.name,
        "grade": group.grade,
        "student_count": group.student_count,
        "students": [{"id": student.id, "name": student.name, "age_range": student.age_range} for student in group.students],
    }


run_workflow = run_analysis
