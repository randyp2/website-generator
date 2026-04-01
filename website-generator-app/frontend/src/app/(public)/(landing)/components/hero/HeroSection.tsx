import BrandWordmark from "@/components/branding/BrandWordmark";
import HeroImageStack from "./HeroImageStack";

const HeroSection = () => (
    <section className="relative flex min-h-screen items-center justify-center px-6 py-24">
        <div className="absolute left-6 top-6 z-[70] sm:left-8 sm:top-8">
            <BrandWordmark className="text-2xl text-white sm:text-3xl" />
        </div>
        <div className="flex flex-col items-center gap-5">
            <div className="max-w-4xl text-center">
                <h1 className="text-balance text-4xl font-semibold leading-tight tracking-tight text-white sm:text-5xl md:text-6xl">
                    Build a portfolio recruiters can{" "}
                    <span className="text-primary">instantly validate</span>
                </h1>
            </div>
            <HeroImageStack />
        </div>
    </section>
);

export default HeroSection;
