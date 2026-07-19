"use client";

import { useEffect, useRef } from "react";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { usePortfolioStore } from "@/stores/usePortfolioStore";
import { useGenerationJobStore } from "@/stores/useGenerationJobStore";

/**
 * Entry point for the create flow.
 *
 * With a generation job still running, "Create" means "take me back to it":
 * redirect to the editor without touching the store, so an in-progress
 * portfolio is never orphaned. Only when no job is active does this start a
 * fresh portfolio by resetting the store and entering the style chat.
 */
const CreatePortfolioPage: React.FC = () => {
  const router = useRouter();
  const hasRedirectedRef = useRef(false);

  useEffect(() => {
    if (hasRedirectedRef.current) return;
    hasRedirectedRef.current = true;

    if (useGenerationJobStore.getState().activeJob) {
      router.replace("/dashboard/create/refine");
      return;
    }

    usePortfolioStore.getState().reset();
    router.replace("/dashboard/create/style");
  }, [router]);

  return (
    <main className="flex min-h-screen items-center justify-center">
      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground/60" aria-label="Loading" />
    </main>
  );
};

export default CreatePortfolioPage;
