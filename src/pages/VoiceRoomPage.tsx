import { useState, useEffect, useCallback, useRef } from "react";
import { AppShell } from "@/components/bridge/AppShell";
import { Input } from "@/components/ui/input";
import { useLilaSound } from "@/contexts/SoundContext";
import {
  Mic,
  MicOff,
  Lock,
  CheckCircle2,
  Loader2,
  Sparkles,
  Volume2,
  MonitorSmartphone,
} from "lucide-react";
import Blobby from "@/components/mascots/Blobby";
import Tangerine from "@/components/mascots/Tangerine";
import ZapZing from "@/components/mascots/ZapZing";

type MascotState = "idle" | "listening" | "thinking" | "speaking";
type AgeGroup = "6-8" | "9-10" | "11-12";

const AGE_THEMES: Record<AgeGroup, { label: string; mascotName: string; personality: string; desc: string; sampleQ: string; badges: string; gradient: string; accent: string }> = {
  "6-8": {
    label: "Ages 6–8 · Blobby",
    mascotName: "Blobby",
    personality: "Playful & Curious",
    desc: "For younger learners, Lila uses simple language, lots of encouragement, and a bouncy, energetic voice persona to keep discussion fun and inclusive.",
    sampleQ: '"What does being kind look like? Can you show me with your hands?"',
    badges: "Simpler language · Short turns · High encouragement",
    gradient: "linear-gradient(135deg, #E0F0FF 0%, #FFF8D6 100%)",
    accent: "#6BAAFF",
  },
  "9-10": {
    label: "Ages 9–10 · Tangerine",
    mascotName: "Tangerine",
    personality: "Curious & Collaborative",
    desc: "For this age group, Lila encourages collaborative reasoning, invites comparisons, and gently introduces nuance to build critical thinking.",
    sampleQ: '"If two people both follow the rules but get different results, is that still fair? What do you think?"',
    badges: "Collaborative prompts · Nuance building · Balanced turns",
    gradient: "linear-gradient(135deg, #FFF3E0 0%, #ECFDF5 100%)",
    accent: "#FF8C00",
  },
  "11-12": {
    label: "Ages 11–12 · Zap & Zing",
    mascotName: "Zap & Zing",
    personality: "Thoughtful & Grounded",
    desc: "For older students, Lila introduces layered concepts, invites reflection on multiple perspectives, and respects more complex emotional registers.",
    sampleQ: '"Is it possible to disagree with a rule and still think it\'s fair? How would you argue both sides?"',
    badges: "Multi-perspective prompts · Reflective tone · Complex concepts",
    gradient: "linear-gradient(135deg, #F0FFF4 0%, #FFF0F9 100%)",
    accent: "#4CAF50",
  },
};

const SAMPLE_CONVERSATION = [
  { speaker: "lila", text: "Good morning, everyone! Today we're going to talk about something really interesting — fairness. Has anyone ever felt like something wasn't quite fair? You can share when you're ready." },
  { speaker: "student", name: "Lena", text: "One time my brother got a bigger piece of cake than me and I didn't think that was fair!" },
  { speaker: "lila", text: "I can understand why that felt frustrating, Lena! That's a great example. Does anyone else have a story like that? What about you, Marcus?" },
  { speaker: "student", name: "Marcus", text: "Sometimes in sports the rules feel unfair but they're the same for everyone." },
  { speaker: "lila", text: "Really thoughtful, Marcus! So fairness might mean the same rules — but does the same always feel fair? Priya, what do you think?" },
  { speaker: "student", name: "Priya", text: "I think fair means everyone is always happy." },
  { speaker: "lila", text: "That's an interesting idea! Sometimes a fair decision might not make everyone happy right away — like a rule that's hard at first but good for everyone. Can anyone think of an example like that?", isReframe: true },
  { speaker: "student", name: "Omar", text: "Like wearing helmets when you ride bikes. I don't love it but it keeps everyone safe." },
  { speaker: "lila", text: "That's a perfect example, Omar! Safety rules can feel unfair in the moment, but they protect everyone equally. You're all brilliant thinkers today. 🌟" },
];

