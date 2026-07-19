"use client";

import { useEffect } from "react";
import { RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";

/**
 * Error boundary for the dashboard shell. Catches failures thrown while
 * resolving the dashboard profile (e.g. a transient backend/auth blip) and
 * offers a retry instead of bouncing between routes.
 */
const DashboardError = ({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) => {
    useEffect(() => {
        console.error("[dashboard] render error:", error);
    }, [error]);

    return (
        <div className="flex min-h-[70vh] flex-col items-center justify-center gap-5 px-6 text-center">
            <div className="space-y-1.5">
                <h1 className="text-lg font-semibold tracking-tight text-foreground">
                    Something went wrong
                </h1>
                <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
                    We couldn&apos;t load your dashboard. This is usually
                    temporary — please try again.
                </p>
            </div>
            <Button onClick={reset} className="gap-1.5">
                <RefreshCw className="h-4 w-4" />
                Try again
            </Button>
        </div>
    );
};

export default DashboardError;
