import { useState } from "react";
import { AppShell } from "@/components/bridge/AppShell";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { User, CalendarDays, Bell, Users, Shield, Share2, Lock } from "lucide-react";

const categories = [
  { id: "profile", label: "Profile", icon: User },
  { id: "defaults", label: "Session Defaults", icon: CalendarDays },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "groups", label: "Groups & Students", icon: Users },
  { id: "privacy", label: "Privacy & Data", icon: Shield },
  { id: "access", label: "Access & Sharing", icon: Share2 },
  { id: "security", label: "Account Security", icon: Lock },
];

export default function SettingsPage() {
  const [activeCategory, setActiveCategory] = useState("profile");

  const handleSave = () => toast.success("Settings saved ✓");

  return (
    <AppShell pageTitle="Settings">
      <div className="grid gap-6 md:grid-cols-[220px_1fr]">
        {/* Category nav */}
        <div className="space-y-1">
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setActiveCategory(c.id)}
              className="flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-sm transition-all font-bold"
              style={activeCategory === c.id ? {
                background: "#EDE9FF",
                borderLeft: "3px solid #A78BFA",
                color: "#7C3AED",
              } : {
                borderLeft: "3px solid transparent",
                color: "#7C6FAA",
              }}
            >
              <c.icon className="h-4 w-4" />
              {c.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="lila-card">
          {activeCategory === "profile" && (
            <div className="space-y-5">
              <h3 className="font-extrabold" style={{ color: "#2D1B69" }}>Profile</h3>
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full text-lg font-extrabold text-white" style={{ background: "linear-gradient(135deg, #A78BFA 0%, #FB7185 100%)" }}>MR</div>
                <button className="lila-btn-secondary text-xs !py-1.5 !px-4">Change Photo</button>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div><Label>Name</Label><Input defaultValue="Maria Rivera" className="rounded-2xl" style={{ background: "#F5F3FF", borderColor: "#EDE9FF" }} /></div>
                <div><Label>Email</Label><Input defaultValue="m.rivera@maplewood.edu" className="rounded-2xl" style={{ background: "#F5F3FF", borderColor: "#EDE9FF" }} /></div>
                <div><Label>School</Label><Input defaultValue="Maplewood Elementary" disabled className="rounded-2xl" style={{ background: "#F5F3FF", borderColor: "#EDE9FF" }} /></div>
                <div><Label>Role</Label><Input defaultValue="Teacher" disabled className="rounded-2xl" style={{ background: "#F5F3FF", borderColor: "#EDE9FF" }} /></div>
              </div>
              <button className="lila-btn-primary" onClick={handleSave}>Save Profile</button>
            </div>
          )}

          {activeCategory === "defaults" && (
            <div className="space-y-5">
              <h3 className="font-extrabold" style={{ color: "#2D1B69" }}>Session Defaults</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label>Default Duration</Label>
                  <Select defaultValue="20"><SelectTrigger className="rounded-2xl" style={{ background: "#F5F3FF", borderColor: "#EDE9FF" }}><SelectValue /></SelectTrigger><SelectContent>{["15", "20", "25", "30"].map((d) => <SelectItem key={d} value={d}>{d} minutes</SelectItem>)}</SelectContent></Select>
                </div>
                <div>
                  <Label>Default Grade</Label>
                  <Select defaultValue="3"><SelectTrigger className="rounded-2xl" style={{ background: "#F5F3FF", borderColor: "#EDE9FF" }}><SelectValue /></SelectTrigger><SelectContent>{["K-1", "2-3", "3", "4-5", "6"].map((g) => <SelectItem key={g} value={g}>{g}</SelectItem>)}</SelectContent></Select>
                </div>
                <div>
                  <Label>Opening Question Style</Label>
                  <Select defaultValue="open"><SelectTrigger className="rounded-2xl" style={{ background: "#F5F3FF", borderColor: "#EDE9FF" }}><SelectValue /></SelectTrigger><SelectContent><SelectItem value="open">Open-ended / Socratic</SelectItem><SelectItem value="guided">Guided</SelectItem><SelectItem value="direct">Direct</SelectItem></SelectContent></Select>
                </div>
              </div>
              <div className="space-y-3 pt-2">
                {[
                  { label: "Lila participation balancing", defaultChecked: true },
                  { label: "Lila misinformation correction", defaultChecked: true },
                  { label: "Topic engagement tracking", defaultChecked: true },
                ].map((t) => (
                  <div key={t.label} className="flex items-center justify-between">
                    <Label className="font-normal">{t.label}</Label>
                    <Switch defaultChecked={t.defaultChecked} />
                  </div>
                ))}
              </div>
              <button className="lila-btn-primary" onClick={handleSave}>Save Defaults</button>
            </div>
          )}

          {activeCategory === "notifications" && (
            <div className="space-y-5">
              <h3 className="font-extrabold" style={{ color: "#2D1B69" }}>Notifications</h3>
              <div>
                <Label className="mb-2 block">Email Digest</Label>
                <div className="flex gap-4">
                  {["Off", "Daily", "Weekly"].map((o) => (
                    <label key={o} className="flex items-center gap-2 text-sm cursor-pointer font-bold" style={{ color: "#2D1B69" }}>
                      <input type="radio" name="digest" defaultChecked={o === "Weekly"} style={{ accentColor: "#A78BFA" }} /> {o}
                    </label>
                  ))}
                </div>
              </div>
              <div className="space-y-3 pt-2">
                {[
                  { label: "Session summary ready", defaultChecked: true },
                  { label: "Follow-up reminder (3 days after session)", defaultChecked: true },
                  { label: "Observational signal flag", defaultChecked: true },
                  { label: "New student added to my group", defaultChecked: true },
                ].map((t) => (
                  <div key={t.label} className="flex items-center justify-between">
                    <Label className="font-normal">{t.label}</Label>
                    <Switch defaultChecked={t.defaultChecked} />
                  </div>
                ))}
              </div>
              <button className="lila-btn-primary" onClick={handleSave}>Save Notifications</button>
            </div>
          )}

          {activeCategory === "groups" && (
            <div className="space-y-4">
              <h3 className="font-extrabold" style={{ color: "#2D1B69" }}>Groups & Students</h3>
              <p className="text-sm" style={{ color: "#7C6FAA" }}>Manage your student groups from the Dashboard or Sessions pages.</p>
            </div>
          )}

          {activeCategory === "privacy" && (
            <div className="space-y-4">
              <h3 className="font-extrabold" style={{ color: "#2D1B69" }}>Privacy & Data Controls</h3>
              <div className="space-y-3">
                <button className="lila-btn-secondary">Download My Data</button>
                <button className="lila-btn-secondary" style={{ borderColor: "#FB7185", color: "#FB7185" }}>Delete Session Data for a Student</button>
              </div>
              <div className="flex items-center justify-between pt-2">
                <Label className="font-normal">Opt out of anonymized research</Label>
                <Switch />
              </div>
              <p className="text-xs mt-2" style={{ color: "#A89DC4" }}>Contact our Data Protection Officer: <a href="mailto:dpo@lila.edu" className="font-bold hover:underline" style={{ color: "#A78BFA" }}>dpo@lila.edu</a></p>
            </div>
          )}

          {activeCategory === "access" && (
            <div className="space-y-4">
              <h3 className="font-extrabold" style={{ color: "#2D1B69" }}>Access & Sharing</h3>
              <div>
                <Label>Add Co-Teacher Access</Label>
                <div className="flex gap-2 mt-1">
                  <Input placeholder="co-teacher@school.edu" className="flex-1 rounded-2xl" style={{ background: "#F5F3FF", borderColor: "#EDE9FF" }} />
                  <button className="lila-btn-secondary text-xs !py-2 !px-4">Invite</button>
                </div>
              </div>
              <div className="rounded-2xl p-4" style={{ background: "#F5F3FF", border: "1.5px solid #EDE9FF" }}>
                <p className="text-sm font-bold mb-2" style={{ color: "#2D1B69" }}>Current Access</p>
                <div className="flex items-center justify-between text-sm">
                  <span style={{ color: "#2D1B69" }}>Ms. Park (co-teacher)</span>
                  <button className="text-xs font-bold" style={{ color: "#FB7185" }}>Revoke</button>
                </div>
              </div>
            </div>
          )}

          {activeCategory === "security" && (
            <div className="space-y-4">
              <h3 className="font-extrabold" style={{ color: "#2D1B69" }}>Account Security</h3>
              <button className="lila-btn-secondary">Change Password</button>
              <button className="lila-btn-secondary">Enable Two-Factor Authentication</button>
              <div className="rounded-2xl p-4" style={{ background: "#F5F3FF", border: "1.5px solid #EDE9FF" }}>
                <p className="text-sm font-bold mb-2" style={{ color: "#2D1B69" }}>Active Sessions</p>
                <div className="text-sm mb-2" style={{ color: "#7C6FAA" }}>Chrome on macOS — Current session</div>
                <button className="text-xs font-bold" style={{ color: "#FB7185" }}>Sign Out All Devices</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
