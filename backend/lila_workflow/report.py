from __future__ import annotations

from datetime import date
from statistics import mean

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
    active_metrics = [metric for metric in metrics if metric.speaking_turns > 0]
    total_duration = sum(metric.total_turn_duration_sec for metric in metrics)
    tone_counts = count_tones(metrics)
    review_count = sum(len(metric.observation_flags) for metric in metrics)

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
        (
            f"Measured speaking time totaled {total_duration:.2f}s. Tone-register counts were "
            f"{tone_counts['positive']} positive, {tone_counts['neutral']} neutral, and "
            f"{tone_counts['uncertain']} uncertain. The analysis produced {review_count} teacher-review "
            f"flag{'s' if review_count != 1 else ''}."
        ),
        "",
        "Behavioral Pattern Summary",
        build_group_pattern_summary(metrics),
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
        speaker_turns = [turn for turn in turns if turn.speaker_label == metric.speaker_label]
        behavioral_cues = build_behavioral_cues(metric, speaker_turns, active_metrics)
        suggested_review = build_review_focus(metric)
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
                f"- Tone-register wording: {metric.tone_register}",
                f"- Topic overlap: {metric.topic_relevance:.2f}",
                f"- Teacher review flags: {flags}",
                f"- Participation pattern: {behavioral_cues['participation']}",
                f"- Interaction rhythm: {behavioral_cues['rhythm']}",
                f"- Discussion behavior: {behavioral_cues['discussion']}",
                f"- Tone-register wording cue: {behavioral_cues['tone']}",
                f"- Suggested teacher review: {suggested_review}",
            ]
        )

    lines.extend(["", "Cross-Session Tracking Notes"])
    lines.append(
        "When the teacher saves speaker labels to student names, these same metrics are stored by student_id. "
        "The trends page then compares each student's participation share, speaking turns, tone-register wording, "
        "and review flags across later sessions."
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


def count_tones(metrics: list[SpeakerMetric]) -> dict[str, int]:
    return {
        "positive": sum(1 for metric in metrics if metric.tone_register == "positive"),
        "neutral": sum(1 for metric in metrics if metric.tone_register == "neutral"),
        "uncertain": sum(1 for metric in metrics if metric.tone_register == "uncertain"),
    }


def build_group_pattern_summary(metrics: list[SpeakerMetric]) -> str:
    if not metrics:
        return "No speakers were available for group-level pattern analysis."

    active = [metric for metric in metrics if metric.speaking_turns > 0]
    if not active:
        return "No speech was assigned to the configured speaker labels, so no group interaction pattern can be inferred."

    most = max(active, key=lambda metric: metric.participation_pct)
    least = min(active, key=lambda metric: metric.participation_pct)
    avg_participation = mean(metric.participation_pct for metric in active)
    total_interruptions = sum(metric.interruptions for metric in active)
    question_count = sum(metric.questions_asked for metric in active)

    balance = (
        "relatively balanced"
        if most.participation_pct - least.participation_pct <= 20
        else "uneven, with one or more speakers taking a noticeably larger share"
    )
    inquiry = (
        "The group used question-asking as part of the discussion."
        if question_count > 0
        else "Few explicit questions were detected, so teacher review may focus on whether students were explaining or only answering."
    )
    turn_taking = (
        "Turn-taking was mostly separated by clear gaps."
        if total_interruptions == 0
        else "Some turns began very close to previous turns, so teacher review should check whether these were supportive overlaps or interruptions."
    )

    return (
        f"Participation was {balance}. Average active-speaker participation was {avg_participation:.1f}%, "
        f"with {most.student_name or most.speaker_label} carrying the largest measured share and "
        f"{least.student_name or least.speaker_label} carrying the smallest. {turn_taking} {inquiry}"
    )


def build_behavioral_cues(
    metric: SpeakerMetric,
    turns: list[TranscriptChunk],
    active_metrics: list[SpeakerMetric],
) -> dict[str, str]:
    text = " ".join(turn.text for turn in turns)
    avg_active_turns = mean(metric.speaking_turns for metric in active_metrics) if active_metrics else 0

    if metric.speaking_turns == 0:
        participation = "No speech was assigned to this speaker label in the processed audio."
    elif metric.participation_pct < 8:
        participation = "Low detected speaking share; this may reflect quiet participation, microphone placement, or speaker-label mismatch."
    elif metric.speaking_turns > avg_active_turns * 1.35 and metric.participation_pct >= 30:
        participation = "High verbal presence relative to the active group; review whether the student was leading, dominating, or helping peers build ideas."
    else:
        participation = "Participated within the active group range for this session."

    if metric.interruptions >= 3:
        rhythm = "Frequent close-start turns; review for impulsive overlap, excited agreement, or difficulty waiting for turn completion."
    elif metric.avg_turn_duration_sec < 1.5 and metric.speaking_turns > 0:
        rhythm = "Short turns; review whether contributions were brief answers, quick confirmations, or clipped by group pacing."
    elif metric.avg_turn_duration_sec > 8:
        rhythm = "Extended turns; review whether the student was elaborating clearly or holding the floor for long stretches."
    else:
        rhythm = "Turn length and spacing were within the expected range for this session."

    if metric.questions_asked > 0 and metric.topic_relevance >= 0.25:
        discussion = "Asked questions while staying connected to the session topic."
    elif metric.questions_asked > 0:
        discussion = "Asked questions, though keyword overlap with the stated topic was limited."
    elif metric.topic_relevance < 0.1 and metric.speaking_turns > 0:
        discussion = "Contributions had low keyword overlap with the stated topic; review whether the student was off-topic or using different vocabulary."
    else:
        discussion = "Contributions were mostly declarative or explanatory rather than question-led."

    tone = tone_description(metric.tone_register, text)

    return {
        "participation": participation,
        "rhythm": rhythm,
        "discussion": discussion,
        "tone": tone,
    }


def tone_description(tone_register: str, text: str) -> str:
    cue_words = extract_cue_words(text)
    evidence = f" Cue words: {', '.join(cue_words)}." if cue_words else ""
    if tone_register == "positive":
        return "Positive or affirming wording was present; this is a language cue, not a claim about the student's internal mood." + evidence
    if tone_register == "uncertain":
        return "Uncertain or strained wording was present; review the transcript context before interpreting it." + evidence
    return "Mostly neutral task-focused wording was detected." + evidence


def extract_cue_words(text: str) -> list[str]:
    positive = {"agree", "build", "care", "fair", "good", "great", "help", "kind", "learn", "like", "listen", "share", "thank"}
    uncertain = {"confused", "hard", "no", "not", "problem", "stuck", "unsure", "worry", "wrong"}
    seen: list[str] = []
    for raw in text.lower().replace("'", " ").split():
        token = "".join(ch for ch in raw if ch.isalpha())
        if token in positive or token in uncertain:
            if token not in seen:
                seen.append(token)
        if len(seen) >= 5:
            break
    return seen


def build_review_focus(metric: SpeakerMetric) -> str:
    if "no_detected_speech" in metric.observation_flags:
        return "Confirm whether the speaker label belongs to a present student, then note whether the student participated nonverbally."
    if "low_participation" in metric.observation_flags:
        return "Compare with prior sessions and consider a low-pressure invitation strategy next time."
    if "frequent_interruptions" in metric.observation_flags:
        return "Review the transcript excerpt to distinguish supportive overlap from disruptive interruption."
    if "long_direct_response_latency" in metric.observation_flags:
        return "Check whether the student needed more wait time, clarification, or a different invitation style."
    if "low_topic_overlap" in metric.observation_flags:
        return "Review whether the student was off-topic or using different vocabulary than the configured topic keywords."
    return "No specific automated review flag; use the metrics as background context for teacher notes."


def format_time(seconds: float) -> str:
    total = int(max(0.0, seconds))
    minutes = total // 60
    secs = total % 60
    return f"{minutes:02d}:{secs:02d}"
