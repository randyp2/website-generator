import Link from "next/link";
import BrandWordmark from "@/components/branding/BrandWordmark";
import SubtleButton from "@/components/ui/subtle-button";
import HeroImageStack from "./HeroImageStack";

const HeroSection = () => (
    <section className="relative flex min-h-screen items-center justify-center px-6 py-24">
        <div className="absolute left-6 top-6 z-[70] sm:left-8 sm:top-8">
            <BrandWordmark className="text-2xl text-foreground sm:text-3xl" />
        </div>
        <div className="origin-top flex scale-[0.82] flex-col items-center gap-5 transition-transform duration-300 xl:scale-[0.82] 2xl:scale-[0.92]">
            <div className="max-w-4xl text-center">
                <h1 className="text-balance text-4xl font-semibold leading-tight tracking-tight text-foreground sm:text-5xl md:text-6xl">
                    Build a portfolio recruiters can{" "}
                    <span className="bg-linear-to-r from-[#fbbf24] via-[#f59e0b] to-[#b45309] bg-clip-text text-transparent">
                        instantly validate
                    </span>
                </h1>
                <div className="mt-6 flex justify-center">
                    <Link href="/explore">
                        <SubtleButton label="Browse portfolios" />
                    </Link>
                </div>
            </div>
            <HeroImageStack />
        </div>
    </section>
);

export default HeroSection;
