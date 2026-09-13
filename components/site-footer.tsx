export default function SiteFooter() {
  return (
    <footer className="footer">
      © {new Date().getFullYear()} THE VEDIC ASTRO · Pt. Deepak Acharya ·{' '}
      <a href="/privacy">Privacy</a> · <a href="/terms">Terms</a> ·{' '}
      <a href="/refund-policy">Refund Policy</a> ·{' '}
      <a href="/disclaimer">Disclaimer</a>
    </footer>
  );
}