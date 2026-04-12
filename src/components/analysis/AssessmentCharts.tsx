import { useMemo } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  PieChart, Pie, Cell, Legend,
} from "recharts";
import { AlertTriangle, Users, Clock, MessageSquare } from "lucide-react";

interface StudentMetrics {
  speaker_id: string;
  total_duration_sec: number;
  metrics: {
    engagement: {
      turn_count: number;
      talk_ratio_pct: number;
      avg_words_per_turn: number;
      total_talk_time_sec: number;
    };
    speech_pattern: {
      wpm: number;
      dysfluency_rate: number;
      self_reference_rate: number;
      absolutist_rate: number;
    };
    temporal: {
      long_pause_count: number;
      avg_response_latency_sec: number;
      participation_drop: number;
    };
    content_signals: {
      emotional_word_rate: number;
      negation_rate: number;
      question_rate: number;
      tense_ratio: number;
      vocabulary_diversity: number;
    };
  };
  flags: Record<string, boolean>;
}

interface AssessmentData {
  students: StudentMetrics[];
  transcript?: any[];
  speaker_durations?: Record<string, number>;
  session_duration_sec?: number;
  turn_count_input?: number;
  turn_count_processed?: number;
}

interface AssessmentChartsProps {
  data: AssessmentData;
}

const COLORS = ["#7C3AED", "#FB7185", "#38BDF8", "#FBBF24", "#34D399", "#F472B6", "#A78BFA"];

function shortName(id: string) {
  return id.replace("SPEAKER_", "S");
}

export default function AssessmentCharts({ data }: AssessmentChartsProps) {
  const students = data.students || [];

  const participationData = useMemo(() =>
    students.map((s, i) => ({
      name: shortName(s.speaker_id),
      talkPct: Math.round(s.metrics.engagement.talk_ratio_pct * 10) / 10,
      turns: s.metrics.engagement.turn_count,
      fill: COLORS[i % COLORS.length],
    })),
    [students]
  );

  const speechData = useMemo(() =>
    students.map((s, i) => ({
      name: shortName(s.speaker_id),
      wpm: Math.round(s.metrics.speech_pattern.wpm),
      avgWords: Math.round(s.metrics.engagement.avg_words_per_turn),
      fill: COLORS[i % COLORS.length],
    })),
    [students]
  );

  const pieData = useMemo(() =>
    students.map((s, i) => ({
      name: shortName(s.speaker_id),
      value: Math.round(s.total_duration_sec),
      fill: COLORS[i % COLORS.length],
    })),
    [students]
  );

  const flaggedStudents = useMemo(() =>
    students.filter(s => Object.values(s.flags).some(Boolean)).map(s => ({
      id: s.speaker_id,
      name: shortName(s.speaker_id),
      flags: Object.entries(s.flags).filter(([, v]) => v).map(([k]) =>
        k.replace("flag_", "").replace(/_/g, " ")
      ),
    })),
    [students]
  );

  const vocabData = useMemo(() =>
    students.map((s, i) => ({
      name: shortName(s.speaker_id),
      diversity: Math.round(s.metrics.content_signals.vocabulary_diversity * 100),
      emotionalRate: Math.round(s.metrics.content_signals.emotional_word_rate * 1000) / 10,
      fill: COLORS[i % COLORS.length],
    })),
    [students]
  );

  const sessionDuration = data.session_duration_sec
    ? `${Math.floor(data.session_duration_sec / 60)}m ${Math.round(data.session_duration_sec % 60)}s`
    : null;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Session overview stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard icon={<Users className="h-4 w-4" />} label="Speakers" value={students.length} />
        <StatCard icon={<MessageSquare className="h-4 w-4" />} label="Total Turns" value={data.turn_count_processed || data.turn_count_input || "—"} />
        <StatCard icon={<Clock className="h-4 w-4" />} label="Duration" value={sessionDuration || "—"} />
        <StatCard icon={<AlertTriangle className="h-4 w-4" />} label="Flags" value={flaggedStudents.length} />
      </div>

      {/* Talk time distribution pie */}
      <ChartSection title="Talk Time Distribution">
        <div className="h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%"
                outerRadius={90} innerRadius={40} paddingAngle={2} label={({ name, value }) => `${name} (${value}s)`}>
                {pieData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
              </Pie>
              <Tooltip formatter={(value: number) => `${value}s`} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </ChartSection>

      {/* Participation bar chart */}
      <ChartSection title="Participation Ratio (%)">
        <div className="h-[220px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={participationData} layout="vertical" margin={{ left: 10 }}>
              <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11 }} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={35} />
              <Tooltip formatter={(v: number) => `${v}%`} />
              <Bar dataKey="talkPct" radius={[0, 6, 6, 0]}>
                {participationData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </ChartSection>

      {/* Speaking turns bar chart */}
      <ChartSection title="Speaking Turns">
        <div className="h-[220px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={participationData}>
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="turns" radius={[6, 6, 0, 0]}>
                {participationData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </ChartSection>

      {/* Speech speed */}
      <ChartSection title="Words Per Minute">
        <div className="h-[220px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={speechData}>
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="wpm" radius={[6, 6, 0, 0]}>
                {speechData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </ChartSection>

      {/* Vocabulary diversity */}
      <ChartSection title="Vocabulary Diversity (%)">
        <div className="h-[220px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={vocabData}>
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v: number) => `${v}%`} />
              <Bar dataKey="diversity" radius={[6, 6, 0, 0]}>
                {vocabData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </ChartSection>

      {/* Flags */}
      {flaggedStudents.length > 0 && (
        <ChartSection title="Flagged Observations">
          <div className="space-y-2">
            {flaggedStudents.map((s) => (
              <div key={s.id} className="flex items-start gap-2 rounded-xl p-3"
                style={{ background: "#FEF3C7", border: "1px solid #FDE68A" }}>
                <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" style={{ color: "#D97706" }} />
                <div>
                  <p className="text-sm font-bold" style={{ color: "#92400E" }}>{s.name}</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {s.flags.map((f) => (
                      <span key={f} className="text-xs px-2 py-0.5 rounded-full font-semibold"
                        style={{ background: "#FDE68A", color: "#92400E" }}>{f}</span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ChartSection>
      )}
    </div>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string | number }) {
  return (
    <div className="rounded-2xl p-3 text-center"
      style={{ background: "#F5F3FF", border: "1.5px solid #EDE9FF" }}>
      <div className="flex items-center justify-center gap-1 mb-1" style={{ color: "#7C3AED" }}>{icon}</div>
      <p className="text-lg font-extrabold" style={{ color: "#2D1B69" }}>{value}</p>
      <p className="text-xs" style={{ color: "#7C6FAA" }}>{label}</p>
    </div>
  );
}

function ChartSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl p-4"
      style={{ background: "linear-gradient(135deg, #FAFAFE 0%, #F5F3FF 100%)", border: "1.5px solid #EDE9FF" }}>
      <h4 className="font-bold text-sm mb-3" style={{ color: "#7C3AED" }}>{title}</h4>
      {children}
    </div>
  );
}
