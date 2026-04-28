"use client";

import React from "react";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import type { PriceKey, PricingPlan } from "@/types/billing";

interface PricingPlanCardProps {
    plan: PricingPlan;
    onSelect: (priceKey: PriceKey) => void;
    disabled?: boolean;
}

export const PricingPlanCard: React.FC<PricingPlanCardProps> = ({
    plan,
    onSelect,
    disabled,
}) => {
    const isHighlighted: boolean = plan.highlighted === true;

    return (
        <Card
            className={
                isHighlighted
                    ? "relative border-primary/50"
                    : "flex flex-col border-border"
            }
        >
            {isHighlighted ? (
                <span className="absolute inset-x-0 -top-3 mx-auto flex h-6 w-fit items-center rounded-full bg-gradient-to-br from-primary to-accent px-3 py-1 text-xs font-medium text-primary-foreground ring-1 ring-inset ring-border">
                    Popular
                </span>
            ) : null}

            <div className="flex h-full flex-col">
                <CardHeader>
                    <CardTitle className="font-medium text-card-foreground">
                        {plan.name}
                    </CardTitle>
                    <span className="my-3 block text-2xl font-semibold text-card-foreground">
                        {plan.priceLabel}{" "}
                        <span className="text-base font-normal text-muted-foreground">
                            {plan.priceCadence}
                        </span>
                    </span>
                    <CardDescription className="text-sm">
                        {plan.description}
                    </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                    <hr className="border-dashed border-border" />
                    <ul className="list-outside space-y-3 text-sm">
                        {plan.features.map((feature: string) => (
                            <li
                                key={feature}
                                className="flex items-center gap-2 text-card-foreground"
                            >
                                <Check className="size-3 text-primary" />
                                {feature}
                            </li>
                        ))}
                    </ul>
                </CardContent>

                <CardFooter className="mt-auto">
                    <Button
                        type="button"
                        onClick={() => onSelect(plan.priceKey)}
                        disabled={disabled}
                        variant={isHighlighted ? "default" : "outline"}
                        className="w-full"
                    >
                        {plan.ctaLabel}
                    </Button>
                </CardFooter>
            </div>
        </Card>
    );
};
