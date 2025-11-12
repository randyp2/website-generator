"use client";

import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";

const AnimatedBackground: React.FC = () => {
  // Memoize particle positions so they don't change on re-render
  const [particles, setParticles] = useState<
    { id: number; top: string; left: string }[]
  >([]);

  useEffect(() => {
    const generated = Array.from({ length: 10 }).map((_, i) => ({
      id: i,
      top: `${Math.random() * 100}%`,
      left: `${Math.random() * 100}%`,
    }));
    setParticles(generated);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          animate={{ y: [0, -30, 0] }}
          transition={{ duration: 5, repeat: Infinity }}
          className="absolute w-2 h-2 bg-sky-400 rounded-full"
          style={{ top: p.top, left: p.left }}
        />
      ))}
    </div>
  );
};

export default AnimatedBackground;
