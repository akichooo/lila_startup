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
  Mic,
  Volume2,
  Users,
  Upload,
} from "lucide-react";
import Blobby from "@/components/mascots/Blobby";
import Tangerine from "@/components/mascots/Tangerine";
import ZapZing from "@/components/mascots/ZapZing";

const features = [
  { icon: MessageSquare, title: "Structured Group Discussions", desc: "Lila leads age-appropriate conversations on teacher-selected topics. Calm, curious, constructive.", gradient: "linear-gradient(135deg, #A78BFA, #C4B5FD)" },
  { icon: BarChart3, title: "Balanced Participation", desc: "Lila gently encourages quieter voices and redirects over-participation without calling anyone out.", gradient: "linear-gradient(135deg, #6EE7B7, #7DD3FC)" },
  { icon: ClipboardCheck, title: "Teacher Summaries", desc: "After every session, receive a clear observational summary with participation patterns and suggested follow-ups.", gradient: "linear-gradient(135deg, #FB7185, #FDBA74)" },
  { icon: Upload, title: "Audio Session Upload", desc: "Upload recorded class discussions and let Lila generate observational summaries from the audio.", gradient: "linear-gradient(135deg, #7DD3FC, #A78BFA)" },
  { icon: TrendingUp, title: "Longitudinal Trends", desc: "Track how each student's participation, engagement, and topic interest evolves across weeks.", gradient: "linear-gradient(135deg, #FCD34D, #FDBA74)" },
  { icon: Shield, title: "Privacy by Design", desc: "Families are informed. Data is retained on your terms. Teachers control access. Outputs are observational, never diagnostic.", gradient: "linear-gradient(135deg, #C4B5FD, #EDE9FF)" },
];

