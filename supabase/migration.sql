create table if not exists services (
 id uuid primary key default gen_random_uuid(), name text not null, description text, price_inr integer not null check(price_inr>=0), price_usd numeric(10,2) not null check(price_usd>=0), duration_minutes integer not null check(duration_minutes>0), enabled boolean not null default true, sort_order integer not null default 0, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists site_content (id uuid primary key default gen_random_uuid(), content_key text unique not null, value_hi text, value_en text, published boolean not null default true, updated_at timestamptz not null default now());
create table if not exists certificates (id uuid primary key default gen_random_uuid(), title text not null, storage_path text not null, mime_type text not null, created_by uuid references auth.users(id), created_at timestamptz not null default now());
create table if not exists staff_admins (user_id uuid primary key references auth.users(id) on delete cascade, active boolean not null default true, created_by uuid references auth.users(id), created_at timestamptz not null default now());
create table if not exists availability_blocks (id uuid primary key default gen_random_uuid(), starts_at timestamptz not null, ends_at timestamptz not null, reason text, created_by uuid references auth.users(id), created_at timestamptz not null default now(), check(ends_at>starts_at));
create index if not exists services_enabled_idx on services(enabled, sort_order);
create index if not exists site_content_key_idx on site_content(content_key);
create index if not exists availability_blocks_range_idx on availability_blocks(starts_at, ends_at);

alter table services enable row level security;
alter table site_content enable row level security;
alter table certificates enable row level security;
alter table staff_admins enable row level security;
alter table availability_blocks enable row level security;

-- Public services/content reads are intentionally limited to enabled/published rows in application queries.
-- Mutating admin policies should be implemented with the project's established admin-role helper from V33+.
