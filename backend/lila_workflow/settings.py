from __future__ import annotations

import os
from dataclasses import dataclass
from pathlib import Path


def _load_env_file(path: Path) -> None:
    if not path.exists():
        return
    for line in path.read_text(encoding="utf-8").splitlines():
        raw = line.strip()
        if not raw or raw.startswith("#") or "=" not in raw:
            continue
        key, value = raw.split("=", 1)
        key = key.strip()
        value = value.strip().strip('"').strip("'")
        if key and key not in os.environ:
            os.environ[key] = value


def load_local_env() -> None:
    here = Path(__file__).resolve()
    candidates = [
        here.parents[2] / ".env",
        here.parents[1] / ".env",
        Path.cwd() / ".env",
    ]
    for candidate in candidates:
        _load_env_file(candidate)


def _env_int(name: str, default: int) -> int:
    try:
        return int(os.getenv(name, str(default)))
    except ValueError:
        return default


def _env_float(name: str, default: float) -> float:
    try:
        return float(os.getenv(name, str(default)))
    except ValueError:
        return default


def _env_bool(name: str, default: bool = False) -> bool:
    value = os.getenv(name)
    if value is None:
        return default
    return value.strip().lower() in {"1", "true", "yes", "on"}


def _env_list(name: str, default: list[str]) -> list[str]:
    raw = os.getenv(name)
    if not raw:
        return default
    return [item.strip() for item in raw.split(",") if item.strip()]


@dataclass(frozen=True)
class Settings:
    allowed_origins: list[str]
    allow_local_audio_urls: bool
    max_audio_bytes: int
    request_timeout_sec: float
    whisper_model: str
    whisper_device: str
    whisper_compute_type: str
    transcription_mode: str
    default_speaker_count: int
    max_speaker_count: int
    silence_gap_sec: float
    supabase_url: str | None
    supabase_key: str | None


def get_settings() -> Settings:
    load_local_env()
    return Settings(
        allowed_origins=_env_list(
            "LILA_ALLOWED_ORIGINS",
            [
                "http://localhost:8080",
                "http://127.0.0.1:8080",
                "http://localhost:5173",
                "http://127.0.0.1:5173",
            ],
        ),
        allow_local_audio_urls=_env_bool("LILA_ALLOW_LOCAL_AUDIO_URLS", False),
        max_audio_bytes=_env_int("LILA_MAX_AUDIO_BYTES", 80 * 1024 * 1024),
        request_timeout_sec=_env_float("LILA_REQUEST_TIMEOUT_SEC", 45.0),
        whisper_model=os.getenv("LILA_WHISPER_MODEL", "tiny.en"),
        whisper_device=os.getenv("LILA_WHISPER_DEVICE", "cpu"),
        whisper_compute_type=os.getenv("LILA_WHISPER_COMPUTE_TYPE", "int8"),
        transcription_mode=os.getenv("LILA_TRANSCRIPTION_MODE", "whisper").strip().lower(),
        default_speaker_count=_env_int("LILA_DEFAULT_SPEAKER_COUNT", 5),
        max_speaker_count=_env_int("LILA_MAX_SPEAKER_COUNT", 5),
        silence_gap_sec=_env_float("LILA_SILENCE_GAP_SEC", 0.65),
        supabase_url=os.getenv("SUPABASE_URL") or os.getenv("VITE_SUPABASE_URL"),
        supabase_key=(
            os.getenv("SUPABASE_SERVICE_ROLE_KEY")
            or os.getenv("SUPABASE_ANON_KEY")
            or os.getenv("VITE_SUPABASE_PUBLISHABLE_KEY")
        ),
    )
