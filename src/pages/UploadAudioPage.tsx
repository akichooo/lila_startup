import { useMemo, useState } from "react";
import { AlertCircle, CheckCircle, Loader2, Upload } from "lucide-react";
import { AppShell } from "@/components/bridge/AppShell";
import AnalysisProcessingScreen from "@/components/analysis/AnalysisProcessingScreen";
import AnalysisReportViewer from "@/components/analysis/AnalysisReportViewer";
import { useAnalysis } from "@/contexts/AnalysisContext";
import { analyzeAudio, getBackendUrl } from "@/lib/lilaBackend";
import { supabase } from "@/integrations/supabase/client";

type PageState = "pick" | "uploading" | "analyzing" | "done" | "error";

export default function UploadAudioPage() {
  const { groups, loading, dataError, refreshRecords } = useAnalysis();
  const [selectedGroupId, setSelectedGroupId] = useState("");
  const [topic, setTopic] = useState("What makes a fair helper?");
  const [file, setFile] = useState<File | null>(null);
  const [pageState, setPageState] = useState<PageState>("pick");
  const [error, setError] = useState("");
  const [reportText, setReportText] = useState("");
  const [assessment, setAssessment] = useState<any>(null);
  const [sessionId, setSessionId] = useState("");

  const selectedGroup = useMemo(
    () => groups.find((group) => group.id === selectedGroupId) || groups[0],
    [groups, selectedGroupId],
  );

  const canAnalyze = Boolean(file && selectedGroup && topic.trim() && pageState !== "uploading" && pageState !== "analyzing");

  const runUploadAndAnalysis = async () => {
    if (!file || !selectedGroup) return;
    setError("");
    setReportText("");
    setAssessment(null);
    const id = crypto.randomUUID();
    setSessionId(id);

    try {
      setPageState("uploading");
      const extension = file.name.split(".").pop() || "audio";
      const path = `sessions/${id}/source.${extension}`;
      const { error: uploadError } = await supabase.storage
        .from("audio-recordings")
        .upload(path, file, { contentType: file.type || "application/octet-stream", upsert: true });
      if (uploadError) throw uploadError;

      const { data: publicData } = supabase.storage.from("audio-recordings").getPublicUrl(path);
      const audioUrl = publicData.publicUrl;

      const { error: sessionError } = await (supabase as any).from("sessions").insert({
        id,
        session_name: topic.trim(),
        topic: topic.trim(),
        description: "Uploaded audio analysis",
        duration_minutes: 20,
        group_id: selectedGroup.id,
        recording_path: path,
        audio_url: audioUrl,
        status: "uploaded",
        analysis_status: "processing",
      });
      if (sessionError) throw sessionError;

      setPageState("analyzing");
      const result = await analyzeAudio({
        audio_url: audioUrl,
        session_id: id,
        session_name: topic.trim(),
        topic: topic.trim(),
        description: "Uploaded audio analysis",
        duration_minutes: 20,
        group_id: selectedGroup.id,
        group_name: selectedGroup.name,
        grade: selectedGroup.grade || undefined,
        student_count: selectedGroup.studentCount,
        students: selectedGroup.students.map((student) => ({
          id: student.id,
          name: student.name,
          age_range: student.ageRange || null,
        })),
      });

      setReportText(result.report_text || result.report || "");
      setAssessment(result.important_numbers || result.assessment || null);
      await refreshRecords();
      setPageState("done");
    } catch (err: any) {
      setError(err?.message || "Audio analysis failed");
      setPageState("error");
    }
  };

  return (
    <AppShell pageTitle="Upload Audio">
      <div className="max-w-5xl mx-auto space-y-6">
        <div>
          <p className="lila-label">Audio Analysis</p>
          <h1>Upload Discussion Audio</h1>
          <p className="text-sm mt-2 max-w-2xl" style={{ color: "#7C6FAA" }}>
            Audio is processed by the standalone Lila backend at {getBackendUrl()}. Results are saved to Supabase as
            observational signals for teacher review.
          </p>
        </div>

        {dataError && (
          <div className="rounded-2xl p-4 flex gap-3" style={{ background: "#FEF2F2", border: "1.5px solid #FECACA" }}>
            <AlertCircle className="h-5 w-5 text-red-600" />
            <p className="text-sm text-red-700">{dataError}</p>
          </div>
        )}

        {(pageState === "pick" || pageState === "uploading" || pageState === "error") && (
          <div className="lila-card-elevated space-y-5">
            <div className="grid gap-4 md:grid-cols-2">
              <label className="space-y-2">
                <span className="lila-label">Student Group</span>
                <select
                  className="w-full rounded-2xl border px-4 py-3 bg-white"
                  style={{ borderColor: "#EDE9FF", color: "#2D1B69" }}
                  value={selectedGroup?.id || ""}
                  onChange={(event) => setSelectedGroupId(event.target.value)}
                  disabled={loading || groups.length === 0}
                >
                  {groups.map((group) => (
                    <option key={group.id} value={group.id}>
                      {group.name} ({group.students.length} students)
                    </option>
                  ))}
                </select>
              </label>

              <label className="space-y-2">
                <span className="lila-label">Session Topic</span>
                <input
                  className="w-full rounded-2xl border px-4 py-3 bg-white"
                  style={{ borderColor: "#EDE9FF", color: "#2D1B69" }}
                  value={topic}
                  onChange={(event) => setTopic(event.target.value)}
                />
              </label>
            </div>

            <label
              className="block rounded-3xl border-2 border-dashed p-8 text-center cursor-pointer"
              style={{ borderColor: "#C4B5FD", background: "#FAFAFE" }}
            >
              <Upload className="h-10 w-10 mx-auto mb-3" style={{ color: "#7C3AED" }} />
              <p className="font-bold" style={{ color: "#2D1B69" }}>{file ? file.name : "Choose an audio file"}</p>
              <p className="text-sm mt-1" style={{ color: "#7C6FAA" }}>WAV, MP3, M4A, WebM, OGG, FLAC, or AAC</p>
              <input
                type="file"
                accept="audio/*"
                className="hidden"
                onChange={(event) => {
                  const selected = event.target.files?.[0] || null;
                  if (selected && selected.size > 80 * 1024 * 1024) {
                    setError("Please choose an audio file under 80 MB.");
                    setFile(null);
                    return;
                  }
                  setError("");
                  setFile(selected);
                }}
              />
            </label>

            {error && (
              <div className="rounded-2xl p-4 flex gap-3" style={{ background: "#FEF2F2", border: "1.5px solid #FECACA" }}>
                <AlertCircle className="h-5 w-5 text-red-600" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            <button
              disabled={!canAnalyze}
              onClick={runUploadAndAnalysis}
              className="lila-btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {pageState === "uploading" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
              {pageState === "uploading" ? "Uploading..." : "Upload and Analyze"}
            </button>
          </div>
        )}

        {pageState === "analyzing" && (
          <AnalysisProcessingScreen topic={topic} studentCount={selectedGroup?.students.length || 5} />
        )}

        {pageState === "done" && (
          <div className="space-y-5">
            <div className="rounded-2xl p-4 flex gap-3" style={{ background: "#ECFDF5", border: "1.5px solid #6EE7B7" }}>
              <CheckCircle className="h-5 w-5 text-green-600" />
              <p className="text-sm text-green-700">Analysis completed and saved to Supabase.</p>
            </div>
            <AnalysisReportViewer reportText={reportText} sessionId={sessionId} assessmentData={assessment} />
          </div>
        )}
      </div>
    </AppShell>
  );
}
