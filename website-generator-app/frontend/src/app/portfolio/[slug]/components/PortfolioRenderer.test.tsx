// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";

import { act, cleanup, render, screen } from "@testing-library/react";
import type { ComponentType } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { PublicPortfolioDTO } from "@/types/public-portfolio";

const { scriptPropsMock, transpileSectionMock } = vi.hoisted(() => ({
    scriptPropsMock: vi.fn(),
    transpileSectionMock: vi.fn(),
}));

vi.mock("next/script", () => ({
    default: (props: Record<string, unknown>) => {
        scriptPropsMock(props);
        return null;
    },
}));

vi.mock("@/utils/transpileSection", async () => {
    const React = await import("react");

    return {
        transpileSection: (...args: unknown[]) => {
            transpileSectionMock(...args);

            const GeneratedSection: ComponentType = () =>
                React.createElement(
                    "section",
                    { "data-testid": "generated-section" },
                    "Generated portfolio section",
                );

            return GeneratedSection;
        },
    };
});

import PortfolioRenderer from "./PortfolioRenderer";

type TailwindScriptProps = {
    id: string;
    onError: () => void;
    onLoad: () => void;
    onReady: () => void;
    src: string;
    strategy: string;
};

const portfolio: PublicPortfolioDTO = {
    portfolioId: "portfolio-id",
    userId: "user-id",
    ownerUsername: "test-user",
    title: "Test portfolio",
    slug: "test-portfolio",
    templateId: null,
    description: null,
    sections: [
        {
            sectionKey: "hero",
            title: "Hero",
            orderIndex: 1,
            contentJson: { heading: "Hello" },
            reactSource: "export default function Hero() { return <div />; }",
        },
    ],
    globalTheme: {
        background: "bg-white",
        textPrimary: "text-slate-900",
    },
    ownerName: "Test User",
    ownerAvatarUrl: null,
    publishedAt: "2026-07-21T00:00:00Z",
    screenshotUrl: null,
    sourceType: null,
    externalUrl: null,
};

const getTailwindScriptProps = (): TailwindScriptProps => {
    const props = scriptPropsMock.mock.lastCall?.[0] as
        | TailwindScriptProps
        | undefined;

    if (!props) throw new Error("Tailwind script was not rendered");
    return props;
};

describe("PortfolioRenderer", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        cleanup();
        vi.useRealTimers();
    });

    it("waits for Tailwind before executing generated sections", () => {
        render(<PortfolioRenderer portfolio={portfolio} />);

        expect(screen.getByRole("status")).toHaveTextContent(
            "Loading portfolio",
        );
        expect(screen.queryByTestId("generated-section")).not.toBeInTheDocument();
        expect(transpileSectionMock).not.toHaveBeenCalled();

        const scriptProps = getTailwindScriptProps();
        expect(scriptProps).toMatchObject({
            id: "portrn-tailwind-runtime",
            src: "https://cdn.tailwindcss.com",
            strategy: "afterInteractive",
        });

        act(() => scriptProps.onLoad());

        expect(screen.getByTestId("generated-section")).toBeInTheDocument();
        expect(transpileSectionMock).toHaveBeenCalledOnce();
    });

    it("renders when an already-loaded Tailwind script reports ready", () => {
        render(<PortfolioRenderer portfolio={portfolio} />);

        act(() => getTailwindScriptProps().onReady());

        expect(screen.getByTestId("generated-section")).toBeInTheDocument();
    });

    it("shows a recoverable error when Tailwind cannot load", () => {
        render(<PortfolioRenderer portfolio={portfolio} />);

        act(() => getTailwindScriptProps().onError());

        expect(screen.getByRole("alert")).toHaveTextContent(
            "Portfolio styles could not be loaded",
        );
        expect(
            screen.getByRole("button", { name: "Reload portfolio" }),
        ).toBeInTheDocument();
        expect(screen.queryByTestId("generated-section")).not.toBeInTheDocument();
    });

    it("stops waiting when the Tailwind load times out", () => {
        vi.useFakeTimers();
        render(<PortfolioRenderer portfolio={portfolio} />);

        act(() => vi.advanceTimersByTime(20_000));

        expect(screen.getByRole("alert")).toHaveTextContent(
            "Portfolio styles could not be loaded",
        );
    });
});
