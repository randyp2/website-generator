import { createServerSupabaseClient } from "@/utils/supabase/server";
import LandingAuthPanel from "./components/LandingAuthPanel";
import LandingAuthSwitcher from "./components/LandingAuthSwitcher";

export default async function LandingLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const supabase = await createServerSupabaseClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    const isLoggedIn = !!user;
    const username =
        user?.user_metadata?.full_name ??
        user?.user_metadata?.name ??
        (user?.email ? user.email.split("@")[0] : "User");
    const email = user?.email ?? "";
    const avatar: string | null = user?.user_metadata?.avatar_url ?? null;

    // The landing content (left) scrolls with the page via the Lenis smooth
    // scroll set up in the landing sections. The auth panel (right) is pinned
    // and scrolls on its own; data-lenis-prevent stops Lenis from hijacking
    // wheel events over it, so the two panes scroll independently.
    return (
        <div className="flex min-h-screen">
            {/* Left: landing page content (scrolls with the page) */}
            <main className="hidden xl:block xl:w-[60%]">
                {children}
            </main>

            {/* Right: auth panel (independent scroll) */}
            <aside
                data-lenis-prevent
                className="flex w-full items-start justify-center overflow-y-auto overscroll-contain bg-background px-6 pb-8 sm:px-8 lg:px-12 xl:sticky xl:top-0 xl:h-screen xl:w-[40%] xl:border-l xl:border-border"
            >
                {isLoggedIn ? (
                    <LandingAuthSwitcher
                        username={username}
                        email={email}
                        avatar={avatar}
                    />
                ) : (
                    <div className="pt-6 xl:pt-8">
                        <LandingAuthPanel />
                    </div>
                )}
            </aside>
        </div>
    );
}
