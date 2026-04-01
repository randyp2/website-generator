"use client";

import type { JSX } from "react";
import { useEffect, useState } from "react";
import { Heart } from "lucide-react";

const LikeHeartBadge = (): JSX.Element => {
    const [isVisible, setIsVisible] = useState<boolean>(false);

    useEffect(() => {
        const timer = window.setTimeout(() => setIsVisible(true), 450);

        return () => window.clearTimeout(timer);
    }, []);

    return (
        <Heart
            className="h-12 w-12 fill-red-500 text-red-500 drop-shadow-[0_10px_24px_rgba(239,68,68,0.45)] transition-all duration-700 ease-out"
            style={{
                opacity: isVisible ? 1 : 0,
                transform: isVisible ? "scale(1)" : "scale(0.7)",
            }}
            strokeWidth={2.4}
            aria-hidden="true"
        />
    );
};

export default LikeHeartBadge;
