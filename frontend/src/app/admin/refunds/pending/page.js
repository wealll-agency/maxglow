import RefundsPageClient from '../RefundsPageClient';

export const metadata = {
  title: 'Pending Refunds | Admin Panel',
};

export default function PendingRefundsPage() {
  return <RefundsPageClient status="Pending" />;
}
