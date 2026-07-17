CREATE TABLE public.portfolio_refinement_sessions (
    id uuid NOT NULL,
    profile_id uuid NOT NULL,
    portfolio_id uuid NOT NULL,
    usage_reservation_id uuid,
    ai_turn_count integer DEFAULT 1 NOT NULL,
    has_successful_response boolean DEFAULT false NOT NULL,
    plan_completed boolean DEFAULT false NOT NULL,
    turn_in_progress boolean DEFAULT true NOT NULL,
    build_started boolean DEFAULT false NOT NULL,
    expires_at timestamp with time zone NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT portfolio_refinement_sessions_pkey PRIMARY KEY (id),
    CONSTRAINT portfolio_refinement_sessions_profile_id_fkey
        FOREIGN KEY (profile_id) REFERENCES public.profiles(id) ON DELETE CASCADE,
    CONSTRAINT portfolio_refinement_sessions_portfolio_id_fkey
        FOREIGN KEY (portfolio_id) REFERENCES public.portfolios(id) ON DELETE CASCADE,
    CONSTRAINT portfolio_refinement_sessions_usage_reservation_id_fkey
        FOREIGN KEY (usage_reservation_id)
        REFERENCES public.billing_credit_ledger_entries(id)
        ON DELETE SET NULL,
    CONSTRAINT portfolio_refinement_sessions_ai_turn_count_check
        CHECK (ai_turn_count BETWEEN 1 AND 8),
    CONSTRAINT portfolio_refinement_sessions_expiry_check
        CHECK (expires_at > created_at),
    CONSTRAINT portfolio_refinement_sessions_build_state_check
        CHECK (NOT build_started OR (has_successful_response AND plan_completed))
);

CREATE UNIQUE INDEX portfolio_refinement_sessions_usage_reservation_key
    ON public.portfolio_refinement_sessions USING btree (usage_reservation_id)
    WHERE usage_reservation_id IS NOT NULL;

CREATE INDEX portfolio_refinement_sessions_profile_expiry_idx
    ON public.portfolio_refinement_sessions USING btree (profile_id, expires_at);

COMMENT ON TABLE public.portfolio_refinement_sessions IS
    'Bounded portfolio refinement workflows linked to one allowance or credit reservation.';
COMMENT ON COLUMN public.portfolio_refinement_sessions.usage_reservation_id IS
    'Single delta-ledger reservation funding the entire refinement workflow.';
COMMENT ON COLUMN public.portfolio_refinement_sessions.ai_turn_count IS
    'Attempted clarifier and planner AI calls, capped for cost control.';
