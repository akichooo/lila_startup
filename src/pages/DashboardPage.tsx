import { useState } from "react";
import { Link } from "react-router-dom";
import { AppShell } from "@/components/bridge/AppShell";
import { StatCard, SectionHeader, StatusBadge, StudentAvatar, InfoTooltip } from "@/components/bridge/SharedComponents";
import { SESSIONS, GROUPS, FOLLOW_UPS, STUDENTS } from "@/data/mockData";
import { Button } from "@/components/ui/button";
import { CalendarDays, Users, ClipboardList, Info, Plus, CheckCircle2 } from "lucide-react";
import { LineChart, Line, ResponsiveContainer } from "recharts";

const sparkData1 = [{ v: 30 }, { v: 35 }, { v: 40 }, { v: 38 }, { v: 50 }, { v: 55 }, { v: 60 }, { v: 65 }];
const sparkData2 = [{ v: 70 }, { v: 72 }, { v: 75 }, { v: 73 }, { v: 68 }, { v: 65 }, { v: 63 }, { v: 60 }];
const sparkData3 = [{ v: 2 }, { v: 1 }, { v: 2 }, { v: 1 }, { v: 1 }, { v: 2 }, { v: 1 }, { v: 1 }];

export default function DashboardPage() {
  const [followUps, setFollowUps] = useState(FOLLOW_UPS);

  const toggleFollowUp = (id: string) => {
    setFollowUps((prev) => prev.map((f) => (f.id === id ? { ...f, done: !f.done } : f)));
  };

  return (
    <AppShell pageTitle="Dashboard">
      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <StatCard title="Sessions This Month" value={14} subtitle="3 scheduled this week" borderColor="hsl(222, 78%, 57%)" icon={<CalendarDays className="h-5 w-5" />} />
        <StatCard title="Active Student Groups" value={6} subtitle="28 students total" borderColor="hsl(245, 100%, 69%)" icon={<Users className="h-5 w-5" />} />
        <StatCard title="Pending Follow-Ups" value={4} subtitle="Review suggested actions" borderColor="hsl(37, 90%, 55%)" icon={<ClipboardList className="h-5 w-5" />} badge={<span className="bridge-badge-amber">4</span>} />
        <StatCard title="Support Flags (New)" value={2} subtitle="Observational signals, not alerts" borderColor="hsl(222, 78%, 57%)" icon={<Info className="h-5 w-5" />} badge={<span className="bridge-badge-blue">2</span>} />
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
        {/* Left column */}
        <div className="space-y-8">
          {/* Recent Sessions */}
          <div>
            <SectionHeader title="Recent Sessions" action={<Link to="/sessions" className="text-sm text-primary hover:underline">View all</Link>} />
            <div className="space-y-3">
              {SESSIONS.map((s) => (
                <div key={s.id} className="bridge-card flex items-center justify-between gap-4 p-4 hover:shadow-md transition-shadow">
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold truncate">{s.topic}</p>
                    <p className="text-sm text-muted-foreground">{s.groupName} · {s.date} · {s.studentCount} students · {s.duration} min</p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <StatusBadge status={s.status} />
                    <Link to={s.status === "summary-ready" ? "/summary" : s.status === "follow-up-pending" ? "/summary" : "/summary"}>
                      <Button variant="outline" size="sm">
                        {s.status === "summary-ready" ? "View Summary" : s.status === "follow-up-pending" ? "Review" : "View"}
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Active Groups */}
          <div>
            <SectionHeader
              title="Active Groups"
              action={<Link to="/sessions/create"><Button size="sm" variant="outline"><Plus className="h-3.5 w-3.5 mr-1" /> New Session</Button></Link>}
            />
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {GROUPS.map((g) => (
                <div key={g.id} className="bridge-card p-4 hover:shadow-md transition-shadow group cursor-pointer">
                  <p className="font-semibold mb-1">{g.name}</p>
                  <p className="text-xs text-muted-foreground mb-3">{g.students.length} students</p>
                  <div className="flex -space-x-2 mb-3">
                    {g.students.slice(0, 5).map((s) => (
                      <StudentAvatar key={s.id} initials={s.initials} color={s.color} size="sm" className="ring-2 ring-card" />
                    ))}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    <p>Last: {g.lastSession}</p>
                    {g.nextSession && <p>Next: {g.nextSession}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-6">
          {/* Observational Signals */}
          <div>
            <SectionHeader title={<span className="flex items-center">Observational Signals <InfoTooltip text="These are participation and engagement patterns observed during sessions. They are not diagnostic assessments. Teacher review is required before any action." /></span>} />
            <div className="space-y-3">
              {[
                { student: STUDENTS[0], flag: "Decreased verbal participation — 3 consecutive sessions", date: "Oct 14" },
                { student: STUDENTS[3], flag: "Frequent topic changes when peers discuss conflict themes", date: "Oct 13" },
              ].map((item) => (
                <div key={item.student.id} className="bridge-card p-4">
                  <div className="flex items-start gap-3">
                    <StudentAvatar initials={item.student.initials} color={item.student.color} />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm">{item.student.name}</p>
                      <p className="text-xs text-muted-foreground mt-1">{item.flag}</p>
                      <p className="text-xs text-muted-foreground mt-1">Last session: {item.date}</p>
                      <Link to="/trends">
                        <Button variant="outline" size="sm" className="mt-2">View Trends</Button>
                      </Link>
                    </div>
                    <span className="bridge-badge-blue shrink-0">Info</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Follow-Ups */}
          <div>
            <SectionHeader title={<span className="flex items-center">Follow-Ups <span className="bridge-badge-amber ml-2">{followUps.filter((f) => !f.done).length}</span></span>} />
            <div className="space-y-2">
              {followUps.map((f) => (
                <div key={f.id} className={`bridge-card p-3 flex items-start gap-3 ${f.done ? "opacity-60" : ""}`}>
                  <button onClick={() => toggleFollowUp(f.id)} className="mt-0.5 shrink-0" aria-label={f.done ? "Mark undone" : "Mark done"}>
                    <CheckCircle2 className={`h-5 w-5 ${f.done ? "text-accent" : "text-border hover:text-accent"}`} />
                  </button>
                  <div className="min-w-0 flex-1">
                    <p className={`text-sm ${f.done ? "line-through" : ""}`}>{f.text}</p>
                    <p className="text-xs text-muted-foreground">Suggested after {f.sessionDate} session</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sparkline Trends */}
          <div>
            <SectionHeader title="Class Trends (Last 8 Sessions)" />
            {[
              { label: "Avg participation balance", data: sparkData1, trend: "Improving", color: "hsl(153, 56%, 50%)" },
              { label: "Group engagement score", data: sparkData2, trend: "Watch", color: "hsl(37, 90%, 55%)" },
              { label: "Misinformation corrections", data: sparkData3, trend: "Stable", color: "hsl(220, 9%, 46%)" },
            ].map((item) => (
              <div key={item.label} className="bridge-card p-3 mb-2 flex items-center gap-4">
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground truncate">{item.label}</p>
                </div>
                <div className="w-24 h-8">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={item.data}>
                      <Line type="monotone" dataKey="v" stroke={item.color} strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <span className={`text-xs font-medium ${
                  item.trend === "Improving" ? "text-accent" : item.trend === "Watch" ? "text-warning" : "text-muted-foreground"
                }`}>{item.trend}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
