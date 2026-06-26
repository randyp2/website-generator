"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";

import {
  deriveOverviewFromSummary,
  getTierBarColor,
  getTierBgColor,
  mapSummaryClaimsToSkillVerifications,
  getTierColor,
  getStatusBgColor,
  getStatusColor,
} from "@/app/(dashboard)/dashboard/components/verification/verification.utils";
import VerificationScoreRing from "@/app/(dashboard)/dashboard/components/verification/VerificationScoreRing";
import type { SkillVerification } from "@/app/(dashboard)/dashboard/components/verification/verification.types";
import type { PublicVerificationSummaryDTO } from "@/types/public-verification";
import type { VerificationSummaryDTO } from "@/types/verification-summary";

interface ExplorePortfolioPlaceholderCardProps {
  profileId: string | null;
  username: string | null;
}

const MAX_TOP_SKILLS = 5;
const HOVER_CARD_WIDTH = 260;
const HOVER_CARD_HEIGHT = 180;
const HOVER_CURSOR_OFFSET = 18;
const HOVER_VIEWPORT_PADDING = 12;

const formatStatusLabel = (status: string): string =>
  status
    .replaceAll("_", " ")
    .split(" ")
    .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
    .join(" ");

const useExploreVerificationSummary = (
  profileId: string | null,
  username: string | null,
) => {
  const [summary, setSummary] = useState<VerificationSummaryDTO | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSummary = useCallback(async () => {
    if (!profileId && !username) {
      setSummary(null);
      setError(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = profileId
        ? await fetch(
            `/api/public/profile/by-id/${encodeURIComponent(profileId)}/verification/summary`,
            { cache: "no-store" },
          )
        : null;
      const fallbackResponse =
        response?.status === 404 && username
          ? await fetch(
              `/api/public/profile/${encodeURIComponent(username)}/verification/summary`,
              { cache: "no-store" },
            )
          : null;
      const summaryResponse = fallbackResponse ?? response;

      if (!summaryResponse?.ok) {
        throw new Error("Failed to fetch verification summary");
      }

      const data = (await summaryResponse.json()) as PublicVerificationSummaryDTO;
      setSummary(data);
    } catch (requestError) {
      console.error("Error fetching explore verification summary:", requestError);
      setSummary(null);
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Failed to fetch verification summary",
      );
    } finally {
      setIsLoading(false);
    }
  }, [profileId, username]);

  useEffect(() => {
    void fetchSummary();
  }, [fetchSummary]);

  return { summary, isLoading, error, refetch: fetchSummary };
};

