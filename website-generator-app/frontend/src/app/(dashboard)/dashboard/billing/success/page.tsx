"use client";

import React from "react";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

const BillingSuccessPage: React.FC = () => {
    return (
        <div className="relative px-4 pb-14 pt-6 md:px-6">
            <div className="mx-auto max-w-xl">
                <Card className="border-border bg-card">
                    <CardHeader className="items-center text-center">
                        <CheckCircle2 className="size-12 text-primary" />
                        <CardTitle className="mt-4 text-2xl text-card-foreground">
                            Payment received
                        </CardTitle>
                        <CardDescription>
                            We&apos;re syncing your account. Credits and plan
                            access will appear in a moment.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="flex justify-center">
                        <Button asChild>
                            <Link href="/dashboard/billing">
                                Return to Billing
                            </Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default BillingSuccessPage;
