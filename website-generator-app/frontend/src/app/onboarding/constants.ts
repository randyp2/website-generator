export const USERNAME_PATTERN = /^[a-z0-9][a-z0-9-]{1,30}[a-z0-9]$/;
export const BIO_MAX_LENGTH = 500;
export const USERNAME_DEBOUNCE_MS = 350;

export const ONBOARDING_STEPS = [
    {
        key: "basics",
        title: "The basics",
        description: "Pick your username and tell us your name.",
    },
    {
        key: "background",
        title: "Background",
        description: "Where you study or work — all optional.",
    },
    {
        key: "links",
        title: "Links & bio",
        description: "Connect your presence and add a short intro.",
    },
] as const;
