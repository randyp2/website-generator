"use client";

import type { JSX } from "react";
import { useEffect, useState } from "react";

const COMMENT_TEXT = "this guy's projects are cracked, my king 😱";

const PortfolioCommentBubble = (): JSX.Element => {
    const [visibleText, setVisibleText] = useState<string>("");

    useEffect(() => {
        let currentIndex = 0;

        const typeInterval = window.setInterval(() => {
            currentIndex += 1;
            setVisibleText(COMMENT_TEXT.slice(0, currentIndex));

            if (currentIndex >= COMMENT_TEXT.length) {
                window.clearInterval(typeInterval);
            }
        }, 40);

        return () => window.clearInterval(typeInterval);
    }, []);

    return (
        <div className="w-[260px] rounded-2xl border border-black/10 bg-white px-4 py-3 shadow-2xl">
            <p className="w-full text-sm font-medium leading-snug text-black">
                {visibleText}
            </p>
        </div>
    );
};

export default PortfolioCommentBubble;
