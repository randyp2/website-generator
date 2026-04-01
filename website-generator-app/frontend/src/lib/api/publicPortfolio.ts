import "server-only";

import type { PublicPortfolioDTO } from "@/types/public-portfolio";

const toTitleCase = (value: string) =>
  value
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

const buildMockSections = (ownerName: string) => [
  {
    sectionKey: "hero",
    title: "Hero",
    orderIndex: 0,
    contentJson: {
      ownerName,
      title: "Frontend Engineer and Product Builder",
      subtitle:
        "This portfolio route is now a front-end-only mockup generated locally from the URL slug.",
    },
    reactSource: `
      export default function HeroSection({ content }) {
        return (
          <section className="px-6 py-20 md:px-10">
            <div className="mx-auto max-w-5xl rounded-[28px] border border-white/10 bg-white/[0.04] p-10 shadow-[0_30px_80px_rgba(0,0,0,0.25)] backdrop-blur-xl">
              <p className="mb-4 text-xs uppercase tracking-[0.22em] text-sky-300">Mock Public Portfolio</p>
              <h1 className="mb-4 text-4xl font-semibold text-white md:text-6xl">{content.ownerName}</h1>
              <p className="mb-6 text-lg text-white/85 md:text-2xl">{content.title}</p>
              <p className="max-w-2xl text-base leading-8 text-white/60">{content.subtitle}</p>
            </div>
          </section>
        );
      }
    `,
  },
  {
    sectionKey: "about",
    title: "About",
    orderIndex: 1,
    contentJson: {
      body:
        "This page no longer loads published portfolio data from the backend. It renders a deterministic placeholder experience so the route remains visually complete while the app is being converted to a front-end-only demo.",
    },
    reactSource: `
      export default function AboutSection({ content }) {
        return (
          <section className="px-6 py-6 md:px-10">
            <div className="mx-auto max-w-5xl rounded-[24px] border border-white/10 bg-slate-900/70 p-8">
              <h2 className="mb-4 text-2xl font-semibold text-white">About</h2>
              <p className="max-w-3xl text-base leading-8 text-white/65">{content.body}</p>
            </div>
          </section>
        );
      }
    `,
  },
  {
    sectionKey: "highlights",
    title: "Highlights",
    orderIndex: 2,
    contentJson: {
      items: [
        "Responsive front-end systems",
        "Design-minded implementation",
        "Product-focused iteration",
      ],
    },
    reactSource: `
      export default function HighlightsSection({ content }) {
        return (
          <section className="px-6 py-6 md:px-10">
            <div className="mx-auto max-w-5xl rounded-[24px] border border-white/10 bg-white/[0.03] p-8">
              <h2 className="mb-5 text-2xl font-semibold text-white">Highlights</h2>
              <div className="grid gap-4 md:grid-cols-3">
                {content.items.map((item, index) => (
                  <div key={index} className="rounded-2xl border border-sky-400/15 bg-sky-400/5 p-5 text-sm text-white/75">
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </section>
        );
      }
    `,
  },
];

export const fetchPublicPortfolio = async (
  slug: string,
): Promise<PublicPortfolioDTO | null> => {
  const normalizedSlug = slug.trim().toLowerCase();
  if (!normalizedSlug) return null;

  const ownerName = toTitleCase(normalizedSlug);
  const title = `${ownerName} Portfolio`;

  return {
    title,
    slug: normalizedSlug,
    templateId: "mock-public-portfolio",
    sections: buildMockSections(ownerName),
    globalTheme: {
      background:
        "bg-[radial-gradient(circle_at_top_right,rgba(56,189,248,0.18),transparent_28%),radial-gradient(circle_at_bottom_left,rgba(14,165,233,0.16),transparent_32%),#020617]",
      textPrimary: "text-white",
      textSecondary: "text-slate-400",
      accentColor: "sky",
      fonts: { heading: "Inter", body: "Inter" },
    },
    ownerName,
    ownerAvatarUrl: null,
    publishedAt: new Date("2026-04-01T00:00:00.000Z").toISOString(),
  };
};
