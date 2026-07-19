'use client';

import { useScroll, useTransform, motion, type MotionValue } from 'framer-motion';
import Image from 'next/image';
import { type ReactNode, useRef } from 'react';

interface ParallaxImage {
    src: string;
    alt?: string;
}

interface ZoomParallaxProps {
    /** Surrounding images (max 6) — these fly past the viewer on scroll */
    images: ParallaxImage[];
    /** Center content that scales up to fill the viewport on scroll */
    children: ReactNode;
}

const IMAGE_POSITIONS = [
    '[&>div]:!-top-[30vh] [&>div]:!left-[5vw] [&>div]:!h-[30vh] [&>div]:!w-[35vw]',
    '[&>div]:!-top-[10vh] [&>div]:!-left-[25vw] [&>div]:!h-[40vh] [&>div]:!w-[21vw]',
    '[&>div]:!left-[27.5vw] [&>div]:!h-[25vh] [&>div]:!w-[25vw]',
    '[&>div]:!top-[23vh] [&>div]:!left-[5vw] [&>div]:!h-[34vh] [&>div]:!w-[16vw]',
    '[&>div]:!top-[27.5vh] [&>div]:!-left-[22.5vw] [&>div]:!h-[25vh] [&>div]:!w-[30vw]',
    '[&>div]:!top-[22.5vh] [&>div]:!left-[25vw] [&>div]:!h-[15vh] [&>div]:!w-[15vw]',
] as const;

const useParallaxScales = (scrollYProgress: MotionValue<number>) => {
    const centerScale = useTransform(scrollYProgress, [0, 1], [0.35, 1]);

    const imageScales = [
        useTransform(scrollYProgress, [0, 1], [0.65, 5]),
        useTransform(scrollYProgress, [0, 1], [0.65, 6]),
        useTransform(scrollYProgress, [0, 1], [0.65, 5]),
        useTransform(scrollYProgress, [0, 1], [0.65, 6]),
        useTransform(scrollYProgress, [0, 1], [0.55, 8]),
        useTransform(scrollYProgress, [0, 1], [0.55, 9]),
    ];

    return { centerScale, imageScales };
};

export const ZoomParallax = ({ images, children }: ZoomParallaxProps) => {
    const container = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
        target: container,
        offset: ['start start', 'end end'],
    });

    const { centerScale, imageScales } = useParallaxScales(scrollYProgress);

    return (
        <div ref={container} className="relative h-[300vh]">
            <div className="sticky top-0 h-screen overflow-hidden">
                {/* Center content — starts small, scales to fill viewport */}
                <motion.div
                    style={{ scale: centerScale, willChange: 'transform' }}
                    className="absolute top-0 z-10 flex h-full w-full items-center justify-center"
                >
                    <div className="relative flex items-center justify-center">
                        {children}
                    </div>
                </motion.div>

                {/* Surrounding images — scale faster and fly past */}
                {images.slice(0, 6).map(({ src, alt }, index) => (
                    <motion.div
                        key={index}
                        style={{ scale: imageScales[index], willChange: 'transform' }}
                        className={`absolute top-0 flex h-full w-full items-center justify-center ${IMAGE_POSITIONS[index]}`}
                    >
                        <div className="relative h-[25vh] w-[25vw]">
                            <Image
                                src={src}
                                alt={alt || `Parallax image ${index + 1}`}
                                fill
                                sizes="25vw"
                                quality={75}
                                priority={index < 2}
                                className="rounded-lg object-cover"
                            />
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};
