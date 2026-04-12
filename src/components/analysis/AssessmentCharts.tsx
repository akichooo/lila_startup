import { useMemo } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  Cell, Legend,
} from "recharts";

interface GraphDef {
  id: string;
  title: string;
  type: "bar" | "grouped_bar" | "heatmap";
  data_key: string;
  x: string;
  y?: string;
  series?: string[];
  y_label?: string;
}

interface AssessmentData {
  session_summary?: {
    session_duration_sec?: number;
    total_measured_speaking_sec?: number;
    speaker_count?: number;
    active_speakers?: number;
    turn_count_input?: number;
    turn_count_processed?: number;
    most_talkative_speaker?: string;
    least_talkative_speaker?: string;
    fastest_speaker?: string;
    highest_participation_drop_speaker?: string;
    flag_counts?: Record<string, number>;
  };
  chart_data?: Record<string, any[]>;
  graphs?: GraphDef[];
}

interface Props {
  data: AssessmentData;
}

const COLORS = ["#7C3AED", "#FB7185", "#38BDF8", "#FBBF24", "#34D399", "#F472B6", "#A78BFA", "#F97316"];
const SERIES_COLORS = ["#7C3AED", "#FB7185", "#38BDF8", "#FBBF24", "#34D399", "#F472B6", "#A78BFA", "#F97316"];

function shortName(id: string) {
  return id?.replace("SPEAKER_", "S") || id;
}

function formatDuration(sec: number) {
  const m = Math.floor(sec / 60);
  const s = Math.round(sec % 60);
  return `${m}m ${s}s`;
}

function formatFlagName(key: string) {
  return key.replace("flag_", "").replace(/_/g, " ");
}

export default function AssessmentCharts({ data }: Props) {
  const summary = data.session_summary;
  const chartData = data.chart_data || {};
  const graphs = data.graphs || [];

  const flagCounts = summary?.flag_counts || {};
  const totalFlags = Object.values(flagCounts).reduce((a, b) => a + b, 0);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Session Summary KPIs */}
      {summary && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <KpiCard label="Duration" value={summary.session_duration_sec ? formatDuration(summary.session_duration_sec) : "—"} />
            <KpiCard label="Speakers" value={summary.speaker_count ?? summary.active_speakers ?? "—"} />
            <KpiCard label="Turns Processed" value={summary.turn_count_processed ?? "—"} />
            <KpiCard label="Total Flags" value={totalFlags} />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {summary.most_talkative_speaker && (
              <KpiCard label="Most Talkative" value={shortName(summary.most_talkative_speaker)} />
            )}
            {summary.least_talkative_speaker && (
              <KpiCard label="Least Talkative" value={shortName(summary.least_talkative_speaker)} />
            )}
            {summary.fastest_speaker && (
              <KpiCard label="Fastest Speaker" value={shortName(summary.fastest_speaker)} />
            )}
            {summary.highest_participation_drop_speaker && (
              <KpiCard label="Biggest Drop" value={shortName(summary.highest_participation_drop_speaker)} />
            )}
          </div>

          {/* Risk flag summary */}
          {totalFlags > 0 && (
            <div className="rounded-2xl p-4" style={{ background: "#FEF3C7", border: "1.5px solid #FDE68A" }}>
              <h4 className="font-bold text-sm mb-2" style={{ color: "#92400E" }}>Risk Flag Summary</h4>
              <div className="flex flex-wrap gap-2">
                {Object.entries(flagCounts)
                  .filter(([, v]) => v > 0)
                  .map(([key, count]) => (
                    <span key={key} className="text-xs px-2.5 py-1 rounded-full font-semibold"
                      style={{ background: "#FDE68A", color: "#92400E" }}>
                      {formatFlagName(key)}: {count}
                    </span>
                  ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Dynamic Charts from graphs array */}
      {graphs.map((graph) => {
        const rawData = chartData[graph.data_key];
        if (!rawData || rawData.length === 0) return null;

        // Transform x field to short name
        const rows = rawData.map((r: any, i: number) => ({
          ...r,
          _label: shortName(r[graph.x]),
          _fill: COLORS[i % COLORS.length],
        }));

        if (graph.type === "heatmap") {
          return <HeatmapChart key={graph.id} graph={graph} rows={rows} />;
        }

        if (graph.type === "grouped_bar" && graph.series && graph.series.length > 1) {
          return <GroupedBarChart key={graph.id} graph={graph} rows={rows} />;
        }

        // Simple bar
        return <SimpleBarChart key={graph.id} graph={graph} rows={rows} />;
      })}
    </div>
  );
}

/* ─── Sub-components ─── */

function KpiCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-2xl p-3 text-center"
      style={{ background: "#F5F3FF", border: "1.5px solid #EDE9FF" }}>
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

function SimpleBarChart({ graph, rows }: { graph: any; rows: any[] }) {
  const yKey = graph.y || (graph.series?.[0]);
  if (!yKey) return null;

  return (
    <ChartSection title={graph.title}>
      <div className="h-[240px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={rows} margin={{ left: 5, right: 5 }}>
            <XAxis dataKey="_label" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} label={graph.y_label ? { value: graph.y_label, angle: -90, position: "insideLeft", style: { fontSize: 10 } } : undefined} />
            <Tooltip
              formatter={(v: number) => typeof v === "number" ? v.toFixed(2) : v}
              labelFormatter={(l) => `Speaker ${l}`}
            />
            <Bar dataKey={yKey} radius={[6, 6, 0, 0]}>
              {rows.map((entry: any, i: number) => <Cell key={i} fill={entry._fill} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </ChartSection>
  );
}

function GroupedBarChart({ graph, rows }: { graph: any; rows: any[] }) {
  return (
    <ChartSection title={graph.title}>
      <div className="h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={rows} margin={{ left: 5, right: 5 }}>
            <XAxis dataKey="_label" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} label={graph.y_label ? { value: graph.y_label, angle: -90, position: "insideLeft", style: { fontSize: 10 } } : undefined} />
            <Tooltip formatter={(v: number) => typeof v === "number" ? v.toFixed(4) : v} />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            {graph.series.map((s: string, i: number) => (
              <Bar key={s} dataKey={s} fill={SERIES_COLORS[i % SERIES_COLORS.length]} radius={[4, 4, 0, 0]} />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </ChartSection>
  );
}

function HeatmapChart({ graph, rows }: { graph: any; rows: any[] }) {
  const series = graph.series || [];

  return (
    <ChartSection title={graph.title}>
      <div className="overflow-x-auto">
        <table className="w-full text-xs border-collapse">
          <thead>
            <tr>
              <th className="text-left p-2 font-bold" style={{ color: "#2D1B69" }}>Speaker</th>
              {series.map((s: string) => (
                <th key={s} className="p-2 font-semibold text-center" style={{ color: "#7C6FAA" }}>
                  {formatFlagName(s)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row: any, i: number) => (
              <tr key={i} className="border-t" style={{ borderColor: "#EDE9FF" }}>
                <td className="p-2 font-bold" style={{ color: "#2D1B69" }}>{row._label}</td>
                {series.map((s: string) => (
                  <td key={s} className="p-2 text-center">
                    <span
                      className="inline-block w-6 h-6 rounded-md"
                      style={{
                        background: row[s] ? "#EF4444" : "#D1FAE5",
                        opacity: row[s] ? 1 : 0.5,
                      }}
                      title={row[s] ? "Active" : "Inactive"}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </ChartSection>
  );
}
