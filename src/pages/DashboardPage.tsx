import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { AppShell } from "@/components/bridge/AppShell";
import { StatCard, SectionHeader, StatusBadge, StudentAvatar, InfoTooltip } from "@/components/bridge/SharedComponents";
import { SESSIONS, GROUPS, FOLLOW_UPS, STUDENTS } from "@/data/mockData";
import { Button } from "@/components/ui/button";
import { CalendarDays, Users, ClipboardList, Info, Plus, CheckCircle2 } from "lucide-react";
import { LineChart, Line, ResponsiveContainer } from "recharts";
import { useAnalysis } from "@/contexts/AnalysisContext";
import { useLilaSound } from "@/contexts/SoundContext";

const sparkData1 = [{ v: 30 }, { v: 35 }, { v: 40 }, { v: 38 }, { v: 50 }, { v: 55 }, { v: 60 }, { v: 65 }];
const sparkData2 = [{ v: 70 }, { v: 72 }, { v: 75 }, { v: 73 }, { v: 68 }, { v: 65 }, { v: 63 }, { v: 60 }];
const sparkData3 = [{ v: 2 }, { v: 1 }, { v: 2 }, { v: 1 }, { v: 1 }, { v: 2 }, { v: 1 }, { v: 1 }];

const GRADIENTS = [
  "linear-gradient(135deg, #A78BFA, #C4B5FD)",
  "linear-gradient(135deg, #6EE7B7, #7DD3FC)",
  "linear-gradient(135deg, #FDBA74, #FCD34D)",
  "linear-gradient(135deg, #FB7185, #FDBA74)",
];

