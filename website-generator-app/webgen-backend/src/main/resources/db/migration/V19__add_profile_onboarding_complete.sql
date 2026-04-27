-- Explicit onboarding lifecycle flag for gated app flows.
-- Existing rows with a resolved username are treated as onboarded.

ALTER TABLE public.profiles
    ADD COLUMN onboarding_complete boolean DEFAULT false NOT NULL;

UPDATE public.profiles
SET onboarding_complete = true
WHERE username IS NOT NULL;

COMMENT ON COLUMN public.profiles.onboarding_complete IS
    'Whether the user has completed required onboarding steps.';