const ROADMAP = [
  { phase: "Phase 1", title: "Text facilitation", desc: "Lila text-based group discussions with post-session summaries.", status: "done" as const },
  { phase: "Phase 2", title: "Audio upload review", desc: "Upload recorded sessions for Lila to review and summarize.", status: "done" as const },
  { phase: "Phase 3", title: "Voice Room Beta", desc: "Live voice facilitation for small groups with teacher monitoring.", status: "progress" as const, date: "Q2 2026" },
  { phase: "Phase 4", title: "Adaptive voice personas", desc: "Age-specific voice tone, pacing, and vocabulary models.", status: "planned" as const, date: "Q4 2026" },
];

function MascotComponent({ ageGroup, state, size = 200 }: { ageGroup: AgeGroup; state: MascotState; size?: number }) {
  switch (ageGroup) {
    case "6-8": return <Blobby size={size} state={state} />;
    case "9-10": return <Tangerine size={size} state={state} />;
    case "11-12": return <ZapZing size={size} state={state} />;
  }
}

function WaveformBars({ active, variant, accent }: { active: boolean; variant: "listening" | "speaking"; accent?: string }) {
  const barsRef = useRef<(HTMLDivElement | null)[]>([]);
  const intervalRef = useRef<ReturnType<typeof setInterval>>();

  useEffect(() => {
    if (active) {
      const interval = variant === "listening" ? 80 : 120;
      const [min, max] = variant === "listening" ? [4, 36] : [8, 28];
      intervalRef.current = setInterval(() => {
        barsRef.current.forEach((bar) => {
          if (bar) bar.style.height = `${Math.random() * (max - min) + min}px`;
        });
      }, interval);
    } else {
      barsRef.current.forEach((bar) => {
        if (bar) bar.style.height = "4px";
      });
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [active, variant]);

  return (
    <div className="flex items-end justify-center gap-1.5 h-10">
      {Array.from({ length: 12 }).map((_, i) => (
        <div
          key={i}
          ref={(el) => { barsRef.current[i] = el; }}
          className="w-1 rounded-full transition-[height] duration-[80ms] ease-linear"
          style={{ height: "4px", backgroundColor: accent || (variant === "speaking" ? "#FB7185" : "#A78BFA") }}
        />
      ))}
    </div>
  );
}

function MascotDisplay({ ageGroup, state }: { ageGroup: AgeGroup; state: MascotState }) {
  const theme = AGE_THEMES[ageGroup];
  const bubbleText: Record<MascotState, string> = {
    idle: "Tap the mic to begin a preview conversation…",
    listening: "Listening…",
    thinking: "Lila is thinking…",
    speaking: "Here's what I'd say…",
  };

  return (
    <div className="relative flex flex-col items-center">
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className={`absolute rounded-full ${state !== "idle" ? "voice-ring-pulse" : "opacity-10"}`}
            style={{
              width: `${140 + i * 40}px`,
              height: `${140 + i * 40}px`,
              animationDelay: `${i * 0.8}s`,
              border: `2px solid ${theme.accent}33`,
            }}
          />
        ))}
      </div>
      <div className="relative z-10 flex h-[200px] w-[200px] items-center justify-center transition-all duration-300">
        <MascotComponent ageGroup={ageGroup} state={state} size={160} />
      </div>
      <div className="mt-4 rounded-2xl bg-white px-4 py-2 text-sm max-w-xs text-center" style={{ border: `1.5px solid ${theme.accent}33`, color: "#7C6FAA", boxShadow: `0 2px 12px ${theme.accent}14` }}>
        {state === "listening" && <span className="voice-ellipsis">{bubbleText[state]}</span>}
        {state !== "listening" && bubbleText[state]}
      </div>
    </div>
  );
}

function StateChip({ state }: { state: MascotState }) {
  const config: Record<MascotState, { color: string; label: string }> = {
    idle: { color: "#A89DC4", label: "Idle" },
    listening: { color: "#6EE7B7", label: "Listening" },
    thinking: { color: "#FDBA74", label: "Thinking" },
    speaking: { color: "#A78BFA", label: "Speaking" },
  };
  const { color, label } = config[state];
  return (
    <span className="lila-badge-purple text-xs transition-all">
      <span className="mr-1.5 h-2 w-2 rounded-full inline-block" style={{ backgroundColor: color }} />
      {label}
    </span>
  );
}

