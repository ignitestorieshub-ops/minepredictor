import { useState, useCallback, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, Zap, Shield, Target } from "lucide-react";

function generatePrediction(seed: string, mines: number, gridSize: number, tier: string): number[] {
  const total = gridSize * gridSize;
  
  // Tier determines how many safe cells to reveal
  const safeCounts: Record<string, number> = {
    free: 2,
    starter: 3,
    pro: 4,
    legendary: 5,
  };
  const safeCount = safeCounts[tier] || 2;

  // Random generation — different each time
  const noise = Date.now() + Math.random() * 100000;
  let hash = 0;
  const input = `${seed}-${mines}-${gridSize}-${noise}`;
  for (let i = 0; i < input.length; i++) {
    hash = ((hash << 5) - hash) + input.charCodeAt(i);
    hash = hash & hash;
  }

  // For free tier, bias towards cells that are more likely to be dangerous
  // by picking from a restricted pool
  const allIndices = Array.from({ length: total }, (_, i) => i);
  const safeIndices: number[] = [];
  let h = Math.abs(hash);

  if (tier === "free") {
    // Free gets worst spots — corners and edges (more likely mine positions)
    const edgeIndices = allIndices.filter(i => {
      const row = Math.floor(i / gridSize);
      const col = i % gridSize;
      return row === 0 || row === gridSize - 1 || col === 0 || col === gridSize - 1;
    });
    const shuffled = edgeIndices.sort(() => (h = Math.abs((h * 2654435761) >> 0), (h % 3) - 1));
    for (let i = 0; i < safeCount && i < shuffled.length; i++) {
      safeIndices.push(shuffled[i]);
    }
  } else {
    // Higher tiers get better center-biased positions
    const centerWeight = tier === "legendary" ? 3 : tier === "pro" ? 2 : 1;
    const weighted = allIndices.map(i => {
      const row = Math.floor(i / gridSize);
      const col = i % gridSize;
      const distFromCenter = Math.abs(row - 2) + Math.abs(col - 2);
      return { idx: i, weight: (5 - distFromCenter) * centerWeight + Math.random() };
    }).sort((a, b) => b.weight - a.weight);

    for (let i = 0; i < safeCount; i++) {
      safeIndices.push(weighted[i].idx);
    }
  }

  return safeIndices;
}

interface PredictorToolProps {
  subscriptionTier: string;
  accuracy: string;
}

