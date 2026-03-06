import { useEffect, useState } from "react";

export function CountdownTimer({ label }: { label: string }) {
  const [time, setTime] = useState({ h: 23, m: 47, s: 12 });

  useEffect(() => {
    const interval = setInterval(() => {
      setTime((prev) => {
        let { h, m, s } = prev;
        s--;
        if (s < 0) { s = 59; m--; }
        if (m < 0) { m = 59; h--; }
        if (h < 0) { h = 23; m = 59; s = 59; }
        return { h, m, s };
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const pad = (n: number) => n.toString().padStart(2, "0");

  return (
    <div className="glass-panel px-4 py-3 flex items-center gap-3">
      <span className="text-accent text-sm">⏰</span>
      <span className="text-sm font-body text-muted-foreground">{label}</span>
      <span className="font-heading text-primary neon-text text-sm">
        {pad(time.h)}:{pad(time.m)}:{pad(time.s)}
      </span>
    </div>
  );
}

export function FakeStats() {
  const [predictions, setPredictions] = useState(2341);

  useEffect(() => {
    const interval = setInterval(() => {
      setPredictions((p) => p + Math.floor(Math.random() * 3));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="grid grid-cols-2 gap-3">
      <div className="glass-panel p-4 text-center">
        <p className="text-2xl font-heading text-primary neon-text">{predictions.toLocaleString()}</p>
        <p className="text-xs text-muted-foreground mt-1">Correct Predictions Today</p>
      </div>
      <div className="glass-panel p-4 text-center">
        <p className="text-2xl font-heading text-secondary neon-text-gold">847</p>
        <p className="text-xs text-muted-foreground mt-1">Wins in Last Hour</p>
      </div>
    </div>
  );
}

const TESTIMONIALS = [
  { text: "I turned $20 into $340 using Miness!", user: "StarPlayer_KW" },
  { text: "99.7% accuracy is no joke. This is insane.", user: "CryptoKing88" },
  { text: "Best prediction tool I've ever used!", user: "HighRoller_55" },
  { text: "Made $1,200 in one session. Legendary plan is worth it.", user: "DiamondHands_88" },
];

export function TestimonialCarousel() {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setIdx((i) => (i + 1) % TESTIMONIALS.length), 4000);
    return () => clearInterval(interval);
  }, []);

  const t = TESTIMONIALS[idx];

  return (
    <div className="glass-panel p-4">
      <p className="text-sm text-foreground italic">"{t.text}"</p>
      <p className="text-xs text-secondary mt-2 font-heading">— {t.user}</p>
    </div>
  );
}
