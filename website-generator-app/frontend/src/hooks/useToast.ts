import { create } from "zustand";
import { ToastType } from "@/components/ui/toast";

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  description?: string;
  dismissKey?: string;
}

interface ToastStore {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, "id">) => string;
  removeToast: (id: string) => void;
  updateToast: (id: string, updates: Partial<Omit<Toast, "id">>) => void;
}

// Generate unique ID for toasts
const generateId = () => `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

// Track dismissed toasts in sessionStorage
const DISMISSED_TOASTS_KEY = "dismissed_toasts";

const getDismissedToasts = (): Set<string> => {
  if (typeof window === "undefined") return new Set();
  const stored = sessionStorage.getItem(DISMISSED_TOASTS_KEY);
  return stored ? new Set(JSON.parse(stored)) : new Set();
};

export const markToastDismissed = (key: string) => {
  if (typeof window === "undefined") return;
  const dismissed = getDismissedToasts();
  dismissed.add(key);
  sessionStorage.setItem(DISMISSED_TOASTS_KEY, JSON.stringify([...dismissed]));
};

export const isToastDismissed = (key: string): boolean => {
  return getDismissedToasts().has(key);
};

export const useToastStore = create<ToastStore>((set, get) => ({
  toasts: [],

  addToast: (toast) => {
    const id = generateId();
    const newToast: Toast = {
      ...toast,
      id,
    };

    set((state) => ({
      // Keep max 3 toasts, remove oldest if needed
      toasts: [...state.toasts.slice(-2), newToast],
    }));

    return id;
  },

  removeToast: (id) => {
    const state = get();
    const toast = state.toasts.find((t) => t.id === id);
    // If the toast has a dismissKey, mark it as dismissed
    if (toast?.dismissKey) {
      markToastDismissed(toast.dismissKey);
    }
    set((state) => ({
      toasts: state.toasts.filter((toast) => toast.id !== id),
    }));
  },

  updateToast: (id, updates) => {
    set((state) => ({
      toasts: state.toasts.map((toast) =>
        toast.id === id ? { ...toast, ...updates } : toast
      ),
    }));
  },
}));

// Convenience hook for components
export const useToast = () => {
  const { addToast, removeToast, updateToast } = useToastStore();
  return { addToast, removeToast, updateToast };
};
