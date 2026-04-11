import { useState } from "react";
import { AppShell } from "@/components/bridge/AppShell";
import { Button } from "@/components/ui/button";
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
              className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors ${
                activeCategory === c.id ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground hover:bg-muted"
              }`}
            >
              <c.icon className="h-4 w-4" />
              {c.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="bridge-card">
          {activeCategory === "profile" && (
            <div className="space-y-5">
              <h3>Profile</h3>
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-lg font-bold text-primary-foreground">MR</div>
                <Button variant="outline" size="sm">Change Photo</Button>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div><Label>Name</Label><Input defaultValue="Maria Rivera" /></div>
                <div><Label>Email</Label><Input defaultValue="m.rivera@maplewood.edu" /></div>
                <div><Label>School</Label><Input defaultValue="Maplewood Elementary" disabled /></div>
                <div><Label>Role</Label><Input defaultValue="Teacher" disabled /></div>
              </div>
              <Button onClick={handleSave}>Save Profile</Button>
            </div>
          )}

          {activeCategory === "defaults" && (
            <div className="space-y-5">
              <h3>Session Defaults</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label>Default Duration</Label>
                  <Select defaultValue="20"><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{["15", "20", "25", "30"].map((d) => <SelectItem key={d} value={d}>{d} minutes</SelectItem>)}</SelectContent></Select>
                </div>
                <div>
                  <Label>Default Grade</Label>
                  <Select defaultValue="3"><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{["K-1", "2-3", "3", "4-5", "6"].map((g) => <SelectItem key={g} value={g}>{g}</SelectItem>)}</SelectContent></Select>
                </div>
                <div>
                  <Label>Opening Question Style</Label>
                  <Select defaultValue="open"><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="open">Open-ended / Socratic</SelectItem><SelectItem value="guided">Guided</SelectItem><SelectItem value="direct">Direct</SelectItem></SelectContent></Select>
                </div>
              </div>
              <div className="space-y-3 pt-2">
                {[
                  { label: "AI participation balancing", defaultChecked: true },
                  { label: "AI misinformation correction", defaultChecked: true },
                  { label: "Topic engagement tracking", defaultChecked: true },
                ].map((t) => (
                  <div key={t.label} className="flex items-center justify-between">
                    <Label className="font-normal">{t.label}</Label>
                    <Switch defaultChecked={t.defaultChecked} />
                  </div>
                ))}
              </div>
              <Button onClick={handleSave}>Save Defaults</Button>
            </div>
          )}

          {activeCategory === "notifications" && (
            <div className="space-y-5">
              <h3>Notifications</h3>
              <div>
                <Label className="mb-2 block">Email Digest</Label>
                <div className="flex gap-4">
                  {["Off", "Daily", "Weekly"].map((o) => (
                    <label key={o} className="flex items-center gap-2 text-sm cursor-pointer">
                      <input type="radio" name="digest" defaultChecked={o === "Weekly"} className="accent-primary" /> {o}
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
              <Button onClick={handleSave}>Save Notifications</Button>
            </div>
          )}

          {activeCategory === "groups" && (
            <div className="space-y-4">
              <h3>Groups & Students</h3>
              <p className="text-sm text-muted-foreground">Manage your student groups from the Dashboard or Sessions pages.</p>
            </div>
          )}

          {activeCategory === "privacy" && (
            <div className="space-y-4">
              <h3>Privacy & Data Controls</h3>
              <div className="space-y-3">
                <Button variant="outline">Download My Data</Button>
                <Button variant="outline" className="text-destructive">Delete Session Data for a Student</Button>
              </div>
              <div className="flex items-center justify-between pt-2">
                <Label className="font-normal">Opt out of anonymized research</Label>
                <Switch />
              </div>
              <p className="text-xs text-muted-foreground mt-2">Contact our Data Protection Officer: <a href="mailto:dpo@bridge.edu" className="text-primary hover:underline">dpo@bridge.edu</a></p>
            </div>
          )}

          {activeCategory === "access" && (
            <div className="space-y-4">
              <h3>Access & Sharing</h3>
              <div>
                <Label>Add Co-Teacher Access</Label>
                <div className="flex gap-2 mt-1">
                  <Input placeholder="co-teacher@school.edu" className="flex-1" />
                  <Button variant="outline">Invite</Button>
                </div>
              </div>
              <div className="rounded-xl border border-border p-4">
                <p className="text-sm font-medium mb-2">Current Access</p>
                <div className="flex items-center justify-between text-sm">
                  <span>Ms. Park (co-teacher)</span>
                  <Button variant="ghost" size="sm" className="text-destructive text-xs">Revoke</Button>
                </div>
              </div>
            </div>
          )}

          {activeCategory === "security" && (
            <div className="space-y-4">
              <h3>Account Security</h3>
              <Button variant="outline">Change Password</Button>
              <Button variant="outline">Enable Two-Factor Authentication</Button>
              <div className="rounded-xl border border-border p-4">
                <p className="text-sm font-medium mb-2">Active Sessions</p>
                <div className="text-sm text-muted-foreground mb-2">Chrome on macOS — Current session</div>
                <Button variant="ghost" size="sm" className="text-destructive text-xs">Sign Out All Devices</Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
