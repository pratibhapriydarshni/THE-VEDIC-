-- V53 production hardening: customer booking lookup + safer payment state transitions.
create index if not exists bookings_customer_start_idx on public.bookings(customer_id, start_at);
create index if not exists bookings_status_start_idx on public.bookings(status, start_at);

-- Prevent a booking from being marked paid without a payment id at the database layer.
alter table public.bookings drop constraint if exists paid_requires_payment_id;
alter table public.bookings add constraint paid_requires_payment_id check (
  payment_status <> 'paid' or razorpay_payment_id is not null
);
