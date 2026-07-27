import RefundsPageClient from '@/app/admin/refunds/RefundsPageClient';

export const metadata = {
  title: 'Rejected Refunds | Admin Panel',
};

export default function RejectedRefundsPage() {
  return <RefundsPageClient status="Rejected" />;
}
