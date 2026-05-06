"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

const BillingCancelPage: React.FC = () => {
    return (
        <div className="relative min-h-[80vh] px-4 pb-14 pt-12 md:px-6">
            <div className="mx-auto max-w-xl">
                <Card className="border-border bg-card shadow-lg">
                    <CardHeader className="items-start text-left">
                        <div className="mb-2 flex size-14 items-center justify-center rounded-full bg-muted">
                            <span className="text-3xl font-semibold text-muted-foreground">
                                :(
                            </span>
                        </div>
                        <CardTitle className="mt-2 text-3xl font-bold text-card-foreground md:text-4xl">
                            Payment canceled
                        </CardTitle>
                        <CardDescription className="mt-2 text-base">
                            You weren&apos;t charged. You can pick up where you
                            left off whenever you&apos;re ready.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button asChild>
                            <Link href="/pricing">Go back to pricing</Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default BillingCancelPage;
