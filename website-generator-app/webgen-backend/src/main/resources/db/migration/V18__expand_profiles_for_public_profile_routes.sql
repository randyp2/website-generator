-- Public profile foundation:
-- Adds route handle + richer profile fields used by /[profile].
-- Keep username nullable for now so existing profile insert flows do not break.

ALTER TABLE public.profiles
    ADD COLUMN username text,
    ADD COLUMN bio text,
    ADD COLUMN banner_url text,
    ADD COLUMN location text,
    ADD COLUMN school text,
    ADD COLUMN degree text,
    ADD COLUMN job_title text,
    ADD COLUMN company text,
    ADD COLUMN website_url text,
    ADD COLUMN linkedin_url text,
    ADD COLUMN github_url text;

ALTER TABLE public.profiles
    ADD CONSTRAINT profiles_username_not_blank
        CHECK (username IS NULL OR btrim(username) <> ''::text),
    ADD CONSTRAINT profiles_username_lowercase
        CHECK (username IS NULL OR username = lower(username)),
    ADD CONSTRAINT profiles_username_format
        CHECK (
            username IS NULL
            OR username ~ '^[a-z0-9][a-z0-9-]{1,30}[a-z0-9]$'
        ),
    ADD CONSTRAINT profiles_bio_length
        CHECK (bio IS NULL OR char_length(bio) <= 500),
    ADD CONSTRAINT profiles_banner_url_not_blank
        CHECK (banner_url IS NULL OR btrim(banner_url) <> ''::text),
    ADD CONSTRAINT profiles_location_not_blank
        CHECK (location IS NULL OR btrim(location) <> ''::text),
    ADD CONSTRAINT profiles_school_not_blank
        CHECK (school IS NULL OR btrim(school) <> ''::text),
    ADD CONSTRAINT profiles_degree_not_blank
        CHECK (degree IS NULL OR btrim(degree) <> ''::text),
    ADD CONSTRAINT profiles_job_title_not_blank
        CHECK (job_title IS NULL OR btrim(job_title) <> ''::text),
    ADD CONSTRAINT profiles_company_not_blank
        CHECK (company IS NULL OR btrim(company) <> ''::text),
    ADD CONSTRAINT profiles_website_url_not_blank
        CHECK (website_url IS NULL OR btrim(website_url) <> ''::text),
    ADD CONSTRAINT profiles_linkedin_url_not_blank
        CHECK (linkedin_url IS NULL OR btrim(linkedin_url) <> ''::text),
    ADD CONSTRAINT profiles_github_url_not_blank
        CHECK (github_url IS NULL OR btrim(github_url) <> ''::text);

-- Backfill usernames for existing rows so /[profile] can start resolving
-- immediately after this migration.
WITH seed AS (
    SELECT
        p.id,
        CASE
            WHEN char_length(clean) < 3 THEN ('user-' || substr(replace(p.id::text, '-'::text, ''::text), 1, 8))
            ELSE substr(clean, 1, 28)
        END AS base_username
    FROM (
        SELECT
            id,
            lower(
                regexp_replace(
                    regexp_replace(
                        coalesce(
                            nullif(full_name, ''::text),
                            nullif(split_part(email, '@'::text, 1), ''::text),
                            'user'
                        ),
                        '[^a-zA-Z0-9]+'::text,
                        '-'::text,
                        'g'
                    ),
                    '(^-+|-+$)'::text,
                    ''::text,
                    'g'
                )
            ) AS clean
        FROM public.profiles
    ) AS p
),
ranked AS (
    SELECT
        s.id,
        s.base_username,
        row_number() OVER (PARTITION BY s.base_username ORDER BY s.id) AS rn
    FROM seed s
),
resolved AS (
    SELECT
        r.id,
        CASE
            WHEN r.rn = 1 THEN r.base_username
            ELSE substr(r.base_username, 1, 28 - char_length(r.rn::text)) || '-'::text || r.rn::text
        END AS final_username
    FROM ranked r
)
UPDATE public.profiles p
SET username = resolved.final_username
FROM resolved
WHERE p.id = resolved.id
  AND p.username IS NULL;

CREATE UNIQUE INDEX profiles_username_lower_key
    ON public.profiles USING btree (lower(username))
    WHERE username IS NOT NULL;

COMMENT ON COLUMN public.profiles.username IS
    'Public route handle used by /[profile]. Lowercase, unique, and URL-safe.';
COMMENT ON COLUMN public.profiles.bio IS
    'Public profile biography text (up to 500 chars).';
COMMENT ON COLUMN public.profiles.banner_url IS
    'Public profile banner image URL.';
COMMENT ON COLUMN public.profiles.location IS
    'Public location string shown on profile.';
COMMENT ON COLUMN public.profiles.school IS
    'Primary school or university shown on profile.';
COMMENT ON COLUMN public.profiles.degree IS
    'Primary degree or field of study.';
COMMENT ON COLUMN public.profiles.job_title IS
    'Current role/job title for profile header context.';
COMMENT ON COLUMN public.profiles.company IS
    'Current company or organization.';
COMMENT ON COLUMN public.profiles.website_url IS
    'Primary personal site URL.';
COMMENT ON COLUMN public.profiles.linkedin_url IS
    'LinkedIn profile URL.';
COMMENT ON COLUMN public.profiles.github_url IS
    'GitHub profile URL.';
