import React, { useMemo } from "react";
import { motion } from "framer-motion";

const AnimatedBackground: React.FC = () => {
  // Memoize particle positions so they don't change on re-render
  const particles = useMemo(() => {
    return [...Array(6)].map((_, i) => ({
      id: i,
      top: Math.random() * 100,
      left: Math.random() * 100,
      delay: i * 0.5,
      duration: 3 + Math.random() * 2,
      x: Math.random() * 20 - 10,
    }));
  }, []);

  return (
    <div className="absolute inset-0 bg-linear-to-br from-slate-50 via-white to-sky-50/30 pointer-events-none">
      {/* Floating orbs */}
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          x: [0, 50, 0],
          y: [0, -30, 0],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute top-20 right-10 w-72 h-72 bg-sky-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30"
      />
      <motion.div
        animate={{
          scale: [1, 1.1, 1],
          x: [0, -30, 0],
          y: [0, 50, 0],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2,
        }}
        className="absolute bottom-20 left-10 w-72 h-72 bg-cyan-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30"
      />
      <motion.div
        animate={{
          scale: [1, 1.15, 1],
          x: [0, 20, 0],
          y: [0, -40, 0],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 4,
        }}
        className="absolute top-1/2 left-1/2 w-96 h-96 bg-teal-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20"
      />

      {/* Floating particles with stable positions */}
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          animate={{
            y: [0, -30, 0],
            x: [0, particle.x, 0],
            opacity: [0.2, 0.5, 0.2],
          }}
          transition={{
            duration: particle.duration,
            repeat: Infinity,
            ease: "easeInOut",
            delay: particle.delay,
          }}
          className="absolute w-2 h-2 bg-sky-400 rounded-full"
          style={{
            top: `${particle.top}%`,
            left: `${particle.left}%`,
          }}
        />
      ))}
    </div>
  );
};

export default AnimatedBackground;