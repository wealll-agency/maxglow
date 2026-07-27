import RefundsPageClient from '../RefundsPageClient';

export const metadata = {
  title: 'Refunded Requests | Admin Panel',
};

export default function RefundedRequestsPage() {
  return <RefundsPageClient status="Refunded" />;
}
