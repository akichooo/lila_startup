import { useState } from "react";
import { AppShell } from "@/components/bridge/AppShell";
import { StudentAvatar, DisclaimerBanner, SectionHeader } from "@/components/bridge/SharedComponents";
import { STUDENTS, PARTICIPATION_DATA, TOPIC_ENGAGEMENT, TONE_DATA } from "@/data/mockData";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Download, CheckCircle2 } from "lucide-react";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell, AreaChart, Area,
} from "recharts";

const withdrawalData = [
  { session: "Sep 16", value: 0 }, { session: "Sep 23", value: 0 }, { session: "Sep 30", value: 0 },
  { session: "Oct 4", value: 0 }, { session: "Oct 7", value: 1 }, { session: "Oct 11", value: 1 },
  { session: "Oct 13", value: 1 }, { session: "Oct 14", value: 2 },
];

const interruptionData = [
  { session: "Sep 16", value: 0 }, { session: "Sep 23", value: 1 }, { session: "Sep 30", value: 0 },
  { session: "Oct 4", value: 0 }, { session: "Oct 7", value: 1 }, { session: "Oct 11", value: 0 },
  { session: "Oct 13", value: 0 }, { session: "Oct 14", value: 0 },
];

const teacherNotes = [
  { date: "Oct 14", text: "Lena seemed distracted today. Will check in tomorrow.", author: "Ms. Rivera" },
  { date: "Oct 7", text: "Quieter than usual but did contribute one strong point about fairness.", author: "Ms. Rivera" },
  { date: "Sep 30", text: "Good session for Lena. Very engaged during friendship discussion.", author: "Ms. Rivera" },
  { date: "Sep 23", text: "First session — Lena spoke confidently.", author: "Ms. Rivera" },
];

const followUpHistory = [
  { date: "Oct 14", text: "Check in with Lena this week", status: "Pending" },
  { date: "Oct 7", text: "Monitor participation in next session", status: "Done" },
  { date: "Sep 30", text: "No action needed", status: "Resolved" },
];

