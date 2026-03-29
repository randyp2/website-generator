"use client";

import { useEffect, useState } from "react";

interface Props {
    htmlUrl: string;
    title: string;
}

const PortfolioIframe = ({ htmlUrl, title }: Props) => {
    const [html, setHtml] = useState<string | null>(null);
    const [error, setError] = useState(false);

    useEffect(() => {
        const fetchHtml = async () => {
            try {
                const res = await fetch(htmlUrl);
                if (!res.ok) throw new Error();
                setHtml(await res.text());
            } catch {
                setError(true);
            }
        };
        fetchHtml();
    }, [htmlUrl]);

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-[#0a0a0a] text-white/60">
                <p>Failed to load portfolio.</p>
            </div>
        );
    }

    if (!html) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-[#0a0a0a]">
                <div className="w-10 h-10 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <iframe
            srcDoc={html}
            title={title}
            className="w-full h-screen border-0"
            sandbox="allow-scripts"
        />
    );
};

export default PortfolioIframe;
