-- =========================================
-- Dev stub for Supabase auth.uid()
-- (Safe: Supabase already has auth schema in prod)
-- =========================================

CREATE SCHEMA IF NOT EXISTS auth;

CREATE OR REPLACE FUNCTION auth.uid() RETURNS uuid AS $$
BEGIN
  RETURN '00000000-0000-0000-0000-000000000000'::uuid;
END;
$$ LANGUAGE plpgsql;

-- =========================================
-- Actual application schema starts here
-- =========================================

CREATE TABLE public.assets (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    portfolio_id uuid,
    file_url text NOT NULL,
    file_type text,
    created_at timestamp with time zone DEFAULT now(),
    title text,
    description text,
    label text,
    section_hint text,
    alt text
);

CREATE TABLE public.email_verifications (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    email text NOT NULL,
    code text NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    preview_file_content text,
    preview_file_name text
);

CREATE TABLE public.generated_versions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    portfolio_id uuid NOT NULL,
    html text NOT NULL,
    css text,
    preview_url text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    prompt_used text,
    model_used text,
    react_source text,
    sections_snapshot jsonb,
    assistant_message jsonb,
    global_theme jsonb
);

CREATE TABLE public.portfolio_section_versions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    section_id uuid NOT NULL,
    content_json jsonb DEFAULT '{}'::jsonb NOT NULL,
    react_source text,
    prompt_used text,
    model_used text,
    created_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE public.portfolio_sections (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    portfolio_id uuid NOT NULL,
    section_key text NOT NULL,
    title text,
    content_json jsonb DEFAULT '{}'::jsonb NOT NULL,
    react_source text,
    order_index integer DEFAULT 0 NOT NULL,
    source text DEFAULT 'ai'::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE public.portfolios (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    title text,
    template_id text,
    status text DEFAULT 'draft'::text,
    slug text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    active_version_id uuid,
    last_step text DEFAULT 'template'::text NOT NULL,
    style_chat_history jsonb DEFAULT '[]'::jsonb NOT NULL,
    CONSTRAINT portfolios_last_step_check CHECK ((last_step = ANY (ARRAY['template'::text, 'style'::text, 'upload'::text, 'review'::text, 'refine'::text, 'publish'::text]))),
    CONSTRAINT portfolios_style_chat_history_is_array CHECK ((jsonb_typeof(style_chat_history) = 'array'::text))
);

CREATE TABLE public.profiles (
    id uuid NOT NULL,
    full_name text,
    email text,
    avatar_url text
);

CREATE TABLE public.resumes (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    portfolio_id uuid NOT NULL,
    raw_file_url text,
    extracted_text text,
    parsed_json jsonb,
    created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE ONLY public.assets
    ADD CONSTRAINT assets_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.email_verifications
    ADD CONSTRAINT email_verifications_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.generated_versions
    ADD CONSTRAINT generated_versions_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.portfolio_section_versions
    ADD CONSTRAINT portfolio_section_versions_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.portfolio_sections
    ADD CONSTRAINT portfolio_sections_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.portfolio_sections
    ADD CONSTRAINT portfolio_sections_portfolio_id_section_key_key UNIQUE (portfolio_id, section_key);

ALTER TABLE ONLY public.portfolios
    ADD CONSTRAINT portfolios_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.portfolios
    ADD CONSTRAINT portfolios_published_url_key UNIQUE (slug);

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_email_key UNIQUE (email);

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.resumes
    ADD CONSTRAINT resumes_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.assets
    ADD CONSTRAINT assets_portfolio_id_fkey FOREIGN KEY (portfolio_id) REFERENCES public.portfolios(id) ON DELETE CASCADE;

ALTER TABLE ONLY public.generated_versions
    ADD CONSTRAINT generated_versions_portfolio_id_fkey FOREIGN KEY (portfolio_id) REFERENCES public.portfolios(id) ON DELETE CASCADE;

ALTER TABLE ONLY public.portfolio_section_versions
    ADD CONSTRAINT portfolio_section_versions_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.profiles(id);

ALTER TABLE ONLY public.portfolio_section_versions
    ADD CONSTRAINT portfolio_section_versions_section_id_fkey FOREIGN KEY (section_id) REFERENCES public.portfolio_sections(id) ON DELETE CASCADE;

ALTER TABLE ONLY public.portfolio_sections
    ADD CONSTRAINT portfolio_sections_portfolio_id_fkey FOREIGN KEY (portfolio_id) REFERENCES public.portfolios(id) ON DELETE CASCADE;

ALTER TABLE ONLY public.portfolios
    ADD CONSTRAINT portfolios_active_version_id_fkey FOREIGN KEY (active_version_id) REFERENCES public.generated_versions(id);

ALTER TABLE ONLY public.resumes
    ADD CONSTRAINT resumes_portfolio_id_fkey FOREIGN KEY (portfolio_id) REFERENCES public.portfolios(id) ON DELETE CASCADE;

CREATE INDEX email_verifications_created_at_idx ON public.email_verifications USING btree (created_at);

CREATE INDEX portfolio_section_versions_section_id_idx ON public.portfolio_section_versions USING btree (section_id);

CREATE INDEX portfolio_sections_portfolio_id_idx ON public.portfolio_sections USING btree (portfolio_id);

ALTER TABLE public.assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.generated_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolio_section_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolio_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resumes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow users to delete their own assets" ON public.assets FOR DELETE USING ((EXISTS ( SELECT 1
   FROM public.portfolios
  WHERE ((portfolios.id = assets.portfolio_id) AND (portfolios.user_id = auth.uid())))));

