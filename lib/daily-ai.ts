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
      ?.map((part: { text?: string }) => part.text || '')
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
    console.error('Invalid Gemini JSON:', cleaned);
    throw new Error('INVALID_GEMINI_JSON');
  }
}

export async function generateDailyAI() {
  const date = todayIST();

  // ---------------------------------------------
  // CHECK EXISTING HOROSCOPES
  // ---------------------------------------------

  const { data: existingHoroscopes, error: checkError } =
    await adminDb
      .from('daily_horoscopes')
      .select('zodiac_sign')
      .eq('horoscope_date', date);

  if (checkError) {
    throw new Error(checkError.message);
  }

  const existingSigns = new Set(
    (existingHoroscopes || []).map(
      (item: { zodiac_sign: string }) =>
        item.zodiac_sign
    )
  );

  const missingSigns = SIGNS.filter(
    (sign) => !existingSigns.has(sign)
  );

  let generatedHoroscopes = 0;

  // ---------------------------------------------
  // GENERATE MISSING HOROSCOPES
  // ---------------------------------------------

  if (missingSigns.length > 0) {
    const horoscopePrompt = `
You are writing daily horoscope content for THE VEDIC ASTRO,
a Vedic astrology consultation website.

Date in India: ${date}

Generate daily horoscope content only for these zodiac signs:

${missingSigns.join(', ')}

Important rules:

- Write in simple, respectful English.
- Keep the tone calm, positive and reflective.
- Do not claim guaranteed future events.
- Do not give medical, legal, financial, gambling,
  or dangerous advice.
- Present astrology as general spiritual and reflective guidance.
- Each horoscope should be approximately 80-130 words.
- Include one lucky number and one lucky color.
- Use exactly the zodiac_sign names supplied above.
- Return exactly one horoscope for every requested sign.

Return ONLY valid JSON.
Do not use markdown.
Do not use code fences.

Exact JSON structure:

{
  "horoscopes": [
    {
      "zodiac_sign": "Mesh",
      "title": "Daily Horoscope",
      "content": "Horoscope text",
      "lucky_number": "7",
      "lucky_color": "Gold"
    }
  ]
}
`;

    const generated = await generateJSON(
      horoscopePrompt
    );

    if (!Array.isArray(generated.horoscopes)) {
      throw new Error('INVALID_HOROSCOPE_RESPONSE');
    }

    const rows = generated.horoscopes
      .filter(
        (item: { zodiac_sign?: string }) =>
          item.zodiac_sign &&
          missingSigns.includes(item.zodiac_sign)
      )
      .map(
        (item: {
          zodiac_sign: string;
          title?: string;
          content?: string;
          lucky_number?: string;
          lucky_color?: string;
        }) => ({
          horoscope_date: date,
          zodiac_sign: item.zodiac_sign,
          title:
            String(item.title || '').trim() ||
            `${item.zodiac_sign} Daily Horoscope`,
          content: String(item.content || '').trim(),
          lucky_number:
            String(item.lucky_number || '').trim() ||
            null,
          lucky_color:
            String(item.lucky_color || '').trim() ||
            null,
          source: 'ai',
          status: 'published',
          updated_at: new Date().toISOString(),
        })
      )
      .filter(
        (item: { content: string }) =>
          item.content.length > 0
      );

    if (rows.length > 0) {
      const { error } = await adminDb
        .from('daily_horoscopes')
        .upsert(rows, {
          onConflict: 'horoscope_date,zodiac_sign',
          ignoreDuplicates: true,
        });

      if (error) {
        throw new Error(error.message);
      }

      generatedHoroscopes = rows.length;
    }
  }

  // ---------------------------------------------
  // CHECK TODAY'S AI ARTICLE
  // ---------------------------------------------

  const start = `${date}T00:00:00+05:30`;
  const end = `${date}T23:59:59+05:30`;

  const {
    data: existingArticle,
    error: articleCheckError,
  } = await adminDb
    .from('daily_articles')
    .select('id')
    .eq('source', 'ai')
    .gte('created_at', start)
    .lte('created_at', end)
    .limit(1);

  if (articleCheckError) {
    throw new Error(articleCheckError.message);
  }

  let articleGenerated = false;

  // ---------------------------------------------
  // GENERATE DAILY ARTICLE
  // ---------------------------------------------

  if (!existingArticle?.length) {
    const articlePrompt = `
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

Requirements:

- Write original content.
- Approximately 500-800 words.
- Include a clear title.
- Suitable for a general audience.
- Respectful and educational tone.
- Do not claim guaranteed predictions.
- Do not give medical, legal, financial,
  gambling, or dangerous advice.
- Do not impersonate Pt. Deepak Acharya.
- Do not invent client testimonials,
  qualifications, credentials or results.

Return ONLY valid JSON.
Do not use markdown.
Do not use code fences.

Exact JSON structure:

{
  "title": "Article title",
  "category": "Vedic Astrology",
  "content": "Full article"
}
`;

    const article = await generateJSON(articlePrompt);

    const title = String(article.title || '').trim();
    const content = String(article.content || '').trim();

    if (!title || !content) {
      throw new Error('INVALID_ARTICLE_RESPONSE');
    }

    const slugBase = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    const { error } = await adminDb
      .from('daily_articles')
      .insert({
        title,
        slug: `${
          slugBase || 'daily-article'
        }-${date}`,
        category:
          String(article.category || '').trim() ||
          'Vedic Astrology',
        content,
        featured_image_url: null,
        source: 'ai',
        status: 'published',
        published_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

    if (error) {
      throw new Error(error.message);
    }

    articleGenerated = true;
  }

  return {
    success: true,
    provider: 'gemini',
    date,
    rashifal_generated: generatedHoroscopes,
    article_generated: articleGenerated,
    message:
      'Daily AI generation completed using Gemini.',
  };
}