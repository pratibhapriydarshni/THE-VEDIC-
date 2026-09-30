import type { Metadata } from 'next';
import './globals.css';

import LanguageTranslator from '@/components/language-translator';
import { LanguageProvider } from '@/components/language-provider';

export const metadata: Metadata = {
  title: 'THE VEDIC ASTRO | Vedic Astrology Consultation',
  description:
    'Guidance Rooted in Vedic Wisdom, Clarity for Your Path.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <LanguageProvider>
          {children}
          <LanguageTranslator />
        </LanguageProvider>
      </body>
    </html>
  );
}