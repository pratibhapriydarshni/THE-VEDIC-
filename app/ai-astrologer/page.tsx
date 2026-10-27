
'use client';

import { useRef, useState } from 'react';
import { supabaseBrowser } from '@/lib/supabase-browser';

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
  const [freeMessagesRemaining, setFreeMessagesRemaining] =
    useState<number | null>(null);
  const [showPayment, setShowPayment] = useState(false);
  const [utr, setUtr] = useState('');
  const [paymentPending, setPaymentPending] = useState(false);
  const [paidSession, setPaidSession] = useState(false);
  const [endingSession, setEndingSession] = useState(false);
  const [sessionEnded, setSessionEnded] = useState(false);

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
    reader.onload = () => setPhotoPreview(String(reader.result || ''));
    reader.readAsDataURL(file);
  }

  function removePhoto() {
    setPhoto(null);
    setPhotoPreview('');
    if (fileInput.current) fileInput.current.value = '';
  }

  async function getAccessToken() {
    const supabase = supabaseBrowser();
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError || !session) {
      throw new Error('Please log in to use Mihir AI.');
    }

    return session.access_token;
  }

  async function sendMessage() {
    const message = input.trim();
    if ((!message && !photo) || loading || endingSession || sessionEnded) return;

    setError('');
    setLoading(true);

    try {
      const token = await getAccessToken();
      const imageUrl = photoPreview;
      const currentPhoto = photo;

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
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ message, image }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.error === 'FREE_LIMIT_REACHED') {
          setFreeMessagesRemaining(0);
          setShowPayment(true);
          setError(
            data.message ||
              'Your five free messages are used. Request a ₹99 paid session below.'
          );
          return;
        }

        if (response.status === 401) {
          throw new Error('Please log in again to use Mihir AI.');
        }

        throw new Error(
          data.error || 'The AI astrologer is temporarily unavailable.'
        );
      }

      setPaidSession(Boolean(data.paidSession));
      setSessionEnded(false);
      setShowPayment(false);
      setPaymentPending(false);

      setMessages((previous) => [
        ...previous,
        {
          role: 'user',
          text: message || 'Please read my palm.',
          ...(imageUrl ? { imageUrl } : {}),
        },
        {
          role: 'assistant',
          text: data.reply,
        },
      ]);

      if (typeof data.freeMessagesRemaining === 'number') {
        setFreeMessagesRemaining(data.freeMessagesRemaining);

        if (data.freeMessagesRemaining === 0) {
          setShowPayment(true);
        }
      }

      setInput('');
      removePhoto();
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

  async function submitPayment() {
    const reference = utr.trim();

    if (!/^[A-Za-z0-9]{8,30}$/.test(reference)) {
      setError('Enter a valid UTR/reference number (8–30 letters or numbers).');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const token = await getAccessToken();

      const response = await fetch('/api/mihir/payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ utr: reference }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Unable to submit payment details.');
      }

      setPaymentPending(true);
      setUtr('');
      setError(
        data.message ||
          'Your payment reference was submitted. Wait for admin verification.'
      );
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Payment submission failed.'
      );
    } finally {
      setLoading(false);
    }
  }

  async function endSession() {
    if (
      endingSession ||
      !paidSession ||
      !window.confirm('Are you sure you want to end your paid session?')
    ) {
      return;
    }

    setError('');
    setEndingSession(true);

    try {
      const token = await getAccessToken();

      const response = await fetch('/api/mihir/end-session', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Unable to end your session.');
      }

      setPaidSession(false);
      setSessionEnded(true);
      setShowPayment(true);
      setPaymentPending(false);
      setError('Your paid session has ended.');
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Unable to end your session.'
      );
    } finally {
      setEndingSession(false);
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

          <h1 style={{ fontSize: 32, marginBottom: 10 }}>Mihir AI</h1>

          <p style={{ color: '#705d4c', lineHeight: 1.6 }}>
            Explore Vedic astrology, zodiac signs, birth charts and
            palmistry with your AI guide.
          </p>

          {freeMessagesRemaining !== null && !paidSession && (
            <p style={{ color: '#8b572a', fontWeight: 600 }}>
              Free messages remaining: {freeMessagesRemaining} / 5
            </p>
          )}

          {paidSession && (
            <div
              style={{
                background: '#e8f5e9',
                color: '#21632b',
                padding: 12,
                borderRadius: 10,
                marginTop: 16,
              }}
            >
              <p style={{ margin: '0 0 10px', fontWeight: 700 }}>
                Your paid session is active.
              </p>
              <button
                type="button"
                onClick={endSession}
                disabled={endingSession || loading}
                style={{
                  background: '#9d2727',
                  color: '#fff',
                  border: 0,
                  borderRadius: 8,
                  padding: '10px 16px',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                {endingSession ? 'Ending session...' : 'End Session'}
              </button>
            </div>
          )}
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
              <div style={{ fontSize: 36, marginBottom: 12 }}>🙏</div>
              <h2 style={{ fontSize: 19 }}>Namaste! How can I help?</h2>
              <p style={{ color: '#705d4c', lineHeight: 1.7 }}>
                Ask an astrology question or upload a clear photo of your
                palm for a general palmistry interpretation.
              </p>
            </div>
          )}

          <div style={{ display: 'grid', gap: 16 }}>
            {messages.map((message, index) => (
              <article
                key={index}
                style={{
                  justifySelf: message.role === 'user' ? 'end' : 'start',
                  maxWidth: '90%',
                  padding: '12px 15px',
                  borderRadius: 14,
                  background:
                    message.role === 'user' ? '#8b572a' : '#f6eee2',
                  color: message.role === 'user' ? '#fff' : '#352416',
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

          {showPayment && !paidSession && (
            <section
              style={{
                marginTop: 24,
                padding: 18,
                border: '1px solid #d8bd96',
                borderRadius: 12,
                background: '#fffaf0',
              }}
            >
              <h2 style={{ marginTop: 0, fontSize: 21 }}>
                Continue with Mihir AI
              </h2>

              {sessionEnded ? (
                <p>Your previous paid session has ended.</p>
              ) : (
                <p>
                  Your five free messages have been used. Pay ₹99 for a
                  session that stays active until you click End Session.
                </p>
              )}

              <p>
                <strong>UPI ID:</strong>{' '}
                <span>thevedicastroindia@ybl</span>
                <button
                  type="button"
                  onClick={() =>
                    void navigator.clipboard
                      .writeText('thevedicastroindia@ybl')
                      .then(() => setError('UPI ID copied.'))
                      .catch(() => setError('Please copy the UPI ID manually.'))
                  }
                  style={{
                    marginLeft: 10,
                    padding: '5px 9px',
                    border: '1px solid #c9ad8e',
                    borderRadius: 6,
                    background: '#fff',
                    cursor: 'pointer',
                  }}
                >
                  Copy UPI ID
                </button>
              </p>

              <p style={{ color: '#705d4c', lineHeight: 1.6 }}>
                Pay ₹99 using your UPI app. After completing payment, enter
                the UTR/reference number below. Your paid session starts only
                after the admin verifies your payment. Do not submit a
                reference number for a payment you have not made.
              </p>

              {paymentPending ? (
                <p style={{ color: '#8b572a', fontWeight: 600 }}>
                  Payment reference submitted. Await admin verification.
                </p>
              ) : (
                <form
                  onSubmit={(event) => {
                    event.preventDefault();
                    void submitPayment();
                  }}
                  style={{ display: 'grid', gap: 12 }}
                >
                  <label htmlFor="mihir-utr" style={{ fontWeight: 600 }}>
                    UTR / transaction reference number
                  </label>

                  <input
                    id="mihir-utr"
                    value={utr}
                    onChange={(event) => setUtr(event.target.value)}
                    minLength={8}
                    maxLength={30}
                    pattern="[A-Za-z0-9]{8,30}"
                    required
                    placeholder="Enter your UTR number"
                    disabled={loading}
                    style={{
                      width: '100%',
                      boxSizing: 'border-box',
                      padding: 12,
                      border: '1px solid #d8c5ad',
                      borderRadius: 8,
                    }}
                  />

                  <button
                    type="submit"
                    disabled={loading}
                    style={{
                      padding: 12,
                      border: 0,
                      borderRadius: 8,
                      background: '#8b572a',
                      color: '#fff',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    {loading ? 'Submitting...' : 'Submit Payment Reference'}
                  </button>
                </form>
              )}
            </section>
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
                disabled={loading || paidSession === false && sessionEnded}
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
                disabled={loading || (sessionEnded && !paidSession)}
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
                disabled={
                  loading ||
                  (!input.trim() && !photo) ||
                  (sessionEnded && !paidSession)
                }
                style={{
                  border: 0,
                  borderRadius: 10,
                  padding: '12px 20px',
                  background: '#8b572a',
                  color: '#fff',
                  fontWeight: 700,
                  cursor: 'pointer',
                  opacity:
                    loading ||
                    (!input.trim() && !photo) ||
                    (sessionEnded && !paidSession)
                      ? 0.6
                      : 1,
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
