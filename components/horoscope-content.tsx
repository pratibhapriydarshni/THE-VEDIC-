'use client';

import { useLanguage } from '@/components/language-provider';

type Horoscope = {
  id: string;
  zodiac_sign: string;
  title: string | null;
  title_hi: string | null;
  content: string;
  content_hi: string | null;
  lucky_number: string | null;
  lucky_color: string | null;
  lucky_color_hi: string | null;
};

const SIGN_SYMBOLS: Record<string, string> = {
  Mesh: '♈',
  Vrishabh: '♉',
  Mithun: '♊',
  Kark: '♋',
  Singh: '♌',
  Kanya: '♍',
  Tula: '♎',
  Vrishchik: '♏',
  Dhanu: '♐',
  Makar: '♑',
  Kumbh: '♒',
  Meen: '♓',
};

const SIGN_NAMES: Record<
  string,
  { en: string; hi: string }
> = {
  Mesh: { en: 'Aries', hi: 'मेष' },
  Vrishabh: { en: 'Taurus', hi: 'वृषभ' },
  Mithun: { en: 'Gemini', hi: 'मिथुन' },
  Kark: { en: 'Cancer', hi: 'कर्क' },
  Singh: { en: 'Leo', hi: 'सिंह' },
  Kanya: { en: 'Virgo', hi: 'कन्या' },
  Tula: { en: 'Libra', hi: 'तुला' },
  Vrishchik: { en: 'Scorpio', hi: 'वृश्चिक' },
  Dhanu: { en: 'Sagittarius', hi: 'धनु' },
  Makar: { en: 'Capricorn', hi: 'मकर' },
  Kumbh: { en: 'Aquarius', hi: 'कुंभ' },
  Meen: { en: 'Pisces', hi: 'मीन' },
};

export default function HoroscopeContent({
  horoscopes,
  hasError,
}: {
  horoscopes: Horoscope[];
  hasError: boolean;
}) {
  const { language, t } = useLanguage();

  return (
    <main className="wrap">
      <section
        style={{
          textAlign: 'center',
          marginBottom: 30,
        }}
      >
        <div
          style={{
            fontSize: 14,
            fontWeight: 700,
            letterSpacing: 2,
            color: '#b26a00',
            marginBottom: 8,
          }}
        >
          THE VEDIC ASTRO
        </div>

        <h1 style={{ marginBottom: 8 }}>
          {t('Daily Horoscope', 'दैनिक राशिफल')}
        </h1>

        <p className="muted">
          {t(
            'Daily Vedic guidance for all 12 zodiac signs',
            'सभी 12 राशियों के लिए दैनिक वैदिक मार्गदर्शन'
          )}
        </p>

        <div
          style={{
            marginTop: 16,
            display: 'flex',
            justifyContent: 'center',
          }}
        >
          <a className="cta" href="/astrology">
            {t(
              'Explore Astrology Articles',
              'ज्योतिष लेख पढ़ें'
            )}
          </a>
        </div>

        <p
          style={{
            fontSize: 14,
            marginTop: 8,
            opacity: 0.75,
          }}
        >
          {new Date().toLocaleDateString(
            language === 'hi' ? 'hi-IN' : 'en-IN',
            {
              timeZone: 'Asia/Kolkata',
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            }
          )}
        </p>
      </section>

      {hasError ? (
        <div className="card">
          <h2>
            {t(
              'Horoscope unavailable',
              'राशिफल उपलब्ध नहीं है'
            )}
          </h2>

          <p className="muted">
            {t(
              "Today's horoscope could not be loaded. Please check again later.",
              'आज का राशिफल लोड नहीं हो सका। कृपया बाद में फिर देखें।'
            )}
          </p>
        </div>
      ) : horoscopes.length === 0 ? (
        <div
          className="card"
          style={{ textAlign: 'center' }}
        >
          <h2>
            {t(
              "Today's horoscope is coming soon",
              'आज का राशिफल जल्द उपलब्ध होगा'
            )}
          </h2>

          <p className="muted">
            {t(
              'Daily guidance for all zodiac signs will be available shortly.',
              'सभी राशियों के लिए दैनिक मार्गदर्शन जल्द उपलब्ध होगा।'
            )}
          </p>
        </div>
      ) : (
        <section
          style={{
            display: 'grid',
            gridTemplateColumns:
              'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 18,
          }}
        >
          {horoscopes.map((item) => {
            const sign = SIGN_NAMES[item.zodiac_sign];

            const displayTitle =
              language === 'hi'
                ? item.title_hi || item.title
                : item.title;

            const displayContent =
              language === 'hi'
                ? item.content_hi || item.content
                : item.content;

            const displayLuckyColor =
              language === 'hi'
                ? item.lucky_color_hi ||
                  item.lucky_color
                : item.lucky_color;

            return (
              <article
                className="card"
                key={item.id}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 12,
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                  }}
                >
                  <div
                    style={{
                      fontSize: 38,
                      lineHeight: 1,
                    }}
                  >
                    {SIGN_SYMBOLS[item.zodiac_sign] ||
                      '✦'}
                  </div>

                  <div>
                    <h2 style={{ margin: 0 }}>
                      {sign
                        ? language === 'hi'
                          ? sign.hi
                          : sign.en
                        : item.zodiac_sign}
                    </h2>

                    <div className="muted">
                      {language === 'hi'
                        ? item.zodiac_sign
                        : sign?.en || ''}
                    </div>
                  </div>
                </div>

                {displayTitle && (
                  <h3 style={{ margin: 0 }}>
                    {displayTitle}
                  </h3>
                )}

                <p
                  style={{
                    lineHeight: 1.75,
                    margin: 0,
                    whiteSpace: 'pre-line',
                  }}
                >
                  {displayContent}
                </p>

                {(item.lucky_number ||
                  displayLuckyColor) && (
                  <div
                    style={{
                      marginTop: 'auto',
                      paddingTop: 12,
                      borderTop:
                        '1px solid rgba(128,128,128,.2)',
                      display: 'flex',
                      gap: 20,
                      flexWrap: 'wrap',
                    }}
                  >
                    {item.lucky_number && (
                      <span>
                        <strong>
                          {t(
                            'Lucky Number:',
                            'शुभ अंक:'
                          )}
                        </strong>{' '}
                        {item.lucky_number}
                      </span>
                    )}

                    {displayLuckyColor && (
                      <span>
                        <strong>
                          {t(
                            'Lucky Color:',
                            'शुभ रंग:'
                          )}
                        </strong>{' '}
                        {displayLuckyColor}
                      </span>
                    )}
                  </div>
                )}
              </article>
            );
          })}
        </section>
      )}

      <section
        className="card"
        style={{
          marginTop: 28,
          textAlign: 'center',
        }}
      >
        <h2>
          {t(
            'Need Personal Guidance?',
            'व्यक्तिगत मार्गदर्शन चाहिए?'
          )}
        </h2>

        <p className="muted">
          {t(
            'Daily horoscopes provide general reflective guidance. For a personal Vedic astrology consultation, you can book a session with Pt. Deepak Acharya.',
            'दैनिक राशिफल सामान्य मार्गदर्शन प्रदान करता है। व्यक्तिगत वैदिक ज्योतिष परामर्श के लिए आप पं. दीपक आचार्य के साथ सत्र बुक कर सकते हैं।'
          )}
        </p>

        <a className="cta" href="/book">
          {t(
            'Book Consultation',
            'परामर्श बुक करें'
          )}
        </a>
      </section>
    </main>
  );
}