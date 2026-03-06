import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { AnimatedBackground } from "@/components/AnimatedBackground";
import { SocialProofTicker } from "@/components/SocialProofTicker";
import { LiveCounter } from "@/components/LiveCounter";
import { PredictorTool } from "@/components/PredictorTool";
import { SubscriptionCards } from "@/components/SubscriptionCards";
import { CountdownTimer, FakeStats, TestimonialCarousel } from "@/components/FakeElements";
import { Button } from "@/components/ui/button";
import { Pickaxe, Crown, CreditCard, MessageCircle, LogOut, Shield } from "lucide-react";

type Tab = "predictor" | "subscription" | "discord";

export default function DashboardPage() {
  const [tab, setTab] = useState<Tab>("predictor");
  const [username, setUsername] = useState("");
  const [tier, setTier] = useState("none");
  const [role, setRole] = useState("user");
  const navigate = useNavigate();

  useEffect(() => {
    const loadProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { navigate("/"); return; }

      setUsername(user.user_metadata?.username || "User");

      const { data: profile } = await supabase
        .from("profiles")
        .select("subscription_tier, is_banned")
        .eq("user_id", user.id)
        .single();

      if (profile?.is_banned) {
        await supabase.auth.signOut();
        navigate("/");
        return;
      }

      if (profile) setTier(profile.subscription_tier || "none");

      const { data: roleData } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .single();

      if (roleData) setRole(roleData.role);
    };

    loadProfile();
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const accuracyMap: Record<string, string> = {
    none: "—",
    free: "67%",
    starter: "80%",
    pro: "92%",
    legendary: "99.7%",
  };

  const navItems = [
    { id: "predictor" as Tab, icon: Pickaxe, label: "Predictor" },
    { id: "subscription" as Tab, icon: CreditCard, label: "Subscription" },
    { id: "discord" as Tab, icon: MessageCircle, label: "Discord" },
  ];

  return (
    <div className="min-h-screen flex flex-col relative">
      <AnimatedBackground />
      <div className="scanline-overlay" />

      {/* Top Nav */}
      <header className="relative z-10 border-b border-border bg-card/60 backdrop-blur-xl">
        <div className="flex items-center justify-between px-4 py-3 max-w-7xl mx-auto">
          <h1 className="font-heading text-lg text-primary neon-text">⛏️ MINESS</h1>
          <div className="flex items-center gap-3 flex-wrap">
            <LiveCounter />
            <span className={`text-xs font-heading px-2 py-1 rounded ${
              tier === "legendary" ? "bg-secondary/20 text-secondary neon-glow-gold" :
              tier === "pro" ? "bg-primary/20 text-primary neon-glow" :
              "bg-muted text-muted-foreground"
            }`}>
              {tier.toUpperCase()}
            </span>
            <span className="text-sm font-body text-foreground">{username}</span>
            {(role === "owner" || role === "head_admin") && (
              <Button size="sm" variant="ghost" onClick={() => navigate("/owner")} className="text-secondary">
                <Crown className="w-4 h-4" />
              </Button>
            )}
            {["owner", "head_admin", "admin"].includes(role) && (
              <Button size="sm" variant="ghost" onClick={() => navigate("/admin")} className="text-primary">
                <Shield className="w-4 h-4" />
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={handleLogout} className="text-muted-foreground hover:text-foreground">
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      <div className="flex flex-1 relative z-10">
        {/* Sidebar */}
        <aside className="w-56 border-r border-border bg-card/40 backdrop-blur-xl p-4 hidden md:block">
          <nav className="space-y-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => item.id === "discord" ? window.open("https://discord.gg/7njpbr7vAx", "_blank") : setTab(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-body transition-all ${
                  tab === item.id ? "bg-primary/20 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </button>
            ))}
          </nav>

          <div className="mt-6">
            <TestimonialCarousel />
          </div>
        </aside>

        {/* Main */}
        <main className="flex-1 p-4 md:p-6 overflow-y-auto">
          {(tier === "none" || tier === "free") && (
            <div className="mb-4 glass-panel p-3 border-accent/20 flex items-center justify-between">
              <span className="text-sm text-muted-foreground font-body">Upgrade your plan for better predictions</span>
              <Button size="sm" onClick={() => setTab("subscription")} className="bg-primary text-primary-foreground font-heading text-xs">
                UPGRADE
              </Button>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
            <div className="lg:col-span-2">
              <CountdownTimer label="Predictions reset in:" />
            </div>
            <FakeStats />
          </div>

          {tab === "predictor" && (
            <PredictorTool subscriptionTier={tier} accuracy={accuracyMap[tier] || "—"} />
          )}

          {tab === "subscription" && <SubscriptionCards />}
        </main>

        {/* Right sidebar */}
        <aside className="w-64 border-l border-border bg-card/40 backdrop-blur-xl p-4 hidden xl:block">
          <h3 className="font-heading text-xs text-muted-foreground uppercase tracking-wider mb-3">Live Activity</h3>
          <ActivityFeed />
        </aside>
      </div>

      {/* Floating Discord button */}
      <a
        href="https://discord.gg/7njpbr7vAx"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-40 bg-[#5865F2] text-foreground p-3 rounded-full shadow-lg hover:scale-110 transition-transform"
      >
        <MessageCircle className="w-6 h-6" />
      </a>

      <SocialProofTicker />
    </div>
  );
}

function ActivityFeed() {
  const messages = [
    "🟢 xSlayer99 won 4.2x",
    "💎 ProGamer upgraded to PRO",
    "✅ Seed verified — WIN",
    "🔥 NewUser joined",
    "🟢 LuckyStrike won 3.1x",
    "💎 CryptoKing → LEGENDARY",
    "✅ 5/5 predictions correct",
    "🔥 12 users joined this minute",
  ];

  return (
    <div className="space-y-2">
      {messages.map((msg, i) => (
        <div key={i} className="text-xs text-muted-foreground py-2 border-b border-border/50 font-body">
          {msg}
        </div>
      ))}
    </div>
  );
}
