import { Link } from "react-router-dom";
import { AlertCircle, Calendar, CheckCircle2, ClipboardList, Clock, Database, LineChart, Plus, Users } from "lucide-react";
import { AppShell } from "@/components/bridge/AppShell";
import { InfoTooltip, StatCard as SharedStatCard } from "@/components/bridge/SharedComponents";
import { useAnalysis } from "@/contexts/AnalysisContext";

const GRADIENTS = [
  "linear-gradient(135deg, #A78BFA, #C4B5FD)",
  "linear-gradient(135deg, #6EE7B7, #7DD3FC)",
  "linear-gradient(135deg, #FDBA74, #FCD34D)",
  "linear-gradient(135deg, #FB7185, #FDBA74)",
];

export default function DashboardPage() {
  const { groups, sessions, sessionMetrics, followUps, loading, dataError, updateFollowUpStatus } = useAnalysis();
  const processedSessions = sessions.filter((session) => session.analysis_status === "processed" || session.status === "processed");
  const pendingFollowUps = followUps.filter((item) => item.status === "pending");
  const activeStudents = new Set(sessionMetrics.map((metric) => metric.student_id).filter(Boolean)).size;
  const totalTurns = sessionMetrics.reduce((sum, metric) => sum + metric.speaking_turns, 0);
  const flaggedMetrics = sessionMetrics.filter((metric) => metric.observation_flags.length > 0);

  return (
    <AppShell pageTitle="Dashboard">
      <div className="space-y-8">
        <div className="rounded-3xl p-8 relative overflow-hidden" style={{ background: "linear-gradient(135deg, #EDE9FF 0%, #FCE7F3 50%, #E0F2FE 100%)" }}>
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="lila-label">Teacher Dashboard</p>
              <h1>Classroom Discussion Signals</h1>
              <p className="mt-2 max-w-2xl" style={{ color: "#7C6FAA" }}>
                {processedSessions.length} processed summaries, {pendingFollowUps.length} pending follow-ups, and longitudinal metrics saved in Supabase.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link to="/upload" className="lila-btn-secondary inline-flex items-center gap-2 text-sm !py-2.5 !px-5">
                <Database className="h-4 w-4" />
                Upload Audio
              </Link>
              <Link to="/sessions/create" className="lila-btn-primary inline-flex items-center gap-2 text-sm !py-2.5 !px-5">
                <Plus className="h-4 w-4" />
                New Session
              </Link>
            </div>
          </div>
          <div className="absolute top-5 right-32 h-8 w-8 rounded-full opacity-30" style={{ background: "#A78BFA" }} />
          <div className="absolute bottom-5 left-28 h-5 w-5 rounded-full opacity-25" style={{ background: "#FB7185" }} />
        </div>

        {dataError && (
          <div className="rounded-2xl p-4 flex gap-3" style={{ background: "#FEF2F2", border: "1.5px solid #FECACA" }}>
            <AlertCircle className="h-5 w-5 text-red-600" />
            <p className="text-sm text-red-700">{dataError}</p>
          </div>
        )}

        <div className="grid gap-4 md:grid-cols-4">
          <SharedStatCard title="Processed Sessions" value={loading ? "..." : processedSessions.length} subtitle="Saved session reports" gradientBar={GRADIENTS[0]} icon={<Calendar className="h-5 w-5" />} />
          <SharedStatCard title="Students with Metrics" value={loading ? "..." : activeStudents} subtitle="Mapped across sessions" gradientBar={GRADIENTS[1]} icon={<Users className="h-5 w-5" />} />
          <SharedStatCard title="Speaking Turns" value={loading ? "..." : totalTurns} subtitle="Processed transcript turns" gradientBar={GRADIENTS[2]} icon={<LineChart className="h-5 w-5" />} />
          <SharedStatCard
            title="Pending Follow-Ups"
            value={loading ? "..." : pendingFollowUps.length}
            subtitle="Teacher review queue"
            gradientBar={GRADIENTS[3]}
            icon={<ClipboardList className="h-5 w-5" />}
            badge={<span className="lila-badge-amber">{pendingFollowUps.length}</span>}
          />
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <section className="lila-card-elevated">
            <SectionHeader title="Recent Sessions" />
            <div className="space-y-3">
              {sessions.slice(0, 6).map((session) => {
                const group = groups.find((item) => item.id === session.group_id);
                const metrics = sessionMetrics.filter((metric) => metric.session_id === session.id);
                return (
                  <Link
                    key={session.id}
                    to={`/summary/${session.id}`}
                    className="block rounded-2xl p-4 transition-all hover:scale-[1.01]"
                    style={{ background: "#FAFAFE", border: "1.5px solid #EDE9FF" }}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="text-base font-extrabold" style={{ color: "#2D1B69" }}>{session.session_name}</h3>
                        <p className="text-sm" style={{ color: "#7C6FAA" }}>{group?.name || "Unassigned group"} • {session.topic || "General discussion"}</p>
                      </div>
                      <span className="lila-badge-purple">{session.analysis_status || session.status}</span>
                    </div>
                    <div className="flex flex-wrap gap-3 mt-3 text-xs" style={{ color: "#7C6FAA" }}>
                      <span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" />{formatDate(session.created_at)}</span>
                      <span>{metrics.length} metric rows</span>
                      <span>{metrics.reduce((sum, metric) => sum + metric.speaking_turns, 0)} turns</span>
                    </div>
                  </Link>
                );
              })}
              {!loading && sessions.length === 0 && <EmptyState text="No sessions found yet. Upload audio to create the first one." />}
            </div>
          </section>

          <section className="lila-card-elevated">
            <SectionHeader title="Follow-ups" />
            <div className="space-y-3">
              {followUps.slice(0, 8).map((item) => (
                <div key={item.id} className="rounded-2xl p-4" style={{ background: "#FAFAFE", border: "1.5px solid #EDE9FF" }}>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-sm font-extrabold" style={{ color: "#2D1B69" }}>{item.title}</h3>
                      {item.body && <p className="text-xs mt-1" style={{ color: "#7C6FAA" }}>{item.body}</p>}
                    </div>
                    <button
                      onClick={() => updateFollowUpStatus(item.id, item.status === "pending" ? "done" : "pending")}
                      className="rounded-full p-2"
                      style={{ background: item.status === "done" ? "#D1FAE5" : "#FEF3C7", color: item.status === "done" ? "#059669" : "#92400E" }}
                      aria-label="Toggle follow-up status"
                    >
                      <CheckCircle2 className="h-4 w-4" />
                    </button>
                  </div>
                  <span className={item.status === "done" ? "lila-badge-green mt-3" : "lila-badge-amber mt-3"}>
                    {item.status}
                  </span>
                </div>
              ))}
              {!loading && followUps.length === 0 && <EmptyState text="No follow-ups have been generated." />}
            </div>
          </section>
        </div>

        <section className="lila-card-elevated">
          <SectionHeader title={<span className="flex items-center">Observational Signals Requiring Review <InfoTooltip text="These are transcript and timing patterns from the backend. They are not mental-health findings or diagnoses." /></span>} />
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {flaggedMetrics.slice(0, 9).map((metric) => {
              const session = sessions.find((item) => item.id === metric.session_id);
              return (
                <div key={metric.id} className="rounded-2xl p-4" style={{ background: "#FFF7ED", border: "1.5px solid #FDBA74" }}>
                  <p className="text-xs font-bold uppercase" style={{ color: "#D97706" }}>{metric.observation_flags.join(", ")}</p>
                  <h3 className="text-base font-extrabold mt-1" style={{ color: "#2D1B69" }}>{metric.student_name || metric.speaker_label}</h3>
                  <p className="text-xs mt-1" style={{ color: "#7C6FAA" }}>{session?.session_name || "Session"} • {metric.speaking_turns} turns • {metric.participation_pct.toFixed(1)}% speaking time</p>
                </div>
              );
            })}
            {!loading && flaggedMetrics.length === 0 && <EmptyState text="No observation flags in the current data." />}
          </div>
        </section>
      </div>
    </AppShell>
  );
}

function SectionHeader({ title }: { title: React.ReactNode }) {
  return (
    <div className="lila-section-header">
      <h2 className="text-xl">{title}</h2>
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return <p className="text-sm rounded-2xl p-4" style={{ color: "#7C6FAA", background: "#FAFAFE" }}>{text}</p>;
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}
