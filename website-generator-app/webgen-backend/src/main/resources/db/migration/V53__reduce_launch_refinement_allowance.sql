-- Launch access now includes one portfolio refinement instead of two.
-- Append one linked adjustment per existing two-unit launch grant so the
-- ledger remains immutable and already-claimed promotions follow the policy.

INSERT INTO public.billing_credit_ledger_entries (
    id,
    profile_id,
    delta_credits,
    reason,
    credit_operation_id,
    credit_bucket,
    grant_entry_id,
    metadata,
    created_at
)
SELECT
    gen_random_uuid(),
    grant.profile_id,
    -1,
    'promotion_adjustment',
    grant.id,
    grant.credit_bucket,
    grant.id,
    jsonb_build_object(
        'campaign_key', 'launch_access_2026',
        'credit_bucket', 'portfolio_refinement',
        'previous_units_granted', 2,
        'adjusted_units_granted', 1,
        'adjusted_by_migration', 'V53'
    ),
    now()
FROM public.billing_credit_ledger_entries AS grant
WHERE grant.reason = 'promotion_grant'
  AND grant.credit_bucket = 'portfolio_refinement'
  AND grant.delta_credits = 2
  AND grant.metadata ->> 'campaign_key' = 'launch_access_2026'
  AND NOT EXISTS (
      SELECT 1
      FROM public.billing_credit_ledger_entries AS adjustment
      WHERE adjustment.credit_operation_id = grant.id
        AND adjustment.reason = 'promotion_adjustment'
  );
