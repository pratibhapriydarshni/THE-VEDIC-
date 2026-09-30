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
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError('');

    const sb = supabaseBrowser();
    const email = identifier.trim();

    const { error } = await sb.auth.signInWithPassword({
      email,
      password,
    });

    setBusy(false);

    if (error) {
      setError(error.message);
      return;
    }

    router.replace(params.get('next') || '/dashboard');
    router.refresh();
  }

  return (
    <form className="form card" onSubmit={submit}>
      <h1>{t('Login', 'लॉगिन')}</h1>

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
          type="password"
          autoComplete="current-password"
          required
        />
      </label>

      {error && <p role="alert">{error}</p>}

      <button className="cta" disabled={busy}>
        {busy
          ? t('Signing in...', 'लॉगिन किया जा रहा है...')
          : t('Login', 'लॉगिन')}
      </button>

      <p className="muted">
        {t('New here?', 'यहाँ नए हैं?')}{' '}
        <a href="/register">
          {t('Create an account', 'नया अकाउंट बनाएँ')}
        </a>
      </p>
    </form>
  );
}

function LoadingCard() {
  const { t } = useLanguage();

  return (
    <div className="card">
      {t('Loading...', 'लोड हो रहा है...')}
    </div>
  );
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