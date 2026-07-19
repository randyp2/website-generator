-- In-app notifications for engagement events such as portfolio likes,
-- comments, replies, and comment likes.

CREATE TABLE public.notifications (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    recipient_profile_id uuid NOT NULL,
    actor_profile_id uuid,
    type text NOT NULL,
    portfolio_id uuid NOT NULL,
    comment_id uuid,
    dedupe_key text,
    metadata jsonb DEFAULT '{}'::jsonb NOT NULL,
    read_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT notifications_type_check
        CHECK (
            type = ANY (
                ARRAY[
                    'portfolio_liked'::text,
                    'portfolio_commented'::text,
                    'comment_replied'::text,
                    'comment_liked'::text
                ]
            )
        ),
    CONSTRAINT notifications_metadata_object_check
        CHECK (jsonb_typeof(metadata) = 'object'::text),
    CONSTRAINT notifications_dedupe_key_not_blank_check
        CHECK (dedupe_key IS NULL OR btrim(dedupe_key) <> ''::text),
    CONSTRAINT notifications_no_self_actor_check
        CHECK (actor_profile_id IS NULL OR actor_profile_id <> recipient_profile_id),
    CONSTRAINT notifications_target_shape_check
        CHECK (
            (type = 'portfolio_liked'::text AND comment_id IS NULL)
            OR (
                type = ANY (
                    ARRAY[
                        'portfolio_commented'::text,
                        'comment_replied'::text,
                        'comment_liked'::text
                    ]
                )
                AND comment_id IS NOT NULL
            )
        )
);

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_dedupe_key_key UNIQUE (dedupe_key);

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_recipient_profile_id_fkey
        FOREIGN KEY (recipient_profile_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_actor_profile_id_fkey
        FOREIGN KEY (actor_profile_id) REFERENCES public.profiles(id) ON DELETE SET NULL;

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_portfolio_id_fkey
        FOREIGN KEY (portfolio_id) REFERENCES public.portfolios(id) ON DELETE CASCADE;

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_comment_id_fkey
        FOREIGN KEY (comment_id) REFERENCES public.portfolio_comments(id) ON DELETE CASCADE;

CREATE INDEX notifications_recipient_created_at_idx
    ON public.notifications USING btree (recipient_profile_id, created_at DESC);

CREATE INDEX notifications_recipient_unread_idx
    ON public.notifications USING btree (recipient_profile_id, created_at DESC)
    WHERE read_at IS NULL;

CREATE INDEX notifications_actor_created_at_idx
    ON public.notifications USING btree (actor_profile_id, created_at DESC)
    WHERE actor_profile_id IS NOT NULL;

CREATE INDEX notifications_portfolio_created_at_idx
    ON public.notifications USING btree (portfolio_id, created_at DESC);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY notifications_select_own
    ON public.notifications
    FOR SELECT
    USING (recipient_profile_id = auth.uid());

CREATE POLICY notifications_update_own
    ON public.notifications
    FOR UPDATE
    USING (recipient_profile_id = auth.uid())
    WITH CHECK (recipient_profile_id = auth.uid());

CREATE POLICY notifications_delete_own
    ON public.notifications
    FOR DELETE
    USING (recipient_profile_id = auth.uid());

COMMENT ON TABLE public.notifications IS
    'Persistent in-app notifications addressed to profile owners.';
COMMENT ON COLUMN public.notifications.type IS
    'Notification event type. Initial values cover portfolio likes, comments, replies, and comment likes.';
COMMENT ON COLUMN public.notifications.dedupe_key IS
    'Optional idempotency key used to avoid duplicate notifications for the same source event.';
COMMENT ON COLUMN public.notifications.metadata IS
    'Small structured payload for display snapshots and routing context.';
