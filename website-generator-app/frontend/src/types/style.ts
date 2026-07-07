export interface StylePreferences {
  colorScheme: string | null;
  layoutDensity: string | null;
  tone: string | null;
  visualStyle: string | null;
  sectionEmphasis: string | null;
  typography: string | null;
  animationStyle: string | null;
  whitespace: string | null;
  imageryStyle: string | null;
  interactiveElements: string | null;
  customNotes: string;
}

export interface ColorPresetColors {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  text: string;
  muted: string;
}

export interface ColorPresetRecommendation {
  name: string;
  description: string;
  colors: ColorPresetColors;
}

export interface StyleChatRequest {
  portfolioId: string;
  userMessage?: string;
  colorSelections?: Record<string, string>;
  fontSelections?: Record<string, string>;
  layoutSelection?: string;
}

export interface StyleChatResponse {
  assistantMessage: string;
  questionNumber: number;
  totalQuestions: number;
  isComplete: boolean;
  stylePreferences?: Partial<StylePreferences>;
  showColorPicker?: boolean;
  recommendedColorPresets?: ColorPresetRecommendation[];
  showTypographyPicker?: boolean;
  recommendedHeadingFont?: string;
  recommendedBodyFont?: string;
  suggestions?: string[];
  designTip?: string;
  previewType?: string | null;
  updatedStyleFields?: string[];
}
