import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppShell } from "@/components/bridge/AppShell";
import { GROUPS, STUDENTS } from "@/data/mockData";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { StudentAvatar } from "@/components/bridge/SharedComponents";
import { Shield, CheckCircle2 } from "lucide-react";

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
              <div className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold ${
                step >= s ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
              }`}>{s}</div>
              <span className={`text-sm hidden sm:inline ${step >= s ? "text-foreground" : "text-muted-foreground"}`}>
                {s === 1 ? "Setup" : s === 2 ? "Group" : "Review"}
              </span>
              {s < 3 && <div className={`h-0.5 w-12 ${step > s ? "bg-primary" : "bg-border"}`} />}
            </div>
          ))}
        </div>

        <div className="bridge-card-elevated">
          {/* Step 1 */}
          {step === 1 && (
            <div className="space-y-5">
              <h2>Session Setup</h2>
              <div>
                <Label htmlFor="name">Session Name</Label>
                <Input id="name" placeholder="e.g., Feelings & Fairness" value={sessionName} onChange={(e) => setSessionName(e.target.value)} />
              </div>
              <div>
                <Label>Topic / Discussion Theme</Label>
                <Select value={topic} onValueChange={setTopic}>
                  <SelectTrigger><SelectValue placeholder="Select a topic" /></SelectTrigger>
                  <SelectContent>{TOPICS.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="desc">Topic Description</Label>
                <Textarea id="desc" placeholder="Briefly describe what you'd like students to explore..." value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Estimated Duration</Label>
                  <Select value={duration} onValueChange={setDuration}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {["15", "20", "25", "30"].map((d) => <SelectItem key={d} value={d}>{d} min</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Grade Level</Label>
                  <Select value={grade} onValueChange={setGrade}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {["K-1", "2-3", "4-5", "6"].map((g) => <SelectItem key={g} value={g}>{g}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-3 pt-2">
                {[
                  { label: "Enable AI misinformation correction", checked: misinfoCorrection, onChange: setMisinfoCorrection, tooltip: "The AI will gently note when factual errors arise in discussion." },
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
                <Button onClick={() => setStep(2)}>Next: Select Group</Button>
              </div>
            </div>
          )}

          {/* Step 2 */}
          {step === 2 && (
            <div className="space-y-5">
              <h2>Select Student Group</h2>
              <div>
                <Label>Choose existing group</Label>
                <Select value={selectedGroup} onValueChange={setSelectedGroup}>
                  <SelectTrigger><SelectValue placeholder="Select a group" /></SelectTrigger>
                  <SelectContent>{GROUPS.map((g) => <SelectItem key={g.id} value={g.id}>{g.name} ({g.students.length} students)</SelectItem>)}</SelectContent>
                </Select>
              </div>
              {group && (
                <div className="grid grid-cols-2 gap-3 mt-4">
                  {group.students.map((s) => (
                    <div key={s.id} className="flex items-center gap-3 rounded-xl border border-border p-3 bg-muted/30">
                      <StudentAvatar initials={s.initials} color={s.color} />
                      <div>
                        <p className="text-sm font-medium">{s.name}</p>
                        <p className="text-xs text-muted-foreground">{s.grade} Grade</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <div className="flex justify-between pt-4">
                <Button variant="outline" onClick={() => setStep(1)}>Back</Button>
                <Button onClick={() => setStep(3)} disabled={!selectedGroup}>Next: Review</Button>
              </div>
            </div>
          )}

          {/* Step 3 */}
          {step === 3 && (
            <div className="space-y-5">
              <h2>Review & Launch</h2>
              <div className="rounded-xl border border-border p-4 space-y-2">
                <p><span className="text-muted-foreground text-sm">Session:</span> <span className="font-medium">{sessionName || "Untitled"}</span></p>
                <p><span className="text-muted-foreground text-sm">Topic:</span> <span className="font-medium">{topic || "—"}</span></p>
                <p><span className="text-muted-foreground text-sm">Group:</span> <span className="font-medium">{group?.name || "—"}</span></p>
                <p><span className="text-muted-foreground text-sm">Students:</span> <span className="font-medium">{group?.students.map((s) => s.name).join(", ") || "—"}</span></p>
                <p><span className="text-muted-foreground text-sm">Duration:</span> <span className="font-medium">{duration} min</span></p>
              </div>

              <div className="rounded-xl border border-border bg-secondary/5 p-4">
                <p className="text-sm font-medium mb-1">Facilitator Preview</p>
                <p className="text-sm italic text-muted-foreground">
                  "Today we're going to talk about {topic || "our topic"}. Has anyone ever felt like something wasn't fair? What happened?"
                </p>
                <p className="text-xs text-muted-foreground mt-2">The AI adapts its questions based on student responses.</p>
              </div>

              <div className="rounded-xl bg-secondary/10 border border-secondary/20 p-4 flex items-start gap-3">
                <Shield className="h-5 w-5 text-secondary shrink-0 mt-0.5" />
                <p className="text-sm text-muted-foreground">Student responses in this session are recorded for session summary generation only. No audio or video is collected. Summaries are only visible to you and authorized school staff.</p>
              </div>

              <div className="flex justify-between pt-4">
                <Button variant="outline" onClick={() => setStep(2)}>Back</Button>
                <div className="flex gap-3">
                  <Button variant="outline">Save as Draft</Button>
                  <Button onClick={handleLaunch} disabled={launching}>
                    {launching ? (
                      <><span className="animate-spin mr-2">⏳</span> Setting up…</>
                    ) : "Launch Session"}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
