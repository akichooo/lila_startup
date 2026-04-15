import { CSSProperties } from "react";
import mascotImg from "@/assets/mascot-tangerine.png";

interface ZapZingProps {
  size?: number;
  state?: "idle" | "listening" | "thinking" | "speaking";
  className?: string;
  style?: CSSProperties;
}

export default function ZapZing({ size = 120, state = "idle", className = "", style }: ZapZingProps) {
  return (
    <div className={`inline-block ${className}`} style={{ width: size, height: size, ...style }}>
      <style>{`
        @keyframes zzBounce {
          0%, 100% { transform: translateY(0px) rotate(-2deg); }
          50% { transform: translateY(-12px) rotate(2deg); }
        }
        @keyframes zzListen {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-6px) scale(1.04); }
        }
        @keyframes zzSpeak {
          0%, 100% { transform: translateY(0) rotate(-1deg) scale(1); }
          50% { transform: translateY(-14px) rotate(2deg) scale(1.06); }
        }
        @keyframes zzThink {
          0%, 100% { transform: scale(1) rotate(0); }
          50% { transform: scale(0.96) rotate(-3deg); }
        }
        .zz-img[data-state="idle"] { animation: zzBounce 1.6s ease-in-out infinite; }
        .zz-img[data-state="listening"] { animation: zzListen 1.8s ease-in-out infinite; }
        .zz-img[data-state="speaking"] { animation: zzSpeak 0.7s ease-in-out infinite; }
        .zz-img[data-state="thinking"] { animation: zzThink 2.5s ease-in-out infinite; filter: brightness(0.95); }
      `}</style>
      <img
        src={mascotImg}
        alt="Zap & Zing mascot"
        className="zz-img object-contain w-full h-full"
        data-state={state}
        draggable={false}
      />
    </div>
  );
}
