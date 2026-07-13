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

    // On xl the row is a fixed viewport-height container that clips its own
    // overflow, so each pane scrolls independently instead of moving the page.
    // Below xl it is a single scrolling column.
    return (
        <div className="flex min-h-screen xl:h-screen xl:overflow-hidden">
            {/* Left: landing page content (independent scroll) */}
            <main className="hidden xl:block xl:h-screen xl:w-[60%] xl:overflow-y-auto">
                {children}
            </main>

            {/* Right: auth panel (independent scroll) */}
            <aside className="flex w-full items-start justify-center overflow-y-auto bg-background px-6 pb-8 sm:px-8 lg:px-12 xl:h-screen xl:w-[40%] xl:border-l xl:border-border">
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
