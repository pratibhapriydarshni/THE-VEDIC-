'use client';

import { useLanguage } from './language-provider';

type Article = {
  id: string;
  title: string;
  title_hi: string | null;
  category: string | null;
  category_hi: string | null;
  content: string;
  content_hi: string | null;
  featured_image_url: string | null;
  source: string;
  published_at: string | null;
  created_at: string;
};

export default function AstrologyContent({
  articles,
  hasError,
}: {
  articles: Article[];
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
          {t('Astrology Articles', 'ज्योतिष लेख')}
        </h1>

        <p className="muted">
          {t(
            'Explore Vedic astrology, zodiac wisdom, planetary symbolism and spiritual traditions.',
            'वैदिक ज्योतिष, राशि ज्ञान, ग्रहों के प्रतीकों और आध्यात्मिक परंपराओं के बारे में जानें।'
          )}
        </p>

        <div
          style={{
            marginTop: 18,
            display: 'flex',
            justifyContent: 'center',
            gap: 12,
            flexWrap: 'wrap',
          }}
        >
          <a className="cta" href="/horoscope">
            {t(
              "Today's Horoscope — View All 12 Rashifal",
              'आज का राशिफल — सभी 12 राशियों का राशिफल देखें'
            )}
          </a>
        </div>
      </section>

      {hasError ? (
        <div className="card">
          <h2>
            {t(
              'Articles unavailable',
              'लेख उपलब्ध नहीं हैं'
            )}
          </h2>

          <p className="muted">
            {t(
              'Articles could not be loaded right now. Please check again later.',
              'अभी लेख लोड नहीं हो सके। कृपया कुछ समय बाद फिर से देखें।'
            )}
          </p>
        </div>
      ) : articles.length === 0 ? (
        <div
          className="card"
          style={{ textAlign: 'center' }}
        >
          <h2>
            {t(
              'Articles coming soon',
              'लेख जल्द आ रहे हैं'
            )}
          </h2>

          <p className="muted">
            {t(
              'New astrology articles will appear here.',
              'नए ज्योतिष लेख यहाँ दिखाई देंगे।'
            )}
          </p>
        </div>
      ) : (
        <section
          style={{
            display: 'grid',
            gap: 22,
          }}
        >
          {articles.map((article) => {
            const displayTitle =
              language === 'hi'
                ? article.title_hi || article.title
                : article.title;

            const displayCategory =
              language === 'hi'
                ? article.category_hi ||
                  article.category ||
                  'ज्योतिष'
                : article.category || 'Astrology';

            const displayContent =
              language === 'hi'
                ? article.content_hi || article.content
                : article.content;

            return (
              <article
                className="card"
                key={article.id}
              >
                {article.featured_image_url && (
                  <img
                    src={article.featured_image_url}
                    alt=""
                    style={{
                      width: '100%',
                      maxHeight: 380,
                      objectFit: 'cover',
                      borderRadius: 14,
                      marginBottom: 18,
                    }}
                  />
                )}

                <div
                  style={{
                    display: 'flex',
                    gap: 10,
                    flexWrap: 'wrap',
                    marginBottom: 10,
                  }}
                >
                  <span
                    style={{
                      fontSize: 13,
                      fontWeight: 700,
                      color: '#b26a00',
                    }}
                  >
                    {displayCategory}
                  </span>
                </div>

                <h2
                  style={{
                    marginTop: 0,
                    marginBottom: 8,
                  }}
                >
                  {displayTitle}
                </h2>

                <p
                  className="muted"
                  style={{
                    fontSize: 13,
                    marginTop: 0,
                  }}
                >
                  {new Date(
                    article.published_at ||
                      article.created_at
                  ).toLocaleDateString(
                    language === 'hi'
                      ? 'hi-IN'
                      : 'en-IN',
                    {
                      timeZone: 'Asia/Kolkata',
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    }
                  )}
                </p>

                <div
                  style={{
                    lineHeight: 1.8,
                    whiteSpace: 'pre-line',
                    marginTop: 18,
                  }}
                >
                  {displayContent}
                </div>
              </article>
            );
          })}
        </section>
      )}

      <section
        className="card"
        style={{
          textAlign: 'center',
          marginTop: 28,
        }}
      >
        <h2>
          {t(
            'Looking for Personal Guidance?',
            'व्यक्तिगत मार्गदर्शन चाहते हैं?'
          )}
        </h2>

        <p className="muted">
          {t(
            'Articles provide general educational and reflective information. For personal guidance, book a consultation with Pt. Deepak Acharya.',
            'ये लेख सामान्य शैक्षिक और विचारात्मक जानकारी प्रदान करते हैं। व्यक्तिगत मार्गदर्शन के लिए पं. दीपक आचार्य के साथ परामर्श बुक करें।'
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