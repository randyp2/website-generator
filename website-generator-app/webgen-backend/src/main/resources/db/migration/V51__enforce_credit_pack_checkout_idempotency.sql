CREATE UNIQUE INDEX billing_credit_ledger_entries_credit_pack_checkout_session_key
    ON public.billing_credit_ledger_entries USING btree (checkout_session_id)
    WHERE checkout_session_id IS NOT NULL
      AND reason = 'credit_pack_purchase'::text;

COMMENT ON INDEX public.billing_credit_ledger_entries_credit_pack_checkout_session_key IS
    'Prevents duplicate credit-pack fulfillment across distinct Stripe webhook events.';