export default function TrendsPage() {
  const [selectedStudent, setSelectedStudent] = useState("s1");
  const [timeRange, setTimeRange] = useState("8");
  const student = STUDENTS.find((s) => s.id === selectedStudent) || STUDENTS[0];

  return (
    <AppShell pageTitle="Student Trends">
      {/* Top controls */}
      <div className="flex flex-wrap items-center gap-4 mb-6">
        <div className="flex items-center gap-3">
          <span className="text-sm" style={{ color: "#7C6FAA" }}>Viewing:</span>
          <Select value={selectedStudent} onValueChange={setSelectedStudent}>
            <SelectTrigger className="w-44 rounded-2xl" style={{ background: "#F5F3FF", borderColor: "#EDE9FF" }}><SelectValue /></SelectTrigger>
            <SelectContent>{STUDENTS.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <span className="lila-badge-purple">Group Finch</span>
        <span className="text-sm" style={{ color: "#7C6FAA" }}>{student.grade} Grade</span>
        <div className="flex gap-1 ml-auto">
          {[{ l: "Last 4", v: "4" }, { l: "Last 8", v: "8" }, { l: "All time", v: "all" }].map((r) => (
            <button
              key={r.v}
              onClick={() => setTimeRange(r.v)}
              className="px-3 py-1 rounded-full text-xs font-bold transition-colors"
              style={timeRange === r.v ? { background: "linear-gradient(135deg, #A78BFA 0%, #FB7185 100%)", color: "white" } : { background: "#EDE9FF", color: "#7C6FAA" }}
            >
              {r.l}
            </button>
          ))}
        </div>
        <button className="lila-btn-secondary text-xs !py-1.5 !px-4 flex items-center gap-1"><Download className="h-4 w-4" /> Export</button>
      </div>

      <DisclaimerBanner>
        All trends shown here reflect observational participation signals from Lila-facilitated sessions. They do not constitute a psychological, behavioral, or diagnostic assessment. Teacher judgment is required for any decisions or actions.
      </DisclaimerBanner>

      {/* Charts grid */}
      <div className="grid gap-6 md:grid-cols-2 mt-6">
        <div className="lila-card">
          <p className="lila-label mb-1">Participation Over Time</p>
          <p className="text-xs mb-3" style={{ color: "#D97706" }}>Participation trend: Declining over last 3 sessions</p>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={PARTICIPATION_DATA}>
                <XAxis dataKey="session" tick={{ fontSize: 11, fill: "#7C6FAA" }} />
                <YAxis tick={{ fontSize: 11, fill: "#7C6FAA" }} />
                <Tooltip />
                <Line type="monotone" dataKey="lena" stroke="#A78BFA" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="lila-card">
          <p className="lila-label mb-1">Interruption Trend</p>
          <p className="text-xs mb-3" style={{ color: "#7C6FAA" }}>Consistently low. No pattern of concern.</p>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={interruptionData}>
                <XAxis dataKey="session" tick={{ fontSize: 11, fill: "#7C6FAA" }} />
                <YAxis tick={{ fontSize: 11, fill: "#7C6FAA" }} />
                <Tooltip />
                <Bar dataKey="value" fill="#FB7185" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="lila-card">
          <p className="lila-label mb-1">Non-Response to Invitation</p>
          <p className="text-xs mb-3" style={{ color: "#D97706" }}>Increasing — worth monitoring</p>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={withdrawalData}>
                <XAxis dataKey="session" tick={{ fontSize: 11, fill: "#7C6FAA" }} />
                <YAxis tick={{ fontSize: 11, fill: "#7C6FAA" }} />
                <Tooltip />
                <Area type="monotone" dataKey="value" fill="#FDBA74" fillOpacity={0.2} stroke="#FDBA74" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="lila-card">
          <p className="lila-label mb-1">Emotional Tone Trend</p>
          <p className="text-xs mb-3" style={{ color: "#7C6FAA" }}>Slight shift toward uncertain register in recent sessions</p>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={TONE_DATA}>
                <XAxis dataKey="session" tick={{ fontSize: 11, fill: "#7C6FAA" }} />
                <YAxis tick={{ fontSize: 11, fill: "#7C6FAA" }} />
                <Tooltip />
                <Bar dataKey="positive" stackId="a" fill="#6EE7B7" />
                <Bar dataKey="neutral" stackId="a" fill="#EDE9FF" />
                <Bar dataKey="uncertain" stackId="a" fill="#FDBA74" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="lila-card md:col-span-2">
          <p className="lila-label mb-3">Engagement by Topic</p>
          <div className="h-40">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={TOPIC_ENGAGEMENT} layout="vertical">
                <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11, fill: "#7C6FAA" }} />
                <YAxis type="category" dataKey="topic" width={80} tick={{ fontSize: 12, fill: "#2D1B69" }} />
                <Tooltip />
                <Bar dataKey="engagement" radius={[0, 8, 8, 0]}>
                  {TOPIC_ENGAGEMENT.map((d, i) => (
                    <Cell key={i} fill={d.engagement < 40 ? "#FDBA74" : "#A78BFA"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="text-xs mt-2" style={{ color: "#D97706" }}>Lowest engagement observed during conflict-adjacent topics</p>
        </div>
      </div>

      {/* Teacher Notes & Follow-ups */}
      <div className="grid gap-6 md:grid-cols-2 mt-6">
        <div className="lila-card">
          <SectionHeader title="Teacher Notes" action={<button className="lila-btn-secondary text-xs !py-1 !px-3">Add Note</button>} />
          <div className="space-y-4">
            {teacherNotes.map((n, i) => (
              <div key={i} className="pl-4" style={{ borderLeft: "2px solid #A78BFA" }}>
                <p className="text-xs" style={{ color: "#A89DC4" }}>{n.date} · {n.author}</p>
                <p className="text-sm mt-0.5" style={{ color: "#2D1B69" }}>{n.text}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="lila-card">
          <SectionHeader title="Follow-Up History" />
          <div className="space-y-3">
            {followUpHistory.map((f, i) => (
              <div key={i} className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 shrink-0" style={{ color: f.status === "Done" ? "#6EE7B7" : f.status === "Pending" ? "#FDBA74" : "#EDE9FF" }} />
                <div className="flex-1">
                  <p className="text-sm" style={{ color: "#2D1B69" }}>{f.text}</p>
                  <p className="text-xs" style={{ color: "#A89DC4" }}>{f.date}</p>
                </div>
                <span className="text-xs font-bold" style={{ color: f.status === "Done" ? "#059669" : f.status === "Pending" ? "#D97706" : "#7C6FAA" }}>{f.status}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
