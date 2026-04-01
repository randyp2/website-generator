import type { GlobalTheme, SectionDTO } from "@/types/portfolio";
import type { SectionPlan } from "@/types/preview";
import type { Version } from "@/types/version";

const MOCK_FONT_STACK = {
  heading: "Space Grotesk",
  body: "Inter",
};

const DEFAULT_BACKGROUND =
  "bg-[radial-gradient(circle_at_top_right,rgba(56,189,248,0.18),transparent_28%),radial-gradient(circle_at_bottom_left,rgba(14,165,233,0.16),transparent_32%),#020617]";

const toTitleCase = (value: string) =>
  value
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

const slugify = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

const toSentence = (value: string) =>
  value.trim().replace(/\s+/g, " ").replace(/^[a-z]/, (char) => char.toUpperCase());

export const createMockGlobalTheme = (templateId?: string | null): GlobalTheme => {
  if (templateId === "creative-minimal") {
    return {
      background:
        "bg-[radial-gradient(circle_at_top_left,rgba(251,191,36,0.16),transparent_22%),radial-gradient(circle_at_bottom_right,rgba(244,114,182,0.14),transparent_30%),#111827]",
      textPrimary: "text-white",
      textSecondary: "text-zinc-300",
      accentColor: "amber",
      fonts: { heading: "Fraunces", body: "Inter" },
    };
  }

  return {
    background: DEFAULT_BACKGROUND,
    textPrimary: "text-white",
    textSecondary: "text-slate-400",
    accentColor: "sky",
    fonts: MOCK_FONT_STACK,
  };
};

const createHeroSource = () => `
export default function HeroSection({ content }) {
  return (
    <section className="px-6 py-20 md:px-10">
      <div className="mx-auto max-w-6xl rounded-[32px] border border-white/10 bg-white/[0.04] p-10 shadow-[0_30px_80px_rgba(0,0,0,0.28)] backdrop-blur-xl md:p-14">
        <p className="mb-4 text-xs uppercase tracking-[0.24em] text-sky-300">{content.eyebrow}</p>
        <h1 className="mb-4 max-w-4xl text-4xl font-semibold text-white md:text-6xl">{content.ownerName}</h1>
        <p className="mb-5 max-w-3xl text-xl text-white/85 md:text-2xl">{content.title}</p>
        <p className="max-w-3xl text-base leading-8 text-white/60">{content.subtitle}</p>
      </div>
    </section>
  );
}
`;

const createAboutSource = () => `
export default function AboutSection({ content }) {
  return (
    <section className="px-6 py-6 md:px-10">
      <div className="mx-auto max-w-6xl rounded-[28px] border border-white/10 bg-slate-950/65 p-8 md:p-10">
        <div className="grid gap-8 md:grid-cols-[1fr_1.4fr]">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-sky-300">About</p>
            <h2 className="mt-3 text-2xl font-semibold text-white md:text-3xl">{content.heading}</h2>
          </div>
          <p className="text-base leading-8 text-white/65">{content.body}</p>
        </div>
      </div>
    </section>
  );
}
`;

const createHighlightsSource = () => `
export default function HighlightsSection({ content }) {
  return (
    <section className="px-6 py-6 pb-16 md:px-10">
      <div className="mx-auto max-w-6xl rounded-[28px] border border-white/10 bg-white/[0.03] p-8 md:p-10">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-sky-300">Highlights</p>
            <h2 className="mt-3 text-2xl font-semibold text-white md:text-3xl">{content.heading}</h2>
          </div>
          <p className="max-w-xl text-sm leading-7 text-white/50">{content.caption}</p>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {content.items.map((item, index) => (
            <article key={index} className="rounded-2xl border border-sky-400/15 bg-sky-400/5 p-5">
              <div className="mb-3 text-xs uppercase tracking-[0.18em] text-sky-200/80">Block {index + 1}</div>
              <p className="text-sm leading-7 text-white/80">{item}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
`;

