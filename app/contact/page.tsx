import SiteNav from '@/components/site-nav';
import SiteFooter from '@/components/site-footer';

export default function Page() {
  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '';

  const whatsappMessage =
    'Hello THE VEDIC ASTRO, I need assistance regarding a consultation.';

  const whatsappLink = whatsappNumber
    ? `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`
    : '#';

  return (
    <>
      <SiteNav />

      <main className="wrap">
        <div className="card">
          <h1>Contact THE VEDIC ASTRO</h1>

          <p className="muted">
            We are here to assist you with bookings, payments and consultation-related queries.
          </p>

          <h2>WhatsApp Support</h2>

          <p>
            Need assistance with your booking or consultation? You can contact
            THE VEDIC ASTRO directly through WhatsApp.
          </p>

          {whatsappNumber ? (
            <a
              className="cta"
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
            >
              Chat on WhatsApp
            </a>
          ) : (
            <p className="muted">WhatsApp support will be available soon.</p>
          )}

          <h2>Booking Support</h2>

          <p>
            For help with consultation slots, booking status or rescheduling,
            please contact us with your booking details.
          </p>

          <h2>Payment Support</h2>

          <p>
            If you have completed a payment but your booking status has not
            been updated, contact support with your booking details and
            transaction reference.
          </p>

          <h2>Email Support</h2>

          <p>
            Email:{' '}
            <a href="mailto:thevedicastroindia@gmail.com">
              thevedicastroindia@gmail.com
            </a>
          </p>

          <h2>Existing Customers</h2>

          <p>
            When contacting support about an existing consultation, please
            keep your booking details available. Never share your password,
            OTP, UPI PIN or other confidential authentication information.
          </p>

          <h2>Book a Consultation</h2>

          <p>
            For astrology guidance, please use our online booking system to
            select your preferred service, consultation mode and available
            time.
          </p>

          <a className="cta" href="/book">
            Book a Consultation
          </a>
        </div>
      </main>

      <SiteFooter />
    </>
  );
}