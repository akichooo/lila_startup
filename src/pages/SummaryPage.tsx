import { useState } from "react";
import { AppShell } from "@/components/bridge/AppShell";
import { StudentAvatar, DisclaimerBanner, SectionHeader } from "@/components/bridge/SharedComponents";
import { STUDENTS } from "@/data/mockData";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { CheckCircle2, Star, Download, Share2, Bookmark, AlertTriangle } from "lucide-react";

const studentCards = [
  { student: STUDENTS[1], turns: 8, pct: 32, engagement: "High", engStyle: "lila-badge-green", notable: "Offered nuanced reasoning. Confident contributor.", change: "↑ More active than last 2 sessions", changeColor: "#059669" },
  { student: STUDENTS[2], turns: 6, pct: 22, engagement: "Engaged", engStyle: "lila-badge-green", notable: "Asked clarifying questions. Responded well to reframe.", change: "→ Consistent with prior sessions", changeColor: "#7C6FAA" },
  { student: STUDENTS[0], turns: 5, pct: 18, engagement: "Moderate", engStyle: "lila-badge-amber", notable: "Quieter than previous sessions. Responded when directly invited.", change: "↓ Less active than last 3 sessions", changeColor: "#D97706", showFlag: true },
  { student: STUDENTS[4], turns: 3, pct: 10, engagement: "Low", engStyle: "lila-badge-amber", notable: "Did not respond to two open invitations. Engaged passively.", change: "↓ Second session with low participation", changeColor: "#D97706", showFlag: true },
];

const highlights = [
  { icon: Bookmark, text: "Marcus offered a strong conceptual distinction between equality and equity using a concrete example (shoe sizes).", time: "10:07" },
  { icon: Bookmark, text: "Omar connected the fairness discussion to a personal example (helmet rules) unprompted.", time: "10:13" },
  { icon: AlertTriangle, text: "Aiden did not respond to two direct facilitator invitations. Lila moved on without pressure.", time: "10:18" },
];

const GRADIENTS = [
  "linear-gradient(135deg, #FB7185, #FDBA74)",
  "linear-gradient(135deg, #7DD3FC, #A78BFA)",
  "linear-gradient(135deg, #A78BFA, #C4B5FD)",
  "linear-gradient(135deg, #FCD34D, #FDBA74)",
];

