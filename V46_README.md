# THE VEDIC ASTRO — V46

V46 completes the customer-facing post-consultation workflow on top of V45.

## Added
- Customer-authenticated report listing scoped to the signed-in customer.
- Short-lived signed report download URLs (5 minutes).
- Customer private 1–5 star review submission with optional written review.
- One review per booking via a unique booking constraint.
- Review endpoint requires the consultation to be completed/ended.
- Supabase migration for `consultation_reviews` with RLS enabled.
- Customer post-consultation component for report downloads and private review.

## Production requirements
- Apply `supabase/migration.sql` in the production Supabase project.
- Add explicit RLS policies for the project's exact `profiles`/`bookings` ownership model before relying on direct client-side Supabase queries.
- Connect the component to the real authenticated customer dashboard/booking page.
- Keep `SUPABASE_SERVICE_ROLE_KEY` server-side only.
