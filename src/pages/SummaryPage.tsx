import { useState } from "react";
import { AppShell } from "@/components/bridge/AppShell";
import { StudentAvatar, DisclaimerBanner, SectionHeader } from "@/components/bridge/SharedComponents";
import { STUDENTS } from "@/data/mockData";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { CheckCircle2, Star, Download, Share2, Bookmark, AlertTriangle } from "lucide-react";

const studentCards = [
  { student: STUDENTS[1], turns: 8, pct: 32, engagement: "High", engColor: "bridge-badge-green", notable: "Offered nuanced reasoning. Confident contributor.", change: "↑ More active than last 2 sessions", changeColor: "text-accent" },
  { student: STUDENTS[2], turns: 6, pct: 22, engagement: "Engaged", engColor: "bridge-badge-green", notable: "Asked clarifying questions. Responded well to reframe.", change: "→ Consistent with prior sessions", changeColor: "text-muted-foreground" },
  { student: STUDENTS[0], turns: 5, pct: 18, engagement: "Moderate", engColor: "bridge-badge-amber", notable: "Quieter than previous sessions. Responded when directly invited.", change: "↓ Less active than last 3 sessions", changeColor: "text-warning", showFlag: true },
  { student: STUDENTS[4], turns: 3, pct: 10, engagement: "Low", engColor: "bridge-badge-amber", notable: "Did not respond to two open invitations. Engaged passively.", change: "↓ Second session with low participation", changeColor: "text-warning", showFlag: true },
];

const highlights = [
  { icon: Bookmark, text: "Marcus offered a strong conceptual distinction between equality and equity using a concrete example (shoe sizes).", time: "10:07" },
  { icon: Bookmark, text: "Omar connected the fairness discussion to a personal example (helmet rules) unprompted.", time: "10:13" },
  { icon: AlertTriangle, text: "Aiden did not respond to two direct facilitator invitations. Facilitator moved on without pressure.", time: "10:18" },
];

