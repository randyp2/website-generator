-- Add parsed resume data columns to resume_verifications.
-- These store the regex-extracted text and structured JSON from the resume
-- so the verification engine can cross-reference claims against evidence.

ALTER TABLE public.resume_verifications
    ADD COLUMN IF NOT EXISTS extracted_text text;

ALTER TABLE public.resume_verifications
    ADD COLUMN IF NOT EXISTS parsed_json jsonb;
