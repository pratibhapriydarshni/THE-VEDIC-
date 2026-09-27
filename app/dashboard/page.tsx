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
                {bookings.map((b) => (
                  <div
                    key={b.id}
                    style={{
                      padding: '14px 0',
                      borderBottom: '1px solid #ddd',
                    }}
                  >
                    <strong>
                      {b.services?.name || 'Consultation'}
                    </strong>

                    <p>
                      {new Date(b.start_at).toLocaleString()}
                    </p>

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
                  </div>
                ))}
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