export default function SummaryPage() {
  const [rating, setRating] = useState(0);

  return (
    <AppShell pageTitle="Session Summary">
      {/* Metadata bar */}
      <div className="bridge-card p-4 mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3 text-sm">
          <span className="font-semibold">Feelings & Fairness</span>
          <span className="text-muted-foreground">|</span>
          <span>Group Finch</span>
          <span className="text-muted-foreground">|</span>
          <span>Oct 14, 2025</span>
          <span className="text-muted-foreground">|</span>
          <span>22 minutes</span>
          <span className="text-muted-foreground">|</span>
          <span>4 students</span>
          <span className="bridge-badge-green ml-2">Summary Ready</span>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm"><Download className="h-4 w-4 mr-1" /> Export PDF</Button>
          <Button variant="outline" size="sm"><Share2 className="h-4 w-4 mr-1" /> Share</Button>
        </div>
      </div>

      <div className="space-y-6 max-w-[900px] mx-auto">
        {/* Summary */}
        <div className="bridge-card">
          <p className="bridge-label mb-3">AI-Generated Observational Summary — Requires Teacher Review</p>
          <p className="text-sm leading-relaxed">
            This session explored concepts of fairness and equity with 4 students over 22 minutes. The group was generally engaged, with strong contributions from Marcus and Priya and quieter participation from Lena and Aiden. The facilitator asked 7 questions and noted one moment where a student's response included a factual oversimplification (see below). Overall discussion tone was calm and constructive. No disruptive interactions were observed.
          </p>
          <p className="text-xs text-muted-foreground mt-3 italic">
            This summary reflects in-session interaction patterns only. It is not a psychological assessment, behavioral evaluation, or diagnostic report. Teacher review and judgment are required.
          </p>
        </div>

        {/* Misinformation */}
        <div className="bridge-card border-warning/30">
          <SectionHeader title="Concepts Gently Reframed by Facilitator (1)" />
          <div className="flex items-start gap-4 text-sm">
            <span className="text-xs text-muted-foreground shrink-0">10:10</span>
            <div>
              <p><span className="font-medium">Priya</span> · Fairness</p>
              <p className="text-muted-foreground mt-1">Original: "Fair means everyone is happy"</p>
              <p className="text-muted-foreground">Reframed — explored examples where fair rules may cause temporary discomfort</p>
            </div>
            <div className="shrink-0 flex items-center gap-2">
              <input type="checkbox" className="rounded" aria-label="Mark as reviewed" />
              <span className="text-xs text-muted-foreground">Reviewed</span>
            </div>
          </div>
        </div>

        {/* Highlights */}
        <div className="bridge-card">
          <SectionHeader title="Interaction Highlights" />
          <div className="space-y-3">
            {highlights.map((h, i) => (
              <div key={i} className="flex items-start gap-3 text-sm">
                <h.icon className={`h-4 w-4 shrink-0 mt-0.5 ${h.icon === AlertTriangle ? "text-warning" : "text-primary"}`} />
                <div>
                  <span className="text-xs text-muted-foreground mr-2">{h.time}</span>
                  {h.text}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Student cards */}
        <div>
          <SectionHeader title="Student-by-Student Participation" />
          <div className="grid gap-4 sm:grid-cols-2">
            {studentCards.map((c) => (
              <div key={c.student.id} className="bridge-card p-5">
                <div className="flex items-center gap-3 mb-3">
                  <StudentAvatar initials={c.student.initials} color={c.student.color} size="lg" />
                  <div>
                    <p className="font-semibold">{c.student.name}</p>
                    <p className="text-xs text-muted-foreground">Group Finch</p>
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Speaking turns</span>
                    <span className="font-medium">{c.turns} ({c.pct}%)</span>
                  </div>
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <div className="h-full rounded-full bg-primary" style={{ width: `${c.pct}%` }} />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Engagement</span>
                    <span className={c.engColor}>{c.engagement}</span>
                  </div>
                  <p className="text-muted-foreground text-xs">{c.notable}</p>
                  <p className={`text-xs font-medium ${c.changeColor}`}>{c.change}</p>
                  <Textarea placeholder={`Add a private note about ${c.student.name.split(" ")[0]}…`} rows={2} className="mt-2" />
                  {c.showFlag && (
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-muted-foreground">Flag for follow-up (observational)</span>
                      <Switch />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Follow-up actions */}
        <div className="bridge-card">
          <SectionHeader title={<span className="flex items-center gap-1">Suggested Actions <span className="text-xs text-muted-foreground font-normal">(Teacher discretion required)</span></span>} />
          <div className="space-y-3">
            {[
              { text: "Check in briefly with Lena M. to see how she's doing this week.", urgency: "Low urgency" },
              { text: "Consider pairing Aiden with a more talkative partner in the next group warm-up activity.", urgency: "Pedagogical suggestion" },
              { text: "Extend the fairness topic next session — group showed strong interest and unresolved questions.", urgency: "Curriculum suggestion" },
            ].map((a, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-muted/30">
                <CheckCircle2 className="h-5 w-5 text-border hover:text-accent cursor-pointer shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm">{a.text}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{a.urgency}</p>
                </div>
                <Button variant="outline" size="sm">Add to Follow-Ups</Button>
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-4 italic">These suggestions are based on participation patterns observed in this session. They are pedagogical observations, not clinical recommendations.</p>
        </div>

        {/* Rating */}
        <div className="bridge-card text-center">
          <p className="text-sm font-medium mb-3">How useful was this session summary?</p>
          <div className="flex justify-center gap-1 mb-3">
            {[1, 2, 3, 4, 5].map((s) => (
              <button key={s} onClick={() => setRating(s)} aria-label={`Rate ${s} stars`}>
                <Star className={`h-6 w-6 ${s <= rating ? "fill-warning text-warning" : "text-border"}`} />
              </button>
            ))}
          </div>
          <Textarea placeholder="Optional comment…" rows={2} className="max-w-sm mx-auto" />
          <Button className="mt-3" size="sm">Submit Feedback</Button>
        </div>
      </div>
    </AppShell>
  );
}
