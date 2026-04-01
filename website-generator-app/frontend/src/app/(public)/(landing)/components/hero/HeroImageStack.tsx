import type { JSX } from "react";
import Image from "next/image";
import LikeHeartBadge from "./LikeHeartBadge";
import PortfolioCommentBubble from "./PortfolioCommentBubble";
import LiveCursors from "./RecruiterCursor";
import VerificationRingCard from "./VerificationRingCard";

const heroImages = [
    {
        src: "/images/hero/hero1.png",
        alt: "Portfolio example - clean professional layout",
        position: "absolute z-20 bottom-0 left-0 rotate-[-4deg]",
        hover: "hover:scale-105",
        size: "w-[420px] sm:w-[500px]",
    },
    {
        src: "/images/hero/hero4.png",
        alt: "Portfolio example - dark developer theme",
        position: "absolute z-20 bottom-0 right-0 rotate-[3deg]",
        hover: "hover:scale-105",
        size: "w-[420px] sm:w-[500px]",
    },
    {
        src: "/images/hero/hero3.png",
        alt: "Portfolio example - creative design",
        position:
            "absolute z-30 top-[25%] left-1/2 -translate-x-1/2 -rotate-1 scale-[1.15]",
        hover: "hover:scale-[1.22]",
        size: "w-[420px] sm:w-[500px]",
    },
] as const;

const HeroImageStack = (): JSX.Element => (
    <div className="relative -mt-6 h-[380px] w-[520px] lg:h-[440px] lg:w-[620px] xl:h-[500px] xl:w-[680px] 2xl:h-[580px] 2xl:w-[780px]">
        {heroImages.map((image) => (
            <div
                key={image.src}
                className={`${image.position} ${image.hover} overflow-hidden rounded-2xl border border-white/10 shadow-2xl transition-all duration-500 hover:z-40`}
            >
                <Image
                    src={image.src}
                    alt={image.alt}
                    width={600}
                    height={400}
                    className={`h-auto ${image.size} object-cover`}
                    priority
                />
            </div>
        ))}

        <div className="pointer-events-none absolute inset-0 z-50">
            <LiveCursors />
            <div className="absolute left-1/2 top-[24%] z-[60] -translate-y-1/2 translate-x-[145px] rotate-[8deg]">
                <PortfolioCommentBubble />
            </div>
            <div className="absolute left-[-10%] top-[44%] z-[60] -rotate-[6deg]">
                <VerificationRingCard />
            </div>
            <div className="absolute right-[-3%] top-[50%] z-[60] rotate-[18deg]">
                <LikeHeartBadge />
            </div>
        </div>
    </div>
);

export default HeroImageStack;
