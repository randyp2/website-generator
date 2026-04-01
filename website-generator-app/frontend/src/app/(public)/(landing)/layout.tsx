import LandingAuthPanel from "./components/LandingAuthPanel";

export default function LandingLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex min-h-screen">
            {/* Left: landing page content (scrollable) */}
            <main className="w-full bg-black lg:w-[60%]">
                {children}
            </main>

            {/* Right: auth panel (sticky) */}
            <aside className="hidden lg:flex lg:w-[40%] sticky top-0 h-screen overflow-y-auto items-center justify-center bg-background border-l border-white/10 px-12 py-8">
                <LandingAuthPanel />
            </aside>
        </div>
    );
}
