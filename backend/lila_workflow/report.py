from __future__ import annotations

from datetime import date

from .models import SpeakerMetric, TranscriptChunk


DISCLAIMER = (
    "This report is generated from speech timing, transcript, and conversation metrics. "
    "It is a supplementary observational tool only, not a psychological, behavioral, "
    "or diagnostic assessment. Teacher review and professional judgment are required."
)


def build_report_text(
    *,
    session_name: str,
    topic: str,
    metrics: list[SpeakerMetric],
    turns: list[TranscriptChunk],
) -> str:
    participants = ", ".join(metric.student_name or metric.speaker_label for metric in metrics) or "No speakers detected"
    active_count = sum(1 for metric in metrics if metric.speaking_turns > 0)
    total_turns = sum(metric.speaking_turns for metric in metrics)

    lines = [
        "Session Observation Report",
        f"Date: {date.today().isoformat()}",
        f"Session: {session_name}",
        f"Topic: {topic or 'General discussion'}",
        f"Participants: {participants}",
        "",
        "Session Overview",
        (
            f"The session produced {total_turns} processed speaking turns across {active_count} active "
            f"speaker{'s' if active_count != 1 else ''}. The signals below describe participation, turn timing, "
            "question asking, topic overlap, and tone-register wording only."
        ),
        "",
        "Individual Observations",
    ]

    for metric in metrics:
        name = metric.student_name or metric.speaker_label
        latency = (
            f"{metric.response_latency_sec:.2f}s"
            if metric.response_latency_sec is not None
            else "no direct invitation detected"
        )
        flags = ", ".join(readable_flag(flag) for flag in metric.observation_flags) or "No review flags"
        lines.extend(
            [
                "",
                name,
                f"- Speaker label: {metric.speaker_label}",
                f"- Speaking turns: {metric.speaking_turns}",
                f"- Total turn duration: {metric.total_turn_duration_sec:.2f}s",
                f"- Average turn duration: {metric.avg_turn_duration_sec:.2f}s",
                f"- Interruptions detected: {metric.interruptions}",
                f"- Response latency to direct invitations: {latency}",
                f"- Words per turn: {metric.words_per_turn:.2f}",
                f"- Questions asked: {metric.questions_asked}",
                f"- Tone-register sentiment: {metric.tone_register}",
                f"- Topic overlap: {metric.topic_relevance:.2f}",
                f"- Teacher review flags: {flags}",
            ]
        )

    lines.extend(["", "Transcript Excerpt"])
    if turns:
        for turn in turns[:8]:
            lines.append(f"- {format_time(turn.start)} {turn.speaker_label}: {turn.text}")
    else:
        lines.append("- No transcript text was detected.")

    lines.extend(["", "Disclaimer", DISCLAIMER])
    return "\n".join(lines)


def readable_flag(flag: str) -> str:
    return {
        "no_detected_speech": "No detected speech",
        "low_participation": "Low participation",
        "frequent_interruptions": "Frequent interruptions",
        "long_direct_response_latency": "Long response latency to direct invitations",
        "low_topic_overlap": "Low topic overlap",
    }.get(flag, flag.replace("_", " ").title())


def format_time(seconds: float) -> str:
    total = int(max(0.0, seconds))
    minutes = total // 60
    secs = total % 60
    return f"{minutes:02d}:{secs:02d}"
