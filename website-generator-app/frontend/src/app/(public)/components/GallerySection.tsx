"use client";

import React from "react";
import { ArrowUpRight } from "lucide-react";
import {
    ContainerAnimated,
    ContainerScroll,
    ContainerStagger,
    ContainerSticky,
    GalleryCol,
    GalleryContainer,
} from "@/components/ui/animated-gallery";

const PORTFOLIOS_1 = [
    "https://images.unsplash.com/photo-1529218402470-5dec8fea0761?w=1200&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1604928141064-207cea6f571f?w=1200&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1573455494060-c5595004fb6c?w=1200&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1608875004752-2fdb6a39ba4c?w=1200&auto=format&fit=crop&q=80",
];

const PORTFOLIOS_2 = [
    "https://images.unsplash.com/photo-1542052125323-e69ad37a47c2?w=1200&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1493515322954-4fa727e97985?w=1200&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1542051841857-5f90071e7989?w=1200&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1532236204992-f5e85c024202?w=1200&auto=format&fit=crop&q=80",
];

const PORTFOLIOS_3 = [
    "https://images.unsplash.com/photo-1528361237150-8a9a7df33035?w=1200&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1564284369929-026ba231f89b?w=1200&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1493515322954-4fa727e97985?w=1200&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1542051841857-5f90071e7989?w=1200&auto=format&fit=crop&q=80",
];

export const GallerySection: React.FC = () => {
    return (
        <section className="relative bg-background py-8 md:py-12">
            <ContainerStagger className="relative z-20 mx-auto -mb-8 max-w-4xl px-6 pt-10 text-center text-foreground md:-mb-12 md:pt-14">
                <ContainerAnimated>
                    <h2 className="text-4xl font-bold tracking-tight md:text-5xl">
                        Portfolio Gallery
                    </h2>
                </ContainerAnimated>
                <ContainerAnimated>
                    <p className="mx-auto mt-4 max-w-2xl text-base text-muted-foreground md:text-lg">
                        Join creators shipping live portfolios and show your work to the world.
                    </p>
                </ContainerAnimated>
                <ContainerAnimated className="mt-6 flex items-center justify-center">
                    <button
                        type="button"
                        className="inline-flex items-center gap-2 text-foreground/90 underline decoration-foreground/40 underline-offset-4 transition-colors hover:text-foreground hover:decoration-foreground text-sm font-semibold uppercase tracking-[0.18em]"
                    >
                        Visit Portfolios
                        <ArrowUpRight className="size-4" />
                    </button>
                </ContainerAnimated>
            </ContainerStagger>

            <ContainerScroll className="relative h-[420vh] md:h-[500vh]">
                <ContainerSticky className="h-svh">
                    <GalleryContainer className="grid-cols-1 gap-3 px-3 py-2 rounded-3xl md:grid-cols-3 md:gap-4 md:px-8">
                        <GalleryCol yRange={["-10%", "2%"]} className="-mt-2">
                            {PORTFOLIOS_1.map((imageUrl, index) => (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                    key={`portfolio-1-${index}`}
                                    className="aspect-video block h-auto max-h-full w-full rounded-xl border border-border object-cover shadow-[0_14px_35px_-20px_rgba(0,0,0,0.85)]"
                                    src={imageUrl}
                                    alt={`Portfolio showcase ${index + 1}`}
                                />
                            ))}
                        </GalleryCol>
                        <GalleryCol yRange={["15%", "5%"]} className="mt-[-50%] hidden md:flex">
                            {PORTFOLIOS_2.map((imageUrl, index) => (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                    key={`portfolio-2-${index}`}
                                    className="aspect-video block h-auto max-h-full w-full rounded-xl border border-border object-cover shadow-[0_14px_35px_-20px_rgba(0,0,0,0.85)]"
                                    src={imageUrl}
                                    alt={`Portfolio showcase ${index + 5}`}
                                />
                            ))}
                        </GalleryCol>
                        <GalleryCol yRange={["-10%", "2%"]} className="-mt-2 hidden md:flex">
                            {PORTFOLIOS_3.map((imageUrl, index) => (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                    key={`portfolio-3-${index}`}
                                    className="aspect-video block h-auto max-h-full w-full rounded-xl border border-border object-cover shadow-[0_14px_35px_-20px_rgba(0,0,0,0.85)]"
                                    src={imageUrl}
                                    alt={`Portfolio showcase ${index + 9}`}
                                />
                            ))}
                        </GalleryCol>
                    </GalleryContainer>
                </ContainerSticky>
            </ContainerScroll>
        </section>
    );
};
