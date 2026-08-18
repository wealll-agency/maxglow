export const metadata = {
  title: 'Shipping Policy | MaxGlow',
  description: 'Learn about MaxGlow delivery estimates, shipping charges, and order tracking.',
};

export default function ShippingPolicyPage() {
  return (
    <main className="bg-light pb-5 pt-4">
      <div className="container" style={{ maxWidth: '900px' }}>
        <div className="bg-white rounded-4 shadow-sm p-4 p-md-5">
          <div className="mb-5 border-bottom pb-4 text-center text-md-start">
            <h1 className="fw-bold mb-3 text-dark" style={{ fontFamily: 'var(--font-outfit)' }}>Shipping Policy</h1>
            <p className="text-muted mb-1 fs-7"><strong>Effective Date:</strong> August 17, 2026</p>
            <p className="text-muted mb-0 fs-7"><strong>Last Updated:</strong> August 17, 2026</p>
          </div>

          <div className="policy-content text-secondary lh-lg" style={{ fontSize: '15px' }}>
            <section className="mb-4">
              <h2 className="h4 fw-bold text-dark mb-3">1. Shipping Overview</h2>
              <p>
                At MaxGlow, we partner with reliable delivery networks to ensure that your herbal skincare and wellness products reach you safely and promptly. 
                This Shipping Policy outlines our processing times, delivery estimates, and shipping charges.
              </p>
            </section>

            <section className="mb-4">
              <h2 className="h4 fw-bold text-dark mb-3">2. Processing Time</h2>
              <p>
                All orders are typically processed and dispatched within <strong>1 to 2 business days</strong> (excluding weekends and public holidays) after receiving your order confirmation email. 
                You will receive another notification when your order has shipped.
              </p>
            </section>

            <section className="mb-4">
              <h2 className="h4 fw-bold text-dark mb-3">3. Delivery Estimates</h2>
              <p>
                Once dispatched, the standard delivery time across India is generally <strong>3 to 7 business days</strong>. 
                Delivery to remote or difficult-to-access locations may take longer. Please note that these are estimates and unforeseen delays by our courier partners or weather conditions might affect delivery times.
              </p>
            </section>

            <section className="mb-4">
              <h2 className="h4 fw-bold text-dark mb-3">4. Shipping Charges & Free Delivery</h2>
              <p>We strive to keep shipping costs affordable for our customers:</p>
              <ul className="ps-4 mb-0">
                <li className="mb-2"><strong>Standard Shipping Fee:</strong> Delivery starting from ₹40, and it will depend on the location.</li>
                <li className="mb-0"><strong>Free Shipping:</strong> We offer free standard delivery on eligible orders (typically orders above ₹500 or ₹999, as displayed in your cart at checkout).</li>
              </ul>
            </section>

            <section className="mb-4">
              <h2 className="h4 fw-bold text-dark mb-3">5. Delivery Locations</h2>
              <p>
                Currently, we ship to most pin codes across India. If our courier partners do not service your area, you will be notified at checkout or shortly after placing your order. 
                At this time, we do not offer international shipping.
              </p>
            </section>

            <section className="mb-4">
              <h2 className="h4 fw-bold text-dark mb-3">6. Order Tracking</h2>
              <p>
                Once your order has shipped, you will receive an email and/or SMS containing a tracking number and a link to trace your package. 
                You can also view the tracking information in the "My Orders" section of your MaxGlow account.
              </p>
            </section>

            <section className="mb-4">
              <h2 className="h4 fw-bold text-dark mb-3">7. Incorrect Addresses & Failed Deliveries</h2>
              <p>
                Please ensure you provide the correct and complete shipping address (including pin code and landmark) and an active contact number during checkout. 
                If a package is returned to us due to an incorrect address, or after multiple failed delivery attempts, we will issue a refund for the items minus the original shipping costs.
              </p>
            </section>

            <section className="mb-4">
              <h2 className="h4 fw-bold text-dark mb-3">8. Damaged Shipments</h2>
              <p>
                If your order arrives damaged, please refuse the delivery if the damage is visible on the outer box. 
                If you discover the damage after opening, please contact our support team immediately with unboxing photos or videos to request a replacement.
              </p>
            </section>

            <section className="mb-0">
              <h2 className="h4 fw-bold text-dark mb-3">9. Contact Us</h2>
              <p>
                For any shipping-related inquiries or if you have not received your tracking information, please get in touch with us:
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
