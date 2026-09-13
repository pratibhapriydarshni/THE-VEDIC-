# THE VEDIC ASTRO — V53

V53 is the next cumulative production-candidate increment from V52.

## Implemented
- Real Supabase email/password login.
- Real customer registration with profile metadata.
- Authenticated customer booking API.
- Dashboard loads the customer's bookings and reports using a bearer session.
- Browser Supabase client helper with persistent sessions.
- Business-rule test runner that requires no external service credentials.
- Additional booking/payment database hardening.

## Run
```bash
npm install
npm run typecheck
npm run test:business-rules
npm run build
```

## Important
External services are intentionally not faked. Razorpay, Supabase production, WhatsApp, LiveKit, OpenAI and Vercel must be configured with the owner's real credentials before launch.
