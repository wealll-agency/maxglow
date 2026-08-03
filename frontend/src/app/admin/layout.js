'use client';

import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useRouter, usePathname } from 'next/navigation';
import AdminSidebar from '../../components/AdminSidebar';
import AdminHeader from '../../components/AdminHeader';
import { ShieldAlert } from 'lucide-react';
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
    if (isMounted && !loading && !user) {
      const currentPath = pathname ? pathname.replace(/^\//, '') : 'admin/dashboard';
      router.push(`/login?redirect=${currentPath}`);
    }
  }, [isMounted, user, loading, router, pathname]);

  // Initial SSR & Initial Client Hydration pass: Render identical layout structure
  if (!isMounted) {
    return (
      <div className="d-flex" style={{ minHeight: '100vh' }}>
        <AdminSidebar />
        <div className="flex-grow-1 bg-light d-flex flex-column admin-wrapper" style={{ maxHeight: '100vh', overflowY: 'auto' }}>
          <AdminHeader />
          <div className="p-4 flex-grow-1">
            <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '50vh' }}>
              <div className="spinner-border text-success" role="status">
                <span className="visually-hidden">Loading console...</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Once mounted on client, render auth states cleanly:
  if (loading) {
    return (
      <div className="d-flex" style={{ minHeight: '100vh' }}>
        <AdminSidebar />
        <div className="flex-grow-1 bg-light d-flex flex-column admin-wrapper" style={{ maxHeight: '100vh', overflowY: 'auto' }}>
          <AdminHeader />
          <div className="p-4 flex-grow-1">
            <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '50vh' }}>
              <div className="spinner-border text-success" role="status">
                <span className="visually-hidden">Loading console...</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Block non-admin user roles
  if (user && !['Super Admin', 'Manager', 'Staff'].includes(user.role)) {
    return (
      <div className="container py-5 d-flex justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
        <div className="glass-card p-5 text-center max-w-md mx-auto">
          <div className="rounded-circle p-3 bg-danger bg-opacity-10 text-danger d-inline-block mb-3">
            <ShieldAlert size={36} />
          </div>
          <h2 className="fw-bold display-font text-danger">Access Denied</h2>
          <p className="text-muted mb-4">
            You do not have administrative privileges to view this portal.
          </p>
          <Link href="/" className="btn btn-brand py-2 px-4 fw-semibold">
            Return to Storefront
          </Link>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="d-flex" style={{ minHeight: '100vh' }}>
      <AdminSidebar />
      <div className="flex-grow-1 bg-light d-flex flex-column admin-wrapper" style={{ maxHeight: '100vh', overflowY: 'auto' }}>
        <AdminHeader />
        <div className="p-4 flex-grow-1">
          {children}
        </div>
      </div>
    </div>
  );
}
