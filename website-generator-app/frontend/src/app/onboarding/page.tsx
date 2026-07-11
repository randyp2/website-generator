import { Suspense } from "react";

import OnboardingLoadingState from "./components/OnboardingLoadingState";
import OnboardingPageClient from "./OnboardingPageClient";
import { getOnboardingProfile } from "./onboarding-profile.server";

const OnboardingPage = async () => {
    const initialProfile = await getOnboardingProfile();

    return (
        <Suspense fallback={<OnboardingLoadingState />}>
            <OnboardingPageClient initialProfile={initialProfile ?? undefined} />
        </Suspense>
    );
};

export default OnboardingPage;
