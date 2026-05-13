-- Durable orchestration storage for single-agent portfolio creation flow.
--
-- This migration introduces:
-- - agent_sessions: session-level workflow state/memory
-- - agent_messages: ordered conversation history (user/assistant/system/tool)
-- - agent_runs: one execution cycle per user message
-- - agent_tool_runs: tool-level execution details and idempotency protection

CREATE TABLE public.agent_sessions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    portfolio_id uuid NOT NULL,
    user_id uuid NOT NULL,
    status text DEFAULT 'ACTIVE'::text NOT NULL,
    stage text DEFAULT 'DISCOVERY'::text NOT NULL,
    memory_json jsonb DEFAULT '{}'::jsonb NOT NULL,
    current_job_id text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    last_activity_at timestamp with time zone DEFAULT now() NOT NULL,
    version integer DEFAULT 0 NOT NULL,
    CONSTRAINT agent_sessions_pkey PRIMARY KEY (id),
    CONSTRAINT agent_sessions_portfolio_id_fkey
        FOREIGN KEY (portfolio_id) REFERENCES public.portfolios(id) ON DELETE CASCADE,
    CONSTRAINT agent_sessions_status_check
        CHECK (status = ANY (ARRAY[
            'ACTIVE'::text,
            'COMPLETED'::text,
            'FAILED'::text,
            'ABANDONED'::text
        ])),
    CONSTRAINT agent_sessions_stage_check
        CHECK (stage = ANY (ARRAY[
            'DISCOVERY'::text,
            'UPLOAD'::text,
            'RESUME'::text,
            'GENERATE'::text,
            'REFINE'::text,
            'DONE'::text
        ])),
    CONSTRAINT agent_sessions_memory_json_object_check
        CHECK (jsonb_typeof(memory_json) = 'object'::text),
    CONSTRAINT agent_sessions_version_nonnegative_check
        CHECK (version >= 0)
);

CREATE INDEX agent_sessions_user_last_activity_idx
    ON public.agent_sessions USING btree (user_id, last_activity_at DESC);

CREATE INDEX agent_sessions_portfolio_status_idx
    ON public.agent_sessions USING btree (portfolio_id, status);

CREATE UNIQUE INDEX agent_sessions_single_active_per_portfolio_idx
    ON public.agent_sessions USING btree (portfolio_id)
    WHERE (status = 'ACTIVE'::text);


CREATE TABLE public.agent_messages (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    session_id uuid NOT NULL,
    sequence_no bigint NOT NULL,
    role text NOT NULL,
    content text,
    content_json jsonb,
    tool_name text,
    tool_call_id text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT agent_messages_pkey PRIMARY KEY (id),
    CONSTRAINT agent_messages_session_id_fkey
        FOREIGN KEY (session_id) REFERENCES public.agent_sessions(id) ON DELETE CASCADE,
    CONSTRAINT agent_messages_role_check
        CHECK (role = ANY (ARRAY[
            'USER'::text,
            'ASSISTANT'::text,
            'SYSTEM'::text,
            'TOOL'::text
        ])),
    CONSTRAINT agent_messages_sequence_positive_check
        CHECK (sequence_no > 0),
    CONSTRAINT agent_messages_unique_session_sequence
        UNIQUE (session_id, sequence_no)
);

CREATE INDEX agent_messages_session_created_at_idx
    ON public.agent_messages USING btree (session_id, created_at ASC);


