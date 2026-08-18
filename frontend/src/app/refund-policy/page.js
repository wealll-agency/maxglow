export const metadata = {
  title: 'Refund & Cancellation Policy | MaxGlow',
  description: 'Information regarding MaxGlow order cancellations, return eligibility, and refund timelines.',
};

export default function RefundPolicyPage() {
  return (
    <main className="bg-light pb-5 pt-4">
      <div className="container" style={{ maxWidth: '900px' }}>
        <div className="bg-white rounded-4 shadow-sm p-4 p-md-5">
          <div className="mb-5 border-bottom pb-4 text-center text-md-start">
            <h1 className="fw-bold mb-3 text-dark" style={{ fontFamily: 'var(--font-outfit)' }}>Refund & Cancellation Policy</h1>
            <p className="text-muted mb-1 fs-7"><strong>Effective Date:</strong> August 17, 2026</p>
            <p className="text-muted mb-0 fs-7"><strong>Last Updated:</strong> August 17, 2026</p>
          </div>

          <div className="policy-content text-secondary lh-lg" style={{ fontSize: '15px' }}>
            <section className="mb-4">
              <h2 className="h4 fw-bold text-dark mb-3">1. Introduction & Scope</h2>
              <p>
                At MaxGlow, we strive to ensure a smooth and satisfying shopping experience. This Refund & Cancellation Policy 
                outlines the conditions under which you may cancel an order, return a product, or request a refund. By placing 
                an order on our website, you agree to the terms set forth below. These terms are governed by and subject to 
                applicable Indian consumer protection laws.
              </p>
            </section>

            <section className="mb-4">
              <h2 className="h4 fw-bold text-dark mb-3">2. Order Cancellation</h2>
              
              <h3 className="h6 fw-bold text-dark mt-4 mb-2">2.1 Cancellation Eligibility</h3>
              <p>
                You may cancel your order free of charge before it has been packed or dispatched by our warehouse.
              </p>
              
              <h3 className="h6 fw-bold text-dark mt-4 mb-2">2.2 Cancellation After Order Processing</h3>
              <p>
                Once an order has been packed or dispatched, it cannot be directly cancelled through your account. If you wish 
                to cancel a shipped order, please contact our support team immediately. If the shipment arrives at your doorstep, 
                you may refuse the delivery. Refunds for refused shipments will be processed after the products are returned to 
                our facility, and may be subject to deduction of shipping charges.
              </p>
            </section>

            <section className="mb-4">
              <h2 className="h4 fw-bold text-dark mb-3">3. Return Policy</h2>
              
              <h3 className="h6 fw-bold text-dark mt-4 mb-2">3.1 Return Eligibility</h3>
              <p>
                Returns are accepted within <strong>7 days</strong> of the delivery date only under the following conditions:
              </p>
              <ul className="ps-4 mb-3">
                <li className="mb-2"><strong>Damaged or Defective Products:</strong> The product arrived damaged, broken, or spoiled.</li>
                <li className="mb-2"><strong>Wrong or Missing Products:</strong> You received a product different from what you ordered, or items are missing from your package.</li>
              </ul>
              
              <h3 className="h6 fw-bold text-dark mt-4 mb-2">3.2 Non-Returnable Products</h3>
              <p>
                For hygiene and safety reasons, we do not accept returns for opened, used, or tampered cosmetic and wellness products 
                unless they are defective. "Change of mind" returns are generally not accepted for such personal care items.
              </p>
              
              <h3 className="h6 fw-bold text-dark mt-4 mb-2">3.3 Return Request Process & Required Evidence</h3>
              <p>
                To initiate a return for damaged or incorrect items, please contact our support team with your order number and 
                clear photographs (or an unboxing video, if specifically requested) of the received package and products. 
                Our team will verify the evidence before authorizing a return pickup or replacement.
              </p>
            </section>

            <section className="mb-4">
              <h2 className="h4 fw-bold text-dark mb-3">4. Refunds</h2>
              
              <h3 className="h6 fw-bold text-dark mt-4 mb-2">4.1 Refund Calculation & Deductions</h3>
              <p>
                Approved refunds will cover the cost of the returned items. Original shipping charges and non-refundable payment 
                gateway fees (if applicable and legally permitted) may be deducted from the final refund amount.
              </p>

              <h3 className="h6 fw-bold text-dark mt-4 mb-2">4.2 Refund Processing Timeline</h3>
              <p>
                Once your return is received and inspected at our warehouse, we will notify you of the approval or rejection of your refund. 
                If approved, your refund will be initiated within <strong>5 to 7 business days</strong>. 
                Please note that once initiated by us, it may take additional time for your bank or payment provider to credit the amount to your account.
              </p>

              <h3 className="h6 fw-bold text-dark mt-4 mb-2">4.3 Original Payment Method</h3>
              <p>
                Refunds will strictly be credited back to the original payment method used during the transaction (e.g., Credit Card, UPI, NetBanking). 
                If the original payment method is no longer active, please notify our support team immediately.
              </p>
            </section>

            <section className="mb-4">
              <h2 className="h4 fw-bold text-dark mb-3">5. Payment-Specific Handling</h2>
              
              <h3 className="h6 fw-bold text-dark mt-4 mb-2">5.1 Amount Debited but Order Not Created</h3>
              <p>
                If your account was debited but the order was not successfully generated on our website due to a network failure or gateway timeout, 
                the payment gateway typically auto-reverses the transaction within 48 to 72 hours. If it is not reversed, please contact us 
                with your transaction reference ID so we can investigate and manually initiate the refund.
              </p>
              
              <h3 className="h6 fw-bold text-dark mt-4 mb-2">5.2 Failed Payments</h3>
              <p>
                No completed order or refund request will be treated as valid if the initial payment attempt failed and funds were not received by MaxGlow.
              </p>
            </section>

            <section className="mb-4">
              <h2 className="h4 fw-bold text-dark mb-3">6. Replacements & Exchanges</h2>
              <p>
                If you receive a defective or incorrect item, you may opt for a replacement rather than a refund. We will dispatch 
                the replacement product free of cost once the original item is verified and picked up.
              </p>
            </section>

            <section className="mb-4">
              <h2 className="h4 fw-bold text-dark mb-3">7. Fraudulent Requests & Disputes</h2>
              <p>
                MaxGlow reserves the right to reject refund or return requests if we detect fraudulent activity, systematic abuse 
                of the return policy, or if the returned products do not match the original items dispatched. Any unresolved disputes 
                are subject to grievance redressal in accordance with applicable laws.
              </p>
            </section>

            <section className="mb-0">
              <h2 className="h4 fw-bold text-dark mb-3">8. Contact & Grievance Redressal</h2>
              <p>
                If you need assistance with an ongoing refund or cancellation, please reach out to our Customer Support team:
              </p>
              <address className="mb-0 bg-light p-4 rounded text-dark fs-7">
                <strong>MaxGlow Support Team</strong><br/>
                Email: <strong>support@maxglow.com</strong><br/>
                Location: Delhi, India
              </address>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}
