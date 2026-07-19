-- Style discovery chat is part of preparing a portfolio generation and is
-- protected by a per-user rate limit. It must not consume refinement
-- allowances or purchased credits. Restore any reservations written by the
-- former style-chat billing policy while preserving the append-only ledger.

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
    reservation.profile_id,
    -reservation.delta_credits,
    CASE reservation.reason
        WHEN 'allowance_reservation' THEN 'allowance_refund'
        ELSE 'credit_refund'
    END,
    reservation.id,
    reservation.credit_bucket,
    reservation.grant_entry_id,
    jsonb_build_object(
        'reservation_id', reservation.id::text,
        'failure_reason', 'style_chat_billing_correction',
        'operation_code', 'style_chat',
        'credit_bucket', reservation.credit_bucket,
        'corrected_by_migration', 'V52'
    ),
    now()
FROM public.billing_credit_ledger_entries AS reservation
WHERE reservation.delta_credits < 0
  AND reservation.reason IN ('allowance_reservation', 'credit_reservation')
  AND reservation.metadata ->> 'operation_code' = 'style_chat'
  AND NOT EXISTS (
      SELECT 1
      FROM public.billing_credit_ledger_entries AS refund
      WHERE refund.credit_operation_id = reservation.id
        AND refund.reason = CASE reservation.reason
            WHEN 'allowance_reservation' THEN 'allowance_refund'
            ELSE 'credit_refund'
        END
  );
