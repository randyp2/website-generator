"use client";

import React from "react";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { PriceKey, PricingPlan } from "@/types/billing";

interface PricingPlanCardProps {
    plan: PricingPlan;
    onSelect: (priceKey: PriceKey) => void;
    disabled?: boolean;
    isCurrentPlan?: boolean;
}

export const PricingPlanCard: React.FC<PricingPlanCardProps> = ({
    plan,
    onSelect,
    disabled,
    isCurrentPlan,
}) => {
    const isHighlighted: boolean = plan.highlighted === true;
    const hasPriceKey: boolean = plan.priceKey !== null;

    const handleClick = (): void => {
        if (plan.priceKey === null) return;
        onSelect(plan.priceKey);
    };

    return (
        <Card
            className={cn(
                "flex h-full flex-col border-border bg-card text-card-foreground transition-shadow",
                isHighlighted &&
                    "border-[#cc7d23]/85 bg-card ring-1 ring-[#cc7d23]/70 shadow-[0_0_0_1px_rgba(204,125,35,0.5),0_0_20px_-4px_rgba(204,125,35,0.45)]",
            )}
        >
            <CardHeader className="space-y-3 pb-4">
                <div className="flex items-start justify-between gap-2">
                    <h3 className="text-2xl font-bold tracking-tight">
                        {plan.name}
                    </h3>
                    {isHighlighted ? (
                        <span className="rounded-md bg-primary px-2.5 py-1 text-xs font-medium text-primary-foreground">
                            Most Popular
                        </span>
                    ) : null}
                </div>
                <p className="text-sm text-muted-foreground">
                    {plan.description}
                </p>

                <div className="pt-4">
                    <div className="flex items-baseline gap-1">
                        <span
                            className={cn(
                                "text-5xl font-bold tracking-tight text-foreground",
                                isHighlighted && "text-primary",
                            )}
                        >
                            {plan.priceLabel}
                        </span>
                        <span className="text-sm text-muted-foreground">
                            {plan.pricePeriod}
                        </span>
                    </div>
                    {plan.cadenceLabel ? (
                        <p className="mt-1.5 text-xs text-muted-foreground">
                            {plan.cadenceLabel}
                        </p>
                    ) : null}
                    {plan.originalPriceLabel ? (
                        <p className="text-xs text-muted-foreground/70 line-through">
                            {plan.originalPriceLabel}
                        </p>
                    ) : null}
                </div>
            </CardHeader>

            <CardContent className="flex-1 space-y-3 border-t border-dashed border-border/80 pt-5">
                <h4 className="text-sm font-semibold text-foreground">
                    Key Features:
                </h4>
                <ul className="space-y-3">
                    {plan.features.map((feature: string) => (
                        <li
                            key={feature}
                            className="flex items-start gap-2 text-sm text-card-foreground"
                        >
                            <CheckCircle2 className="mt-0.5 size-4 flex-shrink-0 text-foreground" />
                            <span>{feature}</span>
                        </li>
                    ))}
                </ul>
            </CardContent>

            <CardFooter className="mt-auto pt-6">
                <Button
                    type="button"
                    onClick={handleClick}
                    disabled={disabled || !hasPriceKey || isCurrentPlan}
                    variant={isHighlighted ? "default" : "outline"}
                    className="h-12 w-full text-base font-medium"
                >
                    {isCurrentPlan ? "Current plan" : plan.ctaLabel}
                </Button>
            </CardFooter>
        </Card>
    );
};
