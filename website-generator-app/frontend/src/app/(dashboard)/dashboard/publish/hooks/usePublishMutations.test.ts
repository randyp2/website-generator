// @vitest-environment jsdom

import { act, cleanup, renderHook } from "@testing-library/react";
import type { Dispatch, SetStateAction } from "react";
import { afterEach, describe, expect, it } from "vitest";

import type { Portfolio } from "@/types/portfolio";

import { usePublishMutations } from "./usePublishMutations";

const portfolioId = "00000000-0000-4000-a000-000000000001";

const draftPortfolio: Portfolio = {
    id: portfolioId,
    title: "Generated Portfolio",
    status: "draft",
    template_id: "custom",
    screenshot_url: null,
    updated_at: "2026-07-21T00:00:00Z",
    created_at: "2026-07-20T00:00:00Z",
};

describe("usePublishMutations", () => {
    afterEach(cleanup);

    it("keeps the generated preview in the optimistic published portfolio", () => {
        let portfolios = [draftPortfolio];
        const setPortfolios: Dispatch<SetStateAction<Portfolio[]>> = (update) => {
            portfolios =
                typeof update === "function" ? update(portfolios) : update;
        };
        const { result } = renderHook(() =>
            usePublishMutations({ setPortfolios }),
        );

        act(() => {
            result.current.applyPublished({
                portfolioId,
                slug: "generated-portfolio",
                description: "Published description",
                screenshotUrl: "https://cdn.example/generated-preview.png",
            });
        });

        expect(portfolios).toHaveLength(1);
        expect(portfolios[0]).toMatchObject({
            status: "publish",
            slug: "generated-portfolio",
            description: "Published description",
            screenshot_url: "https://cdn.example/generated-preview.png",
        });
    });
});
