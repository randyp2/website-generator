import { notFound } from "next/navigation";
import { fetchPublicPortfolio } from "@/lib/api/publicPortfolio";
import type { Metadata } from "next";
import PortfolioIframe from "./components/PortfolioIframe";

interface Props {
    params: Promise<{ slug: string }>;
}

export const generateMetadata = async ({
    params,
}: Props): Promise<Metadata> => {
    const { slug } = await params;
    const portfolio = await fetchPublicPortfolio(slug);

    if (!portfolio) {
        return { title: "Portfolio Not Found" };
    }

    const title = portfolio.title || "Portfolio";
    const description = portfolio.ownerName
        ? `${portfolio.ownerName}'s portfolio — ${title}`
        : title;

    return {
        title,
        description,
        openGraph: {
            type: "website",
            title,
            description,
            siteName: "PortRN",
        },
        twitter: {
            card: "summary_large_image",
            title,
            description,
        },
    };
};

const PortfolioPage = async ({ params }: Props) => {
    const { slug } = await params;
    const portfolio = await fetchPublicPortfolio(slug);

    if (!portfolio) {
        notFound();
    }

    const htmlUrl: string = `/api/public/portfolio/${encodeURIComponent(slug)}/html`;

    return <PortfolioIframe htmlUrl={htmlUrl} title={portfolio.title} />;
};

export default PortfolioPage;
