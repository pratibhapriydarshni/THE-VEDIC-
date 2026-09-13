-- V51 final-production candidate hardening.
create unique index if not exists idx_booking_notifications_idempotency on public.booking_notifications(idempotency_key);
create index if not exists idx_booking_notifications_status on public.booking_notifications(status,created_at);
create index if not exists idx_payment_webhooks_event on public.payment_webhook_events(event_id);
create index if not exists idx_bookings_customer_start on public.bookings(customer_id,start_at);
create index if not exists idx_consultation_messages_booking_created on public.consultation_messages(booking_id,created_at);
-- Prevent customers from writing admin-only operational fields through direct Supabase access.
-- Keep service-role mutations server-side. Review existing RLS policies before production deployment.
