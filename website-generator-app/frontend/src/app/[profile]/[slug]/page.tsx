import { notFound } from "next/navigation";
import { fetchPublicPortfolio } from "@/lib/api/publicPortfolio";
import type { Metadata } from "next";
import PortfolioRenderer from "../../portfolio/[slug]/components/PortfolioRenderer";

interface Props {
    params: Promise<{ profile: string; slug: string }>;
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

const ProfilePortfolioPage = async ({ params }: Props) => {
    const { slug } = await params;
    const portfolio = await fetchPublicPortfolio(slug);

    if (!portfolio) {
        notFound();
    }

    return <PortfolioRenderer portfolio={portfolio} />;
};

export default ProfilePortfolioPage;
