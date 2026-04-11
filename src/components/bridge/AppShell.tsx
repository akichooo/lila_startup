import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  MessageSquare,
  Users,
  TrendingUp,
  Shield,
  Settings,
  LogOut,
  Bell,
  HelpCircle,
  Menu,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const navItems = [
  { label: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
  { label: "Sessions", icon: MessageSquare, path: "/sessions" },
  { label: "Students", icon: Users, path: "/students" },
  { label: "Trends", icon: TrendingUp, path: "/trends" },
  { label: "Privacy & Governance", icon: Shield, path: "/privacy" },
  { label: "Settings", icon: Settings, path: "/settings" },
];

export function AppShell({ children, pageTitle }: { children: React.ReactNode; pageTitle: string }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="flex min-h-screen w-full bg-background">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-30 flex flex-col border-r border-border bg-card transition-all duration-200 ${
          sidebarOpen ? "w-60" : "w-16"
        }`}
      >
        {/* Logo */}
        <div className="flex h-14 items-center gap-2 border-b border-border px-4">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary">
            <span className="text-sm font-bold text-primary-foreground">B</span>
          </div>
          {sidebarOpen && <span className="text-lg font-bold text-primary">Bridge</span>}
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-4" aria-label="Main navigation">
          {navItems.map((item) => {
            const active = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                  active
                    ? "border-l-[3px] border-primary bg-primary/5 font-semibold text-primary"
                    : "border-l-[3px] border-transparent text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
                aria-current={active ? "page" : undefined}
              >
                <item.icon className="h-5 w-5 shrink-0" />
                {sidebarOpen && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* User */}
        <div className="border-t border-border p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
              MR
            </div>
            {sidebarOpen && (
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">Ms. Rivera</p>
                <span className="bridge-badge-blue text-[10px]">Teacher</span>
              </div>
            )}
          </div>
          {sidebarOpen && (
            <button
              onClick={() => navigate("/")}
              className="mt-3 flex w-full items-center gap-2 text-xs text-muted-foreground hover:text-foreground"
              aria-label="Sign out"
            >
              <LogOut className="h-3.5 w-3.5" /> Sign Out
            </button>
          )}
        </div>
      </aside>

      {/* Main */}
      <div className={`flex flex-1 flex-col transition-all duration-200 ${sidebarOpen ? "ml-60" : "ml-16"}`}>
        {/* Top bar */}
        <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-border bg-card/80 px-6 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              aria-label={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
              className="text-muted-foreground"
            >
              {sidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </Button>
            <h2 className="text-lg font-semibold">{pageTitle}</h2>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground hidden sm:block">Maplewood Elementary</span>
            <button className="relative text-muted-foreground hover:text-foreground" aria-label="Notifications">
              <Bell className="h-5 w-5" />
              <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] text-destructive-foreground">
                3
              </span>
            </button>
            <button className="text-muted-foreground hover:text-foreground" aria-label="Help">
              <HelpCircle className="h-5 w-5" />
            </button>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-[1200px] p-6 md:p-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
