"use client";

import { useMemo, useState } from "react";
import { ExploreEmptyState } from "./ExploreEmptyState";
import { ExploreGrid } from "./ExploreGrid";
import { ExploreToolbar } from "./ExploreToolbar";
import {
  GigPlatform,
  GigRole,
  MOCK_PORTFOLIOS,
  PLATFORM_FILTERS,
  ROLE_FILTERS,
} from "../data/mockPortfolios";

export function ExplorePageClient() {
  const [query, setQuery] = useState("");
  const [selectedRoles, setSelectedRoles] = useState<GigRole[]>([]);
  const [selectedPlatforms, setSelectedPlatforms] = useState<GigPlatform[]>([]);

  const filteredPortfolios = useMemo(() => {
    const normalized = query.trim().toLowerCase();

    const filtered = MOCK_PORTFOLIOS.filter((portfolio) => {
      const matchesQuery =
        normalized.length === 0 ||
        portfolio.title.toLowerCase().includes(normalized) ||
        portfolio.description.toLowerCase().includes(normalized) ||
        portfolio.uploaderName.toLowerCase().includes(normalized) ||
        portfolio.tags.some((tag) => tag.toLowerCase().includes(normalized));

      const matchesRole =
        selectedRoles.length === 0 ||
        selectedRoles.includes(portfolio.uploaderRole);

      const matchesPlatform =
        selectedPlatforms.length === 0 ||
        selectedPlatforms.includes(portfolio.platform);

      return matchesQuery && matchesRole && matchesPlatform;
    });
    return filtered;
  }, [query, selectedPlatforms, selectedRoles]);

  const toggleRole = (role: GigRole) => {
    setSelectedRoles((current) =>
      current.includes(role)
        ? current.filter((item) => item !== role)
        : [...current, role],
    );
  };

  const togglePlatform = (platform: GigPlatform) => {
    setSelectedPlatforms((current) =>
      current.includes(platform)
        ? current.filter((item) => item !== platform)
        : [...current, platform],
    );
  };

  const resetFilters = () => {
    setQuery("");
    setSelectedRoles([]);
    setSelectedPlatforms([]);
  };

  return (
    <main className="min-h-screen bg-[radial-gradient(120%_120%_at_50%_0%,#0b1628_0%,#04070f_45%,#010205_100%)] px-4 pb-16 pt-20 md:px-8 md:pt-24">
      <ExploreToolbar
        query={query}
        onQueryChange={setQuery}
        selectedRoles={selectedRoles}
        selectedPlatforms={selectedPlatforms}
        roleFilters={ROLE_FILTERS}
        platformFilters={PLATFORM_FILTERS}
        onToggleRole={toggleRole}
        onTogglePlatform={togglePlatform}
        onReset={resetFilters}
      />

      {filteredPortfolios.length === 0 ? (
        <ExploreEmptyState onReset={resetFilters} />
      ) : (
        <ExploreGrid items={filteredPortfolios} />
      )}
    </main>
  );
}
