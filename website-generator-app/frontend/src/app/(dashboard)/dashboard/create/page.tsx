"use client";

import { useEffect, useRef } from "react";
import { Loader2 } from "lucide-react";
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
    <main className="flex min-h-screen items-center justify-center">
      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground/60" aria-label="Loading" />
    </main>
  );
};

export default CreatePortfolioPage;
