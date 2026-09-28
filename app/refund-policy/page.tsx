import SiteNav from '@/components/site-nav';
import SiteFooter from '@/components/site-footer';

export default function Page() {
  return (
    <>
      <SiteNav />

      <main className="wrap">
        <div className="card">
          <h1>Refund &amp; Rescheduling Policy</h1>

          <p className="muted">
            THE VEDIC ASTRO · Pt. Deepak Acharya
          </p>

          <p>
            <strong>Last Updated:</strong> September 2026
          </p>

          <p>
            This policy explains the general refund and rescheduling
            rules applicable to consultations booked through THE VEDIC
            ASTRO.
          </p>

          <h2>1. Booking Confirmation</h2>
          <p>
            Full payment is required to confirm a paid consultation.
            Where manual payment verification applies, the booking may
            remain pending until payment has been successfully verified.
          </p>

          <h2>2. Customer Cancellation</h2>
          <p>
            Confirmed consultation bookings are generally not
            cancellable by the customer. Please check the selected
            service, date, time, duration and consultation mode before
            completing payment.
          </p>

          <h2>3. Rescheduling</h2>
          <p>
            Where circumstances permit, a confirmed consultation may be
            rescheduled to another available slot. Rescheduling is
            subject to availability and approval.
          </p>

          <h2>4. Provider Unavailability</h2>
          <p>
            If THE VEDIC ASTRO is unable to provide a confirmed
            consultation at the scheduled time, the customer may be
            offered an alternative available slot or an eligible refund.
          </p>

          <h2>5. Eligible Refunds</h2>
          <p>
            Where a refund is approved, the eligible amount may be
            returned using an available payment method. Refund
            processing is intended to be initiated within up to three
            days after approval, although the time taken for the amount
            to appear may also depend on the customer's bank, UPI
            provider or payment service.
          </p>

          <h2>6. Incorrect or Duplicate Payment</h2>
          <p>
            If you believe you have made an incorrect or duplicate
            payment, contact us with the relevant booking and payment
            reference information so the transaction can be reviewed.
          </p>

          <h2>7. Missed Consultation</h2>
          <p>
            A refund is not automatically available when a customer
            misses a confirmed consultation. Any rescheduling or other
            resolution will depend on the circumstances and
            availability.
          </p>

          <h2>8. Technical Issues</h2>
          <p>
            If a consultation cannot reasonably proceed because of a
            significant service-side technical issue, we may arrange
            another suitable slot or determine another appropriate
            resolution.
          </p>

          <h2>9. How to Request Assistance</h2>
          <p>
            For a payment, rescheduling or eligible refund issue,
            contact THE VEDIC ASTRO through the Contact page and provide
            your booking details and relevant transaction reference.
            Never send your UPI PIN, OTP, card PIN or banking password.
          </p>

          <a className="cta" href="/contact">
            Contact Support
          </a>
        </div>
      </main>

      <SiteFooter />
    </>
  );
}