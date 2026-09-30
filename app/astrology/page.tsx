import SiteNav from '@/components/site-nav';
import SiteFooter from '@/components/site-footer';
import AstrologyContent from '@/components/astrology-content';
import { adminDb } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

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

export default async function Page() {
  const { data, error } = await adminDb
    .from('daily_articles')
    .select(
      'id,title,title_hi,category,category_hi,content,content_hi,featured_image_url,source,published_at,created_at'
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

      <AstrologyContent
        articles={articles}
        hasError={Boolean(error)}
      />

      <SiteFooter />
    </>
  );
}