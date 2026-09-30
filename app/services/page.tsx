'use client';

import SiteNav from '@/components/site-nav';
import SiteFooter from '@/components/site-footer';
import { useLanguage } from '@/components/language-provider';

export default function Services() {
  const { t } = useLanguage();

  const services = [
    [t('Kundli Consultation', 'कुंडली परामर्श'), 499, 10, 30],
    [t('Palmistry', 'हस्तरेखा'), 499, 10, 30],
    [t('Vastu Consultation', 'वास्तु परामर्श'), 799, 15, 45],
    [t('Career Guidance', 'करियर मार्गदर्शन'), 499, 10, 30],
    [t('Relationship Guidance', 'रिश्तों का मार्गदर्शन'), 499, 10, 30],
    [t('Family Guidance', 'पारिवारिक मार्गदर्शन'), 499, 10, 30],
    [t('Occult Consultation', 'गूढ़ विद्या परामर्श'), 599, 10, 30],
    [t('Motivational Guidance', 'प्रेरणात्मक मार्गदर्शन'), 399, 10, 30],
  ] as const;

  return (
    <>
      <SiteNav />

      <main className="wrap">
        <h1>{t('Services', 'सेवाएँ')}</h1>

        <p className="muted">
          {t('Hindi / English', 'हिन्दी / अंग्रेज़ी')}
          {' · '}
          {t('Chat / Audio / Video', 'चैट / ऑडियो / वीडियो')}
          {' · '}
          {t('Full payment upfront', 'पूर्ण भुगतान अग्रिम')}
        </p>

        <div className="grid">
          {services.map((service) => (
            <article className="card" key={service[0]}>
              <h2>{service[0]}</h2>

              <p>
                <b>{t('India:', 'भारत:')}</b>{' '}
                ₹{service[1]} / {service[3]} {t('min', 'मिनट')}
              </p>

              <p>
                <b>{t('Overseas:', 'विदेश:')}</b>{' '}
                ${service[2]} / {service[3]} {t('min', 'मिनट')}
              </p>

              <a className="cta" href="/book">
                {t('Book Consultation', 'परामर्श बुक करें')}
              </a>
            </article>
          ))}
        </div>
      </main>

      <SiteFooter />
    </>
  );
}