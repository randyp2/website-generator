"use client";

import React from "react";
import { motion } from "framer-motion";
import { X, CheckCircle2, AlertTriangle, XCircle, Info, Loader2 } from "lucide-react";
import { cva, type VariantProps } from "class-variance-authority";

const toastVariants = cva(
  "relative flex items-start gap-3 w-full max-w-sm p-4 shadow-2xl border border-white/10 bg-black text-white",
  {
    variants: {
      variant: {
        success: "",
        warning: "",
        error: "",
        info: "",
        loading: "",
      },
    },
    defaultVariants: {
      variant: "info",
    },
  }
);

const iconVariants = cva("w-5 h-5 flex-shrink-0 mt-0.5", {
  variants: {
    variant: {
      success: "text-green-400",
      warning: "text-yellow-400",
      error: "text-red-400",
      info: "text-violet-400",
      loading: "text-white/60",
    },
  },
  defaultVariants: {
    variant: "info",
  },
});

export type ToastType = "success" | "warning" | "error" | "info" | "loading";

export interface ToastProps extends VariantProps<typeof toastVariants> {
  id: string;
  type: ToastType;
  title: string;
  description?: string;
  onClose?: (id: string) => void;
}

const iconMap = {
  success: CheckCircle2,
  warning: AlertTriangle,
  error: XCircle,
  info: Info,
  loading: Loader2,
};

export const Toast: React.FC<ToastProps> = ({
  id,
  type,
  title,
  description,
  onClose,
}) => {
  const Icon = iconMap[type];
  const variant = type === "error" ? "error" : type;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 100, scale: 0.9 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 100, scale: 0.9 }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
      className={toastVariants({ variant })}
    >
      {/* Icon */}
      <Icon
        className={`${iconVariants({ variant })} ${type === "loading" ? "animate-spin" : ""}`}
      />

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold">{title}</p>
        {description && (
          <p className="text-xs mt-1 opacity-70">{description}</p>
        )}
      </div>

      {/* Close button */}
      {onClose && (
        <button
          onClick={() => onClose(id)}
          className="flex-shrink-0 p-1 hover:bg-white/10 transition-colors"
          aria-label="Close notification"
        >
          <X className="w-4 h-4 opacity-60 hover:opacity-100" />
        </button>
      )}
    </motion.div>
  );
};

export default Toast;