CREATE TABLE public.agent_runs (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    session_id uuid NOT NULL,
    user_message_id uuid NOT NULL,
    assistant_message_id uuid,
    status text DEFAULT 'RUNNING'::text NOT NULL,
    model text,
    input_tokens integer,
    output_tokens integer,
    total_tokens integer,
    raw_request_json jsonb,
    raw_response_json jsonb,
    error_code text,
    error_message text,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    finished_at timestamp with time zone,
    duration_ms bigint,
    CONSTRAINT agent_runs_pkey PRIMARY KEY (id),
    CONSTRAINT agent_runs_session_id_fkey
        FOREIGN KEY (session_id) REFERENCES public.agent_sessions(id) ON DELETE CASCADE,
    CONSTRAINT agent_runs_user_message_id_fkey
        FOREIGN KEY (user_message_id) REFERENCES public.agent_messages(id) ON DELETE RESTRICT,
    CONSTRAINT agent_runs_assistant_message_id_fkey
        FOREIGN KEY (assistant_message_id) REFERENCES public.agent_messages(id) ON DELETE SET NULL,
    CONSTRAINT agent_runs_status_check
        CHECK (status = ANY (ARRAY[
            'RUNNING'::text,
            'COMPLETED'::text,
            'FAILED'::text,
            'CANCELLED'::text
        ])),
    CONSTRAINT agent_runs_input_tokens_nonnegative_check
        CHECK (input_tokens IS NULL OR input_tokens >= 0),
    CONSTRAINT agent_runs_output_tokens_nonnegative_check
        CHECK (output_tokens IS NULL OR output_tokens >= 0),
    CONSTRAINT agent_runs_total_tokens_nonnegative_check
        CHECK (total_tokens IS NULL OR total_tokens >= 0),
    CONSTRAINT agent_runs_duration_nonnegative_check
        CHECK (duration_ms IS NULL OR duration_ms >= 0),
    CONSTRAINT agent_runs_time_order_check
        CHECK (finished_at IS NULL OR finished_at >= started_at),
    CONSTRAINT agent_runs_unique_session_user_message
        UNIQUE (session_id, user_message_id)
);

CREATE UNIQUE INDEX agent_runs_assistant_message_unique_idx
    ON public.agent_runs USING btree (assistant_message_id)
    WHERE (assistant_message_id IS NOT NULL);

CREATE INDEX agent_runs_session_status_started_idx
    ON public.agent_runs USING btree (session_id, status, started_at DESC);


CREATE TABLE public.agent_tool_runs (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    session_id uuid NOT NULL,
    agent_run_id uuid NOT NULL,
    tool_name text NOT NULL,
    status text DEFAULT 'PENDING'::text NOT NULL,
    args_json jsonb NOT NULL,
    result_json jsonb,
    error_code text,
    error_message text,
    idempotency_key text,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    finished_at timestamp with time zone,
    duration_ms bigint,
    CONSTRAINT agent_tool_runs_pkey PRIMARY KEY (id),
    CONSTRAINT agent_tool_runs_session_id_fkey
        FOREIGN KEY (session_id) REFERENCES public.agent_sessions(id) ON DELETE CASCADE,
    CONSTRAINT agent_tool_runs_agent_run_id_fkey
        FOREIGN KEY (agent_run_id) REFERENCES public.agent_runs(id) ON DELETE CASCADE,
    CONSTRAINT agent_tool_runs_status_check
        CHECK (status = ANY (ARRAY[
            'PENDING'::text,
            'RUNNING'::text,
            'SUCCEEDED'::text,
            'FAILED'::text,
            'CANCELLED'::text
        ])),
    CONSTRAINT agent_tool_runs_tool_name_not_blank_check
        CHECK (btrim(tool_name) <> ''::text),
    CONSTRAINT agent_tool_runs_args_json_object_check
        CHECK (jsonb_typeof(args_json) = 'object'::text),
    CONSTRAINT agent_tool_runs_duration_nonnegative_check
        CHECK (duration_ms IS NULL OR duration_ms >= 0),
    CONSTRAINT agent_tool_runs_time_order_check
        CHECK (finished_at IS NULL OR finished_at >= started_at),
    CONSTRAINT agent_tool_runs_idempotency_not_blank_check
        CHECK (idempotency_key IS NULL OR btrim(idempotency_key) <> ''::text)
);

CREATE INDEX agent_tool_runs_agent_run_status_idx
    ON public.agent_tool_runs USING btree (agent_run_id, status);

