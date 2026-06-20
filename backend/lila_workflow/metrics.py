from __future__ import annotations

import re
from collections import defaultdict
from dataclasses import asdict
from typing import Any

from .models import GroupInfo, SpeakerMetric, TranscriptChunk


WORD_RE = re.compile(r"[A-Za-z']+")
QUESTION_STARTERS = {
    "who",
    "what",
    "when",
    "where",
    "why",
    "how",
    "can",
    "could",
    "would",
    "should",
    "do",
    "does",
    "did",
    "is",
    "are",
}
INVITATION_PHRASES = {
    "what do you think",
    "can you",
    "could you",
    "would you",
    "tell us",
    "share your",
    "your turn",
    "do you want",
    "what about",
}
STOPWORDS = {
    "a",
    "an",
    "and",
    "are",
    "as",
    "at",
    "be",
    "but",
    "by",
    "for",
    "from",
    "how",
    "i",
    "in",
    "is",
    "it",
    "of",
    "on",
    "or",
    "our",
    "that",
    "the",
    "their",
    "this",
    "to",
    "we",
    "what",
    "when",
    "where",
    "who",
    "why",
    "with",
    "you",
    "your",
}


def tokenize(text: str) -> list[str]:
    return WORD_RE.findall((text or "").lower())


def count_words(text: str) -> int:
    return len(tokenize(text))


def safe_div(num: float, den: float) -> float:
    return 0.0 if den <= 0 else num / den


def compute_observational_metrics(
    turns: list[TranscriptChunk],
    speaker_labels: list[str],
    group: GroupInfo,
    topic: str,
    description: str | None,
) -> list[SpeakerMetric]:
    by_speaker: dict[str, list[TranscriptChunk]] = defaultdict(list)
    for turn in turns:
        by_speaker[turn.speaker_label].append(turn)

    total_talk_time = sum(turn.duration_sec for turn in turns)
    topic_keywords = extract_topic_keywords(" ".join([topic or "", description or ""]))
    metrics: list[SpeakerMetric] = []

    for index, label in enumerate(speaker_labels):
        speaker_turns = by_speaker.get(label, [])
        student = group.students[index] if index < len(group.students) else None
        text = " ".join(turn.text for turn in speaker_turns)
        words = count_words(text)
        speaking_turns = len(speaker_turns)
        total_duration = sum(turn.duration_sec for turn in speaker_turns)
        questions = sum(count_questions(turn.text) for turn in speaker_turns)
        interruptions = count_interruptions(label, turns)
        response_latency = direct_invitation_latency(label, student.name if student else None, turns)
        topic_relevance = keyword_overlap(text, topic_keywords)
        tone_register = tone_register_sentiment(text)
        participation_pct = round(100.0 * safe_div(total_duration, total_talk_time), 2)
        avg_turn_duration = round(safe_div(total_duration, speaking_turns), 2)
        words_per_turn = round(safe_div(words, speaking_turns), 2)

        flags = observation_flags(
            speaking_turns=speaking_turns,
            participation_pct=participation_pct,
            interruptions=interruptions,
            response_latency=response_latency,
            topic_relevance=topic_relevance,
        )

        raw = {
            "total_words": words,
            "turns": [turn_to_json(turn) for turn in speaker_turns],
            "avg_energy": round(safe_div(sum(turn.energy for turn in speaker_turns), speaking_turns), 5),
            "avg_pitch_hz": round(safe_div(sum(turn.pitch_hz for turn in speaker_turns if turn.pitch_hz > 0), max(1, sum(1 for turn in speaker_turns if turn.pitch_hz > 0))), 2),
        }

        metrics.append(
            SpeakerMetric(
                speaker_label=label,
                student_id=student.id if student else None,
                student_name=student.name if student else None,
                display_name=label,
                speaking_turns=speaking_turns,
                total_turn_duration_sec=round(total_duration, 2),
                avg_turn_duration_sec=avg_turn_duration,
                interruptions=interruptions,
                response_latency_sec=round(response_latency, 2) if response_latency is not None else None,
                words_per_turn=words_per_turn,
                questions_asked=questions,
                tone_register=tone_register,
                topic_relevance=round(topic_relevance, 3),
                participation_pct=participation_pct,
                observation_flags=flags,
                raw=raw,
            )
        )

    return metrics


