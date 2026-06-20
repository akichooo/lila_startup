from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any


@dataclass
class StudentInfo:
    id: str
    name: str
    age_range: str | None = None


@dataclass
class GroupInfo:
    id: str | None = None
    name: str | None = None
    grade: str | None = None
    student_count: int | None = None
    students: list[StudentInfo] = field(default_factory=list)


@dataclass
class TranscriptChunk:
    start: float
    end: float
    text: str
    speaker_label: str = "Speaker 1"
    pitch_hz: float = 0.0
    energy: float = 0.0

    @property
    def duration_sec(self) -> float:
        return max(0.0, self.end - self.start)


@dataclass
class SpeakerMetric:
    speaker_label: str
    student_id: str | None
    student_name: str | None
    display_name: str
    speaking_turns: int
    total_turn_duration_sec: float
    avg_turn_duration_sec: float
    interruptions: int
    response_latency_sec: float | None
    words_per_turn: float
    questions_asked: int
    tone_register: str
    topic_relevance: float
    participation_pct: float
    observation_flags: list[str]
    raw: dict[str, Any]
