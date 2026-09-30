'use client';

import SiteNav from '@/components/site-nav';
import SiteFooter from '@/components/site-footer';
import { useLanguage } from '@/components/language-provider';

export default function Page() {
  const { t } = useLanguage();

  return (
    <>
      <SiteNav />

      <main className="wrap">
        <div className="card">
          <h1>
            {t(
              'About Pt. Deepak Acharya',
              'पं. दीपक आचार्य के बारे में'
            )}
          </h1>

          <p className="muted">
            {t(
              'Kundli Specialist & Astro-Palmist | 25 Years of Experience',
              'कुंडली विशेषज्ञ एवं हस्तरेखा विशेषज्ञ | 25 वर्षों का अनुभव'
            )}
          </p>

          <h2>
            {t(
              'Experience Rooted in Vedic Wisdom',
              'वैदिक ज्ञान पर आधारित अनुभव'
            )}
          </h2>

          <p>
            {t(
              'Pt. Deepak Acharya is a Kundli Specialist and Astro-Palmist with over 25 years of experience in Vedic Astrology. His approach combines traditional Vedic knowledge with thoughtful, practical guidance, helping individuals understand different phases of life with greater clarity and confidence.',
              'पं. दीपक आचार्य कुंडली विशेषज्ञ एवं हस्तरेखा विशेषज्ञ हैं और उन्हें वैदिक ज्योतिष में 25 वर्षों से अधिक का अनुभव है। उनका दृष्टिकोण पारंपरिक वैदिक ज्ञान को विचारशील और व्यावहारिक मार्गदर्शन के साथ जोड़ता है, जिससे लोगों को जीवन के विभिन्न चरणों को अधिक स्पष्टता और आत्मविश्वास के साथ समझने में सहायता मिलती है।'
            )}
          </p>

          <p>
            {t(
              "With academic and professional study in Astrology, Palmistry and Vastu, he has spent years consulting people on matters related to career, relationships, family, personal growth and important life decisions. His consultations are focused on understanding each person's individual circumstances rather than providing generic predictions.",
              'ज्योतिष, हस्तरेखा और वास्तु के शैक्षणिक एवं व्यावसायिक अध्ययन के साथ उन्होंने वर्षों से करियर, रिश्तों, परिवार, व्यक्तिगत विकास और जीवन के महत्वपूर्ण निर्णयों से जुड़े विषयों पर लोगों को परामर्श दिया है। उनका परामर्श सामान्य भविष्यवाणियों के बजाय प्रत्येक व्यक्ति की व्यक्तिगत परिस्थितियों को समझने पर केंद्रित रहता है।'
            )}
          </p>

          <h2>
            {t(
              'A Personal Approach to Vedic Guidance',
              'वैदिक मार्गदर्शन के प्रति व्यक्तिगत दृष्टिकोण'
            )}
          </h2>

          <p>
            {t(
              'Every individual has a different journey, and therefore every consultation deserves individual attention. Pt. Deepak Acharya believes astrology should be used as a tool for understanding and guidance, not as a source of fear. His aim is to explain astrological observations in a simple and respectful manner so that clients can better understand their circumstances and make their own informed decisions.',
              'प्रत्येक व्यक्ति की जीवन यात्रा अलग होती है, इसलिए प्रत्येक परामर्श को व्यक्तिगत ध्यान मिलना चाहिए। पं. दीपक आचार्य का मानना है कि ज्योतिष का उपयोग समझ और मार्गदर्शन के साधन के रूप में होना चाहिए, भय के स्रोत के रूप में नहीं। उनका उद्देश्य ज्योतिषीय अवलोकनों को सरल और सम्मानजनक तरीके से समझाना है, ताकि लोग अपनी परिस्थितियों को बेहतर ढंग से समझ सकें और अपने निर्णय स्वयं सोच-समझकर ले सकें।'
            )}
          </p>

          <h2>
            {t(
              'Traditional Wisdom, Modern Consultation',
              'पारंपरिक ज्ञान, आधुनिक परामर्श'
            )}
          </h2>

          <p>
            {t(
              'THE VEDIC ASTRO brings traditional Vedic consultation into a convenient modern format. Clients can choose Chat, Audio or Video consultation in Hindi or English, with services including Kundli Consultation, Palmistry, Vastu, Career Guidance, Relationship and Family Guidance, and other areas of Vedic consultation.',
              'THE VEDIC ASTRO पारंपरिक वैदिक परामर्श को सुविधाजनक आधुनिक स्वरूप में प्रस्तुत करता है। ग्राहक हिन्दी या अंग्रेज़ी में चैट, ऑडियो या वीडियो परामर्श चुन सकते हैं। सेवाओं में कुंडली परामर्श, हस्तरेखा, वास्तु, करियर मार्गदर्शन, रिश्ते एवं पारिवारिक मार्गदर्शन तथा वैदिक परामर्श के अन्य क्षेत्र शामिल हैं।'
            )}
          </p>

          <h2>
            {t('Our Philosophy', 'हमारा दृष्टिकोण')}
          </h2>

          <p>
            {t(
              "At THE VEDIC ASTRO, the purpose is not to promise miracles or guaranteed outcomes. The focus is on providing sincere, confidential and responsible guidance rooted in Vedic wisdom. Astrology can offer another perspective on life's questions, while the choices and decisions ultimately remain with the individual.",
              'THE VEDIC ASTRO का उद्देश्य चमत्कार या निश्चित परिणामों का वादा करना नहीं है। हमारा ध्यान वैदिक ज्ञान पर आधारित ईमानदार, गोपनीय और जिम्मेदार मार्गदर्शन प्रदान करने पर है। ज्योतिष जीवन के प्रश्नों को देखने का एक अतिरिक्त दृष्टिकोण दे सकता है, जबकि अंतिम चुनाव और निर्णय व्यक्ति के अपने होते हैं।'
            )}
          </p>

          <h2>
            {t(
              'Qualifications & Credentials',
              'योग्यता एवं प्रमाण'
            )}
          </h2>

          <p>
            <strong>
              {t(
                'Acharya (Master in Astrology)',
                'आचार्य (ज्योतिष में स्नातकोत्तर)'
              )}
            </strong>
            {' — '}
            {t(
              'Central University, New Delhi',
              'केंद्रीय विश्वविद्यालय, नई दिल्ली'
            )}
          </p>

          <p>
            <strong>Hastrekha Srimani Vidya Varidhi</strong>
          </p>

          <p>
            <strong>
              {t('Diploma in Vastu', 'वास्तु में डिप्लोमा')}
            </strong>
          </p>

          <blockquote>
            {t(
              '“Guidance Rooted in Vedic Wisdom, Clarity for Your Path.”',
              '“वैदिक ज्ञान पर आधारित मार्गदर्शन, आपके मार्ग के लिए स्पष्टता।”'
            )}
          </blockquote>

          <a className="cta" href="/book">
            {t('Book a Consultation', 'परामर्श बुक करें')}
          </a>
        </div>
      </main>

      <SiteFooter />
    </>
  );
}