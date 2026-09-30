import { adminDb } from '@/lib/supabase';

const SIGNS = [
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

function todayIST() {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
}

async function generateJSON(prompt: string) {
  const key = process.env.GEMINI_API_KEY;

  if (!key) {
    throw new Error('GEMINI_API_KEY_MISSING');
  }

  const response = await fetch(
    'https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent',
    {
      method: 'POST',
      headers: {
        'x-goog-api-key': key,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: prompt }],
          },
        ],
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: 0.7,
        },
      }),
    }
  );

  const result = await response.json();

  if (!response.ok) {
    console.error('Gemini API error:', result);

    throw new Error(
      result?.error?.message ||
        'GEMINI_GENERATION_FAILED'
    );
  }

  const text =
    result?.candidates?.[0]?.content?.parts
      ?.map(
        (part: { text?: string }) =>
          part.text || ''
      )
      .join('')
      .trim();

  if (!text) {
    throw new Error('EMPTY_GEMINI_RESPONSE');
  }

  const cleaned = text
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/```$/i, '')
    .trim();

  try {
    return JSON.parse(cleaned);
  } catch {
    console.error(
      'Invalid Gemini JSON:',
      cleaned
    );

    throw new Error('INVALID_GEMINI_JSON');
  }
}

function getArrayFromResponse(
  response: any,
  possibleKeys: string[]
) {
  if (Array.isArray(response)) {
    return response;
  }

  for (const key of possibleKeys) {
    if (Array.isArray(response?.[key])) {
      return response[key];
    }
  }

  return [];
}

export async function generateDailyAI() {
  const date = todayIST();

  // =====================================================
  // LOAD TODAY'S EXISTING HOROSCOPES
  // =====================================================

  const {
    data: existingHoroscopes,
    error: horoscopeCheckError,
  } = await adminDb
    .from('daily_horoscopes')
    .select(
      'id,zodiac_sign,title,title_hi,content,content_hi,lucky_number,lucky_color,lucky_color_hi'
    )
    .eq('horoscope_date', date);

  if (horoscopeCheckError) {
    throw new Error(
      horoscopeCheckError.message
    );
  }

  const horoscopeRows =
    existingHoroscopes || [];

  const existingSigns = new Set(
    horoscopeRows.map(
      (item: { zodiac_sign: string }) =>
        item.zodiac_sign
    )
  );

  const missingSigns = SIGNS.filter(
    (sign) => !existingSigns.has(sign)
  );

  let generatedHoroscopes = 0;
  let translatedHoroscopes = 0;

  // =====================================================
  // GENERATE MISSING HOROSCOPES
  // ENGLISH + HINDI
  // =====================================================

  if (missingSigns.length > 0) {
    const prompt = `
You are creating daily horoscope content for
THE VEDIC ASTRO, a Vedic astrology consultation website.

Date in India: ${date}

Generate horoscope content ONLY for these zodiac signs:

${missingSigns.join(', ')}

For every zodiac sign provide BOTH English and natural Hindi
written in Devanagari.

Rules:
- Use exactly the supplied zodiac_sign names.
- Calm, respectful and reflective tone.
- No guaranteed future claims.
- No medical, legal, financial, gambling or dangerous advice.
- Astrology should be presented as general reflective guidance.
- English horoscope should be approximately 80-130 words.
- Hindi version should contain comparable meaning and detail.
- Include one lucky number.
- Include lucky color in English and Hindi.
- Return exactly one entry for every requested zodiac sign.

Return ONLY valid JSON.
No markdown.
No code fences.

Required structure:

