import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { AnimatedBackground } from "@/components/AnimatedBackground";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Shield, Users, Ban, Crown, ArrowLeft } from "lucide-react";

interface UserData {
  user_id: string;
  username: string;
  subscription_tier: string;
  is_banned: boolean;
  ip_address: string | null;
  device_fingerprint: string | null;
  created_at: string;
  role: string;
  email: string;
}

export default function OwnerPanel() {
  const [tab, setTab] = useState<"users" | "bans">("users");
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    checkAccess();
  }, []);

  const checkAccess = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { navigate("/"); return; }

    const { data: role } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .single();

    if (!role || role.role !== "owner") {
      toast.error("Access denied — Owner only");
      navigate("/dashboard");
      return;
    }

    fetchUsers();
  };

  const fetchUsers = async () => {
    setLoading(true);
    const { data, error } = await supabase.functions.invoke("admin", {
      body: { action: "get_all_users" },
    });
    if (error) {
      toast.error("Failed to fetch users");
    } else {
      setUsers(data.users || []);
    }
    setLoading(false);
  };

  const changeRole = async (userId: string, newRole: string) => {
    const { error } = await supabase.functions.invoke("admin", {
      body: { action: "change_role", target_user_id: userId, new_role: newRole },
    });
    if (error) toast.error("Failed to change role");
    else { toast.success("Role updated"); fetchUsers(); }
  };

  const toggleBan = async (userId: string, ban: boolean) => {
    const { error } = await supabase.functions.invoke("admin", {
      body: { action: "ban_user", target_user_id: userId, ban },
    });
    if (error) toast.error("Failed to update ban status");
    else { toast.success(ban ? "User banned" : "User unbanned"); fetchUsers(); }
  };

  const setSubscription = async (userId: string, tier: string) => {
    const { error } = await supabase.functions.invoke("admin", {
      body: { action: "set_subscription", target_user_id: userId, tier },
    });
    if (error) toast.error("Failed to update subscription");
    else { toast.success("Subscription updated"); fetchUsers(); }
  };

  const bannedUsers = users.filter((u) => u.is_banned);

  return (
    <div className="min-h-screen relative">
      <AnimatedBackground />
      <div className="scanline-overlay" />

      <div className="relative z-10 max-w-7xl mx-auto p-4 md:p-6">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" onClick={() => navigate("/dashboard")} className="text-muted-foreground">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back
          </Button>
          <h1 className="font-heading text-2xl text-secondary neon-text-gold flex items-center gap-2">
            <Crown className="w-6 h-6" /> OWNER PANEL
          </h1>
        </div>

        <div className="flex gap-2 mb-6">
          {[
            { id: "users" as const, icon: Users, label: "All Users" },
            { id: "bans" as const, icon: Ban, label: "Ban List" },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-heading text-sm transition-all ${
                tab === t.id ? "bg-primary/20 text-primary neon-glow" : "bg-muted text-muted-foreground"
              }`}
            >
              <t.icon className="w-4 h-4" /> {t.label}
            </button>
          ))}
          <button
            onClick={() => navigate("/admin")}
            className="flex items-center gap-2 px-4 py-2 rounded-lg font-heading text-sm bg-muted text-muted-foreground hover:text-foreground transition-all"
          >
            <Shield className="w-4 h-4" /> Admin Panel
          </button>
        </div>

        {loading ? (
          <div className="glass-panel p-8 text-center text-muted-foreground">Loading...</div>
        ) : tab === "users" ? (
          <div className="glass-panel overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-muted-foreground font-heading text-xs uppercase">
                    <th className="px-4 py-3 text-left">Username</th>
                    <th className="px-4 py-3 text-left">Role</th>
                    <th className="px-4 py-3 text-left">Subscription</th>
                    <th className="px-4 py-3 text-left">Status</th>
                    <th className="px-4 py-3 text-left">Joined</th>
                    <th className="px-4 py-3 text-left">IP</th>
                    <th className="px-4 py-3 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.user_id} className="border-b border-border/50 hover:bg-muted/30">
                      <td className="px-4 py-3 font-body text-foreground">{user.username}</td>
                      <td className="px-4 py-3">
                        <select
                          value={user.role}
                          onChange={(e) => changeRole(user.user_id, e.target.value)}
                          className="bg-input border border-border rounded px-2 py-1 text-xs font-heading text-foreground"
                          disabled={user.username === "iconicibrahim"}
                        >
                          <option value="user">user</option>
                          <option value="admin">admin</option>
                          <option value="head_admin">head_admin</option>
                          <option value="owner">owner</option>
                        </select>
                      </td>
                      <td className="px-4 py-3">
                        <select
                          value={user.subscription_tier}
                          onChange={(e) => setSubscription(user.user_id, e.target.value)}
                          className="bg-input border border-border rounded px-2 py-1 text-xs font-heading text-foreground"
                        >
                          <option value="none">none</option>
                          <option value="free">free</option>
                          <option value="starter">starter</option>
                          <option value="pro">pro</option>
                          <option value="legendary">legendary</option>
                        </select>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-heading px-2 py-1 rounded ${
                          user.is_banned ? "bg-accent/20 text-accent" : "bg-primary/20 text-primary"
                        }`}>
                          {user.is_banned ? "BANNED" : "ACTIVE"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">
                        {new Date(user.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground font-mono">
                        {user.ip_address || "—"}
                      </td>
                      <td className="px-4 py-3">
                        {user.username !== "iconicibrahim" && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => toggleBan(user.user_id, !user.is_banned)}
                            className={user.is_banned ? "text-primary" : "text-accent"}
                          >
                            {user.is_banned ? "Unban" : "Ban"}
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="glass-panel overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-muted-foreground font-heading text-xs uppercase">
                    <th className="px-4 py-3 text-left">Username</th>
                    <th className="px-4 py-3 text-left">IP Address</th>
                    <th className="px-4 py-3 text-left">Device</th>
                    <th className="px-4 py-3 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {bannedUsers.length === 0 ? (
                    <tr><td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">No banned users</td></tr>
                  ) : bannedUsers.map((user) => (
                    <tr key={user.user_id} className="border-b border-border/50">
                      <td className="px-4 py-3 text-foreground">{user.username}</td>
                      <td className="px-4 py-3 text-muted-foreground font-mono text-xs">{user.ip_address || "—"}</td>
                      <td className="px-4 py-3 text-muted-foreground font-mono text-xs">{user.device_fingerprint || "—"}</td>
                      <td className="px-4 py-3">
                        <Button size="sm" variant="ghost" onClick={() => toggleBan(user.user_id, false)} className="text-primary">
                          Unban
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
