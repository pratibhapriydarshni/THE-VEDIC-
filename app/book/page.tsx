'use client';

import { useEffect, useState } from 'react';
import SiteNav from '@/components/site-nav';
import SiteFooter from '@/components/site-footer';
import { supabaseBrowser } from '@/lib/supabase-browser';

type Service = {
  id: string;
  name: string;
  price_inr: number;
  price_usd: number;
  duration_minutes: number;
};

export default function BookPage() {
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

  const [bookingId, setBookingId] = useState('');
  const [utr, setUtr] = useState('');
  const [paymentStep, setPaymentStep] = useState(false);
  const [verificationPending, setVerificationPending] = useState(false);

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
        setMessage('Unable to load services.');
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
        setMessage('Unable to load available slots.');
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
      setMessage('Please select service, date and time.');
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
        setMessage(data.error || 'Booking could not be created.');
        return;
      }

      setBookingId(data.booking.id);
      setPaymentStep(true);

      window.scrollTo({
        top: 0,
        behavior: 'smooth',
      });
    } catch {
      setMessage('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  async function submitUtr(e: React.FormEvent) {
    e.preventDefault();
    setMessage('');

    const cleanUtr = utr.trim();

    if (cleanUtr.length < 6) {
      setMessage('Please enter a valid UTR / transaction reference.');
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
            'This UTR has already been submitted for another booking.'
          );
        } else {
          setMessage(data.error || 'Unable to submit payment details.');
        }
        return;
      }

      setVerificationPending(true);
    } catch {
      setMessage('Unable to submit payment details. Please try again.');
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
            <h1>Payment Verification Pending</h1>

            <p>
              Your payment details have been submitted successfully.
            </p>

            <p>
              Your booking will be confirmed after the payment is verified.
            </p>

            <a className="cta" href="/dashboard">
              View Dashboard
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
            <h1>Complete Payment</h1>

            {selectedService && (
              <>
                <h2>{selectedService.name}</h2>

                <p>
                  Amount to Pay:{' '}
                  <strong>₹{Number(selectedService.price_inr)}</strong>
                </p>
              </>
            )}

            <p>Scan the QR code below using your UPI app.</p>

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
              Please pay the exact amount shown above. After payment,
              enter the UTR / transaction reference below.
            </p>

            <form onSubmit={submitUtr}>
              <label>
                UTR / Transaction Reference
                <input
                  value={utr}
                  onChange={(e) => setUtr(e.target.value)}
                  placeholder="Enter payment UTR"
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
                  ? 'Submitting...'
                  : 'Submit Payment for Verification'}
              </button>
            </form>

            <p style={{ marginTop: '20px' }}>
              Do not submit payment details unless you have completed
              the payment.
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
        <h1>Book Consultation</h1>

        <form className="card" onSubmit={createBooking}>
          <label>
            Service
            <select
              value={serviceId}
              onChange={(e) => setServiceId(e.target.value)}
              required
            >
              <option value="">Select Service</option>

              {services.map((service) => (
                <option key={service.id} value={service.id}>
                  {service.name} — ₹{service.price_inr} /{' '}
                  {service.duration_minutes} min
                </option>
              ))}
            </select>
          </label>

          <label>
            Language
            <select
              value={language}
              onChange={(e) =>
                setLanguage(e.target.value as 'Hindi' | 'English')
              }
            >
              <option value="Hindi">Hindi</option>
              <option value="English">English</option>
            </select>
          </label>

          <label>
            Consultation Mode
            <select
              value={mode}
              onChange={(e) =>
                setMode(
                  e.target.value as 'Chat' | 'Audio' | 'Video'
                )
              }
            >
              <option value="Chat">Chat</option>
              <option value="Audio">Audio</option>
              <option value="Video">Video</option>
            </select>
          </label>

          <label>
            Date
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </label>

          <label>
            Available Time
            <select
              value={startAt}
              onChange={(e) => setStartAt(e.target.value)}
              required
              disabled={!slots.length}
            >
              <option value="">
                {slots.length
                  ? 'Select Time'
                  : 'Select service and date first'}
              </option>

              {slots.map((slot) => (
                <option key={slot} value={slot}>
                  {new Date(slot).toLocaleTimeString('en-IN', {
                    hour: '2-digit',
                    minute: '2-digit',
                    timeZone: 'Asia/Kolkata',
                  })}
                </option>
              ))}
            </select>
          </label>

          <h2>Your Details</h2>

          <label>
            Name
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              minLength={2}
            />
          </label>

          <label>
            Phone
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
          </label>

          <label>
            Email
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>

          <label>
            Date of Birth
            <input
              value={dob}
              onChange={(e) => setDob(e.target.value)}
              placeholder="Optional"
            />
          </label>

          <label>
            Time of Birth
            <input
              value={tob}
              onChange={(e) => setTob(e.target.value)}
              placeholder="Optional"
            />
          </label>

          <label>
            Place of Birth
            <input
              value={pob}
              onChange={(e) => setPob(e.target.value)}
              placeholder="Optional"
            />
          </label>

          <label>
            Current Place
            <input
              value={currentPlace}
              onChange={(e) => setCurrentPlace(e.target.value)}
              placeholder="Optional"
            />
          </label>

          <label>
            Purpose / Question
            <textarea
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              placeholder="Tell us what you would like guidance about"
            />
          </label>

          {message && <p>{message}</p>}

          <button
            className="cta"
            type="submit"
            disabled={loading}
          >
            {loading
              ? 'Creating Booking...'
              : 'Continue to Payment'}
          </button>
        </form>
      </main>

      <SiteFooter />
    </>
  );
}