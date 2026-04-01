import { useCallback, useEffect, useMemo } from "react";

import { usePortfolioStore } from "@/stores/usePortfolioStore";
import type { Message } from "@/types/preview";
import type { StylePreferences } from "@/types/style";

type MockStyleStep = {
  id: string;
  question: string;
  acknowledgement: string;
  suggestions: string[];
  preferenceUpdate?: Partial<StylePreferences>;
};

const MOCK_STYLE_STEPS: MockStyleStep[] = [
  {
    id: "theme",
    question:
      "Question 1 of 10: What overall vibe should the portfolio have?",
    acknowledgement:
      "Noted. This mock chat is using a scripted response, so I am not interpreting your answer deeply, but I will carry a strong overall direction into the next step.",
    suggestions: ["Clean and minimal", "Bold and high-contrast", "Editorial and polished"],
    preferenceUpdate: {
      visualStyle: "Scripted mock direction",
    },
  },
  {
    id: "audience",
    question:
      "Question 2 of 10: Who is the main audience for this portfolio?",
    acknowledgement:
      "Got it. In this nonfunctional mockup, I’m just stepping through a fixed questionnaire to simulate the style-planning flow.",
    suggestions: ["Recruiters", "Clients", "Creative directors"],
  },
  {
    id: "tone",
    question:
      "Question 3 of 10: What tone should the writing and presentation have?",
    acknowledgement:
      "Tone captured for the mock flow. I’ll keep the conversation moving with the next predetermined question.",
    suggestions: ["Professional", "Friendly", "Confident and sharp"],
    preferenceUpdate: {
      tone: "Mock-selected tone",
    },
  },
  {
    id: "color",
    question:
      "Question 4 of 10: What kind of color mood do you want?",
    acknowledgement:
      "Color direction logged. This is still a scripted mock response and does not generate real palettes.",
    suggestions: ["Muted neutrals", "Warm accents", "Dark cinematic"],
    preferenceUpdate: {
      colorScheme: "Mock color palette",
    },
  },
  {
    id: "layout",
    question:
      "Question 5 of 10: Should the layout feel spacious or content-dense?",
    acknowledgement:
      "Layout preference noted. The mock flow keeps this high level and moves on to the next prompt.",
    suggestions: ["Open and spacious", "Balanced", "Dense and information-rich"],
    preferenceUpdate: {
      layoutDensity: "Mock layout density",
      whitespace: "Mock spacing preference",
    },
  },
  {
    id: "typography",
    question:
      "Question 6 of 10: What kind of typography feels right?",
    acknowledgement:
      "Typography preference saved in the mock state. No real font system is being applied here.",
    suggestions: ["Modern sans-serif", "Editorial serif mix", "Mono accents"],
    preferenceUpdate: {
      typography: "Mock typography pairing",
    },
  },
  {
    id: "imagery",
    question:
      "Question 7 of 10: What role should imagery or visuals play?",
    acknowledgement:
      "Visual treatment noted. In this demo, I’m acknowledging the answer without generating assets or layouts.",
    suggestions: ["Minimal imagery", "Project screenshots", "Art-directed visuals"],
    preferenceUpdate: {
      imageryStyle: "Mock imagery style",
    },
  },
  {
    id: "motion",
    question:
      "Question 8 of 10: How much animation should the site use?",
    acknowledgement:
      "Animation preference recorded. This remains a fixed-response mockup rather than a live style engine.",
    suggestions: ["Almost none", "Subtle motion", "Bold reveals"],
    preferenceUpdate: {
      animationStyle: "Mock motion style",
      interactiveElements: "Mock interaction style",
    },
  },
  {
    id: "emphasis",
    question:
      "Question 9 of 10: Which section should be the strongest visual focus?",
    acknowledgement:
      "Section emphasis captured. I’ll use one more scripted question and then wrap with a mock summary.",
    suggestions: ["Hero section", "Projects", "About and story"],
    preferenceUpdate: {
      sectionEmphasis: "Mock section priority",
    },
  },
  {
    id: "differentiator",
    question:
      "Question 10 of 10: What should make this portfolio feel memorable?",
    acknowledgement:
      "Thanks. That completes the scripted questionnaire. I’ll finish with a mock style summary so you can continue the flow.",
    suggestions: ["Strong storytelling", "Premium polish", "Technical credibility"],
  },
];

const buildIntroMessage = (): Message => ({
  id: "style-assistant-intro",
  role: "ai",
  content:
    [
      "**Mock style chat**",
      "This is a nonfunctional mockup with fixed responses and no backend processing.",
      "",
      MOCK_STYLE_STEPS[0].question,
    ].join("\n"),
  timestamp: new Date(),
  suggestions: MOCK_STYLE_STEPS[0].suggestions,
});

const EMPTY_STYLE_PREFERENCES: StylePreferences = {
  colorScheme: null,
  layoutDensity: null,
  tone: null,
  visualStyle: null,
  sectionEmphasis: null,
  typography: null,
  animationStyle: null,
  whitespace: null,
  imageryStyle: null,
  interactiveElements: null,
  customNotes: "",
};

