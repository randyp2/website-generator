import { buildMockPortfolioExportHtml } from "@/lib/mock-portfolios";
import type { GlobalTheme, SectionDTO } from "@/types/portfolio";

/**
 * Downloads the portfolio as a standalone HTML file.
 * This now uses the front-end mock template data only.
 */
export async function downloadPortfolioHtml(
    portfolioId: string,
    sections: SectionDTO[],
    globalTheme: GlobalTheme | null,
    title: string,
): Promise<void> {
    if (!portfolioId) {
        throw new Error("Portfolio ID is required");
    }

    if (!sections || sections.length === 0) {
        throw new Error("No sections to export");
    }

    const html = buildMockPortfolioExportHtml({
        sections,
        globalTheme,
        title: title || "Portfolio",
    });

    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `${sanitizeFilename(title || "portfolio")}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    URL.revokeObjectURL(url);
}

function sanitizeFilename(name: string): string {
    return (
        name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-|-$/g, "")
            .slice(0, 50) || "portfolio"
    );
}
