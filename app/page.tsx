import SiteNav from '@/components/site-nav';
import SiteFooter from '@/components/site-footer';

export default function Home() {
  return (
    <>
      <SiteNav />

      <section className="hero">
        <div className="wrap">
          <p className="gold">
            <b>25 YEARS OF EXPERIENCE</b>
          </p>

          <h1>THE VEDIC ASTRO</h1>

          <h2>
            Guidance Rooted in Vedic Wisdom, Clarity for Your Path.
          </h2>

          <p className="muted">
            Kundli Specialist & Astro-Palmist · Pt. Deepak Acharya
          </p>

          <a className="cta" href="/book">
            Book a Consultation
          </a>
        </div>
      </section>

      <main className="wrap">
        <section>
          <h2>Professional Guidance</h2>

          <div className="grid">
            {[
              ['Kundli Consultation', '₹499 / 30 min'],
              ['Palmistry', '₹499 / 30 min'],
              ['Vastu Consultation', '₹799 / 45 min'],
              ['Career Guidance', '₹499 / 30 min'],
              ['Relationship Guidance', '₹499 / 30 min'],
              ['Family Guidance', '₹499 / 30 min'],
              ['Occult Consultation', '₹599 / 30 min'],
              ['Motivational Guidance', '₹399 / 30 min'],
            ].map(([a, b]) => (
              <article className="card" key={a}>
                <h3>{a}</h3>
                <p className="price">{b}</p>

                <a className="cta" href="/book">
                  Book
                </a>
              </article>
            ))}
          </div>
        </section>

        <section className="card" style={{ marginTop: 24 }}>
          <h2>About Pt. Deepak Acharya</h2>

          <p>
            With more than 25 years of experience in astrology and palmistry,
            Pt. Deepak Acharya has guided thousands of people through important
            questions and challenges in their lives. His approach combines
            traditional Vedic knowledge with practical guidance, helping
            individuals gain clarity about their path, understand possibilities,
            and make more informed decisions. Over the years, his consultations
            have helped people find greater confidence, direction, and peace of
            mind.
          </p>

          <p>
            <b>Acharya (Master in Astrology)</b> from Central University, New
            Delhi · Hastrekha Srimani Vidya Varidhi · Diploma in Vastu
          </p>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
