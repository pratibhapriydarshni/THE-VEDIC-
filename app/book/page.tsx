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

export default function BookPage() {
  const { language: siteLanguage, t } = useLanguage();

  const [services, setServices] = useState<Service[]>([]);
  const [serviceId, setServiceId] = useState('');
  const [language, setLanguage] =
    useState<'Hindi' | 'English'>('Hindi');
  const [mode, setMode] =
    useState<'Chat' | 'Audio' | 'Video'>('Video');
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

  const [bookingId, setBookingId] = useState('');
  const [utr, setUtr] = useState('');
  const [paymentStep, setPaymentStep] = useState(false);
  const [verificationPending, setVerificationPending] =
    useState(false);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const selectedService =
    services.find((service) => service.id === serviceId) || null;

  useEffect(() => {
    fetch('/api/services')
      .then((res) => res.json())
      .then((data) => {
        setServices(data.services || []);
      })
      .catch(() => {
        setMessage(
          t(
            'Unable to load services.',
            'सेवाएँ लोड नहीं हो सकीं।'
          )
        );
      });
  }, []);

  useEffect(() => {
    setStartAt('');
    setSlots([]);

    if (!date || !serviceId) return;

    fetch(
      `/api/booking/slots?date=${encodeURIComponent(
        date
      )}&service_id=${encodeURIComponent(serviceId)}`
    )
      .then((res) => res.json())
      .then((data) => {
        setSlots(data.slots || []);
      })
      .catch(() => {
        setMessage(
          t(
            'Unable to load available slots.',
            'उपलब्ध समय लोड नहीं हो सके।'
          )
        );
      });
  }, [date, serviceId]);

  async function getSession() {
    const sb = supabaseBrowser();

    const {
      data: { session },
    } = await sb.auth.getSession();

    return session;
  }

  async function createBooking(e: React.FormEvent) {
    e.preventDefault();
    setMessage('');

    if (!serviceId || !startAt) {
      setMessage(
        t(
          'Please select service, date and time.',
          'कृपया सेवा, तारीख और समय चुनें।'
        )
      );
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
        setMessage(
          data.error ||
            t(
              'Booking could not be created.',
              'बुकिंग नहीं बनाई जा सकी।'
            )
        );
        return;
      }

      setBookingId(data.booking.id);
      setPaymentStep(true);

      window.scrollTo({
        top: 0,
        behavior: 'smooth',
      });
    } catch {
      setMessage(
        t(
          'Something went wrong. Please try again.',
          'कुछ गलत हो गया। कृपया फिर से प्रयास करें।'
        )
      );
    } finally {
      setLoading(false);
    }
  }

  async function submitUtr(e: React.FormEvent) {
    e.preventDefault();
    setMessage('');

    const cleanUtr = utr.trim();

    if (cleanUtr.length < 6) {
      setMessage(
        t(
          'Please enter a valid UTR / transaction reference.',
          'कृपया सही UTR / ट्रांजैक्शन रेफरेंस दर्ज करें।'
        )
      );
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
        if (data.error === 'UTR_ALREADY_USED') {
          setMessage(
            t(
              'This UTR has already been submitted for another booking.',
              'यह UTR पहले ही दूसरी बुकिंग के लिए जमा किया जा चुका है।'
            )
          );
        } else {
          setMessage(
            data.error ||
              t(
                'Unable to submit payment details.',
                'भुगतान की जानकारी जमा नहीं हो सकी।'
              )
          );
        }

        return;
      }

      setVerificationPending(true);
    } catch {
      setMessage(
        t(
          'Unable to submit payment details. Please try again.',
          'भुगतान की जानकारी जमा नहीं हो सकी। कृपया फिर से प्रयास करें।'
        )
      );
    } finally {
      setLoading(false);
    }
  }

  if (verificationPending) {
    return (
      <>
        <SiteNav />

        <main className="wrap">
          <div className="card">
            <h1>
              {t(
                'Payment Verification Pending',
                'भुगतान सत्यापन लंबित है'
              )}
            </h1>

            <p>
              {t(
                'Your payment details have been submitted successfully.',
                'आपकी भुगतान जानकारी सफलतापूर्वक जमा हो गई है।'
              )}
            </p>

            <p>
              {t(
                'Your booking will be confirmed after the payment is verified.',
                'भुगतान सत्यापित होने के बाद आपकी बुकिंग कन्फर्म की जाएगी।'
              )}
            </p>

            <a className="cta" href="/dashboard">
              {t('View Dashboard', 'डैशबोर्ड देखें')}
            </a>
          </div>
        </main>

        <SiteFooter />
      </>
    );
  }

  if (paymentStep) {
    return (
      <>
        <SiteNav />

        <main className="wrap">
          <div className="card">
            <h1>
              {t('Complete Payment', 'भुगतान पूरा करें')}
            </h1>

            {selectedService && (
              <>
                <h2>{selectedService.name}</h2>

                <p>
                  {t('Amount to Pay:', 'भुगतान राशि:')}{' '}
                  <strong>
                    ₹{Number(selectedService.price_inr)}
                  </strong>
                </p>
              </>
            )}

            <p>
              {t(
                'Scan the QR code below using your UPI app.',
                'अपने UPI ऐप से नीचे दिए गए QR कोड को स्कैन करें।'
              )}
            </p>

            <div
              style={{
                textAlign: 'center',
                margin: '24px 0',
              }}
            >
              <img
                src="/upi-payment-qr.png"
                alt="THE VEDIC ASTRO UPI payment QR code"
                style={{
                  width: '100%',
                  maxWidth: '320px',
                  height: 'auto',
                  borderRadius: '12px',
                }}
              />
            </div>

            <p>
              UPI ID:{' '}
              <strong>thevedicastroindia@ybl</strong>
            </p>

            <p>
              {t(
                'Please pay the exact amount shown above. After payment, enter the UTR / transaction reference below.',
                'कृपया ऊपर दिखाई गई सही राशि का भुगतान करें। भुगतान के बाद नीचे UTR / ट्रांजैक्शन रेफरेंस दर्ज करें।'
              )}
            </p>

            <form onSubmit={submitUtr}>
              <label>
                {t(
                  'UTR / Transaction Reference',
                  'UTR / ट्रांजैक्शन रेफरेंस'
                )}

                <input
                  value={utr}
                  onChange={(e) => setUtr(e.target.value)}
                  placeholder={t(
                    'Enter payment UTR',
                    'भुगतान UTR दर्ज करें'
                  )}
                  required
                  minLength={6}
                  maxLength={50}
                  autoComplete="off"
                />
              </label>

              {message && <p>{message}</p>}

              <button
                className="cta"
                type="submit"
                disabled={loading}
              >
                {loading
                  ? t(
                      'Submitting...',
                      'जमा किया जा रहा है...'
                    )
                  : t(
                      'Submit Payment for Verification',
                      'सत्यापन के लिए भुगतान जमा करें'
                    )}
              </button>
            </form>

            <p style={{ marginTop: '20px' }}>
              {t(
                'Do not submit payment details unless you have completed the payment.',
                'भुगतान पूरा किए बिना भुगतान की जानकारी जमा न करें।'
              )}
            </p>
          </div>
        </main>

        <SiteFooter />
      </>
    );
  }

  return (
    <>
      <SiteNav />

      <main className="wrap">
        <h1>
          {t('Book Consultation', 'परामर्श बुक करें')}
        </h1>

        <form className="card" onSubmit={createBooking}>
          <label>
            {t('Service', 'सेवा')}

            <select
              value={serviceId}
              onChange={(e) => setServiceId(e.target.value)}
              required
            >
              <option value="">
                {t('Select Service', 'सेवा चुनें')}
              </option>

              {services.map((service) => (
                <option
                  key={service.id}
                  value={service.id}
                >
                  {service.name} — ₹{service.price_inr} /{' '}
                  {service.duration_minutes}{' '}
                  {t('min', 'मिनट')}
                </option>
              ))}
            </select>
          </label>

          <label>
            {t('Language', 'परामर्श की भाषा')}

            <select
              value={language}
              onChange={(e) =>
                setLanguage(
                  e.target.value as 'Hindi' | 'English'
                )
              }
            >
              <option value="Hindi">
                {t('Hindi', 'हिन्दी')}
              </option>

              <option value="English">
                {t('English', 'अंग्रेज़ी')}
              </option>
            </select>
          </label>

          <label>
            {t(
              'Consultation Mode',
              'परामर्श का माध्यम'
            )}

            <select
              value={mode}
              onChange={(e) =>
                setMode(
                  e.target.value as
                    | 'Chat'
                    | 'Audio'
                    | 'Video'
                )
              }
            >
              <option value="Chat">
                {t('Chat', 'चैट')}
              </option>

              <option value="Audio">
                {t('Audio', 'ऑडियो')}
              </option>

              <option value="Video">
                {t('Video', 'वीडियो')}
              </option>
            </select>
          </label>

          <label>
            {t('Date', 'तारीख')}

            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </label>

          <label>
            {t(
              'Available Time',
              'उपलब्ध समय'
            )}

            <select
              value={startAt}
              onChange={(e) => setStartAt(e.target.value)}
              required
              disabled={!slots.length}
            >
              <option value="">
                {slots.length
                  ? t('Select Time', 'समय चुनें')
                  : t(
                      'Select service and date first',
                      'पहले सेवा और तारीख चुनें'
                    )}
              </option>

              {slots.map((slot) => (
                <option key={slot} value={slot}>
                  {new Date(slot).toLocaleTimeString(
                    siteLanguage === 'hi'
                      ? 'hi-IN'
                      : 'en-IN',
                    {
                      hour: '2-digit',
                      minute: '2-digit',
                      timeZone: 'Asia/Kolkata',
                    }
                  )}
                </option>
              ))}
            </select>
          </label>

          <h2>
            {t('Your Details', 'आपकी जानकारी')}
          </h2>

          <label>
            {t('Name', 'नाम')}

            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              minLength={2}
            />
          </label>

          <label>
            {t('Phone', 'फ़ोन नंबर')}

            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
          </label>

          <label>
            {t('Email', 'ईमेल')}

            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>

          <label>
            {t('Date of Birth', 'जन्म तिथि')}

            <input
              value={dob}
              onChange={(e) => setDob(e.target.value)}
              placeholder={t(
                'Optional',
                'वैकल्पिक'
              )}
            />
          </label>

          <label>
            {t('Time of Birth', 'जन्म समय')}

            <input
              value={tob}
              onChange={(e) => setTob(e.target.value)}
              placeholder={t(
                'Optional',
                'वैकल्पिक'
              )}
            />
          </label>

          <label>
            {t('Place of Birth', 'जन्म स्थान')}

            <input
              value={pob}
              onChange={(e) => setPob(e.target.value)}
              placeholder={t(
                'Optional',
                'वैकल्पिक'
              )}
            />
          </label>

          <label>
            {t('Current Place', 'वर्तमान स्थान')}

            <input
              value={currentPlace}
              onChange={(e) =>
                setCurrentPlace(e.target.value)
              }
              placeholder={t(
                'Optional',
                'वैकल्पिक'
              )}
            />
          </label>

          <label>
            {t(
              'Purpose / Question',
              'परामर्श का उद्देश्य / प्रश्न'
            )}

            <textarea
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              placeholder={t(
                'Tell us what you would like guidance about',
                'बताएँ कि आप किस विषय में मार्गदर्शन चाहते हैं'
              )}
            />
          </label>

          {message && <p>{message}</p>}

          <button
            className="cta"
            type="submit"
            disabled={loading}
          >
            {loading
              ? t(
                  'Creating Booking...',
                  'बुकिंग बनाई जा रही है...'
                )
              : t(
                  'Continue to Payment',
                  'भुगतान के लिए आगे बढ़ें'
                )}
          </button>
        </form>
      </main>

      <SiteFooter />
    </>
  );
}