{
  "horoscopes": [
    {
      "zodiac_sign": "Mesh",
      "title": "Daily Horoscope",
      "title_hi": "दैनिक राशिफल",
      "content": "English horoscope text",
      "content_hi": "हिन्दी राशिफल",
      "lucky_number": "7",
      "lucky_color": "Gold",
      "lucky_color_hi": "सुनहरा"
    }
  ]
}
`;

    const generated =
      await generateJSON(prompt);

    const generatedList =
      getArrayFromResponse(generated, [
        'horoscopes',
        'results',
        'data',
      ]);

    if (generatedList.length === 0) {
      console.error(
        'Unexpected horoscope generation response:',
        generated
      );

      throw new Error(
        'INVALID_HOROSCOPE_RESPONSE'
      );
    }

    const rows = generatedList
      .filter(
        (item: {
          zodiac_sign?: string;
        }) =>
          item.zodiac_sign &&
          missingSigns.includes(
            item.zodiac_sign
          )
      )
      .map(
        (item: {
          zodiac_sign: string;
          title?: string;
          title_hi?: string;
          content?: string;
          content_hi?: string;
          lucky_number?: string;
          lucky_color?: string;
          lucky_color_hi?: string;
        }) => ({
          horoscope_date: date,

          zodiac_sign:
            item.zodiac_sign,

          title:
            String(
              item.title || ''
            ).trim() ||
            `${item.zodiac_sign} Daily Horoscope`,

          title_hi:
            String(
              item.title_hi || ''
            ).trim() ||
            'दैनिक राशिफल',

          content: String(
            item.content || ''
          ).trim(),

          content_hi: String(
            item.content_hi || ''
          ).trim(),

          lucky_number:
            String(
              item.lucky_number || ''
            ).trim() || null,

          lucky_color:
            String(
              item.lucky_color || ''
            ).trim() || null,

          lucky_color_hi:
            String(
              item.lucky_color_hi || ''
            ).trim() || null,

          source: 'ai',
          status: 'published',

          updated_at:
            new Date().toISOString(),
        })
      )
      .filter(
        (item: {
          content: string;
          content_hi: string;
        }) =>
          item.content.length > 0 &&
          item.content_hi.length > 0
      );

    if (rows.length > 0) {
      const { error } = await adminDb
        .from('daily_horoscopes')
        .upsert(rows, {
          onConflict:
            'horoscope_date,zodiac_sign',
          ignoreDuplicates: true,
        });

      if (error) {
        throw new Error(error.message);
      }

      generatedHoroscopes =
        rows.length;
    }
  }

  // =====================================================
  // HINDI BACKFILL FOR EXISTING HOROSCOPES
  // =====================================================

  const needsHindi =
    horoscopeRows.filter(
      (item: {
        title_hi?: string | null;
        content_hi?: string | null;
        lucky_color_hi?: string | null;
      }) =>
        !item.title_hi?.trim() ||
        !item.content_hi?.trim() ||
        !item.lucky_color_hi?.trim()
    );

  if (needsHindi.length > 0) {
    const source = needsHindi.map(
      (item: {
        id: string;
        zodiac_sign: string;
        title: string | null;
        content: string;
        lucky_color: string | null;
      }) => ({
        id: item.id,
        zodiac_sign:
          item.zodiac_sign,
        title: item.title,
        content: item.content,
        lucky_color:
          item.lucky_color,
      })
    );

    const prompt = `
Translate the following existing horoscope records from
THE VEDIC ASTRO into natural Hindi written in Devanagari.

IMPORTANT:
- Return EVERY supplied record.
- Keep every "id" EXACTLY unchanged.
- Do not translate or modify the id.
- Do not change the original meaning.
- Do not add new predictions.
- Do not remove important guidance.
- Translate title, horoscope content and lucky color.
- Use clear natural Hindi.
- No markdown.
- No code fences.

INPUT:

${JSON.stringify(source)}

Return ONLY valid JSON using this structure:

{
  "horoscopes": [
    {
      "id": "EXACT ORIGINAL ID",
      "title_hi": "हिन्दी शीर्षक",
      "content_hi": "पूरा हिन्दी राशिफल",
      "lucky_color_hi": "हिन्दी शुभ रंग"
    }
  ]
}
`;

    const translated =
      await generateJSON(prompt);

    const translatedList =
      getArrayFromResponse(
        translated,
        [
          'horoscopes',
          'translations',
          'results',
          'data',
        ]
      );

    if (
      translatedList.length === 0
    ) {
      console.error(
        'Unexpected Hindi horoscope response:',
        translated
      );

      throw new Error(
        'INVALID_HINDI_HOROSCOPE_RESPONSE'
      );
    }

    const validIds = new Set(
      needsHindi.map(
        (item: { id: string }) =>
          item.id
      )
    );

    for (
      const item of translatedList
    ) {
      const id = String(
        item.id || ''
      ).trim();

      if (
        !id ||
        !validIds.has(id)
      ) {
        continue;
      }

      const contentHi = String(
        item.content_hi || ''
      ).trim();

      if (!contentHi) {
        continue;
      }

      const { error } =
        await adminDb
          .from(
            'daily_horoscopes'
          )
          .update({
            title_hi:
              String(
                item.title_hi || ''
              ).trim() ||
              'दैनिक राशिफल',

            content_hi:
              contentHi,

            lucky_color_hi:
              String(
                item.lucky_color_hi ||
                  ''
              ).trim() || null,

            updated_at:
              new Date().toISOString(),
          })
          .eq('id', id);

      if (error) {
        throw new Error(
          error.message
        );
      }

      translatedHoroscopes += 1;
    }
  }

  // =====================================================
  // LOAD TODAY'S AI ARTICLE
  // =====================================================

  const start =
    `${date}T00:00:00+05:30`;

  const end =
    `${date}T23:59:59+05:30`;

  const {
    data: existingArticles,
    error: articleCheckError,
  } = await adminDb
    .from('daily_articles')
    .select(
      'id,title,title_hi,category,category_hi,content,content_hi,created_at'
    )
    .eq('source', 'ai')
    .gte('created_at', start)
    .lte('created_at', end)
    .order('created_at', {
      ascending: false,
    })
    .limit(1);

  if (articleCheckError) {
    throw new Error(
      articleCheckError.message
    );
  }

  let articleGenerated = false;
  let articleTranslated = false;

  // =====================================================
  // GENERATE NEW ARTICLE IF NONE EXISTS
  // =====================================================

  if (!existingArticles?.length) {
    const prompt = `
