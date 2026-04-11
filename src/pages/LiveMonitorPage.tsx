import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppShell } from "@/components/bridge/AppShell";
import { StudentAvatar } from "@/components/bridge/SharedComponents";
import { TRANSCRIPT } from "@/data/mockData";
import { Input } from "@/components/ui/input";
import { Pause, StopCircle, StickyNote, Bookmark } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from "recharts";

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

export default function LiveMonitorPage() {
  const navigate = useNavigate();
  const [note, setNote] = useState("");

  return (
    <AppShell pageTitle="Live Discussion Monitor">
      <div className="grid gap-6 lg:grid-cols-[1fr_380px] min-h-[calc(100vh-200px)]">
        {/* Left - Transcript */}
        <div className="flex flex-col">
          <div className="flex items-center gap-3 mb-4">
            <h3 className="font-extrabold" style={{ color: "#2D1B69" }}>Feelings & Fairness — Group Finch</h3>
            <span className="lila-badge-purple flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full animate-pulse" style={{ backgroundColor: "#FB7185" }} /> LIVE
            </span>
            <span className="text-sm ml-auto" style={{ color: "#7C6FAA" }}>12:34 elapsed</span>
          </div>

          {/* Current question */}
          <div className="rounded-2xl p-4 mb-4" style={{ background: "#EDE9FF", border: "1.5px solid #C4B5FD" }}>
            <p className="text-xs mb-1" style={{ color: "#7C6FAA" }}>Current question</p>
            <p className="text-sm font-bold" style={{ color: "#2D1B69" }}>"Does fairness always mean everyone gets the same thing?"</p>
          </div>

          {/* Transcript */}
          <div className="flex-1 overflow-y-auto space-y-3 mb-4 max-h-[500px] pr-2">
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
          </div>

          {/* Teacher note input */}
          <div className="flex gap-2 pt-4" style={{ borderTop: "1px solid #EDE9FF" }}>
            <Input placeholder="Add observation note…" value={note} onChange={(e) => setNote(e.target.value)} className="flex-1 rounded-2xl" style={{ background: "#F5F3FF", borderColor: "#EDE9FF" }} />
            <button className="lila-btn-secondary text-xs !py-2 !px-4">Save Note</button>
            <button className="lila-btn-secondary text-xs !py-2 !px-3"><Bookmark className="h-4 w-4" /></button>
          </div>
        </div>

        {/* Right - Analytics */}
        <div className="space-y-6">
          {/* Controls */}
          <div className="grid grid-cols-2 gap-2">
            <button className="rounded-full py-2 px-3 text-xs font-bold flex items-center justify-center gap-1" style={{ background: "#FFF7ED", color: "#D97706", border: "1.5px solid #FDBA74" }}><Pause className="h-4 w-4" /> Pause</button>
            <button className="rounded-full py-2 px-3 text-xs font-bold flex items-center justify-center gap-1" style={{ background: "#FFE4E6", color: "#FB7185", border: "1.5px solid #FB7185" }} onClick={() => navigate("/summary")}><StopCircle className="h-4 w-4" /> End</button>
            <button className="lila-btn-secondary text-xs !py-2 flex items-center justify-center gap-1"><StickyNote className="h-4 w-4" /> Note</button>
            <button className="rounded-full py-2 px-3 text-xs font-bold flex items-center justify-center gap-1" style={{ background: "#FFFBEB", color: "#D97706", border: "1.5px solid #FCD34D" }}><Bookmark className="h-4 w-4" /> Mark</button>
          </div>

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

          {/* Student preview */}
          <div className="lila-card p-4 overflow-hidden relative" style={{ background: "linear-gradient(135deg, #F5F3FF 0%, #FDF2F8 100%)" }}>
            <p className="lila-label mb-3">What students see</p>
            <div className="rounded-2xl bg-white p-4 text-center space-y-3" style={{ border: "1.5px solid #EDE9FF" }}>
              <p className="text-lg font-extrabold" style={{ color: "#A78BFA" }}>Lila</p>
              <p className="text-sm" style={{ color: "#2D1B69" }}>Hi Priya! 👋</p>
              <p className="text-base font-bold" style={{ color: "#2D1B69" }}>"Does fairness always mean everyone gets the same thing?"</p>
              <div className="flex justify-center gap-2">
                {participationData.map((d) => (
                  <span key={d.name} className="h-3 w-3 rounded-full" style={{ backgroundColor: d.color }} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
