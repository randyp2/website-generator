ALTER TABLE public.portfolios
    ADD COLUMN IF NOT EXISTS refine_chat_history jsonb DEFAULT '[]'::jsonb NOT NULL;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'portfolios_refine_chat_history_is_array'
    ) THEN
        ALTER TABLE public.portfolios
            ADD CONSTRAINT portfolios_refine_chat_history_is_array
            CHECK (jsonb_typeof(refine_chat_history) = 'array'::text);
    END IF;
END $$;
