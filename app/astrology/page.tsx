import SiteNav from '@/components/site-nav';
import SiteFooter from '@/components/site-footer';
import { adminDb } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

type Article = {
  id: string;
  title: string;
  category: string | null;
  content: string;
  featured_image_url: string | null;
  source: string;
  published_at: string | null;
  created_at: string;
};

export default async function Page() {
  const { data, error } = await adminDb
    .from('daily_articles')
    .select(
      'id,title,category,content,featured_image_url,source,published_at,created_at'
    )
    .eq('status', 'published')
    .order('published_at', {
      ascending: false,
      nullsFirst: false,
    });

  const articles = (data || []) as Article[];

  return (
    <>
      <SiteNav />

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
            Astrology Articles
          </h1>

          <p className="muted">
            Explore Vedic astrology, zodiac wisdom,
            planetary symbolism and spiritual traditions.
          </p>
        </section>
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
    Today&apos;s Horoscope — View All 12 Rashifal
  </a>
</div>

        {error ? (
          <div className="card">
            <h2>Articles unavailable</h2>
            <p className="muted">
              Articles could not be loaded right now.
              Please check again later.
            </p>
          </div>
        ) : articles.length === 0 ? (
          <div
            className="card"
            style={{ textAlign: 'center' }}
          >
            <h2>Articles coming soon</h2>
            <p className="muted">
              New astrology articles will appear here.
            </p>
          </div>
        ) : (
          <section
            style={{
              display: 'grid',
              gap: 22,
            }}
          >
            {articles.map((article) => (
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
                    {article.category || 'Astrology'}
                  </span>
                  
                </div>

                <h2
                  style={{
                    marginTop: 0,
                    marginBottom: 8,
                  }}
                >
                  {article.title}
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
                  ).toLocaleDateString('en-IN', {
                    timeZone: 'Asia/Kolkata',
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </p>

                <div
                  style={{
                    lineHeight: 1.8,
                    whiteSpace: 'pre-line',
                    marginTop: 18,
                  }}
                >
                  {article.content}
                </div>
              </article>
            ))}
          </section>
        )}

        <section
          className="card"
          style={{
            textAlign: 'center',
            marginTop: 28,
          }}
        >
          <h2>Looking for Personal Guidance?</h2>

          <p className="muted">
            Articles provide general educational and
            reflective information. For personal guidance,
            book a consultation with Pt. Deepak Acharya.
          </p>

          <a className="cta" href="/book">
            Book Consultation
          </a>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}