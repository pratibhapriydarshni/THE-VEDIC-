-- V54: payment idempotency + stronger booking/payment integrity.
create unique index if not exists bookings_razorpay_order_uidx on public.bookings(razorpay_order_id) where razorpay_order_id is not null;
create unique index if not exists bookings_razorpay_payment_uidx on public.bookings(razorpay_payment_id) where razorpay_payment_id is not null;

-- A booking cannot be paid without a confirmed payment identifier.
alter table public.bookings drop constraint if exists paid_requires_payment_id;
alter table public.bookings add constraint paid_requires_payment_id check (
  payment_status <> 'paid' or razorpay_payment_id is not null
);

-- Payment webhook events must remain idempotent.
create unique index if not exists payment_webhook_events_event_uidx on public.payment_webhook_events(event_id);