CREATE POLICY "Allow users to insert their own assets" ON public.assets FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM public.portfolios
  WHERE ((portfolios.id = assets.portfolio_id) AND (portfolios.user_id = auth.uid())))));

CREATE POLICY "Allow users to view their own assets" ON public.assets FOR SELECT USING ((EXISTS ( SELECT 1
   FROM public.portfolios
  WHERE ((portfolios.id = assets.portfolio_id) AND (portfolios.user_id = auth.uid())))));

CREATE POLICY "Public profiles are viewable by everyone." ON public.profiles FOR SELECT USING (true);

CREATE POLICY "Users can delete their own portfolios" ON public.portfolios FOR DELETE USING ((auth.uid() = user_id));

CREATE POLICY "Users can insert resumes into their portfolios" ON public.resumes FOR INSERT WITH CHECK ((portfolio_id IN ( SELECT portfolios.id
   FROM public.portfolios
  WHERE (portfolios.user_id = auth.uid()))));

CREATE POLICY "Users can insert their own portfolios" ON public.portfolios FOR INSERT WITH CHECK ((auth.uid() = user_id));

CREATE POLICY "Users can insert their own profile." ON public.profiles FOR INSERT WITH CHECK ((( SELECT auth.uid() AS uid) = id));

CREATE POLICY "Users can insert versions for own portfolio" ON public.generated_versions FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM public.portfolios p
  WHERE ((p.id = generated_versions.portfolio_id) AND (p.user_id = auth.uid())))));

CREATE POLICY "Users can update own profile." ON public.profiles FOR UPDATE USING ((( SELECT auth.uid() AS uid) = id));

CREATE POLICY "Users can update resumes for their portfolios" ON public.resumes FOR UPDATE USING ((portfolio_id IN ( SELECT portfolios.id
   FROM public.portfolios
  WHERE (portfolios.user_id = auth.uid())))) WITH CHECK ((portfolio_id IN ( SELECT portfolios.id
   FROM public.portfolios
  WHERE (portfolios.user_id = auth.uid()))));

CREATE POLICY "Users can update their own portfolios" ON public.portfolios FOR UPDATE USING ((auth.uid() = user_id));

CREATE POLICY "Users can view resumes for their portfolios" ON public.resumes FOR SELECT USING ((portfolio_id IN ( SELECT portfolios.id
   FROM public.portfolios
  WHERE (portfolios.user_id = auth.uid()))));

CREATE POLICY "Users can view their own portfolios" ON public.portfolios FOR SELECT USING ((auth.uid() = user_id));

CREATE POLICY "Users can view their versions" ON public.generated_versions FOR SELECT USING ((EXISTS ( SELECT 1
   FROM public.portfolios p
  WHERE ((p.id = generated_versions.portfolio_id) AND (p.user_id = auth.uid())))));

CREATE POLICY portfolio_section_versions_delete_own ON public.portfolio_section_versions FOR DELETE USING ((EXISTS ( SELECT 1
   FROM (public.portfolio_sections s
     JOIN public.portfolios p ON ((p.id = s.portfolio_id)))
  WHERE ((s.id = portfolio_section_versions.section_id) AND (p.user_id = auth.uid())))));

CREATE POLICY portfolio_section_versions_insert_own ON public.portfolio_section_versions FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM (public.portfolio_sections s
     JOIN public.portfolios p ON ((p.id = s.portfolio_id)))
  WHERE ((s.id = portfolio_section_versions.section_id) AND (p.user_id = auth.uid())))));

CREATE POLICY portfolio_section_versions_select_own ON public.portfolio_section_versions FOR SELECT USING ((EXISTS ( SELECT 1
   FROM (public.portfolio_sections s
     JOIN public.portfolios p ON ((p.id = s.portfolio_id)))
  WHERE ((s.id = portfolio_section_versions.section_id) AND (p.user_id = auth.uid())))));

CREATE POLICY portfolio_section_versions_update_own ON public.portfolio_section_versions FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM (public.portfolio_sections s
     JOIN public.portfolios p ON ((p.id = s.portfolio_id)))
  WHERE ((s.id = portfolio_section_versions.section_id) AND (p.user_id = auth.uid()))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM (public.portfolio_sections s
     JOIN public.portfolios p ON ((p.id = s.portfolio_id)))
  WHERE ((s.id = portfolio_section_versions.section_id) AND (p.user_id = auth.uid())))));

CREATE POLICY portfolio_sections_delete_own ON public.portfolio_sections FOR DELETE USING ((EXISTS ( SELECT 1
   FROM public.portfolios p
  WHERE ((p.id = portfolio_sections.portfolio_id) AND (p.user_id = auth.uid())))));

CREATE POLICY portfolio_sections_insert_own ON public.portfolio_sections FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM public.portfolios p
  WHERE ((p.id = portfolio_sections.portfolio_id) AND (p.user_id = auth.uid())))));

CREATE POLICY portfolio_sections_select_own ON public.portfolio_sections FOR SELECT USING ((EXISTS ( SELECT 1
   FROM public.portfolios p
  WHERE ((p.id = portfolio_sections.portfolio_id) AND (p.user_id = auth.uid())))));

CREATE POLICY portfolio_sections_update_own ON public.portfolio_sections FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM public.portfolios p
  WHERE ((p.id = portfolio_sections.portfolio_id) AND (p.user_id = auth.uid()))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM public.portfolios p
  WHERE ((p.id = portfolio_sections.portfolio_id) AND (p.user_id = auth.uid())))));
