"use client";

import { useEffect, useRef } from "react";
import { FiRefreshCw } from "react-icons/fi";
import { useRouter } from "next/navigation";
import { usePortfolioStore } from "@/stores/usePortfolioStore";

const CreatePortfolioPage: React.FC = () => {
  const router = useRouter();
  const hasRedirectedRef = useRef(false);

  useEffect(() => {
    if (hasRedirectedRef.current) return;
    hasRedirectedRef.current = true;
    usePortfolioStore.getState().reset();
    router.replace("/dashboard/create/style");
  }, [router]);

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-8 md:px-6 lg:px-8">
      <div className="w-full max-w-xl rounded-lg border border-border bg-card p-6 text-center shadow-sm">
        <div className="mx-auto mb-5 flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <FiRefreshCw className="h-5 w-5 animate-spin" aria-hidden="true" />
        </div>

        <p className="text-sm font-semibold text-muted-foreground">Step 1 of 3</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-foreground">
          Opening style chat
        </h1>
        <p className="mt-3 text-sm leading-6 text-muted-foreground" aria-live="polite">
          Tell the assistant what you want, and your draft will be created when the conversation starts.
        </p>
      </div>
    </main>
  );
};

export default CreatePortfolioPage;
