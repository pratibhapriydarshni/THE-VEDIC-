
'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import SiteNav from '@/components/site-nav';
import SiteFooter from '@/components/site-footer';
import { supabaseBrowser } from '@/lib/supabase-browser';

export default function Register() {
  const router = useRouter();

  const [f, setF] = useState({
    name: '',
    phone: '',
    email: '',
    password: '',
    country: '',
    language: 'English',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const set = (k: string, v: string) =>
    setF((x) => ({ ...x, [k]: v }));

  async function googleRegister() {
    setBusy(true);
    setError('');

    try {
      const sb = supabaseBrowser();
      const { error } = await sb.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
        },
      });

      if (error) throw error;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Google registration failed');
      setBusy(false);
    }
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError('');

    try {
      const sb = supabaseBrowser();

      const { data, error } = await sb.auth.signUp({
        email: f.email.trim(),
        password: f.password,
        options: {
          data: {
            full_name: f.name,
            phone: f.phone,
            country: f.country,
            preferred_language: f.language,
          },
        },
      });

      if (error) throw error;

      if (data.session) {
        router.replace('/dashboard');
        router.refresh();
      } else {
        setError(
          'Account created, but no active session was returned. Please check the Supabase email confirmation setting.'
        );
        setBusy(false);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
      setBusy(false);
    }
  }

  return (
    <>
      <SiteNav />

      <main className="wrap">
        <form className="form card" onSubmit={submit}>
          <h1>Create Your Account</h1>
          <p className="muted">Join The Vedic Astro</p>

          <button
            type="button"
            className="cta"
            disabled={busy}
            onClick={googleRegister}
          >
            Continue with Google
          </button>

          <p className="muted" style={{ textAlign: 'center' }}>
            Or register with email
          </p>

          <label>
            Full name
            <input
              value={f.name}
              onChange={(e) => set('name', e.target.value)}
              required
              maxLength={100}
            />
          </label>

          <label>
            Phone
            <input
              value={f.phone}
              onChange={(e) => set('phone', e.target.value)}
              type="tel"
              required
              maxLength={25}
            />
          </label>

          <label>
            Email
            <input
              value={f.email}
              onChange={(e) => set('email', e.target.value)}
              type="email"
              autoComplete="email"
              required
            />
          </label>

          <label>
            Password
            <input
              value={f.password}
              onChange={(e) => set('password', e.target.value)}
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              minLength={8}
              required
            />
          </label>

          <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <input
              type="checkbox"
              checked={showPassword}
              onChange={(e) => setShowPassword(e.target.checked)}
            />
            Show password
          </label>

          <label>
            Country
            <input
              value={f.country}
              onChange={(e) => set('country', e.target.value)}
              required
            />
          </label>

          <label>
            Preferred language
            <select
              value={f.language}
              onChange={(e) => set('language', e.target.value)}
            >
              <option>English</option>
              <option>Hindi</option>
            </select>
          </label>

          {error && <p role="alert">{error}</p>}

          <button className="cta" disabled={busy}>
            {busy ? 'Creating account...' : 'Create Account'}
          </button>

          <p className="muted">
            Already have an account? <a href="/login">Login</a>
          </p>
        </form>
      </main>

      <SiteFooter />
    </>
  );
}
