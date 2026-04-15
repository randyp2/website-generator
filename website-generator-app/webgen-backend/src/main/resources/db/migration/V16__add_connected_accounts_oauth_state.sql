-- Step 1 OAuth connect foundation: persist transient OAuth state.

ALTER TABLE public.connected_accounts
    ADD COLUMN oauth_state text,
    ADD COLUMN oauth_state_expires_at timestamp with time zone;

ALTER TABLE public.connected_accounts
    ADD CONSTRAINT connected_accounts_oauth_state_not_blank
        CHECK (oauth_state IS NULL OR btrim(oauth_state) <> ''::text);

CREATE INDEX connected_accounts_oauth_state_idx
    ON public.connected_accounts USING btree (oauth_state)
    WHERE oauth_state IS NOT NULL;

COMMENT ON COLUMN public.connected_accounts.oauth_state IS
    'Provider OAuth CSRF state used during connect handshake.';
COMMENT ON COLUMN public.connected_accounts.oauth_state_expires_at IS
    'Expiry timestamp for oauth_state validation.';
