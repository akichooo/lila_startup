import { useCallback, useMemo, useRef, useState } from "react";
import { AlertCircle, CheckCircle, CheckCircle2, Copy, Download, Loader2, RotateCcw, Upload, X } from "lucide-react";
import { AppShell } from "@/components/bridge/AppShell";
import AnalysisProcessingScreen from "@/components/analysis/AnalysisProcessingScreen";
import AnalysisReportViewer from "@/components/analysis/AnalysisReportViewer";
import Blobby from "@/components/mascots/Blobby";
import { useAnalysis } from "@/contexts/AnalysisContext";
import { analyzeAudio, getBackendUrl } from "@/lib/lilaBackend";
import { supabase } from "@/integrations/supabase/client";

type PageState = "pick" | "uploading" | "analyzing" | "done" | "error";

function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function UploadAudioPage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { groups, loading, dataError, refreshRecords } = useAnalysis();
  const [selectedGroupId, setSelectedGroupId] = useState("");
  const [topic, setTopic] = useState("What makes a fair helper?");
  const [file, setFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [pageState, setPageState] = useState<PageState>("pick");
  const [error, setError] = useState("");
  const [reportText, setReportText] = useState("");
  const [assessment, setAssessment] = useState<any>(null);
  const [sessionId, setSessionId] = useState("");
  const [publicUrl, setPublicUrl] = useState("");
  const [copied, setCopied] = useState(false);

  const selectedGroup = useMemo(
    () => groups.find((group) => group.id === selectedGroupId) || groups[0],
    [groups, selectedGroupId],
  );

  const canAnalyze = Boolean(file && selectedGroup && topic.trim() && pageState !== "uploading" && pageState !== "analyzing");

  const handleFileSelect = useCallback((selected: File | null) => {
    if (selected && selected.size > 80 * 1024 * 1024) {
      setError("Please choose an audio file under 80 MB.");
      setFile(null);
      return;
    }
    setError("");
    setFile(selected);
    setPublicUrl("");
    setCopied(false);
    if (selected) setPageState("pick");
  }, []);

  const onDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    setDragOver(false);
    handleFileSelect(event.dataTransfer.files?.[0] || null);
  }, [handleFileSelect]);

  const copyPublicUrl = async () => {
    if (!publicUrl) return;
    await navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const resetPage = () => {
    setFile(null);
    setPageState("pick");
    setError("");
    setReportText("");
    setAssessment(null);
    setSessionId("");
    setPublicUrl("");
    setCopied(false);
  };

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
      setPublicUrl(audioUrl);

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
        <div className="max-w-[720px] mx-auto text-center">
          <p className="lila-label">Audio Analysis</p>
          <h1>Upload Discussion Audio</h1>
          <p className="text-sm mt-2" style={{ color: "#7C6FAA" }}>
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
          <div className="mx-auto max-w-[640px]">
            <div className="lila-card-elevated space-y-5">
              <div className="flex flex-col items-center gap-2">
                <Blobby size={160} state={pageState === "uploading" ? "thinking" : file ? "listening" : "idle"} />
                <div
                  className="rounded-2xl px-4 py-2 text-sm font-semibold text-center"
                  style={{ background: "#F5F3FF", color: "#2D1B69", border: "1.5px solid #EDE9FF" }}
                >
                  {pageState === "uploading" ? "Saving the recording and preparing analysis..." : "Drop a classroom audio file here and I will process the session."}
                </div>
              </div>

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

              <div
                className="relative rounded-2xl border-2 border-dashed p-8 flex flex-col items-center gap-3 transition-colors cursor-pointer"
                style={{ borderColor: dragOver ? "#A78BFA" : "#EDE9FF", background: dragOver ? "#F5F3FF" : "#FAFAFE" }}
                onDragOver={(event) => { event.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={onDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="h-10 w-10" style={{ color: "#A78BFA" }} />
                <p className="text-sm font-bold text-center" style={{ color: "#2D1B69" }}>
                  Drag your audio file here or click to browse
                </p>
                <button
                  type="button"
                  className="lila-btn-secondary text-xs !py-1.5 !px-4"
                  onClick={(event) => { event.stopPropagation(); fileInputRef.current?.click(); }}
                >
                  Browse Files
                </button>
                <p className="text-xs text-center" style={{ color: "#A89DC4" }}>
                  WAV, MP3, M4A, WebM, OGG, FLAC, or AAC. Max 80 MB.
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="audio/*"
                  className="hidden"
                  onChange={(event) => handleFileSelect(event.target.files?.[0] || null)}
                />
              </div>

              {file && (
                <div className="flex items-center gap-3 rounded-2xl p-3" style={{ background: "#F0FDF4", border: "1.5px solid #BBF7D0" }}>
                  <CheckCircle2 className="h-5 w-5 shrink-0" style={{ color: "#059669" }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold truncate" style={{ color: "#2D1B69" }}>{file.name}</p>
                    <p className="text-xs" style={{ color: "#059669" }}>{formatFileSize(file.size)} ready to analyze</p>
                  </div>
                  <button onClick={() => handleFileSelect(null)} className="p-1 rounded-full hover:bg-white/50" aria-label="Remove selected file">
                    <X className="h-4 w-4" style={{ color: "#A89DC4" }} />
                  </button>
                </div>
              )}

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

              {pageState === "error" && (
                <button className="lila-btn-secondary w-full flex items-center justify-center gap-2" onClick={resetPage}>
                  <RotateCcw className="h-4 w-4" />
                  Start Over
                </button>
              )}
            </div>
          </div>
        )}

        {pageState === "analyzing" && (
          <AnalysisProcessingScreen topic={topic} studentCount={selectedGroup?.students.length || 5} />
        )}

        {pageState === "done" && (
          <div className="space-y-5">
            <div className="rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3" style={{ background: "#ECFDF5", border: "1.5px solid #6EE7B7" }}>
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <p className="text-sm text-green-700">Analysis completed and saved to Supabase.</p>
              </div>
              {publicUrl && (
                <div className="flex flex-wrap gap-2">
                  <button className="lila-btn-secondary text-xs !py-1.5 !px-4 flex items-center gap-1.5" onClick={copyPublicUrl}>
                    {copied ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                    {copied ? "Copied" : "Copy Audio Link"}
                  </button>
                  <a href={publicUrl} target="_blank" rel="noopener noreferrer" className="lila-btn-secondary text-xs !py-1.5 !px-4 flex items-center gap-1.5">
                    <Download className="h-3.5 w-3.5" />
                    Audio File
                  </a>
                </div>
              )}
            </div>
            <AnalysisReportViewer reportText={reportText} sessionId={sessionId} assessmentData={assessment} />
          </div>
        )}
      </div>
    </AppShell>
  );
}
