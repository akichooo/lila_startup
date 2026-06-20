import { useMemo, useState } from "react";
import { BarChart3, ChevronDown, ChevronUp, Download, FileText, LayoutDashboard, Save, Users } from "lucide-react";
import AssessmentCharts from "./AssessmentCharts";
import { useAnalysis } from "@/contexts/AnalysisContext";

interface AnalysisReportViewerProps {
  reportText: string;
  sessionId: string;
  assessmentData?: any;
}

export default function AnalysisReportViewer({ reportText, sessionId, assessmentData }: AnalysisReportViewerProps) {
  const { groups, sessions, saveSpeakerMappings } = useAnalysis();
  const [overviewExpanded, setOverviewExpanded] = useState(true);
  const [chartsExpanded, setChartsExpanded] = useState(true);
  const [mappingExpanded, setMappingExpanded] = useState(true);
  const [reportExpanded, setReportExpanded] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const session = sessions.find((item) => item.id === sessionId);
  const group = groups.find((item) => item.id === session?.group_id);
  const speakerRows = useMemo(() => assessmentData?.chart_data?.speakers_overview || [], [assessmentData]);
  const initialMappings = useMemo(() => {
    const values: Record<string, string> = {};
    speakerRows.forEach((row: any) => {
      if (row.speaker_id && row.student_id) values[row.speaker_id] = row.student_id;
    });
    return values;
  }, [speakerRows]);
  const [mappings, setMappings] = useState<Record<string, string>>(initialMappings);
  const hasAssessment = assessmentData && (assessmentData.session_summary || assessmentData.graphs);

  const saveMappings = async () => {
    setSaving(true);
    setMessage("");
    try {
      await saveSpeakerMappings(sessionId, mappings);
      setMessage("Speaker labels saved.");
    } catch (error: any) {
      setMessage(error?.message || "Unable to save speaker labels.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
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

      {hasAssessment && assessmentData.graphs?.length > 0 && (
        <Section
          icon={<BarChart3 className="h-5 w-5" style={{ color: "#7C3AED" }} />}
          title="Session Analytics"
          expanded={chartsExpanded}
          onToggle={() => setChartsExpanded(!chartsExpanded)}
        >
          <AssessmentCharts data={{ chart_data: assessmentData.chart_data, graphs: assessmentData.graphs }} />
        </Section>
      )}

      {speakerRows.length > 0 && group && (
        <Section
          icon={<Users className="h-5 w-5" style={{ color: "#7C3AED" }} />}
          title="Speaker Labels"
          expanded={mappingExpanded}
          onToggle={() => setMappingExpanded(!mappingExpanded)}
        >
          <div className="rounded-2xl p-4 space-y-3" style={{ background: "#FAFAFE", border: "1.5px solid #EDE9FF" }}>
            <div className="grid gap-3 md:grid-cols-2">
              {speakerRows.map((row: any) => (
                <label key={row.speaker_id} className="space-y-1">
                  <span className="block text-xs font-bold uppercase tracking-wide" style={{ color: "#7C6FAA" }}>
                    {row.speaker_id}
                  </span>
                  <select
                    className="w-full rounded-xl border px-3 py-2 text-sm bg-white"
                    style={{ borderColor: "#EDE9FF", color: "#2D1B69" }}
                    value={mappings[row.speaker_id] || ""}
                    onChange={(event) => setMappings((prev) => ({ ...prev, [row.speaker_id]: event.target.value }))}
                  >
                    <option value="">Keep as {row.speaker_id}</option>
                    {group.students.map((student) => (
                      <option key={student.id} value={student.id}>
                        {student.name}
                      </option>
                    ))}
                  </select>
                </label>
              ))}
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={saveMappings}
                disabled={saving}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all disabled:opacity-60"
                style={{ background: "#7C3AED", color: "#fff" }}
              >
                <Save className="h-4 w-4" />
                {saving ? "Saving..." : "Save Labels"}
              </button>
              {message && <span className="text-xs" style={{ color: message.includes("Unable") ? "#DC2626" : "#059669" }}>{message}</span>}
            </div>
          </div>
        </Section>
      )}

      <Section
        icon={<FileText className="h-5 w-5" style={{ color: "#A78BFA" }} />}
        title="Observation Report"
        expanded={reportExpanded}
        onToggle={() => setReportExpanded(!reportExpanded)}
      >
        <div
          className="rounded-2xl p-5 space-y-3 text-sm leading-relaxed max-h-[600px] overflow-y-auto"
          style={{
            background: "linear-gradient(135deg, #FAFAFE 0%, #F5F3FF 100%)",
            border: "1.5px solid #EDE9FF",
            color: "#2D1B69",
          }}
        >
          {renderReportLines(reportText)}
        </div>
      </Section>

      <div className="flex items-center justify-between gap-3">
        <p className="text-xs italic" style={{ color: "#A89DC4" }}>
          This report was generated automatically and saved for this session. Teacher review is required.
        </p>
        <button
          onClick={() => {
            const blob = new Blob([reportText], { type: "text/plain" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `session-report-${sessionId}.txt`;
            a.click();
            URL.revokeObjectURL(url);
          }}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all hover:scale-105"
          style={{ background: "linear-gradient(135deg, #7C3AED, #A78BFA)", color: "#fff" }}
        >
          <Download className="h-4 w-4" />
          Download
        </button>
      </div>
    </div>
  );
}

function renderReportLines(reportText: string) {
  return reportText.split("\n").map((line, index) => {
    const trimmed = line.trim();
    if (!trimmed) return <div key={index} className="h-2" />;
    if (/^[A-Z][A-Za-z\s-]+$/.test(trimmed) && trimmed.length < 80 && !trimmed.startsWith("-")) {
      return (
        <h4 key={index} className="font-bold text-sm pt-2" style={{ color: "#7C3AED" }}>
          {trimmed}
        </h4>
      );
    }
    if (trimmed.startsWith("- ")) {
      return (
        <div key={index} className="flex gap-2 pl-2">
          <span style={{ color: "#A78BFA" }}>•</span>
          <span>{trimmed.slice(2)}</span>
        </div>
      );
    }
    return <p key={index}>{trimmed}</p>;
  });
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
      <div className="flex items-center justify-between gap-3">
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
