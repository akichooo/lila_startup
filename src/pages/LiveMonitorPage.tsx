import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { AppShell } from "@/components/bridge/AppShell";
import { StudentAvatar } from "@/components/bridge/SharedComponents";
import { TRANSCRIPT, type TranscriptEntry } from "@/data/mockData";
import { Input } from "@/components/ui/input";
import { Pause, Play, StopCircle, StickyNote, Bookmark } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from "recharts";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAnalysis } from "@/contexts/AnalysisContext";
import { toast } from "sonner";
import Blobby from "@/components/mascots/Blobby";
import { useLilaSound } from "@/contexts/SoundContext";

const participationData = [
  { name: "Lena", value: 18, color: "#A78BFA" },
  { name: "Marcus", value: 32, color: "#FB7185" },
  { name: "Priya", value: 22, color: "#7DD3FC" },
  { name: "Omar", value: 18, color: "#6EE7B7" },
  { name: "Aiden", value: 10, color: "#FCD34D" },
];

const speakerTurns = [
  { name: "Marcus", turns: 8, fill: "#FB7185" },
  { name: "Priya", turns: 6, fill: "#7DD3FC" },
  { name: "Lena", turns: 5, fill: "#A78BFA" },
  { name: "Omar", turns: 5, fill: "#6EE7B7" },
  { name: "Aiden", turns: 3, fill: "#FCD34D" },
];