export const createMockSections = ({
  ownerName = "Demo Creator",
  prompt,
}: {
  ownerName?: string;
  prompt?: string | null;
} = {}): SectionDTO[] => {
  const promptLine = prompt?.trim()
    ? `Mock direction: ${toSentence(prompt)}.`
    : "Mock direction: clean, product-minded, and easy to scan.";

  return [
    {
      sectionKey: "hero",
      title: "Hero",
      orderIndex: 0,
      contentJson: {
        eyebrow: "Front-End-Only Template",
        ownerName,
        title: "Portfolio template preview",
        subtitle:
          `${promptLine} This experience is generated locally without backend portfolio services.`,
      },
      reactSource: createHeroSource(),
    },
    {
      sectionKey: "about",
      title: "About",
      orderIndex: 1,
      contentJson: {
        heading: "Built for the mock migration",
        body:
          "The original portfolio generation flow has been replaced with deterministic placeholder sections. This keeps the product navigable while backend portfolio creation, refinement, export, and publishing services are removed.",
      },
      reactSource: createAboutSource(),
    },
    {
      sectionKey: "highlights",
      title: "Highlights",
      orderIndex: 2,
      contentJson: {
        heading: "What this demo still supports",
        caption:
          "Supabase auth and session middleware remain intact. The rest of the portfolio experience is represented with local templates and scripted interactions.",
        items: [
          "Template-first previews with stable placeholder content",
          "Local-only review, style, publish, and export flows",
          "Predictable demo state that does not depend on deleted APIs",
        ],
      },
      reactSource: createHighlightsSource(),
    },
  ];
};

export const createMockPortfolioSnapshot = ({
  portfolioId,
  templateId,
  prompt,
}: {
  portfolioId?: string | null;
  templateId?: string | null;
  prompt?: string | null;
}) => {
  const normalizedId = portfolioId?.trim() || "mock-portfolio";
  const ownerName = toTitleCase(normalizedId.replace(/^mock-/, "").replace(/-/g, " "));

  return {
    templateId: templateId ?? "developer-dark",
    sections: createMockSections({ ownerName, prompt }),
    globalTheme: createMockGlobalTheme(templateId),
  };
};

export const createMockVersions = (portfolioId: string | null): Version[] => {
  const seed = slugify(portfolioId || "demo");

  return [
    {
      id: `${seed}-v1`,
      created_at: "2026-03-18T09:10:00.000Z",
      assistant_message: "Initial mock portfolio assembled from the base template.",
      prompt_used: "Generate a clean portfolio structure.",
      preview_url: null,
      is_active: false,
    },
    {
      id: `${seed}-v2`,
      created_at: "2026-03-24T15:40:00.000Z",
      assistant_message: "Adjusted spacing and rewrote the summary area.",
      prompt_used: "Make it feel more editorial and premium.",
      preview_url: null,
      is_active: false,
    },
    {
      id: `${seed}-v3`,
      created_at: "2026-03-29T11:05:00.000Z",
      assistant_message: "Current active mock revision with stronger highlight cards.",
      prompt_used: "Increase hierarchy and visual contrast.",
      preview_url: null,
      is_active: true,
    },
  ];
};

export const buildMockRefinePlan = (
  prompt: string,
  sections: SectionDTO[] | null,
): { planSummary: string; sectionPlans: SectionPlan[] } => {
  const summaryPrompt = prompt.trim() || "Refine the current portfolio";
  const availableSections = sections ?? [];

  const sectionPlans: SectionPlan[] = availableSections.slice(0, 2).map((section, index) => ({
    sectionKey: section.sectionKey,
    action: "modify",
    instruction:
      index === 0
        ? `Update this section so it reflects: ${summaryPrompt}.`
        : "Tighten the copy and align it with the new direction.",
    rationale: "Keeps the template responsive to the mock conversation without relying on backend generation.",
    intensity: index === 0 ? "STRONG" : "MEDIUM",
    preserveElements: ["overall layout", "responsive structure"],
  }));

  if (availableSections.length < 3) {
    sectionPlans.push({
      sectionKey: "highlights",
      action: "add",
      instruction: "Add a supporting highlight block that reinforces the new narrative.",
      rationale: "Demonstrates a visible change in the demo flow.",
      intensity: "LIGHT",
      preserveElements: [],
      newSectionTitle: "Highlights",
    });
  }

  return {
    planSummary: `Mock plan ready. I would reshape the portfolio around "${summaryPrompt}" while keeping the template structure intact.`,
    sectionPlans,
  };
};

