-- canonical skill normalization.
-- These tables let us map noisy extracted claim text (e.g., "JS", "React.js")
-- to a stable skill identity so verification and scoring are deterministic.

-- The skills table is the canonical dictionary for verification.
-- Every normalized claim points to one of these rows so scoring rules can be
-- applied consistently by category and weight.
CREATE TABLE public.skills (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    category text NOT NULL,
    weight numeric(6,4) DEFAULT 1.0000 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT skills_pkey PRIMARY KEY (id),
    CONSTRAINT skills_name_not_blank CHECK (btrim(name) <> ''::text),
    CONSTRAINT skills_category_not_blank CHECK (btrim(category) <> ''::text),
    CONSTRAINT skills_weight_nonnegative CHECK (weight >= 0::numeric)
);

CREATE UNIQUE INDEX skills_name_lower_key
    ON public.skills USING btree (lower(name));

CREATE INDEX skills_category_idx
    ON public.skills USING btree (category);

ALTER TABLE public.skills ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Skills are viewable by everyone"
    ON public.skills
    FOR SELECT
    USING (true);

COMMENT ON TABLE public.skills IS
    'Canonical skill dictionary used to normalize extracted/manual claims before verification scoring.';
COMMENT ON COLUMN public.skills.category IS
    'Business category (for example engineering or marketing) used by recommendation and scoring logic.';
COMMENT ON COLUMN public.skills.weight IS
    'Relative multiplier used by scoring formulas when combining verified claims.';

-- The skill_aliases table maps real-world wording to canonical skills.
-- During normalization, claim raw_value is matched against alias and then
-- resolved to the single canonical skill row.
CREATE TABLE public.skill_aliases (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    skill_id uuid NOT NULL,
    alias text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT skill_aliases_pkey PRIMARY KEY (id),
    CONSTRAINT skill_aliases_skill_id_fkey
        FOREIGN KEY (skill_id) REFERENCES public.skills(id) ON DELETE CASCADE,
    CONSTRAINT skill_aliases_alias_not_blank CHECK (btrim(alias) <> ''::text)
);

CREATE UNIQUE INDEX skill_aliases_alias_lower_key
    ON public.skill_aliases USING btree (lower(alias));

CREATE INDEX skill_aliases_skill_id_idx
    ON public.skill_aliases USING btree (skill_id);

ALTER TABLE public.skill_aliases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Skill aliases are viewable by everyone"
    ON public.skill_aliases
    FOR SELECT
    USING (true);

COMMENT ON TABLE public.skill_aliases IS
    'Alias lookup table that resolves noisy claim wording to canonical skills.';
COMMENT ON COLUMN public.skill_aliases.alias IS
    'Raw phrase variants such as JS, React.js, or Paid Ads that normalize to one skill.';
