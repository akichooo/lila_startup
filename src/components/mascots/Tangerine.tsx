import { CSSProperties } from "react";
import mascotImg from "@/assets/mascot-zapzing.png";

interface TangerineProps {
  size?: number;
  state?: "idle" | "listening" | "thinking" | "speaking";
  className?: string;
  style?: CSSProperties;
}

export default function Tangerine({ size = 120, state = "idle", className = "", style }: TangerineProps) {
  return (
    <div className={`inline-block ${className}`} style={{ width: size, height: size, ...style }}>
      <style>{`
        @keyframes tangIdle {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-5px) rotate(1deg); }
        }
        @keyframes tangListen {
          0%, 100% { transform: scale(1) rotate(0deg); }
          50% { transform: scale(1.05) rotate(-2deg); }
        }
        @keyframes tangSpeak {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          30% { transform: translateY(-4px) rotate(2deg); }
          70% { transform: translateY(-2px) rotate(-1deg); }
        }
        @keyframes tangThink {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(3deg); }
          75% { transform: rotate(-3deg); }
        }
        .tang-img[data-state="idle"] { animation: tangIdle 3s ease-in-out infinite; }
        .tang-img[data-state="listening"] { animation: tangListen 1.5s ease-in-out infinite; }
        .tang-img[data-state="speaking"] { animation: tangSpeak 0.8s ease-in-out infinite; }
        .tang-img[data-state="thinking"] { animation: tangThink 2.5s ease-in-out infinite; filter: brightness(0.95); }
      `}</style>
      <img
        src={mascotImg}
        alt="Tangerine mascot"
        className="tang-img object-contain w-full h-full"
        data-state={state}
        draggable={false}
      />
    </div>
  );
}
