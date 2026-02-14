"use client";

import { GigPlatform, GigRole } from "../data/mockPortfolios";
import { Search, X } from "lucide-react";

interface ExploreToolbarProps {
  query: string;
  onQueryChange: (next: string) => void;
  selectedRoles: GigRole[];
  selectedPlatforms: GigPlatform[];
  roleFilters: GigRole[];
  platformFilters: GigPlatform[];
  onToggleRole: (role: GigRole) => void;
  onTogglePlatform: (platform: GigPlatform) => void;
  onReset: () => void;
}

export function ExploreToolbar({
  query,
  onQueryChange,
  selectedRoles,
  selectedPlatforms,
  roleFilters,
  platformFilters,
  onToggleRole,
  onTogglePlatform,
  onReset,
}: ExploreToolbarProps) {
  const hasFilters = selectedRoles.length > 0 || selectedPlatforms.length > 0;

  return (
    <section className="mb-6">
      <label htmlFor="explore-search" className="relative block w-full">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          id="explore-search"
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder="Search title, uploader, tags..."
          className="w-full rounded-lg border border-white/15 bg-black/30 py-2.5 pl-10 pr-11 text-sm text-white placeholder:text-slate-400 focus:border-cyan-300/70 focus:outline-none focus:ring-2 focus:ring-cyan-300/30"
        />
        {query ? (
          <button
            type="button"
            aria-label="Clear search query"
            onClick={() => onQueryChange("")}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-300 hover:bg-white/10 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        ) : null}
      </label>

      <div className="mt-4 space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <p className="mr-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
            Roles
          </p>
          {roleFilters.map((role) => {
            const selected = selectedRoles.includes(role);
            return (
              <button
                key={role}
                type="button"
                onClick={() => onToggleRole(role)}
                className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                  selected
                    ? "border-cyan-300/50 bg-cyan-300/15 text-cyan-100"
                    : "border-white/15 bg-white/5 text-slate-300 hover:border-white/30 hover:text-white"
                }`}
              >
                {role}
              </button>
            );
          })}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <p className="mr-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
            Platforms
          </p>
          {platformFilters.map((platform) => {
            const selected = selectedPlatforms.includes(platform);
            return (
              <button
                key={platform}
                type="button"
                onClick={() => onTogglePlatform(platform)}
                className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                  selected
                    ? "border-emerald-300/50 bg-emerald-300/15 text-emerald-100"
                    : "border-white/15 bg-white/5 text-slate-300 hover:border-white/30 hover:text-white"
                }`}
              >
                {platform}
              </button>
            );
          })}
        </div>
      </div>

      {(query || hasFilters) && (
        <div className="mt-2">
          <button
            type="button"
            onClick={onReset}
            className="rounded-md border border-white/15 bg-white/5 px-2.5 py-1 text-xs text-slate-200 hover:bg-white/10"
          >
            Clear search and filters
          </button>
        </div>
      )}
    </section>
  );
}
