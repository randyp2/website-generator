ALTER TABLE public.asset_verification_jobs
    ADD COLUMN credit_reservation_id uuid;

ALTER TABLE public.asset_verification_jobs
    ADD CONSTRAINT asset_verification_jobs_credit_reservation_id_fkey
        FOREIGN KEY (credit_reservation_id)
        REFERENCES public.billing_credit_ledger_entries(id)
        ON DELETE SET NULL;

CREATE UNIQUE INDEX asset_verification_jobs_credit_reservation_id_key
    ON public.asset_verification_jobs (credit_reservation_id)
    WHERE credit_reservation_id IS NOT NULL;

COMMENT ON COLUMN public.asset_verification_jobs.credit_reservation_id IS
    'Credit reservation charged once for this verification and refunded only on terminal failure.';
