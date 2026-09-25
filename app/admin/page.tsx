'use client';

import { useEffect, useState } from 'react';
import { supabaseBrowser } from '@/lib/supabase-browser';

type Tab =
  | 'dashboard'
  | 'bookings'
  | 'payments'
  | 'services'
  | 'availability'
  | 'content'
  | 'certificates';

type Service = {
  id: string;
  name: string;
  description?: string | null;
  price_inr: number;
  price_usd: number;
  duration_minutes: number;
  enabled: boolean;
  sort_order: number;
};

type Booking = {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  start_at: string;
  duration_minutes: number;
  mode: string;
  language: string;
  status: string;
  payment_status: string;
  payment_method?: string | null;
  upi_utr?: string | null;
  payment_submitted_at?: string | null;
  consultation_status?: string;
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

type Block = {
  id: string;
  starts_at: string;
  ends_at: string;
  reason?: string | null;
};

type ContentItem = {
  content_key: string;
  value_hi: string;
  value_en: string;
  published: boolean;
};

type Certificate = {
  id: string;
  title: string;
  storage_path: string;
  mime_type: string;
  created_at?: string;
};

type Summary = {
  customers: number;
  pending_payments: number;
  confirmed_bookings: number;
  bookings: Booking[];
};

const cardStyle = {
  border: '1px solid #ead9b8',
  borderRadius: 14,
  padding: 20,
  background: '#fff',
} as const;

const inputStyle = {
  width: '100%',
  padding: '10px 12px',
  border: '1px solid #d8c9ad',
  borderRadius: 8,
  boxSizing: 'border-box',
} as const;

const buttonStyle = {
  padding: '10px 16px',
  border: '1px solid #b9852d',
  borderRadius: 8,
  cursor: 'pointer',
  background: '#fff8e9',
} as const;

export default function AdminManagement() {
  const [tab, setTab] = useState<Tab>('dashboard');
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [summary, setSummary] = useState<Summary | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [content, setContent] = useState<ContentItem[]>([]);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [workingId, setWorkingId] = useState<string | null>(null);

  async function token() {
    const {
      data: { session },
    } = await supabaseBrowser().auth.getSession();

    return session?.access_token || null;
  }

  async function api(path: string, options: RequestInit = {}) {
    const accessToken = await token();

    if (!accessToken) {
      throw new Error('Please login with your admin account.');
    }

    const headers = new Headers(options.headers);
    headers.set('Authorization', `Bearer ${accessToken}`);

    if (options.body && !headers.has('Content-Type')) {
      headers.set('Content-Type', 'application/json');
    }

    const res = await fetch(path, {
      ...options,
      headers,
      cache: 'no-store',
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      throw new Error(data.error || 'Request failed.');
    }

    return data;
  }

  function serviceFor(booking: Booking) {
    if (Array.isArray(booking.services)) {
      return booking.services[0] || null;
    }

    return booking.services;
  }

  function dateTime(value: string) {
    return new Date(value).toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
    });
  }

  async function loadAll() {
    setLoading(true);
    setMessage('');

    try {
      const [s, b, sv, av, ct, cert] = await Promise.all([
        api('/api/admin/summary'),
        api('/api/admin/bookings'),
        api('/api/admin/services'),
        api('/api/admin/availability'),
        api('/api/admin/content'),
        api('/api/admin/certificates'),
      ]);

      setSummary(s);
      setBookings(b.bookings || []);
      setServices(sv.services || []);
      setBlocks(av.blocks || []);
      setContent(ct.content || []);
      setCertificates(cert.certificates || []);
    } catch (e) {
      setMessage(e instanceof Error ? e.message : 'Unable to load admin data.');
    } finally {
      setLoading(false);
    }
  }

  async function paymentAction(
    bookingId: string,
    action: 'verify_payment' | 'reject_payment'
  ) {
    const text =
      action === 'verify_payment'
        ? 'Confirm this payment only after checking the actual credit and UTR in your bank/UPI app.'
        : 'Reject this payment submission?';

    if (!window.confirm(text)) return;

    setWorkingId(bookingId);

    try {
      await api('/api/admin/bookings', {
        method: 'PATCH',
        body: JSON.stringify({
          booking_id: bookingId,
          action,
        }),
      });

      setMessage(
        action === 'verify_payment'
          ? 'Payment verified and booking confirmed.'
          : 'Payment submission rejected.'
      );

      await loadAll();
    } catch (e) {
      setMessage(e instanceof Error ? e.message : 'Payment action failed.');
    } finally {
      setWorkingId(null);
    }
  }

  async function bookingStatus(id: string, status: string) {
    try {
      await api('/api/admin/bookings', {
        method: 'PATCH',
        body: JSON.stringify({
          booking_id: id,
          status,
        }),
      });

      setMessage(`Booking status changed to ${status}.`);
      await loadAll();
    } catch (e) {
      setMessage(e instanceof Error ? e.message : 'Update failed.');
    }
  }

  async function saveService(service: Service) {
    try {
      await api('/api/admin/services', {
        method: 'PUT',
        body: JSON.stringify(service),
      });

      setMessage('Service updated.');
      await loadAll();
    } catch (e) {
      setMessage(e instanceof Error ? e.message : 'Service update failed.');
    }
  }

  async function addService() {
    const name = window.prompt('Service name');
    if (!name) return;

    const price = Number(window.prompt('Price in INR', '499'));
    const usd = Number(window.prompt('Price in USD', '10'));
    const duration = Number(window.prompt('Duration in minutes', '30'));

    try {
      await api('/api/admin/services', {
        method: 'POST',
        body: JSON.stringify({
          name,
          price_inr: price,
          price_usd: usd,
          duration_minutes: duration,
          enabled: true,
          sort_order: services.length + 1,
        }),
      });

      setMessage('Service added.');
      await loadAll();
    } catch (e) {
      setMessage(e instanceof Error ? e.message : 'Unable to add service.');
    }
  }

  async function addBlock() {
    const start = window.prompt(
      'Unavailable from (example: 2026-09-30T18:00)'
    );
    if (!start) return;

    const end = window.prompt(
      'Unavailable until (example: 2026-09-30T20:00)'
    );
    if (!end) return;

    const reason = window.prompt('Reason (optional)') || '';

    try {
      await api('/api/admin/availability', {
        method: 'POST',
        body: JSON.stringify({
          starts_at: start,
          ends_at: end,
          reason,
        }),
      });

      setMessage('Unavailable time added.');
      await loadAll();
    } catch (e) {
      setMessage(e instanceof Error ? e.message : 'Unable to add block.');
    }
  }

  async function deleteBlock(id: string) {
    if (!window.confirm('Remove this unavailable period?')) return;

    try {
      await api(`/api/admin/availability?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });

      setMessage('Availability block removed.');
      await loadAll();
    } catch (e) {
      setMessage(e instanceof Error ? e.message : 'Unable to remove block.');
    }
  }

  async function saveContent(item: ContentItem) {
    try {
      await api('/api/admin/content', {
        method: 'POST',
        body: JSON.stringify(item),
      });

      setMessage('Website content saved.');
      await loadAll();
    } catch (e) {
      setMessage(e instanceof Error ? e.message : 'Unable to save content.');
    }
  }

  async function deleteCertificate(id: string) {
    if (!window.confirm('Delete this certificate record?')) return;

    try {
      await api(`/api/admin/certificates?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });

      setMessage('Certificate deleted.');
      await loadAll();
    } catch (e) {
      setMessage(
        e instanceof Error ? e.message : 'Unable to delete certificate.'
      );
    }
  }

  async function logout() {
    await supabaseBrowser().auth.signOut();
    window.location.href = '/login';
  }

  useEffect(() => {
    loadAll();
  }, []);

  const pendingPayments = bookings.filter(
    (b) => b.payment_status === 'verification_pending'
  );

  const nav: { id: Tab; label: string }[] = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'bookings', label: 'Bookings' },
    { id: 'payments', label: `Payments (${pendingPayments.length})` },
    { id: 'services', label: 'Services & Pricing' },
    { id: 'availability', label: 'Availability' },
    { id: 'content', label: 'Website Content' },
    { id: 'certificates', label: 'Certificates' },
  ];

  return (
    <main
      style={{
        minHeight: '100vh',
        background: '#fffaf1',
        fontFamily: 'system-ui, sans-serif',
        color: '#33230d',
      }}
    >
      <header
        style={{
          background: '#5f260d',
          color: 'white',
          padding: '18px 24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 16,
          flexWrap: 'wrap',
        }}
      >
        <div>
          <div style={{ fontSize: 12, opacity: 0.8 }}>ADMIN CONSOLE</div>
          <h1 style={{ margin: '4px 0 0', fontSize: 24 }}>
            THE VEDIC ASTRO
          </h1>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={loadAll} style={buttonStyle}>
            Refresh
          </button>

          <button onClick={logout} style={buttonStyle}>
            Logout
          </button>
        </div>
      </header>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(190px, 230px) 1fr',
          maxWidth: 1450,
          margin: '0 auto',
        }}
      >
        <aside
          style={{
            padding: 20,
            borderRight: '1px solid #ead9b8',
            minHeight: 'calc(100vh - 78px)',
          }}
        >
          <div style={{ display: 'grid', gap: 8 }}>
            {nav.map((item) => (
              <button
                key={item.id}
                onClick={() => setTab(item.id)}
                style={{
                  ...buttonStyle,
                  textAlign: 'left',
                  background:
                    tab === item.id ? '#f2d79b' : '#fff8e9',
                  fontWeight: tab === item.id ? 700 : 500,
                }}
              >
                {item.label}
              </button>
            ))}
          </div>
        </aside>

        <section style={{ padding: 28, minWidth: 0 }}>
          {message && (
            <div
              style={{
                ...cardStyle,
                marginBottom: 20,
                background: '#fff4d9',
              }}
            >
              {message}
            </div>
          )}

          {loading ? (
            <p>Loading admin dashboard...</p>
          ) : (
            <>
              {tab === 'dashboard' && (
                <>
                  <h2>Dashboard</h2>

                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns:
                        'repeat(auto-fit, minmax(180px, 1fr))',
                      gap: 16,
                      marginBottom: 28,
                    }}
                  >
                    <div style={cardStyle}>
                      <div>Customers</div>
                      <strong style={{ fontSize: 30 }}>
                        {summary?.customers || 0}
                      </strong>
                    </div>

                    <div style={cardStyle}>
                      <div>All Bookings</div>
                      <strong style={{ fontSize: 30 }}>
                        {bookings.length}
                      </strong>
                    </div>

                    <div style={cardStyle}>
                      <div>Confirmed Bookings</div>
                      <strong style={{ fontSize: 30 }}>
                        {summary?.confirmed_bookings || 0}
                      </strong>
                    </div>

                    <div style={cardStyle}>
                      <div>Payments to Verify</div>
                      <strong style={{ fontSize: 30 }}>
                        {summary?.pending_payments || 0}
                      </strong>
                    </div>
                  </div>

                  <h3>Recent Bookings</h3>

                  <div style={{ display: 'grid', gap: 12 }}>
                    {bookings.slice(0, 8).map((b) => (
                      <div key={b.id} style={cardStyle}>
                        <strong>{b.name}</strong>
                        {' — '}
                        {serviceFor(b)?.name || 'Consultation'}
                        <div style={{ marginTop: 7, fontSize: 14 }}>
                          {dateTime(b.start_at)} · {b.status} ·{' '}
                          {b.payment_status}
                        </div>
                      </div>
                    ))}

                    {bookings.length === 0 && <p>No bookings yet.</p>}
                  </div>
                </>
              )}

              {tab === 'bookings' && (
                <>
                  <h2>Bookings</h2>

                  <div style={{ display: 'grid', gap: 16 }}>
                    {bookings.map((b) => (
                      <div key={b.id} style={cardStyle}>
                        <h3 style={{ marginTop: 0 }}>
                          {serviceFor(b)?.name || 'Consultation'}
                        </h3>

                        <p>
                          <strong>Customer:</strong> {b.name}
                        </p>

                        {b.phone && (
                          <p>
                            <strong>Phone:</strong> {b.phone}
                          </p>
                        )}

                        {b.email && (
                          <p>
                            <strong>Email:</strong> {b.email}
                          </p>
                        )}

                        <p>
                          <strong>Date:</strong> {dateTime(b.start_at)}
                        </p>

                        <p>
                          {b.mode} · {b.language} · {b.duration_minutes} min
                        </p>

                        <p>
                          <strong>Booking:</strong> {b.status}
                          {' · '}
                          <strong>Payment:</strong> {b.payment_status}
                        </p>

                        <div
                          style={{
                            display: 'flex',
                            gap: 8,
                            flexWrap: 'wrap',
                          }}
                        >
                          {b.status !== 'confirmed' &&
                            b.payment_status === 'paid' && (
                              <button
                                style={buttonStyle}
                                onClick={() =>
                                  bookingStatus(b.id, 'confirmed')
                                }
                              >
                                Confirm
                              </button>
                            )}

                          {b.status !== 'cancelled' && (
                            <button
                              style={buttonStyle}
                              onClick={() =>
                                bookingStatus(b.id, 'cancelled')
                              }
                            >
                              Cancel
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {tab === 'payments' && (
                <>
                  <h2>UPI Payment Verification</h2>

                  <div
                    style={{
                      ...cardStyle,
                      marginBottom: 20,
                      background: '#fff4d9',
                    }}
                  >
                    Verify the actual payment amount and UTR in your
                    bank/UPI app before approving. Never approve from
                    the customer-entered UTR alone.
                  </div>

                  <div style={{ display: 'grid', gap: 16 }}>
                    {pendingPayments.map((b) => {
                      const service = serviceFor(b);

                      return (
                        <div key={b.id} style={cardStyle}>
                          <h3 style={{ marginTop: 0 }}>
                            {service?.name || 'Consultation'}
                          </h3>

                          <p>
                            <strong>Customer:</strong> {b.name}
                          </p>

                          <p>
                            <strong>Amount:</strong> ₹
                            {Number(service?.price_inr || 0)}
                          </p>

                          <p>
                            <strong>Consultation:</strong>{' '}
                            {dateTime(b.start_at)}
                          </p>

                          <div
                            style={{
                              padding: 14,
                              border: '1px solid #d8c9ad',
                              borderRadius: 8,
                            }}
                          >
                            <div style={{ fontSize: 12 }}>UTR</div>
                            <strong
                              style={{
                                fontFamily: 'monospace',
                                fontSize: 18,
                                wordBreak: 'break-all',
                              }}
                            >
                              {b.upi_utr || 'Not provided'}
                            </strong>
                          </div>

                          {b.payment_submitted_at && (
                            <p style={{ fontSize: 13 }}>
                              Submitted: {dateTime(b.payment_submitted_at)}
                            </p>
                          )}

                          <div
                            style={{
                              display: 'flex',
                              gap: 10,
                              flexWrap: 'wrap',
                            }}
                          >
                            <button
                              style={buttonStyle}
                              disabled={workingId === b.id}
                              onClick={() =>
                                paymentAction(b.id, 'verify_payment')
                              }
                            >
                              Verify Payment
                            </button>

                            <button
                              style={buttonStyle}
                              disabled={workingId === b.id}
                              onClick={() =>
                                paymentAction(b.id, 'reject_payment')
                              }
                            >
                              Reject
                            </button>
                          </div>
                        </div>
                      );
                    })}

                    {pendingPayments.length === 0 && (
                      <div style={cardStyle}>
                        No payments waiting for verification.
                      </div>
                    )}
                  </div>
                </>
              )}

              {tab === 'services' && (
                <>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      gap: 12,
                      alignItems: 'center',
                    }}
                  >
                    <h2>Services & Pricing</h2>

                    <button style={buttonStyle} onClick={addService}>
                      + Add Service
                    </button>
                  </div>

                  <div style={{ display: 'grid', gap: 16 }}>
                    {services.map((s, index) => (
                      <div key={s.id} style={cardStyle}>
                        <label>Service Name</label>
                        <input
                          style={inputStyle}
                          value={s.name}
                          onChange={(e) => {
                            const next = [...services];
                            next[index] = {
                              ...next[index],
                              name: e.target.value,
                            };
                            setServices(next);
                          }}
                        />

                        <div
                          style={{
                            display: 'grid',
                            gridTemplateColumns:
                              'repeat(auto-fit,minmax(140px,1fr))',
                            gap: 12,
                            marginTop: 12,
                          }}
                        >
                          <div>
                            <label>INR</label>
                            <input
                              style={inputStyle}
                              type="number"
                              value={s.price_inr}
                              onChange={(e) => {
                                const next = [...services];
                                next[index] = {
                                  ...next[index],
                                  price_inr: Number(e.target.value),
                                };
                                setServices(next);
                              }}
                            />
                          </div>

                          <div>
                            <label>USD</label>
                            <input
                              style={inputStyle}
                              type="number"
                              value={s.price_usd}
                              onChange={(e) => {
                                const next = [...services];
                                next[index] = {
                                  ...next[index],
                                  price_usd: Number(e.target.value),
                                };
                                setServices(next);
                              }}
                            />
                          </div>

                          <div>
                            <label>Minutes</label>
                            <input
                              style={inputStyle}
                              type="number"
                              value={s.duration_minutes}
                              onChange={(e) => {
                                const next = [...services];
                                next[index] = {
                                  ...next[index],
                                  duration_minutes: Number(e.target.value),
                                };
                                setServices(next);
                              }}
                            />
                          </div>
                        </div>

                        <label
                          style={{
                            display: 'block',
                            margin: '14px 0',
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={s.enabled}
                            onChange={(e) => {
                              const next = [...services];
                              next[index] = {
                                ...next[index],
                                enabled: e.target.checked,
                              };
                              setServices(next);
                            }}
                          />{' '}
                          Enabled
                        </label>

                        <button
                          style={buttonStyle}
                          onClick={() => saveService(s)}
                        >
                          Save Service
                        </button>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {tab === 'availability' && (
                <>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      gap: 12,
                      alignItems: 'center',
                    }}
                  >
                    <h2>Unavailable / Blocked Times</h2>

                    <button style={buttonStyle} onClick={addBlock}>
                      + Block Time
                    </button>
                  </div>

                  <div style={{ display: 'grid', gap: 14 }}>
                    {blocks.map((b) => (
                      <div key={b.id} style={cardStyle}>
                        <strong>{dateTime(b.starts_at)}</strong>
                        <div>to {dateTime(b.ends_at)}</div>
                        <p>{b.reason || 'No reason provided'}</p>

                        <button
                          style={buttonStyle}
                          onClick={() => deleteBlock(b.id)}
                        >
                          Remove
                        </button>
                      </div>
                    ))}

                    {blocks.length === 0 && (
                      <div style={cardStyle}>
                        No unavailable periods added.
                      </div>
                    )}
                  </div>
                </>
              )}

              {tab === 'content' && (
                <>
                  <h2>Website Content</h2>

                  <div style={{ display: 'grid', gap: 18 }}>
                    {content.map((item, index) => (
                      <div key={item.content_key} style={cardStyle}>
                        <strong>{item.content_key}</strong>

                        <p>English</p>
                        <textarea
                          style={{ ...inputStyle, minHeight: 90 }}
                          value={item.value_en || ''}
                          onChange={(e) => {
                            const next = [...content];
                            next[index] = {
                              ...next[index],
                              value_en: e.target.value,
                            };
                            setContent(next);
                          }}
                        />

                        <p>Hindi</p>
                        <textarea
                          style={{ ...inputStyle, minHeight: 90 }}
                          value={item.value_hi || ''}
                          onChange={(e) => {
                            const next = [...content];
                            next[index] = {
                              ...next[index],
                              value_hi: e.target.value,
                            };
                            setContent(next);
                          }}
                        />

                        <label
                          style={{
                            display: 'block',
                            margin: '14px 0',
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={item.published}
                            onChange={(e) => {
                              const next = [...content];
                              next[index] = {
                                ...next[index],
                                published: e.target.checked,
                              };
                              setContent(next);
                            }}
                          />{' '}
                          Published
                        </label>

                        <button
                          style={buttonStyle}
                          onClick={() => saveContent(item)}
                        >
                          Save Content
                        </button>
                      </div>
                    ))}

                    {content.length === 0 && (
                      <div style={cardStyle}>
                        No editable site content found.
                      </div>
                    )}
                  </div>
                </>
              )}

              {tab === 'certificates' && (
                <>
                  <h2>Certificates</h2>

                  <p>
                    Existing certificate records can be managed here.
                    File upload will be connected separately.
                  </p>

                  <div style={{ display: 'grid', gap: 14 }}>
                    {certificates.map((c) => (
                      <div key={c.id} style={cardStyle}>
                        <strong>{c.title}</strong>
                        <p>{c.storage_path}</p>
                        <small>{c.mime_type}</small>

                        <div style={{ marginTop: 14 }}>
                          <button
                            style={buttonStyle}
                            onClick={() => deleteCertificate(c.id)}
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}

                    {certificates.length === 0 && (
                      <div style={cardStyle}>
                        No certificates found.
                      </div>
                    )}
                  </div>
                </>
              )}
            </>
          )}
        </section>
      </div>
    </main>
  );
}