Write one original daily educational article for
THE VEDIC ASTRO.

Date in India: ${date}

Choose one useful topic related to:
- Vedic astrology
- zodiac signs
- planetary symbolism
- Vastu
- self-reflection
- spiritual traditions
- astrology education

Create BOTH:
1. Complete English version.
2. Complete natural Hindi version written in Devanagari.

Requirements:
- Original content.
- English approximately 500-800 words.
- Hindi should contain comparable meaning and detail.
- Clear English title.
- Clear Hindi title.
- English category.
- Hindi category.
- Respectful educational tone.
- No guaranteed predictions.
- No medical, legal, financial, gambling or dangerous advice.
- Do not impersonate Pt. Deepak Acharya.
- Do not invent testimonials, qualifications, credentials or results.

Return ONLY valid JSON.
No markdown.
No code fences.

{
  "title": "English title",
  "title_hi": "हिन्दी शीर्षक",
  "category": "Vedic Astrology",
  "category_hi": "वैदिक ज्योतिष",
  "content": "Full English article",
  "content_hi": "पूरा हिन्दी लेख"
}
`;

    const article =
      await generateJSON(prompt);

    const title = String(
      article.title || ''
    ).trim();

    const titleHi = String(
      article.title_hi || ''
    ).trim();

    const content = String(
      article.content || ''
    ).trim();

    const contentHi = String(
      article.content_hi || ''
    ).trim();

    if (
      !title ||
      !titleHi ||
      !content ||
      !contentHi
    ) {
      console.error(
        'Unexpected article response:',
        article
      );

      throw new Error(
        'INVALID_ARTICLE_RESPONSE'
      );
    }

    const slugBase = title
      .toLowerCase()
      .replace(
        /[^a-z0-9]+/g,
        '-'
      )
      .replace(/^-|-$/g, '');

    const { error } =
      await adminDb
        .from('daily_articles')
        .insert({
          title,
          title_hi: titleHi,

          slug: `${
            slugBase ||
            'daily-article'
          }-${date}`,

          category:
            String(
              article.category || ''
            ).trim() ||
            'Vedic Astrology',

          category_hi:
            String(
              article.category_hi ||
                ''
            ).trim() ||
            'वैदिक ज्योतिष',

          content,
          content_hi: contentHi,

          featured_image_url:
            null,

          source: 'ai',
          status: 'published',

          published_at:
            new Date().toISOString(),

          updated_at:
            new Date().toISOString(),
        });

    if (error) {
      throw new Error(
        error.message
      );
    }

    articleGenerated = true;
  }

  // =====================================================
  // HINDI BACKFILL FOR EXISTING ARTICLE
  // =====================================================

  else {
    const article =
      existingArticles[0];

    const needsArticleHindi =
      !article.title_hi?.trim() ||
      !article.category_hi?.trim() ||
      !article.content_hi?.trim();

    if (needsArticleHindi) {
      const prompt = `
Translate the following existing THE VEDIC ASTRO educational
article into natural Hindi written in Devanagari.

Preserve the original meaning and level of detail.

Do not:
- introduce new predictions
- invent new claims
- add medical advice
- add legal advice
- add financial advice
- add gambling advice
- add dangerous advice

English title:
${article.title}

English category:
${article.category || 'Vedic Astrology'}

English article:
${article.content}

Return ONLY valid JSON.
No markdown.
No code fences.

{
  "title_hi": "हिन्दी शीर्षक",
  "category_hi": "हिन्दी श्रेणी",
  "content_hi": "पूरा हिन्दी लेख"
}
`;

      const translated =
        await generateJSON(prompt);

      const articleResult =
        Array.isArray(translated)
          ? translated[0]
          : translated?.article ||
            translated?.translation ||
            translated?.result ||
            translated;

      const titleHi = String(
        articleResult?.title_hi ||
          ''
      ).trim();

      const contentHi = String(
        articleResult?.content_hi ||
          ''
      ).trim();

      if (
        !titleHi ||
        !contentHi
      ) {
        console.error(
          'Unexpected Hindi article response:',
          translated
        );

        throw new Error(
          'INVALID_HINDI_ARTICLE_RESPONSE'
        );
      }

      const { error } =
        await adminDb
          .from('daily_articles')
          .update({
            title_hi:
              titleHi,

            category_hi:
              String(
                articleResult
                  ?.category_hi || ''
              ).trim() ||
              'वैदिक ज्योतिष',

            content_hi:
              contentHi,

            updated_at:
              new Date().toISOString(),
          })
          .eq(
            'id',
            article.id
          );

      if (error) {
        throw new Error(
          error.message
        );
      }

      articleTranslated = true;
    }
  }

  return {
    success: true,
    provider: 'gemini',
    date,

    rashifal_generated:
      generatedHoroscopes,

    rashifal_hindi_backfilled:
      translatedHoroscopes,

    article_generated:
      articleGenerated,

    article_hindi_backfilled:
      articleTranslated,

    message:
      'Daily bilingual AI generation completed using Gemini.',
  };
}