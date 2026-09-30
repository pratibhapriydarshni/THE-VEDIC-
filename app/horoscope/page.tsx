import SiteNav from '@/components/site-nav';
import SiteFooter from '@/components/site-footer';
import HoroscopeContent from '@/components/horoscope-content';
import { adminDb } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

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
      'id,zodiac_sign,title,title_hi,content,content_hi,lucky_number,lucky_color,lucky_color_hi'
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

      <HoroscopeContent
        horoscopes={horoscopes}
        hasError={Boolean(error)}
      />

      <SiteFooter />
    </>
  );
}