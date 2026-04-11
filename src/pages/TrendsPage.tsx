import { useState, useEffect } from "react";
import { AppShell } from "@/components/bridge/AppShell";
import { StudentAvatar, DisclaimerBanner, SectionHeader } from "@/components/bridge/SharedComponents";
import { STUDENTS, GROUPS } from "@/data/mockData";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download, CheckCircle2 } from "lucide-react";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell, AreaChart, Area,
} from "recharts";
import { useAnalysis, type StudentSessionRecord } from "@/contexts/AnalysisContext";

function trendLabel(records: StudentSessionRecord[]): { label: string; color: string } {
  if (records.length < 3) return { label: "Insufficient data", color: "#7C6FAA" };
  const last3 = records.slice(-3).map((r) => r.participation_pct);
  const trend = last3[2] - last3[0];
  if (trend > 3) return { label: "Improving", color: "#059669" };
  if (trend < -3) return { label: "Declining", color: "#D97706" };
  return { label: "Consistent", color: "#7C6FAA" };
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default function TrendsPage() {
  const [selectedStudent, setSelectedStudent] = useState("s1");
  const [timeRange, setTimeRange] = useState("all");
  const { studentRecords, refreshRecords } = useAnalysis();

  useEffect(() => { refreshRecords(); }, []);

  const student = STUDENTS.find((s) => s.id === selectedStudent) || STUDENTS[0];
  const studentGroup = GROUPS.find((g) => g.students.some((s) => s.id === selectedStudent));

  // Filter records for selected student
  let records = studentRecords.filter((r) => r.student_id === selectedStudent);
  if (timeRange === "4") records = records.slice(-4);
  else if (timeRange === "8") records = records.slice(-8);

  const participationData = records.map((r) => ({
    session: formatDate(r.session_date),
    value: r.participation_pct,
  }));

  const speakingData = records.map((r) => ({
    session: formatDate(r.session_date),
    value: r.speaking_turns,
  }));

  const toneData = records.map((r) => ({
    session: formatDate(r.session_date),
    positive: r.tone_signal === "positive" ? 100 : 0,
    neutral: r.tone_signal === "neutral" ? 100 : 0,
    uncertain: r.tone_signal === "uncertain" ? 100 : 0,
  }));

  const withdrawalData = records.map((r) => ({
    session: formatDate(r.session_date),
    value: r.flagged ? 1 : 0,
  }));

  const trend = trendLabel(records);

  const followUps = records
    .filter((r) => r.flagged && r.flag_description)
    .map((r) => ({
      date: formatDate(r.session_date),
      text: r.flag_description || "",
      status: "Pending" as const,
    }));

  const hasData = records.length > 0;

  return (
    <AppShell pageTitle="Student Trends">
      <div className="flex flex-wrap items-center gap-4 mb-6">
        <div className="flex items-center gap-3">
          <span className="text-sm" style={{ color: "#7C6FAA" }}>Viewing:</span>
          <Select value={selectedStudent} onValueChange={setSelectedStudent}>
            <SelectTrigger className="w-44 rounded-2xl" style={{ background: "#F5F3FF", borderColor: "#EDE9FF" }}><SelectValue /></SelectTrigger>
            <SelectContent>{STUDENTS.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        {studentGroup && <span className="lila-badge-purple">{studentGroup.name}</span>}
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

      {!hasData && (
        <div className="lila-card mt-6 text-center py-12">
          <p className="text-lg font-bold" style={{ color: "#2D1B69" }}>No session data yet for {student.name}</p>
          <p className="text-sm mt-2" style={{ color: "#7C6FAA" }}>Run an analysis on a session that includes this student to see their trends here.</p>
        </div>
      )}

      {hasData && (
        <>
          <div className="grid gap-6 md:grid-cols-2 mt-6">
            <div className="lila-card">
              <p className="lila-label mb-1">Participation Over Time</p>
              <p className="text-xs mb-3" style={{ color: trend.color }}>
                Participation trend: {trend.label}
                {records.length >= 3 ? ` over last ${Math.min(records.length, 3)} sessions` : ""}
              </p>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={participationData}>
                    <XAxis dataKey="session" tick={{ fontSize: 11, fill: "#7C6FAA" }} />
                    <YAxis tick={{ fontSize: 11, fill: "#7C6FAA" }} domain={[0, 100]} />
                    <Tooltip />
                    <Line type="monotone" dataKey="value" stroke="#A78BFA" strokeWidth={2} dot={{ r: 3 }} name="Participation %" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="lila-card">
              <p className="lila-label mb-1">Speaking Turns</p>
              <p className="text-xs mb-3" style={{ color: "#7C6FAA" }}>Number of speaking turns per session</p>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={speakingData}>
                    <XAxis dataKey="session" tick={{ fontSize: 11, fill: "#7C6FAA" }} />
                    <YAxis tick={{ fontSize: 11, fill: "#7C6FAA" }} />
                    <Tooltip />
                    <Bar dataKey="value" fill="#A78BFA" radius={[8, 8, 0, 0]} name="Turns" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="lila-card">
              <p className="lila-label mb-1">Non-Response / Flag Trend</p>
              <p className="text-xs mb-3" style={{ color: withdrawalData.some((d) => d.value > 0) ? "#D97706" : "#7C6FAA" }}>
                {withdrawalData.some((d) => d.value > 0) ? "Flags detected — worth monitoring" : "No flags observed"}
              </p>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={withdrawalData}>
                    <XAxis dataKey="session" tick={{ fontSize: 11, fill: "#7C6FAA" }} />
                    <YAxis tick={{ fontSize: 11, fill: "#7C6FAA" }} domain={[0, 2]} />
                    <Tooltip />
                    <Area type="monotone" dataKey="value" fill="#FDBA74" fillOpacity={0.2} stroke="#FDBA74" strokeWidth={2} name="Flags" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="lila-card">
              <p className="lila-label mb-1">Emotional Tone Trend</p>
              <p className="text-xs mb-3" style={{ color: "#7C6FAA" }}>Tone signal per session</p>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={toneData}>
                    <XAxis dataKey="session" tick={{ fontSize: 11, fill: "#7C6FAA" }} />
                    <YAxis tick={{ fontSize: 11, fill: "#7C6FAA" }} />
                    <Tooltip />
                    <Bar dataKey="positive" stackId="a" fill="#6EE7B7" name="Positive" />
                    <Bar dataKey="neutral" stackId="a" fill="#EDE9FF" name="Neutral" />
                    <Bar dataKey="uncertain" stackId="a" fill="#FDBA74" name="Uncertain" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Session Detail Table */}
          <div className="lila-card mt-6">
            <SectionHeader title="Session History" />
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ borderBottom: "2px solid #EDE9FF" }}>
                    <th className="text-left py-2 px-3 font-bold" style={{ color: "#7C6FAA" }}>Date</th>
                    <th className="text-left py-2 px-3 font-bold" style={{ color: "#7C6FAA" }}>Topic</th>
                    <th className="text-left py-2 px-3 font-bold" style={{ color: "#7C6FAA" }}>Participation</th>
                    <th className="text-left py-2 px-3 font-bold" style={{ color: "#7C6FAA" }}>Turns</th>
                    <th className="text-left py-2 px-3 font-bold" style={{ color: "#7C6FAA" }}>Tone</th>
                    <th className="text-left py-2 px-3 font-bold" style={{ color: "#7C6FAA" }}>Flagged</th>
                  </tr>
                </thead>
                <tbody>
                  {[...records].reverse().map((r) => (
                    <tr key={r.id} style={{ borderBottom: "1px solid #F5F3FF" }}>
                      <td className="py-2 px-3" style={{ color: "#2D1B69" }}>{formatDate(r.session_date)}</td>
                      <td className="py-2 px-3" style={{ color: "#2D1B69" }}>{r.session_topic}</td>
                      <td className="py-2 px-3 font-bold" style={{ color: "#2D1B69" }}>{r.participation_pct}%</td>
                      <td className="py-2 px-3" style={{ color: "#2D1B69" }}>{r.speaking_turns}</td>
                      <td className="py-2 px-3">
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full`} style={{
                          background: r.tone_signal === "positive" ? "#ECFDF5" : r.tone_signal === "uncertain" ? "#FFF7ED" : "#F5F3FF",
                          color: r.tone_signal === "positive" ? "#059669" : r.tone_signal === "uncertain" ? "#D97706" : "#7C6FAA",
                        }}>{r.tone_signal}</span>
                      </td>
                      <td className="py-2 px-3">
                        {r.flagged ? <span className="text-xs font-bold" style={{ color: "#D97706" }}>⚠️ Yes</span> : <span className="text-xs" style={{ color: "#A89DC4" }}>—</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Follow-ups */}
          {followUps.length > 0 && (
            <div className="grid gap-6 md:grid-cols-2 mt-6">
              <div className="lila-card">
                <SectionHeader title="Follow-Up Status" />
                <div className="space-y-3">
                  {followUps.map((f, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <CheckCircle2 className="h-5 w-5 shrink-0" style={{ color: "#FDBA74" }} />
                      <div className="flex-1">
                        <p className="text-sm" style={{ color: "#2D1B69" }}>{f.text}</p>
                        <p className="text-xs" style={{ color: "#A89DC4" }}>{f.date}</p>
                      </div>
                      <span className="text-xs font-bold" style={{ color: "#D97706" }}>{f.status}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </AppShell>
  );
}
