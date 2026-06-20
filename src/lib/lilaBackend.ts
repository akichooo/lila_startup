export interface AnalyzeAudioPayload {
  audio_url: string;
  session_id?: string;
  session_name?: string;
  topic?: string;
  description?: string;
  duration_minutes?: number;
  group_id?: string;
  group_name?: string;
  grade?: string;
  student_count?: number;
  students?: Array<{ id: string; name: string; age_range?: string | null }>;
}

const DEFAULT_BACKEND_URL = "http://localhost:8000";

export function getBackendUrl() {
  return (import.meta.env.VITE_LILA_BACKEND_URL || DEFAULT_BACKEND_URL).replace(/\/+$/, "");
}

export async function analyzeAudio(payload: AnalyzeAudioPayload) {
  const response = await fetch(`${getBackendUrl()}/analyze`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = await response.json().catch(() => null);
  if (!response.ok) {
    const detail = data?.detail || data?.error || response.statusText;
    throw new Error(typeof detail === "string" ? detail : "Audio analysis failed");
  }
  return data;
}
