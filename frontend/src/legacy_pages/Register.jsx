"use client";
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';




import { useState, useEffect, Suspense } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { registerUser, clearError } from '@/store/authSlice';


import { UserPlus, User, Mail, Phone, Key } from 'lucide-react';

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="text-center py-5">Loading...</div>}>
      <RegisterContent />
    </Suspense>
  );
}

function RegisterContent() {
  const dispatch = useDispatch();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '';

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');

  const { user, loading, error } = useSelector((state) => state.auth);

  useEffect(() => {
    if (user) {
      router.push(redirect ? `/${redirect}` : '/');
    }
    dispatch(clearError());
  }, [user, redirect, router, dispatch]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name || !email || !password) return;
    dispatch(registerUser({ name, email, password, phone }));
  };

  return (
    <div className="container py-5 d-flex justify-content-center align-items-center" style={{ minHeight: '70vh' }}>
      <div className="glass-card p-4 p-md-5 w-100 animate-fade-in" style={{ maxWidth: '480px' }}>
        
        <div className="text-center mb-4">
          <div className="d-inline-flex p-3 rounded-circle bg-light mb-2">
            <UserPlus size={32} color="var(--primary-color)" />
          </div>
          <h2 className="fw-bold display-font">Create Account</h2>
          <p className="text-muted">Start shopping luxury organic care products</p>
        </div>

        <form onSubmit={handleSubmit} className="d-flex flex-column gap-3">
          
          <div>
            <label className="fw-medium mb-1 fs-7">Full Name</label>
            <div className="position-relative">
              <input
                type="text"
                required
                className="form-control form-control-brand ps-5"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <User className="text-muted position-absolute start-0 top-50 translate-middle-y ms-3" size={18} />
            </div>
          </div>

          <div>
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

          <div>
            <label className="fw-medium mb-1 fs-7">Phone Number</label>
            <div className="position-relative">
              <input
                type="tel"
                className="form-control form-control-brand ps-5"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
              <Phone className="text-muted position-absolute start-0 top-50 translate-middle-y ms-3" size={18} />
            </div>
          </div>

          <div>
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

          {error && <div className="alert alert-danger p-2 fs-8 mb-0 mt-1">{error}</div>}

          <button 
            type="submit" 
            disabled={loading}
            className="btn btn-brand w-100 py-3 mt-2 fw-semibold fs-6"
          >
            {loading ? 'Creating Account...' : 'Register'}
          </button>
        </form>

        <p className="text-center text-muted fs-7 mt-4 mb-0">
          Already have an account? <Link href={`/login${redirect ? `?redirect=${redirect}` : ''}`} className="text-success fw-bold text-decoration-none hover-underline">Log In</Link>
        </p>

      </div>
    </div>
  );
}
