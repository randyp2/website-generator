"use client";

import React from "react";
import Link from "next/link";
import { XCircle } from "lucide-react";
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
        <div className="relative px-4 pb-14 pt-6 md:px-6">
            <div className="mx-auto max-w-xl">
                <Card className="border-border bg-card">
                    <CardHeader className="items-center text-center">
                        <XCircle className="size-12 text-muted-foreground" />
                        <CardTitle className="mt-4 text-2xl text-card-foreground">
                            Checkout canceled
                        </CardTitle>
                        <CardDescription>
                            You weren&apos;t charged. You can pick up where you
                            left off whenever you&apos;re ready.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="flex justify-center">
                        <Button asChild>
                            <Link href="/pricing">Try again</Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default BillingCancelPage;
