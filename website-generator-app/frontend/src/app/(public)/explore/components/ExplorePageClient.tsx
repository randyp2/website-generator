"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ExploreEmptyState } from "./ExploreEmptyState";
import { ExploreGrid } from "./ExploreGrid";

export interface PortfolioCard {
  title: string;
  slug: string;
  templateId: string | null;
  ownerName: string | null;
  ownerAvatarUrl: string | null;
  publishedAt: string;
}

interface PageResponse {
  content: PortfolioCard[];
  totalPages: number;
  last: boolean;
  number: number;
}

export function ExplorePageClient() {
  const [portfolios, setPortfolios] = useState<PortfolioCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(0);
  const [isLast, setIsLast] = useState(false);
  const observerRef = useRef<HTMLDivElement | null>(null);

  const fetchPage = useCallback(async (pageNum: number) => {
    const res = await fetch(`/api/public/portfolio?page=${pageNum}&size=12`);
    if (!res.ok) return null;
    return (await res.json()) as PageResponse;
  }, []);

  useEffect(() => {
    const load = async () => {
      const data = await fetchPage(0);
      if (data) {
        setPortfolios(data.content);
        setIsLast(data.last);
      }
      setLoading(false);
    };
    load();
  }, [fetchPage]);

  const loadMore = useCallback(async () => {
    if (loadingMore || isLast) return;
    setLoadingMore(true);
    const nextPage = page + 1;
    const data = await fetchPage(nextPage);
    if (data) {
      setPortfolios((prev) => [...prev, ...data.content]);
      setPage(nextPage);
      setIsLast(data.last);
    }
    setLoadingMore(false);
  }, [loadingMore, isLast, page, fetchPage]);

  useEffect(() => {
    const el = observerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) loadMore();
      },
      { threshold: 0.1 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [loadMore]);

  if (loading) {
    return (
      <main className="min-h-screen bg-[radial-gradient(120%_120%_at_50%_0%,#0b1628_0%,#04070f_45%,#010205_100%)] px-4 pb-16 pt-20 md:px-8 md:pt-24">
        <div className="flex items-center justify-center py-20">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-white/20 border-t-white" />
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(120%_120%_at_50%_0%,#0b1628_0%,#04070f_45%,#010205_100%)] px-4 pb-16 pt-20 md:px-8 md:pt-24">
      {portfolios.length === 0 ? (
        <ExploreEmptyState />
      ) : (
        <>
          <ExploreGrid items={portfolios} />
          <div ref={observerRef} className="h-10" />
          {loadingMore && (
            <div className="flex items-center justify-center py-8">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-white" />
            </div>
          )}
        </>
      )}
    </main>
  );
}
