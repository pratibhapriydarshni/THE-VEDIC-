-- V50 production consolidation. Assumes the cumulative booking schema uses bookings.start_at.
create index if not exists idx_bookings_service_start on public.bookings(service_id,start_at);
create index if not exists idx_bookings_payment_status on public.bookings(payment_status,status);
create index if not exists idx_services_enabled_order on public.services(enabled,sort_order);

create or replace function public.is_admin(uid uuid) returns boolean language sql stable security definer set search_path=public as $$
  select exists(select 1 from public.profiles where id=uid and role in ('super_admin','staff_admin'));
$$;
create or replace function public.is_super_admin(uid uuid) returns boolean language sql stable security definer set search_path=public as $$
  select exists(select 1 from public.profiles where id=uid and role='super_admin');
$$;

alter table public.services enable row level security;
alter table public.site_content enable row level security;
alter table public.certificates enable row level security;
alter table public.staff_admins enable row level security;
alter table public.availability_blocks enable row level security;

drop policy if exists services_public_read on public.services;
create policy services_public_read on public.services for select using (enabled=true or public.is_admin(auth.uid()));
drop policy if exists services_admin_write on public.services;
create policy services_admin_write on public.services for all using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

drop policy if exists content_public_read on public.site_content;
create policy content_public_read on public.site_content for select using (published=true or public.is_admin(auth.uid()));
drop policy if exists content_admin_write on public.site_content;
create policy content_admin_write on public.site_content for all using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

drop policy if exists cert_admin_all on public.certificates;
create policy cert_admin_all on public.certificates for all using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

drop policy if exists staff_super_all on public.staff_admins;
create policy staff_super_all on public.staff_admins for all using (public.is_super_admin(auth.uid())) with check (public.is_super_admin(auth.uid()));

drop policy if exists blocks_admin_all on public.availability_blocks;
create policy blocks_admin_all on public.availability_blocks for all using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

-- Database-level overlap protection for confirmed/paid bookings.
create or replace function public.prevent_booking_overlap() returns trigger language plpgsql as $$
declare conflict_id uuid;
begin
  if new.status not in ('confirmed','paid') then return new; end if;
  select b.id into conflict_id from public.bookings b
   where b.id<>new.id and b.status in ('confirmed','paid')
   and tstzrange(b.start_at,b.start_at + make_interval(mins=>b.duration_minutes),'[)') &&
       tstzrange(new.start_at,new.start_at + make_interval(mins=>new.duration_minutes),'[)')
   limit 1;
  if conflict_id is not null then raise exception 'SLOT_UNAVAILABLE'; end if;
  return new;
end; $$;
drop trigger if exists trg_booking_overlap on public.bookings;
create trigger trg_booking_overlap before insert or update of start_at,duration_minutes,status on public.bookings for each row execute function public.prevent_booking_overlap();

-- Safe updated_at helper for V50-managed tables.
create or replace function public.touch_updated_at() returns trigger language plpgsql as $$ begin new.updated_at=now(); return new; end; $$;
drop trigger if exists trg_services_updated_at on public.services;
create trigger trg_services_updated_at before update on public.services for each row execute function public.touch_updated_at();
