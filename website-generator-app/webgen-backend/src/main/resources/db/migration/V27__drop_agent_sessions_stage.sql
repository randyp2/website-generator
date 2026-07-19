-- Drop the stage column from agent_sessions.
--
-- The orchestrator no longer drives flow via a session-stage enum. Tool-run
-- history and memory_json are now the only sources of truth for what the agent
-- should do next.

ALTER TABLE public.agent_sessions
    DROP CONSTRAINT IF EXISTS agent_sessions_stage_check;

ALTER TABLE public.agent_sessions
    DROP COLUMN IF EXISTS stage;