export default function DashboardPage() {
  const { analyses } = useAnalysis();
  const [followUps, setFollowUps] = useState(FOLLOW_UPS);
  const { play, startBackgroundMusic, stopBackgroundMusic } = useLilaSound();

  useEffect(() => {
    startBackgroundMusic("dashboard");
    play("mascot-wave");
    return () => stopBackgroundMusic();
  }, [startBackgroundMusic, stopBackgroundMusic, play]);

  // Build dynamic follow-ups from analyses
  const dynamicFollowUps = analyses.flatMap((a) =>
    a.followUpActions.map((f, i) => ({
      id: `${a.id}_f${i}`,
      text: f.text,
      sessionDate: a.date,
      done: false,
    }))
  );

  const allFollowUps = [...dynamicFollowUps, ...followUps];

  const toggleFollowUp = (id: string) => {
    setFollowUps((prev) => prev.map((f) => (f.id === id ? { ...f, done: !f.done } : f)));
  };

  // Build combined sessions list with analyses on top
  const analysisSessions = analyses.map((a) => ({
    id: a.id,
    topic: a.topic,
    groupName: a.groupName,
    groupId: a.groupId,
    date: a.date,
    studentCount: a.studentCount,
    duration: a.duration,
    status: "summary-ready" as const,
  }));

  const allSessions = [...analysisSessions, ...SESSIONS];
  const sessionsThisMonth = 14 + analyses.length;
  const signalCount = 2 + analyses.filter((a) => a.studentResults.some((s) => s.flagged)).length;
  const pendingFollowUps = allFollowUps.filter((f) => !f.done).length;

  // Dynamic signals from analyses
  const dynamicSignals = analyses.flatMap((a) =>
    a.studentResults.filter((s) => s.flagged).map((s) => ({
      student: s.student,
      flag: s.flagNote || "",
      date: a.date,
    }))
  );

  const allSignals = [
    ...dynamicSignals,
    { student: STUDENTS[0], flag: "Decreased verbal participation — 3 consecutive sessions", date: "Oct 14" },
    { student: STUDENTS[3], flag: "Frequent topic changes when peers discuss conflict themes", date: "Oct 13" },
  ];

  return (
    <AppShell pageTitle="Dashboard">
      <div className="rounded-3xl p-8 mb-8 relative overflow-hidden" style={{ background: "linear-gradient(135deg, #EDE9FF 0%, #FCE7F3 50%, #E0F2FE 100%)" }}>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-[28px] font-extrabold" style={{ color: "#2D1B69" }}>Good morning, Ms. Rivera 🌟</h2>
            <p className="mt-1" style={{ color: "#7C6FAA" }}>{analyses.length > 0 ? `${analyses.length} new` : "2 new"} session summaries · {pendingFollowUps} pending follow-ups</p>
          </div>
          <div className="text-6xl voice-mascot-bob hidden md:block">💜</div>
        </div>
        <div className="absolute top-4 right-32 text-xl opacity-30">⭐</div>
        <div className="absolute bottom-4 left-32 text-lg opacity-20">✨</div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <StatCard title="Sessions This Month" value={sessionsThisMonth} subtitle="3 scheduled this week" gradientBar={GRADIENTS[0]} icon={<CalendarDays className="h-5 w-5" />} />
        <StatCard title="Active Groups" value={6} subtitle="28 students total" gradientBar={GRADIENTS[1]} icon={<Users className="h-5 w-5" />} />
        <StatCard title="Pending Follow-Ups" value={pendingFollowUps} subtitle="Review suggested actions" gradientBar={GRADIENTS[2]} icon={<ClipboardList className="h-5 w-5" />} badge={<span className="lila-badge-amber">{pendingFollowUps}</span>} />
        <StatCard title="New Signals" value={signalCount} subtitle="Observational signals, not alerts" gradientBar={GRADIENTS[3]} icon={<Info className="h-5 w-5" />} badge={<span className="lila-badge-purple">{signalCount}</span>} />
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
        <div className="space-y-8">
          <div>
            <SectionHeader title="Recent Sessions" action={<Link to="/sessions" className="text-sm font-bold hover:underline" style={{ color: "#A78BFA" }}>View all</Link>} />
            <div className="space-y-3">
              {allSessions.map((s) => (
                <div key={s.id} className="lila-card flex items-center justify-between gap-4 p-4">
                  <div className="min-w-0 flex-1">
                    <p className="font-bold truncate" style={{ color: "#2D1B69" }}>{s.topic}</p>
                    <p className="text-sm" style={{ color: "#7C6FAA" }}>{s.groupName} · {s.date} · {s.studentCount} students · {s.duration} min</p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <StatusBadge status={s.status} />
                    <Link to={s.id.startsWith("analysis_") ? `/summary/${s.id}` : "/summary"}>
                      <button className="lila-btn-secondary text-xs !py-1.5 !px-4">
                        {s.status === "summary-ready" ? "View Summary" : s.status === "follow-up-pending" ? "Review" : "View"}
                      </button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <SectionHeader
              title="Active Groups"
              action={<Link to="/sessions/create"><button className="lila-btn-secondary text-xs !py-1.5 !px-4 flex items-center gap-1"><Plus className="h-3.5 w-3.5" /> New Session</button></Link>}
            />
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {GROUPS.map((g, gi) => (
                <div key={g.id} className="lila-card p-4 group cursor-pointer overflow-hidden relative">
                  <div className="h-1 absolute top-0 left-0 right-0" style={{ background: GRADIENTS[gi % GRADIENTS.length] }} />
                  <p className="font-bold mb-1 pt-1" style={{ color: "#2D1B69" }}>{g.name}</p>
                  <p className="text-xs mb-3" style={{ color: "#7C6FAA" }}>{g.students.length} students</p>
                  <div className="flex -space-x-2 mb-3">
                    {g.students.slice(0, 5).map((s) => (
                      <StudentAvatar key={s.id} initials={s.initials} color={s.color} size="sm" className="ring-2 ring-card" />
                    ))}
                  </div>
                  <div className="text-xs" style={{ color: "#7C6FAA" }}>
                    <p>Last: {g.lastSession}</p>
                    {g.nextSession && <p>Next: {g.nextSession}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <SectionHeader title={<span className="flex items-center">Observational Signals <InfoTooltip text="These are participation and engagement patterns observed during sessions. They are not diagnostic assessments. Teacher review is required before any action." /></span>} />
            <div className="space-y-3">
              {allSignals.slice(0, 4).map((item, idx) => (
                <div key={`${item.student.id}-${idx}`} className="lila-card p-4" style={{ borderLeft: "4px solid #A78BFA" }}>
                  <div className="flex items-start gap-3">
                    <StudentAvatar initials={item.student.initials} color={item.student.color} />
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm" style={{ color: "#2D1B69" }}>{item.student.name}</p>
                      <p className="text-xs mt-1" style={{ color: "#7C6FAA" }}>{item.flag}</p>
                      <p className="text-xs mt-1" style={{ color: "#A89DC4" }}>Last session: {item.date}</p>
                      <Link to="/trends">
                        <button className="lila-btn-secondary text-xs !py-1 !px-3 mt-2">View Trends</button>
                      </Link>
                    </div>
                    <span className="lila-badge-purple shrink-0">Info</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <SectionHeader title={<span className="flex items-center">Follow-Ups <span className="lila-badge-amber ml-2">{allFollowUps.filter((f) => !f.done).length}</span></span>} />
            <div className="space-y-2">
              {allFollowUps.map((f) => (
                <div key={f.id} className={`lila-card p-3 flex items-start gap-3 ${f.done ? "opacity-60" : ""}`} style={{ borderLeft: "4px solid #FDBA74" }}>
                  <button onClick={() => toggleFollowUp(f.id)} className="mt-0.5 shrink-0" aria-label={f.done ? "Mark undone" : "Mark done"}>
                    <CheckCircle2 className={`h-5 w-5 ${f.done ? "text-accent" : ""}`} style={f.done ? {} : { color: "#EDE9FF" }} />
                  </button>
                  <div className="min-w-0 flex-1">
                    <p className={`text-sm ${f.done ? "line-through" : ""}`} style={{ color: "#2D1B69" }}>{f.text}</p>
                    <p className="text-xs" style={{ color: "#A89DC4" }}>Suggested after {f.sessionDate} session</p>
                  </div>
                  {!f.done && <button className="text-xs font-bold rounded-full px-3 py-1" style={{ background: "#ECFDF5", color: "#059669" }}>Mark Done</button>}
                </div>
              ))}
            </div>
          </div>

          <div>
            <SectionHeader title="Class Trends (Last 8 Sessions)" />
            {[
              { label: "Avg participation balance", data: sparkData1, trend: "Improving", color: "#A78BFA", trendColor: "#059669" },
              { label: "Group engagement score", data: sparkData2, trend: "Watch", color: "#6EE7B7", trendColor: "#D97706" },
              { label: "Misinformation corrections", data: sparkData3, trend: "Stable", color: "#FB7185", trendColor: "#7C6FAA" },
            ].map((item) => (
              <div key={item.label} className="lila-card p-3 mb-2 flex items-center gap-4">
                <div className="flex-1 min-w-0">
                  <p className="text-xs truncate" style={{ color: "#7C6FAA" }}>{item.label}</p>
                </div>
                <div className="w-24 h-8">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={item.data}>
                      <Line type="monotone" dataKey="v" stroke={item.color} strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <span className="text-xs font-bold" style={{ color: item.trendColor }}>{item.trend}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
