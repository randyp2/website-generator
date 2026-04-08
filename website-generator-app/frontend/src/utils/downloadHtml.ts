import type { SectionDTO, GlobalTheme } from "@/types/portfolio";

/**
 * Downloads the portfolio as a standalone HTML file.
 * Calls the backend API to generate the HTML with all necessary dependencies.
 */
export async function downloadPortfolioHtml(
    portfolioId: string,
    sections: SectionDTO[],
    globalTheme: GlobalTheme | null,
    title: string
): Promise<void> {
    if (!portfolioId) {
        throw new Error("Portfolio ID is required");
    }

    if (!sections || sections.length === 0) {
        throw new Error("No sections to export");
    }

    const response = await fetch(`/api/portfolio/${portfolioId}/export/html`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            sections,
            globalTheme,
            pageTitle: title || "Portfolio",
        }),
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to generate HTML");
    }

    const html = await response.text();
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

/**
 * Sanitizes a string to be used as a filename.
 */
export function sanitizeFilename(name: string): string {
    return name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "")
        .slice(0, 50) || "portfolio";
}