export default function SummaryPage() {
  const [rating, setRating] = useState(0);

  return (
    <AppShell pageTitle="Session Summary">
      {/* Metadata bar */}
      <div className="lila-card p-4 mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3 text-sm">
          <span className="font-bold" style={{ color: "#2D1B69" }}>Feelings & Fairness</span>
          <span style={{ color: "#EDE9FF" }}>|</span>
          <span style={{ color: "#7C6FAA" }}>Group Finch</span>
          <span style={{ color: "#EDE9FF" }}>|</span>
          <span style={{ color: "#7C6FAA" }}>Oct 14, 2025</span>
          <span style={{ color: "#EDE9FF" }}>|</span>
          <span style={{ color: "#7C6FAA" }}>22 minutes</span>
          <span style={{ color: "#EDE9FF" }}>|</span>
          <span style={{ color: "#7C6FAA" }}>4 students</span>
          <span className="lila-badge-green ml-2">Summary Ready</span>
        </div>
        <div className="flex gap-2">
          <button className="lila-btn-secondary text-xs !py-1.5 !px-4 flex items-center gap-1"><Download className="h-4 w-4" /> Export PDF</button>
          <button className="lila-btn-secondary text-xs !py-1.5 !px-4 flex items-center gap-1"><Share2 className="h-4 w-4" /> Share</button>
        </div>
      </div>

      <div className="space-y-6 max-w-[900px] mx-auto">
        {/* Summary */}
        <div className="lila-card">
          <p className="lila-label mb-3">Lila-Generated Observational Summary — Requires Teacher Review</p>
          <p className="text-sm leading-relaxed" style={{ color: "#2D1B69" }}>
            This session explored concepts of fairness and equity with 4 students over 22 minutes. The group was generally engaged, with strong contributions from Marcus and Priya and quieter participation from Lena and Aiden. Lila asked 7 questions and noted one moment where a student's response included a factual oversimplification (see below). Overall discussion tone was calm and constructive. No disruptive interactions were observed.
          </p>
          <p className="text-xs mt-3 italic" style={{ color: "#A89DC4" }}>
            This summary reflects in-session interaction patterns only. It is not a psychological assessment, behavioral evaluation, or diagnostic report. Teacher review and judgment are required.
          </p>
        </div>

        {/* Misinformation */}
        <div className="lila-card" style={{ borderColor: "#FDBA74", background: "linear-gradient(135deg, #FFFFFF 0%, #FFF7ED 100%)" }}>
          <SectionHeader title="Concepts Gently Reframed by Lila (1)" />
          <div className="flex items-start gap-4 text-sm">
            <span className="text-xs shrink-0" style={{ color: "#A89DC4" }}>10:10</span>
            <div>
              <p style={{ color: "#2D1B69" }}><span className="font-bold">Priya</span> · Fairness</p>
              <p className="mt-1" style={{ color: "#7C6FAA" }}>Original: "Fair means everyone is happy"</p>
              <p style={{ color: "#7C6FAA" }}>Reframed — explored examples where fair rules may cause temporary discomfort</p>
            </div>
            <div className="shrink-0 flex items-center gap-2">
              <input type="checkbox" className="rounded" aria-label="Mark as reviewed" />
              <span className="text-xs" style={{ color: "#7C6FAA" }}>Reviewed</span>
            </div>
          </div>
        </div>

        {/* Highlights */}
        <div className="lila-card">
          <SectionHeader title="Interaction Highlights" />
          <div className="space-y-3">
            {highlights.map((h, i) => (
              <div key={i} className="flex items-start gap-3 text-sm rounded-2xl p-3" style={{ background: h.icon === AlertTriangle ? "#FFF7ED" : "#FFFBEB" }}>
                <h.icon className="h-4 w-4 shrink-0 mt-0.5" style={{ color: h.icon === AlertTriangle ? "#D97706" : "#A78BFA" }} />
                <div>
                  <span className="text-xs mr-2" style={{ color: "#A89DC4" }}>{h.time}</span>
                  <span style={{ color: "#2D1B69" }}>{h.text}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Student cards */}
        <div>
          <SectionHeader title="Student-by-Student Participation" />
          <div className="grid gap-4 sm:grid-cols-2">
            {studentCards.map((c, ci) => (
              <div key={c.student.id} className="lila-card p-5 relative overflow-hidden">
                <div className="h-1 absolute top-0 left-0 right-0" style={{ background: GRADIENTS[ci % GRADIENTS.length] }} />
                <div className="flex items-center gap-3 mb-3 pt-1">
                  <StudentAvatar initials={c.student.initials} color={c.student.color} size="lg" />
                  <div>
                    <p className="font-bold" style={{ color: "#2D1B69" }}>{c.student.name}</p>
                    <p className="text-xs" style={{ color: "#7C6FAA" }}>Group Finch</p>
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span style={{ color: "#7C6FAA" }}>Speaking turns</span>
                    <span className="font-bold" style={{ color: "#2D1B69" }}>{c.turns} ({c.pct}%)</span>
                  </div>
                  <div className="h-2 rounded-full overflow-hidden" style={{ background: "#EDE9FF" }}>
                    <div className="h-full rounded-full" style={{ width: `${c.pct}%`, background: "linear-gradient(90deg, #A78BFA, #FB7185)" }} />
                  </div>
                  <div className="flex items-center justify-between">
                    <span style={{ color: "#7C6FAA" }}>Engagement</span>
                    <span className={c.engStyle}>{c.engagement}</span>
                  </div>
                  <p className="text-xs" style={{ color: "#7C6FAA" }}>{c.notable}</p>
                  <p className="text-xs font-bold" style={{ color: c.changeColor }}>{c.change}</p>
                  <Textarea placeholder={`Add a private note about ${c.student.name.split(" ")[0]}…`} rows={2} className="mt-2 rounded-2xl" style={{ background: "#F5F3FF", borderColor: "#EDE9FF" }} />
                  {c.showFlag && (
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs" style={{ color: "#7C6FAA" }}>Flag for follow-up (observational)</span>
                      <Switch />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Follow-up actions */}
        <div className="lila-card">
          <SectionHeader title={<span className="flex items-center gap-1">Suggested Actions <span className="text-xs font-normal" style={{ color: "#7C6FAA" }}>(Teacher discretion required)</span></span>} />
          <div className="space-y-3">
            {[
              { text: "Check in briefly with Lena M. to see how she's doing this week.", urgency: "Low urgency" },
              { text: "Consider pairing Aiden with a more talkative partner in the next group warm-up activity.", urgency: "Pedagogical suggestion" },
              { text: "Extend the fairness topic next session — group showed strong interest and unresolved questions.", urgency: "Curriculum suggestion" },
            ].map((a, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-2xl" style={{ background: "#F5F3FF", borderLeft: "4px solid #A78BFA" }}>
                <CheckCircle2 className="h-5 w-5 cursor-pointer shrink-0 mt-0.5" style={{ color: "#EDE9FF" }} />
                <div className="flex-1">
                  <p className="text-sm" style={{ color: "#2D1B69" }}>{a.text}</p>
                  <p className="text-xs mt-0.5" style={{ color: "#A89DC4" }}>{a.urgency}</p>
                </div>
                <button className="lila-btn-secondary text-xs !py-1 !px-3">Add to Follow-Ups</button>
              </div>
            ))}
          </div>
          <p className="text-xs mt-4 italic" style={{ color: "#A89DC4" }}>These suggestions are based on participation patterns observed in this session. They are pedagogical observations, not clinical recommendations.</p>
        </div>

        {/* Rating */}
        <div className="lila-card text-center">
          <p className="text-sm font-bold mb-3" style={{ color: "#2D1B69" }}>How useful was this session summary?</p>
          <div className="flex justify-center gap-1 mb-3">
            {[1, 2, 3, 4, 5].map((s) => (
              <button key={s} onClick={() => setRating(s)} aria-label={`Rate ${s} stars`}>
                <Star className={`h-6 w-6 ${s <= rating ? "fill-[#FCD34D]" : ""}`} style={{ color: s <= rating ? "#FCD34D" : "#EDE9FF" }} />
              </button>
            ))}
          </div>
          <Textarea placeholder="Optional comment…" rows={2} className="max-w-sm mx-auto rounded-2xl" style={{ background: "#F5F3FF", borderColor: "#EDE9FF" }} />
          <button className="lila-btn-primary mt-3 text-sm !py-2">Submit Feedback</button>
        </div>
      </div>
    </AppShell>
  );
}
