import { CSSProperties } from "react";

interface TangerineProps {
  size?: number;
  state?: "idle" | "listening" | "thinking" | "speaking";
  className?: string;
  style?: CSSProperties;
}

export default function Tangerine({ size = 120, state = "idle", className = "", style }: TangerineProps) {
  return (
    <div className={`inline-block ${className}`} style={{ width: size, height: size * 1.15, ...style }}>
      <style>{`
        @keyframes tangerineIdle {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-5px); }
        }
        @keyframes tangerineBlinkHeavy {
          0%, 70%, 100% { transform: scaleY(1); }
          75% { transform: scaleY(0.08); }
          80% { transform: scaleY(1); }
          85% { transform: scaleY(0.08); }
          90% { transform: scaleY(1); }
        }
        @keyframes tailSway {
          0%, 100% { transform: rotate(-15deg); }
          50% { transform: rotate(15deg); }
        }
        @keyframes earTwitch {
          0%, 90%, 100% { transform: rotate(0deg); }
          93% { transform: rotate(-8deg); }
          97% { transform: rotate(5deg); }
        }
        @keyframes tangerineListen {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-3px) scale(1.03); }
        }
        @keyframes tangerineSpeak {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          30% { transform: translateY(-3px) rotate(1deg); }
          70% { transform: translateY(-2px) rotate(-1deg); }
        }
        .tang-root { animation: tangerineIdle 3s ease-in-out infinite; }
        .tang-root[data-state="listening"] { animation: tangerineListen 1.5s ease-in-out infinite; }
        .tang-root[data-state="speaking"] { animation: tangerineSpeak 0.8s ease-in-out infinite; }
        .tang-root[data-state="thinking"] { animation: tangerineIdle 4s ease-in-out infinite; }
        .tang-eyelids { animation: tangerineBlinkHeavy 4s ease-in-out infinite; transform-origin: center top; }
        .tang-root[data-state="listening"] .tang-eyelids { transform: scaleY(0.5); animation: none; }
        .tang-tail { animation: tailSway 2.5s ease-in-out infinite; transform-origin: 50% 0%; }
        .tang-root[data-state="speaking"] .tang-tail { animation: tailSway 1.2s ease-in-out infinite; }
        .tang-ear-l { animation: earTwitch 5s ease-in-out infinite; transform-origin: center bottom; }
        .tang-root[data-state="listening"] .tang-ear-l { transform: scaleY(1.3); animation: none; }
      `}</style>
      <svg
        className="tang-root"
        data-state={state}
        viewBox="0 0 120 138"
        width={size}
        height={size * 1.15}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Tail (behind body) */}
        <g className="tang-tail">
          <path
            d="M95 100 C105 90, 115 78, 110 65 C108 60, 102 62, 104 68 C106 75, 100 85, 95 92"
            fill="#FF8C00"
            stroke="#1a1a1a"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          {/* Tail stripes */}
          <path d="M106 72 C104 74, 102 73, 103 70" stroke="#E07000" strokeWidth="1.5" fill="none" />
        </g>

        {/* Body */}
        <path
          d="M35 70 C35 55, 40 48, 60 48 C80 48, 85 55, 85 70 C85 95, 82 120, 60 125 C38 120, 35 95, 35 70Z"
          fill="#FF8C00"
          stroke="#1a1a1a"
          strokeWidth="2.5"
        />
        {/* Body stripes */}
        <path d="M50 65 C55 60, 65 60, 70 65" stroke="#E07000" strokeWidth="1.5" fill="none" opacity="0.7" />
        <path d="M48 78 C53 73, 67 73, 72 78" stroke="#E07000" strokeWidth="1.5" fill="none" opacity="0.7" />

        {/* Chest/muzzle lighter area on body */}
        <ellipse cx="60" cy="85" rx="14" ry="18" fill="#FFB347" opacity="0.6" />

        {/* Arms crossed */}
        <path
          d="M42 75 C38 72, 52 68, 60 72 C68 68, 82 72, 78 75 C74 78, 68 74, 60 76 C52 74, 46 78, 42 75Z"
          fill="#FF8C00"
          stroke="#1a1a1a"
          strokeWidth="2"
        />
        {/* Paws */}
        <circle cx="42" cy="75" r="4" fill="#FF8C00" stroke="#1a1a1a" strokeWidth="1.5" />
        <circle cx="78" cy="75" r="4" fill="#FF8C00" stroke="#1a1a1a" strokeWidth="1.5" />

        {/* Head */}
        <circle cx="60" cy="35" r="28" fill="#FF8C00" stroke="#1a1a1a" strokeWidth="2.5" />
        {/* Cheeks */}
        <circle cx="40" cy="40" r="8" fill="#FFB347" opacity="0.5" />
        <circle cx="80" cy="40" r="8" fill="#FFB347" opacity="0.5" />
        {/* Muzzle area */}
        <ellipse cx="60" cy="42" rx="12" ry="8" fill="#FFB347" opacity="0.6" />

        {/* Forehead stripes */}
        <path d="M55 18 C57 14, 59 14, 60 18" stroke="#E07000" strokeWidth="2" fill="none" strokeLinecap="round" />
        <path d="M50 20 C52 16, 54 16, 55 20" stroke="#E07000" strokeWidth="2" fill="none" strokeLinecap="round" />
        <path d="M60 18 C62 14, 64 14, 65 18" stroke="#E07000" strokeWidth="2" fill="none" strokeLinecap="round" />

        {/* Left ear */}
        <g className="tang-ear-l">
          <path d="M38 12 C34 2, 42 0, 44 10" fill="#FF8C00" stroke="#1a1a1a" strokeWidth="2" />
          <path d="M39 10 C37 5, 42 4, 43 9" fill="#FFD0D8" />
        </g>
        {/* Right ear */}
        <path d="M76 10 C78 0, 86 2, 82 12" fill="#FF8C00" stroke="#1a1a1a" strokeWidth="2" />
        <path d="M77 9 C78 4, 83 5, 81 10" fill="#FFD0D8" />

        {/* Eyes - yellow-green with slits */}
        <g>
          <circle cx="48" cy="33" r="7" fill="white" stroke="#1a1a1a" strokeWidth="1.5" />
          <circle cx="48" cy="33" r="5.5" fill="#B5E853" />
          <ellipse cx="48" cy="33" rx="2" ry="5" fill="#1a1a1a" />
        </g>
        <g>
          <circle cx="72" cy="33" r="7" fill="white" stroke="#1a1a1a" strokeWidth="1.5" />
          <circle cx="72" cy="33" r="5.5" fill="#B5E853" />
          <ellipse cx="72" cy="33" rx="2" ry="5" fill="#1a1a1a" />
        </g>

        {/* Heavy eyelids */}
        <g className="tang-eyelids">
          <path d="M41 28 C44 25, 52 25, 55 28 L55 33 C52 30, 44 30, 41 33Z" fill="#FF8C00" />
          <path d="M65 28 C68 25, 76 25, 79 28 L79 33 C76 30, 68 30, 65 33Z" fill="#FF8C00" />
        </g>

        {/* Nose */}
        <ellipse cx="60" cy="40" rx="3" ry="2" fill="#FFB6C1" stroke="#1a1a1a" strokeWidth="1" />

        {/* Smug smirk */}
        <path
          d="M52 45 C55 48, 62 49, 68 46"
          stroke="#1a1a1a"
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
        />

        {/* Whiskers */}
        <line x1="30" y1="38" x2="40" y2="40" stroke="#1a1a1a" strokeWidth="1" opacity="0.4" />
        <line x1="30" y1="42" x2="40" y2="42" stroke="#1a1a1a" strokeWidth="1" opacity="0.4" />
        <line x1="80" y1="40" x2="90" y2="38" stroke="#1a1a1a" strokeWidth="1" opacity="0.4" />
        <line x1="80" y1="42" x2="90" y2="42" stroke="#1a1a1a" strokeWidth="1" opacity="0.4" />

        {/* Feet */}
        <ellipse cx="48" cy="128" rx="10" ry="5" fill="#FF8C00" stroke="#1a1a1a" strokeWidth="2" />
        <ellipse cx="72" cy="128" rx="10" ry="5" fill="#FF8C00" stroke="#1a1a1a" strokeWidth="2" />
      </svg>
    </div>
  );
}
