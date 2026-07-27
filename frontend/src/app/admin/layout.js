'use client';

import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useRouter, usePathname } from 'next/navigation';
import AdminSidebar from '../../components/AdminSidebar';
import AdminHeader from '../../components/AdminHeader';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import './admin.css';

export default function AdminLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, loading } = useSelector((state) => state.auth);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;
    // If not loading and no user, send to login
    if (!loading && !user) {
      const currentPath = pathname ? pathname.replace(/^\//, '') : 'admin/dashboard';
      router.push(`/login?redirect=${currentPath}`);
    }
  }, [user, loading, router, isMounted, pathname]);

  if (!isMounted) return null;

  // Show loading skeleton while session resolves
  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
        <div className="spinner-border text-success" role="status">
          <span className="visually-hidden">Loading console...</span>
        </div>
      </div>
    );
  }

  // Block customer access
  if (user && !['Super Admin', 'Manager', 'Staff'].includes(user.role)) {
    return (
      <div className="container py-5 d-flex justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
        <div className="glass-card p-5 text-center max-w-md mx-auto">
          <div className="rounded-circle p-3 bg-danger bg-opacity-10 text-danger d-inline-block mb-3">
            <ShieldAlert size={36} />
          </div>
          <h2 className="fw-bold display-font text-danger">Access Denied</h2>
          <p className="text-muted mb-4">
            Your account does not have administrative privileges. Please return to the customer store.
          </p>
          <Link href="/" className="btn btn-brand d-inline-flex align-items-center gap-1">
            <ArrowLeft size={16} /> Return to Store
          </Link>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="d-flex" style={{ minHeight: '100vh' }}>
      {/* Admin navigation sidebar */}
      <AdminSidebar />
      
      {/* Content panel */}
      <div className="flex-grow-1 bg-light d-flex flex-column admin-wrapper" style={{ maxHeight: '100vh', overflowY: 'auto' }}>
        <AdminHeader />
        <div className="p-4 flex-grow-1">
          {children}
        </div>
      </div>
    </div>
  );
}