export const applyMockRefinement = ({
  sections,
  prompt,
}: {
  sections: SectionDTO[] | null;
  prompt: string;
}): { sections: SectionDTO[]; globalTheme: GlobalTheme } => {
  const snapshot = createMockPortfolioSnapshot({ prompt });
  const baseSections = sections && sections.length > 0 ? sections : snapshot.sections;
  const direction = toSentence(prompt || "Refined demo presentation");

  const nextSections = baseSections.map((section) => {
    if (section.sectionKey === "hero") {
      return {
        ...section,
        contentJson: {
          ...(section.contentJson as Record<string, unknown>),
          title: direction,
          subtitle:
            `This portfolio is showing a local mock refinement pass. ${direction} is applied without backend generation.`,
        },
      };
    }

    if (section.sectionKey === "about") {
      return {
        ...section,
        contentJson: {
          ...(section.contentJson as Record<string, unknown>),
          body:
            `The refine flow is now scripted. Latest request: ${direction}. The UI updates locally so the step remains demonstrable during the backend removal.`,
        },
      };
    }

    if (section.sectionKey === "highlights") {
      return {
        ...section,
        contentJson: {
          ...(section.contentJson as Record<string, unknown>),
          items: [
            `Narrative updated around: ${direction}`,
            "Sections refreshed locally in the browser",
            "No portfolio refinement API call required",
          ],
        },
      };
    }

    return section;
  });

  return {
    sections: nextSections,
    globalTheme: snapshot.globalTheme,
  };
};

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");

export const buildMockPortfolioExportHtml = ({
  title,
  sections,
  globalTheme,
}: {
  title: string;
  sections: SectionDTO[];
  globalTheme?: GlobalTheme | null;
}) => {
  const theme = globalTheme ?? createMockGlobalTheme();
  const body = sections
    .slice()
    .sort((a, b) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0))
    .map((section) => {
      const content =
        typeof section.contentJson === "string"
          ? section.contentJson
          : JSON.stringify(section.contentJson, null, 2);

      return `
        <section class="panel">
          <p class="eyebrow">${escapeHtml(section.sectionKey)}</p>
          <h2>${escapeHtml(section.title || toTitleCase(section.sectionKey))}</h2>
          <pre>${escapeHtml(content)}</pre>
        </section>
      `;
    })
    .join("\n");

  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${escapeHtml(title)}</title>
    <style>
      :root {
        color-scheme: dark;
        --bg: #020617;
        --panel: rgba(15, 23, 42, 0.8);
        --line: rgba(148, 163, 184, 0.18);
        --text: #e2e8f0;
        --muted: #94a3b8;
      }
      * { box-sizing: border-box; }
      body {
        margin: 0;
        font-family: "${theme.fonts?.body || "Inter"}", sans-serif;
        background: radial-gradient(circle at top right, rgba(56,189,248,0.18), transparent 28%), radial-gradient(circle at bottom left, rgba(14,165,233,0.16), transparent 32%), var(--bg);
        color: var(--text);
      }
      main { max-width: 1080px; margin: 0 auto; padding: 64px 20px 96px; }
      .hero, .panel {
        border: 1px solid var(--line);
        background: var(--panel);
        border-radius: 28px;
        padding: 28px;
        backdrop-filter: blur(14px);
        box-shadow: 0 30px 80px rgba(2, 8, 23, 0.35);
      }
      .hero { margin-bottom: 24px; }
      .stack { display: grid; gap: 20px; }
      .eyebrow {
        margin: 0 0 10px;
        font-size: 12px;
        letter-spacing: 0.18em;
        text-transform: uppercase;
        color: #7dd3fc;
      }
      h1, h2, p, pre { margin: 0; }
      h1 { font-size: clamp(2.4rem, 5vw, 4.4rem); margin-bottom: 12px; }
      h2 { font-size: 1.5rem; margin-bottom: 14px; }
      .note { margin-top: 14px; color: #cbd5e1; line-height: 1.7; }
      pre {
        white-space: pre-wrap;
        word-break: break-word;
        color: var(--muted);
        line-height: 1.7;
        font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
      }
    </style>
  </head>
  <body>
    <main>
      <section class="hero">
        <p class="eyebrow">Mock Export</p>
        <h1>${escapeHtml(title)}</h1>
        <p class="note">This HTML file is generated locally from mock section data. No backend export pipeline is used.</p>
      </section>
      <div class="stack">
        ${body}
      </div>
    </main>
  </body>
</html>`;
};