CREATE INDEX agent_tool_runs_session_started_idx
    ON public.agent_tool_runs USING btree (session_id, started_at DESC);

CREATE UNIQUE INDEX agent_tool_runs_session_idempotency_key_unique_idx
    ON public.agent_tool_runs USING btree (session_id, idempotency_key)
    WHERE (idempotency_key IS NOT NULL);


ALTER TABLE public.agent_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_tool_runs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert own agent sessions"
    ON public.agent_sessions
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own agent sessions"
    ON public.agent_sessions
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update own agent sessions"
    ON public.agent_sessions
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own agent sessions"
    ON public.agent_sessions
    FOR DELETE
    USING (auth.uid() = user_id);


CREATE POLICY "Users can insert own agent messages"
    ON public.agent_messages
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1
            FROM public.agent_sessions s
            WHERE s.id = agent_messages.session_id
              AND s.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can view own agent messages"
    ON public.agent_messages
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1
            FROM public.agent_sessions s
            WHERE s.id = agent_messages.session_id
              AND s.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update own agent messages"
    ON public.agent_messages
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1
            FROM public.agent_sessions s
            WHERE s.id = agent_messages.session_id
              AND s.user_id = auth.uid()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1
            FROM public.agent_sessions s
            WHERE s.id = agent_messages.session_id
              AND s.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete own agent messages"
    ON public.agent_messages
    FOR DELETE
    USING (
        EXISTS (
            SELECT 1
            FROM public.agent_sessions s
            WHERE s.id = agent_messages.session_id
              AND s.user_id = auth.uid()
        )
    );


CREATE POLICY "Users can insert own agent runs"
    ON public.agent_runs
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1
            FROM public.agent_sessions s
            WHERE s.id = agent_runs.session_id
              AND s.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can view own agent runs"
    ON public.agent_runs
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1
            FROM public.agent_sessions s
            WHERE s.id = agent_runs.session_id
              AND s.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update own agent runs"
    ON public.agent_runs
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1
            FROM public.agent_sessions s
            WHERE s.id = agent_runs.session_id
              AND s.user_id = auth.uid()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1
            FROM public.agent_sessions s
            WHERE s.id = agent_runs.session_id
              AND s.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete own agent runs"
    ON public.agent_runs
    FOR DELETE
    USING (
        EXISTS (
            SELECT 1
            FROM public.agent_sessions s
            WHERE s.id = agent_runs.session_id
              AND s.user_id = auth.uid()
        )
    );


CREATE POLICY "Users can insert own agent tool runs"
    ON public.agent_tool_runs
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1
            FROM public.agent_sessions s
            WHERE s.id = agent_tool_runs.session_id
              AND s.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can view own agent tool runs"
    ON public.agent_tool_runs
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1
            FROM public.agent_sessions s
            WHERE s.id = agent_tool_runs.session_id
              AND s.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update own agent tool runs"
    ON public.agent_tool_runs
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1
            FROM public.agent_sessions s
            WHERE s.id = agent_tool_runs.session_id
              AND s.user_id = auth.uid()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1
            FROM public.agent_sessions s
            WHERE s.id = agent_tool_runs.session_id
              AND s.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete own agent tool runs"
    ON public.agent_tool_runs
    FOR DELETE
    USING (
        EXISTS (
            SELECT 1
            FROM public.agent_sessions s
            WHERE s.id = agent_tool_runs.session_id
              AND s.user_id = auth.uid()
        )
    );


COMMENT ON TABLE public.agent_sessions IS
    'Durable orchestration session state for the single-agent create flow.';
COMMENT ON TABLE public.agent_messages IS
    'Ordered message timeline (USER/ASSISTANT/SYSTEM/TOOL) for each agent session.';
COMMENT ON TABLE public.agent_runs IS
    'One agent execution cycle per user message, with model and token telemetry.';
COMMENT ON TABLE public.agent_tool_runs IS
    'Tool-level execution log with idempotency control for side-effectful calls.';
