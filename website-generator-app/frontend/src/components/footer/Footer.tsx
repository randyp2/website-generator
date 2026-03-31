import BrandWordmark from "@/components/branding/BrandWordmark";

export default function Footer() {
    const links = [
        { label: "Support", href: "#" },
        { label: "Privacy", href: "#" },
        { label: "Terms", href: "#" },
    ];

    return (
        <footer className="border-t border-sidebar-border bg-sidebar text-sidebar-foreground">
            <div className="relative max-w-6xl mx-auto px-6 py-12">
                <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-sidebar-foreground/30 to-transparent" />

                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
                    <div className="space-y-2">
                        <BrandWordmark className="text-2xl text-sidebar-foreground" />
                        <p className="max-w-md text-sm text-sidebar-foreground/70">
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
                                className="text-sidebar-foreground/70 transition-colors hover:text-sidebar-foreground"
                            >
                                {link.label}
                            </a>
                        ))}
                    </div>
                </div>

                <div className="mt-10 flex flex-col items-start justify-between gap-4 border-t border-sidebar-border/50 pt-6 md:flex-row md:items-center">
                    <span className="text-xs text-sidebar-foreground/50">
                        © 2025 <BrandWordmark compact className="text-xs text-sidebar-foreground/70 align-middle" />. All rights reserved.
                    </span>
                    <span className="text-xs text-sidebar-foreground/50">
                        Built for creators, designers, and developers.
                    </span>
                </div>
            </div>
        </footer>
    );
}
