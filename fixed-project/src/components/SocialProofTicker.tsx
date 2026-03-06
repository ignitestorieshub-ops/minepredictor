import { useEffect, useState } from "react";

const MESSAGES = [
  "🟢 Ahmed_X just predicted correctly — Won 4.2x!",
  "🔥 LiveUser_992 joined 2 minutes ago",
  "💎 xSlayer99 upgraded to LEGENDARY plan",
  "✅ Prediction verified — Seed: 7f3a2b confirmed WIN",
  "🟢 CryptoKing88 hit 3 safe zones — +$47.20",
  "🔥 ShadowBet_KW joined just now",
  "💎 ProGamer_X upgraded to PRO plan",
  "✅ Seed: a4c91e verified — 5/5 correct predictions",
  "🟢 LuckyStrike77 won 3.8x on 4 mines!",
  "🔥 BetMaster_22 is on a 12-win streak!",
  "💎 NightOwl_99 upgraded to STARTER plan",
  "✅ Prediction verified — Seed: d82f4a confirmed WIN",
  "🟢 HighRoller_55 predicted 5 safe zones correctly",
  "🔥 xVenom_KW just joined the platform",
  "💎 StarPlayer_44 upgraded to LEGENDARY plan",
  "✅ Seed: 1b7e3c verified — WIN confirmed",
  "🟢 DiamondHands_88 won 6.1x multiplier!",
  "🔥 QuickBet_11 joined 30 seconds ago",
  "💎 MegaWin_KW upgraded to PRO plan",
  "✅ Prediction verified — Seed: f9a2d1 confirmed WIN",
  "🟢 BlazeBet_77 hit safe zone — +$89.50",
  "🔥 RiskTaker_33 joined from Kuwait",
  "💎 GoldRush_X upgraded to LEGENDARY plan",
  "✅ Seed: 5c8b7e verified — 4/4 correct",
  "🟢 SilverFox_22 won 2.9x on 3 mines",
  "🔥 NewPlayer_847 just signed up",
  "💎 EliteBet_KW upgraded to PRO plan",
  "🟢 TopShot_99 predicted correctly — Won 5.5x!",
  "🔥 WinnerCircle_11 is viewing LEGENDARY plan",
  "💎 Phantom_X just upgraded to STARTER plan",
];

export function SocialProofTicker() {
  const [currentMessage, setCurrentMessage] = useState("");
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const showMessage = () => {
      const msg = MESSAGES[Math.floor(Math.random() * MESSAGES.length)];
      setCurrentMessage(msg);
      setVisible(true);
      setTimeout(() => setVisible(false), 3500);
    };

    showMessage();
    const interval = setInterval(showMessage, Math.random() * 5000 + 3000);
    return () => clearInterval(interval);
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed bottom-6 left-6 z-40 max-w-sm">
      <div className="glass-panel px-4 py-3 neon-glow animate-in slide-in-from-bottom-4 fade-in duration-300">
        <p className="text-sm font-body text-foreground">{currentMessage}</p>
      </div>
    </div>
  );
}
