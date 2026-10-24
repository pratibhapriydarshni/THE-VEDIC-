
'use client';

import { useRef, useState } from 'react';

type Message = {
  role: 'user' | 'assistant';
  text: string;
  imageUrl?: string;
};

export default function AiAstrologerPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const fileInput = useRef<HTMLInputElement>(null);

  function choosePhoto(file?: File) {
    setError('');

    if (!file) return;

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setError('Please choose a JPG, PNG, or WebP image.');
      return;
    }

    if (file.size > 3 * 1024 * 1024) {
      setError('Please choose an image smaller than 3 MB.');
      return;
    }

    setPhoto(file);

    const reader = new FileReader();
    reader.onload = () => {
      setPhotoPreview(String(reader.result || ''));
    };
    reader.readAsDataURL(file);
  }

  function removePhoto() {
    setPhoto(null);
    setPhotoPreview('');

    if (fileInput.current) {
      fileInput.current.value = '';
    }
  }

  async function sendMessage() {
    const message = input.trim();

    if ((!message && !photo) || loading) return;

    const imageUrl = photoPreview;
    const currentPhoto = photo;

    setMessages((previous) => [
      ...previous,
      {
        role: 'user',
        text: message || 'Please read my palm.',
        ...(imageUrl ? { imageUrl } : {}),
      },
    ]);

    setInput('');
    removePhoto();
    setError('');
    setLoading(true);

    try {
      let image: { mimeType: string; data: string } | undefined;

      if (currentPhoto) {
        const base64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();

          reader.onload = () => {
            const result = String(reader.result || '');
            const comma = result.indexOf(',');

            if (comma < 0) {
              reject(new Error('Could not read the selected image.'));
              return;
            }

            resolve(result.slice(comma + 1));
          };

          reader.onerror = () =>
            reject(new Error('Could not read the selected image.'));

          reader.readAsDataURL(currentPhoto);
        });

        image = {
          mimeType: currentPhoto.type,
          data: base64,
        };
      }

      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, image }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || 'The AI astrologer is temporarily unavailable.'
        );
      }

      setMessages((previous) => [
        ...previous,
        { role: 'assistant', text: data.reply },
      ]);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Something went wrong. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main
      style={{
        minHeight: '80vh',
        padding: '32px 16px',
        background: '#fffaf0',
        color: '#352416',
      }}
    >
      <section style={{ maxWidth: 760, margin: '0 auto' }}>
        <header style={{ textAlign: 'center', marginBottom: 28 }}>
          <p
            style={{
              color: '#a66b18',
              fontWeight: 700,
              letterSpacing: 2,
            }}
          >
            THE VEDIC ASTRO
          </p>

          <h1 style={{ fontSize: 32, marginBottom: 10 }}>
            AI Astrology Guide
          </h1>

          <p style={{ color: '#705d4c', lineHeight: 1.6 }}>
            Explore Vedic astrology, zodiac signs, birth charts and
            palmistry with your AI guide.
          </p>
        </header>

        <section
          aria-label="AI astrology chat"
          style={{
            background: '#fff',
            border: '1px solid #eadbc6',
            borderRadius: 16,
            padding: 20,
            minHeight: 320,
            boxShadow: '0 8px 28px rgba(70,45,15,0.06)',
          }}
        >
          {messages.length === 0 && (
            <div style={{ padding: '32px 8px', textAlign: 'center' }}>
              <div style={{ fontSize: 36, marginBottom: 12 }}>ॐ</div>
              <h2 style={{ fontSize: 19 }}>Namaste! How can I help?</h2>
              <p style={{ color: '#705d4c', lineHeight: 1.7 }}>
                Ask an astrology question or upload a clear photo of
                your palm for a general palmistry interpretation.
              </p>
            </div>
          )}

          <div style={{ display: 'grid', gap: 16 }}>
            {messages.map((message, index) => (
              <article
                key={index}
                style={{
                  justifySelf:
                    message.role === 'user' ? 'end' : 'start',
                  maxWidth: '90%',
                  padding: '12px 15px',
                  borderRadius: 14,
                  background:
                    message.role === 'user' ? '#8b572a' : '#f6eee2',
                  color:
                    message.role === 'user' ? '#fff' : '#352416',
                  whiteSpace: 'pre-wrap',
                  lineHeight: 1.65,
                  overflowWrap: 'anywhere',
                }}
              >
                {message.imageUrl && (
                  <img
                    src={message.imageUrl}
                    alt="Palm photo selected for palmistry reading"
                    style={{
                      display: 'block',
                      maxWidth: '100%',
                      maxHeight: 240,
                      objectFit: 'contain',
                      borderRadius: 10,
                      marginBottom: 10,
                    }}
                  />
                )}
                {message.text}
              </article>
            ))}
          </div>

          {loading && (
            <p role="status" style={{ color: '#8b572a', marginTop: 18 }}>
              Your AI guide is thinking...
            </p>
          )}

          {error && (
            <p role="alert" style={{ color: '#b42318', marginTop: 16 }}>
              {error}
            </p>
          )}

          {photoPreview && (
            <div
              style={{
                marginTop: 20,
                padding: 12,
                background: '#f6eee2',
                borderRadius: 12,
              }}
            >
              <p style={{ fontWeight: 600, marginTop: 0 }}>
                Palm photo selected
              </p>

              <img
                src={photoPreview}
                alt="Preview of your selected palm photo"
                style={{
                  display: 'block',
                  maxWidth: '100%',
                  maxHeight: 220,
                  borderRadius: 10,
                  objectFit: 'contain',
                }}
              />

              <button
                type="button"
                onClick={removePhoto}
                disabled={loading}
                style={{
                  marginTop: 10,
                  border: '1px solid #c9ad8e',
                  background: '#fff',
                  color: '#69421f',
                  padding: '8px 12px',
                  borderRadius: 8,
                  cursor: 'pointer',
                }}
              >
                Remove photo
              </button>
            </div>
          )}

          <form
            onSubmit={(event) => {
              event.preventDefault();
              void sendMessage();
            }}
            style={{
              display: 'grid',
              gap: 12,
              marginTop: 24,
              paddingTop: 18,
              borderTop: '1px solid #eadbc6',
            }}
          >
            <input
              ref={fileInput}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              hidden
              onChange={(event) => choosePhoto(event.target.files?.[0])}
            />

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
              <button
                type="button"
                onClick={() => fileInput.current?.click()}
                disabled={loading}
                style={{
                  border: '1px solid #c9ad8e',
                  borderRadius: 10,
                  padding: '11px 14px',
                  background: '#fffaf0',
                  color: '#69421f',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                📷 Upload Palm Photo
              </button>

              <span
                style={{
                  alignSelf: 'center',
                  color: '#705d4c',
                  fontSize: 12,
                }}
              >
                JPG, PNG or WebP · Max 3 MB
              </span>
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <input
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder="Ask your astrology question..."
                maxLength={2000}
                disabled={loading}
                aria-label="Your message"
                style={{
                  flex: 1,
                  minWidth: 0,
                  padding: '13px 14px',
                  border: '1px solid #d8c5ad',
                  borderRadius: 10,
                  fontSize: 15,
                }}
              />

              <button
                type="submit"
                disabled={loading || (!input.trim() && !photo)}
                style={{
                  border: 0,
                  borderRadius: 10,
                  padding: '12px 20px',
                  background: '#8b572a',
                  color: '#fff',
                  fontWeight: 700,
                  cursor: 'pointer',
                  opacity:
                    loading || (!input.trim() && !photo) ? 0.6 : 1,
                }}
              >
                {loading ? 'Wait...' : 'Send'}
              </button>
            </div>
          </form>
        </section>

        <p
          style={{
            marginTop: 16,
            fontSize: 12,
            lineHeight: 1.6,
            textAlign: 'center',
            color: '#705d4c',
          }}
        >
          Palmistry and astrology are cultural and reflective practices,
          not guaranteed predictions or substitutes for professional
          medical, legal or financial advice.
        </p>
      </section>
    </main>
  );
}
