import SiteNav from '@/components/site-nav';
import SiteFooter from '@/components/site-footer';
import { adminDb } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

type Horoscope = {
  id: string;
  zodiac_sign: string;
  title: string | null;
  content: string;
  lucky_number: string | null;
  lucky_color: string | null;
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

const SIGN_NAMES: Record<string, string> = {
  Mesh: 'Aries',
  Vrishabh: 'Taurus',
  Mithun: 'Gemini',
  Kark: 'Cancer',
  Singh: 'Leo',
  Kanya: 'Virgo',
  Tula: 'Libra',
  Vrishchik: 'Scorpio',
  Dhanu: 'Sagittarius',
  Makar: 'Capricorn',
  Kumbh: 'Aquarius',
  Meen: 'Pisces',
};

function todayIST() {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
}

export default async function Page() {
  const today = todayIST();

  const { data, error } = await adminDb
    .from('daily_horoscopes')
    .select(
      'id,zodiac_sign,title,content,lucky_number,lucky_color'
    )
    .eq('horoscope_date', today)
    .eq('status', 'published');

  const horoscopes = (data || []) as Horoscope[];

  const order = [
    'Mesh',
    'Vrishabh',
    'Mithun',
    'Kark',
    'Singh',
    'Kanya',
    'Tula',
    'Vrishchik',
    'Dhanu',
    'Makar',
    'Kumbh',
    'Meen',
  ];

  horoscopes.sort(
    (a, b) =>
      order.indexOf(a.zodiac_sign) -
      order.indexOf(b.zodiac_sign)
  );

  return (
    <>
      <SiteNav />

      <main className="wrap">
        <section style={{ textAlign: 'center', marginBottom: 30 }}>
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
            Daily Horoscope
          </h1>

          <p className="muted">
            Daily Vedic guidance for all 12 zodiac signs
          </p>
<div
  style={{
    marginTop: 16,
    display: 'flex',
    justifyContent: 'center',
  }}
>
  <a className="cta" href="/astrology">
    Explore Astrology Articles
  </a>
</div>

          <p
            style={{
              fontSize: 14,
              marginTop: 8,
              opacity: 0.75,
            }}
          >
            {new Date().toLocaleDateString('en-IN', {
              timeZone: 'Asia/Kolkata',
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          </p>
        </section>

        {error ? (
          <div className="card">
            <h2>Horoscope unavailable</h2>
            <p className="muted">
              Today's horoscope could not be loaded.
              Please check again later.
            </p>
          </div>
        ) : horoscopes.length === 0 ? (
          <div className="card" style={{ textAlign: 'center' }}>
            <h2>Today's horoscope is coming soon</h2>
            <p className="muted">
              Daily guidance for all zodiac signs will be
              available shortly.
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
            {horoscopes.map((item) => (
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
                    {SIGN_SYMBOLS[item.zodiac_sign] || '✦'}
                  </div>

                  <div>
                    <h2 style={{ margin: 0 }}>
                      {item.zodiac_sign}
                    </h2>

                    <div className="muted">
                      {SIGN_NAMES[item.zodiac_sign] || ''}
                    </div>
                  </div>
                </div>

                {item.title && (
                  <h3 style={{ margin: 0 }}>
                    {item.title}
                  </h3>
                )}

                <p
                  style={{
                    lineHeight: 1.75,
                    margin: 0,
                    whiteSpace: 'pre-line',
                  }}
                >
                  {item.content}
                </p>

                {(item.lucky_number || item.lucky_color) && (
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
                        <strong>Lucky Number:</strong>{' '}
                        {item.lucky_number}
                      </span>
                    )}

                    {item.lucky_color && (
                      <span>
                        <strong>Lucky Color:</strong>{' '}
                        {item.lucky_color}
                      </span>
                    )}
                  </div>
                )}
              </article>
            ))}
          </section>
        )}

        <section
          className="card"
          style={{
            marginTop: 28,
            textAlign: 'center',
          }}
        >
          <h2>Need Personal Guidance?</h2>

          <p className="muted">
            Daily horoscopes provide general reflective guidance.
            For a personal Vedic astrology consultation, you can
            book a session with Pt. Deepak Acharya.
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