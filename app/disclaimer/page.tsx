import SiteNav from '@/components/site-nav';
import SiteFooter from '@/components/site-footer';

export default function Page() {
  return (
    <>
      <SiteNav />

      <main className="wrap">
        <div className="card">
          <h1>Disclaimer</h1>

          <p className="muted">
            THE VEDIC ASTRO · Pt. Deepak Acharya
          </p>

          <p>
            <strong>Last Updated:</strong> September 2026
          </p>

          <h2>1. Astrology as Guidance</h2>
          <p>
            Astrology, palmistry, Vastu and related services provided
            through THE VEDIC ASTRO are intended to provide guidance,
            interpretation and personal insight based on traditional
            practices.
          </p>

          <h2>2. No Guaranteed Predictions or Results</h2>
          <p>
            Astrology involves interpretation. THE VEDIC ASTRO does not
            guarantee that any prediction, event, remedy, expectation
            or particular outcome will occur.
          </p>
          <p>
            Individual circumstances differ, and consultation outcomes
            should not be interpreted as promises or guarantees.
          </p>

          <h2>3. Personal Decisions</h2>
          <p>
            Customers remain responsible for their own choices,
            decisions and actions. Consultation guidance should be
            considered together with your own judgment and relevant
            real-world circumstances.
          </p>

          <h2>4. Not Medical Advice</h2>
          <p>
            Information or consultation provided through THE VEDIC
            ASTRO is not medical or mental-health diagnosis or
            treatment. For health concerns, consult an appropriately
            qualified healthcare professional.
          </p>

          <h2>5. Not Legal or Financial Advice</h2>
          <p>
            Astrology consultations are not a substitute for
            professional legal, financial, investment, tax or other
            regulated professional advice. Seek an appropriately
            qualified professional when making decisions in those
            areas.
          </p>

          <h2>6. Information Provided by Customers</h2>
          <p>
            Interpretations may depend on information supplied by the
            customer, including birth details and other consultation
            information. Inaccurate or incomplete information may
            affect the relevance of the consultation.
          </p>

          <h2>7. Website Information</h2>
          <p>
            Articles, horoscope content and other informational material
            published on the website are provided for general
            informational and guidance purposes and should not be
            treated as guaranteed individualized predictions.
          </p>

          <h2>8. Third-Party Services</h2>
          <p>
            The website may use third-party services for hosting,
            authentication, storage, payments or communications.
            Availability and operation of those independent services
            may be subject to their own systems, policies and terms.
          </p>

          <h2>9. Service Availability</h2>
          <p>
            While reasonable efforts are made to provide reliable
            services, uninterrupted access to the website,
            communications or consultation technology cannot be
            guaranteed.
          </p>

          <h2>10. Acceptance</h2>
          <p>
            By using THE VEDIC ASTRO or booking a consultation, you
            acknowledge the nature and limitations of astrology and
            related guidance described in this Disclaimer.
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