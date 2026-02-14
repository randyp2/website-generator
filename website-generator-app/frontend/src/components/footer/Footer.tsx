export default function Footer() {
    const links = [
        { label: "Support", href: "#" },
        { label: "Privacy", href: "#" },
        { label: "Terms", href: "#" },
    ];

    return (
        <footer className="bg-[#030506] border-t border-white/10 text-white">
            <div className="relative max-w-6xl mx-auto px-6 py-12">
                <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />

                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
                    <div className="space-y-2">
                        <div className="text-2xl font-bold">PortRN</div>
                        <p className="text-sm text-white/70 max-w-md">
                            AI-crafted portfolios, deployed in minutes.
                            Customize, preview, and launch without touching
                            code.
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-5 text-sm font-medium">
                        {links.map((link) => (
                            <a
                                key={link.label}
                                href={link.href}
                                className="text-white/70 hover:text-white transition-colors"
                            >
                                {link.label}
                            </a>
                        ))}
                    </div>
                </div>

                <div className="mt-10 border-t border-white/5 pt-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <span className="text-xs text-white/50">
                        © 2025 PortRN. All rights reserved.
                    </span>
                    <span className="text-xs text-white/50">
                        Built for creators, designers, and developers.
                    </span>
                </div>
            </div>
        </footer>
    );
}
