<<<<<<< HEAD
# THE VEDIC ASTRO — V52 Production Integration Release

V52 is the next cumulative production-candidate layer over V51. It focuses on making the booking and operational path stricter and safer rather than adding another isolated demo module.

## V52 changes
- Server-side Zod validation for booking creation.
- Server-side working-hours validation: Mon/Tue/Thu/Fri/Sat/Sun 18:00–23:00 IST; Wed 10:00–22:00 IST.
- 10-minute slot enforcement and full-duration fit checks.
- Same-day minimum 3-hour notice enforced server-side.
- Service-driven duration lookup.
- Safer slot discovery with pending/confirmed/paid conflict filtering.
- Admin booking action endpoint for confirm, mark-paid, reschedule, cancel and block operations.
- Production security response headers/CSP middleware.
- Database indexes for booking, file and review workloads.
- Payment-id uniqueness hardening where supported by the existing schema.
- Improved health endpoint with database check and latency.
- Environment template refreshed for production services.

## Important
This is still a **production candidate**, not a claim that third-party accounts are connected or that deployment has passed end-to-end staging tests. Before launch, apply migrations, configure environment secrets, connect Supabase/Razorpay/WhatsApp/LiveKit/OpenAI, run typecheck/build, and test the full customer → payment → consultation → report → review lifecycle.

## V53 verification
Run `npm run test:business-rules` before staging deployment. Then run `npm run typecheck` and `npm run build` in the deployment environment.
=======
# THE-VEDIC-ASTRO
Vedic Astro is a modern astrology platform that brings traditional Vedic astrology into a simple, user-friendly digital experience. Explore birth charts, zodiac signs, planetary insights, and personalized astrology features through a clean and responsive web application.
>>>>>>> 62cd8c53d6b12c7c7d906ee5d4e187948290e393
