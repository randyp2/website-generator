import { ParsedResumeData } from "./resume";

export interface StylePreferences {
  colorScheme: string | null;
  layoutDensity: string | null;
  tone: string | null;
  visualStyle: string | null;
  sectionEmphasis: string | null;
  customNotes: string;
}

export interface StyleSuggestion {
  colorScheme: string[];
  layoutDensity: string[];
  tone: string[];
  visualStyle: string[];
  sectionEmphasis: string[];
}

export interface StyleSuggestionsRequest {
  templateId: string;
  resume: ParsedResumeData;
}

export interface StyleSuggestionsResponse {
  success: boolean;
  suggestions: StyleSuggestion;
  fallbackUsed: boolean;
}

export const FALLBACK_STYLE_OPTIONS: StyleSuggestion = {
  colorScheme: ["Professional Blues", "Vibrant Gradients", "Warm Neutrals"],
  layoutDensity: ["Spacious & Minimal", "Balanced", "Content-Rich"],
  tone: ["Professional", "Creative", "Approachable"],
  visualStyle: ["Modern & Clean", "Classic & Timeless", "Bold & Experimental"],
  sectionEmphasis: ["Work Experience", "Projects", "Skills & Expertise"]
};

export const STYLE_QUESTIONS = {
  colorScheme: {
    key: "colorScheme" as const,
    question: "What color palette best represents your professional brand?",
    description: "Choose a color scheme that aligns with your industry and personal style"
  },
  layoutDensity: {
    key: "layoutDensity" as const,
    question: "How much content do you want visible at once?",
    description: "Select the layout density that showcases your work most effectively"
  },
  tone: {
    key: "tone" as const,
    question: "What tone should your portfolio convey?",
    description: "Pick the tone that matches your professional personality"
  },
  visualStyle: {
    key: "visualStyle" as const,
    question: "What visual style appeals to you?",
    description: "Choose a design aesthetic that represents your work"
  },
  sectionEmphasis: {
    key: "sectionEmphasis" as const,
    question: "Which aspect of your background should stand out most?",
    description: "Highlight the section that best showcases your strengths"
  }
};
