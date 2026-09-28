import SiteNav from '@/components/site-nav';
import SiteFooter from '@/components/site-footer';

export default function Page() {
  return (
    <>
      <SiteNav />

      <main className="wrap">
        <div className="card">
          <h1>Privacy Policy</h1>

          <p className="muted">
            THE VEDIC ASTRO · Pt. Deepak Acharya
          </p>

          <p>
            <strong>Last Updated:</strong> September 2026
          </p>

          <p>
            THE VEDIC ASTRO respects your privacy. This Privacy Policy
            explains what information may be collected when you use our
            website, create an account, book a consultation, upload
            consultation documents, make or submit payment information,
            or contact us for support.
          </p>

          <h2>1. Information We Collect</h2>
          <p>
            We may collect information that you provide directly to us,
            including your name, phone number, email address, country,
            preferred language and account-related information.
          </p>
          <p>
            For consultations, we may also collect details such as your
            date of birth, time of birth, place of birth, current place,
            consultation purpose, selected service, consultation mode
            and booking information.
          </p>

          <h2>2. Consultation Files</h2>
          <p>
            You may voluntarily upload palm images, photographs, PDFs
            and other documents relevant to your consultation. These
            files are intended to be used only for providing and
            managing the requested consultation and related services.
          </p>
          <p>
            Please do not upload documents or information that are not
            necessary for your consultation.
          </p>

          <h2>3. How We Use Your Information</h2>
          <p>
            We may use your information to create and manage your
            account, process bookings, provide consultations, verify
            payments, provide customer support, manage consultation
            documents and reports, send service-related communications,
            maintain security and operate the website.
          </p>

          <h2>4. Payments</h2>
          <p>
            We may maintain payment-related information such as payment
            status, transaction or reference details and booking-related
            payment records for verification and record-keeping.
          </p>
          <p>
            THE VEDIC ASTRO will never ask you to provide your UPI PIN,
            card PIN, OTP, online-banking password or similar
            confidential authentication credentials.
          </p>

          <h2>5. WhatsApp and Communications</h2>
          <p>
            If you contact us through WhatsApp, email or another
            available communication method, your contact details and
            messages may be processed for customer support, booking and
            consultation-related communication.
          </p>

          <h2>6. Sharing of Information</h2>
          <p>
            We do not sell your personal information for advertising.
            Information may be processed by service providers that help
            us operate functions such as hosting, authentication,
            storage, payments and communications.
          </p>
          <p>
            Information may also be disclosed where reasonably required
            to comply with applicable law, legal process or legitimate
            security requirements.
          </p>

          <h2>7. Data Security</h2>
          <p>
            We use reasonable technical and organizational measures to
            protect information handled through the service. However,
            no internet transmission or electronic storage system can
            be guaranteed to be completely secure.
          </p>

          <h2>8. Data Retention</h2>
          <p>
            Account, booking, consultation, payment and related records
            may be retained for as long as reasonably necessary to
            provide the service, maintain security, handle disputes,
            meet legitimate business requirements and comply with
            applicable obligations.
          </p>

          <h2>9. Cookies and Technical Information</h2>
          <p>
            The website may use cookies, local browser technologies and
            technical information where necessary for authentication,
            security and essential website functionality.
          </p>

          <h2>10. Children's Privacy</h2>
          <p>
            The service should be used in accordance with applicable
            age requirements. Where required, a parent or legal
            guardian should be involved in the use of the service by a
            minor.
          </p>

          <h2>11. Your Choices</h2>
          <p>
            You may contact us regarding correction, access or deletion
            requests relating to your personal information. Requests
            may be subject to applicable requirements and legitimate
            records that need to be retained.
          </p>

          <h2>12. Third-Party Services</h2>
          <p>
            Our website may rely on third-party providers for services
            such as hosting, authentication, storage, payments and
            communications. Their processing may also be governed by
            their respective privacy policies and terms.
          </p>

          <h2>13. Changes to This Policy</h2>
          <p>
            We may update this Privacy Policy when our services,
            practices or applicable requirements change. The updated
            version will be published on this page with an updated
            revision date.
          </p>

          <h2>14. Contact Us</h2>
          <p>
            For privacy-related questions or requests, please contact
            THE VEDIC ASTRO through our Contact page.
          </p>

          <a className="cta" href="/contact">
            Contact Us
          </a>
        </div>
      </main>

      <SiteFooter />
    </>
  );
}