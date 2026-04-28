import type { Metadata } from "next";
import React from "react";
import BillingPageContent from "@/app/(dashboard)/dashboard/billing/BillingPageContent";

export const metadata: Metadata = {
    title: "Pricing",
};

const PricingPage: React.FC = () => <BillingPageContent />;

export default PricingPage;
