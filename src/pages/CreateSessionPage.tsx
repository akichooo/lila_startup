import { useMemo, useRef, useState } from "react";
import { AlertCircle, CheckCircle, Mic, Square, Upload } from "lucide-react";
import { AppShell } from "@/components/bridge/AppShell";
import AnalysisProcessingScreen from "@/components/analysis/AnalysisProcessingScreen";
import AnalysisReportViewer from "@/components/analysis/AnalysisReportViewer";
import Blobby from "@/components/mascots/Blobby";
import { useAnalysis } from "@/contexts/AnalysisContext";
import { analyzeAudio } from "@/lib/lilaBackend";
import { supabase } from "@/integrations/supabase/client";

type RecordingState = "idle" | "recording" | "uploading" | "analyzing" | "done" | "error";

export default function CreateSessionPage() {
  const { groups, dataError, refreshRecords } = useAnalysis();
  const [groupId, setGroupId] = useState("");
  const [topic, setTopic] = useState("What makes a good teammate?");
  const [durationMinutes, setDurationMinutes] = useState(20);
  const [state, setState] = useState<RecordingState>("idle");
  const [error, setError] = useState("");
  const [sessionId, setSessionId] = useState("");
  const [reportText, setReportText] = useState("");
  const [assessment, setAssessment] = useState<any>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const group = useMemo(() => groups.find((item) => item.id === groupId) || groups[0], [groups, groupId]);
  const activeStep = state === "done" ? 3 : state === "analyzing" ? 3 : state === "uploading" ? 2 : 1;

  const startRecording = async () => {
    setError("");
    setReportText("");
    setAssessment(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunksRef.current.push(event.data);
      };
      recorder.onstop = () => {
        stream.getTracks().forEach((track) => track.stop());
      };
      recorderRef.current = recorder;
      recorder.start();
      setState("recording");
    } catch (err: any) {
      setError(err?.message || "Microphone access failed.");
      setState("error");
    }
  };

  const stopRecording = async () => {
    const recorder = recorderRef.current;
    if (!recorder || !group) return;
    recorder.stop();
    setState("uploading");
    setTimeout(() => {
      const blob = new Blob(chunksRef.current, { type: recorder.mimeType || "audio/webm" });
      processRecording(blob).catch((err) => {
        setError(err?.message || "Recording analysis failed.");
        setState("error");
      });
    }, 300);
  };

  const processRecording = async (blob: Blob) => {
    if (!group) throw new Error("Choose a student group first.");
    const id = crypto.randomUUID();
    setSessionId(id);
    const extension = blob.type.includes("wav") ? "wav" : "webm";
    const path = `sessions/${id}/recording.${extension}`;

    const { error: uploadError } = await supabase.storage
      .from("audio-recordings")
      .upload(path, blob, { contentType: blob.type || "audio/webm", upsert: true });
    if (uploadError) throw uploadError;

    const { data: publicData } = supabase.storage.from("audio-recordings").getPublicUrl(path);
    const audioUrl = publicData.publicUrl;

    const { error: sessionError } = await (supabase as any).from("sessions").insert({
      id,
      session_name: topic.trim(),
      topic: topic.trim(),
      description: "Recorded classroom discussion",
      duration_minutes: durationMinutes,
      group_id: group.id,
      recording_path: path,
      audio_url: audioUrl,
      status: "uploaded",
      analysis_status: "processing",
    });
    if (sessionError) throw sessionError;

    setState("analyzing");
    const result = await analyzeAudio({
      audio_url: audioUrl,
      session_id: id,
      session_name: topic.trim(),
      topic: topic.trim(),
      description: "Recorded classroom discussion",
      duration_minutes: durationMinutes,
      group_id: group.id,
      group_name: group.name,
      grade: group.grade || undefined,
      student_count: group.studentCount,
      students: group.students.map((student) => ({
        id: student.id,
        name: student.name,
        age_range: student.ageRange || null,
      })),
    });
    setReportText(result.report_text || result.report || "");
    setAssessment(result.important_numbers || result.assessment || null);
    await refreshRecords();
    setState("done");
  };

  return (
    <AppShell pageTitle="Create Session">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="max-w-[760px] mx-auto text-center">
          <p className="lila-label">New Session</p>
          <h1>Record a Discussion</h1>
          <p className="text-sm mt-2" style={{ color: "#7C6FAA" }}>
            Record classroom audio, send it to the standalone backend, and save observational metrics to Supabase.
          </p>
        </div>

        <div className="flex items-center justify-center gap-2">
          {[
            [1, "Setup"],
            [2, "Upload"],
            [3, "Analyze"],
          ].map(([step, label]) => (
            <div key={step} className="flex items-center gap-2">
              <div
                className="flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold"
                style={
                  activeStep >= Number(step)
                    ? { background: "linear-gradient(135deg, #A78BFA 0%, #FB7185 100%)", color: "white" }
                    : { background: "#EDE9FF", color: "#7C6FAA" }
                }
              >
                {step}
              </div>
              <span className="hidden sm:inline text-sm font-bold" style={{ color: activeStep >= Number(step) ? "#2D1B69" : "#A89DC4" }}>{label}</span>
              {Number(step) < 3 && <div className="h-0.5 w-8 rounded-full" style={{ background: activeStep > Number(step) ? "#A78BFA" : "#EDE9FF" }} />}
            </div>
          ))}
        </div>

        {dataError && (
          <div className="rounded-2xl p-4 flex gap-3" style={{ background: "#FEF2F2", border: "1.5px solid #FECACA" }}>
            <AlertCircle className="h-5 w-5 text-red-600" />
            <p className="text-sm text-red-700">{dataError}</p>
          </div>
        )}

        {(state === "idle" || state === "recording" || state === "uploading" || state === "error") && (
          <div className="lila-card-elevated space-y-5 max-w-[760px] mx-auto">
            <div className="flex flex-col items-center gap-2">
              <Blobby size={150} state={state === "recording" ? "speaking" : state === "uploading" ? "thinking" : "idle"} />
              <div
                className="rounded-2xl px-4 py-2 text-sm font-semibold text-center"
                style={{ background: "#F5F3FF", color: "#2D1B69", border: "1.5px solid #EDE9FF" }}
              >
                {state === "recording" ? "Recording in progress. Stop when the group discussion is finished." : "Set the group and topic, then start recording."}
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <label className="space-y-2 md:col-span-1">
                <span className="lila-label">Group</span>
                <select
                  value={group?.id || ""}
                  onChange={(event) => setGroupId(event.target.value)}
                  className="w-full rounded-2xl border px-4 py-3 bg-white"
                  style={{ borderColor: "#EDE9FF", color: "#2D1B69" }}
                >
                  {groups.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="space-y-2 md:col-span-1">
                <span className="lila-label">Topic</span>
                <input
                  value={topic}
                  onChange={(event) => setTopic(event.target.value)}
                  className="w-full rounded-2xl border px-4 py-3 bg-white"
                  style={{ borderColor: "#EDE9FF", color: "#2D1B69" }}
                />
              </label>
              <label className="space-y-2 md:col-span-1">
                <span className="lila-label">Minutes</span>
                <input
                  type="number"
                  min={5}
                  max={60}
                  value={durationMinutes}
                  onChange={(event) => setDurationMinutes(Number(event.target.value))}
                  className="w-full rounded-2xl border px-4 py-3 bg-white"
                  style={{ borderColor: "#EDE9FF", color: "#2D1B69" }}
                />
              </label>
            </div>

            <div className="rounded-3xl p-8 text-center" style={{ background: "#FAFAFE", border: "1.5px solid #EDE9FF" }}>
              <div className="text-sm mb-4" style={{ color: "#7C6FAA" }}>
                {state === "recording" ? "Recording in progress" : "Ready to record"}
              </div>
              {state === "recording" ? (
                <button onClick={stopRecording} className="lila-btn-primary inline-flex items-center gap-2">
                  <Square className="h-4 w-4" />
                  Stop and Analyze
                </button>
              ) : (
                <button onClick={startRecording} disabled={!group || !topic.trim()} className="lila-btn-primary inline-flex items-center gap-2 disabled:opacity-60">
                  <Mic className="h-4 w-4" />
                  Start Recording
                </button>
              )}
              {state === "uploading" && (
                <p className="mt-4 text-sm flex items-center justify-center gap-2" style={{ color: "#7C6FAA" }}>
                  <Upload className="h-4 w-4" />
                  Uploading recording...
                </p>
              )}
            </div>

            {error && (
              <div className="rounded-2xl p-4 flex gap-3" style={{ background: "#FEF2F2", border: "1.5px solid #FECACA" }}>
                <AlertCircle className="h-5 w-5 text-red-600" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}
          </div>
        )}

        {state === "analyzing" && (
          <AnalysisProcessingScreen topic={topic} studentCount={group?.students.length || 5} />
        )}

        {state === "done" && (
          <div className="space-y-5">
            <div className="rounded-2xl p-4 flex gap-3" style={{ background: "#ECFDF5", border: "1.5px solid #6EE7B7" }}>
              <CheckCircle className="h-5 w-5 text-green-600" />
              <p className="text-sm text-green-700">Recording analyzed and saved.</p>
            </div>
            <AnalysisReportViewer reportText={reportText} sessionId={sessionId} assessmentData={assessment} />
          </div>
        )}
      </div>
    </AppShell>
  );
}
