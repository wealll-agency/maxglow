"use client";
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect, Suspense } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser, clearError } from '../../store/authSlice';
import { FiMail, FiLock, FiLogIn } from 'react-icons/fi';
import { Leaf } from 'lucide-react';

export default function LoginPage() {
  return (
    <Suspense fallback={<div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}><div style={{ color: '#3BAE56' }}>Loading...</div></div>}>
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
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const { user, loading, error } = useSelector((state) => state.auth);
  const redirect = searchParams.get('redirect') || '';

  useEffect(() => {
    if (user) {
      if (['Super Admin', 'Manager', 'Staff'].includes(user.role)) {
        router.push(redirect ? `/${redirect}` : '/admin/dashboard');
      } else {
        router.push(redirect ? `/${redirect}` : '/');
      }
    }
    dispatch(clearError());
  }, [user, redirect, router, dispatch]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) return;
    setIsSubmitting(true);
    await dispatch(loginUser({ email, password, rememberMe }));
    setIsSubmitting(false);
  };

  return (
    <div style={{
      minHeight: 'calc(100vh - 120px)', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(135deg, #EAF8FF 0%, #F7FBFD 40%, #DDF7E3 100%)',
      padding: '20px',
      position: 'relative', overflow: 'hidden',
    }}>
      {/* Decorative blobs */}
      <div style={{ position: 'absolute', top: '-100px', right: '-100px', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(93,174,255,0.15) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '-80px', left: '-80px', width: '300px', height: '300px', background: 'radial-gradient(circle, rgba(97,196,84,0.12) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }} />

      <div style={{ width: '100%', maxWidth: '440px', position: 'relative', zIndex: 1 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <Link href="/" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', height: '40px' }}>
            <Image
              src="/logo.png"
              alt="MaxGlow"
              width={160}
              height={40}
              style={{ height: '100%', width: 'auto', objectFit: 'contain' }}
              priority
            />
          </Link>
        </div>

        {/* Card */}
        <div className="glass" style={{
          borderRadius: '24px', padding: '30px 32px',
          boxShadow: '0 20px 60px rgba(74,144,226,0.12)',
        }}>
          <h1 style={{ fontFamily: 'var(--font-outfit)', fontSize: '24px', fontWeight: '800', color: '#1a2332', marginBottom: '6px', textAlign: 'center' }}>
            Welcome Back
          </h1>
          <p style={{ fontSize: '14px', color: '#64748b', textAlign: 'center', marginBottom: '16px' }}>
            Sign in to your MaxGlow account
          </p>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {/* Email */}
            <div>
              <label className="mg-form-label">Email Address</label>
              <div style={{ position: 'relative' }}>
                <FiMail size={16} color="#94a3b8" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                <input
                  type="email"
                  required
                  className="mg-input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{ paddingLeft: '40px' }}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="mg-form-label">Password</label>
              <div style={{ position: 'relative' }}>
                <FiLock size={16} color="#94a3b8" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                <input
                  type="password"
                  required
                  className="mg-input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{ paddingLeft: '40px' }}
                />
              </div>
            </div>

            {/* Remember me */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input
                type="checkbox"
                id="rememberMeCheck"
                checked={mounted ? rememberMe : true}
                onChange={(e) => setRememberMe(e.target.checked)}
                style={{ width: '16px', height: '16px', cursor: 'pointer', accentColor: '#3BAE56' }}
              />
              <label htmlFor="rememberMeCheck" style={{ fontSize: '13px', color: '#64748b', cursor: 'pointer' }}>
                Remember me
              </label>
            </div>

            {/* Error */}
            {mounted && error && (
              <div style={{ background: '#fff0f0', border: '1px solid #fecaca', borderRadius: '10px', padding: '10px 14px', fontSize: '13px', color: '#ef4444' }}>
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={mounted ? isSubmitting : false}
              className="btn-mg-green"
              style={{ width: '100%', justifyContent: 'center', fontSize: '15px', padding: '12px', marginTop: '4px', opacity: isSubmitting ? 0.7 : 1 }}
            >
              <FiLogIn size={16} />
              {mounted && isSubmitting ? 'Logging In...' : 'Log In'}
            </button>
          </form>

          <p style={{ textAlign: 'center', fontSize: '14px', color: '#64748b', marginTop: '16px', marginBottom: 0 }}>
            Don't have an account?{' '}
            <Link href={`/register${mounted && redirect ? `?redirect=${redirect}` : ''}`} style={{ color: '#3BAE56', fontWeight: '700', textDecoration: 'none' }}>
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
