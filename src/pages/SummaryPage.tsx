import { Link, useParams } from "react-router-dom";
import { AlertCircle, Download, FileText, Share2, Upload } from "lucide-react";
import { AppShell } from "@/components/bridge/AppShell";
import { SectionHeader, StudentAvatar } from "@/components/bridge/SharedComponents";
import AnalysisReportViewer from "@/components/analysis/AnalysisReportViewer";
import { useAnalysis } from "@/contexts/AnalysisContext";

const GRADIENTS = [
  "linear-gradient(135deg, #FB7185, #FDBA74)",
  "linear-gradient(135deg, #7DD3FC, #A78BFA)",
  "linear-gradient(135deg, #A78BFA, #C4B5FD)",
  "linear-gradient(135deg, #FCD34D, #FDBA74)",
  "linear-gradient(135deg, #6EE7B7, #7DD3FC)",
];

const AVATAR_COLORS = ["#A78BFA", "#FB7185", "#38BDF8", "#FBBF24", "#34D399"];

export default function SummaryPage() {
  const { id } = useParams();
  const { groups, sessions, sessionReports, sessionMetrics, loading, dataError } = useAnalysis();
  const session = id ? sessions.find((item) => item.id === id) : sessions[0];
  const report = sessionReports.find((item) => item.session_id === session?.id) || sessionReports[0];
  const reportSession = sessions.find((item) => item.id === report?.session_id) || session;
  const group = groups.find((item) => item.id === reportSession?.group_id);
  const metrics = sessionMetrics.filter((metric) => metric.session_id === reportSession?.id);
  const assessment = report?.report_json?.important_numbers;
  const reportIntro = extractReportIntro(report?.report_text || "");

  return (
    <AppShell pageTitle="Summary">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="lila-card p-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3 text-sm">
            <span className="font-bold" style={{ color: "#2D1B69" }}>{reportSession?.session_name || "Observation Report"}</span>
            <span style={{ color: "#EDE9FF" }}>|</span>
            <span style={{ color: "#7C6FAA" }}>{group?.name || "Unassigned group"}</span>
            <span style={{ color: "#EDE9FF" }}>|</span>
            <span style={{ color: "#7C6FAA" }}>{formatDate(reportSession?.processed_at || reportSession?.created_at)}</span>
            <span style={{ color: "#EDE9FF" }}>|</span>
            <span style={{ color: "#7C6FAA" }}>{metrics.length} speaker rows</span>
            <span className="lila-badge-green ml-2">Summary Ready</span>
          </div>
          <div className="flex flex-wrap gap-2">
            <button className="lila-btn-secondary text-xs !py-1.5 !px-4 flex items-center gap-1">
              <Download className="h-4 w-4" />
              Export
            </button>
            <button className="lila-btn-secondary text-xs !py-1.5 !px-4 flex items-center gap-1">
              <Share2 className="h-4 w-4" />
              Share
            </button>
            <Link to="/upload" className="lila-btn-primary text-xs !py-1.5 !px-4 inline-flex items-center gap-1">
              <Upload className="h-4 w-4" />
              Analyze Audio
            </Link>
          </div>
        </div>

        {dataError && (
          <div className="rounded-2xl p-4 flex gap-3" style={{ background: "#FEF2F2", border: "1.5px solid #FECACA" }}>
            <AlertCircle className="h-5 w-5 text-red-600" />
            <p className="text-sm text-red-700">{dataError}</p>
          </div>
        )}

        {!loading && !report && (
          <div className="lila-card-elevated text-center">
            <FileText className="h-10 w-10 mx-auto mb-3" style={{ color: "#7C3AED" }} />
            <h2>No reports yet</h2>
            <p className="text-sm mt-2" style={{ color: "#7C6FAA" }}>
              Upload or record audio to generate a session report.
            </p>
          </div>
        )}

        {report && reportSession && (
          <>
            <div className="grid gap-4 md:grid-cols-4">
              <SummaryCard label="Topic" value={reportSession.topic || "General discussion"} />
              <SummaryCard label="Metric Rows" value={metrics.length} />
              <SummaryCard label="Speaking Turns" value={metrics.reduce((sum, metric) => sum + metric.speaking_turns, 0)} />
              <SummaryCard label="Review Flags" value={metrics.reduce((sum, metric) => sum + metric.observation_flags.length, 0)} />
            </div>

            <div className="lila-card">
              <p className="lila-label mb-3">Lila-Generated Observational Summary — Requires Teacher Review</p>
              <p className="text-sm leading-relaxed" style={{ color: "#2D1B69" }}>{reportIntro}</p>
              <p className="text-xs mt-3 italic" style={{ color: "#A89DC4" }}>
                This summary reflects in-session interaction patterns only. It is not a psychological assessment, mental-health assessment, or diagnostic report.
              </p>
            </div>

            {metrics.length > 0 && (
              <div>
                <SectionHeader title="Student-by-Student Participation" />
                <div className="grid gap-4 sm:grid-cols-2">
                  {metrics.map((metric, index) => (
                    <div key={metric.id} className="lila-card p-5 relative overflow-hidden">
                      <div className="h-1 absolute top-0 left-0 right-0" style={{ background: GRADIENTS[index % GRADIENTS.length] }} />
                      <div className="flex items-center gap-3 mb-3 pt-1">
                        <StudentAvatar initials={initials(metric.student_name || metric.display_name || metric.speaker_label)} color={AVATAR_COLORS[index % AVATAR_COLORS.length]} size="lg" />
                        <div>
                          <p className="font-bold" style={{ color: "#2D1B69" }}>{metric.student_name || metric.display_name || metric.speaker_label}</p>
                          <p className="text-xs" style={{ color: "#7C6FAA" }}>{group?.name || metric.speaker_label}</p>
                        </div>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center justify-between">
                          <span style={{ color: "#7C6FAA" }}>Speaking turns</span>
                          <span className="font-bold" style={{ color: "#2D1B69" }}>{metric.speaking_turns} ({metric.participation_pct.toFixed(1)}%)</span>
                        </div>
                        <div className="h-2 rounded-full overflow-hidden" style={{ background: "#EDE9FF" }}>
                          <div className="h-full rounded-full" style={{ width: `${Math.min(100, metric.participation_pct)}%`, background: "linear-gradient(90deg, #A78BFA, #FB7185)" }} />
                        </div>
                        <div className="flex items-center justify-between">
                          <span style={{ color: "#7C6FAA" }}>Tone-register wording</span>
                          <span className={metric.tone_register === "positive" ? "lila-badge-green" : metric.tone_register === "uncertain" ? "lila-badge-amber" : "lila-badge-purple"}>{metric.tone_register}</span>
                        </div>
                        <p className="text-xs" style={{ color: "#7C6FAA" }}>
                          {metric.questions_asked} questions, {metric.interruptions} close-start turns, {metric.words_per_turn.toFixed(1)} words per turn.
                        </p>
                        <p className="text-xs font-bold" style={{ color: metric.observation_flags.length ? "#D97706" : "#059669" }}>
                          {metric.observation_flags.join(", ") || "No automated review flags"}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <AnalysisReportViewer reportText={report.report_text} sessionId={reportSession.id} assessmentData={assessment} />
          </>
        )}
      </div>
    </AppShell>
  );
}

function extractReportIntro(reportText: string) {
  const lines = reportText.split("\n").map((line) => line.trim()).filter(Boolean);
  const overviewIndex = lines.findIndex((line) => line === "Session Overview");
  if (overviewIndex >= 0) {
    return lines.slice(overviewIndex + 1, overviewIndex + 3).join(" ");
  }
  return lines.find((line) => line.length > 80) || "Stored report and metrics are available for teacher review.";
}

function initials(name: string) {
  const parts = name.split(/\s+/).filter(Boolean);
  return parts.slice(0, 2).map((part) => part[0]?.toUpperCase()).join("") || "S";
}

function formatDate(value?: string | null) {
  if (!value) return "No date";
  return new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function SummaryCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="lila-stat-card">
      <p className="text-xl font-extrabold truncate" style={{ color: "#2D1B69" }}>{value}</p>
      <p className="text-sm" style={{ color: "#7C6FAA" }}>{label}</p>
    </div>
  );
}
