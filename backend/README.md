# Lila Backend

Standalone Python service for Lila audio analysis.

It accepts an audio URL, transcribes with `faster-whisper`, groups detected transcript segments into the configured student group size using silence gaps plus basic pitch/energy clustering, computes observational conversation metrics, persists rows to Supabase, and returns structured JSON.

No paid automation, external transcription API, diarization service, or hosted LLM is required.

## Run Locally

```bash
cd backend
python3 -m venv .venv
. .venv/bin/activate
pip install -r requirements.txt
uvicorn lila_workflow.server:app --host 0.0.0.0 --port 8000
```

Health check:

```bash
curl http://localhost:8000/health
```

Analyze:

```bash
curl -X POST http://localhost:8000/analyze \
  -H 'content-type: application/json' \
  -d '{
    "audio_url": "https://example.com/session.wav",
    "session_name": "Robots and Fairness",
    "topic": "What makes a fair helper?",
    "group_id": "g1",
    "group_name": "Group Turtle",
    "student_count": 5,
    "students": [
      {"id": "s1", "name": "Lena M."},
      {"id": "s2", "name": "Kai R."}
    ]
  }'
```

## Environment

Use `backend/.env.example` as the template. The backend also reads the repository root `.env` for local Supabase URL and publishable key, but production should use `SUPABASE_SERVICE_ROLE_KEY`.

Important variables:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `LILA_ALLOWED_ORIGINS`
- `LILA_WHISPER_MODEL` (`tiny.en` by default for free-tier CPU deployments)
- `LILA_ALLOW_LOCAL_AUDIO_URLS=true` for local tests that fetch `localhost` or `127.0.0.1` audio URLs

## Output Boundary

The backend computes observational signals only:

- speaking turns
- turn duration
- interruptions
- response latency to direct invitations
- words per turn
- questions asked
- tone-register sentiment labeled `positive`, `neutral`, or `uncertain`
- topic relevance by keyword overlap

It does not perform emotion detection, mental-health analysis, diagnosis, abuse detection, or clinical screening.
