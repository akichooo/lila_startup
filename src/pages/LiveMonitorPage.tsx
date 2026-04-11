import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppShell } from "@/components/bridge/AppShell";
import { StudentAvatar } from "@/components/bridge/SharedComponents";
import { TRANSCRIPT } from "@/data/mockData";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Pause, StopCircle, StickyNote, Bookmark } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from "recharts";

const participationData = [
  { name: "Lena", value: 18, color: "hsl(174, 60%, 45%)" },
  { name: "Marcus", value: 32, color: "hsl(25, 80%, 55%)" },
  { name: "Priya", value: 22, color: "hsl(270, 60%, 55%)" },
  { name: "Omar", value: 18, color: "hsl(210, 70%, 55%)" },
  { name: "Aiden", value: 10, color: "hsl(340, 60%, 55%)" },
];

const speakerTurns = [
  { name: "Marcus", turns: 8, fill: "hsl(25, 80%, 55%)" },
  { name: "Priya", turns: 6, fill: "hsl(270, 60%, 55%)" },
  { name: "Lena", turns: 5, fill: "hsl(174, 60%, 45%)" },
  { name: "Omar", turns: 5, fill: "hsl(210, 70%, 55%)" },
  { name: "Aiden", turns: 3, fill: "hsl(340, 60%, 55%)" },
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
            <h3>Feelings & Fairness — Group Finch</h3>
            <span className="bridge-badge-blue flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-destructive animate-pulse" /> LIVE
            </span>
            <span className="text-sm text-muted-foreground ml-auto">12:34 elapsed</span>
          </div>

          {/* Current question */}
          <div className="rounded-xl bg-secondary/10 border border-secondary/20 p-4 mb-4">
            <p className="text-xs text-muted-foreground mb-1">Current question</p>
            <p className="text-sm font-medium">"Does fairness always mean everyone gets the same thing?"</p>
          </div>

          {/* Transcript */}
          <div className="flex-1 overflow-y-auto space-y-3 mb-4 max-h-[500px] pr-2">
            {TRANSCRIPT.map((entry) => {
              if (entry.isSilence) {
                return (
                  <div key={entry.id} className="flex items-center gap-2 py-2">
                    <div className="h-px flex-1 bg-border" />
                    <span className="text-xs text-muted-foreground italic">{entry.text}</span>
                    <div className="h-px flex-1 bg-border" />
                  </div>
                );
              }
              return (
                <div
                  key={entry.id}
                  className={`flex items-start gap-3 ${entry.isCorrection ? "rounded-xl bg-warning/5 border border-warning/20 p-3" : ""}`}
                >
                  <StudentAvatar initials={entry.initials} color={entry.color} size={entry.isAI ? "md" : "sm"} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2">
                      <span className={`text-sm font-semibold ${entry.isAI ? "text-secondary" : ""}`}>{entry.speaker}</span>
                      <span className="text-xs text-muted-foreground">{entry.time}</span>
                    </div>
                    <p className="text-sm mt-0.5">{entry.text}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Teacher note input */}
          <div className="flex gap-2 border-t border-border pt-4">
            <Input placeholder="Add observation note…" value={note} onChange={(e) => setNote(e.target.value)} className="flex-1" />
            <Button variant="outline" size="sm">Save Note</Button>
            <Button variant="outline" size="sm"><Bookmark className="h-4 w-4" /></Button>
          </div>
        </div>

        {/* Right - Analytics */}
        <div className="space-y-6">
          {/* Controls */}
          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" size="sm"><Pause className="h-4 w-4 mr-1" /> Pause</Button>
            <Button variant="outline" size="sm" className="text-destructive" onClick={() => navigate("/summary")}><StopCircle className="h-4 w-4 mr-1" /> End</Button>
            <Button variant="outline" size="sm"><StickyNote className="h-4 w-4 mr-1" /> Note</Button>
            <Button variant="outline" size="sm"><Bookmark className="h-4 w-4 mr-1" /> Mark</Button>
          </div>

          {/* Participation ring */}
          <div className="bridge-card p-4">
            <p className="bridge-label mb-3">Participation Balance</p>
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
                <span key={d.name} className="flex items-center gap-1 text-xs">
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: d.color }} />
                  {d.name} {d.value}%
                </span>
              ))}
            </div>
            <p className="text-xs text-warning mt-2 text-center">Aiden: Quiet so far</p>
          </div>

          {/* Speaker turns */}
          <div className="bridge-card p-4">
            <p className="bridge-label mb-3">Speaker Activity</p>
            <div className="h-40">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={speakerTurns} layout="vertical">
                  <XAxis type="number" hide />
                  <YAxis type="category" dataKey="name" width={55} tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="turns" radius={[0, 4, 4, 0]}>
                    {speakerTurns.map((d, i) => <Cell key={i} fill={d.fill} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Topic Engagement */}
          <div className="bridge-card p-4">
            <p className="bridge-label mb-3">Topic Engagement</p>
            <div className="flex items-center gap-1 mb-1">
              {["Off-topic", "Minimal", "Developing", "Engaged", "Deep"].map((label, i) => (
                <div key={label} className={`flex-1 h-2 rounded-full ${i <= 3 ? "bg-primary" : "bg-muted"}`} />
              ))}
            </div>
            <p className="text-xs text-center text-primary font-medium mt-1">Engaged</p>
          </div>

          {/* Misinformation log */}
          <div className="bridge-card p-4">
            <p className="bridge-label mb-2">Misinformation Corrections (1)</p>
            <p className="text-xs text-muted-foreground">10:10 — Priya's comment about fairness — AI gently reframed. Review in summary.</p>
          </div>

          {/* Student preview */}
          <div className="bridge-card p-4 bg-gradient-to-br from-primary/5 to-secondary/5">
            <p className="bridge-label mb-3">What students see</p>
            <div className="rounded-xl border border-border bg-card p-4 text-center space-y-3">
              <p className="text-lg font-bold text-primary">Bridge</p>
              <p className="text-sm">Hi Priya! 👋</p>
              <p className="text-base font-medium">"Does fairness always mean everyone gets the same thing?"</p>
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
