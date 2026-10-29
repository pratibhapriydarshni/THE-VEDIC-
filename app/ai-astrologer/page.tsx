
'use client';

import { useEffect, useRef, useState } from 'react';
import { supabaseBrowser } from '@/lib/supabase-browser';
import './ai-astrologer.css';

type SpeechRecognitionResultLike = {
  0: { transcript: string };
};
type SpeechRecognitionEventLike = { results: ArrayLike<SpeechRecognitionResultLike> };
type SpeechRecognitionLike = {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
};
type SpeechWindow = Window & {
  SpeechRecognition?: new () => SpeechRecognitionLike;
  webkitSpeechRecognition?: new () => SpeechRecognitionLike;
};

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
  const [voiceListening, setVoiceListening] = useState(false);
  const [voiceMode, setVoiceMode] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [voiceLanguage, setVoiceLanguage] = useState('en-IN');

  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      recognitionRef.current?.stop();
      if (typeof window !== 'undefined') window.speechSynthesis?.cancel();
    };
  }, []);

  function speakReply(text: string) {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = /[\u0900-\u097F]/.test(text) ? 'hi-IN' : 'en-IN';
    utterance.rate = 0.94;
    utterance.pitch = 0.92;
    utterance.onstart = () => setSpeaking(true);
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);
    window.speechSynthesis.speak(utterance);
  }

  function toggleVoice() {
    if (voiceListening) {
      recognitionRef.current?.stop();
      setVoiceListening(false);
      return;
    }
    const speechWindow = window as SpeechWindow;
    const Recognition = speechWindow.SpeechRecognition || speechWindow.webkitSpeechRecognition;
    if (!Recognition) {
      setError('Voice input is not supported in this browser. Please try the latest Chrome browser.');
      return;
    }
    setError('');
    setVoiceMode(true);
    const recognition = new Recognition();
    recognition.lang = voiceLanguage;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.onresult = (event) => {
      const spokenText = event.results[0]?.[0]?.transcript?.trim();
      setVoiceListening(false);
      if (spokenText) {
        setInput(spokenText);
        window.setTimeout(() => { void sendMessage(spokenText); }, 80);
      }
    };
    recognition.onerror = () => {
      setVoiceListening(false);
      setError('Microphone input stopped. Check browser microphone permission and try again.');
    };
    recognition.onend = () => setVoiceListening(false);
    recognitionRef.current = recognition;
    try {
      recognition.start();
      setVoiceListening(true);
    } catch {
      setVoiceListening(false);
      setError('Could not start the microphone. Please try again.');
    }
  }

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

  async function sendMessage(voiceText?: string) {
    const message = (voiceText ?? input).trim();
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

      if (voiceMode) speakReply(String(data.reply || '')); 

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
    <main className="mihir-page">
      <div className="mihir-shell">
        <header className="mihir-topbar">
          <a className="mihir-brand" href="/" aria-label="The Vedic Astro home">
            <span className="mihir-brand-mark">ॐ</span>
            <span><strong>THE VEDIC ASTRO</strong><small>WISDOM • GUIDANCE • DISCOVERY</small></span>
          </a>
          <span className="mihir-status"><i /> AI ASTROLOGY GUIDE</span>
        </header>

        <section className="mihir-hero">
          <div className="mihir-hero-copy">
            <span className="mihir-kicker"><span>✦</span> YOUR PERSONAL ASTROLOGY COMPANION</span>
            <h1>Meet <span>Mihir AI</span></h1>
            <p>Explore Vedic astrology, zodiac signs, birth charts and palmistry with your AI guide.</p>
            <div className="mihir-hero-points">
              <span>✧ Astrology insights</span>
              <span>✧ Zodiac & birth charts</span>
              <span>✧ Palm photo guidance</span>
            </div>
          </div>
          <div className="mihir-avatar-stage" aria-label="Animated Mihir AI avatar">
            <div className="mihir-orbit mihir-orbit-one" />
            <div className="mihir-orbit mihir-orbit-two" />
            <span className="mihir-star mihir-star-one">✦</span>
            <span className="mihir-star mihir-star-two">✧</span>
            <div className="mihir-avatar"><span>ॐ</span><i>✦</i></div>
            <span className="mihir-avatar-caption">MIHIR AI</span>
          </div>
        </section>

        <div className={`mihir-voice-status ${voiceListening ? 'is-listening' : ''} ${speaking ? 'is-speaking' : ''}`} aria-live="polite">
          <span className="mihir-voice-pulse">{voiceListening ? '🎙' : speaking ? '🔊' : '✦'}</span>
          <span><strong>{voiceListening ? 'Listening to you…' : speaking ? 'Mihir is speaking…' : 'Talk to Mihir AI'}</strong><small>Use your microphone and hear spoken replies. Browser microphone permission required.</small></span>
          <label className="mihir-voice-language">Voice language<select value={voiceLanguage} onChange={(event) => setVoiceLanguage(event.target.value)} disabled={voiceListening}><option value="en-IN">English</option><option value="hi-IN">Hindi</option></select></label>
        </div>

        <div className="mihir-main-grid">
          <section className="mihir-chat-card" aria-label="AI astrology chat">
            <div className="mihir-chat-heading">
              <div className="mihir-chat-title">
                <span className="mihir-small-avatar">ॐ</span>
                <div><h2>Your conversation</h2><p><i /> Here to help you explore</p></div>
              </div>
              {freeMessagesRemaining !== null && !paidSession && (
                <span className="mihir-message-counter">{freeMessagesRemaining} of 5 free</span>
              )}
              {paidSession && <span className="mihir-paid-badge">✦ Session active</span>}
            </div>

            {paidSession && (
              <div className="mihir-session-active">
                <span>✦ Your paid session is active.</span>
                <button type="button" onClick={endSession} disabled={endingSession || loading}>
                  {endingSession ? 'Ending session…' : 'End session'}
                </button>
              </div>
            )}

            <div className="mihir-conversation">
              {messages.length === 0 && (
                <div className="mihir-welcome">
                  <div className="mihir-welcome-icon">✧</div>
                  <span className="mihir-welcome-eyebrow">NAMASTE</span>
                  <h2>What would you like to explore?</h2>
                  <p>Ask a question about astrology or share a clear palm photo for a general palmistry interpretation.</p>
                  <div className="mihir-suggestions">
                    <button type="button" onClick={() => setInput('What can my zodiac sign tell me?')}>✧ Explore my zodiac</button>
                    <button type="button" onClick={() => setInput('Explain the basics of a birth chart.')}>☼ Understand birth charts</button>
                    <button type="button" onClick={() => setInput('What should I know before a palmistry reading?')}>☷ Learn about palmistry</button>
                  </div>
                </div>
              )}

              <div className="mihir-messages">
                {messages.map((message, index) => (
                  <article key={index} className={`mihir-message ${message.role === 'user' ? 'mihir-message-user' : 'mihir-message-ai'}`}>
                    {message.role === 'assistant' && <span className="mihir-message-avatar">ॐ</span>}
                    <div className="mihir-message-bubble">
                      {message.imageUrl && <img src={message.imageUrl} alt="Palm photo selected for palmistry reading" className="mihir-message-image" />}
                      <p>{message.text}</p>
                    </div>
                  </article>
                ))}
              </div>

              {loading && <div className="mihir-thinking" role="status"><span className="mihir-thinking-dots"><i /><i /><i /></span> Mihir is thinking…</div>}
              {error && <p className="mihir-notice" role="status">{error}</p>}

              {showPayment && !paidSession && (
                <section className="mihir-payment-card">
                  <div className="mihir-payment-top">
                    <span className="mihir-payment-icon">✦</span>
                    <div><span className="mihir-payment-eyebrow">CONTINUE YOUR JOURNEY</span><h2>Mihir AI Premium Session</h2></div>
                    <div className="mihir-price"><strong>₹99</strong><small>per session</small></div>
                  </div>
                  {sessionEnded ? <p className="mihir-payment-description">Your previous paid session has ended. You can request another session below.</p> : <p className="mihir-payment-description">Your five free messages have been used. Request a session that stays active until you choose to end it.</p>}
                  <div className="mihir-upi-box">
                    <div><span>PAY USING UPI</span><strong>thevedicastroindia@ybl</strong></div>
                    <button type="button" onClick={() => void navigator.clipboard.writeText('thevedicastroindia@ybl').then(() => setError('UPI ID copied.')).catch(() => setError('Please copy the UPI ID manually.'))}>Copy UPI ID</button>
                  </div>
                  <p className="mihir-payment-note">Complete your ₹99 payment in your UPI app, then enter the transaction reference. Your paid session starts only after admin verification. Never submit a reference for a payment you have not made.</p>
                  {paymentPending ? (
                    <div className="mihir-pending"><span>◷</span><div><strong>Verification pending</strong><p>Your payment reference has been submitted. Please wait for admin verification.</p></div></div>
                  ) : (
                    <form onSubmit={(event) => { event.preventDefault(); void submitPayment(); }} className="mihir-payment-form">
                      <label htmlFor="mihir-utr">UPI transaction reference (UTR)</label>
                      <input id="mihir-utr" value={utr} onChange={(event) => setUtr(event.target.value)} minLength={8} maxLength={30} pattern="[A-Za-z0-9]{8,30}" required placeholder="Enter 8–30 letter/number reference" disabled={loading} />
                      <button type="submit" disabled={loading}>{loading ? 'Submitting…' : 'Submit for verification'} <span>→</span></button>
                    </form>
                  )}
                </section>
              )}
            </div>

            {photoPreview && (
              <div className="mihir-photo-preview">
                <div><strong>Photo ready to send</strong><button type="button" onClick={removePhoto} disabled={loading}>Remove</button></div>
                <img src={photoPreview} alt="Preview of your selected palm photo" />
              </div>
            )}

            <form onSubmit={(event) => { event.preventDefault(); void sendMessage(); }} className="mihir-composer">
              <input ref={fileInput} type="file" accept="image/jpeg,image/png,image/webp" hidden onChange={(event) => choosePhoto(event.target.files?.[0])} />
              <button className={`mihir-voice-button ${voiceListening ? 'is-listening' : ''}`} type="button" onClick={toggleVoice} disabled={loading || (sessionEnded && !paidSession)} aria-pressed={voiceListening} aria-label={voiceListening ? 'Stop microphone' : 'Talk to Mihir AI'}>{voiceListening ? '■' : '🎙'} <span>{voiceListening ? 'Stop' : 'Talk'}</span></button>
              <button className="mihir-upload-button" type="button" onClick={() => fileInput.current?.click()} disabled={loading || (paidSession === false && sessionEnded)} aria-label="Upload palm photo">＋ <span>Photo</span></button>
              <input className="mihir-message-input" value={input} onChange={(event) => setInput(event.target.value)} placeholder="Ask Mihir about astrology…" maxLength={2000} disabled={loading || (sessionEnded && !paidSession)} aria-label="Your message" />
              <button className="mihir-send-button" type="submit" disabled={loading || (!input.trim() && !photo) || (sessionEnded && !paidSession)}>{loading ? '…' : 'Send'} <span>➤</span></button>
              <small className="mihir-upload-hint">JPG, PNG or WebP · Max 3 MB</small>
            </form>
          </section>

          <aside className="mihir-side-panel">
            <div className="mihir-side-symbol">✧</div>
            <span className="mihir-side-eyebrow">A LITTLE GUIDANCE</span>
            <h2>Curiosity meets cosmic wisdom.</h2>
            <p>Start with a question, explore a concept, or upload a palm photo. Take what feels useful and reflect at your own pace.</p>
            <div className="mihir-side-divider" />
            <div className="mihir-side-feature"><span>01</span><div><strong>Ask freely</strong><small>Explore astrology topics in simple language.</small></div></div>
            <div className="mihir-side-feature"><span>02</span><div><strong>Share a palm photo</strong><small>Get a general, reflective interpretation.</small></div></div>
            <div className="mihir-side-feature"><span>03</span><div><strong>Choose your next step</strong><small>Free messages first, then an optional ₹99 session.</small></div></div>
            <div className="mihir-disclaimer">Astrology and palmistry are cultural and reflective practices, not guaranteed predictions or substitutes for professional medical, legal or financial advice.</div>
          </aside>
        </div>
        <footer className="mihir-footer"><span>✦</span> THE VEDIC ASTRO <span>·</span> Explore with an open mind</footer>
      </div>
    </main>
  );
}
