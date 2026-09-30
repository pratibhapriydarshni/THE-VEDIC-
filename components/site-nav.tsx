'use client';

import { useLanguage } from './language-provider';

export default function SiteNav() {
  const { t } = useLanguage();

  return (
    <nav className="nav">
      <a className="brand" href="/">
        THE VEDIC ASTRO
      </a>

      <div className="links">
        <a href="/about">
          {t("About", "हमारे बारे में")}
        </a>

        <a href="/services">
          {t("Services", "सेवाएँ")}
        </a>

        <a href="/astrology">
          {t("Astrology", "ज्योतिष")}
        </a>

        <a href="/faq">
          {t("FAQ", "सामान्य प्रश्न")}
        </a>

        <a href="/contact">
          {t("Contact", "संपर्क")}
        </a>

        <a href="/login">
          {t("Login", "लॉगिन")}
        </a>

        <a className="cta" href="/book">
          {t("Book Consultation", "परामर्श बुक करें")}
        </a>
      </div>
    </nav>
  );
}