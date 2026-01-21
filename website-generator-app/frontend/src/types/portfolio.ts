export interface SectionDTO {
  sectionKey: string;
  title?: string;
  orderIndex?: number;
  contentJson: unknown;
  reactSource: string;
}

export interface GlobalTheme {
  background: string;      // Tailwind classes: "bg-gradient-to-b from-slate-900 to-slate-800"
  textPrimary: string;     // "text-white"
  textSecondary: string;   // "text-slate-400"
  accentColor: string;     // "purple"
}
