"use client";

import React, { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { CREDIT_PACKS, SUBSCRIPTION_PLANS } from "@/data/billing-catalog";
import type { PriceKey } from "@/types/billing";

const Confetti = dynamic(() => import("react-confetti"), { ssr: false });

const isKnownPriceKey = (value: string | null): value is PriceKey => {
    if (!value) return false;
    return [
        "WEBSITE_GENERATOR_PRO_MONTHLY",
        "WEBSITE_GENERATOR_PRO_ANNUAL",
        "CREDIT_PACK_SMALL",
        "CREDIT_PACK_MEDIUM",
        "CREDIT_PACK_LARGE",
    ].includes(value);
};

const resolvePurchaseDetails = (priceKey: PriceKey | null) => {
    if (!priceKey) return null;

    const plan = SUBSCRIPTION_PLANS.find((p) => p.priceKey === priceKey);
    if (plan) {
        return {
            label: plan.name,
            creditsLabel: `${plan.monthlyCredits} credits refreshed monthly`,
        };
    }

    const pack = CREDIT_PACKS.find((p) => p.priceKey === priceKey);
    if (pack) {
        return {
            label: pack.name,
            creditsLabel: `${pack.credits} credits added to your account`,
        };
    }

    return null;
};

const useWindowSize = () => {
    const [size, setSize] = useState({ width: 0, height: 0 });
    useEffect(() => {
        const update = () =>
            setSize({ width: window.innerWidth, height: window.innerHeight });
        update();
        window.addEventListener("resize", update);
        return () => window.removeEventListener("resize", update);
    }, []);
    return size;
};

const SuccessCard: React.FC = () => {
    const searchParams = useSearchParams();
    const priceKeyParam = searchParams.get("priceKey");
    const priceKey = isKnownPriceKey(priceKeyParam) ? priceKeyParam : null;
    const purchase = resolvePurchaseDetails(priceKey);

    const { width, height } = useWindowSize();
    const [showConfetti, setShowConfetti] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => setShowConfetti(false), 3000);
        return () => clearTimeout(timer);
    }, []);

    return (
        <>
            {showConfetti && width > 0 && (
                <Confetti
                    width={width}
                    height={height}
                    recycle={false}
                    numberOfPieces={300}
                    gravity={0.25}
                    initialVelocityY={18}
                    className="pointer-events-none fixed inset-0 z-50"
                />
            )}

            <Card className="border-border bg-card shadow-lg">
                <CardHeader className="items-start text-left">
                    <motion.svg
                        className="mb-2 size-14"
                        viewBox="0 0 52 52"
                        fill="none"
                    >
                        <motion.circle
                            cx="26"
                            cy="26"
                            r="23"
                            stroke="rgb(16, 185, 129)"
                            strokeWidth="3"
                            initial={{ pathLength: 0 }}
                            animate={{ pathLength: 1 }}
                            transition={{ duration: 0.6, ease: "easeOut" }}
                        />
                        <motion.path
                            d="M 14 27 L 23 35 L 38 19"
                            stroke="rgb(16, 185, 129)"
                            strokeWidth="3"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            initial={{ pathLength: 0 }}
                            animate={{ pathLength: 1 }}
                            transition={{
                                duration: 0.35,
                                delay: 0.45,
                                ease: "easeOut",
                            }}
                        />
                    </motion.svg>
                    <CardTitle className="mt-2 text-3xl font-bold text-card-foreground md:text-4xl">
                        Payment succeeded!
                    </CardTitle>
                    <CardDescription className="mt-2 text-base">
                        {purchase ? (
                            <>
                                Thank you for upgrading to{" "}
                                <span className="font-semibold text-foreground">
                                    {purchase.label}
                                </span>
                                . {purchase.creditsLabel}.
                            </>
                        ) : (
                            <>
                                Thank you for your purchase. Your credits and
                                plan access will appear in a moment.
                            </>
                        )}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Button asChild>
                        <Link href="/dashboard">Your dashboard</Link>
                    </Button>
                </CardContent>
            </Card>
        </>
    );
};

const BillingSuccessPage: React.FC = () => {
    return (
        <div className="relative min-h-[80vh] px-4 pb-14 pt-12 md:px-6">
            <div className="mx-auto max-w-xl">
                <Suspense fallback={null}>
                    <SuccessCard />
                </Suspense>
            </div>
        </div>
    );
};

export default BillingSuccessPage;