def count_questions(text: str) -> int:
    explicit = (text or "").count("?")
    tokens = tokenize(text)
    if not tokens:
        return explicit
    inferred = 1 if tokens[0] in QUESTION_STARTERS else 0
    return max(explicit, inferred)


def count_interruptions(label: str, turns: list[TranscriptChunk]) -> int:
    count = 0
    for previous, current in zip(turns, turns[1:]):
        if current.speaker_label != label or previous.speaker_label == label:
            continue
        gap = current.start - previous.end
        if gap < 0.0 or gap <= 0.25:
            count += 1
    return count


def direct_invitation_latency(label: str, student_name: str | None, turns: list[TranscriptChunk]) -> float | None:
    latencies: list[float] = []
    for index, turn in enumerate(turns):
        if index == 0 or turn.speaker_label != label:
            continue
        previous = turns[index - 1]
        if previous.speaker_label == label:
            continue
        if is_direct_invitation(previous.text, label, student_name):
            latencies.append(max(0.0, turn.start - previous.end))
    if not latencies:
        return None
    return sum(latencies) / len(latencies)


def is_direct_invitation(text: str, label: str, student_name: str | None) -> bool:
    normalized = " ".join(tokenize(text))
    if not normalized:
        return False
    mentions = [label.lower()]
    if student_name:
        mentions.append(student_name.lower())
        mentions.append(student_name.split()[0].lower())
    has_invitation = any(phrase in normalized for phrase in INVITATION_PHRASES) or count_questions(text) > 0
    return has_invitation and any(mention in normalized for mention in mentions)


def extract_topic_keywords(text: str) -> set[str]:
    return {token for token in tokenize(text) if len(token) > 2 and token not in STOPWORDS}


def keyword_overlap(text: str, topic_keywords: set[str]) -> float:
    if not topic_keywords:
        return 0.0
    spoken = extract_topic_keywords(text)
    if not spoken:
        return 0.0
    return len(spoken & topic_keywords) / len(topic_keywords)


def tone_register_sentiment(text: str) -> str:
    if not text.strip():
        return "neutral"
    try:
        from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer

        score = SentimentIntensityAnalyzer().polarity_scores(text)["compound"]
    except Exception:
        score = simple_sentiment_score(text)
    if score >= 0.25:
        return "positive"
    if score <= -0.2:
        return "uncertain"
    return "neutral"


def simple_sentiment_score(text: str) -> float:
    positive = {"agree", "build", "care", "fair", "good", "great", "help", "kind", "learn", "like", "listen", "share", "thank"}
    uncertain = {"confused", "hard", "no", "not", "problem", "stuck", "unsure", "worry", "wrong"}
    tokens = tokenize(text)
    if not tokens:
        return 0.0
    return safe_div(sum(1 for token in tokens if token in positive) - sum(1 for token in tokens if token in uncertain), len(tokens))


def observation_flags(
    *,
    speaking_turns: int,
    participation_pct: float,
    interruptions: int,
    response_latency: float | None,
    topic_relevance: float,
) -> list[str]:
    flags: list[str] = []
    if speaking_turns == 0:
        flags.append("no_detected_speech")
    elif participation_pct < 8.0:
        flags.append("low_participation")
    if interruptions >= 3:
        flags.append("frequent_interruptions")
    if response_latency is not None and response_latency > 4.0:
        flags.append("long_direct_response_latency")
    if topic_relevance < 0.1 and speaking_turns > 0:
        flags.append("low_topic_overlap")
    return flags


def turn_to_json(turn: TranscriptChunk) -> dict[str, Any]:
    return {
        "speaker": turn.speaker_label,
        "start": round(turn.start, 2),
        "end": round(turn.end, 2),
        "text": turn.text,
        "energy": round(turn.energy, 5),
        "pitch_hz": round(turn.pitch_hz, 2),
    }


