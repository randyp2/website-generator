-- Protect internal operational data exposed through Supabase's public schema.
-- Spring accesses these tables through its privileged JDBC role. No RLS
-- policies are intentionally defined, so non-bypass roles receive no rows.

ALTER TABLE public.billing_credit_ledger_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.billing_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.billing_promotion_eligibilities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.billing_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_email_deliveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.account_deletion_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stripe_webhook_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolio_refinement_sessions ENABLE ROW LEVEL SECURITY;

-- Supabase defines these Data API roles, while the local Docker PostgreSQL
-- instance does not. Revoke their table privileges only where the roles exist
-- so the same Flyway migration remains valid in both environments.
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anon') THEN
        EXECUTE
            'REVOKE ALL PRIVILEGES ON TABLE '
            'public.billing_credit_ledger_entries, '
            'public.billing_invoices, '
            'public.billing_promotion_eligibilities, '
            'public.billing_subscriptions, '
            'public.notification_email_deliveries, '
            'public.account_deletion_requests, '
            'public.stripe_webhook_events, '
            'public.portfolio_refinement_sessions '
            'FROM anon';
    END IF;

    IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticated') THEN
        EXECUTE
            'REVOKE ALL PRIVILEGES ON TABLE '
            'public.billing_credit_ledger_entries, '
            'public.billing_invoices, '
            'public.billing_promotion_eligibilities, '
            'public.billing_subscriptions, '
            'public.notification_email_deliveries, '
            'public.account_deletion_requests, '
            'public.stripe_webhook_events, '
            'public.portfolio_refinement_sessions '
            'FROM authenticated';
    END IF;
END
$$;
