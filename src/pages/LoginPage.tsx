import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Loader2 } from "lucide-react";

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setTimeout(() => {
      setLoading(false);
      navigate("/dashboard");
    }, 1200);
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4" style={{ background: "linear-gradient(135deg, #EDE9FF 0%, #FCE7F3 50%, #E0F2FE 100%)" }}>
      <div className="w-full max-w-[480px] animate-fade-in">
        {/* Mascot */}
        <div className="flex justify-center mb-4">
          <div className="text-7xl voice-mascot-bob">💜</div>
        </div>

        <div className="flex items-center justify-center gap-2.5 mb-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl" style={{ background: "linear-gradient(135deg, #A78BFA 0%, #FB7185 100%)" }}>
            <span className="text-lg font-extrabold text-white">L</span>
          </div>
          <span className="text-2xl font-extrabold" style={{ color: "#2D1B69" }}>Lila</span>
        </div>

        <div className="bg-white rounded-[28px] p-12" style={{ border: "1.5px solid #EDE9FF", boxShadow: "0 8px 48px rgba(167,139,250,0.18)" }}>
          <h2 className="text-center mb-1 font-extrabold" style={{ color: "#2D1B69" }}>Welcome back! 💜</h2>
          <p className="text-center text-sm mb-6" style={{ color: "#7C6FAA" }}>Sign in to your Lila teacher account</p>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@school.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`rounded-2xl ${error ? "border-destructive" : ""}`}
                style={{ background: "#F5F3FF", borderColor: error ? undefined : "#EDE9FF" }}
                required
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <Label htmlFor="password">Password</Label>
                <button type="button" className="text-xs font-bold hover:underline" style={{ color: "#A78BFA" }}>Forgot password?</button>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPass ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`rounded-2xl ${error ? "border-destructive" : ""}`}
                  style={{ background: "#F5F3FF", borderColor: error ? undefined : "#EDE9FF" }}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  aria-label={showPass ? "Hide password" : "Show password"}
                >
                  {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
            </div>

            <button type="submit" className="lila-btn-primary w-full" disabled={loading}>
              {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin inline" /> Signing in…</> : "Sign In to Lila"}
            </button>
          </form>

          <div className="my-6 flex items-center gap-3">
            <div className="h-px flex-1" style={{ background: "#EDE9FF" }} />
            <span className="text-xs" style={{ color: "#A89DC4" }}>or</span>
            <div className="h-px flex-1" style={{ background: "#EDE9FF" }} />
          </div>

          <button className="lila-btn-secondary w-full flex items-center justify-center gap-2 !border-[#EDE9FF]" onClick={() => navigate("/dashboard")}>
            <svg className="h-4 w-4" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
            Sign in with Google
          </button>

          <p className="mt-6 text-center text-xs" style={{ color: "#A89DC4" }}>
            Don't have an account?{" "}
            <a href="#" className="font-bold hover:underline" style={{ color: "#A78BFA" }}>Request access from your school administrator.</a>
          </p>
          <p className="mt-3 text-center text-[11px]" style={{ color: "#A89DC4" }}>
            By signing in, you agree to Lila's{" "}
            <a href="#" className="underline">Terms of Service</a> and{" "}
            <a href="#" className="underline">Privacy Policy</a>.
          </p>
        </div>
      </div>
    </div>
  );
}
