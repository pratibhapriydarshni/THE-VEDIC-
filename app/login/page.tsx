
'use client';

import { FormEvent, Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import SiteNav from '@/components/site-nav';
import SiteFooter from '@/components/site-footer';
import { supabaseBrowser } from '@/lib/supabase-browser';
import { useLanguage } from '@/components/language-provider';

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const { t } = useLanguage();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError('');

    try {
      const sb = supabaseBrowser();
      const { error } = await sb.auth.signInWithPassword({
        email: identifier.trim(),
        password,
      });

      if (error) throw error;

      router.replace(params.get('next') || '/dashboard');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
      setBusy(false);
    }
  }

  async function googleLogin() {
    setBusy(true);
    setError('');

    try {
      const sb = supabaseBrowser();
      const { error } = await sb.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}${params.get('next') || '/dashboard'}`,
        },
      });

      if (error) throw error;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Google login failed');
      setBusy(false);
    }
  }

  return (
    <form className="form card" onSubmit={submit}>
      <h1>{t('Welcome Back', 'वापसी पर स्वागत है')}</h1>
      <p className="muted">
        {t('Login to continue to The Vedic Astro', 'The Vedic Astro में आगे बढ़ने के लिए लॉगिन करें')}
      </p>

      <button
        type="button"
        className="cta"
        disabled={busy}
        onClick={googleLogin}
      >
        Continue with Google
      </button>

      <p className="muted" style={{ textAlign: 'center' }}>
        {t('Or login with email', 'या ईमेल से लॉगिन करें')}
      </p>

      <label>
        {t('Email', 'ईमेल')}
        <input
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
          type="email"
          autoComplete="email"
          required
        />
      </label>

      <label>
        {t('Password', 'पासवर्ड')}
        <input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          type={showPassword ? 'text' : 'password'}
          autoComplete="current-password"
          required
        />
      </label>

      <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <input
          type="checkbox"
          checked={showPassword}
          onChange={(e) => setShowPassword(e.target.checked)}
        />
        {t('Show password', 'पासवर्ड दिखाएँ')}
      </label>

      {error && <p role="alert">{error}</p>}

      <button className="cta" disabled={busy}>
        {busy ? t('Please wait...', 'कृपया प्रतीक्षा करें...') : t('Login', 'लॉगिन')}
      </button>

      <p className="muted">
        {t('New here?', 'यहाँ नए हैं?')}{' '}
        <a href="/register">{t('Create an account', 'नया अकाउंट बनाएँ')}</a>
      </p>
    </form>
  );
}

function LoadingCard() {
  const { t } = useLanguage();
  return <div className="card">{t('Loading...', 'लोड हो रहा है...')}</div>;
}

export default function Login() {
  return (
    <>
      <SiteNav />
      <main className="wrap">
        <Suspense fallback={<LoadingCard />}>
          <LoginForm />
        </Suspense>
      </main>
      <SiteFooter />
    </>
  );
}
