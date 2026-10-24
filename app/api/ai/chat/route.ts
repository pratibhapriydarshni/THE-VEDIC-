
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const message = String(body.message || '').trim();
    const image = body.image;

    if (!message && !image) {
      return NextResponse.json(
        { error: 'Please enter a message or upload a palm photo.' },
        { status: 400 }
      );
    }

    if (message.length > 2000) {
      return NextResponse.json(
        { error: 'Message is too long. Maximum 2000 characters.' },
        { status: 400 }
      );
    }

    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/webp',
    ];

    if (image) {
      if (
        typeof image.data !== 'string' ||
        !allowedTypes.includes(image.mimeType) ||
        image.data.length > 4_200_000 ||
        !/^[A-Za-z0-9+/]+={0,2}$/.test(image.data)
      ) {
        return NextResponse.json(
          { error: 'Invalid image. Upload a JPG, PNG, or WebP under 3 MB.' },
          { status: 400 }
        );
      }
    }

    const key = process.env.GEMINI_API_KEY;

    if (!key) {
      return NextResponse.json(
        { error: 'AI service is not configured.' },
        { status: 500 }
      );
    }

    const parts: Array<Record<string, unknown>> = [
      {
        text: [
          'You are the AI astrology guide for THE VEDIC ASTRO.',
          'Be respectful, warm, clear, and helpful.',
          'Explain Vedic astrology and palmistry as cultural and reflective practices, not scientifically guaranteed predictions.',
          'If the user uploads a palm photo, offer a general, non-certain palmistry interpretation based only on visible features.',
          'Do not claim to diagnose health conditions or predict death, accidents, or guaranteed future events from palm lines.',
          'Do not make medical, legal, or financial decisions for users.',
          'Never claim to be a human astrologer.',
          'Reply in the language used by the user when possible.',
          message || 'Please offer a general palmistry interpretation of this palm photo.',
        ].join(' '),
      },
    ];

    if (image) {
      parts.push({
        inlineData: {
          mimeType: image.mimeType,
          data: image.data,
        },
      });
    }

    const response = await fetch(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': key,
        },
        body: JSON.stringify({
          contents: [{ role: 'user', parts }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 700,
          },
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error('Gemini chat request failed:', response.status);
      return NextResponse.json(
        { error: 'The AI astrologer is temporarily unavailable.' },
        { status: 502 }
      );
    }

    const reply = data?.candidates?.[0]?.content?.parts
      ?.map((part: { text?: string }) => part.text || '')
      .join('')
      .trim();

    if (!reply) {
      return NextResponse.json(
        { error: 'The AI could not generate a reply. Please try again.' },
        { status: 502 }
      );
    }

    return NextResponse.json({ reply });
  } catch {
    return NextResponse.json(
      { error: 'Unable to process your message.' },
      { status: 400 }
    );
  }
}
