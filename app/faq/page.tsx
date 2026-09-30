'use client';

import SiteNav from '@/components/site-nav';
import SiteFooter from '@/components/site-footer';
import { useLanguage } from '@/components/language-provider';

export default function Page() {
  const { t } = useLanguage();

  const faqs = [
    {
      q: t(
        'What is THE VEDIC ASTRO?',
        'THE VEDIC ASTRO क्या है?'
      ),
      a: t(
        'THE VEDIC ASTRO is an online Vedic astrology consultation platform offering personalized guidance through Kundli, Palmistry, Vastu and other consultation services.',
        'THE VEDIC ASTRO एक ऑनलाइन वैदिक ज्योतिष परामर्श प्लेटफ़ॉर्म है, जहाँ कुंडली, हस्तरेखा, वास्तु और अन्य परामर्श सेवाओं के माध्यम से व्यक्तिगत मार्गदर्शन प्रदान किया जाता है।'
      ),
    },
    {
      q: t(
        'Who will conduct my consultation?',
        'मेरा परामर्श कौन करेगा?'
      ),
      a: t(
        'Consultations are conducted by Pt. Deepak Acharya, Kundli Specialist & Astro-Palmist with over 25 years of experience.',
        'परामर्श पं. दीपक आचार्य द्वारा किया जाता है, जो कुंडली विशेषज्ञ एवं हस्तरेखा विशेषज्ञ हैं और उन्हें 25 वर्षों से अधिक का अनुभव है।'
      ),
    },
    {
      q: t(
        'What consultation services are available?',
        'कौन-कौन सी परामर्श सेवाएँ उपलब्ध हैं?'
      ),
      a: t(
        'Services include Kundli Consultation, Palmistry, Vastu Consultation, Career Guidance, Relationship Guidance, Family Guidance, Occult Consultation and Motivational Guidance.',
        'सेवाओं में कुंडली परामर्श, हस्तरेखा, वास्तु परामर्श, करियर मार्गदर्शन, रिश्तों का मार्गदर्शन, पारिवारिक मार्गदर्शन, गूढ़ विद्या परामर्श और प्रेरणात्मक मार्गदर्शन शामिल हैं।'
      ),
    },
    {
      q: t(
        'How can I consult?',
        'मैं परामर्श कैसे कर सकता हूँ?'
      ),
      a: t(
        'You can choose Chat, Audio or Video consultation while making your booking.',
        'बुकिंग करते समय आप चैट, ऑडियो या वीडियो परामर्श चुन सकते हैं।'
      ),
    },
    {
      q: t(
        'Which languages are available?',
        'कौन-कौन सी भाषाएँ उपलब्ध हैं?'
      ),
      a: t(
        'Consultations are available in Hindi and English.',
        'परामर्श हिन्दी और अंग्रेज़ी में उपलब्ध हैं।'
      ),
    },
    {
      q: t(
        'How long is a consultation?',
        'परामर्श कितने समय का होता है?'
      ),
      a: t(
        'Depending on the selected service, consultation durations are 30 minutes or 45 minutes.',
        'चुनी गई सेवा के अनुसार परामर्श की अवधि 30 मिनट या 45 मिनट होती है।'
      ),
    },
    {
      q: t(
        'Can I book a consultation for the same day?',
        'क्या मैं उसी दिन के लिए परामर्श बुक कर सकता हूँ?'
      ),
      a: t(
        'Yes. Same-day booking is available when a suitable slot is available and the booking is made at least 3 hours before the consultation.',
        'हाँ। यदि उपयुक्त समय उपलब्ध है और परामर्श से कम से कम 3 घंटे पहले बुकिंग की जाती है, तो उसी दिन की बुकिंग की जा सकती है।'
      ),
    },
    {
      q: t(
        'What details may be required for a consultation?',
        'परामर्श के लिए किन जानकारियों की आवश्यकता हो सकती है?'
      ),
      a: t(
        'Depending on the service, you may provide your Date of Birth, Time of Birth, Place of Birth, current place and consultation purpose. Palm images or other relevant documents may also be provided when required.',
        'सेवा के अनुसार आपको जन्म तिथि, जन्म समय, जन्म स्थान, वर्तमान स्थान और परामर्श का उद्देश्य देना पड़ सकता है। आवश्यकता होने पर हथेली की तस्वीरें या अन्य संबंधित दस्तावेज़ भी दिए जा सकते हैं।'
      ),
    },
    {
      q: t(
        "What if I don't know my exact birth time?",
        'यदि मुझे अपना सही जन्म समय नहीं पता तो क्या होगा?'
      ),
      a: t(
        'You can still request a consultation. The astrologer can guide you about the available consultation approach based on the information you have.',
        'आप फिर भी परामर्श ले सकते हैं। आपके पास उपलब्ध जानकारी के आधार पर ज्योतिषाचार्य उपयुक्त परामर्श प्रक्रिया के बारे में मार्गदर्शन कर सकते हैं।'
      ),
    },
    {
      q: t(
        'When is my booking confirmed?',
        'मेरी बुकिंग कब कन्फर्म होती है?'
      ),
      a: t(
        'Your consultation is confirmed after the required payment has been received and verified.',
        'आवश्यक भुगतान प्राप्त और सत्यापित होने के बाद आपका परामर्श कन्फर्म किया जाता है।'
      ),
    },
    {
      q: t(
        'Can I cancel my consultation?',
        'क्या मैं अपना परामर्श रद्द कर सकता हूँ?'
      ),
      a: t(
        'Bookings are generally not cancellable by the customer after confirmation. If there is an issue, you can contact THE VEDIC ASTRO for assistance.',
        'कन्फर्म होने के बाद सामान्यतः ग्राहक द्वारा बुकिंग रद्द नहीं की जा सकती। किसी समस्या की स्थिति में सहायता के लिए THE VEDIC ASTRO से संपर्क किया जा सकता है।'
      ),
    },
    {
      q: t(
        'Can I reschedule my consultation?',
        'क्या मैं अपने परामर्श का समय बदल सकता हूँ?'
      ),
      a: t(
        'Yes. Rescheduling may be available subject to slot availability and the applicable booking policy.',
        'हाँ। उपलब्ध समय और लागू बुकिंग नीति के अनुसार परामर्श का समय बदला जा सकता है।'
      ),
    },
    {
      q: t(
        'What happens if THE VEDIC ASTRO cannot provide the booked consultation?',
        'यदि THE VEDIC ASTRO बुक किया गया परामर्श उपलब्ध नहीं करा पाए तो क्या होगा?'
      ),
      a: t(
        'Where applicable, you may be offered another suitable slot or a refund according to the Refund Policy.',
        'जहाँ लागू हो, आपको दूसरा उपयुक्त समय दिया जा सकता है या रिफंड नीति के अनुसार धनवापसी की जा सकती है।'
      ),
    },
    {
      q: t(
        'How long does a refund take?',
        'रिफंड मिलने में कितना समय लगता है?'
      ),
      a: t(
        'Where a refund is approved, it is intended to be processed within up to 3 days, subject to the payment method or provider.',
        'रिफंड स्वीकृत होने पर उसे भुगतान के तरीके या प्रदाता के अनुसार अधिकतम 3 दिनों के भीतर प्रोसेस करने का प्रयास किया जाता है।'
      ),
    },
    {
      q: t(
        'Are astrology results guaranteed?',
        'क्या ज्योतिष के परिणाम की गारंटी दी जाती है?'
      ),
      a: t(
        'No. Astrology is provided as a form of guidance and perspective. THE VEDIC ASTRO does not guarantee specific outcomes or results. Important personal, medical, legal or financial decisions should not be based solely on an astrology consultation.',
        'नहीं। ज्योतिष मार्गदर्शन और दृष्टिकोण के रूप में प्रदान किया जाता है। THE VEDIC ASTRO किसी निश्चित परिणाम की गारंटी नहीं देता। महत्वपूर्ण व्यक्तिगत, चिकित्सा, कानूनी या वित्तीय निर्णय केवल ज्योतिष परामर्श के आधार पर नहीं लिए जाने चाहिए।'
      ),
    },
    {
      q: t(
        'Is my personal information kept private?',
        'क्या मेरी व्यक्तिगत जानकारी गोपनीय रखी जाती है?'
      ),
      a: t(
        "Personal information and consultation-related data are handled according to THE VEDIC ASTRO's Privacy Policy and are used for providing and managing the requested services.",
        'व्यक्तिगत जानकारी और परामर्श से संबंधित डेटा THE VEDIC ASTRO की गोपनीयता नीति के अनुसार संभाला जाता है और अनुरोधित सेवाएँ प्रदान करने तथा उनका प्रबंधन करने के लिए उपयोग किया जाता है।'
      ),
    },
    {
      q: t(
        'Can overseas customers book a consultation?',
        'क्या विदेश में रहने वाले ग्राहक परामर्श बुक कर सकते हैं?'
      ),
      a: t(
        'Yes. International customers can book available online consultations. Applicable international pricing is displayed during the booking process.',
        'हाँ। अंतरराष्ट्रीय ग्राहक उपलब्ध ऑनलाइन परामर्श बुक कर सकते हैं। लागू अंतरराष्ट्रीय शुल्क बुकिंग प्रक्रिया के दौरान दिखाया जाता है।'
      ),
    },
    {
      q: t(
        'How can I contact THE VEDIC ASTRO if I have a problem?',
        'किसी समस्या की स्थिति में मैं THE VEDIC ASTRO से कैसे संपर्क कर सकता हूँ?'
      ),
      a: t(
        "You can use the website's Contact options for assistance related to your booking, payment or consultation.",
        'बुकिंग, भुगतान या परामर्श से संबंधित सहायता के लिए वेबसाइट के संपर्क विकल्पों का उपयोग कर सकते हैं।'
      ),
    },
  ];

  return (
    <>
      <SiteNav />

      <main className="wrap">
        <div className="card">
          <h1>
            {t(
              'Frequently Asked Questions',
              'अक्सर पूछे जाने वाले प्रश्न'
            )}
          </h1>

          <p className="muted">
            {t(
              'Find answers to common questions about THE VEDIC ASTRO, consultations, bookings and payments.',
              'THE VEDIC ASTRO, परामर्श, बुकिंग और भुगतान से जुड़े सामान्य प्रश्नों के उत्तर यहाँ पाएँ।'
            )}
          </p>

          <div style={{ marginTop: '24px' }}>
            {faqs.map((faq, index) => (
              <details
                key={index}
                style={{
                  padding: '16px 0',
                  borderBottom:
                    '1px solid rgba(128,128,128,0.25)',
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

                <p
                  style={{
                    marginTop: '12px',
                    lineHeight: 1.7,
                  }}
                >
                  {faq.a}
                </p>
              </details>
            ))}
          </div>

          <div style={{ marginTop: '28px' }}>
            <p>
              {t(
                'Still have a question? Contact us or book a consultation for further assistance.',
                'अभी भी कोई प्रश्न है? अधिक सहायता के लिए हमसे संपर्क करें या परामर्श बुक करें।'
              )}
            </p>

            <a className="cta" href="/book">
              {t(
                'Book a Consultation',
                'परामर्श बुक करें'
              )}
            </a>
          </div>
        </div>
      </main>

      <SiteFooter />
    </>
  );
}