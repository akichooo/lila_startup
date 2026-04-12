import { useState } from "react";
import { FileText, ChevronDown, ChevronUp, BarChart3, LayoutDashboard, Download } from "lucide-react";
import AssessmentCharts from "./AssessmentCharts";

interface WebhookReportViewerProps {
  reportText: string;
  sessionId: string;
  assessmentData?: any;
}

export default function WebhookReportViewer({ reportText, sessionId, assessmentData }: WebhookReportViewerProps) {
  const [overviewExpanded, setOverviewExpanded] = useState(true);
  const [chartsExpanded, setChartsExpanded] = useState(true);
  const [reportExpanded, setReportExpanded] = useState(true);

  const hasAssessment = assessmentData && (assessmentData.session_summary || assessmentData.graphs);

  return (
    <div className="space-y-6 animate-fade-in">

      {/* 1. Session Overview (KPIs + risk summary) */}
      {hasAssessment && assessmentData.session_summary && (
        <Section
          icon={<LayoutDashboard className="h-5 w-5" style={{ color: "#7C3AED" }} />}
          title="Session Overview"
          expanded={overviewExpanded}
          onToggle={() => setOverviewExpanded(!overviewExpanded)}
        >
          <AssessmentCharts data={{ session_summary: assessmentData.session_summary, chart_data: {}, graphs: [] }} />
        </Section>
      )}

      {/* 2. Charts */}
      {hasAssessment && assessmentData.graphs && assessmentData.graphs.length > 0 && (
        <Section
          icon={<BarChart3 className="h-5 w-5" style={{ color: "#7C3AED" }} />}
          title="Session Analytics"
          expanded={chartsExpanded}
          onToggle={() => setChartsExpanded(!chartsExpanded)}
        >
          <AssessmentCharts data={{ chart_data: assessmentData.chart_data, graphs: assessmentData.graphs }} />
        </Section>
      )}

      {/* 3. Agent Report */}
      <Section
        icon={<FileText className="h-5 w-5" style={{ color: "#A78BFA" }} />}
        title="Analysis Report"
        expanded={reportExpanded}
        onToggle={() => setReportExpanded(!reportExpanded)}
      >
        <div
          className="rounded-2xl p-5 space-y-4 text-sm leading-relaxed max-h-[600px] overflow-y-auto"
          style={{
            background: "linear-gradient(135deg, #FAFAFE 0%, #F5F3FF 100%)",
            border: "1.5px solid #EDE9FF",
            color: "#2D1B69",
          }}
        >
          {reportText.split("\n").map((line, i) => {
            const trimmed = line.trim();
            if (!trimmed) return <div key={i} className="h-2" />;

            if (
              /^[A-Z][A-Za-z\s/()–—-]+$/.test(trimmed) &&
              trimmed.length < 80 &&
              !trimmed.startsWith("-")
            ) {
              return (
                <h4 key={i} className="font-bold text-sm pt-2" style={{ color: "#7C3AED" }}>
                  {trimmed}
                </h4>
              );
            }

            if (trimmed.startsWith("- ")) {
              return (
                <div key={i} className="flex gap-2 pl-2">
                  <span style={{ color: "#A78BFA" }}>•</span>
                  <span style={{ color: "#2D1B69" }}>{trimmed.slice(2)}</span>
                </div>
              );
            }

            const formatted = trimmed.replace(
              /\*\*(.+?)\*\*/g,
              '<strong style="color:#7C3AED">$1</strong>'
            );

            return (
              <p
                key={i}
                style={{ color: "#2D1B69" }}
                dangerouslySetInnerHTML={{ __html: formatted }}
              />
            );
          })}
        </div>
      </Section>

      <p className="text-xs italic" style={{ color: "#A89DC4" }}>
        This report was generated automatically and saved for this session.
      </p>
    </div>
  );
}

function Section({ icon, title, expanded, onToggle, children }: {
  icon: React.ReactNode;
  title: string;
  expanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {icon}
          <h3 className="font-extrabold" style={{ color: "#2D1B69" }}>{title}</h3>
        </div>
        <button className="lila-btn-secondary text-xs flex items-center gap-1" onClick={onToggle}>
          {expanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
          {expanded ? "Collapse" : "Expand"}
        </button>
      </div>
      {expanded && children}
    </div>
  );
}
