-- V55: Manual UPI + UTR payment verification
-- THE VEDIC ASTRO

alter table public.bookings
  add column if not exists payment_method text,
  add column if not exists upi_utr text,
  add column if not exists payment_submitted_at timestamptz,
  add column if not exists payment_verified_at timestamptz,
  add column if not exists payment_verified_by uuid references auth.users(id);

-- Prevent the same UTR from being used for multiple bookings.
create unique index if not exists bookings_upi_utr_uidx
  on public.bookings(upi_utr)
  where upi_utr is not null;

-- Allowed payment methods.
alter table public.bookings
  drop constraint if exists bookings_payment_method_check;

alter table public.bookings
  add constraint bookings_payment_method_check
  check (
    payment_method is null
    or payment_method in ('razorpay', 'upi_manual')
  );

-- Replace the old Razorpay-only paid requirement.
alter table public.bookings
  drop constraint if exists paid_requires_payment_id;

alter table public.bookings
  add constraint paid_requires_payment_id
  check (
    payment_status <> 'paid'
    or razorpay_payment_id is not null
    or (
      payment_method = 'upi_manual'
      and upi_utr is not null
      and payment_verified_at is not null
    )
  );

create index if not exists bookings_payment_review_idx
  on public.bookings(payment_status, payment_submitted_at);