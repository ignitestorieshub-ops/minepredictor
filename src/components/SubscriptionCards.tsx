import { Button } from "@/components/ui/button";

const PLANS = [
  {
    name: "FREE",
    price: "Free",
    accuracy: "67%",
    features: ["3 predictions/day", "Basic grid analysis", "Community access"],
    cta: "Get Free Access → Verify on Discord",
    href: "https://discord.gg/7njpbr7vAx",
    highlight: false,
  },
  {
    name: "STARTER",
    price: "$5.99/mo",
    accuracy: "80%",
    features: ["Unlimited predictions", "Enhanced algorithm", "Priority support"],
    cta: "Go to Discord to Purchase →",
    href: "https://discord.gg/7njpbr7vAx",
    highlight: false,
  },
  {
    name: "PRO",
    price: "$12.99/mo",
    accuracy: "92%",
    features: ["Unlimited predictions", "Advanced AI model", "Real-time analysis", "VIP support"],
    cta: "Go to Discord to Purchase →",
    href: "https://discord.gg/7njpbr7vAx",
    highlight: true,
  },
  {
    name: "LEGENDARY",
    price: "$16.99/mo",
    accuracy: "99.7%",
    features: ["Unlimited predictions", "Neural network model", "Instant analysis", "1-on-1 support", "Custom strategies"],
    cta: "Go to Discord to Purchase →",
    href: "https://discord.gg/7njpbr7vAx",
    highlight: false,
    badge: "👑 MOST ACCURATE",
  },
];

export function SubscriptionCards() {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="font-heading text-2xl text-foreground">Choose Your Plan</h2>
        <p className="text-muted-foreground text-sm mt-1">Join 50,000+ winners today</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {PLANS.map((plan) => (
          <div
            key={plan.name}
            className={`glass-panel p-5 flex flex-col relative ${
              plan.highlight ? "neon-glow border-primary" : ""
            } ${plan.name === "LEGENDARY" ? "neon-glow-gold border-secondary" : ""}`}
          >
            {plan.badge && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-secondary text-secondary-foreground text-xs font-heading px-3 py-1 rounded-full">
                {plan.badge}
              </span>
            )}
            {plan.highlight && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-heading px-3 py-1 rounded-full">
                ⚡ POPULAR
              </span>
            )}

            <h3 className="font-heading text-lg text-foreground">{plan.name}</h3>
            <p className="text-2xl font-heading text-primary mt-2">{plan.price}</p>
            <p className="text-xs text-muted-foreground mt-1">
              Accuracy: <span className={`font-semibold ${plan.name === "LEGENDARY" ? "text-secondary" : "text-primary"}`}>{plan.accuracy}</span>
            </p>

            <ul className="mt-4 space-y-2 flex-1">
              {plan.features.map((f) => (
                <li key={f} className="text-xs text-muted-foreground flex items-center gap-2">
                  <span className="text-primary">✓</span> {f}
                </li>
              ))}
            </ul>

            <a href={plan.href} target="_blank" rel="noopener noreferrer" className="mt-4">
              <Button className="w-full bg-primary text-primary-foreground font-heading text-xs">
                {plan.cta}
              </Button>
            </a>

            <p className="text-xs text-accent mt-2 text-center animate-pulse">
              ⚡ Only {Math.floor(Math.random() * 5) + 2} slots left!
            </p>
            <p className="text-xs text-muted-foreground text-center">
              🔥 {Math.floor(Math.random() * 50) + 20} people viewing now
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
