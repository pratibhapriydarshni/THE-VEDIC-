'use client';

import { useEffect, useState } from 'react';
import SiteNav from '@/components/site-nav';
import SiteFooter from '@/components/site-footer';
import { supabaseBrowser } from '@/lib/supabase-browser';

export default function Dashboard() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const [uploadMessage, setUploadMessage] = useState<Record<string, string>>({});

  useEffect(() => {
    (async () => {
      const sb = supabaseBrowser();

      const {
        data: { session },
      } = await sb.auth.getSession();

      if (!session) {
        setError('Please sign in to view your dashboard.');
        setLoading(false);
        return;
      }

      const headers = {
        Authorization: `Bearer ${session.access_token}`,
      };

      const [b, r] = await Promise.all([
        fetch('/api/customer/bookings', {
          headers,
          cache: 'no-store',
        }),
        fetch('/api/customer/reports', {
          headers,
          cache: 'no-store',
        }),
      ]);

      const bj = await b.json();
      const rj = await r.json();

      setBookings(bj.bookings || []);
      setReports(rj.reports || []);
      setLoading(false);
    })();
  }, []);

  async function uploadFile(bookingId: string, file: File) {
    setUploadingId(bookingId);
    setUploadMessage((prev) => ({ ...prev, [bookingId]: '' }));

    try {
      const sb = supabaseBrowser();

      const {
        data: { session },
      } = await sb.auth.getSession();

      if (!session) {
        throw new Error('Please sign in again.');
      }

      const form = new FormData();
      form.append('bookingId', bookingId);
      form.append('file', file);

      const response = await fetch('/api/consultation/files', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
        body: form,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'File upload failed.');
      }

      setUploadMessage((prev) => ({
        ...prev,
        [bookingId]: 'File uploaded successfully.',
      }));
    } catch (e: any) {
      setUploadMessage((prev) => ({
        ...prev,
        [bookingId]: e.message || 'File upload failed.',
      }));
    } finally {
      setUploadingId(null);
    }
  }

  return (
    <>
      <SiteNav />

      <main className="wrap">
        <h1>Customer Dashboard</h1>

        {error && (
          <div className="card">
            <p>{error}</p>
            <a className="cta" href="/login?next=/dashboard">
              Login
            </a>
          </div>
        )}

        <div className="grid">
          <div className="card">
            <h2>My Consultations</h2>

            {loading ? (
              <p>Loading...</p>
            ) : bookings.length ? (
              <div>
                {bookings.map((b) => {
                  const canUpload =
                    b.status === 'confirmed' &&
                    b.payment_status === 'paid';

                  return (
                    <div
                      key={b.id}
                      style={{
                        padding: '18px 0',
                        borderBottom: '1px solid #ddd',
                      }}
                    >
                      <strong>
                        {b.services?.name || 'Consultation'}
                      </strong>

                      <p>{new Date(b.start_at).toLocaleString()}</p>

                      <p>Mode: {b.mode}</p>

                      <p>
                        Booking Status:{' '}
                        <strong>
                          {b.status === 'cancelled'
                            ? 'Cancelled'
                            : b.status === 'confirmed'
                            ? 'Confirmed'
                            : b.status === 'blocked'
                            ? 'Blocked'
                            : 'Pending'}
                        </strong>
                      </p>

                      <p>
                        Payment Status:{' '}
                        <strong>
                          {b.payment_status === 'paid'
                            ? 'Paid'
                            : b.payment_status || 'Pending'}
                        </strong>
                      </p>
{canUpload && (
  <div style={{ marginTop: '14px', marginBottom: '14px' }}>
    <a
      className="cta"
      href={`/consultation/${b.id}`}
      style={{ display: 'inline-block' }}
    >
      Join Consultation
    </a>

    <p className="muted" style={{ marginTop: '8px' }}>
      Open your private {b.mode || 'consultation'} consultation room.
    </p>
  </div>
)}
                      {canUpload && (
                        <div style={{ marginTop: '14px' }}>
                          <strong>Upload Consultation Files</strong>

                          <p className="muted">
                            Upload palm images, Kundli, reports or other
                            relevant documents. JPG, PNG, WEBP or PDF only.
                            Maximum 10 MB per file.
                          </p>

                          <label
                            className="cta"
                            style={{
                              display: 'inline-block',
                              cursor: 'pointer',
                            }}
                          >
                            {uploadingId === b.id
                              ? 'Uploading...'
                              : 'Upload Files'}

                            <input
                              type="file"
                              accept="image/jpeg,image/png,image/webp,application/pdf"
                              disabled={uploadingId === b.id}
                              style={{ display: 'none' }}
                              onChange={(e) => {
                                const file = e.target.files?.[0];

                                if (file) {
                                  uploadFile(b.id, file);
                                }

                                e.currentTarget.value = '';
                              }}
                            />
                          </label>

                          {uploadMessage[b.id] && (
                            <p style={{ marginTop: '10px' }}>
                              {uploadMessage[b.id]}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <p>No bookings yet.</p>
            )}

            <a className="cta" href="/book">
              Book New Consultation
            </a>
          </div>

          <div className="card">
            <h2>Reports & Files</h2>
            <p>{reports.length} report(s) available.</p>
          </div>

          <div className="card">
            <h2>Notifications</h2>
            <p>
              Booking, payment and consultation updates appear here.
            </p>
          </div>
        </div>
      </main>

      <SiteFooter />
    </>
  );
}