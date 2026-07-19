// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { PortfolioCardScreenshot } from "./PortfolioCardScreenshot";

describe("PortfolioCardScreenshot", () => {
  afterEach(cleanup);

  it("shows retry guidance while a screenshot is unavailable", () => {
    render(
      <PortfolioCardScreenshot
        screenshotUrl={null}
        portfolioTitle="My Portfolio"
      />,
    );

    expect(
      screen.getByText("We're retrieving your screenshot."),
    ).toBeVisible();
    expect(
      screen.getByText("Please refresh or try again in a few seconds."),
    ).toBeVisible();
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
  });

  it("renders the captured screenshot when its URL is available", () => {
    render(
      <PortfolioCardScreenshot
        screenshotUrl="https://cdn.example.com/portfolio.png"
        portfolioTitle="My Portfolio"
      />,
    );

    expect(screen.getByRole("img", { name: "My Portfolio preview" })).toHaveAttribute(
      "src",
      "https://cdn.example.com/portfolio.png",
    );
    expect(
      screen.queryByText("We're retrieving your screenshot."),
    ).not.toBeInTheDocument();
  });
});
