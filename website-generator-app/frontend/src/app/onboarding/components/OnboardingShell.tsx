import { type ReactNode } from "react";

import { cn } from "@/lib/utils";

type OnboardingShellProps = {
    children: ReactNode;
    containerClassName?: string;
};

const OnboardingShell = ({
    children,
    containerClassName,
}: OnboardingShellProps) => (
    <div className="relative min-h-screen overflow-hidden bg-background text-foreground">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,hsl(var(--primary)/0.2),transparent_55%),radial-gradient(circle_at_bottom_left,hsl(var(--primary)/0.14),transparent_60%)]" />
        <div className={cn("relative mx-auto min-h-screen w-full", containerClassName)}>
            {children}
        </div>
    </div>
);

export default OnboardingShell;
