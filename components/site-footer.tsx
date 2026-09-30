'use client';

import { useLanguage } from './language-provider';

export default function SiteFooter() {
  const { t } = useLanguage();

  return (
    <footer className="footer">
      © {new Date().getFullYear()} THE VEDIC ASTRO · Pt. Deepak Acharya ·{' '}

      <a href="/privacy">
        {t("Privacy", "गोपनीयता")}
      </a>

      {' · '}

      <a href="/terms">
        {t("Terms", "नियम एवं शर्तें")}
      </a>

      {' · '}

      <a href="/refund-policy">
        {t("Refund Policy", "रिफंड नीति")}
      </a>

      {' · '}

      <a href="/disclaimer">
        {t("Disclaimer", "अस्वीकरण")}
      </a>
    </footer>
  );
}