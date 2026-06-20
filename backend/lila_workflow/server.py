from __future__ import annotations

from typing import Any

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from .settings import get_settings
from .workflow import run_analysis


class StudentPayload(BaseModel):
    id: str
    name: str
    age_range: str | None = None


class GroupPayload(BaseModel):
    id: str | None = None
    name: str | None = None
    grade: str | None = None
    student_count: int | None = None
    students: list[StudentPayload] = Field(default_factory=list)


class AnalyzeRequest(BaseModel):
    audio_url: str
    session_id: str | None = None
    session_name: str | None = None
    topic: str | None = None
    description: str | None = None
    duration_minutes: int | None = None
    group_id: str | None = None
    group_name: str | None = None
    grade: str | None = None
    student_count: int | None = None
    students: list[StudentPayload] = Field(default_factory=list)
    group: GroupPayload | None = None


settings = get_settings()
app = FastAPI(title="Lila Analysis Backend", version="0.2.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins if settings.allowed_origins else ["*"],
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["content-type", "authorization"],
    allow_credentials=False,
)


@app.get("/health")
def health() -> dict[str, Any]:
    return {
        "ok": True,
        "service": "lila-analysis-backend",
        "whisper_model": settings.whisper_model,
        "supabase_configured": bool(settings.supabase_url and settings.supabase_key),
    }


@app.post("/analyze")
def analyze(request: AnalyzeRequest) -> dict[str, Any]:
    try:
        return run_analysis(request.model_dump(exclude_none=True), settings=settings)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"analysis failed: {exc}") from exc
