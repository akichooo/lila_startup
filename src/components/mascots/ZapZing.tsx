import { CSSProperties } from "react";

interface ZapZingProps {
  size?: number;
  state?: "idle" | "listening" | "thinking" | "speaking";
  className?: string;
  style?: CSSProperties;
}

export default function ZapZing({ size = 120, state = "idle", className = "", style }: ZapZingProps) {
  const h = size * 1.1;
  return (
    <div className={`inline-block relative ${className}`} style={{ width: size, height: h, ...style }}>
      <style>{`
        @keyframes zapBounce {
          0%, 100% { transform: translateY(0px) rotate(-3deg); }
          50% { transform: translateY(-12px) rotate(3deg); }
        }
        @keyframes zingBounce {
          0%, 100% { transform: translateY(-6px) rotate(2deg); }
          50% { transform: translateY(6px) rotate(-2deg); }
        }
        @keyframes wandSparkle {
          0%, 100% { opacity: 1; transform: scale(1) rotate(0deg); }
          50% { opacity: 0.6; transform: scale(1.4) rotate(20deg); }
        }
        @keyframes starFloat {
          0%, 100% { transform: translateY(0) scale(1); opacity: 0.8; }
          50% { transform: translateY(-8px) scale(1.15); opacity: 1; }
        }
        @keyframes zapListen {
          0%, 100% { transform: translateY(0) rotate(-1deg); }
          50% { transform: translateY(-4px) rotate(3deg); }
        }
        @keyframes zingListen {
          0%, 100% { transform: translateY(-3px) rotate(1deg); }
          50% { transform: translateY(3px) rotate(-3deg); }
        }
        @keyframes zapSpeak {
          0%, 100% { transform: translateY(0) rotate(-2deg); }
          50% { transform: translateY(-16px) rotate(4deg); }
        }
        @keyframes zingSpeak {
          0%, 100% { transform: translateY(-8px) rotate(2deg); }
          50% { transform: translateY(8px) rotate(-4deg); }
        }
        .zz-zap { animation: zapBounce 1.6s ease-in-out infinite; }
        .zz-zing { animation: zingBounce 1.6s ease-in-out infinite 0.4s; }
        .zz-root[data-state="listening"] .zz-zap { animation: zapListen 2s ease-in-out infinite; }
        .zz-root[data-state="listening"] .zz-zing { animation: zingListen 2s ease-in-out infinite 0.3s; }
        .zz-root[data-state="speaking"] .zz-zap { animation: zapSpeak 0.8s ease-in-out infinite; }
        .zz-root[data-state="speaking"] .zz-zing { animation: zingSpeak 0.8s ease-in-out infinite 0.2s; }
        .zz-root[data-state="thinking"] .zz-zap { animation: zapBounce 3s ease-in-out infinite; }
        .zz-root[data-state="thinking"] .zz-zing { animation: zingBounce 3s ease-in-out infinite 0.4s; }
        .zz-wand-star { animation: wandSparkle 1.2s ease-in-out infinite; transform-origin: center center; }
        .zz-wand-star-r { animation: wandSparkle 1.2s ease-in-out infinite 0.6s; transform-origin: center center; }
        .zz-root[data-state="speaking"] .zz-wand-star,
        .zz-root[data-state="speaking"] .zz-wand-star-r { animation-duration: 0.5s; }
        .zz-root[data-state="listening"] .zz-wand-star,
        .zz-root[data-state="listening"] .zz-wand-star-r { opacity: 0.3; animation: none; }
        .zz-star { animation: starFloat 2s ease-in-out infinite; }
        .zz-star:nth-child(2) { animation-delay: 0.5s; }
        .zz-star:nth-child(3) { animation-delay: 1s; }
        .zz-star:nth-child(4) { animation-delay: 1.5s; }
        .zz-root[data-state="speaking"] .zz-star { animation-duration: 0.8s; }
      `}</style>
      <svg
        className="zz-root"
        data-state={state}
        viewBox="0 0 140 154"
        width={size}
        height={h}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Floating stars */}
        <polygon className="zz-star" points="15,20 17,26 23,26 18,30 20,36 15,32 10,36 12,30 7,26 13,26" fill="#FCD34D" />
        <polygon className="zz-star" points="125,25 127,31 133,31 128,35 130,41 125,37 120,41 122,35 117,31 123,31" fill="#FCD34D" />
        <polygon className="zz-star" points="10,80 12,85 17,85 13,88 14,93 10,90 6,93 8,88 3,85 8,85" fill="#FCD34D" />
        <polygon className="zz-star" points="130,75 132,80 137,80 133,83 134,88 130,85 126,88 128,83 123,80 128,80" fill="#FCD34D" />

        {/* ZAP (left character) */}
        <g className="zz-zap">
          {/* Body */}
          <path d="M35 90 C35 82, 40 78, 50 78 C60 78, 65 82, 65 90 L65 115 C65 118, 62 120, 50 120 C38 120, 35 118, 35 115Z" fill="#2D2D2D" stroke="#1a1a1a" strokeWidth="2" />
          {/* Jagged hem */}
          <path d="M35 115 L38 122 L42 115 L46 122 L50 115 L54 122 L58 115 L62 122 L65 115" fill="#2D2D2D" stroke="#1a1a1a" strokeWidth="1.5" />

          {/* Head */}
          <circle cx="50" cy="60" r="24" fill="#FFD5B0" stroke="#1a1a1a" strokeWidth="2.5" />

          {/* Green spiky hair */}
          <path d="M30 50 C28 35, 35 28, 42 30" fill="#4CAF50" stroke="#1a1a1a" strokeWidth="2" />
          <path d="M38 45 C35 30, 43 22, 50 25" fill="#4CAF50" stroke="#1a1a1a" strokeWidth="2" />
          <path d="M46 42 C44 26, 52 20, 58 24" fill="#4CAF50" stroke="#1a1a1a" strokeWidth="2" />
          <path d="M54 42 C53 28, 60 24, 65 30" fill="#4CAF50" stroke="#1a1a1a" strokeWidth="2" />
          <path d="M60 48 C62 35, 68 32, 70 42" fill="#4CAF50" stroke="#1a1a1a" strokeWidth="2" />

          {/* Black eyebrows */}
          <rect x="38" y="50" width="10" height="3" rx="1" fill="#1a1a1a" />
          <rect x="54" y="50" width="10" height="3" rx="1" fill="#1a1a1a" />

          {/* Green eyes */}
          <circle cx="43" cy="58" r="5" fill="white" stroke="#1a1a1a" strokeWidth="1.5" />
          <circle cx="43" cy="58" r="3.5" fill="#4CAF50" />
          <circle cx="43" cy="57" r="1.5" fill="#1a1a1a" />
          <circle cx="59" cy="58" r="5" fill="white" stroke="#1a1a1a" strokeWidth="1.5" />
          <circle cx="59" cy="58" r="3.5" fill="#4CAF50" />
          <circle cx="59" cy="57" r="1.5" fill="#1a1a1a" />

          {/* Big grin */}
          <path d="M40 67 C44 75, 56 75, 60 67" fill="#1a1a1a" />
          <path d="M42 68 L44 67 L46 68 L48 67 L50 68 L52 67 L54 68 L56 67 L58 68" fill="white" stroke="white" strokeWidth="0.5" />

          {/* Crown */}
          <g>
            <path d="M44 32 L46 26 L48 30 L50 24 L52 30 L54 26 L56 32Z" fill="#FCD34D" stroke="#1a1a1a" strokeWidth="1" />
          </g>

          {/* Left arm + wand */}
          <line x1="35" y1="90" x2="18" y2="70" stroke="#FFD5B0" strokeWidth="4" strokeLinecap="round" />
          <line x1="18" y1="70" x2="12" y2="55" stroke="#8B5E3C" strokeWidth="2.5" strokeLinecap="round" />
          {/* Wand star */}
          <g className="zz-wand-star">
            <polygon points="12,48 13,52 17,52 14,55 15,59 12,56 9,59 10,55 7,52 11,52" fill="#FCD34D" stroke="#1a1a1a" strokeWidth="0.8" />
          </g>
        </g>

        {/* ZING (right character) */}
        <g className="zz-zing">
          {/* Body */}
          <path d="M75 90 C75 82, 80 78, 90 78 C100 78, 105 82, 105 90 L105 115 C105 118, 102 120, 90 120 C78 120, 75 118, 75 115Z" fill="#2D2D2D" stroke="#1a1a1a" strokeWidth="2" />
          {/* Jagged hem */}
          <path d="M75 115 L78 122 L82 115 L86 122 L90 115 L94 122 L98 115 L102 122 L105 115" fill="#2D2D2D" stroke="#1a1a1a" strokeWidth="1.5" />

          {/* Head */}
          <circle cx="90" cy="60" r="24" fill="#FFD5B0" stroke="#1a1a1a" strokeWidth="2.5" />

          {/* Pink swirl hair */}
          <path d="M90 36 C100 28, 118 30, 120 45 C122 55, 115 60, 108 55 C102 50, 108 42, 112 45 C115 47, 113 52, 110 50" fill="#FF69B4" stroke="#1a1a1a" strokeWidth="2" />
          <path d="M85 38 C82 30, 78 28, 75 32 C72 36, 76 42, 80 40" fill="#FF69B4" stroke="#1a1a1a" strokeWidth="2" />

          {/* Eyelashes */}
          <line x1="78" y1="52" x2="76" y2="49" stroke="#1a1a1a" strokeWidth="1.5" />
          <line x1="80" y1="51" x2="79" y2="48" stroke="#1a1a1a" strokeWidth="1.5" />
          <line x1="96" y1="51" x2="97" y2="48" stroke="#1a1a1a" strokeWidth="1.5" />
          <line x1="98" y1="52" x2="100" y2="49" stroke="#1a1a1a" strokeWidth="1.5" />

          {/* Pink eyes */}
          <circle cx="83" cy="58" r="5" fill="white" stroke="#1a1a1a" strokeWidth="1.5" />
          <circle cx="83" cy="58" r="3.5" fill="#FF69B4" />
          <circle cx="83" cy="57" r="1.5" fill="#1a1a1a" />
          <circle cx="99" cy="58" r="5" fill="white" stroke="#1a1a1a" strokeWidth="1.5" />
          <circle cx="99" cy="58" r="3.5" fill="#FF69B4" />
          <circle cx="99" cy="57" r="1.5" fill="#1a1a1a" />

          {/* Big grin */}
          <path d="M80 67 C84 75, 96 75, 100 67" fill="#1a1a1a" />
          <path d="M82 68 L84 67 L86 68 L88 67 L90 68 L92 67 L94 68 L96 67 L98 68" fill="white" stroke="white" strokeWidth="0.5" />

          {/* Crown */}
          <g>
            <path d="M84 34 L86 28 L88 32 L90 26 L92 32 L94 28 L96 34Z" fill="#FCD34D" stroke="#1a1a1a" strokeWidth="1" />
          </g>

          {/* Right arm + wand */}
          <line x1="105" y1="90" x2="122" y2="70" stroke="#FFD5B0" strokeWidth="4" strokeLinecap="round" />
          <line x1="122" y1="70" x2="128" y2="55" stroke="#8B5E3C" strokeWidth="2.5" strokeLinecap="round" />
          {/* Wand star */}
          <g className="zz-wand-star-r">
            <polygon points="128,48 129,52 133,52 130,55 131,59 128,56 125,59 126,55 123,52 127,52" fill="#FCD34D" stroke="#1a1a1a" strokeWidth="0.8" />
          </g>
        </g>
      </svg>
    </div>
  );
}
