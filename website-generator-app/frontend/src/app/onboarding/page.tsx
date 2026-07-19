import { Suspense } from "react";
import { headers } from "next/headers";

import OnboardingLoadingState from "./components/OnboardingLoadingState";
import OnboardingPageClient from "./OnboardingPageClient";
import { getOnboardingBootstrap } from "./onboarding-profile.server";

const OnboardingPage = async () => {
    const [{ initialProfile, userId }, requestHeaders] = await Promise.all([
        getOnboardingBootstrap(),
        headers(),
    ]);
    const siteHost = requestHeaders.get("host") ?? "your-site.com";

    return (
        <Suspense fallback={<OnboardingLoadingState />}>
            <OnboardingPageClient
                initialProfile={initialProfile ?? undefined}
                siteHost={siteHost}
                userId={userId}
            />
        </Suspense>
    );
};

export default OnboardingPage;
