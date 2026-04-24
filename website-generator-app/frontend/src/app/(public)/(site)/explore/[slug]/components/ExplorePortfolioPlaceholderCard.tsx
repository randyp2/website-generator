"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import {
  deriveOverviewFromSummary,
  getTierBarColor,
  getTierBgColor,
  getTierColor,
  getTierRingColor,
  mapSummaryClaimsToSkillVerifications,
} from "@/app/(dashboard)/dashboard/components/verification/verification.utils";
import type { VerificationTier } from "@/app/(dashboard)/dashboard/components/verification/verification.types";
import type { PublicVerificationSummaryDTO } from "@/types/public-verification";
import type { VerificationSummaryDTO } from "@/types/verification-summary";

interface ExplorePortfolioPlaceholderCardProps {
  username: string | null;
}

const MAX_TOP_SKILLS = 5;
const RING_RADIUS = 52;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

interface VerificationScoreRingProps {
  score: number;
  tier: VerificationTier;
}

const VerificationScoreRing = ({
  score,
  tier,
}: VerificationScoreRingProps) => {
  const clampedScore = Math.max(0, Math.min(100, score));
  const offset =
    RING_CIRCUMFERENCE - (clampedScore / 100) * RING_CIRCUMFERENCE;

  return (
    <div className="flex items-center justify-center">
      <svg
        aria-label={`Overall verification score ${clampedScore}`}
        viewBox="0 0 120 120"
        className="h-32 w-32 sm:h-36 sm:w-36"
      >
        <circle
          cx="60"
          cy="60"
          r={RING_RADIUS}
          fill="none"
          stroke="currentColor"
          className="text-muted/60"
          strokeWidth="8"
        />
        <circle
          cx="60"
          cy="60"
          r={RING_RADIUS}
          fill="none"
          stroke="currentColor"
          className={getTierRingColor(tier)}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={RING_CIRCUMFERENCE}
          strokeDashoffset={offset}
          transform="rotate(-90 60 60)"
        />
        <text
          x="60"
          y="61"
          textAnchor="middle"
          dominantBaseline="central"
          className="fill-foreground text-[2rem] font-semibold tracking-tight"
          style={{ fontSize: "32px", fontWeight: 600 }}
        >
          {clampedScore}
        </text>
      </svg>
    </div>
  );
};

const useExploreVerificationSummary = (username: string | null) => {
  const [summary, setSummary] = useState<VerificationSummaryDTO | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSummary = useCallback(async () => {
    if (!username) {
      setSummary(null);
      setError(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/public/profile/${encodeURIComponent(username)}/verification/summary`,
        { cache: "no-store" },
      );

      if (!response.ok) {
        throw new Error("Failed to fetch verification summary");
      }

      const data = (await response.json()) as PublicVerificationSummaryDTO;
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
  }, [username]);

  useEffect(() => {
    void fetchSummary();
  }, [fetchSummary]);

  return { summary, isLoading, error, refetch: fetchSummary };
};

export const ExplorePortfolioPlaceholderCard = ({
  username,
}: ExplorePortfolioPlaceholderCardProps) => {
  const { summary, isLoading, error, refetch } =
    useExploreVerificationSummary(username);

  const overview = useMemo(() => {
    if (!summary) {
      return null;
    }

    return deriveOverviewFromSummary(summary);
  }, [summary]);

  const topSkills = useMemo(() => {
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
            {!username ? (
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
              <div className="space-y-5">
                <div className="space-y-2">
                  <VerificationScoreRing
                    score={overview.overallScore}
                    tier={overview.tier}
                  />
                  <div className="flex justify-center">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${getTierBgColor(overview.tier)} ${getTierColor(overview.tier)}`}
                    >
                      {overview.tier}
                    </span>
                  </div>
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
                    <ul className="space-y-2">
                      {topSkills.map((skill) => (
                        <li key={skill.id} className="flex items-start gap-3">
                          <span
                            className={`mt-[0.42rem] size-2 shrink-0 ${getTierBarColor(skill.tier)}`}
                            aria-hidden
                          />
                          <span className="min-w-0 text-sm leading-6 text-foreground">
                            <span
                              className={`font-medium ${getTierColor(skill.tier)}`}
                            >
                              {skill.name}
                            </span>
                            <span className="text-muted-foreground">
                              {" "}
                              · {skill.score}/100 · {skill.tier}
                            </span>
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
    </div>
  );
};
