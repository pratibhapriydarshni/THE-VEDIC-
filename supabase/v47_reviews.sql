-- V47: private review moderation fields.
-- Apply after the canonical reviews table exists.

alter table if exists public.consultation_reviews
  add column if not exists moderation_status text not null default 'active'
    check (moderation_status in ('active','archived'));

create index if not exists consultation_reviews_moderation_idx
  on public.consultation_reviews (moderation_status, created_at desc);

-- Public users must not be granted select access to this table.
-- Admin policies should use the canonical admin-role helper from the project.
