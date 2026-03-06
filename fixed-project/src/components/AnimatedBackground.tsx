import { useEffect, useMemo } from "react";
import { motion } from "framer-motion";

function Diamond({ delay, x, size }: { delay: number; x: number; size: number }) {
  return (
    <motion.div
      className="absolute border border-primary/10 rotate-45"
      style={{ width: size, height: size, left: `${x}%` }}
      initial={{ y: "110vh", opacity: 0 }}
      animate={{ y: "-10vh", opacity: [0, 0.3, 0.3, 0] }}
      transition={{ duration: 20 + Math.random() * 10, delay, repeat: Infinity, ease: "linear" }}
    />
  );
}

export function AnimatedBackground() {
  const diamonds = useMemo(
    () =>
      Array.from({ length: 12 }, (_, i) => ({
        id: i,
        delay: Math.random() * 15,
        x: Math.random() * 100,
        size: 20 + Math.random() * 40,
      })),
    []
  );

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0 grid-pattern">
      {diamonds.map((d) => (
        <Diamond key={d.id} {...d} />
      ))}
    </div>
  );
}
