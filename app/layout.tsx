import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata={title:'THE VEDIC ASTRO | Vedic Astrology Consultation',description:'Guidance Rooted in Vedic Wisdom, Clarity for Your Path.'};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body>{children}</body></html>}
