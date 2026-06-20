import { AppShell } from "@/components/bridge/AppShell";
import { SectionHeader } from "@/components/bridge/SharedComponents";
import { Shield, X, Check, Minus } from "lucide-react";

const collectedData = [
  { type: "Audio recordings", what: "Uploaded or recorded session audio", usage: "Transcription and speaker grouping" },
  { type: "Session transcripts", what: "Text log of student in-session speech", usage: "Generating post-session summaries" },
  { type: "Participation signals", what: "Speaking turn counts, response patterns", usage: "Participation trend charts" },
  { type: "Interaction patterns", what: "Pauses, topic switches, invitation responses", usage: "Observational trend signals" },
  { type: "Teacher notes", what: "Notes added manually by teacher", usage: "Notes timeline, teacher records" },
  { type: "Session metadata", what: "Date, time, topic, group, duration", usage: "Session history, scheduling" },
];

const notCollected = ["Video", "Location data", "Personal family information", "Health or medical data", "Data from outside Lila sessions"];

const accessRoles = [
  { role: "Teacher (own students)", summaries: true, transcripts: true, trends: true, notes: true, exportData: true, deleteData: false },
  { role: "Co-Teacher (if authorized)", summaries: true, transcripts: "auth", trends: true, notes: false, exportData: false, deleteData: false },
  { role: "School Admin", summaries: true, transcripts: "auth", trends: true, notes: false, exportData: true, deleteData: true },
  { role: "District Admin", summaries: true, transcripts: false, trends: true, notes: false, exportData: true, deleteData: false },
  { role: "Lila Support (anon only)", summaries: false, transcripts: false, trends: false, notes: false, exportData: false, deleteData: false },
];

const auditLog = [
  { time: "Oct 14, 3:12 PM", user: "Ms. Rivera", action: "Viewed summary", record: "Group Finch — Oct 14 session" },
  { time: "Oct 14, 3:20 PM", user: "Ms. Rivera", action: "Added teacher note", record: "Lena M. trend record" },
  { time: "Oct 13, 4:01 PM", user: "Principal Okafor", action: "Viewed aggregate report", record: "Class 3B — Sept–Oct" },
  { time: "Oct 11, 9:15 AM", user: "Ms. Rivera", action: "Exported session summary", record: "Group Robin — Oct 11" },
];

function AccessIcon({ value }: { value: boolean | string }) {
  if (value === true) return <Check className="h-4 w-4" style={{ color: "#6EE7B7" }} />;
  if (value === "auth") return <Minus className="h-4 w-4" style={{ color: "#7C6FAA" }} />;
  return <X className="h-4 w-4" style={{ color: "#FB7185" }} />;
}

