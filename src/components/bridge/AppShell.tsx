import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Mic,
  Upload,
  PlusCircle,
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
  { label: "Voice Room", icon: Mic, path: "/voice-room", flagship: true },
  { label: "Upload Audio", icon: Upload, path: "/upload-audio" },
  { label: "Create Session", icon: PlusCircle, path: "/sessions/create" },
  { label: "Student Trends", icon: TrendingUp, path: "/trends" },
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
        className={`fixed inset-y-0 left-0 z-30 flex flex-col bg-card transition-all duration-200 ${
          sidebarOpen ? "w-60" : "w-16"
        }`}
        style={{ borderRight: "1.5px solid #EDE9FF" }}
      >
        {/* Logo */}
        <div className="flex h-16 items-center gap-2.5 px-4" style={{ borderBottom: "1.5px solid #EDE9FF" }}>
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl" style={{ background: "linear-gradient(135deg, #A78BFA 0%, #FB7185 100%)" }}>
            <span className="text-sm font-extrabold text-white">L</span>
          </div>
          {sidebarOpen && <span className="text-[22px] font-extrabold" style={{ color: "#2D1B69" }}>Lila</span>}
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-4" aria-label="Main navigation">
          {navItems.map((item) => {
            const active = location.pathname === item.path;
            const isFlagship = (item as any).flagship;

            if (isFlagship) {
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`group relative mx-2 mb-2 flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-bold transition-all ${
                    active ? "text-white shadow-md" : "text-white hover:shadow-md"
                  }`}
                  style={{ background: "linear-gradient(135deg, #A78BFA 0%, #FB7185 100%)" }}
                  aria-current={active ? "page" : undefined}
                >
                  <item.icon className="h-5 w-5 shrink-0 voice-room-mic-pulse" />
                  {sidebarOpen ? (
                    <>
                      <span>{item.label}</span>
                      <span className="ml-auto lila-badge-amber text-[10px] uppercase tracking-wide group-hover:hidden">
                        Soon
                      </span>
                      <span className="ml-auto hidden lila-badge-purple text-[10px] group-hover:inline-flex">
                        Preview Now →
                      </span>
                    </>
                  ) : (
                    <span className="absolute right-1 top-1 h-2 w-2 rounded-full" style={{ backgroundColor: "#FDBA74" }} />
                  )}
                </Link>
              );
            }

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 mx-2 px-3 py-2.5 text-sm rounded-2xl transition-all ${
                  active
                    ? "font-bold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                style={active ? {
                  background: "linear-gradient(135deg, #EDE9FF 0%, #FDF2F8 100%)",
                  borderLeft: "3px solid #A78BFA",
                  color: "#2D1B69",
                } : {
                  borderLeft: "3px solid transparent",
                }}
                aria-current={active ? "page" : undefined}
              >
                <item.icon className={`h-5 w-5 shrink-0 ${active ? "text-primary" : ""}`} style={active ? { color: "#A78BFA" } : {}} />
                {sidebarOpen && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* User & Mascot */}
        <div className="p-4" style={{ borderTop: "1.5px solid #EDE9FF" }}>
          {/* Mascot */}
          <div className="flex justify-center mb-3">
            <div className="voice-mascot-bob text-5xl">💜</div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white" style={{ background: "linear-gradient(135deg, #A78BFA 0%, #FB7185 100%)" }}>
              MR
            </div>
            {sidebarOpen && (
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold" style={{ color: "#2D1B69" }}>Ms. Rivera</p>
                <span className="lila-badge-purple text-[10px]">Teacher</span>
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
        <header className="sticky top-0 z-20 flex h-[60px] items-center justify-between bg-card/90 px-6 backdrop-blur-sm" style={{ borderBottom: "1px solid #EDE9FF" }}>
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
            <h2 className="text-xl font-bold" style={{ color: "#2D1B69" }}>{pageTitle}</h2>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground hidden sm:inline-flex px-3 py-1 rounded-full" style={{ background: "#F5F3FF", color: "#7C6FAA" }}>Maplewood Elementary</span>
            <button className="relative text-muted-foreground hover:text-foreground" aria-label="Notifications">
              <Bell className="h-5 w-5" />
              <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full text-[10px] text-white font-bold" style={{ backgroundColor: "#FB7185" }}>
                3
              </span>
            </button>
            <button className="text-muted-foreground hover:text-foreground" aria-label="Help">
              <HelpCircle className="h-5 w-5" />
            </button>
            <div className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold text-white" style={{ background: "linear-gradient(135deg, #A78BFA 0%, #FB7185 100%)" }}>
              MR
            </div>
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
