"use client";
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect, Suspense } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { registerUser, clearError } from '../../store/authSlice';
import { FiUser, FiMail, FiPhone, FiLock, FiUserPlus } from 'react-icons/fi';
import { Leaf } from 'lucide-react';

export default function RegisterPage() {
  return (
    <Suspense fallback={<div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}><div style={{ color: '#3BAE56' }}>Loading...</div></div>}>
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

  const inputFields = [
    { icon: <FiUser size={16} color="#94a3b8" />, label: 'Full Name', type: 'text', value: name, onChange: setName, required: true },
    { icon: <FiMail size={16} color="#94a3b8" />, label: 'Email Address', type: 'email', value: email, onChange: setEmail, required: true },
    { icon: <FiPhone size={16} color="#94a3b8" />, label: 'Phone Number', type: 'tel', value: phone, onChange: setPhone, required: false },
    { icon: <FiLock size={16} color="#94a3b8" />, label: 'Password', type: 'password', value: password, onChange: setPassword, required: true },
  ];

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(135deg, #EAF8FF 0%, #F7FBFD 40%, #DDF7E3 100%)',
      padding: '40px 20px',
      position: 'relative', overflow: 'hidden',
    }}>
      <div style={{ position: 'absolute', top: '-100px', right: '-100px', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(93,174,255,0.15) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '-80px', left: '-80px', width: '300px', height: '300px', background: 'radial-gradient(circle, rgba(97,196,84,0.12) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }} />

      <div style={{ width: '100%', maxWidth: '460px', position: 'relative', zIndex: 1 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <Link href="/" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '40px', height: '40px', background: 'linear-gradient(135deg, #4A90E2, #3BAE56)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Leaf size={22} color="white" />
            </div>
            <span style={{ fontFamily: 'var(--font-outfit)', fontSize: '26px', fontWeight: '800', color: '#1a2332', letterSpacing: '-0.03em' }}>
              Max<span style={{ color: '#3BAE56' }}>Glow</span>
            </span>
          </Link>
        </div>

        {/* Card */}
        <div className="glass" style={{ borderRadius: '24px', padding: '40px 36px', boxShadow: '0 20px 60px rgba(74,144,226,0.12)' }}>
          <h1 style={{ fontFamily: 'var(--font-outfit)', fontSize: '24px', fontWeight: '800', color: '#1a2332', marginBottom: '6px', textAlign: 'center' }}>
            Create Account
          </h1>
          <p style={{ fontSize: '14px', color: '#64748b', textAlign: 'center', marginBottom: '28px' }}>
            Join MaxGlow — start your wellness journey
          </p>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {inputFields.map((field, idx) => (
              <div key={idx}>
                <label className="mg-form-label">{field.label}</label>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
                    {field.icon}
                  </span>
                  <input
                    type={field.type}
                    required={field.required}
                    className="mg-input"
                    value={field.value}
                    onChange={(e) => field.onChange(e.target.value)}
                    style={{ paddingLeft: '40px' }}
                  />
                </div>
              </div>
            ))}

            {error && (
              <div style={{ background: '#fff0f0', border: '1px solid #fecaca', borderRadius: '10px', padding: '10px 14px', fontSize: '13px', color: '#ef4444' }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-mg-green"
              style={{ width: '100%', justifyContent: 'center', fontSize: '15px', padding: '14px', marginTop: '4px', opacity: loading ? 0.7 : 1 }}
            >
              <FiUserPlus size={16} />
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          <p style={{ textAlign: 'center', fontSize: '14px', color: '#64748b', marginTop: '20px', marginBottom: 0 }}>
            Already have an account?{' '}
            <Link href={`/login${redirect ? `?redirect=${redirect}` : ''}`} style={{ color: '#3BAE56', fontWeight: '700', textDecoration: 'none' }}>
              Log In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
