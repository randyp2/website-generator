import Link from "next/link";

const ProfilePortfolioNotFound = () => (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#0a0a0a] text-white">
        <h1 className="text-6xl font-bold mb-4">404</h1>
        <p className="text-white/50 mb-8">This portfolio doesn&apos;t exist or isn&apos;t published.</p>
        <Link
            href="/"
            className="px-6 py-3 bg-white/10 hover:bg-white/15 border border-white/20 rounded-xl text-sm font-medium transition-colors"
        >
            Go Home
        </Link>
    </div>
);

export default ProfilePortfolioNotFound;
