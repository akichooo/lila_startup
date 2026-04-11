import { CSSProperties } from "react";
import mascotImg from "@/assets/mascot-blobby.png";

interface BlobbyProps {
  size?: number;
  state?: "idle" | "listening" | "thinking" | "speaking";
  className?: string;
  style?: CSSProperties;
}

export default function Blobby({ size = 120, state = "idle", className = "", style }: BlobbyProps) {
  return (
    <div className={`inline-block ${className}`} style={{ width: size, height: size, ...style }}>
      <style>{`
        @keyframes blobbyFloat {
          0%, 100% { transform: translateY(0px) rotate(-3deg); }
          50% { transform: translateY(-10px) rotate(3deg); }
        }
        @keyframes blobbyExcited {
          0%, 100% { transform: translateY(0) scale(1); }
          25% { transform: translateY(-18px) scale(1.05); }
          50% { transform: translateY(0) scale(0.97); }
          75% { transform: translateY(-12px) scale(1.03); }
        }
        @keyframes blobbySpeakBounce {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-8px) scale(1.06); }
        }
        @keyframes blobbyThink {
          0%, 100% { transform: rotate(0deg) scale(1); }
          25% { transform: rotate(-5deg) scale(0.95); }
          75% { transform: rotate(5deg) scale(0.95); }
        }
        @keyframes blobbySquish {
          0%, 100% { transform: scaleX(1) scaleY(1); }
          50% { transform: scaleX(1.04) scaleY(0.96); }
        }
        .blobby-img[data-state="idle"] { animation: blobbyFloat 2.2s ease-in-out infinite, blobbySquish 2.2s ease-in-out infinite; }
        .blobby-img[data-state="listening"] { animation: blobbyExcited 0.8s ease-in-out infinite; }
        .blobby-img[data-state="speaking"] { animation: blobbySpeakBounce 0.4s ease-in-out infinite; }
        .blobby-img[data-state="thinking"] { animation: blobbyThink 2s ease-in-out infinite; filter: brightness(0.95); }
      `}</style>
      <img
        src={mascotImg}
        alt="Blobby mascot"
        className="blobby-img object-contain w-full h-full"
        data-state={state}
        draggable={false}
      />
    </div>
  );
}
