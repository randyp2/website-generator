"use client";

import { motion } from "framer-motion";

import { cn } from "@/lib/utils";

interface TermsAgreementCheckboxProps {
    checked: boolean;
    onCheckedChange: (checked: boolean) => void;
    className?: string;
}

// Checkmark drawn in a 16x16 viewBox. The reveal (clip-path) and the fill both
// grow from the bottom edge upward, so the mark reads as being drawn bottom to
// top rather than swept left to right.
const CHECK_PATH = "M3.5 8.5 L6.75 12 L12.5 4.5";
const BRAND = "#cc7d23";
const REVEAL = { duration: 0.3, ease: "easeOut" } as const;

/**
 * Consent checkbox for the auth flow. Clicking the box toggles it; the label
 * text also toggles, while the Terms/Privacy links open in a new tab so the
 * user does not lose their place in the sign-up form.
 */
export const TermsAgreementCheckbox = ({
    checked,
    onCheckedChange,
    className,
}: TermsAgreementCheckboxProps) => {
    return (
        <div className={cn("flex items-start gap-2.5", className)}>
            <button
                type="button"
                role="checkbox"
                aria-checked={checked}
                aria-label="I agree to the Terms of Use and Privacy Policy"
                onClick={() => onCheckedChange(!checked)}
                className={cn(
                    "relative mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center overflow-hidden rounded-[6px] border transition-colors hover:cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-ring/40",
                    checked
                        ? "border-[#cc7d23]"
                        : "border-input bg-background",
                )}
            >
                {/* Brand fill rises from the bottom edge upward. */}
                <motion.span
                    aria-hidden="true"
                    initial={false}
                    animate={{ scaleY: checked ? 1 : 0 }}
                    transition={REVEAL}
                    style={{ backgroundColor: BRAND }}
                    className="absolute inset-0 origin-bottom"
                />
                {/* Checkmark revealed bottom to top, in sync with the fill. */}
                <motion.svg
                    viewBox="0 0 16 16"
                    fill="none"
                    aria-hidden="true"
                    className="relative h-3.5 w-3.5"
                    initial={false}
                    animate={{
                        clipPath: checked
                            ? "inset(0% 0% 0% 0%)"
                            : "inset(100% 0% 0% 0%)",
                    }}
                    transition={REVEAL}
                >
                    <path
                        d={CHECK_PATH}
                        stroke="white"
                        strokeWidth={2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                </motion.svg>
            </button>

            <span
                onClick={() => onCheckedChange(!checked)}
                className="select-none text-xs leading-relaxed text-muted-foreground hover:cursor-pointer"
            >
                I agree to the{" "}
                <a
                    href="/terms"
                    target="_blank"
                    rel="noreferrer"
                    onClick={(event) => event.stopPropagation()}
                    className="font-medium text-foreground underline underline-offset-2 hover:no-underline"
                >
                    Terms of Use
                </a>{" "}
                and{" "}
                <a
                    href="/privacy"
                    target="_blank"
                    rel="noreferrer"
                    onClick={(event) => event.stopPropagation()}
                    className="font-medium text-foreground underline underline-offset-2 hover:no-underline"
                >
                    Privacy Policy
                </a>
                .
            </span>
        </div>
    );
};
