-- Engagement foundation for /explore portfolio detail pages.
-- Supports portfolio likes, threaded comments/replies, comment likes,
-- and precomputed counters for explore cards/sidebars.

CREATE TABLE public.portfolio_engagement_counters (
    portfolio_id uuid NOT NULL,
    likes_count integer DEFAULT 0 NOT NULL,
    comments_count integer DEFAULT 0 NOT NULL,
    views_count integer DEFAULT 0 NOT NULL,
    shares_count integer DEFAULT 0 NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT portfolio_engagement_counters_nonnegative
        CHECK (
            likes_count >= 0
            AND comments_count >= 0
            AND views_count >= 0
            AND shares_count >= 0
        )
);

CREATE TABLE public.portfolio_likes (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    portfolio_id uuid NOT NULL,
    profile_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE public.portfolio_comments (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    portfolio_id uuid NOT NULL,
    profile_id uuid NOT NULL,
    parent_comment_id uuid,
    body text NOT NULL,
    status text DEFAULT 'visible'::text NOT NULL,
    likes_count integer DEFAULT 0 NOT NULL,
    replies_count integer DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    CONSTRAINT portfolio_comments_body_not_blank
        CHECK (btrim(body) <> ''::text),
    CONSTRAINT portfolio_comments_body_length
        CHECK (char_length(body) <= 2000),
    CONSTRAINT portfolio_comments_counts_nonnegative
        CHECK (likes_count >= 0 AND replies_count >= 0),
    CONSTRAINT portfolio_comments_status_check
        CHECK (status = ANY (ARRAY['visible'::text, 'hidden'::text, 'deleted'::text])),
    CONSTRAINT portfolio_comments_deleted_at_check
        CHECK (
            (status = 'deleted'::text AND deleted_at IS NOT NULL)
            OR (status <> 'deleted'::text)
        )
);

CREATE TABLE public.portfolio_comment_likes (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    comment_id uuid NOT NULL,
    profile_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE ONLY public.portfolio_engagement_counters
    ADD CONSTRAINT portfolio_engagement_counters_pkey PRIMARY KEY (portfolio_id);

ALTER TABLE ONLY public.portfolio_likes
    ADD CONSTRAINT portfolio_likes_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.portfolio_likes
    ADD CONSTRAINT portfolio_likes_portfolio_profile_key UNIQUE (portfolio_id, profile_id);

ALTER TABLE ONLY public.portfolio_comments
    ADD CONSTRAINT portfolio_comments_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.portfolio_comment_likes
    ADD CONSTRAINT portfolio_comment_likes_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.portfolio_comment_likes
    ADD CONSTRAINT portfolio_comment_likes_comment_profile_key UNIQUE (comment_id, profile_id);

ALTER TABLE ONLY public.portfolio_engagement_counters
    ADD CONSTRAINT portfolio_engagement_counters_portfolio_id_fkey
        FOREIGN KEY (portfolio_id) REFERENCES public.portfolios(id) ON DELETE CASCADE;

ALTER TABLE ONLY public.portfolio_likes
    ADD CONSTRAINT portfolio_likes_portfolio_id_fkey
        FOREIGN KEY (portfolio_id) REFERENCES public.portfolios(id) ON DELETE CASCADE;

ALTER TABLE ONLY public.portfolio_likes
    ADD CONSTRAINT portfolio_likes_profile_id_fkey
        FOREIGN KEY (profile_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE ONLY public.portfolio_comments
    ADD CONSTRAINT portfolio_comments_portfolio_id_fkey
        FOREIGN KEY (portfolio_id) REFERENCES public.portfolios(id) ON DELETE CASCADE;

ALTER TABLE ONLY public.portfolio_comments
    ADD CONSTRAINT portfolio_comments_profile_id_fkey
        FOREIGN KEY (profile_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE ONLY public.portfolio_comments
    ADD CONSTRAINT portfolio_comments_parent_comment_id_fkey
        FOREIGN KEY (parent_comment_id) REFERENCES public.portfolio_comments(id) ON DELETE CASCADE;

ALTER TABLE ONLY public.portfolio_comment_likes
    ADD CONSTRAINT portfolio_comment_likes_comment_id_fkey
        FOREIGN KEY (comment_id) REFERENCES public.portfolio_comments(id) ON DELETE CASCADE;

ALTER TABLE ONLY public.portfolio_comment_likes
    ADD CONSTRAINT portfolio_comment_likes_profile_id_fkey
        FOREIGN KEY (profile_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

CREATE INDEX portfolio_likes_profile_id_created_at_idx
    ON public.portfolio_likes USING btree (profile_id, created_at DESC);

CREATE INDEX portfolio_likes_portfolio_id_created_at_idx
    ON public.portfolio_likes USING btree (portfolio_id, created_at DESC);

CREATE INDEX portfolio_comments_portfolio_thread_idx
    ON public.portfolio_comments USING btree (portfolio_id, parent_comment_id, created_at ASC);

CREATE INDEX portfolio_comments_profile_id_created_at_idx
    ON public.portfolio_comments USING btree (profile_id, created_at DESC);

CREATE INDEX portfolio_comments_visible_portfolio_idx
    ON public.portfolio_comments USING btree (portfolio_id, created_at DESC)
    WHERE status = 'visible'::text;

CREATE INDEX portfolio_comment_likes_profile_id_created_at_idx
    ON public.portfolio_comment_likes USING btree (profile_id, created_at DESC);

CREATE INDEX portfolio_comment_likes_comment_id_created_at_idx
    ON public.portfolio_comment_likes USING btree (comment_id, created_at DESC);

INSERT INTO public.portfolio_engagement_counters (portfolio_id)
SELECT p.id
FROM public.portfolios p
ON CONFLICT (portfolio_id) DO NOTHING;

CREATE OR REPLACE FUNCTION public.ensure_portfolio_engagement_counter(target_portfolio_id uuid)
RETURNS void AS $$
BEGIN
    INSERT INTO public.portfolio_engagement_counters (portfolio_id)
    VALUES (target_portfolio_id)
    ON CONFLICT (portfolio_id) DO NOTHING;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.touch_portfolio_engagement_counter()
RETURNS trigger AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER portfolio_engagement_counters_touch_updated_at
    BEFORE UPDATE ON public.portfolio_engagement_counters
    FOR EACH ROW
    EXECUTE FUNCTION public.touch_portfolio_engagement_counter();

CREATE OR REPLACE FUNCTION public.validate_portfolio_comment_parent()
RETURNS trigger AS $$
DECLARE
    parent_portfolio_id uuid;
    parent_parent_comment_id uuid;
BEGIN
    IF NEW.parent_comment_id IS NULL THEN
        RETURN NEW;
    END IF;

    SELECT portfolio_id, parent_comment_id
    INTO parent_portfolio_id, parent_parent_comment_id
    FROM public.portfolio_comments
    WHERE id = NEW.parent_comment_id;

    IF parent_portfolio_id IS NULL THEN
        RAISE EXCEPTION 'Parent comment does not exist';
    END IF;

    IF parent_portfolio_id <> NEW.portfolio_id THEN
        RAISE EXCEPTION 'Parent comment must belong to the same portfolio';
    END IF;

    IF parent_parent_comment_id IS NOT NULL THEN
        RAISE EXCEPTION 'Nested replies deeper than one level are not supported';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER portfolio_comments_validate_parent
    BEFORE INSERT OR UPDATE OF portfolio_id, parent_comment_id
    ON public.portfolio_comments
    FOR EACH ROW
    EXECUTE FUNCTION public.validate_portfolio_comment_parent();

CREATE OR REPLACE FUNCTION public.touch_portfolio_comment()
RETURNS trigger AS $$
BEGIN
    NEW.updated_at = now();
    IF NEW.status = 'deleted'::text AND NEW.deleted_at IS NULL THEN
        NEW.deleted_at = now();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER portfolio_comments_touch_updated_at
    BEFORE UPDATE ON public.portfolio_comments
    FOR EACH ROW
    EXECUTE FUNCTION public.touch_portfolio_comment();

CREATE OR REPLACE FUNCTION public.adjust_portfolio_like_count()
RETURNS trigger AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        PERFORM public.ensure_portfolio_engagement_counter(NEW.portfolio_id);
        UPDATE public.portfolio_engagement_counters
        SET likes_count = likes_count + 1
        WHERE portfolio_id = NEW.portfolio_id;
        RETURN NEW;
    END IF;

    UPDATE public.portfolio_engagement_counters
    SET likes_count = greatest(likes_count - 1, 0)
    WHERE portfolio_id = OLD.portfolio_id;
    RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER portfolio_likes_adjust_count
    AFTER INSERT OR DELETE ON public.portfolio_likes
    FOR EACH ROW
    EXECUTE FUNCTION public.adjust_portfolio_like_count();

CREATE OR REPLACE FUNCTION public.adjust_portfolio_comment_counts()
RETURNS trigger AS $$
DECLARE
    old_visible integer := 0;
    new_visible integer := 0;
BEGIN
    IF TG_OP = 'INSERT' THEN
        PERFORM public.ensure_portfolio_engagement_counter(NEW.portfolio_id);
        IF NEW.status = 'visible'::text THEN
            UPDATE public.portfolio_engagement_counters
            SET comments_count = comments_count + 1
            WHERE portfolio_id = NEW.portfolio_id;

            IF NEW.parent_comment_id IS NOT NULL THEN
                UPDATE public.portfolio_comments
                SET replies_count = replies_count + 1
                WHERE id = NEW.parent_comment_id;
            END IF;
        END IF;
        RETURN NEW;
    END IF;

    IF TG_OP = 'DELETE' THEN
        IF OLD.status = 'visible'::text THEN
            UPDATE public.portfolio_engagement_counters
            SET comments_count = greatest(comments_count - 1, 0)
            WHERE portfolio_id = OLD.portfolio_id;

            IF OLD.parent_comment_id IS NOT NULL THEN
                UPDATE public.portfolio_comments
                SET replies_count = greatest(replies_count - 1, 0)
                WHERE id = OLD.parent_comment_id;
            END IF;
        END IF;
        RETURN OLD;
    END IF;

    old_visible := CASE WHEN OLD.status = 'visible'::text THEN 1 ELSE 0 END;
    new_visible := CASE WHEN NEW.status = 'visible'::text THEN 1 ELSE 0 END;

    IF OLD.portfolio_id <> NEW.portfolio_id THEN
        PERFORM public.ensure_portfolio_engagement_counter(NEW.portfolio_id);
        UPDATE public.portfolio_engagement_counters
        SET comments_count = greatest(comments_count - old_visible, 0)
        WHERE portfolio_id = OLD.portfolio_id;
        UPDATE public.portfolio_engagement_counters
        SET comments_count = comments_count + new_visible
        WHERE portfolio_id = NEW.portfolio_id;
    ELSIF old_visible <> new_visible THEN
        UPDATE public.portfolio_engagement_counters
        SET comments_count = greatest(comments_count + new_visible - old_visible, 0)
        WHERE portfolio_id = NEW.portfolio_id;
    END IF;

    IF OLD.parent_comment_id IS DISTINCT FROM NEW.parent_comment_id
        OR old_visible <> new_visible THEN
        IF OLD.parent_comment_id IS NOT NULL AND old_visible = 1 THEN
            UPDATE public.portfolio_comments
            SET replies_count = greatest(replies_count - 1, 0)
            WHERE id = OLD.parent_comment_id;
        END IF;

        IF NEW.parent_comment_id IS NOT NULL AND new_visible = 1 THEN
            UPDATE public.portfolio_comments
            SET replies_count = replies_count + 1
            WHERE id = NEW.parent_comment_id;
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER portfolio_comments_adjust_counts
    AFTER INSERT OR UPDATE OF portfolio_id, parent_comment_id, status OR DELETE
    ON public.portfolio_comments
    FOR EACH ROW
    EXECUTE FUNCTION public.adjust_portfolio_comment_counts();

CREATE OR REPLACE FUNCTION public.adjust_portfolio_comment_like_count()
RETURNS trigger AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE public.portfolio_comments
        SET likes_count = likes_count + 1
        WHERE id = NEW.comment_id;
        RETURN NEW;
    END IF;

    UPDATE public.portfolio_comments
    SET likes_count = greatest(likes_count - 1, 0)
    WHERE id = OLD.comment_id;
    RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER portfolio_comment_likes_adjust_count
    AFTER INSERT OR DELETE ON public.portfolio_comment_likes
    FOR EACH ROW
    EXECUTE FUNCTION public.adjust_portfolio_comment_like_count();

ALTER TABLE public.portfolio_engagement_counters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolio_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolio_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolio_comment_likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY portfolio_engagement_counters_select_published
    ON public.portfolio_engagement_counters
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1
            FROM public.portfolios p
            WHERE p.id = portfolio_engagement_counters.portfolio_id
              AND p.status = 'publish'::text
              AND p.slug IS NOT NULL
        )
    );

CREATE POLICY portfolio_likes_select_published
    ON public.portfolio_likes
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1
            FROM public.portfolios p
            WHERE p.id = portfolio_likes.portfolio_id
              AND p.status = 'publish'::text
              AND p.slug IS NOT NULL
        )
    );

CREATE POLICY portfolio_likes_insert_authenticated_published
    ON public.portfolio_likes
    FOR INSERT
    WITH CHECK (
        profile_id = auth.uid()
        AND EXISTS (
            SELECT 1
            FROM public.portfolios p
            WHERE p.id = portfolio_likes.portfolio_id
              AND p.status = 'publish'::text
              AND p.slug IS NOT NULL
        )
    );

CREATE POLICY portfolio_likes_delete_own
    ON public.portfolio_likes
    FOR DELETE
    USING (profile_id = auth.uid());

CREATE POLICY portfolio_comments_select_visible_published
    ON public.portfolio_comments
    FOR SELECT
    USING (
        status = 'visible'::text
        AND EXISTS (
            SELECT 1
            FROM public.portfolios p
            WHERE p.id = portfolio_comments.portfolio_id
              AND p.status = 'publish'::text
              AND p.slug IS NOT NULL
        )
    );

CREATE POLICY portfolio_comments_select_own
    ON public.portfolio_comments
    FOR SELECT
    USING (profile_id = auth.uid());

CREATE POLICY portfolio_comments_insert_authenticated_published
    ON public.portfolio_comments
    FOR INSERT
    WITH CHECK (
        profile_id = auth.uid()
        AND status = 'visible'::text
        AND EXISTS (
            SELECT 1
            FROM public.portfolios p
            WHERE p.id = portfolio_comments.portfolio_id
              AND p.status = 'publish'::text
              AND p.slug IS NOT NULL
        )
    );

CREATE POLICY portfolio_comments_update_own
    ON public.portfolio_comments
    FOR UPDATE
    USING (profile_id = auth.uid())
    WITH CHECK (profile_id = auth.uid());

CREATE POLICY portfolio_comments_moderate_owned_portfolio
    ON public.portfolio_comments
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1
            FROM public.portfolios p
            WHERE p.id = portfolio_comments.portfolio_id
              AND p.user_id = auth.uid()
        )
    );

