import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  MessageSquare,
  BarChart3,
  ClipboardCheck,
  TrendingUp,
  Shield,
  Star,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";

const features = [
  { icon: MessageSquare, title: "Structured Group Discussions", desc: "AI leads age-appropriate conversations on teacher-selected topics. Calm, curious, constructive." },
  { icon: BarChart3, title: "Balanced Participation", desc: "The facilitator gently encourages quieter voices and redirects over-participation without calling anyone out." },
  { icon: ClipboardCheck, title: "Teacher Summaries", desc: "After every session, receive a clear observational summary with participation patterns, engagement signals, and suggested follow-ups." },
  { icon: TrendingUp, title: "Longitudinal Trends", desc: "Track how each student's participation, engagement, and topic interest evolves across weeks — not snapshots." },
  { icon: Shield, title: "Privacy by Design", desc: "Families are informed. Data is retained on your terms. Teachers control access. Outputs are observational, never diagnostic." },
  { icon: Star, title: "Age-Appropriate AI", desc: "The facilitator speaks at a Flesch-Kincaid Grade 3–5 level, uses encouraging language, and never singles out students negatively." },
];

const trustSignals = [
  "AI-facilitated, teacher-controlled",
  "Observational signals only — not diagnostic",
  "FERPA-aligned data practices",
  "Role-based access & audit logs",
  "No data sold, ever",
];

