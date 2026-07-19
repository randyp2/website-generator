import React from "react";

export const PolicyCopy: React.FC = () => {
    return (
        <div className="space-y-2 text-xs text-muted-foreground">
            <p>
                Subscription feature allowances refresh monthly and do not
                roll over. One-time credit packs do not expire while your
                account remains active and are used when an allowance is not
                available.
            </p>
            <p>
                Refunds are evaluated case-by-case for unused credits within 14
                days of purchase. Contact support to start a request.
            </p>
            <p>
                Access, allowances, and purchased credits are finalized after
                Stripe payment confirmation.
            </p>
        </div>
    );
};
