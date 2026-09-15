export const metadata = {
  title: 'Terms & Conditions | MaxGlow',
  description: 'Read the terms and conditions for using MaxGlow website and purchasing products.',
};

export default function TermsConditionsPage() {
  return (
    <main className="bg-light pb-5 pt-4">
      <div className="container" style={{ maxWidth: '900px' }}>
        <div className="bg-white rounded-4 shadow-sm p-4 p-md-5">
          <div className="mb-5 border-bottom pb-4 text-center text-md-start">
            <h1 className="fw-bold mb-3 text-dark" style={{ fontFamily: 'var(--font-outfit)' }}>Terms & Conditions</h1>
            <p className="text-muted mb-1 fs-7"><strong>Effective Date:</strong> August 17, 2026</p>
            <p className="text-muted mb-0 fs-7"><strong>Last Updated:</strong> August 17, 2026</p>
          </div>

          <div className="policy-content text-secondary lh-lg" style={{ fontSize: '15px' }}>
            <section className="mb-4">
              <h2 className="h4 fw-bold text-dark mb-3">1. Acceptance of Terms</h2>
              <p>
                By accessing and using the MaxGlow website, you agree to be bound by these Terms & Conditions. 
                If you do not agree to all the terms and conditions set forth below, please do not use our website or purchase our products.
              </p>
            </section>

            <section className="mb-4">
              <h2 className="h4 fw-bold text-dark mb-3">2. Eligibility</h2>
              <p>
                To use our website and make purchases, you must be at least 18 years of age or accessing the site under the supervision of a parent or guardian. 
                Our website is directed to users in India, and we do not make representations that our products are appropriate or available for use in other locations.
              </p>
            </section>

            <section className="mb-4">
              <h2 className="h4 fw-bold text-dark mb-3">3. Account Registration</h2>
              <p>
                Certain features of the website may require you to register an account. You are responsible for maintaining the confidentiality of your account credentials 
                and for all activities that occur under your account. Please notify us immediately of any unauthorized use of your account.
              </p>
            </section>

            <section className="mb-4">
              <h2 className="h4 fw-bold text-dark mb-3">4. Product Information & Availability</h2>
              <p>
                We strive to display our products, including their descriptions and colors, as accurately as possible. However, we do not guarantee that the 
                colors and descriptions are completely accurate or error-free. All products are subject to availability, and we reserve the right to limit 
                quantities or discontinue products without notice.
              </p>
            </section>

            <section className="mb-4">
              <h2 className="h4 fw-bold text-dark mb-3">5. Pricing & Payment</h2>
              <p>
                All prices are listed in Indian Rupees (INR) and are inclusive of applicable taxes unless stated otherwise. We reserve the right to change prices at any time. 
                We accept secure payments through authorized payment gateways (such as ICICI). By submitting payment, you authorize us to charge the applicable payment method.
              </p>
            </section>

            <section className="mb-4">
              <h2 className="h4 fw-bold text-dark mb-3">6. Orders & Cancellation</h2>
              <p>
                We reserve the right to refuse or cancel any order for any reason, including but not limited to product availability, errors in product or pricing information, 
                or suspected fraud. For details on how you can cancel your order, please review our <a href="/refund-policy" className="text-primary text-decoration-none">Refund & Cancellation Policy</a>.
              </p>
            </section>

            <section className="mb-4">
              <h2 className="h4 fw-bold text-dark mb-3">7. Shipping & Delivery</h2>
              <p>
                Delivery timelines and shipping charges are calculated at checkout. While we make every effort to deliver within estimated timelines, 
                delays may occur due to unforeseen circumstances. Please review our <a href="/shipping-policy" className="text-primary text-decoration-none">Shipping Policy</a> for more details.
              </p>
            </section>

            <section className="mb-4">
              <h2 className="h4 fw-bold text-dark mb-3">8. User Responsibilities</h2>
              <p>When using our website, you agree not to:</p>
              <ul className="ps-4 mb-0">
                <li className="mb-2">Engage in fraudulent activities or use the site for unlawful purposes.</li>
                <li className="mb-2">Interfere with or disrupt the security or performance of the website.</li>
                <li className="mb-0">Reproduce, copy, or exploit any portion of the website without our express permission.</li>
              </ul>
            </section>

            <section className="mb-4">
              <h2 className="h4 fw-bold text-dark mb-3">9. Intellectual Property</h2>
              <p>
                All content on this website, including text, graphics, logos, images, and software, is the property of MaxGlow and is protected by applicable copyright and intellectual property laws.
              </p>
            </section>

            <section className="mb-4">
              <h2 className="h4 fw-bold text-dark mb-3">10. Limitation of Liability</h2>
              <p>
                MaxGlow shall not be liable for any direct, indirect, incidental, special, or consequential damages resulting from the use or inability to use our products or website, 
                even if we have been advised of the possibility of such damages.
              </p>
            </section>

            <section className="mb-4">
              <h2 className="h4 fw-bold text-dark mb-3">11. Governing Law & Jurisdiction</h2>
              <p>
                These Terms & Conditions shall be governed by and construed in accordance with the laws of India. Any disputes arising out of or related to these terms shall be subject to the exclusive jurisdiction of the courts in Delhi, India.
              </p>
            </section>

            <section className="mb-0">
              <h2 className="h4 fw-bold text-dark mb-3">12. Contact Information</h2>
              <p>
                If you have any questions or concerns regarding these Terms & Conditions, please contact us at:
              </p>
              <address className="mb-0 bg-light p-4 rounded text-dark fs-7">
                <strong>MaxGlow Support Team</strong><br/>
                Email: support@maxglow.com<br/>
                Location: Delhi, India
              </address>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}