export default function VoiceRoomPage() {
  const [ageGroup, setAgeGroup] = useState<AgeGroup>("6-8");
  const [mascotState, setMascotState] = useState<MascotState>("idle");
  const { startBackgroundMusic, stopBackgroundMusic } = useLilaSound();

  useEffect(() => {
    startBackgroundMusic("voiceroom");
    return () => stopBackgroundMusic();
  }, [startBackgroundMusic, stopBackgroundMusic]);
  const [conversationVisible, setConversationVisible] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();
  const theme = AGE_THEMES[ageGroup];

  const handleMicClick = useCallback(() => {
    if (mascotState !== "idle") return;
    setMascotState("listening");
    timerRef.current = setTimeout(() => {
      setMascotState("thinking");
      timerRef.current = setTimeout(() => {
        setMascotState("speaking");
        timerRef.current = setTimeout(() => {
          setMascotState("idle");
        }, 5000);
      }, 2000);
    }, 3000);
  }, [mascotState]);

  useEffect(() => {
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, []);

  const playConversation = useCallback(() => {
    setConversationVisible(0);
    setIsPlaying(true);
    let i = 0;
    const show = () => {
      i++;
      setConversationVisible(i);
      if (i < SAMPLE_CONVERSATION.length) {
        setTimeout(show, 600);
      } else {
        setIsPlaying(false);
      }
    };
    setTimeout(show, 300);
  }, []);

  useEffect(() => { playConversation(); }, []);

  return (
    <AppShell pageTitle="Voice Room">
      <div className="space-y-12">
        {/* Hero */}
        <div className="rounded-3xl p-8 md:p-12 lg:p-16" style={{ background: "linear-gradient(135deg, #EDE9FF 0%, #FCE7F3 50%, #E0F2FE 100%)" }}>
          <div className="grid lg:grid-cols-2 gap-10 items-center">
            <div className="space-y-5">
              <span className="lila-badge-amber text-[10px] uppercase tracking-wide">🚧 In Development · Interactive Preview</span>
              <h1 className="text-4xl font-extrabold leading-tight" style={{ color: "#2D1B69" }}>Meet Lila's Voice Room</h1>
              <p className="text-[17px] leading-relaxed" style={{ color: "#7C6FAA" }}>
                Talking Lila is our next major feature — a live, spoken facilitation experience where Lila guides your students through group discussions using natural voice conversation. Age-appropriate, educationally grounded, and built with the same privacy-first values you trust today.
              </p>
              <div className="flex flex-wrap gap-2 text-xs">
                <span className="lila-badge-purple">🎙 Voice-first interaction</span>
                <span className="lila-badge-purple">🧒 Ages 6–12</span>
                <span className="lila-badge-purple">🔒 Teacher-controlled</span>
              </div>
              <div className="flex flex-wrap gap-3 pt-2">
                <button className="lila-btn-primary">Try Interactive Preview</button>
                <button className="lila-btn-secondary">Join Waitlist</button>
                <a href="#how-it-works" className="inline-flex items-center gap-1 text-sm font-bold py-2" style={{ color: "#A78BFA" }}>Learn More ↓</a>
              </div>
              <p className="text-xs italic" style={{ color: "#A89DC4" }}>This page contains a simulated preview of a feature currently in development. No live voice processing occurs.</p>
            </div>
            <div className="flex justify-center">
              <MascotDisplay ageGroup={ageGroup} state="idle" />
            </div>
          </div>
        </div>

        {/* Mascot Interaction Zone */}
        <section>
          <div className="text-center mb-6">
            <h2 className="font-extrabold" style={{ color: "#2D1B69" }}>Preview Lila's Voice States</h2>
            <p className="mt-1" style={{ color: "#7C6FAA" }}>Click the microphone to simulate how Lila will respond during a live session. This is an interactive prototype — no audio is captured or processed.</p>
          </div>

          <div className="lila-card-elevated relative min-h-[420px] flex flex-col items-center py-10 px-6" style={{ borderColor: "#C4B5FD" }}>
            <div className="absolute top-4 right-4">
              <StateChip state={mascotState} />
            </div>

            {/* Age selector tabs with mascots */}
            <div className="flex gap-1 rounded-2xl p-1 mb-8" style={{ background: "#EDE9FF" }}>
              {(["6-8", "9-10", "11-12"] as AgeGroup[]).map((ag) => (
                <button
                  key={ag}
                  onClick={() => setAgeGroup(ag)}
                  className="rounded-xl px-4 py-2 text-sm font-bold transition-all flex items-center gap-2"
                  style={ageGroup === ag ? { background: AGE_THEMES[ag].gradient, color: "#2D1B69", boxShadow: "0 2px 8px rgba(167,139,250,0.2)" } : { color: "#7C6FAA" }}
                >
                  <MascotComponent ageGroup={ag} state="idle" size={28} />
                  <span className="hidden sm:inline">{AGE_THEMES[ag].label}</span>
                  <span className="sm:hidden">{ag}</span>
                </button>
              ))}
            </div>

            <MascotDisplay ageGroup={ageGroup} state={mascotState} />

            <div className="mt-6 w-full max-w-xs">
              <WaveformBars active={mascotState === "listening" || mascotState === "speaking"} variant={mascotState === "speaking" ? "speaking" : "listening"} accent={theme.accent} />
            </div>

            {/* Mic button */}
            <button
              onClick={handleMicClick}
              disabled={mascotState !== "idle"}
              className="mt-6 flex h-20 w-20 items-center justify-center rounded-full transition-all duration-200"
              style={
                mascotState === "idle"
                  ? { background: "white", border: `2px solid ${theme.accent}`, color: theme.accent, cursor: "pointer" }
                  : mascotState === "listening"
                  ? { background: `linear-gradient(135deg, ${theme.accent} 0%, #FB7185 100%)`, border: "2px solid transparent", color: "white" }
                  : { background: "#EDE9FF", border: "2px solid #EDE9FF", color: "#A89DC4", cursor: "default" }
              }
              aria-label="Simulate voice interaction"
            >
              {mascotState === "listening" ? <Mic className="h-8 w-8" /> : mascotState === "idle" ? <Mic className="h-8 w-8" /> : <MicOff className="h-8 w-8" />}
            </button>
            <span className="mt-2 text-xs" style={{ color: "#A89DC4" }}>Tap to simulate listening</span>
          </div>
        </section>

        {/* Simulated Conversation */}
        <section>
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <h2 className="font-extrabold" style={{ color: "#2D1B69" }}>Sample Conversation Preview</h2>
            <span className="lila-badge-amber text-[10px] uppercase tracking-wide">Demo Content — Not a Live Session</span>
          </div>
          <p className="text-sm mb-6" style={{ color: "#7C6FAA" }}>Here's a glimpse of how Lila will guide a student group discussion using voice.</p>

          <div className="lila-card max-h-[400px] overflow-y-auto space-y-4 p-6">
            {SAMPLE_CONVERSATION.slice(0, conversationVisible).map((msg, i) => (
              <div
                key={i}
                className={`flex gap-3 animate-fade-in ${msg.speaker === "student" ? "flex-row-reverse" : ""}`}
              >
                <div className="h-9 w-9 shrink-0 rounded-full flex items-center justify-center text-sm font-bold text-white"
                  style={{ backgroundColor: msg.speaker === "lila" ? "#A78BFA" : "#EDE9FF", color: msg.speaker === "lila" ? "white" : "#2D1B69" }}>
                  {msg.speaker === "lila" ? "🟣" : "👦"}
                </div>
                <div className="max-w-md rounded-2xl px-4 py-3 text-sm leading-relaxed"
                  style={msg.speaker === "lila"
                    ? { background: "#EDE9FF", color: "#2D1B69", borderLeft: (msg as any).isReframe ? "3px solid #FDBA74" : "3px solid #A78BFA" }
                    : { background: "white", color: "#2D1B69", border: "1.5px solid #EDE9FF" }
                  }>
                  {msg.speaker === "student" && <span className="text-xs font-bold block mb-1" style={{ color: "#A78BFA" }}>{(msg as any).name}</span>}
                  {msg.text}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 flex items-center gap-4">
            <button className="lila-btn-secondary text-sm" onClick={playConversation} disabled={isPlaying}>
              {conversationVisible >= SAMPLE_CONVERSATION.length ? "Replay ↺" : "Play Preview"}
            </button>
            <span className="text-xs" style={{ color: "#A89DC4" }}>This sample dialogue is illustrative only.</span>
          </div>
        </section>

        {/* Age Cards with mascots */}
        <section>
          <h2 className="font-extrabold text-center mb-8" style={{ color: "#2D1B69" }}>Lila adapts to your students' age</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {(["6-8", "9-10", "11-12"] as AgeGroup[]).map((ag) => {
              const t = AGE_THEMES[ag];
              return (
                <div key={ag} className="lila-card overflow-hidden">
                  <div className="-mx-6 -mt-6 mb-5 px-6 py-5 flex items-center justify-center" style={{ background: t.gradient }}>
                    <MascotComponent ageGroup={ag} state="idle" size={100} />
                  </div>
                  <h3 className="font-bold mb-1" style={{ color: "#2D1B69" }}>{t.personality}</h3>
                  <p className="text-sm leading-relaxed mb-3" style={{ color: "#7C6FAA" }}>{t.desc}</p>
                  <p className="text-sm italic mb-3" style={{ color: "#2D1B69" }}>{t.sampleQ}</p>
                  <span className="text-xs" style={{ color: "#A89DC4" }}>{t.badges}</span>
                </div>
              );
            })}
          </div>
        </section>

        {/* How it will work */}
        <section id="how-it-works">
          <h2 className="font-extrabold text-center mb-10" style={{ color: "#2D1B69" }}>How Talking Lila will work</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { num: "1", icon: Sparkles, title: "Teacher sets the topic and selects the group", desc: "Teacher configures the session just like today: topic, group, age range, duration." },
              { num: "2", icon: Volume2, title: "Students join the Voice Room", desc: "Each student connects from a device. Lila greets them by name and begins the guided discussion using natural spoken voice." },
              { num: "3", icon: MonitorSmartphone, title: "Teacher monitors and reviews", desc: "Teacher watches the live session, can pause at any moment, and receives the same observational summary." },
            ].map((s) => (
              <div key={s.num} className="text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full text-xl font-extrabold text-white" style={{ background: "linear-gradient(135deg, #A78BFA 0%, #FB7185 100%)" }}>
                  {s.num}
                </div>
                <h3 className="mb-2 font-bold" style={{ color: "#2D1B69" }}>{s.title}</h3>
                <p className="text-sm" style={{ color: "#7C6FAA" }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Roadmap */}
        <section>
          <div className="flex flex-wrap items-center gap-3 mb-8">
            <h2 className="font-extrabold" style={{ color: "#2D1B69" }}>What's coming in Talking Lila</h2>
            <span className="lila-badge-amber text-[10px] uppercase tracking-wide">In Development</span>
          </div>
          <div className="relative">
            <div className="absolute left-6 top-0 bottom-0 w-0.5 md:left-1/2" style={{ background: "linear-gradient(180deg, #6EE7B7, #A78BFA, #FDBA74, #EDE9FF)" }} />
            <div className="space-y-8">
              {ROADMAP.map((m, i) => (
                <div key={i} className={`relative flex items-start gap-4 md:gap-8 ${i % 2 === 1 ? "md:flex-row-reverse" : ""}`}>
                  <div className="relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-2 bg-white md:mx-auto"
                    style={{ borderColor: m.status === "done" ? "#6EE7B7" : m.status === "progress" ? "#FDBA74" : "#EDE9FF" }}>
                    {m.status === "done" && <CheckCircle2 className="h-5 w-5" style={{ color: "#6EE7B7" }} />}
                    {m.status === "progress" && <Loader2 className="h-5 w-5 animate-spin" style={{ color: "#FDBA74" }} />}
                    {m.status === "planned" && <span className="text-lg">🔮</span>}
                  </div>
                  <div className="flex-1 lila-card">
                    <span className="text-xs font-bold uppercase tracking-wide" style={{ color: "#A89DC4" }}>{m.phase}</span>
                    <h3 className="font-bold mt-1" style={{ color: "#2D1B69" }}>{m.title}</h3>
                    <p className="text-sm mt-1" style={{ color: "#7C6FAA" }}>{m.desc}</p>
                    {m.date && <span className="lila-badge-amber text-[10px] mt-2 inline-block">{m.date}</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Teacher Value */}
        <section>
          <h2 className="font-extrabold mb-6" style={{ color: "#2D1B69" }}>Why voice-guided discussion matters</h2>
          <div className="grid lg:grid-cols-2 gap-8">
            <div className="space-y-4">
              <p className="leading-relaxed" style={{ color: "#7C6FAA" }}>
                Children communicate very differently in spoken conversation than in text. Voice-guided discussion lets Lila respond to natural pauses, support quieter students in real time, and create a more inclusive and authentic group conversation experience.
              </p>
              <ul className="space-y-3">
                {[
                  "More natural for young learners who aren't yet fluent writers",
                  "Real-time gentle redirection and encouragement",
                  "Same observational summaries teachers already trust",
                ].map((t) => (
                  <li key={t} className="flex gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" style={{ color: "#A78BFA" }} />
                    <span style={{ color: "#2D1B69" }}>{t}</span>
                  </li>
                ))}
              </ul>
              <p className="text-xs italic" style={{ color: "#A89DC4" }}>
                Talking Lila will never store audio beyond the active session window without explicit school consent. All voice processing follows the same privacy principles as today's platform.
              </p>
            </div>
            <div className="lila-card flex flex-col items-center justify-center py-10 relative overflow-hidden" style={{ background: "linear-gradient(135deg, #F5F3FF 0%, #FDF2F8 100%)" }}>
              <div className="flex items-end gap-4 mb-4">
                <Blobby size={60} state="idle" />
                <Tangerine size={70} state="idle" />
                <ZapZing size={60} state="idle" />
              </div>
              <div className="flex items-center gap-6 mt-2">
                {["📱", "📱", "📱", "📱"].map((d, i) => (
                  <div key={i} className="flex flex-col items-center gap-1">
                    <span className="text-2xl">{d}</span>
                    <div className="h-px w-8" style={{ background: "#C4B5FD" }} />
                  </div>
                ))}
              </div>
              <span className="lila-badge-amber text-[10px] uppercase tracking-wide absolute top-4 right-4">Coming Soon</span>
            </div>
          </div>
        </section>

        {/* Disabled teasers */}
        <section className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Mic Test", desc: "Available in Voice Room beta", icon: Mic },
            { label: "Live Group Mode", desc: "Coming in Phase 3", icon: Volume2 },
            { label: "Voice persona settings", desc: "Coming Soon", icon: Sparkles },
            { label: "Real-time transcript", desc: "Live transcript will appear here during voice sessions", icon: MonitorSmartphone },
          ].map((item) => (
            <div key={item.label} className="lila-card opacity-60 relative">
              <div className="flex items-center gap-2 mb-2">
                <item.icon className="h-4 w-4" style={{ color: "#A89DC4" }} />
                <span className="text-sm font-bold" style={{ color: "#A89DC4" }}>{item.label}</span>
                <Lock className="h-3 w-3 ml-auto" style={{ color: "#A89DC4" }} />
              </div>
              <p className="text-xs" style={{ color: "#A89DC4" }}>{item.desc}</p>
              <div className="absolute inset-0 rounded-3xl bg-white/50 backdrop-blur-[1px]" />
            </div>
          ))}
        </section>

        {/* Waitlist CTA */}
        <section className="rounded-3xl p-10 md:p-16 text-center relative overflow-hidden" style={{ background: "linear-gradient(135deg, #A78BFA 0%, #FB7185 50%, #FCD34D 100%)" }}>
          <h2 className="text-3xl font-extrabold text-white mb-3">Be the first to use Talking Lila</h2>
          <p className="text-white/80 mb-8 max-w-md mx-auto">Join the waitlist and we'll invite your school to the beta as soon as it's ready.</p>
          <div className="flex justify-center gap-3 max-w-md mx-auto">
            <Input placeholder="you@school.edu" className="bg-white/90 border-0 rounded-full" style={{ color: "#2D1B69" }} />
            <button className="bg-white font-bold rounded-full px-6 py-3 shrink-0 transition-all hover:scale-105" style={{ color: "#7C3AED" }}>Join Waitlist</button>
          </div>
          <p className="text-white/60 text-sm mt-6">Already on the waitlist? We'll be in touch soon. 💜</p>
          <div className="absolute bottom-4 right-8 opacity-60 hidden md:block">
            <Blobby size={80} state="idle" />
          </div>
        </section>
      </div>
    </AppShell>
  );
}
