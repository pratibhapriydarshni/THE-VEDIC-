-- V52 production hardening. Run after V47/V49/V50/V51 migrations.
create index if not exists idx_bookings_status_start on public.bookings(status,start_at);
create index if not exists idx_bookings_customer_status on public.bookings(customer_id,status);
create index if not exists idx_booking_files_booking on public.consultation_files(booking_id,created_at);
create index if not exists idx_reviews_created on public.reviews(created_at desc);

-- Prevent duplicate payment IDs and webhook replay when the columns exist.
do $$ begin
  if exists (select 1 from information_schema.columns where table_schema='public' and table_name='bookings' and column_name='razorpay_payment_id') then
    execute 'create unique index if not exists idx_bookings_razorpay_payment on public.bookings(razorpay_payment_id) where razorpay_payment_id is not null';
  end if;
end $$;

-- Customer cancellation remains disabled by policy; only admins may mutate booking status.
-- Service-role APIs perform payment/webhook mutations server-side.
