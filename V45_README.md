# THE VEDIC ASTRO V45

V45 adds the admin final-report workflow on top of V44.

## Added
- Admin-only report registration API
- Admin report listing by booking
- Admin report deletion including private storage cleanup
- Consultation report metadata table
- Customer-scoped report metadata fields
- Admin upload component

## Security
The report APIs require a Supabase access token and `super_admin` or `staff_admin` role. The storage bucket must remain private. The existing V44 upload endpoint must enforce booking/admin authorization in production; do not expose the service-role key to the browser.

## Production integration
After applying the migration, connect the admin component to the real admin dashboard and issue signed download URLs through the existing customer report endpoint. Verify RLS and storage policies before deployment.