const steps = [
  { num: "1", title: "Create a Session", desc: "Teacher selects a topic and student group" },
  { num: "2", title: "Students Discuss", desc: "AI leads the discussion while teacher observes" },
  { num: "3", title: "Review & Act", desc: "Teacher reviews summary and acts on follow-ups" },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-card">
      {/* Nav */}
      <nav className="sticky top-0 z-50 border-b border-border bg-card/90 backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <span className="text-sm font-bold text-primary-foreground">B</span>
            </div>
            <span className="text-xl font-bold text-primary">Bridge</span>
          </div>
          <div className="hidden items-center gap-8 text-sm text-muted-foreground md:flex">
            <a href="#features" className="hover:text-foreground transition-colors">Features</a>
            <a href="#how" className="hover:text-foreground transition-colors">How It Works</a>
            <a href="#privacy" className="hover:text-foreground transition-colors">Privacy</a>
            <a href="#schools" className="hover:text-foreground transition-colors">For Schools</a>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" className="hidden sm:inline-flex">Request Demo</Button>
            <Link to="/login">
              <Button size="sm">Teacher Login</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-secondary/5 to-transparent" />
        <div className="relative mx-auto max-w-7xl px-6 py-20 md:py-32">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div className="animate-fade-in">
              <h1 className="text-4xl font-bold leading-tight tracking-tight md:text-5xl lg:text-[48px]">
                Give every student a voice. Give every teacher a clearer picture.
              </h1>
              <p className="mt-6 text-lg text-muted-foreground md:text-xl leading-relaxed max-w-xl">
                Bridge facilitates small-group discussions for K–6 students and surfaces observational insights to help teachers support every learner — safely, transparently, and without replacing human judgment.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <Button size="lg" className="text-base px-8">Request a Demo</Button>
                <a href="#how" className="inline-flex items-center gap-2 text-primary font-medium hover:underline py-3">
                  See How It Works <ArrowRight className="h-4 w-4" />
                </a>
              </div>
            </div>
            <div className="animate-fade-in hidden lg:block">
              <div className="bridge-card-elevated p-8 bg-gradient-to-br from-card to-primary/5">
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-3 w-3 rounded-full bg-accent animate-pulse" />
                  <span className="text-sm font-medium text-accent">Live Discussion</span>
                </div>
                <div className="space-y-4">
                  {[
                    { initials: "AI", color: "hsl(245, 100%, 69%)", text: "What does fairness mean to you?" },
                    { initials: "LM", color: "hsl(174, 60%, 45%)", text: "I think fair means everyone gets a turn..." },
                    { initials: "MJ", color: "hsl(25, 80%, 55%)", text: "But sometimes fair isn't the same as equal!" },
                    { initials: "PS", color: "hsl(270, 60%, 55%)", text: "That's a good point, Marcus..." },
                  ].map((msg, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="bridge-avatar w-8 h-8 text-[10px] shrink-0" style={{ backgroundColor: msg.color, color: "#fff" }}>
                        {msg.initials}
                      </div>
                      <div className="rounded-xl bg-muted/50 px-3 py-2 text-sm">{msg.text}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust bar */}
      <section className="border-y border-border bg-muted/30 py-6">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-8 gap-y-3 px-6">
          {trustSignals.map((s) => (
            <div key={s} className="bridge-trust-signal">
              <CheckCircle2 className="h-4 w-4 text-accent shrink-0" />
              <span>{s}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="mx-auto max-w-7xl px-6 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold">Built for trust, clarity, and every learner</h2>
          <p className="mt-3 text-muted-foreground max-w-2xl mx-auto">Everything teachers need to facilitate meaningful group discussions and understand their students better.</p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <div key={f.title} className="bridge-card hover:shadow-md transition-shadow group">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                <f.icon className="h-5 w-5" />
              </div>
              <h3 className="mb-2">{f.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="bg-muted/30 py-20">
        <div className="mx-auto max-w-7xl px-6">
          <h2 className="text-center text-3xl font-bold mb-12">How Bridge Works</h2>
          <div className="grid gap-8 md:grid-cols-3">
            {steps.map((s) => (
              <div key={s.num} className="text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-xl font-bold text-primary-foreground">
                  {s.num}
                </div>
                <h3 className="mb-2">{s.title}</h3>
                <p className="text-sm text-muted-foreground">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Privacy callout */}
      <section id="privacy" className="bg-gradient-to-r from-secondary/10 to-primary/10 py-16">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <Shield className="mx-auto h-10 w-10 text-secondary mb-4" />
          <p className="text-lg font-medium leading-relaxed">
            Bridge does not diagnose, assess mental health, detect disorders, or identify family problems. All outputs are observational signals based on in-session interaction patterns. Teachers review everything. Parents can request data access at any time.
          </p>
        </div>
      </section>

      {/* Testimonials */}
      <section id="schools" className="mx-auto max-w-7xl px-6 py-20">
        <h2 className="text-center text-3xl font-bold mb-12">What educators are saying</h2>
        <div className="grid gap-8 md:grid-cols-2">
          {[
            { quote: "Bridge has made me so much more intentional about which students I check in with. The summaries save me hours.", author: "Ms. K. Torres", role: "3rd Grade Teacher, Denver USD" },
            { quote: "We piloted this with 4 classrooms. The privacy model and teacher controls were what got us to approve it.", author: "Dr. M. Osei", role: "Curriculum Director" },
          ].map((t) => (
            <div key={t.author} className="bridge-card">
              <p className="text-base italic leading-relaxed mb-4">"{t.quote}"</p>
              <p className="font-semibold text-sm">{t.author}</p>
              <p className="text-xs text-muted-foreground">{t.role}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-primary py-16">
        <div className="mx-auto max-w-2xl px-6 text-center">
          <h2 className="text-3xl font-bold text-primary-foreground mb-4">Ready to bring Bridge to your school?</h2>
          <p className="text-primary-foreground/80 mb-8">Join the schools already using Bridge to support every student's voice.</p>
          <Button size="lg" variant="secondary" className="text-base px-8">Request a Demo</Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card py-12">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary">
                <span className="text-xs font-bold text-primary-foreground">B</span>
              </div>
              <span className="font-bold text-primary">Bridge</span>
            </div>
            <div className="flex flex-wrap gap-6 text-sm text-muted-foreground">
              <a href="#" className="hover:text-foreground">Privacy Policy</a>
              <a href="#" className="hover:text-foreground">Terms of Service</a>
              <a href="#" className="hover:text-foreground">Contact</a>
            </div>
          </div>
          <p className="mt-6 text-xs text-muted-foreground">© 2025 Bridge Education Inc. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
