-- Profile social foundation.
-- Supports follow relationships plus precomputed profile counters for
-- public profile headers/cards without mutating the profiles table.

CREATE TABLE public.profile_social_counters (
    profile_id uuid NOT NULL,
    followers_count integer DEFAULT 0 NOT NULL,
    following_count integer DEFAULT 0 NOT NULL,
    profile_views_count integer DEFAULT 0 NOT NULL,
    portfolio_likes_count integer DEFAULT 0 NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT profile_social_counters_nonnegative
        CHECK (
            followers_count >= 0
            AND following_count >= 0
            AND profile_views_count >= 0
            AND portfolio_likes_count >= 0
        )
);

CREATE TABLE public.profile_follows (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    follower_profile_id uuid NOT NULL,
    followed_profile_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT profile_follows_no_self_follow
        CHECK (follower_profile_id <> followed_profile_id)
);

ALTER TABLE ONLY public.profile_social_counters
    ADD CONSTRAINT profile_social_counters_pkey PRIMARY KEY (profile_id);

ALTER TABLE ONLY public.profile_follows
    ADD CONSTRAINT profile_follows_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.profile_follows
    ADD CONSTRAINT profile_follows_follower_followed_key
        UNIQUE (follower_profile_id, followed_profile_id);

ALTER TABLE ONLY public.profile_social_counters
    ADD CONSTRAINT profile_social_counters_profile_id_fkey
        FOREIGN KEY (profile_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE ONLY public.profile_follows
    ADD CONSTRAINT profile_follows_follower_profile_id_fkey
        FOREIGN KEY (follower_profile_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE ONLY public.profile_follows
    ADD CONSTRAINT profile_follows_followed_profile_id_fkey
        FOREIGN KEY (followed_profile_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

CREATE INDEX profile_follows_follower_created_at_idx
    ON public.profile_follows USING btree (follower_profile_id, created_at DESC);

CREATE INDEX profile_follows_followed_created_at_idx
    ON public.profile_follows USING btree (followed_profile_id, created_at DESC);

INSERT INTO public.profile_social_counters (
    profile_id,
    followers_count,
    following_count,
    portfolio_likes_count
)
SELECT
    p.id,
    COALESCE(followers.followers_count, 0),
    COALESCE(following.following_count, 0),
    COALESCE(portfolio_likes.portfolio_likes_count, 0)
FROM public.profiles p
LEFT JOIN (
    SELECT followed_profile_id AS profile_id, count(*)::integer AS followers_count
    FROM public.profile_follows
    GROUP BY followed_profile_id
) followers ON followers.profile_id = p.id
LEFT JOIN (
    SELECT follower_profile_id AS profile_id, count(*)::integer AS following_count
    FROM public.profile_follows
    GROUP BY follower_profile_id
) following ON following.profile_id = p.id
LEFT JOIN (
    SELECT portfolios.user_id AS profile_id, count(portfolio_likes.id)::integer AS portfolio_likes_count
    FROM public.portfolios
    JOIN public.portfolio_likes ON portfolio_likes.portfolio_id = portfolios.id
    GROUP BY portfolios.user_id
) portfolio_likes ON portfolio_likes.profile_id = p.id
ON CONFLICT (profile_id) DO UPDATE
SET
    followers_count = EXCLUDED.followers_count,
    following_count = EXCLUDED.following_count,
    portfolio_likes_count = EXCLUDED.portfolio_likes_count,
    updated_at = now();

CREATE OR REPLACE FUNCTION public.ensure_profile_social_counter(target_profile_id uuid)
RETURNS void AS $$
BEGIN
    INSERT INTO public.profile_social_counters (profile_id)
    VALUES (target_profile_id)
    ON CONFLICT (profile_id) DO NOTHING;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.touch_profile_social_counter()
RETURNS trigger AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profile_social_counters_touch_updated_at
    BEFORE UPDATE ON public.profile_social_counters
    FOR EACH ROW
    EXECUTE FUNCTION public.touch_profile_social_counter();

CREATE OR REPLACE FUNCTION public.ensure_profile_social_counter_for_profile()
RETURNS trigger AS $$
BEGIN
    PERFORM public.ensure_profile_social_counter(NEW.id);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER profiles_ensure_social_counter
    AFTER INSERT ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.ensure_profile_social_counter_for_profile();

CREATE OR REPLACE FUNCTION public.adjust_profile_follow_counts()
RETURNS trigger AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        PERFORM public.ensure_profile_social_counter(NEW.follower_profile_id);
        PERFORM public.ensure_profile_social_counter(NEW.followed_profile_id);

        UPDATE public.profile_social_counters
        SET following_count = following_count + 1
        WHERE profile_id = NEW.follower_profile_id;

        UPDATE public.profile_social_counters
        SET followers_count = followers_count + 1
        WHERE profile_id = NEW.followed_profile_id;

        RETURN NEW;
    END IF;

    UPDATE public.profile_social_counters
    SET following_count = greatest(following_count - 1, 0)
    WHERE profile_id = OLD.follower_profile_id;

    UPDATE public.profile_social_counters
    SET followers_count = greatest(followers_count - 1, 0)
    WHERE profile_id = OLD.followed_profile_id;

    RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER profile_follows_adjust_counts
    AFTER INSERT OR DELETE ON public.profile_follows
    FOR EACH ROW
    EXECUTE FUNCTION public.adjust_profile_follow_counts();

CREATE OR REPLACE FUNCTION public.increment_profile_views_count(target_profile_id uuid)
RETURNS void AS $$
BEGIN
    PERFORM public.ensure_profile_social_counter(target_profile_id);

    UPDATE public.profile_social_counters
    SET profile_views_count = profile_views_count + 1
    WHERE profile_id = target_profile_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.adjust_profile_portfolio_likes_count()
RETURNS trigger AS $$
DECLARE
    target_profile_id uuid;
BEGIN
    IF TG_OP = 'INSERT' THEN
        SELECT p.user_id
        INTO target_profile_id
        FROM public.portfolios p
        WHERE p.id = NEW.portfolio_id;

        IF target_profile_id IS NOT NULL THEN
            PERFORM public.ensure_profile_social_counter(target_profile_id);
            UPDATE public.profile_social_counters
            SET portfolio_likes_count = portfolio_likes_count + 1
            WHERE profile_id = target_profile_id;
        END IF;

        RETURN NEW;
    END IF;

    SELECT p.user_id
    INTO target_profile_id
    FROM public.portfolios p
    WHERE p.id = OLD.portfolio_id;

    IF target_profile_id IS NOT NULL THEN
        UPDATE public.profile_social_counters
        SET portfolio_likes_count = greatest(portfolio_likes_count - 1, 0)
        WHERE profile_id = target_profile_id;
    END IF;

    RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER portfolio_likes_adjust_profile_social_count
    AFTER INSERT OR DELETE ON public.portfolio_likes
    FOR EACH ROW
    EXECUTE FUNCTION public.adjust_profile_portfolio_likes_count();

ALTER TABLE public.profile_social_counters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profile_follows ENABLE ROW LEVEL SECURITY;

CREATE POLICY profile_social_counters_select_public
    ON public.profile_social_counters
    FOR SELECT
    USING (true);

CREATE POLICY profile_follows_select_public
    ON public.profile_follows
    FOR SELECT
    USING (true);

CREATE POLICY profile_follows_insert_own
    ON public.profile_follows
    FOR INSERT
    WITH CHECK (
        follower_profile_id = auth.uid()
        AND follower_profile_id <> followed_profile_id
    );

CREATE POLICY profile_follows_delete_own
    ON public.profile_follows
    FOR DELETE
    USING (follower_profile_id = auth.uid());

COMMENT ON TABLE public.profile_social_counters IS
    'Precomputed public social counters for profile pages and profile cards.';
COMMENT ON TABLE public.profile_follows IS
    'One follow relationship per authenticated profile pair.';
COMMENT ON COLUMN public.profile_social_counters.portfolio_likes_count IS
    'Total likes received across portfolios owned by this profile.';