def build_structured_output(
    *,
    metrics: list[SpeakerMetric],
    turns: list[TranscriptChunk],
    session_duration_sec: float,
) -> dict[str, Any]:
    overview = [metric_overview(metric) for metric in metrics]
    observation_rows = [
        {
            "speaker_id": metric.speaker_label,
            "display_name": metric.display_name,
            "low_participation": "low_participation" in metric.observation_flags or "no_detected_speech" in metric.observation_flags,
            "frequent_interruptions": "frequent_interruptions" in metric.observation_flags,
            "long_direct_response_latency": "long_direct_response_latency" in metric.observation_flags,
            "low_topic_overlap": "low_topic_overlap" in metric.observation_flags,
        }
        for metric in metrics
    ]

    return {
        "session_summary": {
            "session_duration_sec": round(session_duration_sec, 2),
            "total_measured_speaking_sec": round(sum(metric.total_turn_duration_sec for metric in metrics), 2),
            "speaker_count": len(metrics),
            "active_speakers": sum(1 for metric in metrics if metric.speaking_turns > 0),
            "turn_count_processed": len(turns),
            "most_talkative_speaker": max(metrics, key=lambda metric: metric.total_turn_duration_sec).speaker_label if metrics else None,
            "observation_flag_counts": {
                "low_participation": sum(1 for metric in metrics if "low_participation" in metric.observation_flags or "no_detected_speech" in metric.observation_flags),
                "frequent_interruptions": sum(1 for metric in metrics if "frequent_interruptions" in metric.observation_flags),
                "long_direct_response_latency": sum(1 for metric in metrics if "long_direct_response_latency" in metric.observation_flags),
                "low_topic_overlap": sum(1 for metric in metrics if "low_topic_overlap" in metric.observation_flags),
            },
        },
        "chart_data": {
            "speakers_overview": overview,
            "tone_registers": [
                {
                    "speaker_id": metric.speaker_label,
                    "display_name": metric.display_name,
                    "tone_register": metric.tone_register,
                    "tone_score": {"positive": 1, "neutral": 0, "uncertain": -1}[metric.tone_register],
                }
                for metric in metrics
            ],
            "topic_relevance": [
                {
                    "speaker_id": metric.speaker_label,
                    "display_name": metric.display_name,
                    "topic_relevance": metric.topic_relevance,
                }
                for metric in metrics
            ],
            "observation_flags": observation_rows,
        },
        "graphs": [
            {
                "id": "speaking_time_by_speaker",
                "title": "Speaking Time by Speaker",
                "type": "bar",
                "data_key": "speakers_overview",
                "x": "speaker_id",
                "y": "total_duration_sec",
                "y_label": "Seconds",
            },
            {
                "id": "turn_count_by_speaker",
                "title": "Speaking Turns by Speaker",
                "type": "bar",
                "data_key": "speakers_overview",
                "x": "speaker_id",
                "y": "speaking_turns",
                "y_label": "Turns",
            },
            {
                "id": "words_per_turn_by_speaker",
                "title": "Words per Turn by Speaker",
                "type": "bar",
                "data_key": "speakers_overview",
                "x": "speaker_id",
                "y": "words_per_turn",
                "y_label": "Words",
            },
            {
                "id": "topic_relevance_by_speaker",
                "title": "Topic Overlap by Speaker",
                "type": "bar",
                "data_key": "topic_relevance",
                "x": "speaker_id",
                "y": "topic_relevance",
                "y_label": "Overlap",
            },
            {
                "id": "observation_flags_heatmap",
                "title": "Observation Flags by Speaker",
                "type": "heatmap",
                "data_key": "observation_flags",
                "x": "speaker_id",
                "series": [
                    "low_participation",
                    "frequent_interruptions",
                    "long_direct_response_latency",
                    "low_topic_overlap",
                ],
            },
        ],
    }


def metric_overview(metric: SpeakerMetric) -> dict[str, Any]:
    return {
        "speaker_id": metric.speaker_label,
        "display_name": metric.display_name,
        "student_id": metric.student_id,
        "student_name": metric.student_name,
        "total_duration_sec": metric.total_turn_duration_sec,
        "talk_ratio_pct": metric.participation_pct,
        "speaking_turns": metric.speaking_turns,
        "avg_turn_duration_sec": metric.avg_turn_duration_sec,
        "interruptions": metric.interruptions,
        "response_latency_sec": metric.response_latency_sec,
        "words_per_turn": metric.words_per_turn,
        "questions_asked": metric.questions_asked,
        "tone_register": metric.tone_register,
        "topic_relevance": metric.topic_relevance,
        "observation_flags": metric.observation_flags,
    }


def metrics_to_json(metrics: list[SpeakerMetric]) -> list[dict[str, Any]]:
    return [asdict(metric) for metric in metrics]
