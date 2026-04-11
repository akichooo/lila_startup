import { ReactNode } from "react";

interface AvatarProps {
  initials: string;
  color: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizes = {
  sm: "w-7 h-7 text-[10px]",
  md: "w-9 h-9 text-xs",
  lg: "w-11 h-11 text-sm",
};

export function StudentAvatar({ initials, color, size = "md", className = "" }: AvatarProps) {
  return (
    <div
      className={`lila-avatar ${sizes[size]} ${className}`}
      style={{ backgroundColor: color, color: "#fff" }}
      aria-label={`Avatar for ${initials}`}
    >
      {initials}
    </div>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    "summary-ready": "lila-badge-green",
    "follow-up-pending": "lila-badge-amber",
    reviewed: "lila-badge-gray",
    live: "lila-badge-blue",
    draft: "lila-badge-gray",
  };
  const labels: Record<string, string> = {
    "summary-ready": "Summary Ready",
    "follow-up-pending": "Follow-Up Pending",
    reviewed: "Reviewed",
    live: "LIVE",
    draft: "Draft",
  };
  return <span className={styles[status] || "lila-badge-gray"}>{labels[status] || status}</span>;
}

export function StatCard({
  title,
  value,
  subtitle,
  gradientBar,
  icon,
  badge,
}: {
  title: string;
  value: string | number;
  subtitle: string;
  gradientBar: string;
  icon: ReactNode;
  badge?: ReactNode;
}) {
  return (
    <div className="lila-stat-card">
      <div className="absolute top-0 left-0 right-0 h-2 rounded-t-3xl" style={{ background: gradientBar }} />
      <div className="flex items-start justify-between pt-2">
        <div>
          <p className="lila-label mb-1">{title}</p>
          <p className="text-3xl font-extrabold text-foreground">{value}</p>
          <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
        </div>
        <div className="flex items-center gap-2">
          {badge}
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
            {icon}
          </div>
        </div>
      </div>
    </div>
  );
}

export function SectionHeader({ title, action }: { title: ReactNode; action?: ReactNode }) {
  return (
    <div className="lila-section-header">
      <h3>{title}</h3>
      {action}
    </div>
  );
}

export function InfoTooltip({ text }: { text: string }) {
  return (
    <span
      className="inline-flex items-center justify-center w-4 h-4 rounded-full text-[10px] font-bold cursor-help ml-1.5"
      style={{ backgroundColor: "#EDE9FF", color: "#7C3AED" }}
      title={text}
      aria-label={text}
    >
      i
    </span>
  );
}

export function DisclaimerBanner({ children, variant = "purple" }: { children: ReactNode; variant?: "purple" | "amber" }) {
  const styles = variant === "amber"
    ? "border-[#FDBA74] bg-[#FFF7ED]"
    : "border-[#C4B5FD] bg-[#EDE9FF]";
  return (
    <div className={`rounded-3xl border-[1.5px] p-4 text-sm text-muted-foreground ${styles}`}>
      {children}
    </div>
  );
}
