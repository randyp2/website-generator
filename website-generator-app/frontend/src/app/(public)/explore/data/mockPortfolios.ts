export type GigRole =
  | "Designer"
  | "Developer"
  | "Photographer"
  | "Writer"
  | "Marketer"
  | "Virtual Assistant"
  | "Coach"
  | "Video Editor";

export type GigPlatform =
  | "Upwork"
  | "Fiverr"
  | "Freelancer"
  | "Contra"
  | "LinkedIn"
  | "Dribbble"
  | "Behance";

export interface MockPortfolio {
  id: string;
  title: string;
  description: string;
  uploaderName: string;
  uploaderRole: GigRole;
  platform: GigPlatform;
  tags: string[];
  theme: "minimal" | "bold" | "editorial" | "dark" | "playful";
  likes: number;
  createdAt: string;
  previewStyle: {
    start: string;
    end: string;
    accent: string;
    pattern: "grid" | "mesh" | "noise";
  };
}

export const ROLE_FILTERS: GigRole[] = [
  "Designer",
  "Developer",
  "Photographer",
  "Writer",
  "Marketer",
  "Virtual Assistant",
  "Coach",
  "Video Editor",
];

export const PLATFORM_FILTERS: GigPlatform[] = [
  "Upwork",
  "Fiverr",
  "Freelancer",
  "Contra",
  "LinkedIn",
  "Dribbble",
  "Behance",
];

