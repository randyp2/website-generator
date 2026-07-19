import { cn } from "@/lib/utils";

/**
 * Shared chrome for the style chat picker panels (color, typography) so they
 * stay visually coherent. Panels follow the app's light/dark theme.
 */

export const PICKER_PANEL_CLASSES =
    "w-full overflow-hidden rounded-xl bg-white p-4 text-neutral-800 shadow-[0_30px_80px_rgba(0,0,0,0.28)] md:p-6 dark:bg-neutral-800 dark:text-neutral-200";

export const PICKER_HEADING_CLASSES =
    "text-lg font-semibold text-neutral-900 dark:text-white";

export const PICKER_BODY_CLASSES = "text-sm text-neutral-600 dark:text-white/60";

export const PICKER_CONFIRM_CLASSES =
    "h-12 w-full cursor-pointer rounded-2xl bg-primary text-primary-foreground hover:bg-primary/90";

export const TOGGLE_SHELL_CLASSES =
    "inline-flex rounded-full border border-neutral-900/10 bg-neutral-900/5 p-1 dark:border-white/10 dark:bg-black/20";

export const toggleButtonClasses = (isActive: boolean) =>
    cn(
        "cursor-pointer rounded-full transition",
        isActive
            ? "bg-white text-neutral-900 shadow-sm dark:text-black"
            : "text-neutral-500 hover:text-neutral-900 dark:text-white/70 dark:hover:text-white",
    );
