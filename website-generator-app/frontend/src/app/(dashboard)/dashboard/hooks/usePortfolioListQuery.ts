"use client";

import {
    useMutation,
    useQuery,
    useQueryClient,
    type QueryClient,
} from "@tanstack/react-query";
import { useCallback, type Dispatch, type SetStateAction } from "react";

import type { Portfolio } from "@/types/portfolio";

type PortfolioListPayload = {
    portfolios?: unknown;
};

type PortfolioListUpdate = Portfolio[] | ((current: Portfolio[]) => Portfolio[]);

export type PortfolioPatch = Partial<Portfolio> & Record<string, unknown>;

export const portfolioListQueryKey = (userId: string | null | undefined) =>
    ["portfolio-list", userId ?? "anonymous"] as const;

const isRecord = (value: unknown): value is Record<string, unknown> =>
    typeof value === "object" && value !== null;

const readApiError = async (
    response: Response,
    fallback: string,
): Promise<string> => {
    const payload = await response.json().catch(() => null);
    if (isRecord(payload)) {
        const message = payload.error ?? payload.message;
        if (typeof message === "string" && message.trim()) {
            return message;
        }
    }

    return fallback;
};

export const normalizePortfolio = (item: unknown): Portfolio | null => {
    if (!isRecord(item) || typeof item.id !== "string") {
        return null;
    }

    const title = typeof item.title === "string" ? item.title.trim() : "";
    const status = typeof item.status === "string" ? item.status.trim() : "";

    return {
        ...(item as unknown as Portfolio),
        id: item.id as Portfolio["id"],
        title: title || "Untitled Portfolio",
        status: status || "draft",
    };
};

export const fetchPortfolioList = async (): Promise<Portfolio[]> => {
    const response = await fetch("/api/portfolio/list", {
        method: "GET",
        credentials: "same-origin",
    });

    if (!response.ok) {
        throw new Error(
            await readApiError(response, "Failed to fetch portfolios."),
        );
    }

    const payload = (await response.json().catch(() => null)) as
        | PortfolioListPayload
        | null;
    const rawRows = Array.isArray(payload?.portfolios)
        ? payload.portfolios
        : [];

    return rawRows
        .map(normalizePortfolio)
        .filter((portfolio): portfolio is Portfolio => portfolio !== null);
};

export const requestPortfolioUpdate = async ({
    portfolioId,
    patch,
}: {
    portfolioId: string;
    patch: PortfolioPatch;
}): Promise<unknown> => {
    const response = await fetch(`/api/portfolio/${portfolioId}/update`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
    });

    if (!response.ok) {
        throw new Error(
            await readApiError(response, "Failed to update portfolio."),
        );
    }

    return response.json().catch(() => null);
};

export const requestPortfolioDelete = async (
    portfolioId: string,
): Promise<void> => {
    const response = await fetch(`/api/portfolio/${portfolioId}/delete`, {
        method: "DELETE",
    });

    if (!response.ok) {
        throw new Error(
            await readApiError(response, "Failed to delete portfolio."),
        );
    }
};

export const setPortfolioListQueryData = (
    queryClient: QueryClient,
    userId: string | null | undefined,
    update: PortfolioListUpdate,
) => {
    queryClient.setQueryData<Portfolio[]>(
        portfolioListQueryKey(userId),
        (current = []) =>
            typeof update === "function" ? update(current) : update,
    );
};

export const patchCachedPortfolio = (
    queryClient: QueryClient,
    userId: string | null | undefined,
    portfolioId: string,
    patch: PortfolioPatch,
) => {
    setPortfolioListQueryData(queryClient, userId, (current) =>
        current.map((portfolio) =>
            String(portfolio.id) === portfolioId
                ? {
                      ...portfolio,
                      ...patch,
                      updated_at:
                          typeof patch.updated_at === "string"
                              ? patch.updated_at
                              : new Date().toISOString(),
                  }
                : portfolio,
        ),
    );
};

export const removeCachedPortfolio = (
    queryClient: QueryClient,
    userId: string | null | undefined,
    portfolioId: string,
) => {
    setPortfolioListQueryData(queryClient, userId, (current) =>
        current.filter((portfolio) => String(portfolio.id) !== portfolioId),
    );
};

export const usePortfolioListQuery = (
    userId: string | null | undefined,
) =>
    useQuery({
        queryKey: portfolioListQueryKey(userId),
        queryFn: fetchPortfolioList,
        enabled: Boolean(userId),
    });

export const usePortfolioListCache = (
    userId: string | null | undefined,
) => {
    const queryClient = useQueryClient();

    const setPortfolios: Dispatch<SetStateAction<Portfolio[]>> = useCallback(
        (update) => {
            setPortfolioListQueryData(queryClient, userId, update);
        },
        [queryClient, userId],
    );

    const invalidatePortfolios = useCallback(
        () =>
            queryClient.invalidateQueries({
                queryKey: portfolioListQueryKey(userId),
            }),
        [queryClient, userId],
    );

    return {
        queryClient,
        setPortfolios,
        invalidatePortfolios,
    };
};

export const usePortfolioUpdateMutation = (
    userId: string | null | undefined,
) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: requestPortfolioUpdate,
        onMutate: async ({ portfolioId, patch }) => {
            await queryClient.cancelQueries({
                queryKey: portfolioListQueryKey(userId),
            });
            const previous = queryClient.getQueryData<Portfolio[]>(
                portfolioListQueryKey(userId),
            );
            patchCachedPortfolio(queryClient, userId, portfolioId, patch);
            return { previous };
        },
        onError: (_error, _variables, context) => {
            if (context?.previous) {
                setPortfolioListQueryData(queryClient, userId, context.previous);
            }
        },
        onSettled: () =>
            queryClient.invalidateQueries({
                queryKey: portfolioListQueryKey(userId),
            }),
    });
};

export const usePortfolioDeleteMutation = (
    userId: string | null | undefined,
) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: requestPortfolioDelete,
        onMutate: async (portfolioId) => {
            await queryClient.cancelQueries({
                queryKey: portfolioListQueryKey(userId),
            });
            const previous = queryClient.getQueryData<Portfolio[]>(
                portfolioListQueryKey(userId),
            );
            const target = previous?.find(
                (portfolio) => String(portfolio.id) === portfolioId,
            );
            removeCachedPortfolio(queryClient, userId, portfolioId);
            return { previous, target };
        },
        onError: (_error, _portfolioId, context) => {
            if (context?.previous) {
                setPortfolioListQueryData(queryClient, userId, context.previous);
            }
        },
        onSettled: () =>
            queryClient.invalidateQueries({
                queryKey: portfolioListQueryKey(userId),
            }),
    });
};
