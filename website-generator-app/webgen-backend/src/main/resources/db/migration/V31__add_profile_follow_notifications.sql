-- Profile follow notifications are profile-scoped, so they do not target a
-- portfolio or comment.

ALTER TABLE public.notifications
    ALTER COLUMN portfolio_id DROP NOT NULL;

ALTER TABLE public.notifications
    DROP CONSTRAINT notifications_type_check;

ALTER TABLE public.notifications
    ADD CONSTRAINT notifications_type_check
        CHECK (
            type = ANY (
                ARRAY[
                    'portfolio_liked'::text,
                    'portfolio_commented'::text,
                    'comment_replied'::text,
                    'comment_liked'::text,
                    'profile_followed'::text
                ]
            )
        );

ALTER TABLE public.notifications
    DROP CONSTRAINT notifications_target_shape_check;

ALTER TABLE public.notifications
    ADD CONSTRAINT notifications_target_shape_check
        CHECK (
            (
                type = 'profile_followed'::text
                AND portfolio_id IS NULL
                AND comment_id IS NULL
            )
            OR (
                type = 'portfolio_liked'::text
                AND portfolio_id IS NOT NULL
                AND comment_id IS NULL
            )
            OR (
                type = ANY (
                    ARRAY[
                        'portfolio_commented'::text,
                        'comment_replied'::text,
                        'comment_liked'::text
                    ]
                )
                AND portfolio_id IS NOT NULL
                AND comment_id IS NOT NULL
            )
        );

COMMENT ON COLUMN public.notifications.type IS
    'Notification event type. Values cover portfolio likes, comments, replies, comment likes, and profile follows.';
