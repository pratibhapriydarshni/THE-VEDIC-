-- THE VEDIC ASTRO
-- Missing bookings base table

create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),

  customer_id uuid not null references auth.users(id) on delete cascade,
  service_id uuid not null references public.services(id),

  language text not null check (language in ('Hindi','English')),
  mode text not null check (mode in ('Chat','Audio','Video')),

  start_at timestamptz not null,
  duration_minutes integer not null check (duration_minutes in (30,45)),

  name text not null,
  phone text not null,
  email text not null,

  dob text,
  tob text,
  pob text,
  current_place text,
  purpose text,

  status text not null default 'pending',
  payment_status text not null default 'pending',
  consultation_status text not null default 'pending',

  razorpay_order_id text,
  razorpay_payment_id text,

  cancelled_by uuid references auth.users(id),

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists bookings_customer_idx
  on public.bookings(customer_id);

create index if not exists bookings_service_idx
  on public.bookings(service_id);

create index if not exists bookings_start_idx
  on public.bookings(start_at);

alter table public.bookings enable row level security;