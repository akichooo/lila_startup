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
      className={`bridge-avatar ${sizes[size]} ${className}`}
      style={{ backgroundColor: color, color: "#fff" }}
      aria-label={`Avatar for ${initials}`}
    >
      {initials}
    </div>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    "summary-ready": "bridge-badge-green",
    "follow-up-pending": "bridge-badge-amber",
    reviewed: "bridge-badge-gray",
    live: "bridge-badge-blue",
    draft: "bridge-badge-gray",
  };
  const labels: Record<string, string> = {
    "summary-ready": "Summary Ready",
    "follow-up-pending": "Follow-Up Pending",
    reviewed: "Reviewed",
    live: "LIVE",
    draft: "Draft",
  };
  return <span className={styles[status] || "bridge-badge-gray"}>{labels[status] || status}</span>;
}

export function StatCard({
  title,
  value,
  subtitle,
  borderColor,
  icon,
  badge,
}: {
  title: string;
  value: string | number;
  subtitle: string;
  borderColor: string;
  icon: ReactNode;
  badge?: ReactNode;
}) {
  return (
    <div className="bridge-stat-card" style={{ borderLeftColor: borderColor }}>
      <div className="flex items-start justify-between">
        <div>
          <p className="bridge-label mb-1">{title}</p>
          <p className="text-3xl font-bold text-foreground">{value}</p>
          <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
        </div>
        <div className="flex items-center gap-2">
          {badge}
          <span className="text-muted-foreground">{icon}</span>
        </div>
      </div>
    </div>
  );
}

export function SectionHeader({ title, action }: { title: string; action?: ReactNode }) {
  return (
    <div className="bridge-section-header">
      <h3>{title}</h3>
      {action}
    </div>
  );
}

export function InfoTooltip({ text }: { text: string }) {
  return (
    <span
      className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-muted text-muted-foreground text-[10px] font-bold cursor-help ml-1.5"
      title={text}
      aria-label={text}
    >
      i
    </span>
  );
}

export function DisclaimerBanner({ children, variant = "blue" }: { children: ReactNode; variant?: "blue" | "amber" }) {
  const bg = variant === "amber" ? "bg-warning/5 border-warning/30" : "bg-primary/5 border-primary/20";
  return (
    <div className={`rounded-2xl border p-4 text-sm text-muted-foreground ${bg}`}>
      {children}
    </div>
  );
}
