ALTER TABLE public.billing_credit_ledger_entries
    ADD COLUMN credit_operation_id uuid;

UPDATE public.billing_credit_ledger_entries
SET credit_operation_id = id
WHERE delta_credits < 0;

CREATE UNIQUE INDEX billing_credit_ledger_entries_operation_reason_key
    ON public.billing_credit_ledger_entries USING btree (credit_operation_id, reason)
    WHERE credit_operation_id IS NOT NULL;

COMMENT ON COLUMN public.billing_credit_ledger_entries.credit_operation_id IS
    'Stable operation identifier linking a credit reservation to its idempotent refund.';
