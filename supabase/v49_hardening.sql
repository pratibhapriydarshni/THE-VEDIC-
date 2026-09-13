-- V49 production-hardening additions. Run after the cumulative V23-V48 migrations.
create index if not exists idx_bookings_customer_start on public.bookings(customer_id, start_at desc);
create index if not exists idx_bookings_start_status on public.bookings(start_at, status);
create index if not exists idx_notifications_booking on public.booking_notifications(booking_id, created_at desc);
create index if not exists idx_payment_transactions_booking on public.payment_transactions(booking_id, created_at desc);
create index if not exists idx_consultation_files_booking on public.consultation_files(booking_id, created_at desc);
create index if not exists idx_reviews_created_at on public.reviews(created_at desc);
