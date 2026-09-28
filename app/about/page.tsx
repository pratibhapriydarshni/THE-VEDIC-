import SiteNav from '@/components/site-nav';
import SiteFooter from '@/components/site-footer';

export default function Page() {
  return (
    <>
      <SiteNav />

      <main className="wrap">
        <div className="card">
          <h1>About Pt. Deepak Acharya</h1>

          <p className="muted">
            Kundli Specialist & Astro-Palmist | 25 Years of Experience
          </p>

          <h2>Experience Rooted in Vedic Wisdom</h2>

          <p>
            Pt. Deepak Acharya is a Kundli Specialist and Astro-Palmist with
            over 25 years of experience in Vedic Astrology. His approach
            combines traditional Vedic knowledge with thoughtful, practical
            guidance, helping individuals understand different phases of life
            with greater clarity and confidence.
          </p>

          <p>
            With academic and professional study in Astrology, Palmistry and
            Vastu, he has spent years consulting people on matters related to
            career, relationships, family, personal growth and important life
            decisions. His consultations are focused on understanding each
            person's individual circumstances rather than providing generic
            predictions.
          </p>

          <h2>A Personal Approach to Vedic Guidance</h2>

          <p>
            Every individual has a different journey, and therefore every
            consultation deserves individual attention. Pt. Deepak Acharya
            believes astrology should be used as a tool for understanding and
            guidance, not as a source of fear. His aim is to explain
            astrological observations in a simple and respectful manner so
            that clients can better understand their circumstances and make
            their own informed decisions.
          </p>

          <h2>Traditional Wisdom, Modern Consultation</h2>

          <p>
            THE VEDIC ASTRO brings traditional Vedic consultation into a
            convenient modern format. Clients can choose Chat, Audio or Video
            consultation in Hindi or English, with services including Kundli
            Consultation, Palmistry, Vastu, Career Guidance, Relationship and
            Family Guidance, and other areas of Vedic consultation.
          </p>

          <h2>Our Philosophy</h2>

          <p>
            At THE VEDIC ASTRO, the purpose is not to promise miracles or
            guaranteed outcomes. The focus is on providing sincere,
            confidential and responsible guidance rooted in Vedic wisdom.
            Astrology can offer another perspective on life's questions,
            while the choices and decisions ultimately remain with the
            individual.
          </p>

          <h2>Qualifications & Credentials</h2>

          <p>
            <strong>Acharya (Master in Astrology)</strong> — Central
            University, New Delhi
          </p>

          <p>
            <strong>Hastrekha Srimani Vidya Varidhi</strong>
          </p>

          <p>
            <strong>Diploma in Vastu</strong>
          </p>

          <blockquote>
            “Guidance Rooted in Vedic Wisdom, Clarity for Your Path.”
          </blockquote>

          <a className="cta" href="/book">
            Book a Consultation
          </a>
        </div>
      </main>

      <SiteFooter />
    </>
  );
}