export function PredictorTool({ subscriptionTier, accuracy }: PredictorToolProps) {
  const [mines, setMines] = useState(3);
  const [seed, setSeed] = useState("");
  const [seedError, setSeedError] = useState("");
  const [predicted, setPredicted] = useState(false);
  const [safeZones, setSafeZones] = useState<number[]>([]);
  const [cooldown, setCooldown] = useState(0);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const cooldownRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const hasUsedOnce = useRef(false);
  const gridSize = 5;

  const isLocked = subscriptionTier === "none";

  const validateSeed = (s: string) => /^[a-fA-F0-9]{64}$/.test(s);

  useEffect(() => {
    return () => {
      if (cooldownRef.current) clearInterval(cooldownRef.current);
    };
  }, []);

  const startCooldown = useCallback(() => {
    setCooldown(5);
    cooldownRef.current = setInterval(() => {
      setCooldown(prev => {
        if (prev <= 1) {
          if (cooldownRef.current) clearInterval(cooldownRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  const handlePredict = useCallback(() => {
    if (cooldown > 0) return;
    if (!validateSeed(seed)) {
      setSeedError("Invalid seed format — requires 64-character hex (SHA256)");
      return;
    }
    setSeedError("");

    if (hasUsedOnce.current) {
      // Second+ click: show analyzing state then cooldown
      setIsAnalyzing(true);
      setPredicted(false);
      startCooldown();
      setTimeout(() => {
        const zones = generatePrediction(seed, mines, gridSize, subscriptionTier);
        setSafeZones(zones);
        setPredicted(true);
        setIsAnalyzing(false);
      }, 2000);
    } else {
      // First click: instant
      setIsAnalyzing(true);
      setTimeout(() => {
        const zones = generatePrediction(seed, mines, gridSize, subscriptionTier);
        setSafeZones(zones);
        setPredicted(true);
        setIsAnalyzing(false);
        hasUsedOnce.current = true;
        startCooldown();
      }, 1500);
    }
  }, [seed, mines, cooldown, subscriptionTier, startCooldown]);

  const tierConfig: Record<string, { label: string; color: string; glow: string }> = {
    free: { label: "BASIC", color: "text-muted-foreground", glow: "" },
    starter: { label: "STARTER", color: "text-primary", glow: "neon-glow" },
    pro: { label: "PRO", color: "text-primary", glow: "neon-glow" },
    legendary: { label: "LEGENDARY", color: "text-secondary", glow: "neon-glow-gold" },
  };

  const currentTier = tierConfig[subscriptionTier] || tierConfig.free;

  return (
    <div className="relative">
      {isLocked && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 z-20 bg-background/90 backdrop-blur-md rounded-xl flex items-center justify-center"
        >
          <div className="text-center space-y-3">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto">
              <Lock className="w-7 h-7 text-muted-foreground" />
            </div>
            <p className="font-heading text-lg text-foreground">Unlock Predictions</p>
            <p className="text-sm text-muted-foreground max-w-[240px]">Subscribe to access the prediction engine</p>
          </div>
        </motion.div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center ${currentTier.glow}`}>
            <Target className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="font-heading text-lg text-foreground tracking-wide">PREDICTOR</h2>
            <p className="text-xs text-muted-foreground font-body">Mines Pattern Analysis</p>
          </div>
        </div>
        {!isLocked && (
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full bg-card border border-border ${currentTier.glow}`}>
            <Shield className={`w-3.5 h-3.5 ${currentTier.color}`} />
            <span className={`text-xs font-heading ${currentTier.color}`}>{accuracy}</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Controls */}
        <div className="space-y-5">
          {/* Mines selector */}
          <div>
            <label className="text-[11px] font-heading text-muted-foreground uppercase tracking-widest mb-2.5 block">
              Mines
            </label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  onClick={() => { setMines(n); setPredicted(false); hasUsedOnce.current = false; }}
                  className={`flex-1 h-11 rounded-lg font-heading text-sm transition-all duration-200 ${
                    mines === n
                      ? "bg-primary text-primary-foreground shadow-[0_0_20px_hsl(var(--primary)/0.3)]"
                      : "bg-card border border-border text-muted-foreground hover:border-primary/30 hover:text-foreground"
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>

          {/* Seed input */}
          <div>
            <label className="text-[11px] font-heading text-muted-foreground uppercase tracking-widest mb-2.5 block">
              Server Seed
            </label>
            <Input
              value={seed}
              onChange={(e) => { setSeed(e.target.value); setSeedError(""); setPredicted(false); hasUsedOnce.current = false; }}
              placeholder="Paste 64-character hex seed..."
              className="bg-card border-border focus:border-primary/50 font-mono text-xs h-11 placeholder:text-muted-foreground/40"
            />
            <AnimatePresence>
              {seedError && (
                <motion.p
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="text-xs text-accent mt-2 font-body"
                >
                  {seedError}
                </motion.p>
              )}
            </AnimatePresence>
          </div>

          {/* Predict button */}
          <Button
            onClick={handlePredict}
            disabled={!seed || cooldown > 0 || isAnalyzing}
            className={`w-full h-12 font-heading font-bold text-sm tracking-wider transition-all duration-300 ${
              cooldown > 0
                ? "bg-muted text-muted-foreground"
                : "bg-primary text-primary-foreground shadow-[0_0_30px_hsl(var(--primary)/0.25)] hover:shadow-[0_0_40px_hsl(var(--primary)/0.4)]"
            }`}
          >
            {isAnalyzing ? (
              <span className="flex items-center gap-2">
                <motion.span
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                  className="inline-block"
                >
                  <Zap className="w-4 h-4" />
                </motion.span>
                ANALYZING...
              </span>
            ) : cooldown > 0 ? (
              `COOLDOWN ${cooldown}s`
            ) : (
              "PREDICT"
            )}
          </Button>

          {/* Tier info */}
          {!isLocked && predicted && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-panel p-3 text-center"
            >
              <p className="text-xs text-muted-foreground font-body">
                {safeZones.length} safe zone{safeZones.length > 1 ? "s" : ""} identified
                <span className="mx-1.5 text-border">·</span>
                <span className={currentTier.color}>{subscriptionTier.toUpperCase()}</span> tier
              </p>
            </motion.div>
          )}
        </div>

        {/* Grid */}
        <div>
          <label className="text-[11px] font-heading text-muted-foreground uppercase tracking-widest mb-2.5 block">
            5×5 Grid
          </label>
          <div className="grid grid-cols-5 gap-1.5 p-3 rounded-xl bg-card/50 border border-border">
            {Array.from({ length: 25 }, (_, i) => {
              const isSafe = predicted && safeZones.includes(i);
              const isDanger = predicted && !isSafe;
              return (
                <motion.div
                  key={i}
                  initial={predicted ? { scale: 0.8, opacity: 0 } : false}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: predicted ? i * 0.02 : 0, duration: 0.2 }}
                  className={`aspect-square rounded-lg flex items-center justify-center transition-all duration-300 ${
                    isSafe
                      ? "bg-primary/20 border border-primary/60 shadow-[0_0_12px_hsl(var(--primary)/0.3)]"
                      : isDanger
                      ? "bg-accent/5 border border-accent/15"
                      : "bg-muted/50 border border-border/50"
                  }`}
                >
                  {isSafe ? (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: i * 0.02 + 0.1, type: "spring" }}
                    >
                      <Shield className="w-4 h-4 text-primary" />
                    </motion.div>
                  ) : isDanger ? (
                    <span className="text-[10px] text-accent/30">✕</span>
                  ) : (
                    <span className="text-[10px] text-muted-foreground/30">·</span>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
