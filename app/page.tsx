import SiteNav from "@/components/site-nav";
import SiteFooter from "@/components/site-footer";

const services = [
  {
    icon: "✦",
    title: "Kundli Reading",
    text: "Understand your future, planetary positions & life path.",
    price: "₹499",
    time: "30 min",
  },
  {
    icon: "☝",
    title: "Palmistry",
    text: "Know your personality, strengths & opportunities.",
    price: "₹499",
    time: "30 min",
  },
  {
    icon: "⌂",
    title: "Vastu Consultation",
    text: "Bring harmony, positivity and balance to your space.",
    price: "₹799",
    time: "45 min",
  },
  {
    icon: "▣",
    title: "Career Guidance",
    text: "Get clarity in career, education and professional growth.",
    price: "₹499",
    time: "30 min",
  },
  {
    icon: "♥",
    title: "Relationship Guidance",
    text: "Guidance for love, marriage and relationships.",
    price: "₹499",
    time: "30 min",
  },
  {
    icon: "♟",
    title: "Family Guidance",
    text: "Traditional guidance for family concerns and decisions.",
    price: "₹499",
    time: "30 min",
  },
  {
    icon: "☸",
    title: "Occult Consultation",
    text: "Private spiritual and traditional occult guidance.",
    price: "₹599",
    time: "30 min",
  },
  {
    icon: "☀",
    title: "Motivational Guidance",
    text: "Build confidence, focus and positive direction.",
    price: "₹399",
    time: "30 min",
  },
];

export default function Home() {
  return (
    <>
      <SiteNav />

      <main className="exactHome">

        {/* HERO */}
        <section className="exactHero">
          <div className="exactHeroInner">

            <div className="exactHeroCopy">
              <p className="exactEyebrow">
                WELCOME TO THE VEDIC ASTRO
              </p>

              <h1>
                Discover Your Path Through
                <br />
                Vedic Astrology
              </h1>

              <p className="exactHeroText">
                Get personalized guidance for your life, career,
                relationships, health and future. Connect with an
                experienced astrologer and find clarity in every step
                of your journey.
              </p>

              <div className="exactHeroActions">
                <a href="/book" className="exactBookBtn">
                  ▣ &nbsp; Book a Consultation
                </a>

                <a href="/contact" className="exactContactBtn">
                  ☎ &nbsp; Contact Astrologer
                </a>
              </div>

              <div className="exactModes">
                <span>◯ Chat</span>
                <b />
                <span>◉ Audio</span>
                <b />
                <span>▣ Video</span>
                <b />
                <span>● English & Hindi</span>
              </div>
            </div>

            <div className="exactHeroArt">

              <div className="exactZodiac">
                <span>ॐ</span>
              </div>

              <div className="exactTrishul">♆</div>

              <div className="exactAstroGlow" />

              <img
                src="/deepak-acharya.png"
                alt="Pt. Deepak Acharya"
                className="exactAstrologer"
              />

              <div className="exactNameCard">
                <div className="exactNameOm">ॐ</div>

                <div>
                  <strong>Pt. Deepak Acharya</strong>
                  <small>
                    Kundli Specialist &amp; Astro-Palmist
                  </small>
                </div>
              </div>

              <div className="exactDesk">
                <span className="deskBook">▰</span>
                <span className="deskBook secondBook">▰</span>
                <span className="deskDiya">♨</span>
              </div>

            </div>
          </div>
        </section>

        {/* SERVICES */}
        <section className="exactServices">
          <div className="exactSection">

            <div className="exactServiceHeader">
              <div>
                <p className="exactEyebrow">OUR SERVICES</p>
                <h2>Explore Our Consultations</h2>
              </div>

              <p>
                Choose from a variety of expert services designed to
                guide you in every aspect of life.
              </p>
            </div>

            <div className="exactServiceGrid">
              {services.map((service) => (
                <article
                  className="exactServiceCard"
                  key={service.title}
                >
                  <div className="exactServiceIcon">
                    {service.icon}
                  </div>

                  <div className="exactServiceContent">
                    <h3>{service.title}</h3>

                    <p>{service.text}</p>

                    <div className="exactServicePrice">
                      <strong>{service.price}</strong>
                      <span>|</span>
                      <strong>{service.time}</strong>
                    </div>
                  </div>
                </article>
              ))}
            </div>

          </div>
        </section>

        {/* STEPS */}
        <section className="exactSteps">
          <div className="exactSection">

            <div className="exactCenterHeading">
              <p className="exactEyebrow">HOW IT WORKS</p>

              <h2>Simple 3 Steps to Get Started</h2>

              <p>
                Book your session in just a few clicks and connect
                with Pt. Deepak Acharya.
              </p>
            </div>

            <div className="exactStepsRow">

              <article>
                <div className="exactStepIcon">▣</div>
                <span>01</span>
                <h3>Choose Service</h3>
                <p>
                  Select the consultation type that matches your needs.
                </p>
              </article>

              <div className="exactArrow">⟶</div>

              <article>
                <div className="exactStepIcon">◷</div>
                <span>02</span>
                <h3>Select Slot</h3>
                <p>
                  Pick your preferred available date and time.
                </p>
              </article>

              <div className="exactArrow">⟶</div>

              <article>
                <div className="exactStepIcon">♙</div>
                <span>03</span>
                <h3>Consult Astrologer</h3>
                <p>
                  Connect privately at your scheduled consultation time.
                </p>
              </article>

            </div>

            <div className="exactCenterButton">
              <a href="/services">
                View All Services →
              </a>
            </div>

          </div>
        </section>

        {/* CONSULTANT */}
        <section className="exactConsultant">
          <div className="exactSection exactConsultantGrid">

            <div className="exactProfilePhoto">
              <img
                src="/deepak-acharya.png"
                alt="Pt. Deepak Acharya"
              />

              <span>Pt. Deepak Acharya</span>
            </div>

            <div className="exactProfileInfo">
              <p className="exactEyebrow">
                MEET YOUR CONSULTANT
              </p>

              <h2>Pt. Deepak Acharya</h2>

              <h4>
                Kundli Specialist &amp; Astro-Palmist
              </h4>

              <p>
                With 25 years of experience in Vedic astrology,
                palmistry and Vastu, Pt. Deepak Acharya provides
                traditional guidance for greater clarity and direction.
              </p>

              <div className="exactCredentials">
                <span>✦ 25 Years Experience</span>
                <span>✦ Acharya (Master in Astro)</span>
                <span>✦ Hastrekha Srimani</span>
                <span>✦ Diploma in Vastu</span>
              </div>

              <a href="/about" className="exactProfileBtn">
                View Profile →
              </a>
            </div>

            <div className="exactQuote">
              <p>
                “ Guidance today,
                <br />
                a better tomorrow ”
              </p>

              <span>ॐ</span>
            </div>

          </div>
        </section>

        {/* CTA */}
        <section className="exactCtaWrap">
          <div className="exactCta">

            <div className="exactCtaOm">ॐ</div>

            <div className="exactCtaText">
              <p>READY TO DISCOVER YOUR FUTURE?</p>

              <h2>
                Book Your Astrology Consultation Today
              </h2>

              <span>
                Personalized guidance. Start your journey now.
              </span>
            </div>

            <div className="exactCtaButtons">
              <a href="/book">
                ▣ &nbsp; Book a Consultation
              </a>

              <a href="/contact">
                ☎ &nbsp; Contact Astrologer
              </a>
            </div>

          </div>
        </section>

      </main>

      <SiteFooter />
    </>
  );
}