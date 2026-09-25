'use client';

import { useEffect, useState } from 'react';
import { supabaseBrowser } from '@/lib/supabase-browser';

type Booking = {
  id: string;
  name: string;
  start_at: string;
  duration_minutes: number;
  mode: string;
  language: string;
  status: string;
  payment_status: string;
  payment_method: string | null;
  upi_utr: string | null;
  payment_submitted_at: string | null;
  services:
    | {
        name: string;
        price_inr: number;
        price_usd: number;
      }
    | {
        name: string;
        price_inr: number;
        price_usd: number;
      }[]
    | null;
};

export default function AdminManagement() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [workingId, setWorkingId] = useState<string | null>(null);

  async function getToken() {
    const {
      data: { session },
    } = await supabaseBrowser().auth.getSession();

    return session?.access_token || null;
  }

  async function loadPayments() {
    setLoading(true);
    setMessage('');

    try {
      const token = await getToken();

      if (!token) {
        setMessage('Please login with your admin account.');
        setBookings([]);
        return;
      }

      const res = await fetch(
        '/api/admin/bookings?payment_status=verification_pending',
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          cache: 'no-store',
        }
      );

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 403) {
          throw new Error('This account does not have admin access.');
        }

        throw new Error(data.error || 'Unable to load payments.');
      }

      setBookings(data.bookings || []);
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : 'Unable to load payments.'
      );
    } finally {
      setLoading(false);
    }
  }

  async function paymentAction(
    bookingId: string,
    action: 'verify_payment' | 'reject_payment'
  ) {
    if (workingId) return;

    const text =
      action === 'verify_payment'
        ? 'Verify this payment only after confirming the amount and UTR in your bank/UPI app?'
        : 'Reject this payment submission?';

    if (!window.confirm(text)) return;

    setWorkingId(bookingId);
    setMessage('');

    try {
      const token = await getToken();

      if (!token) {
        throw new Error('Admin session expired. Please login again.');
      }

      const res = await fetch('/api/admin/bookings', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          booking_id: bookingId,
          action,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Action failed.');
      }

      setMessage(
        action === 'verify_payment'
          ? 'Payment verified. Booking is now confirmed.'
          : 'Payment submission rejected.'
      );

      setBookings((current) =>
        current.filter((booking) => booking.id !== bookingId)
      );
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : 'Action failed.'
      );
    } finally {
      setWorkingId(null);
    }
  }

  function serviceFor(booking: Booking) {
    if (Array.isArray(booking.services)) {
      return booking.services[0] || null;
    }

    return booking.services;
  }

  useEffect(() => {
    loadPayments();
  }, []);

  return (
    <main
      style={{
        maxWidth: 1100,
        margin: '0 auto',
        padding: '32px 20px',
        fontFamily: 'system-ui, sans-serif',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 16,
          flexWrap: 'wrap',
          marginBottom: 28,
        }}
      >
        <div>
          <h1 style={{ marginBottom: 6 }}>
            THE VEDIC ASTRO — Admin
          </h1>

          <p style={{ margin: 0 }}>
            Manual UPI Payment Verification
          </p>
        </div>

        <button
          onClick={loadPayments}
          disabled={loading}
          style={{
            padding: '10px 18px',
            cursor: 'pointer',
          }}
        >
          {loading ? 'Loading...' : 'Refresh'}
        </button>
      </div>

      <div
        style={{
          padding: 16,
          border: '1px solid #e0b85c',
          borderRadius: 10,
          marginBottom: 24,
        }}
      >
        <strong>Payment safety:</strong>{' '}
        Verify the transaction in your actual bank/UPI app before
        approving it. Do not approve using the customer-entered UTR
        alone.
      </div>

      {message && (
        <div
          style={{
            padding: 14,
            border: '1px solid #ccc',
            borderRadius: 8,
            marginBottom: 20,
          }}
        >
          {message}
        </div>
      )}

      {loading ? (
        <p>Loading pending payments...</p>
      ) : bookings.length === 0 ? (
        <div
          style={{
            padding: 30,
            border: '1px solid #ddd',
            borderRadius: 12,
            textAlign: 'center',
          }}
        >
          No payments waiting for verification.
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gap: 18,
          }}
        >
          {bookings.map((booking) => {
            const service = serviceFor(booking);

            return (
              <section
                key={booking.id}
                style={{
                  border: '1px solid #ddd',
                  borderRadius: 12,
                  padding: 20,
                }}
              >
                <h2 style={{ marginTop: 0 }}>
                  {service?.name || 'Consultation'}
                </h2>

                <p>
                  <strong>Customer:</strong> {booking.name}
                </p>

                <p>
                  <strong>Amount:</strong>{' '}
                  ₹{Number(service?.price_inr || 0)}
                </p>

                <p>
                  <strong>Consultation:</strong>{' '}
                  {new Date(booking.start_at).toLocaleString(
                    'en-IN',
                    {
                      timeZone: 'Asia/Kolkata',
                    }
                  )}
                </p>

                <p>
                  <strong>Mode:</strong> {booking.mode}
                  {' · '}
                  <strong>Language:</strong> {booking.language}
                </p>

                <p>
                  <strong>Payment method:</strong> Manual UPI
                </p>

                <div
                  style={{
                    marginTop: 16,
                    padding: 16,
                    border: '1px solid #aaa',
                    borderRadius: 8,
                  }}
                >
                  <div
                    style={{
                      fontSize: 13,
                      marginBottom: 5,
                    }}
                  >
                    UTR / Transaction Reference
                  </div>

                  <strong
                    style={{
                      fontFamily: 'monospace',
                      fontSize: 18,
                      wordBreak: 'break-all',
                    }}
                  >
                    {booking.upi_utr || 'Not provided'}
                  </strong>
                </div>

                {booking.payment_submitted_at && (
                  <p style={{ fontSize: 13 }}>
                    Submitted:{' '}
                    {new Date(
                      booking.payment_submitted_at
                    ).toLocaleString('en-IN', {
                      timeZone: 'Asia/Kolkata',
                    })}
                  </p>
                )}

                <div
                  style={{
                    display: 'flex',
                    gap: 12,
                    flexWrap: 'wrap',
                    marginTop: 20,
                  }}
                >
                  <button
                    disabled={workingId === booking.id}
                    onClick={() =>
                      paymentAction(
                        booking.id,
                        'verify_payment'
                      )
                    }
                    style={{
                      padding: '11px 20px',
                      cursor: 'pointer',
                    }}
                  >
                    {workingId === booking.id
                      ? 'Processing...'
                      : 'Verify Payment'}
                  </button>

                  <button
                    disabled={workingId === booking.id}
                    onClick={() =>
                      paymentAction(
                        booking.id,
                        'reject_payment'
                      )
                    }
                    style={{
                      padding: '11px 20px',
                      cursor: 'pointer',
                    }}
                  >
                    Reject
                  </button>
                </div>
              </section>
            );
          })}
        </div>
      )}
    </main>
  );
}


