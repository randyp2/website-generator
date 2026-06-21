"use client";

import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Toast } from "./toast";
import { useToastStore } from "@/hooks/useToast";

// How far each older toast peeks above the one in front of it, and how much
// it shrinks — together these create the stacked "deck of cards" look.
const STACK_OFFSET_PX = 14;
const STACK_SCALE_STEP = 0.05;

export const Toaster: React.FC = () => {
  const { toasts, removeToast } = useToastStore();
  const total = toasts.length;

  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-[200] w-96 max-w-[calc(100vw-2rem)]">
      <AnimatePresence mode="popLayout">
        {toasts.map((toast, index) => {
          // depth 0 = newest (front, fully visible); larger = older (behind/up).
          const depth = total - 1 - index;
          return (
            <motion.div
              key={toast.id}
              layout
              initial={{ opacity: 0, y: 24, scale: 0.95 }}
              animate={{
                opacity: 1,
                y: -depth * STACK_OFFSET_PX,
                scale: 1 - depth * STACK_SCALE_STEP,
              }}
              exit={{ opacity: 0, x: 100, scale: 0.9 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              style={{ zIndex: index }}
              className="pointer-events-auto absolute bottom-0 right-0 w-full origin-bottom"
            >
              <Toast
                id={toast.id}
                type={toast.type}
                title={toast.title}
                description={toast.description}
                onClose={removeToast}
              />
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};

export default Toaster;
