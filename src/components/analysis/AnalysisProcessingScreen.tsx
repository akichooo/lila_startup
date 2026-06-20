import { useState, useEffect, useRef } from "react";
import Blobby from "@/components/mascots/Blobby";
import Tangerine from "@/components/mascots/Tangerine";
import ZapZing from "@/components/mascots/ZapZing";
import { CheckCircle2, Loader2 } from "lucide-react";
import { useLilaSound } from "@/contexts/SoundContext";

const STAGES = [
  "Receiving audio file",
  "Identifying speakers and turn-taking patterns",
  "Measuring participation balance across students",
  "Reviewing topic engagement signals",
  "Checking tone-register wording",
  "Preparing your session summary",
];

interface AnalysisProcessingScreenProps {
  onComplete?: () => void;
  ageRange?: "6-8" | "9-10" | "11-12";
  topic?: string;
  studentCount?: number;
}

function MascotForAge({ ageRange, state }: { ageRange: string; state: "thinking" | "speaking" }) {
  switch (ageRange) {
    case "9-10":
      return <Tangerine size={180} state={state} />;
    case "11-12":
      return <ZapZing size={180} state={state} />;
    default:
      return <Blobby size={180} state={state} />;
  }
}

export default function AnalysisProcessingScreen({ onComplete, ageRange = "6-8" }: AnalysisProcessingScreenProps) {
  const [completedStages, setCompletedStages] = useState(0);
  const { play } = useLilaSound();
  const prevStages = useRef(0);

  useEffect(() => {
    // Play tick sound when a new stage completes
    if (completedStages > prevStages.current && completedStages <= STAGES.length) {
      play("analysis-tick");
    }
    prevStages.current = completedStages;

    if (completedStages >= STAGES.length) {
      // Play success + mascot sound when done
      const mascotSound = ageRange === "9-10" ? "mascot-tangerine" : ageRange === "11-12" ? "mascot-zapzing" : "mascot-blobby";
      play("success");
      setTimeout(() => play(mascotSound as any), 300);
      const t = onComplete ? setTimeout(onComplete, 800) : undefined;
      return () => {
        if (t) clearTimeout(t);
      };
    }
    const delay = 1000 + Math.random() * 1000;
    const t = setTimeout(() => setCompletedStages((p) => p + 1), delay);
    return () => clearTimeout(t);
  }, [completedStages, onComplete, play, ageRange]);

  return (
    <div className="flex flex-col items-center gap-6 py-8">
      <MascotForAge ageRange={ageRange} state={completedStages >= STAGES.length ? "speaking" : "thinking"} />

      {/* Thought dots */}
      <div className="flex items-center gap-1">
        <span className="inline-block w-2 h-2 rounded-full animate-bounce" style={{ background: "#A78BFA", animationDelay: "0ms" }} />
        <span className="inline-block w-2 h-2 rounded-full animate-bounce" style={{ background: "#A78BFA", animationDelay: "150ms" }} />
        <span className="inline-block w-2 h-2 rounded-full animate-bounce" style={{ background: "#A78BFA", animationDelay: "300ms" }} />
      </div>

      <h2 className="font-extrabold text-lg text-center" style={{ color: "#2D1B69" }}>
        Analyzing your session…
      </h2>

      <div className="w-full max-w-md space-y-3">
        {STAGES.map((stage, i) => {
          const done = i < completedStages;
          const active = i === completedStages && completedStages < STAGES.length;
          if (i > completedStages) return null;

          return (
            <div
              key={i}
              className="flex items-center gap-3 rounded-2xl p-3 transition-all animate-fade-in"
              style={{
                background: done ? "#F0FDF4" : "#F5F3FF",
                border: done ? "1.5px solid #BBF7D0" : "1.5px solid #EDE9FF",
              }}
            >
              {done ? (
                <CheckCircle2 className="h-5 w-5 shrink-0" style={{ color: "#059669" }} />
              ) : (
                <Loader2 className="h-5 w-5 shrink-0 animate-spin" style={{ color: "#A78BFA" }} />
              )}
              <span className="text-sm font-semibold" style={{ color: done ? "#059669" : "#2D1B69" }}>
                {stage}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