export default function PrivacyPage() {
  return (
    <AppShell pageTitle="Privacy & Governance">
      <div className="max-w-[860px] mx-auto space-y-8">
        {/* Header */}
        <div className="rounded-3xl p-8 text-center" style={{ background: "linear-gradient(135deg, #EDE9FF 0%, #FDF2F8 100%)", border: "1.5px solid #C4B5FD" }}>
          <Shield className="mx-auto h-10 w-10 mb-3" style={{ color: "#A78BFA" }} />
          <p className="text-base font-bold leading-relaxed max-w-2xl mx-auto" style={{ color: "#2D1B69" }}>
            Lila is built on a foundation of transparency. This page explains exactly what data the platform collects, who can access it, how long it's retained, and what it will never claim to do. Teachers are in control. Families have rights. Outputs are observational.
          </p>
        </div>

        {/* What We Collect */}
        <div className="lila-card">
          <SectionHeader title="What We Collect" />
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: "1.5px solid #EDE9FF" }}>
                  <th className="text-left py-2 pr-4 font-bold" style={{ color: "#2D1B69" }}>Data Type</th>
                  <th className="text-left py-2 pr-4 font-bold" style={{ color: "#2D1B69" }}>What It Is</th>
                  <th className="text-left py-2 font-bold" style={{ color: "#2D1B69" }}>What It's Used For</th>
                </tr>
              </thead>
              <tbody>
                {collectedData.map((d) => (
                  <tr key={d.type} style={{ borderBottom: "1px solid #EDE9FF" }}>
                    <td className="py-2.5 pr-4 font-bold" style={{ color: "#2D1B69" }}>{d.type}</td>
                    <td className="py-2.5 pr-4" style={{ color: "#7C6FAA" }}>{d.what}</td>
                    <td className="py-2.5" style={{ color: "#7C6FAA" }}>{d.usage}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4 flex flex-wrap gap-3">
            {notCollected.map((n) => (
              <span key={n} className="flex items-center gap-1.5 text-xs font-bold" style={{ color: "#FB7185" }}>
                <X className="h-3 w-3" /> {n}
              </span>
            ))}
          </div>
        </div>

        {/* Disclosure */}
        <div className="lila-card">
          <SectionHeader title="Disclosure Model" />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { role: "Students (6–12)", desc: "Know they are in a facilitated discussion. No data shown to them. No scores visible." },
              { role: "Teachers", desc: "See all session summaries, trend signals, and notes for their own students only." },
              { role: "Administrators", desc: "Can view aggregate class-level data. Cannot read individual transcripts without authorization." },
              { role: "Families", desc: "Can request access to their child's session transcripts. Data provided within 14 school days." },
              { role: "Lila Staff", desc: "Cannot access student data without school authorization. Technical logs are anonymized." },
            ].map((d) => (
              <div key={d.role} className="rounded-2xl p-4" style={{ background: "#F5F3FF", border: "1.5px solid #EDE9FF" }}>
                <p className="font-bold text-sm mb-1" style={{ color: "#2D1B69" }}>{d.role}</p>
                <p className="text-xs" style={{ color: "#7C6FAA" }}>{d.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Role-Based Access */}
        <div className="lila-card">
          <SectionHeader title="Role-Based Access" />
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: "1.5px solid #EDE9FF", background: "#2D1B69" }}>
                  <th className="text-left py-2 px-2 font-bold text-white rounded-tl-xl">Role</th>
                  <th className="py-2 text-center font-bold text-white">Summaries</th>
                  <th className="py-2 text-center font-bold text-white">Transcripts</th>
                  <th className="py-2 text-center font-bold text-white">Trends</th>
                  <th className="py-2 text-center font-bold text-white">Notes</th>
                  <th className="py-2 text-center font-bold text-white">Export</th>
                  <th className="py-2 text-center font-bold text-white rounded-tr-xl">Delete</th>
                </tr>
              </thead>
              <tbody>
                {accessRoles.map((r) => (
                  <tr key={r.role} className="hover:bg-[#F5F3FF]" style={{ borderBottom: "1px solid #EDE9FF" }}>
                    <td className="py-2.5 px-2 font-bold" style={{ color: "#2D1B69" }}>{r.role}</td>
                    <td className="py-2.5 text-center"><AccessIcon value={r.summaries} /></td>
                    <td className="py-2.5 text-center"><AccessIcon value={r.transcripts} /></td>
                    <td className="py-2.5 text-center"><AccessIcon value={r.trends} /></td>
                    <td className="py-2.5 text-center"><AccessIcon value={r.notes} /></td>
                    <td className="py-2.5 text-center"><AccessIcon value={r.exportData} /></td>
                    <td className="py-2.5 text-center"><AccessIcon value={r.deleteData} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Data Retention */}
        <div className="lila-card">
          <SectionHeader title="Data Retention" />
          <div className="space-y-2 text-sm">
            {[
              ["Audio recordings", "Retained according to school policy or deleted after processing"],
              ["Session transcripts", "Retained for 12 months, then auto-deleted"],
              ["Participation trend data", "Retained for duration of enrollment"],
              ["Teacher notes", "Retained until manually deleted by teacher or admin"],
              ["Audit logs", "Retained for 24 months"],
              ["All data", "Deleted within 30 days of school contract termination"],
            ].map(([label, desc]) => (
              <div key={label} className="flex items-baseline gap-2">
                <span className="font-bold" style={{ color: "#2D1B69" }}>{label}:</span>
                <span style={{ color: "#7C6FAA" }}>{desc}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Audit Log */}
        <div className="lila-card">
          <SectionHeader title="Audit Log (Last 10 Entries)" action={<button className="lila-btn-secondary text-xs !py-1 !px-3">Download CSV</button>} />
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: "1.5px solid #EDE9FF" }}>
                  <th className="text-left py-2 font-bold" style={{ color: "#2D1B69" }}>Timestamp</th>
                  <th className="text-left py-2 font-bold" style={{ color: "#2D1B69" }}>User</th>
                  <th className="text-left py-2 font-bold" style={{ color: "#2D1B69" }}>Action</th>
                  <th className="text-left py-2 font-bold" style={{ color: "#2D1B69" }}>Record</th>
                </tr>
              </thead>
              <tbody>
                {auditLog.map((a, i) => (
                  <tr key={i} className="hover:bg-[#F5F3FF]" style={{ borderBottom: "1px solid #EDE9FF" }}>
                    <td className="py-2.5" style={{ color: "#A89DC4" }}>{a.time}</td>
                    <td className="py-2.5" style={{ color: "#2D1B69" }}>{a.user}</td>
                    <td className="py-2.5" style={{ color: "#2D1B69" }}>{a.action}</td>
                    <td className="py-2.5" style={{ color: "#7C6FAA" }}>{a.record}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Non-Diagnosis Statement */}
        <div className="rounded-3xl p-6" style={{ border: "4px solid #FDBA74", background: "#FFF7ED" }}>
          <h3 className="text-lg font-extrabold mb-3" style={{ color: "#D97706" }}>What Lila Does Not Do</h3>
          <p className="text-sm leading-relaxed" style={{ color: "#7C6FAA" }}>
            Lila is a discussion facilitation and teacher reflection tool. It does not diagnose, screen for, or assess any mental health condition; detect abuse, trauma, neglect, or family problems; replace professional counseling, psychology, or social work; generate clinical recommendations; or make definitive claims about a student's emotional state, wellbeing, or development.
          </p>
          <p className="text-sm leading-relaxed mt-3" style={{ color: "#7C6FAA" }}>
            All outputs — including session summaries, trend charts, participation signals, and suggested follow-up actions — are observational reflections of in-session interaction patterns. They require teacher interpretation and human judgment. No action should be taken based solely on Lila outputs.
          </p>
          <p className="text-xs mt-4" style={{ color: "#A89DC4" }}>Lila Education Inc. | Last updated: October 2025</p>
        </div>
      </div>
    </AppShell>
  );
}