function formatTime(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

type SessionStatus = "live" | "paused" | "ended";

interface SavedNote {
  id: string;
  text: string;
  timestamp: string;
  elapsedSeconds: number;
}

interface MarkedMoment {
  id: string;
  timestamp: string;
  elapsedSeconds: number;
  label: string;
}

export default function LiveMonitorPage() {
  const navigate = useNavigate();
  const { generateAnalysis } = useAnalysis();
  const [note, setNote] = useState("");
  const [noteInputShake, setNoteInputShake] = useState(false);
  const [status, setStatus] = useState<SessionStatus>("live");
  const [elapsedSeconds, setElapsedSeconds] = useState(754); // start at 12:34
  const [showEndModal, setShowEndModal] = useState(false);
  const [showNoteInput, setShowNoteInput] = useState(false);
  const [notes, setNotes] = useState<SavedNote[]>([]);
  const [marks, setMarks] = useState<MarkedMoment[]>([]);
  const [markBounce, setMarkBounce] = useState(false);
  const [bookmarkBounce, setBookmarkBounce] = useState(false);
  const [noteConfirm, setNoteConfirm] = useState<string | null>(null);
  const [endingTransition, setEndingTransition] = useState(false);
  const noteInputRef = useRef<HTMLInputElement>(null);
  const topNoteRef = useRef<HTMLInputElement>(null);

  // Timer
  useEffect(() => {
    if (status !== "live") return;
    const interval = setInterval(() => setElapsedSeconds((s) => s + 1), 1000);
    return () => clearInterval(interval);
  }, [status]);

  // Build transcript items with marks inserted
  const transcriptItems = useCallback(() => {
    const items: (TranscriptEntry | MarkedMoment)[] = [...TRANSCRIPT];
    // Append marks as special items at the end for display
    return items;
  }, []);

  const saveNote = (text: string) => {
    if (!text.trim()) {
      setNoteInputShake(true);
      setTimeout(() => setNoteInputShake(false), 500);
      return;
    }
    const newNote: SavedNote = {
      id: `note-${Date.now()}`,
      text: text.trim(),
      timestamp: formatTime(elapsedSeconds),
      elapsedSeconds,
    };
    setNotes((prev) => [...prev, newNote]);
    setNoteConfirm(`Note saved at ${newNote.timestamp}`);
    setTimeout(() => setNoteConfirm(null), 2500);
    toast.success(`Note saved at ${newNote.timestamp}`);
  };

  const addMark = () => {
    const newMark: MarkedMoment = {
      id: `mark-${Date.now()}`,
      timestamp: formatTime(elapsedSeconds),
      elapsedSeconds,
      label: "",
    };
    setMarks((prev) => [...prev, newMark]);
    toast.success(`Moment marked at ${newMark.timestamp}`);
  };

  const handlePauseResume = () => {
    if (status === "live") {
      setStatus("paused");
    } else if (status === "paused") {
      setStatus("live");
    }
  };

  const handleEndConfirm = () => {
    setShowEndModal(false);
    setStatus("ended");
    setEndingTransition(true);

    // Save session to supabase
    const sessionId = `live-${Date.now()}`;
    supabase.from("sessions").insert({
      id: sessionId,
      session_name: "Feelings & Fairness",
      topic: "Feelings & Fairness",
      group_id: "g1",
      duration_minutes: Math.round(elapsedSeconds / 60),
      status: "summary-ready",
      recording_path: null,
    }).then(() => {
      // Generate analysis
      generateAnalysis({
        groupId: "g1",
        sessionName: "Feelings & Fairness",
        topic: "Feelings & Fairness",
        duration: Math.round(elapsedSeconds / 60),
      });
    });

    // Show transition then navigate
    setTimeout(() => {
      navigate("/summary");
    }, 2500);
  };

  const handleMarkWithBounce = (setBounceFn: (v: boolean) => void) => {
    addMark();
    setBounceFn(true);
    setTimeout(() => setBounceFn(false), 400);
  };

  const statusBadge = () => {
    if (status === "live") return (
      <span className="lila-badge-purple flex items-center gap-1.5">
        <span className="h-2 w-2 rounded-full animate-pulse" style={{ backgroundColor: "#FB7185" }} /> LIVE
      </span>
    );
    if (status === "paused") return (
      <span className="flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold" style={{ background: "#FFF7ED", color: "#D97706", border: "1.5px solid #FDBA74" }}>
        <span className="h-2 w-2 rounded-full" style={{ backgroundColor: "#D97706" }} /> PAUSED
      </span>
    );
    return (
      <span className="flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold" style={{ background: "#F3F4F6", color: "#6B7280", border: "1.5px solid #D1D5DB" }}>
        ENDED
      </span>
    );
  };

  if (endingTransition) {
    return (
      <AppShell pageTitle="Live Discussion Monitor">
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
          <Blobby state="speaking" size={160} />
          <p className="text-xl font-extrabold" style={{ color: "#2D1B69" }}>Well done! 🎉</p>
          <p className="text-sm" style={{ color: "#7C6FAA" }}>Preparing your session summary…</p>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell pageTitle="Live Discussion Monitor">
      <div className="grid gap-6 lg:grid-cols-[1fr_380px] min-h-[calc(100vh-200px)]">
        {/* Left - Transcript */}
        <div className="flex flex-col">
          <div className="flex items-center gap-3 mb-4">
            <h3 className="font-extrabold" style={{ color: "#2D1B69" }}>Feelings & Fairness — Group Finch</h3>
            {statusBadge()}
            <span className="text-sm ml-auto" style={{ color: "#7C6FAA" }}>{formatTime(elapsedSeconds)} elapsed</span>
          </div>

          {/* Paused banner */}
          {status === "paused" && (
            <div className="rounded-2xl p-4 mb-4 text-center" style={{ background: "#FFF7ED", border: "1.5px solid #FDBA74" }}>
              <p className="text-sm font-bold" style={{ color: "#D97706" }}>⏸ Session paused — students see a "be right back" screen</p>
            </div>
          )}

          {/* Current question */}
          <div className="rounded-2xl p-4 mb-4" style={{ background: "#EDE9FF", border: "1.5px solid #C4B5FD" }}>
            <p className="text-xs mb-1" style={{ color: "#7C6FAA" }}>Current question</p>
            <p className="text-sm font-bold" style={{ color: "#2D1B69" }}>"Does fairness always mean everyone gets the same thing?"</p>
          </div>

          {/* Transcript */}
          <div className={`flex-1 overflow-y-auto space-y-3 mb-4 max-h-[500px] pr-2 ${status === "paused" ? "opacity-60" : ""}`}>
            {TRANSCRIPT.map((entry) => {
              if (entry.isSilence) {
                return (
                  <div key={entry.id} className="flex items-center gap-2 py-2">
                    <div className="h-px flex-1" style={{ background: "#EDE9FF" }} />
                    <span className="text-xs italic" style={{ color: "#A89DC4" }}>{entry.text}</span>
                    <div className="h-px flex-1" style={{ background: "#EDE9FF" }} />
                  </div>
                );
              }
              return (
                <div
                  key={entry.id}
                  className={`flex items-start gap-3 ${entry.isCorrection ? "rounded-2xl p-3" : ""}`}
                  style={entry.isCorrection ? { background: "#FFF7ED", border: "1.5px solid #FDBA74" } : {}}
                >
                  <StudentAvatar initials={entry.initials} color={entry.color} size={entry.isAI ? "md" : "sm"} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2">
                      <span className="text-sm font-bold" style={{ color: entry.isAI ? "#A78BFA" : "#2D1B69" }}>{entry.speaker}</span>
                      <span className="text-xs" style={{ color: "#A89DC4" }}>{entry.time}</span>
                    </div>
                    <p className="text-sm mt-0.5" style={{ color: "#2D1B69" }}>{entry.text}</p>
                  </div>
                </div>
              );
            })}

            {/* Marked moments in transcript */}
            {marks.map((m) => (
              <div key={m.id} className="flex items-center gap-2 py-2">
                <div className="h-px flex-1" style={{ background: "#FCD34D" }} />
                <span className="flex items-center gap-1 text-xs font-bold rounded-full px-3 py-1" style={{ background: "#FFFBEB", color: "#D97706", border: "1.5px solid #FCD34D" }}>
                  <Bookmark className="h-3 w-3" /> Moment marked at {m.timestamp}
                </span>
                <div className="h-px flex-1" style={{ background: "#FCD34D" }} />
              </div>
            ))}
          </div>

          {/* Note confirmation chip */}
          {noteConfirm && (
            <div className="flex justify-center mb-2">
              <span className="text-xs font-bold rounded-full px-3 py-1 animate-fade-in" style={{ background: "#ECFDF5", color: "#059669", border: "1px solid #6EE7B7" }}>
                ✓ {noteConfirm}
              </span>
            </div>
          )}

          {/* Teacher note input */}
          <div className="flex gap-2 pt-4" style={{ borderTop: "1px solid #EDE9FF" }}>
            <Input
              ref={noteInputRef}
              placeholder="Add observation note…"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") { saveNote(note); setNote(""); } }}
              className={`flex-1 rounded-2xl transition-transform ${noteInputShake ? "animate-shake" : ""}`}
              style={{ background: "#F5F3FF", borderColor: "#EDE9FF" }}
              disabled={status === "ended"}
            />
            <button
              className="lila-btn-secondary text-xs !py-2 !px-4"
              onClick={() => { saveNote(note); setNote(""); }}
              disabled={status === "ended"}
            >
              Save Note
            </button>
            <button
              className={`lila-btn-secondary text-xs !py-2 !px-3 transition-all ${bookmarkBounce ? "scale-110" : ""}`}
              style={bookmarkBounce ? { color: "#D97706" } : {}}
              onClick={() => handleMarkWithBounce(setBookmarkBounce)}
              disabled={status === "ended"}
            >
              <Bookmark className="h-4 w-4" style={bookmarkBounce ? { color: "#D97706", fill: "#FCD34D" } : {}} />
            </button>
          </div>
        </div>

        {/* Right - Analytics */}
        <div className="space-y-6">
          {/* Controls */}
          <div className="grid grid-cols-2 gap-2">
            <button
              className="rounded-full py-2 px-3 text-xs font-bold flex items-center justify-center gap-1"
              style={{ background: "#FFF7ED", color: "#D97706", border: "1.5px solid #FDBA74" }}
              onClick={handlePauseResume}
              disabled={status === "ended"}
            >
              {status === "paused" ? <><Play className="h-4 w-4" /> Resume</> : <><Pause className="h-4 w-4" /> Pause</>}
            </button>
            <button
              className="rounded-full py-2 px-3 text-xs font-bold flex items-center justify-center gap-1"
              style={{ background: "#FFE4E6", color: "#FB7185", border: "1.5px solid #FB7185" }}
              onClick={() => setShowEndModal(true)}
              disabled={status === "ended"}
            >
              <StopCircle className="h-4 w-4" /> End
            </button>
            <button
              className="lila-btn-secondary text-xs !py-2 flex items-center justify-center gap-1"
              onClick={() => { setShowNoteInput((v) => !v); setTimeout(() => topNoteRef.current?.focus(), 100); }}
              disabled={status === "ended"}
            >
              <StickyNote className="h-4 w-4" /> Note
            </button>
            <button
              className={`rounded-full py-2 px-3 text-xs font-bold flex items-center justify-center gap-1 transition-all ${markBounce ? "scale-110" : ""}`}
              style={{ background: markBounce ? "#FCD34D" : "#FFFBEB", color: "#D97706", border: `1.5px solid ${markBounce ? "#D97706" : "#FCD34D"}` }}
              onClick={() => handleMarkWithBounce(setMarkBounce)}
              disabled={status === "ended"}
            >
              <Bookmark className="h-4 w-4" /> Mark
            </button>
          </div>

          {/* Expandable note input */}
          {showNoteInput && (
            <div className="lila-card p-3 space-y-2">
              <Input
                ref={topNoteRef}
                placeholder="Type your observation…"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && e.currentTarget.value.trim()) {
                    saveNote(e.currentTarget.value);
                    e.currentTarget.value = "";
                    setShowNoteInput(false);
                  }
                }}
                className="rounded-2xl"
                style={{ background: "#F5F3FF", borderColor: "#EDE9FF" }}
              />
              <div className="flex gap-2">
                <button className="lila-btn-primary text-xs !py-1.5 !px-4" onClick={() => {
                  if (topNoteRef.current?.value.trim()) {
                    saveNote(topNoteRef.current.value);
                    topNoteRef.current.value = "";
                    setShowNoteInput(false);
                  }
                }}>Save Note</button>
                <button className="lila-btn-secondary text-xs !py-1.5 !px-3" onClick={() => setShowNoteInput(false)}>Cancel</button>
              </div>
            </div>
          )}

          {/* Participation ring */}
          <div className="lila-card p-4">
            <p className="lila-label mb-3">Participation Balance</p>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={participationData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3} dataKey="value">
                    {participationData.map((d, i) => <Cell key={i} fill={d.color} />)}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap gap-2 justify-center">
              {participationData.map((d) => (
                <span key={d.name} className="flex items-center gap-1 text-xs font-bold" style={{ color: "#2D1B69" }}>
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: d.color }} />
                  {d.name} {d.value}%
                </span>
              ))}
            </div>
            <p className="text-xs text-center mt-2" style={{ color: "#D97706" }}>Aiden: Quiet so far</p>
          </div>

          {/* Speaker turns */}
          <div className="lila-card p-4">
            <p className="lila-label mb-3">Speaker Activity</p>
            <div className="h-40">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={speakerTurns} layout="vertical">
                  <XAxis type="number" hide />
                  <YAxis type="category" dataKey="name" width={55} tick={{ fontSize: 12, fill: "#2D1B69" }} />
                  <Tooltip />
                  <Bar dataKey="turns" radius={[0, 8, 8, 0]}>
                    {speakerTurns.map((d, i) => <Cell key={i} fill={d.fill} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Topic Engagement */}
          <div className="lila-card p-4">
            <p className="lila-label mb-3">Topic Engagement</p>
            <div className="flex items-center gap-1 mb-1">
              {["Off-topic", "Minimal", "Developing", "Engaged", "Deep"].map((label, i) => (
                <div key={label} className="flex-1 h-2 rounded-full" style={{ background: i <= 3 ? "#A78BFA" : "#EDE9FF" }} />
              ))}
            </div>
            <p className="text-xs text-center font-bold mt-1" style={{ color: "#A78BFA" }}>Engaged</p>
          </div>

          {/* Misinformation log */}
          <div className="lila-card p-4">
            <p className="lila-label mb-2">Misinformation Corrections (1)</p>
            <p className="text-xs" style={{ color: "#7C6FAA" }}>10:10 — Priya's comment about fairness — Lila gently reframed. Review in summary.</p>
          </div>

          {/* Notes panel */}
          {notes.length > 0 && (
            <div className="lila-card p-4">
              <p className="lila-label mb-3">Session Notes ({notes.length})</p>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {notes.map((n) => (
                  <div key={n.id} className="flex items-start gap-2 text-sm rounded-xl p-2" style={{ background: "#F5F3FF" }}>
                    <span className="text-xs shrink-0 font-bold" style={{ color: "#A78BFA" }}>{n.timestamp}</span>
                    <p style={{ color: "#2D1B69" }}>{n.text}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Marks panel */}
          {marks.length > 0 && (
            <div className="lila-card p-4">
              <p className="lila-label mb-3">Bookmarked Moments ({marks.length})</p>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {marks.map((m) => (
                  <div key={m.id} className="flex items-center gap-2 text-sm rounded-xl p-2" style={{ background: "#FFFBEB" }}>
                    <Bookmark className="h-3 w-3 shrink-0" style={{ color: "#D97706" }} />
                    <span className="text-xs font-bold" style={{ color: "#D97706" }}>{m.timestamp}</span>
                    <input
                      placeholder="Add label…"
                      className="flex-1 text-xs bg-transparent border-none outline-none"
                      style={{ color: "#2D1B69" }}
                      value={m.label}
                      onChange={(e) => setMarks((prev) => prev.map((x) => x.id === m.id ? { ...x, label: e.target.value } : x))}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Student preview */}
          <div className="lila-card p-4 overflow-hidden relative" style={{ background: "linear-gradient(135deg, #F5F3FF 0%, #FDF2F8 100%)" }}>
            <p className="lila-label mb-3">What students see</p>
            <div className="rounded-2xl bg-white p-4 text-center space-y-3" style={{ border: "1.5px solid #EDE9FF" }}>
              {status === "paused" ? (
                <>
                  <p className="text-lg font-extrabold" style={{ color: "#A78BFA" }}>Lila</p>
                  <p className="text-base font-bold" style={{ color: "#D97706" }}>Be right back! ⏸</p>
                  <p className="text-sm" style={{ color: "#7C6FAA" }}>Your teacher will resume shortly.</p>
                </>
              ) : (
                <>
                  <p className="text-lg font-extrabold" style={{ color: "#A78BFA" }}>Lila</p>
                  <p className="text-sm" style={{ color: "#2D1B69" }}>Hi Priya! 👋</p>
                  <p className="text-base font-bold" style={{ color: "#2D1B69" }}>"Does fairness always mean everyone gets the same thing?"</p>
                  <div className="flex justify-center gap-2">
                    {participationData.map((d) => (
                      <span key={d.name} className="h-3 w-3 rounded-full" style={{ backgroundColor: d.color }} />
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* End Session Confirmation Modal */}
      <Dialog open={showEndModal} onOpenChange={setShowEndModal}>
        <DialogContent className="rounded-2xl" style={{ maxWidth: 400 }}>
          <DialogHeader>
            <DialogTitle className="text-center font-extrabold" style={{ color: "#2D1B69" }}>
              Are you sure you want to end this session?
            </DialogTitle>
            <DialogDescription className="text-center text-sm" style={{ color: "#7C6FAA" }}>
              This will stop the discussion and generate a session summary.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex !flex-row gap-3 justify-center mt-2">
            <Button
              variant="outline"
              className="rounded-full font-bold"
              style={{ color: "#A78BFA", borderColor: "#A78BFA" }}
              onClick={() => setShowEndModal(false)}
            >
              Keep Going
            </Button>
            <Button
              className="rounded-full font-bold"
              style={{ background: "#FB7185", color: "white", border: "none" }}
              onClick={handleEndConfirm}
            >
              End Session
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