CREATE POLICY portfolio_comments_delete_own
    ON public.portfolio_comments
    FOR DELETE
    USING (profile_id = auth.uid());

CREATE POLICY portfolio_comments_delete_owned_portfolio
    ON public.portfolio_comments
    FOR DELETE
    USING (
        EXISTS (
            SELECT 1
            FROM public.portfolios p
            WHERE p.id = portfolio_comments.portfolio_id
              AND p.user_id = auth.uid()
        )
    );

CREATE POLICY portfolio_comment_likes_select_visible_published
    ON public.portfolio_comment_likes
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1
            FROM public.portfolio_comments c
            JOIN public.portfolios p ON p.id = c.portfolio_id
            WHERE c.id = portfolio_comment_likes.comment_id
              AND c.status = 'visible'::text
              AND p.status = 'publish'::text
              AND p.slug IS NOT NULL
        )
    );

CREATE POLICY portfolio_comment_likes_insert_authenticated_visible_published
    ON public.portfolio_comment_likes
    FOR INSERT
    WITH CHECK (
        profile_id = auth.uid()
        AND EXISTS (
            SELECT 1
            FROM public.portfolio_comments c
            JOIN public.portfolios p ON p.id = c.portfolio_id
            WHERE c.id = portfolio_comment_likes.comment_id
              AND c.status = 'visible'::text
              AND p.status = 'publish'::text
              AND p.slug IS NOT NULL
        )
    );

CREATE POLICY portfolio_comment_likes_delete_own
    ON public.portfolio_comment_likes
    FOR DELETE
    USING (profile_id = auth.uid());

COMMENT ON TABLE public.portfolio_engagement_counters IS
    'Precomputed public engagement counts for explore portfolio cards and detail sidebars.';
COMMENT ON TABLE public.portfolio_likes IS
    'One portfolio-level like per authenticated profile.';
COMMENT ON TABLE public.portfolio_comments IS
    'Public portfolio comments with one-level replies and moderation status.';
COMMENT ON TABLE public.portfolio_comment_likes IS
    'One like per authenticated profile per portfolio comment.';
