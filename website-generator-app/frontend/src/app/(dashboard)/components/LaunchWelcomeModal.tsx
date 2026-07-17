"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { useProfileMeQuery } from "@/hooks/useProfileMeQuery";
import {
    consumeLaunchWelcomePending,
    getLaunchWelcomeName,
    isLaunchPromotion,
} from "@/lib/billing/launch-promotion";

const Confetti = dynamic(() => import("react-confetti"), { ssr: false });
const CONFETTI_DURATION_MS = 3_000;
const WELCOME_GRADIENT =
    "linear-gradient(125deg, #4a3620 0%, #554023 36%, #8a6733 70%, #c99846 100%)";

const LaunchWelcomeModal = () => {
    const { data: profile } = useProfileMeQuery();
    const hasCheckedWelcome = useRef<boolean>(false);
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const [showConfetti, setShowConfetti] = useState<boolean>(false);
    const [viewport, setViewport] = useState({ width: 0, height: 0 });

    useEffect(() => {
        if (!profile || hasCheckedWelcome.current) {
            return;
        }

        hasCheckedWelcome.current = true;
        const isPending = consumeLaunchWelcomePending();
        if (
            isPending &&
            isLaunchPromotion(profile.billing?.activePromotionKey)
        ) {
            setIsOpen(true);
            setShowConfetti(true);
        }
    }, [profile]);

    useEffect(() => {
        if (!isOpen) {
            return;
        }

        const updateViewport = (): void => {
            setViewport({
                width: window.innerWidth,
                height: window.innerHeight,
            });
        };

        updateViewport();
        window.addEventListener("resize", updateViewport);
        return () => window.removeEventListener("resize", updateViewport);
    }, [isOpen]);

    useEffect(() => {
        if (!showConfetti) {
            return;
        }

        const timer = window.setTimeout(
            () => setShowConfetti(false),
            CONFETTI_DURATION_MS,
        );
        return () => window.clearTimeout(timer);
    }, [showConfetti]);

    const handleOpenChange = (nextOpen: boolean): void => {
        setIsOpen(nextOpen);
        if (!nextOpen) {
            setShowConfetti(false);
        }
    };
    const welcomeName = getLaunchWelcomeName(profile?.fullName);

    return (
        <>
            {showConfetti && viewport.width > 0 ? (
                <Confetti
                    width={viewport.width}
                    height={viewport.height}
                    recycle={false}
                    numberOfPieces={300}
                    gravity={0.25}
                    initialVelocityY={18}
                    className="pointer-events-none fixed inset-0 z-[60]"
                />
            ) : null}

            <Dialog open={isOpen} onOpenChange={handleOpenChange}>
                <DialogContent
                    className="overflow-hidden border-amber-200/30 bg-transparent p-0 text-white shadow-2xl sm:max-w-md [&>button]:text-white [&>button]:hover:bg-white/10"
                    style={{ background: WELCOME_GRADIENT }}
                >
                    <div className="space-y-5 px-6 py-7">
                        <DialogHeader className="space-y-2 text-left">
                            <DialogTitle className="text-xl text-white">
                                Hey {welcomeName},
                            </DialogTitle>
                            <DialogDescription className="text-base leading-relaxed text-white/90">
                                Thanks for being a great friend and trying my
                                app. As a token of my appreciation, I added 1
                                portfolio generation, 2 refinements, and 15
                                asset verification uploads to your account.
                                Have fun, and let me know what you think :D
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter className="sm:justify-start">
                            <Button
                                type="button"
                                variant="secondary"
                                className="bg-white/90 text-[#4a3620] hover:bg-white"
                                onClick={() => handleOpenChange(false)}
                            >
                                Let&apos;s go
                            </Button>
                        </DialogFooter>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
};

export default LaunchWelcomeModal;