const buildStepReply = (
  stepIndex: number,
  stylePreferences: StylePreferences,
): Message => {
  const currentStep = MOCK_STYLE_STEPS[stepIndex];
  const nextStep = MOCK_STYLE_STEPS[stepIndex + 1];

  if (!currentStep) {
    return {
      id: `style-complete-${Date.now()}`,
      role: "ai",
      content:
        "The mock style chat is already complete. You can continue to the next step whenever you’re ready.",
      timestamp: new Date(),
      isStyleComplete: true,
      stylePreferences,
    };
  }

  if (!nextStep) {
    return {
      id: `style-complete-${Date.now()}`,
      role: "ai",
      content: [
        currentStep.acknowledgement,
        "",
        "**Mock summary**",
        "This nonfunctional demo now has enough placeholder style input to continue to the upload flow.",
      ].join("\n"),
      timestamp: new Date(),
      isStyleComplete: true,
      stylePreferences,
    };
  }

  return {
    id: `style-ai-${Date.now()}`,
    role: "ai",
    content: [currentStep.acknowledgement, "", nextStep.question].join("\n"),
    timestamp: new Date(),
    suggestions: nextStep.suggestions,
  };
};

function mergeStylePreferences(
  current: StylePreferences,
  incoming: Partial<StylePreferences>,
): StylePreferences {
  return {
    colorScheme: incoming.colorScheme ?? current.colorScheme,
    layoutDensity: incoming.layoutDensity ?? current.layoutDensity,
    tone: incoming.tone ?? current.tone,
    visualStyle: incoming.visualStyle ?? current.visualStyle,
    sectionEmphasis: incoming.sectionEmphasis ?? current.sectionEmphasis,
    typography: incoming.typography ?? current.typography,
    animationStyle: incoming.animationStyle ?? current.animationStyle,
    whitespace: incoming.whitespace ?? current.whitespace,
    imageryStyle: incoming.imageryStyle ?? current.imageryStyle,
    interactiveElements: incoming.interactiveElements ?? current.interactiveElements,
    customNotes: incoming.customNotes?.trim() || current.customNotes,
  };
}

export function useStyleChat(params: {
  portfolioId: string | null;
  templateId: string | null;
}) {
  const { portfolioId, templateId } = params;

  const {
    setTemplateId,
    setPortfolioId,
    styleMessages,
    stylePreferences,
    setStyleMessages,
    setStylePreferences,
    isSendingStyle,
    setIsSendingStyle,
  } = usePortfolioStore();

  useEffect(() => {
    if (templateId) {
      setTemplateId(templateId);
    }
    if (portfolioId) {
      setPortfolioId(portfolioId);
    }
  }, [portfolioId, setPortfolioId, setTemplateId, templateId]);

  useEffect(() => {
    setStyleMessages([buildIntroMessage()]);
    setStylePreferences(EMPTY_STYLE_PREFERENCES);
    setIsSendingStyle(false);
  }, [setIsSendingStyle, setStyleMessages, setStylePreferences]);

  const normalizedStyleMessages = useMemo(
    () =>
      styleMessages.map((message) => ({
        ...message,
        timestamp:
          message.timestamp instanceof Date
            ? message.timestamp
            : new Date(message.timestamp),
      })),
    [styleMessages],
  );

  const handleSend = useCallback(
    async (prompt: string) => {
      const trimmedPrompt = prompt.trim();
      if (!trimmedPrompt) return;

      const answeredCount = styleMessages.filter((message) => message.role === "user").length;
      if (answeredCount >= MOCK_STYLE_STEPS.length) {
        setStyleMessages((prev) => [
          ...prev,
          {
            id: `style-user-${Date.now()}`,
            role: "user",
            content: trimmedPrompt,
            timestamp: new Date(),
          },
          {
            id: `style-ai-repeat-${Date.now()}`,
            role: "ai",
            content:
              "This mock style questionnaire is already finished. Use Continue to move to the next step.",
            timestamp: new Date(),
            isStyleComplete: true,
            stylePreferences,
          },
        ]);
        return;
      }

      const currentStep = MOCK_STYLE_STEPS[answeredCount];
      const nextPreferences = mergeStylePreferences(stylePreferences, {
        ...currentStep.preferenceUpdate,
        customNotes: stylePreferences.customNotes?.trim()
          ? `${stylePreferences.customNotes}\n${trimmedPrompt}`
          : trimmedPrompt,
      });

      setStylePreferences(nextPreferences);
      setIsSendingStyle(true);

      setStyleMessages((prev) => [
        ...prev,
        {
          id: `style-user-${Date.now()}`,
          role: "user",
          content: trimmedPrompt,
          timestamp: new Date(),
        },
      ]);

      window.setTimeout(() => {
        setStyleMessages((prev) => [...prev, buildStepReply(answeredCount, nextPreferences)]);
        setIsSendingStyle(false);
      }, 350);
    },
    [
      setIsSendingStyle,
      setStyleMessages,
      setStylePreferences,
      styleMessages,
      stylePreferences,
    ],
  );

  const handleColorSubmit = useCallback(() => undefined, []);
  const handleFontSubmit = useCallback(() => undefined, []);
  const handleLayoutSubmit = useCallback(() => undefined, []);
  const flushStyleHistorySync = useCallback(async () => undefined, []);

  return {
    normalizedStyleMessages,
    isSending: isSendingStyle,
    showColorPicker: false,
    recommendedColorPresets: [],
    showTypographyPicker: false,
    recommendedHeadingFont: undefined,
    recommendedBodyFont: undefined,
    handleSend,
    handleColorSubmit,
    handleFontSubmit,
    handleLayoutSubmit,
    flushStyleHistorySync,
  };
}
