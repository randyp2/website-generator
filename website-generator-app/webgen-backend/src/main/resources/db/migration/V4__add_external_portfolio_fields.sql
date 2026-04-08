-- Add additional attribute columns for external portfolios
-- source_type: EXTERNAL | GENERATED
-- external_url: url link to external portfolio
ALTER TABLE public.portfolios
    ADD COLUMN source_type text,
    ADD COLUMN external_url text;

-- Backfill the existing rows to GENERATED (default)
UPDATE public.portfolios
SET source_type = 'GENERATED'
WHERE source_type IS NULL;

-- Enforce defaults/constraints to rows
ALTER TABLE public.portfolios
    ALTER COLUMN source_type SET DEFAULT 'GENERATED',
    ALTER COLUMN source_type SET NOT NULL;

ALTER TABLE public.portfolios
    ADD CONSTRAINT portfolios_source_type_check
        CHECK (source_type IN ('GENERATED', 'EXTERNAL'));

-- External portfolios must have url's
ALTER TABLE public.portfolios
    ADD CONSTRAINT portfolio_external_url_not_null_check
        CHECK (
            source_type <> 'EXTERNAL' -- Then it is generated
            OR (external_url IS NOT NULL AND btrim(external_url) <> '') -- non null
        );
