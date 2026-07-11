-- Pins the generated version served on the public site. Live sections
-- (portfolio_sections) are the editor's working copy; visitors see the
-- pinned snapshot until the user explicitly publishes their changes.
-- NULL means "not pinned yet" and falls back to live sections, which keeps
-- portfolios published before this migration rendering unchanged.
ALTER TABLE public.portfolios
    ADD COLUMN published_version_id uuid REFERENCES public.generated_versions (id);
