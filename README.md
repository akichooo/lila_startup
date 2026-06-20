# Lila

Lila is an AI-facilitated small-group discussion platform for schoolchildren aged 6 to 12. The app records or uploads classroom discussion audio, sends it to a standalone Python backend, stores structured session metrics in Supabase, and shows teacher-reviewed observational trends.

## Architecture

```text
React/Vite frontend
  -> Supabase Storage for uploaded audio
  -> Python FastAPI backend
      -> faster-whisper transcription
      -> silence-gap + pitch/energy speaker grouping
      -> observational metric computation
      -> Supabase tables for sessions, metrics, notes, and follow-ups
  -> Supabase reads for dashboard, summaries, and trends
```

All analysis uses free/open-source tooling. Speaker labels default to `Speaker 1` through the configured group size, up to five by default. Teachers can relabel those speakers to real student names after processing, and the mapping is saved permanently.

## Frontend

```bash
npm install
npm run dev
```

Required frontend environment:

```bash
VITE_SUPABASE_URL="https://your-project.supabase.co"
VITE_SUPABASE_PUBLISHABLE_KEY="your-public-anon-key"
VITE_LILA_BACKEND_URL="http://localhost:8000"
```

## Backend

```bash
cd backend
python3 -m venv .venv
. .venv/bin/activate
pip install -r requirements.txt
uvicorn lila_workflow.server:app --host 0.0.0.0 --port 8000
```

Required backend environment:

```bash
SUPABASE_URL="https://your-project.supabase.co"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
LILA_ALLOWED_ORIGINS="http://localhost:8080"
LILA_WHISPER_MODEL="tiny.en"
```

For local tests that serve an audio file from localhost:

```bash
LILA_ALLOW_LOCAL_AUDIO_URLS=true
```

## Supabase Tables

The migrations create or update:

- `groups`
- `students`
- `sessions`
- `session_metrics`
- `teacher_notes`
- `follow_ups`
- `session_reports`

`session_metrics` stores one row per speaker/student per session, including speaking turns, turn duration, interruptions, response latency to direct invitations, words per turn, questions asked, tone-register sentiment, and topic overlap.

## Analysis Boundary

Lila computes observational classroom-discussion signals only. It does not perform emotion detection, mental-health analysis, diagnosis, abuse detection, clinical screening, or automated disciplinary recommendations. UI reports keep the teacher-review disclaimer visible.
