import LandingAuthPanel from "./components/LandingAuthPanel";

export default function LandingLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex min-h-screen">
            {/* Left: landing page content (scrollable) */}
            <main className="hidden bg-black xl:block xl:w-[60%]">
                {children}
            </main>

            {/* Right: auth panel (sticky) */}
            <aside className="flex w-full overflow-y-auto items-start justify-center bg-background px-6 pt-10 pb-8 sm:px-8 lg:px-12 xl:sticky xl:top-0 xl:h-screen xl:w-[40%] xl:border-l xl:border-white/10 xl:pt-12">
                <LandingAuthPanel />
            </aside>
        </div>
    );
}
