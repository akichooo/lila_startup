import { CSSProperties } from "react";

interface BlobbyProps {
  size?: number;
  state?: "idle" | "listening" | "thinking" | "speaking";
  className?: string;
  style?: CSSProperties;
}

export default function Blobby({ size = 120, state = "idle", className = "", style }: BlobbyProps) {
  const s = size / 120; // scale factor

  return (
    <div className={`inline-block ${className}`} style={{ width: size, height: size * 1.2, ...style }}>
      <style>{`
        @keyframes blobbyFloat {
          0%, 100% { transform: translateY(0px) rotate(-2deg); }
          50% { transform: translateY(-10px) rotate(2deg); }
        }
        @keyframes eyeWobble {
          0%, 85%, 100% { transform: scaleY(1); }
          90% { transform: scaleY(0.1); }
          95% { transform: scaleY(1); }
        }
        @keyframes armWave {
          0%, 100% { transform: rotate(0deg); }
          30% { transform: rotate(-20deg); }
          60% { transform: rotate(10deg); }
        }
        @keyframes blobSquish {
          0%, 100% { transform: scaleX(1) scaleY(1); }
          50% { transform: scaleX(1.06) scaleY(0.96); }
        }
        @keyframes blobbyExcited {
          0%, 100% { transform: translateY(0); }
          25% { transform: translateY(-20px); }
          50% { transform: translateY(0); }
          75% { transform: translateY(-15px); }
        }
        @keyframes blobbyListenEyes {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.2); }
        }
        @keyframes blobbySpeakBounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        @keyframes blobbyMouthSpeak {
          0%, 100% { transform: scaleY(1); }
          50% { transform: scaleY(0.3); }
        }
        .blobby-root { animation: blobbyFloat 2.2s ease-in-out infinite; }
        .blobby-root[data-state="listening"] { animation: blobbyExcited 0.8s ease-in-out infinite; }
        .blobby-root[data-state="speaking"] { animation: blobbySpeakBounce 0.4s ease-in-out infinite; }
        .blobby-root[data-state="thinking"] { animation: blobbyFloat 3s ease-in-out infinite; opacity: 0.9; }
        .blobby-body { animation: blobSquish 2.2s ease-in-out infinite; transform-origin: center bottom; }
        .blobby-eye-l { animation: eyeWobble 3.5s ease-in-out infinite; transform-origin: center center; }
        .blobby-arm { animation: armWave 1.8s ease-in-out infinite; transform-origin: 75% 100%; }
        .blobby-root[data-state="listening"] .blobby-eye-l,
        .blobby-root[data-state="listening"] .blobby-eye-r { animation: blobbyListenEyes 1s ease-in-out infinite; transform-origin: center center; }
        .blobby-root[data-state="listening"] .blobby-arm { animation: armWave 0.6s ease-in-out infinite; }
        .blobby-root[data-state="speaking"] .blobby-mouth { animation: blobbyMouthSpeak 0.2s ease-in-out infinite; transform-origin: center center; }
        .blobby-root[data-state="thinking"] .blobby-arm { animation: none; }
      `}</style>
      <svg
        className="blobby-root"
        data-state={state}
        viewBox="0 0 120 144"
        width={size}
        height={size * 1.2}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Body */}
        <g className="blobby-body">
          <path
            d="M60 10 C72 8, 95 25, 98 55 C100 75, 95 105, 80 125 C72 135, 48 135, 40 125 C25 105, 20 75, 22 55 C25 25, 48 8, 60 10Z"
            fill="#6BAAFF"
            stroke="#1a1a1a"
            strokeWidth="3"
          />
          {/* Shading */}
          <path
            d="M70 15 C85 20, 95 35, 96 55 C97 75, 93 105, 78 122 C74 128, 68 130, 65 128 C80 108, 82 75, 80 50 C78 30, 72 18, 70 15Z"
            fill="#4D8FE0"
            opacity="0.4"
          />
        </g>

        {/* Horn/swirl */}
        <path
          d="M58 14 C55 5, 60 -2, 68 2 C72 4, 70 10, 65 12"
          fill="#6BAAFF"
          stroke="#1a1a1a"
          strokeWidth="2.5"
          strokeLinecap="round"
        />

        {/* Arm (left, waving) */}
        <g className="blobby-arm">
          <path
            d="M28 70 C18 65, 8 60, 5 52 C3 48, 8 44, 12 48 C16 52, 20 58, 28 62"
            fill="#6BAAFF"
            stroke="#1a1a1a"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        </g>

        {/* Left eye (bigger) */}
        <g className="blobby-eye-l">
          <circle cx="45" cy="55" r="14" fill="white" stroke="#1a1a1a" strokeWidth="2.5" />
          <circle cx="47" cy="54" r="5" fill="#1a1a1a" />
        </g>

        {/* Right eye (slightly smaller) */}
        <g className="blobby-eye-r">
          <circle cx="72" cy="52" r="11" fill="white" stroke="#1a1a1a" strokeWidth="2.5" />
          <circle cx="73" cy="51" r="4" fill="#1a1a1a" />
        </g>

        {/* Mouth */}
        <g className="blobby-mouth">
          <path
            d="M42 78 C48 92, 68 92, 76 78"
            fill="#1a1a1a"
            stroke="#1a1a1a"
            strokeWidth="2"
          />
          {/* Tongue */}
          <ellipse cx="58" cy="86" rx="7" ry="4" fill="#FF9A84" />
        </g>
      </svg>
    </div>
  );
}
