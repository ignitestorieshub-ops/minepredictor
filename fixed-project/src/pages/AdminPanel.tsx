import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { AnimatedBackground } from "@/components/AnimatedBackground";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Shield, ArrowLeft, Search, CreditCard, Users } from "lucide-react";

interface UserData {
  user_id: string;
  username: string;
  subscription_tier: string;
  is_banned: boolean;
  created_at: string;
  role: string;
}

export default function AdminPanel() {
  const [tab, setTab] = useState<"subscriptions" | "lookup">("subscriptions");
  const [users, setUsers] = useState<UserData[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
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

    if (!role || !["owner", "head_admin", "admin"].includes(role.role)) {
      toast.error("Access denied — Admin only");
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
    if (!error) setUsers(data.users || []);
    setLoading(false);
  };

  const setSubscription = async (userId: string, tier: string) => {
    const { error } = await supabase.functions.invoke("admin", {
      body: { action: "set_subscription", target_user_id: userId, tier },
    });
    if (error) toast.error("Failed");
    else { toast.success("Subscription updated"); fetchUsers(); }
  };

  const filteredUsers = users.filter((u) =>
    u.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen relative">
      <AnimatedBackground />
      <div className="scanline-overlay" />

      <div className="relative z-10 max-w-6xl mx-auto p-4 md:p-6">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" onClick={() => navigate("/dashboard")} className="text-muted-foreground">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back
          </Button>
          <h1 className="font-heading text-2xl text-primary neon-text flex items-center gap-2">
            <Shield className="w-6 h-6" /> ADMIN PANEL
          </h1>
        </div>

        <div className="flex gap-2 mb-6">
          {[
            { id: "subscriptions" as const, icon: CreditCard, label: "Subscriptions" },
            { id: "lookup" as const, icon: Users, label: "User Lookup" },
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
        </div>

        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by username..."
              className="pl-10 bg-input border-border"
            />
          </div>
        </div>

        {loading ? (
          <div className="glass-panel p-8 text-center text-muted-foreground">Loading...</div>
        ) : (
          <div className="glass-panel overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-muted-foreground font-heading text-xs uppercase">
                    <th className="px-4 py-3 text-left">Username</th>
                    <th className="px-4 py-3 text-left">Role</th>
                    <th className="px-4 py-3 text-left">
                      {tab === "subscriptions" ? "Subscription" : "Info"}
                    </th>
                    <th className="px-4 py-3 text-left">Status</th>
                    <th className="px-4 py-3 text-left">Joined</th>
                    {tab === "subscriptions" && <th className="px-4 py-3 text-left">Set Tier</th>}
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr key={user.user_id} className="border-b border-border/50 hover:bg-muted/30">
                      <td className="px-4 py-3 text-foreground font-body">{user.username}</td>
                      <td className="px-4 py-3">
                        <span className="text-xs font-heading bg-muted px-2 py-1 rounded text-muted-foreground">
                          {user.role}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-heading px-2 py-1 rounded ${
                          user.subscription_tier === "legendary" ? "bg-secondary/20 text-secondary" :
                          user.subscription_tier === "pro" ? "bg-primary/20 text-primary" :
                          "bg-muted text-muted-foreground"
                        }`}>
                          {user.subscription_tier}
                        </span>
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
                      {tab === "subscriptions" && (
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
                      )}
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
