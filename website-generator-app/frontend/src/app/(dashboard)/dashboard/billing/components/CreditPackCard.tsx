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
import type { CreditPack, PriceKey } from "@/types/billing";

interface CreditPackCardProps {
    pack: CreditPack;
    onSelect: (priceKey: PriceKey) => void;
    disabled?: boolean;
}

export const CreditPackCard: React.FC<CreditPackCardProps> = ({
    pack,
    onSelect,
    disabled,
}) => {
    return (
        <Card className="flex flex-col border-border">
            <CardHeader>
                <CardTitle className="font-medium text-card-foreground">
                    {pack.name}
                </CardTitle>
                <span className="my-3 block text-2xl font-semibold text-card-foreground">
                    {pack.priceLabel}{" "}
                    <span className="text-base font-normal text-muted-foreground">
                        one-time
                    </span>
                </span>
                <CardDescription className="text-sm">
                    {pack.description}
                </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
                <hr className="border-dashed border-border" />
                <ul className="list-outside space-y-3 text-sm">
                    <li className="flex items-center gap-2 text-card-foreground">
                        <Check className="size-3 text-primary" />
                        {pack.credits.toLocaleString()} credits
                    </li>
                    <li className="flex items-center gap-2 text-card-foreground">
                        <Check className="size-3 text-primary" />
                        Never expires while account is active
                    </li>
                    <li className="flex items-center gap-2 text-card-foreground">
                        <Check className="size-3 text-primary" />
                        Stack with subscription credits
                    </li>
                </ul>
            </CardContent>

            <CardFooter className="mt-auto">
                <Button
                    type="button"
                    onClick={() => onSelect(pack.priceKey)}
                    disabled={disabled}
                    variant="outline"
                    className="w-full"
                >
                    {pack.ctaLabel}
                </Button>
            </CardFooter>
        </Card>
    );
};
