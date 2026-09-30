'use client';

import SiteNav from "@/components/site-nav";
import SiteFooter from "@/components/site-footer";
import { useLanguage } from "@/components/language-provider";

export default function Home() {
  const { t } = useLanguage();

  const services = [
    {
      icon: "✦",
      title: t("Kundli Reading", "कुंडली परामर्श"),
      text: t(
        "Understand your future, planetary positions & life path.",
        "अपने भविष्य, ग्रहों की स्थिति और जीवन की दिशा को समझें।"
      ),
      price: "₹499",
      time: "30 min",
    },
    {
      icon: "☝",
      title: t("Palmistry", "हस्तरेखा"),
      text: t(
        "Know your personality, strengths & opportunities.",
        "अपने व्यक्तित्व, क्षमताओं और अवसरों को जानें।"
      ),
      price: "₹499",
      time: "30 min",
    },
    {
      icon: "⌂",
      title: t("Vastu Consultation", "वास्तु परामर्श"),
      text: t(
        "Bring harmony, positivity and balance to your space.",
        "अपने स्थान में सामंजस्य, सकारात्मकता और संतुलन लाएँ।"
      ),
      price: "₹799",
      time: "45 min",
    },
    {
      icon: "▣",
      title: t("Career Guidance", "करियर मार्गदर्शन"),
      text: t(
        "Get clarity in career, education and professional growth.",
        "करियर, शिक्षा और व्यावसायिक प्रगति के लिए स्पष्ट मार्गदर्शन प्राप्त करें।"
      ),
      price: "₹499",
      time: "30 min",
    },
    {
      icon: "♥",
      title: t("Relationship Guidance", "रिश्तों का मार्गदर्शन"),
      text: t(
        "Guidance for love, marriage and relationships.",
        "प्रेम, विवाह और रिश्तों से जुड़े विषयों पर मार्गदर्शन।"
      ),
      price: "₹499",
      time: "30 min",
    },
    {
      icon: "♟",
      title: t("Family Guidance", "पारिवारिक मार्गदर्शन"),
      text: t(
        "Traditional guidance for family concerns and decisions.",
        "पारिवारिक चिंताओं और निर्णयों के लिए पारंपरिक मार्गदर्शन।"
      ),
      price: "₹499",
      time: "30 min",
    },
    {
      icon: "☸",
      title: t("Occult Consultation", "गूढ़ विद्या परामर्श"),
      text: t(
        "Private spiritual and traditional occult guidance.",
        "निजी आध्यात्मिक और पारंपरिक गूढ़ विद्या संबंधी मार्गदर्शन।"
      ),
      price: "₹599",
      time: "30 min",
    },
    {
      icon: "☀",
      title: t("Motivational Guidance", "प्रेरणात्मक मार्गदर्शन"),
      text: t(
        "Build confidence, focus and positive direction.",
        "आत्मविश्वास, एकाग्रता और सकारात्मक दिशा विकसित करें।"
      ),
      price: "₹399",
      time: "30 min",
    },
  ];

  return (
    <>
      <SiteNav />

      <main className="exactHome">

        {/* HERO */}
        <section className="exactHero">
          <div className="exactHeroInner">

            <div className="exactHeroCopy">
              <p className="exactEyebrow">
                {t(
                  "WELCOME TO THE VEDIC ASTRO",
                  "THE VEDIC ASTRO में आपका स्वागत है"
                )}
              </p>

              <h1>
                {t("Discover Your Path Through", "अपना मार्ग खोजें")}
                <br />
                {t(
                  "Vedic Astrology",
                  "वैदिक ज्योतिष के माध्यम से"
                )}
              </h1>

              <p className="exactHeroText">
                {t(
                  "Get personalized guidance for your life, career, relationships, health and future. Connect with an experienced astrologer and find clarity in every step of your journey.",
                  "अपने जीवन, करियर, रिश्तों, स्वास्थ्य और भविष्य के लिए व्यक्तिगत मार्गदर्शन प्राप्त करें। अनुभवी ज्योतिषाचार्य से जुड़ें और अपने जीवन की यात्रा के हर कदम पर स्पष्टता प्राप्त करें।"
                )}
              </p>

              <div className="exactHeroActions">
                <a href="/book" className="exactBookBtn">
                  ▣ &nbsp;
                  {t("Book a Consultation", "परामर्श बुक करें")}
                </a>

                <a href="/contact" className="exactContactBtn">
                  ☎ &nbsp;
                  {t("Contact Astrologer", "ज्योतिषाचार्य से संपर्क करें")}
                </a>
              </div>

              <div className="exactModes">
                <span>◯ {t("Chat", "चैट")}</span>
                <b />
                <span>◉ {t("Audio", "ऑडियो")}</span>
                <b />
                <span>▣ {t("Video", "वीडियो")}</span>
                <b />
                <span>● {t("English & Hindi", "अंग्रेज़ी और हिन्दी")}</span>
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
                    {t(
                      "Kundli Specialist & Astro-Palmist",
                      "कुंडली विशेषज्ञ एवं हस्तरेखा विशेषज्ञ"
                    )}
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
                <p className="exactEyebrow">
                  {t("OUR SERVICES", "हमारी सेवाएँ")}
                </p>

                <h2>
                  {t(
                    "Explore Our Consultations",
                    "हमारे परामर्श देखें"
                  )}
                </h2>
              </div>

              <p>
                {t(
                  "Choose from a variety of expert services designed to guide you in every aspect of life.",
                  "जीवन के विभिन्न पहलुओं में मार्गदर्शन के लिए हमारी विशेषज्ञ सेवाओं में से अपनी आवश्यकता के अनुसार सेवा चुनें।"
                )}
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
              <p className="exactEyebrow">
                {t("HOW IT WORKS", "यह कैसे काम करता है")}
              </p>

              <h2>
                {t(
                  "Simple 3 Steps to Get Started",
                  "शुरू करने के लिए केवल 3 आसान चरण"
                )}
              </h2>

              <p>
                {t(
                  "Book your session in just a few clicks and connect with Pt. Deepak Acharya.",
                  "कुछ ही क्लिक में अपना सत्र बुक करें और पं. दीपक आचार्य से जुड़ें।"
                )}
              </p>
            </div>

            <div className="exactStepsRow">

              <article>
                <div className="exactStepIcon">▣</div>
                <span>01</span>

                <h3>
                  {t("Choose Service", "सेवा चुनें")}
                </h3>

                <p>
                  {t(
                    "Select the consultation type that matches your needs.",
                    "अपनी आवश्यकता के अनुसार परामर्श सेवा चुनें।"
                  )}
                </p>
              </article>

              <div className="exactArrow">⟶</div>

              <article>
                <div className="exactStepIcon">◷</div>
                <span>02</span>

                <h3>
                  {t("Select Slot", "समय चुनें")}
                </h3>

                <p>
                  {t(
                    "Pick your preferred available date and time.",
                    "अपनी पसंद की उपलब्ध तारीख और समय चुनें।"
                  )}
                </p>
              </article>

              <div className="exactArrow">⟶</div>

              <article>
                <div className="exactStepIcon">♙</div>
                <span>03</span>

                <h3>
                  {t(
                    "Consult Astrologer",
                    "ज्योतिषाचार्य से परामर्श करें"
                  )}
                </h3>

                <p>
                  {t(
                    "Connect privately at your scheduled consultation time.",
                    "अपने निर्धारित परामर्श समय पर निजी रूप से जुड़ें।"
                  )}
                </p>
              </article>

            </div>

            <div className="exactCenterButton">
              <a href="/services">
                {t("View All Services", "सभी सेवाएँ देखें")} →
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
                {t(
                  "MEET YOUR CONSULTANT",
                  "अपने ज्योतिषाचार्य से मिलें"
                )}
              </p>

              <h2>Pt. Deepak Acharya</h2>

              <h4>
                {t(
                  "Kundli Specialist & Astro-Palmist",
                  "कुंडली विशेषज्ञ एवं हस्तरेखा विशेषज्ञ"
                )}
              </h4>

              <p>
                {t(
                  "With 25 years of experience in Vedic astrology, palmistry and Vastu, Pt. Deepak Acharya provides traditional guidance for greater clarity and direction.",
                  "वैदिक ज्योतिष, हस्तरेखा और वास्तु में 25 वर्षों के अनुभव के साथ पं. दीपक आचार्य जीवन में अधिक स्पष्टता और सही दिशा के लिए पारंपरिक मार्गदर्शन प्रदान करते हैं।"
                )}
              </p>

              <div className="exactCredentials">
                <span>
                  ✦ {t("25 Years Experience", "25 वर्षों का अनुभव")}
                </span>

                <span>
                  ✦ {t(
                    "Acharya (Master in Astro)",
                    "आचार्य (ज्योतिष में विशेषज्ञता)"
                  )}
                </span>

                <span>✦ Hastrekha Srimani</span>

                <span>
                  ✦ {t("Diploma in Vastu", "वास्तु में डिप्लोमा")}
                </span>
              </div>

              <a href="/about" className="exactProfileBtn">
                {t("View Profile", "प्रोफ़ाइल देखें")} →
              </a>
            </div>

            <div className="exactQuote">
              <p>
                “ {t("Guidance today,", "आज का मार्गदर्शन,")}
                <br />
                {t("a better tomorrow", "बेहतर कल की ओर")} ”
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
              <p>
                {t(
                  "READY TO DISCOVER YOUR FUTURE?",
                  "अपने भविष्य को समझने के लिए तैयार हैं?"
                )}
              </p>

              <h2>
                {t(
                  "Book Your Astrology Consultation Today",
                  "आज ही अपना ज्योतिष परामर्श बुक करें"
                )}
              </h2>

              <span>
                {t(
                  "Personalized guidance. Start your journey now.",
                  "व्यक्तिगत मार्गदर्शन प्राप्त करें। अपनी यात्रा आज ही शुरू करें।"
                )}
              </span>
            </div>

            <div className="exactCtaButtons">
              <a href="/book">
                ▣ &nbsp;
                {t("Book a Consultation", "परामर्श बुक करें")}
              </a>

              <a href="/contact">
                ☎ &nbsp;
                {t("Contact Astrologer", "ज्योतिषाचार्य से संपर्क करें")}
              </a>
            </div>

          </div>
        </section>

      </main>

      <SiteFooter />
    </>
  );
}