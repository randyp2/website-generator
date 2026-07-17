"use client";

import { createClient } from "@/utils/supabase/client";
import { clearAllOnboardingDrafts } from "@/app/onboarding/lib/onboarding-draft";

export async function signoutClient() {
    const supabase = await createClient();

    // Sign out the user
    await supabase.auth.signOut();
    clearAllOnboardingDrafts(window.sessionStorage);

    // CANNOT REDIRECT FROM CLIENT ONLY ON SERVER
}

/** Clears this browser session after permanent backend account deletion. */
export async function clearDeletedAccountSession(): Promise<void> {
    const supabase = await createClient();

    await supabase.auth.signOut({ scope: "local" });
    clearAllOnboardingDrafts(window.sessionStorage);
}
