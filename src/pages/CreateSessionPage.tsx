import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppShell } from "@/components/bridge/AppShell";
import { GROUPS, STUDENTS } from "@/data/mockData";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { StudentAvatar } from "@/components/bridge/SharedComponents";
import { Shield, Loader2 } from "lucide-react";

const TOPICS = ["Emotions", "Fairness & Rules", "Friendship", "Conflict Resolution", "Community", "Belonging", "Kindness", "Curiosity & Learning", "Custom"];

export default function CreateSessionPage() {
  const navigate = useNavigate();
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

  const group = GROUPS.find((g) => g.id === selectedGroup);

  const handleLaunch = () => {
    setLaunching(true);
    setTimeout(() => navigate("/live"), 1500);
  };

  return (
    <AppShell pageTitle="Create Session">
      <div className="mx-auto max-w-[700px]">
        {/* Progress stepper */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div
                className="flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold"
                style={step >= s ? { background: "linear-gradient(135deg, #A78BFA 0%, #FB7185 100%)", color: "white" } : { background: "#EDE9FF", color: "#7C6FAA" }}
              >{s}</div>
              <span className={`text-sm hidden sm:inline font-bold ${step >= s ? "" : ""}`} style={{ color: step >= s ? "#2D1B69" : "#A89DC4" }}>
                {s === 1 ? "Setup" : s === 2 ? "Group" : "Review"}
              </span>
              {s < 3 && <div className="h-0.5 w-12 rounded-full" style={{ background: step > s ? "#A78BFA" : "#EDE9FF" }} />}
            </div>
          ))}
        </div>

        <div className="lila-card-elevated">
          {step === 1 && (
            <div className="space-y-5">
              <h2 className="font-extrabold" style={{ color: "#2D1B69" }}>Session Setup</h2>
              <div>
                <Label htmlFor="name">Session Name</Label>
                <Input id="name" placeholder="e.g., Feelings & Fairness" value={sessionName} onChange={(e) => setSessionName(e.target.value)} className="rounded-2xl" style={{ background: "#F5F3FF", borderColor: "#EDE9FF" }} />
              </div>
              <div>
                <Label>Topic / Discussion Theme</Label>
                <Select value={topic} onValueChange={setTopic}>
                  <SelectTrigger className="rounded-2xl" style={{ background: "#F5F3FF", borderColor: "#EDE9FF" }}><SelectValue placeholder="Select a topic" /></SelectTrigger>
                  <SelectContent>{TOPICS.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="desc">Topic Description</Label>
                <Textarea id="desc" placeholder="Briefly describe what you'd like students to explore..." value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className="rounded-2xl" style={{ background: "#F5F3FF", borderColor: "#EDE9FF" }} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Estimated Duration</Label>
                  <Select value={duration} onValueChange={setDuration}>
                    <SelectTrigger className="rounded-2xl" style={{ background: "#F5F3FF", borderColor: "#EDE9FF" }}><SelectValue /></SelectTrigger>
                    <SelectContent>{["15", "20", "25", "30"].map((d) => <SelectItem key={d} value={d}>{d} min</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Grade Level</Label>
                  <Select value={grade} onValueChange={setGrade}>
                    <SelectTrigger className="rounded-2xl" style={{ background: "#F5F3FF", borderColor: "#EDE9FF" }}><SelectValue /></SelectTrigger>
                    <SelectContent>{["K-1", "2-3", "4-5", "6"].map((g) => <SelectItem key={g} value={g}>{g}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-3 pt-2">
                {[
                  { label: "Enable Lila misinformation correction", checked: misinfoCorrection, onChange: setMisinfoCorrection },
                  { label: "Enable participation balancing", checked: participationBalance, onChange: setParticipationBalance },
                  { label: "Enable topic engagement tracking", checked: engagementTracking, onChange: setEngagementTracking },
                ].map((toggle) => (
                  <div key={toggle.label} className="flex items-center justify-between">
                    <Label className="font-normal cursor-pointer">{toggle.label}</Label>
                    <Switch checked={toggle.checked} onCheckedChange={toggle.onChange} />
                  </div>
                ))}
              </div>
              <div className="flex justify-end pt-4">
                <button className="lila-btn-primary" onClick={() => setStep(2)}>Next: Select Group</button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-5">
              <h2 className="font-extrabold" style={{ color: "#2D1B69" }}>Select Student Group</h2>
              <div>
                <Label>Choose existing group</Label>
                <Select value={selectedGroup} onValueChange={setSelectedGroup}>
                  <SelectTrigger className="rounded-2xl" style={{ background: "#F5F3FF", borderColor: "#EDE9FF" }}><SelectValue placeholder="Select a group" /></SelectTrigger>
                  <SelectContent>{GROUPS.map((g) => <SelectItem key={g.id} value={g.id}>{g.name} ({g.students.length} students)</SelectItem>)}</SelectContent>
                </Select>
              </div>
              {group && (
                <div className="grid grid-cols-2 gap-3 mt-4">
                  {group.students.map((s) => (
                    <div key={s.id} className="flex items-center gap-3 rounded-2xl p-3" style={{ background: "#F5F3FF", border: "1.5px solid #EDE9FF" }}>
                      <StudentAvatar initials={s.initials} color={s.color} />
                      <div>
                        <p className="text-sm font-bold" style={{ color: "#2D1B69" }}>{s.name}</p>
                        <p className="text-xs" style={{ color: "#7C6FAA" }}>{s.grade} Grade</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <div className="flex justify-between pt-4">
                <button className="lila-btn-secondary" onClick={() => setStep(1)}>Back</button>
                <button className="lila-btn-primary" onClick={() => setStep(3)} disabled={!selectedGroup}>Next: Review</button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-5">
              <h2 className="font-extrabold" style={{ color: "#2D1B69" }}>Review & Launch</h2>
              <div className="rounded-2xl p-4 space-y-2" style={{ background: "#F5F3FF", border: "1.5px solid #EDE9FF" }}>
                <p><span className="text-sm" style={{ color: "#7C6FAA" }}>Session:</span> <span className="font-bold" style={{ color: "#2D1B69" }}>{sessionName || "Untitled"}</span></p>
                <p><span className="text-sm" style={{ color: "#7C6FAA" }}>Topic:</span> <span className="font-bold" style={{ color: "#2D1B69" }}>{topic || "—"}</span></p>
                <p><span className="text-sm" style={{ color: "#7C6FAA" }}>Group:</span> <span className="font-bold" style={{ color: "#2D1B69" }}>{group?.name || "—"}</span></p>
                <p><span className="text-sm" style={{ color: "#7C6FAA" }}>Students:</span> <span className="font-bold" style={{ color: "#2D1B69" }}>{group?.students.map((s) => s.name).join(", ") || "—"}</span></p>
                <p><span className="text-sm" style={{ color: "#7C6FAA" }}>Duration:</span> <span className="font-bold" style={{ color: "#2D1B69" }}>{duration} min</span></p>
              </div>

              <div className="rounded-2xl p-4" style={{ background: "#EDE9FF", border: "1.5px solid #C4B5FD" }}>
                <p className="text-sm font-bold mb-1" style={{ color: "#7C3AED" }}>Your Lila Facilitator Preview</p>
                <p className="text-sm italic" style={{ color: "#7C6FAA" }}>
                  "Today we're going to talk about {topic || "our topic"}. Has anyone ever felt like something wasn't fair? What happened?"
                </p>
                <p className="text-xs mt-2" style={{ color: "#A89DC4" }}>Lila adapts its questions based on student responses.</p>
              </div>

              <div className="rounded-2xl p-4 flex items-start gap-3" style={{ background: "#EDE9FF", border: "1.5px solid #C4B5FD" }}>
                <Shield className="h-5 w-5 shrink-0 mt-0.5" style={{ color: "#A78BFA" }} />
                <p className="text-sm" style={{ color: "#7C6FAA" }}>Student responses in this session are recorded for session summary generation only. No audio or video is collected. Summaries are only visible to you and authorized school staff.</p>
              </div>

              <div className="flex justify-between pt-4">
                <button className="lila-btn-secondary" onClick={() => setStep(2)}>Back</button>
                <div className="flex gap-3">
                  <button className="lila-btn-secondary">Save as Draft</button>
                  <button className="lila-btn-primary" onClick={handleLaunch} disabled={launching}>
                    {launching ? <><Loader2 className="mr-2 h-4 w-4 animate-spin inline" /> Setting up…</> : "Launch Session"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
