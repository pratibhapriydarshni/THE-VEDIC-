import SiteNav from '@/components/site-nav';
import SiteFooter from '@/components/site-footer';

const faqs = [
  {
    q: 'What is THE VEDIC ASTRO?',
    a: 'THE VEDIC ASTRO is an online Vedic astrology consultation platform offering personalized guidance through Kundli, Palmistry, Vastu and other consultation services.',
  },
  {
    q: 'Who will conduct my consultation?',
    a: 'Consultations are conducted by Pt. Deepak Acharya, Kundli Specialist & Astro-Palmist with over 25 years of experience.',
  },
  {
    q: 'What consultation services are available?',
    a: 'Services include Kundli Consultation, Palmistry, Vastu Consultation, Career Guidance, Relationship Guidance, Family Guidance, Occult Consultation and Motivational Guidance.',
  },
  {
    q: 'How can I consult?',
    a: 'You can choose Chat, Audio or Video consultation while making your booking.',
  },
  {
    q: 'Which languages are available?',
    a: 'Consultations are available in Hindi and English.',
  },
  {
    q: 'How long is a consultation?',
    a: 'Depending on the selected service, consultation durations are 30 minutes or 45 minutes.',
  },
  {
    q: 'Can I book a consultation for the same day?',
    a: 'Yes. Same-day booking is available when a suitable slot is available and the booking is made at least 3 hours before the consultation.',
  },
  {
    q: 'What details may be required for a consultation?',
    a: 'Depending on the service, you may provide your Date of Birth, Time of Birth, Place of Birth, current place and consultation purpose. Palm images or other relevant documents may also be provided when required.',
  },
  {
    q: "What if I don't know my exact birth time?",
    a: 'You can still request a consultation. The astrologer can guide you about the available consultation approach based on the information you have.',
  },
  {
    q: 'When is my booking confirmed?',
    a: 'Your consultation is confirmed after the required payment has been received and verified.',
  },
  {
    q: 'Can I cancel my consultation?',
    a: 'Bookings are generally not cancellable by the customer after confirmation. If there is an issue, you can contact THE VEDIC ASTRO for assistance.',
  },
  {
    q: 'Can I reschedule my consultation?',
    a: 'Yes. Rescheduling may be available subject to slot availability and the applicable booking policy.',
  },
  {
    q: 'What happens if THE VEDIC ASTRO cannot provide the booked consultation?',
    a: 'Where applicable, you may be offered another suitable slot or a refund according to the Refund Policy.',
  },
  {
    q: 'How long does a refund take?',
    a: 'Where a refund is approved, it is intended to be processed within up to 3 days, subject to the payment method or provider.',
  },
  {
    q: 'Are astrology results guaranteed?',
    a: 'No. Astrology is provided as a form of guidance and perspective. THE VEDIC ASTRO does not guarantee specific outcomes or results. Important personal, medical, legal or financial decisions should not be based solely on an astrology consultation.',
  },
  {
    q: 'Is my personal information kept private?',
    a: "Personal information and consultation-related data are handled according to THE VEDIC ASTRO's Privacy Policy and are used for providing and managing the requested services.",
  },
  {
    q: 'Can overseas customers book a consultation?',
    a: 'Yes. International customers can book available online consultations. Applicable international pricing is displayed during the booking process.',
  },
  {
    q: 'How can I contact THE VEDIC ASTRO if I have a problem?',
    a: "You can use the website's Contact options for assistance related to your booking, payment or consultation.",
  },
];

export default function Page() {
  return (
    <>
      <SiteNav />

      <main className="wrap">
        <div className="card">
          <h1>Frequently Asked Questions</h1>

          <p className="muted">
            Find answers to common questions about THE VEDIC ASTRO,
            consultations, bookings and payments.
          </p>

          <div style={{ marginTop: '24px' }}>
            {faqs.map((faq, index) => (
              <details
                key={index}
                style={{
                  padding: '16px 0',
                  borderBottom: '1px solid rgba(128,128,128,0.25)',
                }}
              >
                <summary
                  style={{
                    cursor: 'pointer',
                    fontWeight: 600,
                    fontSize: '1.05rem',
                  }}
                >
                  {faq.q}
                </summary>

                <p style={{ marginTop: '12px', lineHeight: 1.7 }}>
                  {faq.a}
                </p>
              </details>
            ))}
          </div>

          <div style={{ marginTop: '28px' }}>
            <p>
              Still have a question? Contact us or book a consultation for
              further assistance.
            </p>

            <a className="cta" href="/book">
              Book a Consultation
            </a>
          </div>
        </div>
      </main>

      <SiteFooter />
    </>
  );
}