const steps = [
  { num: "1", title: "Create a Session", desc: "Teacher selects a topic and student group" },
  { num: "2", title: "Students Discuss", desc: "Lila leads the discussion while teacher observes" },
  { num: "3", title: "Review & Act", desc: "Teacher reviews summary and acts on follow-ups" },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-card">
      {/* Nav */}
      <nav className="sticky top-0 z-50 bg-card/90 backdrop-blur-sm" style={{ borderBottom: "1px solid #EDE9FF" }}>
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-2xl" style={{ background: "linear-gradient(135deg, #A78BFA 0%, #FB7185 100%)" }}>
              <span className="text-sm font-extrabold text-white">L</span>
            </div>
            <span className="text-[22px] font-extrabold" style={{ color: "#2D1B69" }}>Lila</span>
          </div>
          <div className="hidden items-center gap-8 text-sm font-bold md:flex" style={{ color: "#2D1B69" }}>
            <a href="#features" className="hover:text-primary transition-colors">Features</a>
            <a href="#how" className="hover:text-primary transition-colors">How It Works</a>
            <a href="#privacy" className="hover:text-primary transition-colors">Privacy</a>
            <a href="#schools" className="hover:text-primary transition-colors">For Schools</a>
          </div>
          <div className="flex items-center gap-3">
            <button className="lila-btn-secondary hidden sm:inline-flex text-sm !py-2 !px-5">Request Demo</button>
            <Link to="/login">
              <button className="lila-btn-primary text-sm !py-2 !px-5">Teacher Login</button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden" style={{ background: "linear-gradient(135deg, #EDE9FF 0%, #FCE7F3 50%, #E0F2FE 100%)" }}>
        <div className="relative mx-auto max-w-7xl px-6 py-20 md:py-32">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div className="animate-fade-in">
              <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-bold mb-6" style={{ background: "#EDE9FF", color: "#7C3AED" }}>
                💜 AI-facilitated · Child-centered · Teacher-controlled
              </div>
              <h1 className="text-4xl font-extrabold leading-tight tracking-tight md:text-5xl lg:text-[52px]" style={{ color: "#2D1B69" }}>
                Every child deserves a voice. Lila makes it happen.
              </h1>
              <p className="mt-6 text-lg md:text-xl leading-relaxed max-w-xl" style={{ color: "#7C6FAA" }}>
                Lila guides small-group discussions for children aged 6–12 and surfaces gentle, observational insights to help teachers support every learner — safely, warmly, and without replacing human judgment.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <button className="lila-btn-primary text-base">Request a Demo</button>
                <a href="#how" className="inline-flex items-center gap-2 font-bold py-3" style={{ color: "#FB7185" }}>
                  See How It Works <ArrowRight className="h-4 w-4" />
                </a>
              </div>
              <div className="flex flex-wrap gap-2 mt-6">
                {["🔒 Never diagnostic", "👩‍🏫 Teacher-controlled", "💜 FERPA-aligned"].map((t) => (
                  <span key={t} className="inline-flex items-center rounded-full px-3 py-1 text-xs font-bold bg-white" style={{ border: "1px solid #EDE9FF", color: "#2D1B69" }}>{t}</span>
                ))}
              </div>
            </div>
            <div className="animate-fade-in hidden lg:flex justify-center relative items-center">
              <div className="flex items-end gap-4">
                <Blobby size={100} state="idle" />
                <Tangerine size={120} state="idle" />
                <ZapZing size={100} state="idle" />
              </div>
              <div className="absolute top-8 right-12 text-4xl animate-bounce" style={{ animationDuration: "3s" }}>⭐</div>
              <div className="absolute bottom-16 left-8 text-3xl animate-bounce" style={{ animationDuration: "2.5s", animationDelay: "0.5s" }}>💬</div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust bar */}
      <section className="py-6" style={{ background: "#F5F3FF", borderTop: "1px solid #EDE9FF", borderBottom: "1px solid #EDE9FF" }}>
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-8 gap-y-3 px-6">
          {[
            "AI-facilitated, teacher-controlled",
            "Observational signals only — not diagnostic",
            "FERPA-aligned data practices",
            "Role-based access & audit logs",
            "No data sold, ever",
          ].map((s) => (
            <div key={s} className="lila-trust-signal">
              <CheckCircle2 className="h-4 w-4 shrink-0" style={{ color: "#6EE7B7" }} />
              <span>{s}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="mx-auto max-w-7xl px-6 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-extrabold" style={{ color: "#2D1B69" }}>Built for trust, clarity, and every learner</h2>
          <p className="mt-3 max-w-2xl mx-auto" style={{ color: "#7C6FAA" }}>Everything teachers need to facilitate meaningful group discussions and understand their students better.</p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <div key={f.title} className="lila-card group overflow-hidden">
              <div className="h-1 -mx-6 -mt-6 mb-5" style={{ background: f.gradient }} />
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-2xl" style={{ background: "#EDE9FF", color: "#7C3AED" }}>
                <f.icon className="h-5 w-5" />
              </div>
              <h3 className="mb-2 font-bold" style={{ color: "#2D1B69" }}>{f.title}</h3>
              <p className="text-sm leading-relaxed" style={{ color: "#7C6FAA" }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Voice Room Featured */}
      <section className="mx-auto max-w-7xl px-6 pb-20">
        <div className="rounded-3xl p-10 md:p-16 text-center relative overflow-hidden" style={{ background: "linear-gradient(135deg, #A78BFA 0%, #FB7185 50%, #FCD34D 100%)" }}>
          <span className="inline-flex items-center rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-wide mb-4" style={{ background: "rgba(255,255,255,0.2)", color: "white" }}>
            🚧 Coming Soon · Flagship Innovation
          </span>
          <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-3">Introducing Lila Voice Room</h2>
          <p className="text-white/80 max-w-2xl mx-auto mb-8">
            Soon, Lila will hold live spoken group discussions with your students — age-appropriate, educationally guided, and emotionally safe.
          </p>
          <div className="flex justify-center gap-4">
            <Link to="/voice-room">
              <button className="bg-white font-bold rounded-full px-8 py-3.5 text-gradient-primary transition-all hover:scale-105">Preview Voice Experience →</button>
            </Link>
          </div>
          <div className="absolute bottom-4 right-8 opacity-60 hidden md:block"><Blobby size={70} state="idle" /></div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="py-20" style={{ background: "#F5F3FF" }}>
        <div className="mx-auto max-w-7xl px-6">
          <h2 className="text-center text-3xl font-extrabold mb-12" style={{ color: "#2D1B69" }}>How Lila Works</h2>
          <div className="grid gap-8 md:grid-cols-3">
            {steps.map((s) => (
              <div key={s.num} className="text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full text-xl font-extrabold text-white" style={{ background: "linear-gradient(135deg, #A78BFA 0%, #FB7185 100%)" }}>
                  {s.num}
                </div>
                <h3 className="mb-2 font-bold" style={{ color: "#2D1B69" }}>{s.title}</h3>
                <p className="text-sm" style={{ color: "#7C6FAA" }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Privacy callout */}
      <section id="privacy" className="py-16" style={{ background: "#2D1B69" }}>
        <div className="mx-auto max-w-3xl px-6 text-center">
          <Shield className="mx-auto h-10 w-10 mb-4" style={{ color: "#C4B5FD" }} />
          <p className="text-lg font-bold leading-relaxed text-white">
            Lila does not diagnose, assess mental health, detect disorders, or identify family problems. All outputs are observational signals based on in-session interaction patterns. Teachers review everything. Families can request data access at any time.
          </p>
          <div className="absolute bottom-2 right-8 text-3xl opacity-30 hidden md:block">💜</div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="schools" className="mx-auto max-w-7xl px-6 py-20">
        <h2 className="text-center text-3xl font-extrabold mb-12" style={{ color: "#2D1B69" }}>What educators are saying</h2>
        <div className="grid gap-8 md:grid-cols-2">
          {[
            { quote: "Lila has made me so much more intentional about which students I check in with. The summaries save me hours.", author: "Ms. K. Torres", role: "3rd Grade Teacher, Denver USD" },
            { quote: "We piloted this with 4 classrooms. The privacy model and teacher controls were what got us to approve it.", author: "Dr. M. Osei", role: "Curriculum Director" },
          ].map((t) => (
            <div key={t.author} className="lila-card">
              <span className="text-4xl block mb-3" style={{ color: "#C4B5FD" }}>"</span>
              <p className="text-base italic leading-relaxed mb-4" style={{ color: "#2D1B69" }}>"{t.quote}"</p>
              <p className="font-bold text-sm" style={{ color: "#A78BFA" }}>{t.author}</p>
              <p className="text-xs" style={{ color: "#7C6FAA" }}>{t.role}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 rounded-3xl mx-6 mb-8" style={{ background: "linear-gradient(135deg, #A78BFA 0%, #FB7185 100%)" }}>
        <div className="mx-auto max-w-2xl px-6 text-center">
          <h2 className="text-3xl font-extrabold text-white mb-4">Ready to bring Lila to your school?</h2>
          <p className="text-white/80 mb-8">Join the schools already using Lila to support every student's voice.</p>
          <button className="bg-white font-bold rounded-full px-8 py-3.5 transition-all hover:scale-105" style={{ color: "#7C3AED" }}>Request a Demo</button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12" style={{ background: "#2D1B69" }}>
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-xl" style={{ background: "linear-gradient(135deg, #A78BFA 0%, #FB7185 100%)" }}>
                <span className="text-xs font-extrabold text-white">L</span>
              </div>
              <span className="font-extrabold text-white">Lila</span>
            </div>
            <div className="flex flex-wrap gap-6 text-sm" style={{ color: "#C4B5FD" }}>
              <a href="#" className="hover:text-white">Privacy Policy</a>
              <a href="#" className="hover:text-white">Terms of Service</a>
              <a href="#" className="hover:text-white">Contact</a>
            </div>
          </div>
          <p className="mt-6 text-xs flex items-center gap-2" style={{ color: "#C4B5FD" }}>
            <span className="text-lg">💜</span> © 2025 Lila Education Inc. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
