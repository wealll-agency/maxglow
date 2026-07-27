"use client";
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';




import { useState, useEffect, Suspense } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser, clearError } from '@/store/authSlice';


import { LogIn, Key, Mail } from 'lucide-react';

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="text-center py-5">Loading...</div>}>
      <LoginContent />
    </Suspense>
  );
}

function LoginContent() {
  const dispatch = useDispatch();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { user, loading, error } = useSelector((state) => state.auth);
  const redirect = searchParams.get('redirect') || '';

  useEffect(() => {
    // If already logged in, redirect
    if (user) {
      if (['Super Admin', 'Manager', 'Staff'].includes(user.role)) {
        router.push(redirect ? `/${redirect}` : '/admin/dashboard');
      } else {
        router.push(redirect ? `/${redirect}` : '/');
      }
    }
    // Clear errors on load
    dispatch(clearError());
  }, [user, redirect, router, dispatch]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      return;
    }
    setIsSubmitting(true);
    await dispatch(loginUser({ email, password, rememberMe }));
    setIsSubmitting(false);
  };

  return (
    <div className="container py-5 d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
      <div className="glass-card p-4 p-md-5 w-100 animate-fade-in" style={{ maxWidth: '460px' }}>
        
        <div className="text-center mb-4">
          <div className="d-inline-flex p-3 rounded-circle bg-light mb-2">
            <LogIn size={32} color="var(--primary-color)" />
          </div>
          <h2 className="fw-bold display-font">Welcome Back</h2>
          <p className="text-muted">Enter credentials to log in to your account</p>
        </div>

        <form onSubmit={handleSubmit} className="d-flex flex-column gap-3">
          
          <div className="position-relative">
            <label className="fw-medium mb-1 fs-7">Email Address</label>
            <div className="position-relative">
              <input
                type="email"
                required
                className="form-control form-control-brand ps-5"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <Mail className="text-muted position-absolute start-0 top-50 translate-middle-y ms-3" size={18} />
            </div>
          </div>

          <div className="position-relative">
            <label className="fw-medium mb-1 fs-7">Password</label>
            <div className="position-relative">
              <input
                type="password"
                required
                className="form-control form-control-brand ps-5"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <Key className="text-muted position-absolute start-0 top-50 translate-middle-y ms-3" size={18} />
            </div>
          </div>

          <div className="form-check fs-7 mt-1">
            <input 
              className="form-check-input shadow-none cursor-pointer" 
              type="checkbox" 
              id="rememberMeCheck" 
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
            />
            <label className="form-check-label text-muted cursor-pointer" htmlFor="rememberMeCheck">
              Remember me
            </label>
          </div>

          {error && <div className="alert alert-danger p-2 fs-8 mb-0 mt-1">{error}</div>}

          <button 
            type="submit" 
            disabled={isSubmitting}
            className="btn btn-brand w-100 py-3 mt-2 fw-semibold fs-6"
          >
            {isSubmitting ? 'Logging In...' : 'Log In'}
          </button>
        </form>

        <p className="text-center text-muted fs-7 mt-4 mb-0">
          Don't have an account? <Link href={`/register${redirect ? `?redirect=${redirect}` : ''}`} className="text-success fw-bold text-decoration-none hover-underline">Register</Link>
        </p>

      </div>
    </div>
  );
}
