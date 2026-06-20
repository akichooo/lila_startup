import { Link, useParams } from "react-router-dom";
import { AlertCircle, FileText, Upload } from "lucide-react";
import { AppShell } from "@/components/bridge/AppShell";
import AnalysisReportViewer from "@/components/analysis/AnalysisReportViewer";
import { useAnalysis } from "@/contexts/AnalysisContext";

export default function SummaryPage() {
  const { id } = useParams();
  const { sessions, sessionReports, sessionMetrics, loading, dataError } = useAnalysis();
  const session = id ? sessions.find((item) => item.id === id) : sessions[0];
  const report = sessionReports.find((item) => item.session_id === session?.id) || sessionReports[0];
  const reportSession = sessions.find((item) => item.id === report?.session_id) || session;
  const metrics = sessionMetrics.filter((metric) => metric.session_id === reportSession?.id);
  const assessment = report?.report_json?.important_numbers;

  return (
    <AppShell pageTitle="Summary">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="lila-label">Session Summary</p>
            <h1>{reportSession?.session_name || "Observation Report"}</h1>
            <p className="text-sm mt-2 max-w-2xl" style={{ color: "#7C6FAA" }}>
              Stored report and metrics from Supabase. This summary reflects in-session interaction patterns only and requires teacher review.
            </p>
          </div>
          <Link to="/upload" className="lila-btn-primary inline-flex items-center gap-2">
            <Upload className="h-4 w-4" />
            Analyze Audio
          </Link>
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
            <AnalysisReportViewer reportText={report.report_text} sessionId={reportSession.id} assessmentData={assessment} />
          </>
        )}
      </div>
    </AppShell>
  );
}

function SummaryCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="lila-stat-card">
      <p className="text-xl font-extrabold truncate" style={{ color: "#2D1B69" }}>{value}</p>
      <p className="text-sm" style={{ color: "#7C6FAA" }}>{label}</p>
    </div>
  );
}
