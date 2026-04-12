import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { AppShell } from "@/components/bridge/AppShell";
import { GROUPS } from "@/data/mockData";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { StudentAvatar } from "@/components/bridge/SharedComponents";
import { Shield, Loader2, Mic, Square, Upload, CheckCircle2, Copy, Download, AlertCircle, Send, FileText } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Progress } from "@/components/ui/progress";
import AnalysisProcessingScreen from "@/components/analysis/AnalysisProcessingScreen";
import AnalysisResultPreview from "@/components/analysis/AnalysisResultPreview";
import { useAnalysis, type AnalysisResult } from "@/contexts/AnalysisContext";
import WebhookReportViewer from "@/components/analysis/WebhookReportViewer";

const TOPICS = [
  "Emotions",
  "Fairness & Rules",
  "Friendship",
  "Conflict Resolution",
  "Community",
  "Belonging",
  "Kindness",
  "Curiosity & Learning",
  "Custom",
];

export default function CreateSessionPage() {
  const navigate = useNavigate();
  const { generateAnalysis } = useAnalysis();
  const [step, setStep] = useState(1);
  const [sessionName, setSessionName] = useState("");
  const [topic, setTopic] = useState("");
  const [description, setDescription] = useState("");
  const [duration, setDuration] = useState("20");
  const [grade, setGrade] = useState("2-3");
  const [selectedGroup, setSelectedGroup] = useState("");
  const [misinfoCorrection, setMisinfoCorrection] = useState(true);
  const [participationBalance, setParticipationBalance] = useState(true);
  const [engagementTracking, setEngagementTracking] = useState(true);
  const [launching, setLaunching] = useState(false);

  // Recording state
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [recordingDone, setRecordingDone] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploaded, setUploaded] = useState(false);
  const [publicUrl, setPublicUrl] = useState("");
  const [uploadError, setUploadError] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const recordingBlobRef = useRef<Blob | null>(null);
  const [analysisState, setAnalysisState] = useState<"idle" | "analyzing" | "done" | "sending-webhook" | "webhook-done">("idle");
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [webhookReport, setWebhookReport] = useState("");
  const [webhookSessionId, setWebhookSessionId] = useState("");

  const group = GROUPS.find((g) => g.id === selectedGroup);
  const totalSeconds = parseInt(duration) * 60;
  const progressPercent = Math.min((recordingTime / totalSeconds) * 100, 100);


  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setIsRecording(false);
    setRecordingDone(true);
  }, []);

  // Auto-stop when timer reaches estimated duration
  useEffect(() => {
    if (isRecording && recordingTime >= totalSeconds) {
      stopRecording();
    }
  }, [isRecording, recordingTime, totalSeconds, stopRecording]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        recordingBlobRef.current = blob;
        stream.getTracks().forEach((t) => t.stop());
      };

      mediaRecorder.start(1000);
      setRecordingTime(0);
      setIsRecording(true);
      setRecordingDone(false);
      setUploaded(false);

      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch {
      toast.error("Microphone access denied. Please allow microphone access to record.");
    }
  };

  const handleLaunch = () => {
    setLaunching(true);
    setTimeout(() => setStep(4), 800);
    setTimeout(() => setLaunching(false), 900);
  };

  const handleUpload = async () => {
    const blob = recordingBlobRef.current;
    if (!blob) {
      toast.error("No recording found.");
      return;
    }

    setUploading(true);
    setUploadError(false);
    try {
      const anonymousId = `anon_${Date.now()}`;
      const fileName = `${anonymousId}/${Date.now()}_${sessionName.replace(/\s+/g, "_") || "session"}.webm`;

      const { error: uploadError } = await supabase.storage
        .from("audio-recordings")
        .upload(fileName, blob, { contentType: "audio/webm" });

      if (uploadError) throw uploadError;

      // Get the public URL
      const { data: urlData } = supabase.storage
        .from("audio-recordings")
        .getPublicUrl(fileName);

      const filePublicUrl = urlData.publicUrl;
      setPublicUrl(filePublicUrl);

      // Save session record with the public URL
      await supabase.from("sessions").insert({
        user_id: null,
        session_name: sessionName || "Untitled Session",
        topic,
        description,
        duration_minutes: parseInt(duration),
        grade,
        group_id: selectedGroup,
        misinfo_correction: misinfoCorrection,
        participation_balance: participationBalance,
        engagement_tracking: engagementTracking,
        recording_path: filePublicUrl,
        status: "completed",
      });

      setUploaded(true);
      toast.success("Recording saved successfully!");
    } catch {
      setUploadError(true);
      toast.error("Recording could not be saved. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
        mediaRecorderRef.current.stop();
      }
    };
  }, []);

  return (
    <AppShell pageTitle="Create Session">
      <div className="mx-auto max-w-[700px]">
        {/* Progress stepper */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {[1, 2, 3, 4].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div
                className="flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold"
                style={
                  step >= s
                    ? { background: "linear-gradient(135deg, #A78BFA 0%, #FB7185 100%)", color: "white" }
                    : { background: "#EDE9FF", color: "#7C6FAA" }
                }
              >
                {s}
              </div>
              <span
                className={`text-sm hidden sm:inline font-bold`}
                style={{ color: step >= s ? "#2D1B69" : "#A89DC4" }}
              >
                {s === 1 ? "Setup" : s === 2 ? "Group" : s === 3 ? "Review" : "Record"}
              </span>
              {s < 4 && (
                <div className="h-0.5 w-8 rounded-full" style={{ background: step > s ? "#A78BFA" : "#EDE9FF" }} />
              )}
            </div>
          ))}
        </div>

        <div className="lila-card-elevated">
          {step === 1 && (
            <div className="space-y-5">
              <h2 className="font-extrabold" style={{ color: "#2D1B69" }}>
                Session Setup
              </h2>
              <div>
                <Label htmlFor="name">Session Name</Label>
                <Input
                  id="name"
                  placeholder="e.g., Feelings & Fairness"
                  value={sessionName}
                  onChange={(e) => setSessionName(e.target.value)}
                  className="rounded-2xl"
                  style={{ background: "#F5F3FF", borderColor: "#EDE9FF" }}
                />
              </div>
              <div>
                <Label>Topic / Discussion Theme</Label>
                <Select value={topic} onValueChange={setTopic}>
                  <SelectTrigger className="rounded-2xl" style={{ background: "#F5F3FF", borderColor: "#EDE9FF" }}>
                    <SelectValue placeholder="Select a topic" />
                  </SelectTrigger>
                  <SelectContent>
                    {TOPICS.map((t) => (
                      <SelectItem key={t} value={t}>
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="desc">Topic Description</Label>
                <Textarea
                  id="desc"
                  placeholder="Briefly describe what you'd like students to explore..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="rounded-2xl"
                  style={{ background: "#F5F3FF", borderColor: "#EDE9FF" }}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Estimated Duration</Label>
                  <Select value={duration} onValueChange={setDuration}>
                    <SelectTrigger className="rounded-2xl" style={{ background: "#F5F3FF", borderColor: "#EDE9FF" }}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {["15", "20", "25", "30"].map((d) => (
                        <SelectItem key={d} value={d}>
                          {d} min
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Grade Level</Label>
                  <Select value={grade} onValueChange={setGrade}>
                    <SelectTrigger className="rounded-2xl" style={{ background: "#F5F3FF", borderColor: "#EDE9FF" }}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {["K-1", "2-3", "4-5", "6"].map((g) => (
                        <SelectItem key={g} value={g}>
                          {g}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-3 pt-2">
                {[
                  {
                    label: "Enable Lila misinformation correction",
                    checked: misinfoCorrection,
                    onChange: setMisinfoCorrection,
                  },
                  {
                    label: "Enable participation balancing",
                    checked: participationBalance,
                    onChange: setParticipationBalance,
                  },
                  {
                    label: "Enable topic engagement tracking",
                    checked: engagementTracking,
                    onChange: setEngagementTracking,
                  },
                ].map((toggle) => (
                  <div key={toggle.label} className="flex items-center justify-between">
                    <Label className="font-normal cursor-pointer">{toggle.label}</Label>
                    <Switch checked={toggle.checked} onCheckedChange={toggle.onChange} />
                  </div>
                ))}
              </div>
              <div className="flex justify-end pt-4">
                <button className="lila-btn-primary" onClick={() => setStep(2)}>
                  Next: Select Group
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-5">
              <h2 className="font-extrabold" style={{ color: "#2D1B69" }}>
                Select Student Group
              </h2>
              <div>
                <Label>Choose existing group</Label>
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
              {group && (
                <div className="grid grid-cols-2 gap-3 mt-4">
                  {group.students.map((s) => (
                    <div
                      key={s.id}
                      className="flex items-center gap-3 rounded-2xl p-3"
                      style={{ background: "#F5F3FF", border: "1.5px solid #EDE9FF" }}
                    >
                      <StudentAvatar initials={s.initials} color={s.color} />
                      <div>
                        <p className="text-sm font-bold" style={{ color: "#2D1B69" }}>
                          {s.name}
                        </p>
                        <p className="text-xs" style={{ color: "#7C6FAA" }}>
                          {s.grade} Grade
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <div className="flex justify-between pt-4">
                <button className="lila-btn-secondary" onClick={() => setStep(1)}>
                  Back
                </button>
                <button className="lila-btn-primary" onClick={() => setStep(3)} disabled={!selectedGroup}>
                  Next: Review
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-5">
              <h2 className="font-extrabold" style={{ color: "#2D1B69" }}>
                Review & Launch
              </h2>
              <div
                className="rounded-2xl p-4 space-y-2"
                style={{ background: "#F5F3FF", border: "1.5px solid #EDE9FF" }}
              >
                <p>
                  <span className="text-sm" style={{ color: "#7C6FAA" }}>
                    Session:
                  </span>{" "}
                  <span className="font-bold" style={{ color: "#2D1B69" }}>
                    {sessionName || "Untitled"}
                  </span>
                </p>
                <p>
                  <span className="text-sm" style={{ color: "#7C6FAA" }}>
                    Topic:
                  </span>{" "}
                  <span className="font-bold" style={{ color: "#2D1B69" }}>
                    {topic || "—"}
                  </span>
                </p>
                <p>
                  <span className="text-sm" style={{ color: "#7C6FAA" }}>
                    Group:
                  </span>{" "}
                  <span className="font-bold" style={{ color: "#2D1B69" }}>
                    {group?.name || "—"}
                  </span>
                </p>
                <p>
                  <span className="text-sm" style={{ color: "#7C6FAA" }}>
                    Students:
                  </span>{" "}
                  <span className="font-bold" style={{ color: "#2D1B69" }}>
                    {group?.students.map((s) => s.name).join(", ") || "—"}
                  </span>
                </p>
                <p>
                  <span className="text-sm" style={{ color: "#7C6FAA" }}>
                    Duration:
                  </span>{" "}
                  <span className="font-bold" style={{ color: "#2D1B69" }}>
                    {duration} min
                  </span>
                </p>
              </div>

              <div className="rounded-2xl p-4" style={{ background: "#EDE9FF", border: "1.5px solid #C4B5FD" }}>
                <p className="text-sm font-bold mb-1" style={{ color: "#7C3AED" }}>
                  Your Lila Facilitator Preview
                </p>
                <p className="text-sm italic" style={{ color: "#7C6FAA" }}>
                  "Today we're going to talk about {topic || "our topic"}. Has anyone ever felt like something wasn't
                  fair? What happened?"
                </p>
                <p className="text-xs mt-2" style={{ color: "#A89DC4" }}>
                  Lila adapts its questions based on student responses.
                </p>
              </div>

              <div
                className="rounded-2xl p-4 flex items-start gap-3"
                style={{ background: "#EDE9FF", border: "1.5px solid #C4B5FD" }}
              >
                <Shield className="h-5 w-5 shrink-0 mt-0.5" style={{ color: "#A78BFA" }} />
                <p className="text-sm" style={{ color: "#7C6FAA" }}>
                  Student responses in this session are recorded for session summary generation only. No video is
                  collected. Summaries are only visible to you and authorized school staff.
                </p>
              </div>

              <div className="flex justify-between pt-4">
                <button className="lila-btn-secondary" onClick={() => setStep(2)}>
                  Back
                </button>
                <button className="lila-btn-primary" onClick={handleLaunch} disabled={launching}>
                  {launching ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin inline" /> Setting up…
                    </>
                  ) : (
                    "Launch & Record"
                  )}
                </button>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-6">
              {/* Welcome creature animation */}
              {!isRecording && !recordingDone && !uploaded && (
                <div className="flex flex-col items-center gap-3 animate-fade-in">
                  <div className="relative">
                    {/* Speech bubble */}
                    <div
                      className="absolute -top-16 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-2xl px-4 py-2 text-sm font-bold animate-bounce"
                      style={{
                        background: "#EDE9FF",
                        color: "#7C3AED",
                        border: "1.5px solid #C4B5FD",
                        boxShadow: "0 4px 12px rgba(167,139,250,0.15)",
                      }}
                    >
                      Hi friends! Ready to talk? 🎤
                      <div
                        className="absolute left-1/2 -translate-x-1/2 -bottom-2 w-3 h-3 rotate-45"
                        style={{
                          background: "#EDE9FF",
                          borderRight: "1.5px solid #C4B5FD",
                          borderBottom: "1.5px solid #C4B5FD",
                        }}
                      />
                    </div>
                    {/* Friendly creature (Lila mascot) */}
                    <div className="voice-mascot-bob">
                      <div
                        className="h-20 w-20 rounded-full flex items-center justify-center text-4xl"
                        style={{
                          background: "linear-gradient(135deg, #C4B5FD 0%, #FBCFE8 100%)",
                          boxShadow: "0 4px 20px rgba(167,139,250,0.25)",
                        }}
                      >
                        <span className="inline-block animate-pulse" style={{ animationDuration: "1.5s" }}>
                          🦉
                        </span>
                      </div>
                    </div>
                  </div>
                  <p className="text-sm font-semibold" style={{ color: "#7C6FAA" }}>
                    Lila is waving hello! Press record when you're ready.
                  </p>
                </div>
              )}

              <h2 className="font-extrabold text-center" style={{ color: "#2D1B69" }}>
                {uploaded
                  ? "Session Complete! ✨"
                  : recordingDone
                    ? "Recording Complete"
                    : isRecording
                      ? "Recording in Progress"
                      : "Ready to Record"}
              </h2>

              {/* Session info summary */}
              <div className="flex justify-center gap-4 flex-wrap">
                <span
                  className="text-xs font-bold px-3 py-1 rounded-full"
                  style={{ background: "#EDE9FF", color: "#7C3AED" }}
                >
                  {topic || "No topic"}
                </span>
                <span
                  className="text-xs font-bold px-3 py-1 rounded-full"
                  style={{ background: "#EDE9FF", color: "#7C3AED" }}
                >
                  {group?.name || "No group"}
                </span>
                <span
                  className="text-xs font-bold px-3 py-1 rounded-full"
                  style={{ background: "#EDE9FF", color: "#7C3AED" }}
                >
                  {duration} min
                </span>
              </div>

              {/* Timer display */}
              <div className="flex flex-col items-center gap-4">
                <div className="relative flex items-center justify-center">
                  <div
                    className="h-40 w-40 rounded-full flex items-center justify-center"
                    style={{
                      background: isRecording
                        ? "linear-gradient(135deg, #A78BFA 0%, #FB7185 100%)"
                        : uploaded
                          ? "linear-gradient(135deg, #6EE7B7 0%, #7DD3FC 100%)"
                          : recordingDone
                            ? "linear-gradient(135deg, #FCD34D 0%, #FDBA74 100%)"
                            : "#EDE9FF",
                      boxShadow: isRecording ? "0 0 40px rgba(167,139,250,0.4)" : "none",
                    }}
                  >
                    <div className="h-32 w-32 rounded-full bg-white flex flex-col items-center justify-center">
                      {uploaded ? (
                        <CheckCircle2 className="h-10 w-10" style={{ color: "#6EE7B7" }} />
                      ) : (
                        <>
                          <span className="text-3xl font-extrabold" style={{ color: "#2D1B69" }}>
                            {formatTime(recordingTime)}
                          </span>
                          <span className="text-xs mt-1" style={{ color: "#A89DC4" }}>
                            / {formatTime(totalSeconds)}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                  {isRecording && (
                    <div
                      className="absolute inset-0 h-40 w-40 rounded-full animate-ping opacity-20"
                      style={{ background: "#A78BFA" }}
                    />
                  )}
                </div>

                {/* Progress bar */}
                {(isRecording || recordingDone) && !uploaded && (
                  <div className="w-full max-w-xs">
                    <Progress value={progressPercent} className="h-2" />
                  </div>
                )}
              </div>

              {/* Controls */}
              <div className="flex justify-center gap-4 pt-2">
                {!isRecording && !recordingDone && !uploaded && (
                  <button className="lila-btn-primary flex items-center gap-2" onClick={startRecording}>
                    <Mic className="h-5 w-5" /> Start Recording
                  </button>
                )}

                {isRecording && (
                  <button
                    className="flex items-center gap-2 px-6 py-3 rounded-full font-bold text-white"
                    style={{ background: "linear-gradient(135deg, #FB7185 0%, #FDBA74 100%)" }}
                    onClick={stopRecording}
                  >
                    <Square className="h-4 w-4" /> Stop Recording
                  </button>
                )}

                {recordingDone && !uploaded && (
                  <>
                    <button className="lila-btn-secondary flex items-center gap-2" onClick={startRecording}>
                      <Mic className="h-4 w-4" /> Re-record
                    </button>
                    <button
                      className="lila-btn-primary flex items-center gap-2"
                      onClick={handleUpload}
                      disabled={uploading}
                    >
                      {uploading ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" /> Saving…
                        </>
                      ) : (
                        <>
                          <Upload className="h-4 w-4" /> Save Recording
                        </>
                      )}
                    </button>
                  </>
                )}

                {uploadError && !uploading && (
                  <div className="flex flex-col items-center gap-3">
                    <div className="flex items-center gap-2 text-sm font-semibold" style={{ color: "#EF4444" }}>
                      <AlertCircle className="h-4 w-4" /> Recording could not be saved.
                    </div>
                    <button className="lila-btn-primary" onClick={handleUpload}>
                      Retry
                    </button>
                  </div>
                )}

                {uploaded && analysisState === "idle" && (
                  <div className="flex flex-col items-center gap-4 w-full max-w-md">
                    <div className="voice-mascot-bob">
                      <div
                        className="h-16 w-16 rounded-full flex items-center justify-center text-3xl"
                        style={{
                          background: "linear-gradient(135deg, #6EE7B7 0%, #7DD3FC 100%)",
                          boxShadow: "0 4px 20px rgba(110,231,183,0.25)",
                        }}
                      >
                        👋
                      </div>
                    </div>
                    <p className="text-sm font-bold" style={{ color: "#059669" }}>
                      ✅ Recording saved to Lila Cloud!
                    </p>

                    {publicUrl && (
                      <div className="w-full">
                        <label className="text-xs font-semibold mb-1 block" style={{ color: "#7C6FAA" }}>
                          Public File URL
                        </label>
                        <div
                          className="rounded-xl p-3 text-xs break-all font-mono"
                          style={{ background: "#F5F3FF", border: "1.5px solid #EDE9FF", color: "#2D1B69" }}
                        >
                          {publicUrl}
                        </div>
                        <div className="flex gap-2 mt-2">
                          <button
                            className="lila-btn-secondary flex items-center gap-1 text-xs"
                            onClick={() => {
                              navigator.clipboard.writeText(publicUrl);
                              toast.success("Link copied!");
                            }}
                          >
                            <Copy className="h-3 w-3" /> Copy Link
                          </button>
                          <a
                            href={publicUrl}
                            download
                            className="lila-btn-secondary flex items-center gap-1 text-xs"
                          >
                            <Download className="h-3 w-3" /> Download File
                          </a>
                        </div>
                        <p className="text-xs mt-2" style={{ color: "#A89DC4" }}>
                          💡 This link can be used to send the recording to external tools like Make.com
                        </p>
                      </div>
                    )}

                    <div className="flex gap-3 pt-2 w-full">
                      <button className="lila-btn-primary flex-1 flex items-center justify-center gap-2" onClick={async () => {
                        setAnalysisState("sending-webhook");
                        const sid = `session_${Date.now()}`;
                        setWebhookSessionId(sid);
                        try {
                          const { data, error } = await supabase.functions.invoke("send-to-webhook", {
                            body: { audio_url: publicUrl, session_id: sid },
                          });
                          if (error) throw error;
                          setWebhookReport(data.report_text || "No report returned.");
                          setAnalysisState("webhook-done");
                          toast.success("Analysis report received!");
                        } catch {
                          toast.error("Could not get report from Make.com. Please try again.");
                          setAnalysisState("idle");
                        }
                      }}>
                        <FileText className="h-4 w-4" /> Send to Make.com
                      </button>
                    </div>
                    <div className="flex gap-3 w-full">
                      <button className="lila-btn-secondary flex-1 flex items-center justify-center gap-2" onClick={() => setAnalysisState("analyzing")}>
                        <Send className="h-4 w-4" /> Quick Analysis
                      </button>
                    </div>
                    <div className="flex gap-3 w-full">
                      <button className="lila-btn-secondary flex-1" onClick={() => navigate("/dashboard")}>
                        Go to Dashboard
                      </button>
                      <button className="lila-btn-secondary flex-1" onClick={() => navigate("/live")}>
                        View Live Monitor
                      </button>
                    </div>
                  </div>
                )}

                {uploaded && analysisState === "analyzing" && (
                  <div className="w-full max-w-md">
                    <AnalysisProcessingScreen ageRange={group?.ageRange || "6-8"} onComplete={() => {
                      const result = generateAnalysis({
                        groupId: selectedGroup || GROUPS[0].id,
                        sessionName: sessionName || "Live Session",
                        topic: topic || "Discussion Session",
                        duration: parseInt(duration),
                        audioUrl: publicUrl,
                      });
                      setAnalysisResult(result);
                      setAnalysisState("done");
                    }} />
                  </div>
                )}

                {uploaded && analysisState === "done" && analysisResult && (
                  <div className="w-full">
                    <AnalysisResultPreview result={analysisResult} />
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
