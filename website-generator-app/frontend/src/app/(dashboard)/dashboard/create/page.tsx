"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { FiArrowRight, FiRefreshCw } from "react-icons/fi";
import { useRouter } from "next/navigation";
import { usePortfolioStore } from "@/stores/usePortfolioStore";

const DEFAULT_TEMPLATE_ID = "blank";

const CreatePortfolioPage: React.FC = () => {
  const router = useRouter();
  const { setTemplateId, setPortfolioId } = usePortfolioStore();
  const hasStartedDraftRef = useRef(false);
  const [error, setError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(true);

  const startDraft = useCallback(async () => {
    if (hasStartedDraftRef.current) return;
    hasStartedDraftRef.current = true;

    setIsCreating(true);
    setError(null);
    usePortfolioStore.getState().reset();

    try {
      const res = await fetch("/api/portfolio/draft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ templateId: DEFAULT_TEMPLATE_ID }),
      });

      if (!res.ok) {
        const errorBody = await res.json().catch(() => null);
        throw new Error(errorBody?.error ?? "Failed to create draft");
      }

      const data = await res.json();
      const portfolioId = data?.portfolio?.id ?? null;

      if (!portfolioId) {
        throw new Error("Draft was created without a portfolio id");
      }

      setTemplateId(DEFAULT_TEMPLATE_ID);
      setPortfolioId(portfolioId);

      router.replace(`/dashboard/create/style?portfolioId=${portfolioId}`);
    } catch (error) {
      console.error("Draft creation failed:", error);
      hasStartedDraftRef.current = false;
      setIsCreating(false);
      setError(
        error instanceof Error
          ? error.message
          : "Failed to create draft. Please try again.",
      );
    }
  }, [router, setPortfolioId, setTemplateId]);

  useEffect(() => {
    void startDraft();
  }, [startDraft]);

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-8 md:px-6">
      <div className="w-full max-w-xl rounded-lg border border-border bg-card p-6 text-center shadow-sm">
        <div className="mx-auto mb-5 flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
          {isCreating ? (
            <FiRefreshCw className="h-5 w-5 animate-spin" aria-hidden="true" />
          ) : (
            <FiArrowRight className="h-5 w-5" aria-hidden="true" />
          )}
        </div>

        <p className="text-sm font-semibold text-muted-foreground">Step 1 of 3</p>
        <h1 className="mt-2 text-3xl font-bold text-foreground md:text-4xl">
          Opening style chat
        </h1>
        <p className="mt-3 text-sm leading-6 text-muted-foreground" aria-live="polite">
          {error
            ? error
            : "Creating a new draft so you can shape the portfolio style with AI."}
        </p>

        {error && (
          <button
            type="button"
            onClick={() => void startDraft()}
            className="mt-6 inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
            <FiRefreshCw className="h-4 w-4" aria-hidden="true" />
          </button>
        )}
      </div>
    </main>
  );
};

export default CreatePortfolioPage;
