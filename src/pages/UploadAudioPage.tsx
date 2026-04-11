import { useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { AppShell } from "@/components/bridge/AppShell";
import { GROUPS } from "@/data/mockData";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Upload, FileAudio, Copy, Download, Send, CheckCircle2, AlertCircle, X, RotateCcw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const ACCEPTED_TYPES = ["audio/mpeg", "audio/mp4", "audio/x-m4a", "audio/wav", "audio/ogg", "audio/webm"];
const ACCEPTED_EXTENSIONS = ".mp3,.m4a,.wav,.ogg,.webm";
const MAX_SIZE_MB = 500;

function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

type PageState = "pick" | "uploading" | "success" | "error";

export default function UploadAudioPage() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedGroup, setSelectedGroup] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [pageState, setPageState] = useState<PageState>("pick");
  const [progress, setProgress] = useState(0);
  const [publicUrl, setPublicUrl] = useState("");
  const [fileError, setFileError] = useState("");
  const [copied, setCopied] = useState(false);

  const group = GROUPS.find((g) => g.id === selectedGroup);

  const validateFile = (f: File): string | null => {
    if (!ACCEPTED_TYPES.includes(f.type) && !f.name.match(/\.(mp3|m4a|wav|ogg|webm)$/i)) {
      return "Only audio files (MP3, M4A, WAV, OGG, WebM) are accepted.";
    }
    if (f.size > MAX_SIZE_MB * 1024 * 1024) {
      return `File is too large. Maximum size is ${MAX_SIZE_MB} MB.`;
    }
    return null;
  };

  const handleFileSelect = (f: File) => {
    const err = validateFile(f);
    if (err) {
      setFileError(err);
      setFile(null);
      return;
    }
    setFileError("");
    setFile(f);
    setPageState("pick");
    setPublicUrl("");
  };

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFileSelect(f);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleUpload = async () => {
    if (!file) return;
    setPageState("uploading");
    setFileError("");
    setProgress(0);

    try {
      const groupLabel = group?.name.replace(/\s+/g, "_") || "ungrouped";
      const fileName = `${Date.now()}_${groupLabel}_${file.name.replace(/\s+/g, "_")}`;

      const progressInterval = setInterval(() => {
        setProgress((p) => Math.min(p + 5, 90));
      }, 250);

      const { error: uploadError } = await supabase.storage
        .from("recordings")
        .upload(fileName, file, { contentType: file.type, upsert: false });

      clearInterval(progressInterval);

      if (uploadError) throw uploadError;

      setProgress(100);

      const { data: urlData } = supabase.storage
        .from("recordings")
        .getPublicUrl(fileName);

      setPublicUrl(urlData.publicUrl);
      setPageState("success");
      toast.success("File uploaded successfully!");
    } catch {
      setPageState("error");
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    toast.success("Link copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  const resetPage = () => {
    setFile(null);
    setPageState("pick");
    setPublicUrl("");
    setProgress(0);
    setFileError("");
    setCopied(false);
    setSelectedGroup("");
  };

  return (
    <AppShell pageTitle="Upload Audio">
      <div className="mx-auto max-w-[600px]">
        <div className="lila-card-elevated">

          {/* ===== PICK / READY STATE ===== */}
          {pageState === "pick" && (
            <div className="space-y-5">
              {/* Mascot */}
              <div className="flex flex-col items-center gap-2">
                <div
                  className="h-20 w-20 rounded-full flex items-center justify-center text-4xl voice-mascot-bob"
                  style={{
                    background: "linear-gradient(135deg, #C4B5FD 0%, #FBCFE8 100%)",
                    boxShadow: "0 4px 20px rgba(167,139,250,0.25)",
                  }}
                >
                  🦉
                </div>
                <div
                  className="rounded-2xl px-4 py-2 text-sm font-semibold text-center"
                  style={{ background: "#F5F3FF", color: "#2D1B69", border: "1.5px solid #EDE9FF" }}
                >
                  💬 Drop your audio file here and I'll take care of the rest!
                </div>
              </div>

              {/* Group selector */}
              <div>
                <Label>Associate with Group (optional)</Label>
                <Select value={selectedGroup} onValueChange={setSelectedGroup}>
                  <SelectTrigger className="rounded-2xl" style={{ background: "#F5F3FF", borderColor: "#EDE9FF" }}>
                    <SelectValue placeholder="Select a group" />
                  </SelectTrigger>
                  <SelectContent>
                    {GROUPS.map((g) => (
                      <SelectItem key={g.id} value={g.id}>
                        {g.name} ({g.students.length} students)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Drop zone */}
              <div
                className="relative rounded-2xl border-2 border-dashed p-10 flex flex-col items-center gap-3 transition-colors cursor-pointer"
                style={{
                  borderColor: dragOver ? "#A78BFA" : "#EDE9FF",
                  background: dragOver ? "#F5F3FF" : "#FAFAFE",
                }}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
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
                  className="lila-btn-secondary text-xs px-4 py-1.5"
                  onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                >
                  Browse Files
                </button>
                <p className="text-xs text-center" style={{ color: "#A89DC4" }}>
                  MP3, M4A, WAV, OGG • Max {MAX_SIZE_MB} MB
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept={ACCEPTED_EXTENSIONS}
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handleFileSelect(f);
                  }}
                />
              </div>

              {/* Selected file */}
              {file && (
                <div
                  className="flex items-center gap-3 rounded-2xl p-3"
                  style={{ background: "#F0FDF4", border: "1.5px solid #BBF7D0" }}
                >
                  <CheckCircle2 className="h-5 w-5 shrink-0" style={{ color: "#059669" }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold truncate" style={{ color: "#2D1B69" }}>{file.name}</p>
                    <p className="text-xs" style={{ color: "#059669" }}>
                      {formatFileSize(file.size)} • Ready to upload
                    </p>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); setFile(null); }}
                    className="p-1 rounded-full hover:bg-white/50"
                  >
                    <X className="h-4 w-4" style={{ color: "#A89DC4" }} />
                  </button>
                </div>
              )}

              {/* File error */}
              {fileError && (
                <div className="flex items-center gap-2 rounded-xl p-3" style={{ background: "#FEF2F2", border: "1px solid #FECACA" }}>
                  <AlertCircle className="h-4 w-4 shrink-0" style={{ color: "#EF4444" }} />
                  <p className="text-sm" style={{ color: "#DC2626" }}>{fileError}</p>
                </div>
              )}

              {/* Upload button */}
              <button
                className="lila-btn-primary w-full flex items-center justify-center gap-2 text-base py-3"
                disabled={!file}
                onClick={handleUpload}
              >
                <Upload className="h-5 w-5" />
                Upload Now
              </button>
            </div>
          )}

          {/* ===== UPLOADING STATE ===== */}
          {pageState === "uploading" && (
            <div className="space-y-5">
              <div className="flex flex-col items-center gap-2">
                <div
                  className="h-20 w-20 rounded-full flex items-center justify-center text-4xl animate-pulse"
                  style={{
                    background: "linear-gradient(135deg, #C4B5FD 0%, #FBCFE8 100%)",
                    boxShadow: "0 4px 20px rgba(167,139,250,0.25)",
                  }}
                >
                  🤔
                </div>
                <p className="text-sm font-semibold" style={{ color: "#2D1B69" }}>
                  Uploading your file…
                </p>
              </div>
              <div className="space-y-2">
                <div className="relative h-3 w-full overflow-hidden rounded-full" style={{ background: "#EDE9FF" }}>
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{
                      width: `${progress}%`,
                      background: "linear-gradient(135deg, #A78BFA 0%, #FB7185 100%)",
                    }}
                  />
                </div>
                <p className="text-xs text-center font-bold" style={{ color: "#7C6FAA" }}>
                  {progress}%
                </p>
              </div>
              <p className="text-xs text-center" style={{ color: "#A89DC4" }}>
                {file?.name} • {file ? formatFileSize(file.size) : ""}
              </p>
            </div>
          )}

          {/* ===== SUCCESS STATE ===== */}
          {pageState === "success" && (
            <div className="space-y-5">
              <div className="flex flex-col items-center gap-3">
                <div
                  className="h-20 w-20 rounded-full flex items-center justify-center text-4xl voice-mascot-bob"
                  style={{
                    background: "linear-gradient(135deg, #6EE7B7 0%, #7DD3FC 100%)",
                    boxShadow: "0 4px 20px rgba(110,231,183,0.25)",
                  }}
                >
                  👋
                </div>
                <h2 className="font-extrabold text-center text-lg" style={{ color: "#2D1B69" }}>
                  Upload Complete! ✨
                </h2>
              </div>

              <div className="rounded-2xl p-4 space-y-4" style={{ background: "#F0FDF4", border: "1.5px solid #BBF7D0" }}>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5" style={{ color: "#059669" }} />
                  <p className="text-sm font-bold" style={{ color: "#059669" }}>File saved successfully</p>
                </div>

                <div className="space-y-1">
                  <p className="text-xs font-semibold" style={{ color: "#7C6FAA" }}>File</p>
                  <p className="text-sm font-bold" style={{ color: "#2D1B69" }}>{file?.name}</p>
                </div>

                {group && (
                  <div className="space-y-1">
                    <p className="text-xs font-semibold" style={{ color: "#7C6FAA" }}>Group</p>
                    <p className="text-sm font-bold" style={{ color: "#2D1B69" }}>{group.name}</p>
                  </div>
                )}

                <div className="space-y-1">
                  <p className="text-xs font-semibold" style={{ color: "#7C6FAA" }}>Public File URL</p>
                  <div
                    className="rounded-xl p-3 text-xs break-all font-mono"
                    style={{ background: "#F5F3FF", border: "1.5px solid #EDE9FF", color: "#2D1B69" }}
                  >
                    {publicUrl}
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    className="lila-btn-secondary flex items-center gap-1.5 text-xs"
                    onClick={handleCopy}
                  >
                    {copied ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                    {copied ? "Copied ✓" : "Copy Link"}
                  </button>
                  <a
                    href={publicUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="lila-btn-secondary flex items-center gap-1.5 text-xs"
                  >
                    <Download className="h-3.5 w-3.5" /> Download File
                  </a>
                  <button className="lila-btn-secondary flex items-center gap-1.5 text-xs" disabled>
                    <Send className="h-3.5 w-3.5" /> Send to Analysis
                  </button>
                </div>

                <p className="text-xs" style={{ color: "#A89DC4" }}>
                  💡 Paste this link directly into make.com — no login or API key needed.
                </p>
              </div>

              <div className="flex gap-3">
                <button className="lila-btn-secondary flex-1" onClick={resetPage}>
                  Start Over
                </button>
                <button className="lila-btn-primary flex-1" onClick={() => navigate("/dashboard")}>
                  Go to Dashboard
                </button>
              </div>
            </div>
          )}

          {/* ===== ERROR STATE ===== */}
          {pageState === "error" && (
            <div className="space-y-5">
              <div className="flex flex-col items-center gap-3">
                <div
                  className="h-20 w-20 rounded-full flex items-center justify-center text-4xl"
                  style={{
                    background: "linear-gradient(135deg, #FECACA 0%, #FDE68A 100%)",
                    boxShadow: "0 4px 20px rgba(254,202,202,0.25)",
                  }}
                >
                  😟
                </div>
                <h2 className="font-extrabold text-center" style={{ color: "#2D1B69" }}>
                  Upload Failed
                </h2>
                <p className="text-sm text-center" style={{ color: "#7C6FAA" }}>
                  The file could not be saved. Please try again.
                </p>
              </div>
              <div className="flex gap-3">
                <button className="lila-btn-secondary flex-1" onClick={resetPage}>
                  Start Over
                </button>
                <button
                  className="lila-btn-primary flex-1 flex items-center justify-center gap-2"
                  onClick={handleUpload}
                >
                  <RotateCcw className="h-4 w-4" /> Retry
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
