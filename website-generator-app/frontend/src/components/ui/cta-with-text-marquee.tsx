"use client";

import { cn } from "@/lib/utils";
import { Fraunces, Space_Grotesk } from "next/font/google";
import { ReactNode, useEffect, useRef } from "react";

interface HorizontalMarqueeProps {
  children: ReactNode;
  pauseOnHover?: boolean;
  reverse?: boolean;
  className?: string;
  speed?: number;
}

function HorizontalMarquee({
  children,
  pauseOnHover = false,
  reverse = false,
  className,
  speed = 40,
}: HorizontalMarqueeProps) {
  return (
    <div
      className={cn("group flex overflow-hidden", className)}
      style={
        {
          "--duration": `${speed}s`,
        } as React.CSSProperties
      }
    >
      <div
        className={cn(
          "flex shrink-0 animate-marquee",
          reverse && "[animation-direction:reverse]",
          pauseOnHover && "group-hover:[animation-play-state:paused]"
        )}
      >
        {children}
      </div>
      <div
        className={cn(
          "flex shrink-0 animate-marquee",
          reverse && "[animation-direction:reverse]",
          pauseOnHover && "group-hover:[animation-play-state:paused]"
        )}
        aria-hidden="true"
      >
        {children}
      </div>
    </div>
  );
}

const marqueeItems = [
  "Content Agencies",
  "Founders & Execs",
  "Social Media Managers",
  "Content Marketers",
  "Growth Teams",
];

const ctaDisplay = Fraunces({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const ctaSans = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export default function CTAWithVerticalMarquee() {
  const marqueeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const marqueeContainer = marqueeRef.current;
    if (!marqueeContainer) return;

    const updateOpacity = () => {
      const items = marqueeContainer.querySelectorAll(
        ".marquee-item-horizontal"
      );
      const containerRect = marqueeContainer.getBoundingClientRect();
      const centerX = containerRect.left + containerRect.width / 2;

      items.forEach((item) => {
        const itemRect = item.getBoundingClientRect();
        const itemCenterX = itemRect.left + itemRect.width / 2;
        const distance = Math.abs(centerX - itemCenterX);
        const maxDistance = containerRect.width / 2;
        const normalizedDistance = Math.min(distance / maxDistance, 1);
        const opacity = 1 - normalizedDistance * 0.75;
        (item as HTMLElement).style.opacity = opacity.toString();
      });
    };

    const animationFrame = () => {
      updateOpacity();
      requestAnimationFrame(animationFrame);
    };

    const frame = requestAnimationFrame(animationFrame);

    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <div
      className={cn(
        ctaSans.className,
        "min-h-screen bg-black text-white flex items-center justify-center px-6 py-12 overflow-hidden"
      )}
    >
      <div className="w-full max-w-7xl animate-fade-in-up">
        <div className="flex flex-col gap-12 lg:gap-16 items-center">
          <div className="space-y-8 max-w-3xl text-center">
            <h1
              className={cn(
                ctaDisplay.className,
                "text-5xl md:text-6xl lg:text-7xl font-semibold leading-[0.95] tracking-[-0.02em] animate-fade-in-up [animation-delay:200ms]"
              )}
            >
              Get Started in Minutes
            </h1>
            <p className="mx-auto max-w-2xl text-base md:text-lg text-white/72 leading-relaxed tracking-[0.01em] animate-fade-in-up [animation-delay:400ms]">
              Start getting more distribution and ROI out of your content. Try
              Assembly for free for 14 days.
            </p>
            <div className="flex flex-wrap justify-center gap-4 animate-fade-in-up [animation-delay:600ms]">
              <button className="group relative px-6 py-3 bg-white text-black rounded-md text-sm md:text-base font-semibold tracking-[0.08em] overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-lg">
                <span className="relative z-10">START FREE TRIAL</span>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-black/10 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700"></div>
              </button>
              <button className="group relative px-6 py-3 bg-white/10 text-white rounded-md text-sm md:text-base font-semibold tracking-[0.08em] overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-lg border border-white/15">
                <span className="relative z-10">BOOK A 15 MINUTE DEMO</span>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700"></div>
              </button>
            </div>
          </div>

          <div
            ref={marqueeRef}
            className="relative w-full animate-fade-in-up [animation-delay:400ms]"
          >
            <div className="relative">
              <HorizontalMarquee speed={30} className="py-6">
                {marqueeItems.map((item, idx) => (
                  <div
                    key={idx}
                    className={cn(
                      ctaDisplay.className,
                      "text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-medium tracking-[-0.02em] px-10 marquee-item-horizontal whitespace-nowrap"
                    )}
                  >
                    {item}
                  </div>
                ))}
              </HorizontalMarquee>

              <div className="pointer-events-none absolute top-0 left-0 bottom-0 w-40 bg-gradient-to-r from-black via-black/60 to-transparent z-10"></div>

              <div className="pointer-events-none absolute top-0 right-0 bottom-0 w-40 bg-gradient-to-l from-black via-black/60 to-transparent z-10"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