export const MOCK_PORTFOLIOS: MockPortfolio[] = [
  {
    id: "pf-001",
    title: "Remote Product Design Studio",
    description: "Conversion-focused product design snapshots and case studies.",
    uploaderName: "Nina Carter",
    uploaderRole: "Designer",
    platform: "Dribbble",
    tags: ["saas", "ui", "figma", "ux audit"],
    theme: "editorial",
    likes: 238,
    createdAt: "2026-01-28",
    previewStyle: { start: "#102a43", end: "#2c7a7b", accent: "#5eead4", pattern: "grid" },
  },
  {
    id: "pf-002",
    title: "Indie Full Stack Portfolio",
    description: "Full-cycle app builds, API work, and deployment walkthroughs.",
    uploaderName: "Arjun Patel",
    uploaderRole: "Developer",
    platform: "Upwork",
    tags: ["nextjs", "node", "postgres", "cloud"],
    theme: "minimal",
    likes: 198,
    createdAt: "2026-02-06",
    previewStyle: { start: "#0f172a", end: "#1d4ed8", accent: "#60a5fa", pattern: "mesh" },
  },
  {
    id: "pf-003",
    title: "Food Brand Visual Storytelling",
    description: "Editorial campaigns and launch visuals for local food brands.",
    uploaderName: "Elena Brooks",
    uploaderRole: "Photographer",
    platform: "Behance",
    tags: ["food", "brand", "retouching", "studio"],
    theme: "playful",
    likes: 151,
    createdAt: "2025-12-20",
    previewStyle: { start: "#7c2d12", end: "#f97316", accent: "#fdba74", pattern: "noise" },
  },
  {
    id: "pf-004",
    title: "B2B Ghostwriting Hub",
    description: "Long-form thought leadership and founder newsletter samples.",
    uploaderName: "Sofia Meyers",
    uploaderRole: "Writer",
    platform: "LinkedIn",
    tags: ["ghostwriting", "newsletter", "tech", "b2b"],
    theme: "minimal",
    likes: 123,
    createdAt: "2026-02-02",
    previewStyle: { start: "#1f2937", end: "#374151", accent: "#d1d5db", pattern: "grid" },
  },
  {
    id: "pf-005",
    title: "Paid Ads Performance Deck",
    description: "Before/after growth snapshots for ecommerce ad accounts.",
    uploaderName: "Mia Lopez",
    uploaderRole: "Marketer",
    platform: "Fiverr",
    tags: ["meta ads", "google ads", "funnels", "roas"],
    theme: "bold",
    likes: 187,
    createdAt: "2026-01-17",
    previewStyle: { start: "#064e3b", end: "#10b981", accent: "#34d399", pattern: "mesh" },
  },
  {
    id: "pf-006",
    title: "Operations Assistant Showcase",
    description: "Inbox management, scheduling systems, and automation SOPs.",
    uploaderName: "Jordan Bell",
    uploaderRole: "Virtual Assistant",
    platform: "Freelancer",
    tags: ["ops", "crm", "notion", "airtable"],
    theme: "editorial",
    likes: 89,
    createdAt: "2025-12-08",
    previewStyle: { start: "#27272a", end: "#52525b", accent: "#a1a1aa", pattern: "grid" },
  },
  {
    id: "pf-007",
    title: "Executive Coaching Outcomes",
    description: "Leadership workshops and measurable coaching outcomes.",
    uploaderName: "Riley Grant",
    uploaderRole: "Coach",
    platform: "LinkedIn",
    tags: ["leadership", "team coaching", "workshop"],
    theme: "minimal",
    likes: 134,
    createdAt: "2026-02-09",
    previewStyle: { start: "#083344", end: "#0891b2", accent: "#67e8f9", pattern: "mesh" },
  },
  {
    id: "pf-008",
    title: "Short-Form Video Reel",
    description: "Reels and TikTok edits optimized for retention and hooks.",
    uploaderName: "Theo Kim",
    uploaderRole: "Video Editor",
    platform: "Contra",
    tags: ["reels", "tiktok", "captions", "ugc"],
    theme: "dark",
    likes: 261,
    createdAt: "2026-01-31",
    previewStyle: { start: "#111827", end: "#7c3aed", accent: "#a78bfa", pattern: "noise" },
  },
  {
    id: "pf-009",
    title: "Webflow Conversion Portfolio",
    description: "Landing page redesigns with measurable lead improvements.",
    uploaderName: "Ben Owens",
    uploaderRole: "Designer",
    platform: "Upwork",
    tags: ["webflow", "landing page", "conversion"],
    theme: "bold",
    likes: 176,
    createdAt: "2026-01-05",
    previewStyle: { start: "#082f49", end: "#0284c7", accent: "#38bdf8", pattern: "grid" },
  },
  {
    id: "pf-010",
    title: "AI Workflow Engineering",
    description: "Prompt systems and API automations for lean product teams.",
    uploaderName: "Chris Walker",
    uploaderRole: "Developer",
    platform: "Contra",
    tags: ["automation", "llm", "agent", "typescript"],
    theme: "dark",
    likes: 209,
    createdAt: "2026-02-10",
    previewStyle: { start: "#172554", end: "#4f46e5", accent: "#818cf8", pattern: "mesh" },
  },
  {
    id: "pf-011",
    title: "Lifestyle Product Photography",
    description: "Natural light catalog shoots for DTC product listings.",
    uploaderName: "Harper Lane",
    uploaderRole: "Photographer",
    platform: "Fiverr",
    tags: ["dtc", "catalog", "lifestyle"],
    theme: "playful",
    likes: 145,
    createdAt: "2026-01-14",
    previewStyle: { start: "#78350f", end: "#d97706", accent: "#fbbf24", pattern: "noise" },
  },
  {
    id: "pf-012",
    title: "Startup Launch Copy Vault",
    description: "Homepage copy systems and conversion-first product messaging.",
    uploaderName: "Avery Stone",
    uploaderRole: "Writer",
    platform: "Upwork",
    tags: ["copywriting", "landing", "messaging"],
    theme: "editorial",
    likes: 112,
    createdAt: "2025-11-30",
    previewStyle: { start: "#312e81", end: "#7c3aed", accent: "#c4b5fd", pattern: "grid" },
  },
  {
    id: "pf-013",
    title: "Creator Brand Growth Lab",
    description: "Audience growth strategy and weekly content sprint reports.",
    uploaderName: "Dani Reid",
    uploaderRole: "Marketer",
    platform: "LinkedIn",
    tags: ["growth", "content", "social"],
    theme: "playful",
    likes: 167,
    createdAt: "2026-02-01",
    previewStyle: { start: "#14532d", end: "#22c55e", accent: "#86efac", pattern: "mesh" },
  },
  {
    id: "pf-014",
    title: "Client Support Systems",
    description: "Service backoffice setup for founders scaling past 10 clients.",
    uploaderName: "Leah Price",
    uploaderRole: "Virtual Assistant",
    platform: "Upwork",
    tags: ["support", "admin", "systems"],
    theme: "minimal",
    likes: 96,
    createdAt: "2025-12-27",
    previewStyle: { start: "#1f2937", end: "#4b5563", accent: "#9ca3af", pattern: "grid" },
  },
  {
    id: "pf-015",
    title: "Founder Clarity Coaching",
    description: "Decision-making frameworks for solo founders under pressure.",
    uploaderName: "Samir Holt",
    uploaderRole: "Coach",
    platform: "Freelancer",
    tags: ["mindset", "founders", "strategy"],
    theme: "editorial",
    likes: 104,
    createdAt: "2026-01-21",
    previewStyle: { start: "#083344", end: "#155e75", accent: "#22d3ee", pattern: "noise" },
  },
  {
    id: "pf-016",
    title: "Podcast Video Repackaging",
    description: "Long-form episodes transformed into high-performing short clips.",
    uploaderName: "Kai Romero",
    uploaderRole: "Video Editor",
    platform: "Fiverr",
    tags: ["podcast", "shorts", "editing"],
    theme: "bold",
    likes: 219,
    createdAt: "2026-02-11",
    previewStyle: { start: "#3f1d64", end: "#9333ea", accent: "#c084fc", pattern: "mesh" },
  },
  {
    id: "pf-017",
    title: "SaaS UI Systems Portfolio",
    description: "Design systems and reusable UI kit breakdowns for product teams.",
    uploaderName: "Noah Vega",
    uploaderRole: "Designer",
    platform: "Behance",
    tags: ["design system", "saas", "ui"],
    theme: "dark",
    likes: 192,
    createdAt: "2026-01-25",
    previewStyle: { start: "#0f172a", end: "#334155", accent: "#94a3b8", pattern: "mesh" },
  },
  {
    id: "pf-018",
    title: "Backend Reliability Portfolio",
    description: "API resilience and observability upgrades for startup stacks.",
    uploaderName: "Priya Shah",
    uploaderRole: "Developer",
    platform: "Freelancer",
    tags: ["backend", "sre", "kubernetes"],
    theme: "minimal",
    likes: 158,
    createdAt: "2026-02-04",
    previewStyle: { start: "#0b3b66", end: "#2563eb", accent: "#93c5fd", pattern: "grid" },
  },
  {
    id: "pf-019",
    title: "Campaign Photography Vault",
    description: "Seasonal photo campaigns for fashion ecommerce brands.",
    uploaderName: "Olivia Tran",
    uploaderRole: "Photographer",
    platform: "Upwork",
    tags: ["fashion", "campaign", "lookbook"],
    theme: "editorial",
    likes: 141,
    createdAt: "2026-01-11",
    previewStyle: { start: "#4c0519", end: "#be123c", accent: "#fb7185", pattern: "noise" },
  },
  {
    id: "pf-020",
    title: "Niche Authority Content",
    description: "SEO-driven content clusters with clear topical authority maps.",
    uploaderName: "Tyler Quinn",
    uploaderRole: "Writer",
    platform: "Contra",
    tags: ["seo", "content strategy", "research"],
    theme: "minimal",
    likes: 128,
    createdAt: "2026-01-08",
    previewStyle: { start: "#134e4a", end: "#0d9488", accent: "#5eead4", pattern: "grid" },
  },
];
