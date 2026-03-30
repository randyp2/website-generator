import "server-only";
import type { PublicPortfolioDTO } from "@/types/public-portfolio";
import { getBackendUrlOrNull } from "../server-env";

const BACKEND_URL: string | null = getBackendUrlOrNull();

export const fetchPublicPortfolio = async (
    slug: string,
): Promise<PublicPortfolioDTO | null> => {
    try {
        const res = await fetch(
            `${BACKEND_URL?.replace(/\/+$/, "")}/api/v1/public/portfolio/${encodeURIComponent(slug)}`,
            { next: { revalidate: 60 } },
        );
        if (!res.ok) return null;
        return await res.json();
    } catch {
        return null;
    }
};
