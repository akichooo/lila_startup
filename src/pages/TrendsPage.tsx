import { useEffect, useMemo, useState } from "react";
import { AlertCircle, LineChart as LineIcon } from "lucide-react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { AppShell } from "@/components/bridge/AppShell";
import { useAnalysis } from "@/contexts/AnalysisContext";

const toneScore: Record<string, number> = { uncertain: -1, neutral: 0, positive: 1 };
const toneLabel: Record<number, string> = { [-1]: "uncertain", 0: "neutral", 1: "positive" };

export default function TrendsPage() {
  const { students, groups, studentRecords, sessionMetrics, sessions, loading, dataError } = useAnalysis();
  const studentsWithRecords = useMemo(
    () => students.filter((student) => studentRecords.some((record) => record.student_id === student.id)),
    [students, studentRecords],
  );
  const [selectedStudentId, setSelectedStudentId] = useState("");

  useEffect(() => {
    if (!selectedStudentId && studentsWithRecords.length > 0) {
      setSelectedStudentId(studentsWithRecords[0].id);
    }
  }, [selectedStudentId, studentsWithRecords]);

  const selectedStudent = students.find((student) => student.id === selectedStudentId) || studentsWithRecords[0];
  const selectedGroup = groups.find((group) => group.students.some((student) => student.id === selectedStudent?.id));
  const records = studentRecords.filter((record) => record.student_id === selectedStudent?.id);
  const metricRows = sessionMetrics.filter((metric) => metric.student_id === selectedStudent?.id);

  const chartRows = records.map((record, index) => ({
    index: index + 1,
    label: new Date(record.session_date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    topic: record.session_topic,
    speaking_turns: record.speaking_turns,
    participation_pct: record.participation_pct,
    tone_score: toneScore[record.tone_signal] ?? 0,
    tone_signal: record.tone_signal,
  }));

  const avgParticipation = average(chartRows.map((row) => row.participation_pct));
  const avgTurns = average(chartRows.map((row) => row.speaking_turns));
  const latestMetric = metricRows[metricRows.length - 1];
  const latestSession = sessions.find((session) => session.id === latestMetric?.session_id);

  return (
    <AppShell pageTitle="Student Trends">
      <div className="space-y-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="lila-label">Student Trends</p>
            <h1>Participation Over Time</h1>
            <p className="text-sm mt-2 max-w-2xl" style={{ color: "#7C6FAA" }}>
              Trends are built from persisted `session_metrics` rows. They are observational signals requiring teacher review.
            </p>
          </div>
          <select
            value={selectedStudent?.id || ""}
            onChange={(event) => setSelectedStudentId(event.target.value)}
            className="rounded-2xl border px-4 py-3 bg-white min-w-[240px]"
            style={{ borderColor: "#EDE9FF", color: "#2D1B69" }}
            disabled={studentsWithRecords.length === 0}
          >
            {studentsWithRecords.map((student) => (
              <option key={student.id} value={student.id}>
                {student.name}
              </option>
            ))}
          </select>
        </div>

        {dataError && (
          <div className="rounded-2xl p-4 flex gap-3" style={{ background: "#FEF2F2", border: "1.5px solid #FECACA" }}>
            <AlertCircle className="h-5 w-5 text-red-600" />
            <p className="text-sm text-red-700">{dataError}</p>
          </div>
        )}

        {!loading && !selectedStudent && (
          <div className="lila-card-elevated text-center">
            <LineIcon className="h-10 w-10 mx-auto mb-3" style={{ color: "#7C3AED" }} />
            <h2>No trend data yet</h2>
            <p className="text-sm mt-2" style={{ color: "#7C6FAA" }}>
              Upload and analyze sessions, then map speaker labels to students to populate trends.
            </p>
          </div>
        )}

        {selectedStudent && (
          <>
            <div className="grid gap-4 md:grid-cols-4">
              <MetricCard label="Student" value={selectedStudent.name} />
              <MetricCard label="Group" value={selectedGroup?.name || "Unassigned"} />
              <MetricCard label="Sessions" value={records.length} />
              <MetricCard label="Avg Participation" value={`${avgParticipation.toFixed(1)}%`} />
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <TrendCard title="Participation Share" rows={chartRows} yKey="participation_pct" yLabel="Percent" />
              <TrendCard title="Speaking Turns" rows={chartRows} yKey="speaking_turns" yLabel="Turns" />
            </div>

            <div className="grid gap-6 lg:grid-cols-[1fr_0.8fr]">
              <section className="lila-card-elevated">
                <h2 className="text-xl mb-4">Tone-Register Trend</h2>
                <div className="h-[260px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartRows}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#EDE9FF" />
                      <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                      <YAxis domain={[-1, 1]} ticks={[-1, 0, 1]} tickFormatter={(value) => toneLabel[value] || ""} tick={{ fontSize: 12 }} />
                      <Tooltip formatter={(value: number) => toneLabel[value] || value} labelFormatter={(label) => `Session ${label}`} />
                      <Line type="monotone" dataKey="tone_score" stroke="#7C3AED" strokeWidth={3} dot={{ r: 5 }} connectNulls />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </section>

              <section className="lila-card-elevated">
                <h2 className="text-xl mb-4">Latest Session</h2>
                {latestMetric ? (
                  <div className="space-y-3 text-sm" style={{ color: "#2D1B69" }}>
                    <p><strong>Session:</strong> {latestSession?.session_name || "Session"}</p>
                    <p><strong>Speaking turns:</strong> {latestMetric.speaking_turns}</p>
                    <p><strong>Words per turn:</strong> {latestMetric.words_per_turn.toFixed(1)}</p>
                    <p><strong>Questions asked:</strong> {latestMetric.questions_asked}</p>
                    <p><strong>Topic overlap:</strong> {latestMetric.topic_relevance.toFixed(2)}</p>
                    <p><strong>Teacher review flags:</strong> {latestMetric.observation_flags.join(", ") || "none"}</p>
                  </div>
                ) : (
                  <p className="text-sm" style={{ color: "#7C6FAA" }}>No session metrics for this student yet.</p>
                )}
              </section>
            </div>

            <div className="rounded-2xl p-4 text-sm" style={{ background: "#F5F3FF", border: "1.5px solid #EDE9FF", color: "#7C6FAA" }}>
              All trends shown here reflect observational participation signals from Lila-facilitated sessions. They do not constitute a psychological, behavioral, or diagnostic assessment. Teacher judgment is required for any decisions or actions.
            </div>
          </>
        )}
      </div>
    </AppShell>
  );
}

function TrendCard({ title, rows, yKey, yLabel }: { title: string; rows: any[]; yKey: string; yLabel: string }) {
  return (
    <section className="lila-card-elevated">
      <h2 className="text-xl mb-4">{title}</h2>
      <div className="h-[260px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={rows}>
            <CartesianGrid strokeDasharray="3 3" stroke="#EDE9FF" />
            <XAxis dataKey="label" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} label={{ value: yLabel, angle: -90, position: "insideLeft", style: { fontSize: 11 } }} />
            <Tooltip labelFormatter={(label) => `Session ${label}`} />
            <Line type="monotone" dataKey={yKey} stroke="#7C3AED" strokeWidth={3} dot={{ r: 5 }} connectNulls />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}

function MetricCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="lila-stat-card">
      <p className="text-2xl font-extrabold truncate" style={{ color: "#2D1B69" }}>{value}</p>
      <p className="text-sm" style={{ color: "#7C6FAA" }}>{label}</p>
    </div>
  );
}

function average(values: number[]) {
  if (values.length === 0) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}
