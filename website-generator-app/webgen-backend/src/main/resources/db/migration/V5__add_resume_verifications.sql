CREATE TABLE public.resume_verifications (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    profile_id uuid NOT NULL,
    raw_file_url text NOT NULL,
    original_file_name text NOT NULL,
    content_type text NOT NULL,
    file_size_bytes bigint NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT resume_verifications_file_size_nonnegative CHECK (file_size_bytes >= 0)
);

ALTER TABLE ONLY public.resume_verifications
    ADD CONSTRAINT resume_verifications_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.resume_verifications
    ADD CONSTRAINT resume_verifications_profile_id_key UNIQUE (profile_id);

ALTER TABLE ONLY public.resume_verifications
    ADD CONSTRAINT resume_verifications_profile_id_fkey
        FOREIGN KEY (profile_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

CREATE INDEX resume_verifications_created_at_idx
    ON public.resume_verifications USING btree (created_at);

ALTER TABLE public.resume_verifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert own resume verifications"
    ON public.resume_verifications
    FOR INSERT
    WITH CHECK (auth.uid() = profile_id);

CREATE POLICY "Users can view own resume verifications"
    ON public.resume_verifications
    FOR SELECT
    USING (auth.uid() = profile_id);

CREATE POLICY "Users can update own resume verifications"
    ON public.resume_verifications
    FOR UPDATE
    USING (auth.uid() = profile_id)
    WITH CHECK (auth.uid() = profile_id);

CREATE POLICY "Users can delete own resume verifications"
    ON public.resume_verifications
    FOR DELETE
    USING (auth.uid() = profile_id);
