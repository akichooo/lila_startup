import { useState, useEffect } from "react";
import Blobby from "@/components/mascots/Blobby";
import { CheckCircle2, Loader2 } from "lucide-react";

const STAGES = [
  "Receiving audio file",
  "Identifying speakers and turn-taking patterns",
  "Measuring participation balance across students",
  "Reviewing topic engagement signals",
  "Checking conversational tone",
  "Preparing your session summary",
];

interface AnalysisProcessingScreenProps {
  onComplete: () => void;
}

export default function AnalysisProcessingScreen({ onComplete }: AnalysisProcessingScreenProps) {
  const [completedStages, setCompletedStages] = useState(0);

  useEffect(() => {
    if (completedStages >= STAGES.length) {
      const t = setTimeout(onComplete, 800);
      return () => clearTimeout(t);
    }
    const delay = 1000 + Math.random() * 1000; // 1-2s per stage
    const t = setTimeout(() => setCompletedStages((p) => p + 1), delay);
    return () => clearTimeout(t);
  }, [completedStages, onComplete]);

  return (
    <div className="flex flex-col items-center gap-6 py-8">
      <Blobby size={180} state="thinking" />

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
