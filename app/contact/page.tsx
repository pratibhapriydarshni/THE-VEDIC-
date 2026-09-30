'use client';

import SiteNav from '@/components/site-nav';
import SiteFooter from '@/components/site-footer';
import { useLanguage } from '@/components/language-provider';

export default function Page() {
  const { language, t } = useLanguage();

  const whatsappNumber =
    process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '';

  const whatsappMessage =
    language === 'hi'
      ? 'नमस्ते THE VEDIC ASTRO, मुझे परामर्श के संबंध में सहायता चाहिए।'
      : 'Hello THE VEDIC ASTRO, I need assistance regarding a consultation.';

  const whatsappLink = whatsappNumber
    ? `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
        whatsappMessage
      )}`
    : '#';

  return (
    <>
      <SiteNav />

      <main className="wrap">
        <div className="card">
          <h1>
            {t(
              'Contact THE VEDIC ASTRO',
              'THE VEDIC ASTRO से संपर्क करें'
            )}
          </h1>

          <p className="muted">
            {t(
              'We are here to assist you with bookings, payments and consultation-related queries.',
              'बुकिंग, भुगतान और परामर्श से संबंधित प्रश्नों में सहायता के लिए हम यहाँ हैं।'
            )}
          </p>

          <h2>
            {t('WhatsApp Support', 'WhatsApp सहायता')}
          </h2>

          <p>
            {t(
              'Need assistance with your booking or consultation? You can contact THE VEDIC ASTRO directly through WhatsApp.',
              'अपनी बुकिंग या परामर्श में सहायता चाहिए? आप WhatsApp के माध्यम से सीधे THE VEDIC ASTRO से संपर्क कर सकते हैं।'
            )}
          </p>

          {whatsappNumber ? (
            <a
              className="cta"
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
            >
              {t(
                'Chat on WhatsApp',
                'WhatsApp पर चैट करें'
              )}
            </a>
          ) : (
            <p className="muted">
              {t(
                'WhatsApp support will be available soon.',
                'WhatsApp सहायता जल्द उपलब्ध होगी।'
              )}
            </p>
          )}

          <h2>
            {t('Booking Support', 'बुकिंग सहायता')}
          </h2>

          <p>
            {t(
              'For help with consultation slots, booking status or rescheduling, please contact us with your booking details.',
              'परामर्श के समय, बुकिंग की स्थिति या समय बदलने से संबंधित सहायता के लिए अपनी बुकिंग जानकारी के साथ हमसे संपर्क करें।'
            )}
          </p>

          <h2>
            {t('Payment Support', 'भुगतान सहायता')}
          </h2>

          <p>
            {t(
              'If you have completed a payment but your booking status has not been updated, contact support with your booking details and transaction reference.',
              'यदि आपने भुगतान पूरा कर दिया है लेकिन आपकी बुकिंग की स्थिति अपडेट नहीं हुई है, तो अपनी बुकिंग जानकारी और ट्रांजैक्शन रेफरेंस के साथ सहायता टीम से संपर्क करें।'
            )}
          </p>

          <h2>
            {t('Email Support', 'ईमेल सहायता')}
          </h2>

          <p>
            {t('Email:', 'ईमेल:')}{' '}
            <a href="mailto:thevedicastroindia@gmail.com">
              thevedicastroindia@gmail.com
            </a>
          </p>

          <h2>
            {t(
              'Existing Customers',
              'मौजूदा ग्राहक'
            )}
          </h2>

          <p>
            {t(
              'When contacting support about an existing consultation, please keep your booking details available. Never share your password, OTP, UPI PIN or other confidential authentication information.',
              'मौजूदा परामर्श के संबंध में सहायता लेते समय अपनी बुकिंग जानकारी उपलब्ध रखें। अपना पासवर्ड, OTP, UPI PIN या अन्य गोपनीय प्रमाणीकरण जानकारी कभी साझा न करें।'
            )}
          </p>

          <h2>
            {t(
              'Book a Consultation',
              'परामर्श बुक करें'
            )}
          </h2>

          <p>
            {t(
              'For astrology guidance, please use our online booking system to select your preferred service, consultation mode and available time.',
              'ज्योतिष मार्गदर्शन के लिए हमारी ऑनलाइन बुकिंग प्रणाली का उपयोग करके अपनी पसंद की सेवा, परामर्श का माध्यम और उपलब्ध समय चुनें।'
            )}
          </p>

          <a className="cta" href="/book">
            {t(
              'Book a Consultation',
              'परामर्श बुक करें'
            )}
          </a>
        </div>
      </main>

      <SiteFooter />
    </>
  );
}