export const ExplorePortfolioPlaceholderCard = ({
  profileId,
  username,
}: ExplorePortfolioPlaceholderCardProps) => {
  const { summary, isLoading, error, refetch } =
    useExploreVerificationSummary(profileId, username);
  const [hoveredSkill, setHoveredSkill] = useState<SkillVerification | null>(null);
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });
  const canUseDom = typeof window !== "undefined" && typeof document !== "undefined";

  const overview = useMemo(() => {
    if (!summary) {
      return null;
    }

    return deriveOverviewFromSummary(summary);
  }, [summary]);

  const topSkills = useMemo<SkillVerification[]>(() => {
    if (!summary) {
      return [];
    }

    return mapSummaryClaimsToSkillVerifications(
      summary.claims,
      summary.suggestedActions,
      summary.generatedAt,
    )
      .sort((left, right) => {
        if (right.score !== left.score) {
          return right.score - left.score;
        }

        if (right.evidenceLinksUsed !== left.evidenceLinksUsed) {
          return right.evidenceLinksUsed - left.evidenceLinksUsed;
        }

        return left.name.localeCompare(right.name);
      })
      .slice(0, MAX_TOP_SKILLS);
  }, [summary]);

  const hoverCardPosition = useMemo(() => {
    if (!canUseDom) {
      return null;
    }

    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    let left = cursorPosition.x + HOVER_CURSOR_OFFSET;
    let top = cursorPosition.y + HOVER_CURSOR_OFFSET;

    if (left + HOVER_CARD_WIDTH + HOVER_VIEWPORT_PADDING > viewportWidth) {
      left = cursorPosition.x - HOVER_CARD_WIDTH - HOVER_CURSOR_OFFSET;
    }
    if (top + HOVER_CARD_HEIGHT + HOVER_VIEWPORT_PADDING > viewportHeight) {
      top = viewportHeight - HOVER_CARD_HEIGHT - HOVER_VIEWPORT_PADDING;
    }
    if (left < HOVER_VIEWPORT_PADDING) {
      left = HOVER_VIEWPORT_PADDING;
    }
    if (top < HOVER_VIEWPORT_PADDING) {
      top = HOVER_VIEWPORT_PADDING;
    }

    return { left, top };
  }, [canUseDom, cursorPosition]);

  return (
    <div className="self-start">
      <article className="relative overflow-hidden rounded-xl border border-border bg-card/80 shadow-sm">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/20 via-accent/10 to-transparent dark:from-primary/15 dark:via-transparent dark:to-accent/12" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(251,146,60,0.14),transparent_36%),radial-gradient(circle_at_bottom_right,rgba(245,158,11,0.10),transparent_30%)]" />
        <div className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-primary/20 blur-3xl dark:bg-primary/12" />

        <div className="relative z-10 p-6 sm:p-8">
          <p className="text-xs font-semibold tracking-[0.24em] text-primary uppercase">
            Verification Snapshot
          </p>
          <div className="mt-6 border-t border-border pt-6">
            {!profileId && !username ? (
              <p className="text-sm leading-7 text-muted-foreground">
                Verification summary is not available for this portfolio owner yet.
              </p>
            ) : isLoading ? (
              <p className="text-sm leading-7 text-muted-foreground">
                Loading verification summary...
              </p>
            ) : error ? (
              <div className="space-y-3">
                <p className="text-sm leading-7 text-muted-foreground">
                  Could not load verification summary.
                </p>
                <button
                  type="button"
                  onClick={refetch}
                  className="text-xs font-medium text-primary underline underline-offset-4"
                >
                  Retry
                </button>
              </div>
            ) : !summary || summary.totalSkills === 0 || !overview ? (
              <p className="text-sm leading-7 text-muted-foreground">
                This profile has not published verification signals yet.
              </p>
            ) : (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 md:items-center md:gap-8">
                <div className="flex justify-center md:justify-start">
                  <VerificationScoreRing
                    score={overview.overallScore}
                    tier={overview.tier}
                    className="mx-auto md:mx-0"
                  />
                </div>

                <section className="space-y-2">
                  <h3 className="text-sm font-semibold tracking-tight text-foreground">
                    Top Skills
                  </h3>
                  {topSkills.length === 0 ? (
                    <p className="text-sm leading-7 text-muted-foreground">
                      No scored skills available yet.
                    </p>
                  ) : (
                    <ul className="space-y-1.5">
                      {topSkills.map((skill) => (
                        <li
                          key={skill.id}
                          className="flex items-start gap-3 rounded-md px-2 py-1 transition-colors hover:bg-background/60"
                          onMouseEnter={(event) => {
                            setHoveredSkill(skill);
                            setCursorPosition({
                              x: event.clientX,
                              y: event.clientY,
                            });
                          }}
                          onMouseMove={(event) => {
                            setCursorPosition({
                              x: event.clientX,
                              y: event.clientY,
                            });
                          }}
                          onMouseLeave={() => {
                            setHoveredSkill(null);
                          }}
                        >
                          <span
                            className={`mt-[0.42rem] size-2 shrink-0 ${getTierBarColor(skill.tier)}`}
                            aria-hidden
                          />
                          <span className="min-w-0 text-sm leading-6 font-medium text-foreground">
                            {skill.name}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </section>
              </div>
            )}
          </div>
        </div>
      </article>

      {canUseDom
        ? createPortal(
            <AnimatePresence>
              {hoveredSkill && hoverCardPosition ? (
                <motion.div
                  key={hoveredSkill.id}
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.12, ease: "easeOut" }}
                  style={{
                    left: hoverCardPosition.left,
                    top: hoverCardPosition.top,
                  }}
                  className="pointer-events-none fixed z-[80] w-[260px] rounded-xl border border-border bg-card/95 p-3 shadow-xl backdrop-blur-sm"
                >
                  <div className="space-y-2">
                    <p className="text-sm font-semibold text-foreground">
                      {hoveredSkill.name}
                    </p>
                    <div className="flex items-center gap-2">
                      <span
                        className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${getTierBgColor(hoveredSkill.tier)} ${getTierColor(hoveredSkill.tier)}`}
                      >
                        {hoveredSkill.tier}
                      </span>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${getStatusBgColor(hoveredSkill.status)} ${getStatusColor(hoveredSkill.status)}`}
                      >
                        {formatStatusLabel(hoveredSkill.status)}
                      </span>
                    </div>
                    <dl className="space-y-1 text-xs text-muted-foreground">
                      <div className="flex items-center justify-between gap-3">
                        <dt>Claim score</dt>
                        <dd className="font-medium text-foreground">
                          {hoveredSkill.score}/100
                        </dd>
                      </div>
                      <div className="flex items-center justify-between gap-3">
                        <dt>Baseline</dt>
                        <dd className="font-medium text-foreground">
                          {hoveredSkill.baselineScore}/100
                        </dd>
                      </div>
                      <div className="flex items-center justify-between gap-3">
                        <dt>Evidence boost</dt>
                        <dd className="font-medium text-foreground">
                          {hoveredSkill.evidenceContribution >= 0 ? "+" : ""}
                          {hoveredSkill.evidenceContribution}
                        </dd>
                      </div>
                    </dl>
                  </div>
                </motion.div>
              ) : null}
            </AnimatePresence>,
            document.body,
          )
        : null}
    </div>
  );
};
