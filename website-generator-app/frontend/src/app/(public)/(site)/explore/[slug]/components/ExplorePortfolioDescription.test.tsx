// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import type { PublicPortfolioDTO } from "@/types/public-portfolio";

import { ExplorePortfolioDescription } from "./ExplorePortfolioDescription";

const portfolio = (description: string | null): PublicPortfolioDTO => ({
  portfolioId: "portfolio-1",
  userId: "user-1",
  ownerUsername: "creator",
  title: "Creator Portfolio",
  slug: "creator-portfolio",
  templateId: "custom",
  description,
  sections: [],
  globalTheme: null,
  ownerName: "Creator",
  ownerAvatarUrl: null,
  publishedAt: "2026-07-22T00:00:00Z",
  screenshotUrl: null,
  sourceType: "GENERATED",
  externalUrl: null,
});

describe("ExplorePortfolioDescription", () => {
  afterEach(cleanup);

  it("does not render a public description section when no description exists", () => {
    const { container } = render(
      <ExplorePortfolioDescription portfolio={portfolio(null)} />,
    );

    expect(container).toBeEmptyDOMElement();
    expect(
      screen.queryByText(/Replace this placeholder copy/i),
    ).not.toBeInTheDocument();
  });

  it("renders the portfolio description when one exists", () => {
    render(
      <ExplorePortfolioDescription
        portfolio={portfolio("A real portfolio description.")}
      />,
    );

    expect(screen.getByText("A real portfolio description.")).toBeVisible();
  });
});
