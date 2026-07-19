import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { createServerSupabaseClient } from "@/utils/supabase/server";
import { ResetPasswordForm } from "./ResetPasswordForm";

export const metadata: Metadata = {
    title: "Reset password",
    robots: {
        index: false,
        follow: false,
    },
};

/** Shows the password update form after Supabase establishes a recovery session. */
const ResetPasswordPage = async () => {
    const supabase = await createServerSupabaseClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect("/error");
    }

    return (
        <div className="flex min-h-[70vh] items-center justify-center px-4 py-16">
            <div className="w-full max-w-md rounded-2xl border border-border/60 bg-card/70 p-6 shadow-lg sm:p-8">
                <ResetPasswordForm />
            </div>
        </div>
    );
};

export default ResetPasswordPage;
