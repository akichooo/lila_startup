import { useNavigate } from "react-router-dom";
import Blobby from "@/components/mascots/Blobby";
import Tangerine from "@/components/mascots/Tangerine";
import ZapZing from "@/components/mascots/ZapZing";
import { type AnalysisResult } from "@/contexts/AnalysisContext";
import { CheckCircle2 } from "lucide-react";

interface Props {
  result: AnalysisResult;
}

function CelebrationMascot({ ageRange }: { ageRange: string }) {
  switch (ageRange) {
    case "9-10":
      return <Tangerine size={180} state="speaking" />;
    case "11-12":
      return <ZapZing size={180} state="speaking" />;
    default:
      return <Blobby size={180} state="speaking" />;
  }
}

export default function AnalysisResultPreview({ result }: Props) {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center gap-6 py-4">
      <CelebrationMascot ageRange={result.ageRange || "6-8"} />

      {/* Sparkles */}
      <style>{`@keyframes sparkle { 0%,100%{opacity:0;transform:scale(0)} 50%{opacity:1;transform:scale(1)} }`}</style>
      <div className="relative -mt-8 w-full flex justify-center pointer-events-none">
        {[...Array(5)].map((_, i) => (
          <span key={i} className="absolute text-lg" style={{ animation: `sparkle 0.8s ease-out ${i * 0.15}s both`, left: `${30 + i * 10}%`, top: -10 - (i % 2) * 15 }}>⭐</span>
        ))}
      </div>

      <h2 className="font-extrabold text-lg text-center" style={{ color: "#2D1B69" }}>Analysis Complete! ✨</h2>

      <div className="w-full max-w-lg rounded-2xl p-5 space-y-4" style={{ background: "#F0FDF4", border: "1.5px solid #BBF7D0" }}>
        <div className="flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5" style={{ color: "#059669" }} />
          <span className="font-bold text-sm" style={{ color: "#059669" }}>Session analyzed successfully</span>
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm">
          <div><p className="text-xs font-semibold" style={{ color: "#7C6FAA" }}>Group</p><p className="font-bold" style={{ color: "#2D1B69" }}>{result.groupName}</p></div>
          <div><p className="text-xs font-semibold" style={{ color: "#7C6FAA" }}>Duration</p><p className="font-bold" style={{ color: "#2D1B69" }}>{result.duration} min</p></div>
          <div><p className="text-xs font-semibold" style={{ color: "#7C6FAA" }}>Date</p><p className="font-bold" style={{ color: "#2D1B69" }}>{result.date}</p></div>
          <div><p className="text-xs font-semibold" style={{ color: "#7C6FAA" }}>Tone</p><p className="font-bold" style={{ color: "#2D1B69" }}>{result.overallTone}</p></div>
        </div>

        <div>
          <p className="text-xs font-semibold mb-2" style={{ color: "#7C6FAA" }}>Participation Overview</p>
          <div className="space-y-1.5">
            {result.studentResults.map((sr) => (
              <div key={sr.student.id} className="flex items-center gap-2 text-xs">
                <span className="w-20 truncate font-semibold" style={{ color: "#2D1B69" }}>{sr.student.name.split(" ")[0]}</span>
                <div className="flex-1 h-2.5 rounded-full overflow-hidden" style={{ background: "#EDE9FF" }}>
                  <div className="h-full rounded-full" style={{ width: `${sr.participationPct}%`, background: sr.flagged ? "linear-gradient(90deg, #FDBA74, #FB7185)" : "linear-gradient(90deg, #A78BFA, #7DD3FC)" }} />
                </div>
                <span className="w-8 text-right font-bold" style={{ color: "#2D1B69" }}>{sr.participationPct}%</span>
              </div>
            ))}
          </div>
        </div>

        {result.studentResults.filter((s) => s.flagged).map((sr) => (
          <div key={sr.student.id} className="rounded-xl p-3 text-xs" style={{ background: "#FFF7ED", border: "1px solid #FDBA74" }}>
            <span className="font-bold" style={{ color: "#D97706" }}>📋 Signal: </span>
            <span style={{ color: "#7C6FAA" }}>{sr.flagNote}</span>
          </div>
        ))}

        <div>
          <p className="text-xs font-semibold mb-2" style={{ color: "#7C6FAA" }}>Suggested Follow-Ups</p>
          <div className="space-y-1.5">
            {result.followUpActions.map((a, i) => (
              <div key={i} className="flex items-start gap-2 text-xs">
                <span style={{ color: "#A78BFA" }}>•</span>
                <span style={{ color: "#2D1B69" }}>{a.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex gap-3 w-full max-w-lg">
        <button className="lila-btn-secondary flex-1" onClick={() => navigate(`/summary/${result.id}`)}>View Full Summary</button>
        <button className="lila-btn-primary flex-1" onClick={() => navigate("/dashboard")}>Go to Dashboard</button>
      </div>
    </div>
  );
}
