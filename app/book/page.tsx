
'use client';

import { useEffect, useState } from 'react';
import SiteNav from '@/components/site-nav';
import SiteFooter from '@/components/site-footer';
import { supabaseBrowser } from '@/lib/supabase-browser';
import { useLanguage } from '@/components/language-provider';

type Service = {
  id: string;
  name: string;
  price_inr: number;
  price_usd: number;
  duration_minutes: number;
};

const steps = ['Consultation', 'Date & Time', 'Your Details'];

export default function BookPage() {
  const { language: siteLanguage, t } = useLanguage();

  const [services, setServices] = useState<Service[]>([]);
  const [serviceId, setServiceId] = useState('');
  const [language, setLanguage] = useState<'Hindi' | 'English'>('Hindi');
  const [mode, setMode] = useState<'Chat' | 'Audio' | 'Video'>('Video');

  const [date, setDate] = useState('');
  const [slots, setSlots] = useState<string[]>([]);
  const [startAt, setStartAt] = useState('');

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [dob, setDob] = useState('');
  const [tob, setTob] = useState('');
  const [pob, setPob] = useState('');
  const [currentPlace, setCurrentPlace] = useState('');
  const [purpose, setPurpose] = useState('');

  const [step, setStep] = useState(1);
  const [bookingId, setBookingId] = useState('');
  const [utr, setUtr] = useState('');
  const [paymentStep, setPaymentStep] = useState(false);
  const [verificationPending, setVerificationPending] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const selectedService =
    services.find((service) => service.id === serviceId) || null;

  const today = new Date();
  const minDate = [
    today.getFullYear(),
    String(today.getMonth() + 1).padStart(2, '0'),
    String(today.getDate()).padStart(2, '0'),
  ].join('-');

  useEffect(() => {
    fetch('/api/services')
      .then((res) => res.json())
      .then((data) => setServices(data.services || []))
      .catch(() => setMessage(t('Unable to load services.', 'सेवाएँ लोड नहीं हो सकीं।')));
  }, [t]);

  useEffect(() => {
    setStartAt('');
    setSlots([]);

    if (!date || !serviceId) return;

    fetch(
      `/api/booking/slots?date=${encodeURIComponent(date)}&service_id=${encodeURIComponent(serviceId)}`
    )
      .then((res) => res.json())
      .then((data) => setSlots(data.slots || []))
      .catch(() =>
        setMessage(t('Unable to load available slots.', 'उपलब्ध समय लोड नहीं हो सके।'))
      );
  }, [date, serviceId, t]);

  async function getSession() {
    const sb = supabaseBrowser();
    const { data: { session } } = await sb.auth.getSession();
    return session;
  }

  function nextStep() {
    setMessage('');

    if (step === 1 && !serviceId) {
      setMessage(t('Please select a consultation service.', 'कृपया परामर्श सेवा चुनें।'));
      return;
    }

    if (step === 2 && (!date || !startAt)) {
      setMessage(t('Please select a date and available time.', 'कृपया तारीख और उपलब्ध समय चुनें।'));
      return;
    }

    setStep((current) => Math.min(current + 1, 3));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function previousStep() {
    setMessage('');
    setStep((current) => Math.max(current - 1, 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function createBooking(e: React.FormEvent) {
    e.preventDefault();
    setMessage('');

    if (!serviceId || !date || !startAt) {
      setMessage(t('Please select service, date and time.', 'कृपया सेवा, तारीख और समय चुनें।'));
      setStep(1);
      return;
    }

    const session = await getSession();

    if (!session) {
      window.location.href = '/login?next=/book';
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/booking/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          service_id: serviceId,
          language,
          mode,
          start_at: startAt,
          name,
          phone,
          email,
          dob: dob || undefined,
          tob: tob || undefined,
          pob: pob || undefined,
          current_place: currentPlace || undefined,
          purpose: purpose || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.error || t('Booking could not be created.', 'बुकिंग नहीं बनाई जा सकी।'));
        return;
      }

      setBookingId(data.booking.id);
      setPaymentStep(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch {
      setMessage(t('Something went wrong. Please try again.', 'कुछ गलत हो गया। कृपया फिर से प्रयास करें।'));
    } finally {
      setLoading(false);
    }
  }

  async function submitUtr(e: React.FormEvent) {
    e.preventDefault();
    setMessage('');

    const cleanUtr = utr.trim();

    if (cleanUtr.length < 6) {
      setMessage(t('Please enter a valid UTR / transaction reference.', 'कृपया सही UTR / ट्रांजैक्शन रेफरेंस दर्ज करें।'));
      return;
    }

    const session = await getSession();

    if (!session) {
      window.location.href = '/login?next=/book';
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/payments/upi/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          booking_id: bookingId,
          utr: cleanUtr,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(
          data.error === 'UTR_ALREADY_USED'
            ? t('This UTR has already been submitted for another booking.', 'यह UTR पहले ही दूसरी बुकिंग के लिए जमा किया जा चुका है।')
            : data.error || t('Unable to submit payment details.', 'भुगतान की जानकारी जमा नहीं हो सकी।')
        );
        return;
      }

      setVerificationPending(true);
    } catch {
      setMessage(t('Unable to submit payment details. Please try again.', 'भुगतान की जानकारी जमा नहीं हो सकी। कृपया फिर से प्रयास करें।'));
    } finally {
      setLoading(false);
    }
  }

  const cardStyle: React.CSSProperties = {
    background: 'var(--card, #fff)',
    border: '1px solid var(--border, #e8e5ef)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 18,
  };

  const choiceStyle = (active: boolean): React.CSSProperties => ({
    border: active ? '2px solid #5140a8' : '1px solid #e5e1ef',
    background: active ? '#f5f2ff' : '#fff',
    color: '#29243c',
    borderRadius: 12,
    padding: 16,
    textAlign: 'left',
    cursor: 'pointer',
    width: '100%',
  });

  const buttonStyle: React.CSSProperties = {
    background: '#5140a8',
    color: '#fff',
    border: 0,
    borderRadius: 10,
    padding: '13px 22px',
    fontWeight: 600,
    cursor: 'pointer',
  };

  const fieldStyle: React.CSSProperties = {
    width: '100%',
    padding: '12px 13px',
    borderRadius: 9,
    border: '1px solid #dedbe8',
    marginTop: 7,
    boxSizing: 'border-box',
  };

  if (verificationPending) {
    return (
      <>
        <SiteNav />
        <main className="wrap" style={{ maxWidth: 720, paddingTop: 35, paddingBottom: 45 }}>
          <section className="card" style={{ ...cardStyle, textAlign: 'center', padding: 35 }}>
            <div style={{ fontSize: 48 }}>✓</div>
            <h1>{t('Payment Verification Pending', 'भुगतान सत्यापन लंबित है')}</h1>
            <p>{t('Your payment details have been submitted successfully.', 'आपकी भुगतान जानकारी सफलतापूर्वक जमा हो गई है।')}</p>
            <p>{t('Your booking will be confirmed after the payment is verified.', 'भुगतान सत्यापित होने के बाद आपकी बुकिंग कन्फर्म की जाएगी।')}</p>
            <a className="cta" href="/dashboard">{t('View Dashboard', 'डैशबोर्ड देखें')}</a>
          </section>
        </main>
        <SiteFooter />
      </>
    );
  }

  if (paymentStep) {
    return (
      <>
        <SiteNav />
        <main className="wrap" style={{ maxWidth: 720, paddingTop: 30, paddingBottom: 45 }}>
          <section className="card" style={cardStyle}>
            <h1>{t('Complete Payment', 'भुगतान पूरा करें')}</h1>
            <div style={{ background: '#f6f3ff', borderRadius: 12, padding: 16 }}>
              <p>{selectedService?.name}</p>
              <h2>₹{Number(selectedService?.price_inr || 0)}</h2>
              <p>{date} · {startAt ? new Date(startAt).toLocaleTimeString(siteLanguage === 'hi' ? 'hi-IN' : 'en-IN', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Kolkata' }) : ''}</p>
            </div>

            <p>{t('Scan the QR code below using your UPI app.', 'अपने UPI ऐप से नीचे दिए गए QR कोड को स्कैन करें।')}</p>
            <div style={{ textAlign: 'center', margin: '22px 0' }}>
              <img src="/upi-payment-qr.png" alt="THE VEDIC ASTRO UPI payment QR code" style={{ width: '100%', maxWidth: 300, borderRadius: 12 }} />
            </div>

            <p>UPI ID: <strong>thevedicastroindia@ybl</strong></p>
            <p>{t('Pay the exact amount shown above. After payment, enter your UTR / transaction reference.', 'ऊपर दिखाई गई सही राशि का भुगतान करें। भुगतान के बाद UTR / ट्रांजैक्शन रेफरेंस दर्ज करें।')}</p>

            <form onSubmit={submitUtr}>
              <label>
                {t('UTR / Transaction Reference', 'UTR / ट्रांजैक्शन रेफरेंस')}
                <input style={fieldStyle} value={utr} onChange={(e) => setUtr(e.target.value)} placeholder={t('Enter payment UTR', 'भुगतान UTR दर्ज करें')} required minLength={6} maxLength={50} autoComplete="off" />
              </label>
              {message && <p role="alert">{message}</p>}
              <button style={{ ...buttonStyle, width: '100%', marginTop: 18 }} type="submit" disabled={loading}>
                {loading ? t('Submitting...', 'जमा किया जा रहा है...') : t('Submit Payment for Verification', 'सत्यापन के लिए भुगतान जमा करें')}
              </button>
            </form>
            <p style={{ fontSize: 13, color: '#777' }}>{t('Only submit payment details after completing the payment.', 'भुगतान पूरा करने के बाद ही जानकारी जमा करें।')}</p>
          </section>
        </main>
        <SiteFooter />
      </>
    );
  }

  return (
    <>
      <SiteNav />
      <main className="wrap" style={{ maxWidth: 900, paddingTop: 24, paddingBottom: 45 }}>
        <header style={{ background: '#17152e', color: '#fff', padding: '22px 24px', borderRadius: 14, marginBottom: 22 }}>
          <h1 style={{ margin: 0 }}>{t('Book Consultation', 'परामर्श बुक करें')}</h1>
          <p style={{ marginBottom: 0, opacity: 0.85 }}>{t('Get expert guidance from Pt. Deepak Acharya', 'पं. दीपक आचार्य से विशेषज्ञ मार्गदर्शन प्राप्त करें')}</p>
        </header>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 22 }}>
          {steps.map((label, index) => (
            <div key={label} style={{ textAlign: 'center', borderBottom: step === index + 1 ? '3px solid #5140a8' : '3px solid #e6e2ef', padding: '10px 3px', color: step === index + 1 ? '#5140a8' : '#777', fontSize: 13, fontWeight: 600 }}>
              <span style={{ display: 'inline-grid', placeItems: 'center', width: 25, height: 25, borderRadius: '50%', background: step > index + 1 ? '#25865c' : step === index + 1 ? '#5140a8' : '#eeeaf5', color: step >= index + 1 ? '#fff' : '#777', marginRight: 6 }}>
                {step > index + 1 ? '✓' : index + 1}
              </span>
              {t(label, ['परामर्श', 'तारीख और समय', 'आपकी जानकारी'][index])}
            </div>
          ))}
        </div>

        <form onSubmit={createBooking}>
          {step === 1 && (
            <section style={cardStyle}>
              <h2>{t('1. Choose Consultation', '1. परामर्श चुनें')}</h2>
              <p style={{ color: '#777' }}>{t('Select the service you need.', 'अपनी ज़रूरत की सेवा चुनें।')}</p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: 12 }}>
                {services.map((service) => (
                  <button key={service.id} type="button" onClick={() => setServiceId(service.id)} style={choiceStyle(serviceId === service.id)}>
                    <strong>{service.name}</strong>
                    <div style={{ marginTop: 8, fontSize: 14 }}>₹{service.price_inr} · {service.duration_minutes} min</div>
                    {serviceId === service.id && <div style={{ color: '#5140a8', marginTop: 7 }}>✓ {t('Selected', 'चुना गया')}</div>}
                  </button>
                ))}
              </div>

              <h3 style={{ marginTop: 24 }}>{t('Consultation Language', 'परामर्श की भाषा')}</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {(['Hindi', 'English'] as const).map((item) => (
                  <button key={item} type="button" onClick={() => setLanguage(item)} style={choiceStyle(language === item)}>{item === 'Hindi' ? 'हिन्दी' : 'English'}</button>
                ))}
              </div>

              <h3 style={{ marginTop: 24 }}>{t('Consultation Mode', 'परामर्श का माध्यम')}</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
                {(['Chat', 'Audio', 'Video'] as const).map((item) => (
                  <button key={item} type="button" onClick={() => setMode(item)} style={choiceStyle(mode === item)}>
                    {item === 'Chat' ? '💬 ' : item === 'Audio' ? '🎧 ' : '📹 '}{t(item, item === 'Chat' ? 'चैट' : item === 'Audio' ? 'ऑडियो' : 'वीडियो')}
                  </button>
                ))}
              </div>

              {selectedService && (
                <div style={{ background: '#f6f3ff', padding: 15, borderRadius: 10, marginTop: 20 }}>
                  <strong>{selectedService.name}</strong>
                  <span style={{ float: 'right', fontWeight: 700 }}>₹{selectedService.price_inr}</span>
                  <div style={{ fontSize: 13, color: '#777', marginTop: 5 }}>{selectedService.duration_minutes} minutes · {language} · {mode}</div>
                </div>
              )}
            </section>
          )}

          {step === 2 && (
            <section style={cardStyle}>
              <h2>{t('2. Choose Date & Time', '2. तारीख और समय चुनें')}</h2>
              {selectedService && (
                <div style={{ background: '#f6f3ff', padding: 14, borderRadius: 10, marginBottom: 20 }}>
                  <strong>{selectedService.name}</strong> · {language} · {mode} · ₹{selectedService.price_inr}
                </div>
              )}

              <label>
                <strong>{t('Select Date', 'तारीख चुनें')}</strong>
                <input style={fieldStyle} type="date" value={date} min={minDate} onChange={(e) => setDate(e.target.value)} required />
              </label>

              <h3 style={{ marginTop: 22 }}>{t('Available Time Slots', 'उपलब्ध समय')}</h3>
              {!date || !serviceId ? (
                <p style={{ color: '#777' }}>{t('Choose a service and date to see available times.', 'उपलब्ध समय देखने के लिए सेवा और तारीख चुनें।')}</p>
              ) : slots.length === 0 ? (
                <p style={{ color: '#777' }}>{t('No available slots. Please try another date.', 'कोई समय उपलब्ध नहीं है। दूसरी तारीख चुनें।')}</p>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: 10 }}>
                  {slots.map((slot) => {
                    const label = new Date(slot).toLocaleTimeString(siteLanguage === 'hi' ? 'hi-IN' : 'en-IN', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Kolkata' });
                    return (
                      <button key={slot} type="button" onClick={() => setStartAt(slot)} style={{ ...choiceStyle(startAt === slot), textAlign: 'center' }}>
                        {label}
                      </button>
                    );
                  })}
                </div>
              )}
            </section>
          )}

          {step === 3 && (
            <>
              <section style={cardStyle}>
                <h2>{t('3. Your Details', '3. आपकी जानकारी')}</h2>
                <p style={{ color: '#777' }}>{t('Please enter your contact details.', 'कृपया अपनी संपर्क जानकारी भरें।')}</p>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: 14 }}>
                  <label>{t('Full Name', 'पूरा नाम')} *
                    <input style={fieldStyle} value={name} onChange={(e) => setName(e.target.value)} required minLength={2} />
                  </label>
                  <label>{t('Phone Number', 'फ़ोन नंबर')} *
                    <input style={fieldStyle} type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} required />
                  </label>
                  <label>{t('Email Address', 'ईमेल')} *
                    <input style={fieldStyle} type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                  </label>
                  <label>{t('Date of Birth', 'जन्म तिथि')}
                    <input style={fieldStyle} type="date" value={dob} onChange={(e) => setDob(e.target.value)} />
                  </label>
                  <label>{t('Time of Birth', 'जन्म समय')}
                    <input style={fieldStyle} type="time" value={tob} onChange={(e) => setTob(e.target.value)} />
                  </label>
                  <label>{t('Place of Birth', 'जन्म स्थान')}
                    <input style={fieldStyle} value={pob} onChange={(e) => setPob(e.target.value)} placeholder={t('City, State, Country', 'शहर, राज्य, देश')} />
                  </label>
                </div>

                <label style={{ display: 'block', marginTop: 15 }}>{t('Current Place (Optional)', 'वर्तमान स्थान (वैकल्पिक)')}
                  <input style={fieldStyle} value={currentPlace} onChange={(e) => setCurrentPlace(e.target.value)} placeholder={t('City, State, Country', 'शहर, राज्य, देश')} />
                </label>

                <label style={{ display: 'block', marginTop: 15 }}>{t('Purpose / Question (Optional)', 'उद्देश्य / प्रश्न (वैकल्पिक)')}
                  <textarea style={{ ...fieldStyle, minHeight: 95, resize: 'vertical' }} value={purpose} onChange={(e) => setPurpose(e.target.value)} placeholder={t('Tell us what you would like guidance about...', 'बताएँ कि आप किस विषय में मार्गदर्शन चाहते हैं...')} />
                </label>
              </section>

              <section style={cardStyle}>
                <h2>{t('Booking Summary', 'बुकिंग का सारांश')}</h2>
                <p><strong>{t('Service', 'सेवा')}:</strong> {selectedService?.name}</p>
                <p><strong>{t('Date', 'तारीख')}:</strong> {date}</p>
                <p><strong>{t('Time', 'समय')}:</strong> {startAt ? new Date(startAt).toLocaleTimeString(siteLanguage === 'hi' ? 'hi-IN' : 'en-IN', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Kolkata' }) : ''}</p>
                <p><strong>{t('Mode', 'माध्यम')}:</strong> {mode} · {language}</p>
                <div style={{ borderTop: '1px solid #e5e1ef', paddingTop: 14, fontSize: 20, fontWeight: 700 }}>
                  {t('Total', 'कुल')}: ₹{selectedService?.price_inr}
                </div>
              </section>
            </>
          )}

          {message && <p role="alert" style={{ color: '#b42318', background: '#fff1f0', padding: 12, borderRadius: 9 }}>{message}</p>}

          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, marginTop: 18 }}>
            {step > 1 ? (
              <button type="button" onClick={previousStep} style={{ ...buttonStyle, background: '#fff', color: '#5140a8', border: '1px solid #5140a8' }}>
                ← {t('Back', 'वापस')}
              </button>
            ) : <span />}

            {step < 3 ? (
              <button type="button" onClick={nextStep} style={buttonStyle}>
                {t('Continue', 'आगे बढ़ें')} →
              </button>
            ) : (
              <button type="submit" disabled={loading} style={buttonStyle}>
                {loading ? t('Creating Booking...', 'बुकिंग बनाई जा रही है...') : t('Continue to Payment', 'भुगतान के लिए आगे बढ़ें')} →
              </button>
            )}
          </div>
        </form>
      </main>
      <SiteFooter />
    </>
  );
}
