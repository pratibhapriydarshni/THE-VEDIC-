import SiteNav from '@/components/site-nav';
import SiteFooter from '@/components/site-footer';

export default function Page() {
  return (
    <>
      <SiteNav />

      <main className="wrap">
        <div className="card">
          <h1>Terms &amp; Conditions</h1>

          <p className="muted">
            THE VEDIC ASTRO · Pt. Deepak Acharya
          </p>

          <p>
            <strong>Last Updated:</strong> September 2026
          </p>

          <p>
            These Terms &amp; Conditions govern the use of THE VEDIC
            ASTRO website and its consultation services. By using the
            website or booking a consultation, you agree to these terms
            and the policies referenced on this website.
          </p>

          <h2>1. Services</h2>
          <p>
            THE VEDIC ASTRO provides astrology and related guidance
            services, which may include Kundli Consultation, Palmistry,
            Vastu Consultation, Career Guidance, Relationship Guidance,
            Family Guidance, Occult Consultation and Motivational
            Guidance.
          </p>

          <h2>2. Consultation Modes</h2>
          <p>
            Consultations may be offered through available modes such
            as Chat, Audio or Video. Available modes, duration, price
            and time slots are displayed during booking.
          </p>

          <h2>3. Booking</h2>
          <p>
            Customers must provide accurate information while making a
            booking. A booking is subject to availability and applicable
            payment requirements.
          </p>
          <p>
            Same-day bookings may be available when a suitable slot is
            available and the booking is made at least three hours
            before the selected consultation time.
          </p>

          <h2>4. Payment and Confirmation</h2>
          <p>
            Full payment is required to confirm a paid consultation.
            Where payment verification is required, a booking may
            remain pending until the payment has been received and
            verified.
          </p>
          <p>
            Customers must not share UPI PINs, OTPs, card PINs,
            passwords or other confidential authentication information
            with THE VEDIC ASTRO.
          </p>

          <h2>5. Customer Information</h2>
          <p>
            Customers are responsible for providing correct booking and
            consultation information. This may include birth details,
            contact information and documents relevant to the requested
            consultation.
          </p>
          <p>
            If an exact date or time of birth is unavailable, the
            consultation may proceed using other appropriate
            consultation methods where available.
          </p>

          <h2>6. Consultation Files</h2>
          <p>
            Customers may upload permitted files relevant to their
            consultation. Users must not upload unlawful, harmful,
            infringing or unrelated material.
          </p>

          <h2>7. Rescheduling and Cancellation</h2>
          <p>
            Confirmed consultations are generally not intended for
            customer cancellation. Where appropriate, a rescheduling
            request may be considered subject to availability and the
            applicable booking policy.
          </p>
          <p>
            If THE VEDIC ASTRO is unable to provide a confirmed
            consultation, an alternative slot or an eligible refund may
            be offered in accordance with the Refund Policy.
          </p>

          <h2>8. Consultation Conduct</h2>
          <p>
            Users must communicate respectfully and must not misuse,
            disrupt or attempt to compromise the website, consultation
            system, accounts or other users.
          </p>

          <h2>9. No Guaranteed Outcome</h2>
          <p>
            Astrology and related consultations provide guidance and
            interpretation. No specific event, result, remedy, personal
            outcome or future outcome is guaranteed.
          </p>

          <h2>10. Important Decisions</h2>
          <p>
            Information provided through the service should not be
            treated as a substitute for qualified medical, legal,
            financial or other regulated professional advice.
            Customers remain responsible for their own decisions and
            actions.
          </p>

          <h2>11. Account Security</h2>
          <p>
            Users are responsible for maintaining the confidentiality
            of their account credentials and for activity carried out
            through their account. Please notify us if you reasonably
            believe your account has been compromised.
          </p>

          <h2>12. Intellectual Property</h2>
          <p>
            Unless otherwise stated, the website's original branding,
            design, text and service content are intended for personal
            use and may not be copied, republished or commercially
            exploited without appropriate permission.
          </p>

          <h2>13. Availability</h2>
          <p>
            We aim to keep the website and consultation services
            available, but uninterrupted or error-free operation cannot
            be guaranteed. Maintenance, technical issues or third-party
            service interruptions may occasionally affect availability.
          </p>

          <h2>14. Changes to These Terms</h2>
          <p>
            These terms may be updated when the service or applicable
            requirements change. The current version will be published
            on this page.
          </p>

          <h2>15. Contact</h2>
          <p>
            Questions regarding these terms can be submitted through
            the Contact page.
          </p>

          <a className="cta" href="/book">
            Book Consultation
          </a>
        </div>
      </main>

      <SiteFooter />
    </>
  );
}