-- Phase 6 foundation: connected account lifecycle storage.
-- Stores provider identity + encrypted token material per user/provider pair.

CREATE TABLE public.connected_accounts (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    profile_id uuid NOT NULL,
    provider text NOT NULL,
    provider_user_id text,
    status text DEFAULT 'pending'::text NOT NULL,
    scopes text[] DEFAULT ARRAY[]::text[] NOT NULL,
    access_token_encrypted text,
    refresh_token_encrypted text,
    access_token_expires_at timestamp with time zone,
    refresh_token_expires_at timestamp with time zone,
    last_synced_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT connected_accounts_pkey PRIMARY KEY (id),
    CONSTRAINT connected_accounts_profile_id_fkey
        FOREIGN KEY (profile_id) REFERENCES public.profiles(id) ON DELETE CASCADE,
    CONSTRAINT connected_accounts_profile_provider_key UNIQUE (profile_id, provider),
    CONSTRAINT connected_accounts_provider_not_blank
        CHECK (btrim(provider) <> ''::text),
    CONSTRAINT connected_accounts_status_check
        CHECK (status = ANY (ARRAY[
            'connected'::text,
            'disconnected'::text,
            'expired'::text,
            'pending'::text
        ])),
    CONSTRAINT connected_accounts_provider_user_id_not_blank
        CHECK (provider_user_id IS NULL OR btrim(provider_user_id) <> ''::text),
    CONSTRAINT connected_accounts_access_token_not_blank
        CHECK (access_token_encrypted IS NULL OR btrim(access_token_encrypted) <> ''::text),
    CONSTRAINT connected_accounts_refresh_token_not_blank
        CHECK (refresh_token_encrypted IS NULL OR btrim(refresh_token_encrypted) <> ''::text)
);

CREATE INDEX connected_accounts_profile_id_idx
    ON public.connected_accounts USING btree (profile_id);

CREATE INDEX connected_accounts_profile_status_idx
    ON public.connected_accounts USING btree (profile_id, status);

ALTER TABLE public.connected_accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert own connected accounts"
    ON public.connected_accounts
    FOR INSERT
    WITH CHECK (auth.uid() = profile_id);

CREATE POLICY "Users can view own connected accounts"
    ON public.connected_accounts
    FOR SELECT
    USING (auth.uid() = profile_id);

CREATE POLICY "Users can update own connected accounts"
    ON public.connected_accounts
    FOR UPDATE
    USING (auth.uid() = profile_id)
    WITH CHECK (auth.uid() = profile_id);

CREATE POLICY "Users can delete own connected accounts"
    ON public.connected_accounts
    FOR DELETE
    USING (auth.uid() = profile_id);

COMMENT ON TABLE public.connected_accounts IS
    'Connected external provider accounts for verification evidence ingestion.';
COMMENT ON COLUMN public.connected_accounts.provider IS
    'Provider key (for example github or linkedin).';
COMMENT ON COLUMN public.connected_accounts.scopes IS
    'Granted OAuth scopes captured at connect time.';
COMMENT ON COLUMN public.connected_accounts.access_token_encrypted IS
    'Encrypted provider access token; plaintext must never be stored.';
COMMENT ON COLUMN public.connected_accounts.refresh_token_encrypted IS
    'Encrypted provider refresh token; plaintext must never be stored.';
