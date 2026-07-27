import RefundsPageClient from '@/app/admin/refunds/RefundsPageClient';

export const metadata = {
  title: 'Approved Refunds | Admin Panel',
};

export default function ApprovedRefundsPage() {
  return <RefundsPageClient status="Approved" />;
}
