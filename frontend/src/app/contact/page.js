"use client";

import Link from 'next/link';
import React, { useState } from 'react';
import { 
  FiMail, FiPhone, FiMapPin, FiChevronRight, 
  FiFacebook, FiInstagram, FiTwitter, FiYoutube 
} from 'react-icons/fi';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://www.maxglowon.com/api';

export default function ContactPage() {
  const [form, setForm] = useState({ 
    firstName: '', 
    lastName: '', 
    phone: '', 
    email: '', 
    queryType: 'Order Related Queries', 
    message: '' 
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      const res = await fetch(`${API_BASE}/enquiries`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (data.success) {
        setSubmitted(true);
        setForm({ 
          firstName: '', 
          lastName: '', 
          phone: '', 
          email: '', 
          queryType: 'Order Related Queries', 
          message: '' 
        });
      } else {
        setError(data.message || 'Something went wrong. Please try again.');
      }
    } catch {
      setError('Could not connect to server. Please try again later.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      {/* Contact Banner Header */}
      <section style={{
        position: 'relative',
        overflow: 'hidden',
        minHeight: '200px',
        display: 'flex',
        alignItems: 'center',
        backgroundImage: 'url("/trending_banner.png")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}>
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(90deg, rgba(234, 248, 255, 0.94) 0%, rgba(221, 247, 227, 0.85) 50%, rgba(255, 255, 255, 0.15) 100%)',
          zIndex: 1,
        }} />
        <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '40px 20px', width: '100%', position: 'relative', zIndex: 2 }}>
          <nav style={{ fontSize: '13px', color: '#64748b', marginBottom: '8px' }}>
            <Link href="/" style={{ textDecoration: 'none', color: '#64748b' }}>Home</Link> &gt; 
            <span style={{ color: '#1a2332', fontWeight: '600', marginLeft: '6px' }}>Contact Us</span>
          </nav>
          <h1 style={{ fontFamily: 'var(--font-outfit)', fontSize: '36px', fontWeight: '800', color: '#1a2332', margin: 0 }}>
            We're Happy to Help!
          </h1>
          <p style={{ fontSize: '14px', color: '#334155', marginTop: '8px', maxWidth: '600px', fontWeight: '500', lineHeight: 1.5 }}>
            Have queries, feedback, or need order assistance? We are here for you. <br />
            <strong>Operating Hours:</strong> 10:00 AM - 7:00 PM (Monday to Saturday)
          </p>
        </div>
      </section>

      {/* Main Content Layout */}
      <section style={{ padding: '60px 0', background: '#F7FBFD' }}>
        <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '0 20px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '32px' }} className="contact-grid-layout">
            
            {/* Sidebar Column */}
            <div style={{ gridColumn: 'span 4' }} className="contact-sidebar-col">
              <div className="glass" style={{
                borderRadius: '24px',
                padding: '32px',
                border: '1px solid rgba(221,244,255,0.8)',
                boxShadow: '0 10px 30px rgba(74,144,226,0.05)',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}>
                <div>
                  <h4 style={{ 
                    fontFamily: 'var(--font-outfit)', 
                    fontSize: '18px', 
                    fontWeight: '700', 
                    color: '#1a2332', 
                    marginBottom: '20px',
                    borderBottom: '2px solid #3BAE56',
                    paddingBottom: '8px',
                    display: 'inline-block'
                  }}>
                    Select Query Type
                  </h4>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '24px' }}>
                    {['Order Related Queries', 'Non-Order Related Issues', 'Other Issues'].map((type) => {
                      const isActive = form.queryType === type;
                      return (
                        <button
                          key={type}
                          onClick={() => setForm({ ...form, queryType: type })}
                          style={{
                            textAlign: 'left',
                            padding: '14px 20px',
                            borderRadius: '12px',
                            fontSize: '14px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            background: isActive ? '#DDF7E3' : 'white',
                            border: `1.5px solid ${isActive ? '#3BAE56' : '#e2e8f0'}`,
                            color: isActive ? '#3BAE56' : '#475569',
                            transition: 'all 0.2s ease',
                          }}
                        >
                          {type}
                        </button>
                      );
                    })}
                  </div>

                  <Link href="#" style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between', 
                    padding: '16px 20px',
                    borderRadius: '12px',
                    background: '#F7FBFD',
                    border: '1.5px solid #e2e8f0',
                    color: '#1a2332',
                    textDecoration: 'none',
                    fontWeight: '700',
                    fontSize: '14px',
                    fontFamily: 'var(--font-outfit)',
                    transition: 'all 0.2s ease',
                    marginBottom: '24px'
                  }}>
                    Frequently Asked Questions
                    <FiChevronRight size={18} color="#64748b" />
                  </Link>
                </div>

                {/* Social Connect */}
                <div>
                  <h5 style={{ fontFamily: 'var(--font-outfit)', fontSize: '13px', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '12px' }}>
                    Connect With Us
                  </h5>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    {[
                      { icon: <FiFacebook size={16} />, href: '#', color: '#1877F2' },
                      { icon: <FiInstagram size={16} />, href: '#', color: '#E1306C' },
                      { icon: <FiTwitter size={16} />, href: '#', color: '#1DA1F2' },
                      { icon: <FiYoutube size={16} />, href: '#', color: '#FF0000' },
                    ].map((social, idx) => (
                      <Link
                        key={idx}
                        href={social.href}
                        style={{
                          width: '38px', height: '38px', borderRadius: '10px',
                          background: 'white',
                          border: '1.5px solid #e2e8f0',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          color: '#64748b', textDecoration: 'none',
                          transition: 'all 0.2s ease',
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background = social.color; e.currentTarget.style.borderColor = social.color; e.currentTarget.style.color = 'white'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'white'; e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.color = '#64748b'; }}
                      >
                        {social.icon}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Main Form Column */}
            <div style={{ gridColumn: 'span 8' }} className="contact-main-col">
              <div className="glass" style={{
                borderRadius: '24px',
                padding: '40px',
                border: '1px solid rgba(221,244,255,0.8)',
                boxShadow: '0 10px 30px rgba(74,144,226,0.05)',
                background: 'white',
              }}>
                <h3 style={{ fontFamily: 'var(--font-outfit)', fontSize: '24px', fontWeight: '800', color: '#1a2332', marginBottom: '24px' }}>
                  Send a Message
                </h3>

                {submitted && (
                  <div style={{
                    padding: '16px 20px',
                    borderRadius: '12px',
                    background: '#DDF7E3',
                    border: '1.5px solid #3BAE56',
                    color: '#3BAE56',
                    fontWeight: '600',
                    fontSize: '14px',
                    marginBottom: '24px',
                  }}>
                    ✅ Your message has been sent successfully! We will get back to you shortly.
                  </div>
                )}

                {error && (
                  <div style={{
                    padding: '16px 20px',
                    borderRadius: '12px',
                    background: '#FEE2E2',
                    border: '1.5px solid #EF4444',
                    color: '#EF4444',
                    fontWeight: '600',
                    fontSize: '14px',
                    marginBottom: '24px',
                  }}>
                    ❌ {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }} className="contact-form-row">
                    <div>
                      <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#475569', marginBottom: '6px' }}>First Name*</label>
                      <input 
                        type="text" 
                        name="firstName" 
                        value={form.firstName} 
                        onChange={handleChange} 
                        required 
                        style={{
                          width: '100%',
                          padding: '12px 16px',
                          borderRadius: '10px',
                          border: '1.5px solid #e2e8f0',
                          outline: 'none',
                          fontSize: '14px',
                          color: '#1a2332',
                          background: '#F8FAFC',
                          transition: 'all 0.15s ease',
                        }}
                        onFocus={e => { e.currentTarget.style.borderColor = '#4A90E2'; e.currentTarget.style.background = 'white'; }}
                        onBlur={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.background = '#F8FAFC'; }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#475569', marginBottom: '6px' }}>Last Name*</label>
                      <input 
                        type="text" 
                        name="lastName" 
                        value={form.lastName} 
                        onChange={handleChange} 
                        required 
                        style={{
                          width: '100%',
                          padding: '12px 16px',
                          borderRadius: '10px',
                          border: '1.5px solid #e2e8f0',
                          outline: 'none',
                          fontSize: '14px',
                          color: '#1a2332',
                          background: '#F8FAFC',
                          transition: 'all 0.15s ease',
                        }}
                        onFocus={e => { e.currentTarget.style.borderColor = '#4A90E2'; e.currentTarget.style.background = 'white'; }}
                        onBlur={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.background = '#F8FAFC'; }}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }} className="contact-form-row">
                    <div>
                      <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#475569', marginBottom: '6px' }}>Phone Number*</label>
                      <input 
                        type="tel" 
                        name="phone" 
                        value={form.phone} 
                        onChange={handleChange} 
                        required 
                        style={{
                          width: '100%',
                          padding: '12px 16px',
                          borderRadius: '10px',
                          border: '1.5px solid #e2e8f0',
                          outline: 'none',
                          fontSize: '14px',
                          color: '#1a2332',
                          background: '#F8FAFC',
                          transition: 'all 0.15s ease',
                        }}
                        onFocus={e => { e.currentTarget.style.borderColor = '#4A90E2'; e.currentTarget.style.background = 'white'; }}
                        onBlur={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.background = '#F8FAFC'; }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#475569', marginBottom: '6px' }}>Email*</label>
                      <input 
                        type="email" 
                        name="email" 
                        value={form.email} 
                        onChange={handleChange} 
                        required 
                        style={{
                          width: '100%',
                          padding: '12px 16px',
                          borderRadius: '10px',
                          border: '1.5px solid #e2e8f0',
                          outline: 'none',
                          fontSize: '14px',
                          color: '#1a2332',
                          background: '#F8FAFC',
                          transition: 'all 0.15s ease',
                        }}
                        onFocus={e => { e.currentTarget.style.borderColor = '#4A90E2'; e.currentTarget.style.background = 'white'; }}
                        onBlur={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.background = '#F8FAFC'; }}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#475569', marginBottom: '6px' }}>Write Your Message*</label>
                    <textarea 
                      name="message" 
                      value={form.message} 
                      onChange={handleChange} 
                      rows="5" 
                      required 
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        borderRadius: '10px',
                        border: '1.5px solid #e2e8f0',
                        outline: 'none',
                        fontSize: '14px',
                        color: '#1a2332',
                        background: '#F8FAFC',
                        transition: 'all 0.15s ease',
                        resize: 'vertical',
                      }}
                      onFocus={e => { e.currentTarget.style.borderColor = '#4A90E2'; e.currentTarget.style.background = 'white'; }}
                      onBlur={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.background = '#F8FAFC'; }}
                    ></textarea>
                  </div>

                  <button 
                    type="submit" 
                    disabled={submitting}
                    style={{
                      background: '#1a2332',
                      color: 'white',
                      fontFamily: 'var(--font-outfit), sans-serif',
                      fontSize: '13px',
                      fontWeight: '700',
                      textTransform: 'uppercase',
                      letterSpacing: '0.08em',
                      padding: '14px 32px',
                      borderRadius: '9999px',
                      border: 'none',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      alignSelf: 'flex-start',
                      boxShadow: '0 4px 12px rgba(26,35,50,0.15)',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = '#3BAE56'}
                    onMouseLeave={e => e.currentTarget.style.background = '#1a2332'}
                  >
                    {submitting ? 'Sending Enquiry...' : 'Submit Enquiry'}
                  </button>
                </form>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Info Block Section */}
      <section style={{ padding: '60px 0', background: 'white' }}>
        <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '0 20px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }} className="contact-grid-layout">
            
            <div className="glass" style={{
              borderRadius: '20px',
              padding: '32px',
              textAlign: 'center',
              border: '1px solid rgba(221,244,255,0.8)',
              boxShadow: '0 10px 30px rgba(74,144,226,0.03)',
              background: '#F7FBFD',
              borderTop: '4px solid #3BAE56',
            }}>
              <div style={{
                width: '56px', height: '56px', borderRadius: '50%',
                background: '#DDF7E3', display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 16px', color: '#3BAE56'
              }}>
                <FiMail size={24} />
              </div>
              <h5 style={{ fontFamily: 'var(--font-outfit)', fontSize: '16px', fontWeight: '700', color: '#1a2332', marginBottom: '8px' }}>Email Us</h5>
              <p style={{ fontSize: '14px', color: '#64748b', margin: 0 }}>info@webmail.com</p>
            </div>

            <div className="glass" style={{
              borderRadius: '20px',
              padding: '32px',
              textAlign: 'center',
              border: '1px solid rgba(221,244,255,0.8)',
              boxShadow: '0 10px 30px rgba(74,144,226,0.03)',
              background: '#F7FBFD',
              borderTop: '4px solid #3BAE56',
            }}>
              <div style={{
                width: '56px', height: '56px', borderRadius: '50%',
                background: '#DDF7E3', display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 16px', color: '#3BAE56'
              }}>
                <FiPhone size={24} />
              </div>
              <h5 style={{ fontFamily: 'var(--font-outfit)', fontSize: '16px', fontWeight: '700', color: '#1a2332', marginBottom: '8px' }}>Call Us</h5>
              <p style={{ fontSize: '14px', color: '#64748b', margin: 0 }}>+91 9748724689</p>
            </div>

            <div className="glass" style={{
              borderRadius: '20px',
              padding: '32px',
              textAlign: 'center',
              border: '1px solid rgba(221,244,255,0.8)',
              boxShadow: '0 10px 30px rgba(74,144,226,0.03)',
              background: '#F7FBFD',
              borderTop: '4px solid #3BAE56',
            }}>
              <div style={{
                width: '56px', height: '56px', borderRadius: '50%',
                background: '#DDF7E3', display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 16px', color: '#3BAE56'
              }}>
                <FiMapPin size={24} />
              </div>
              <h5 style={{ fontFamily: 'var(--font-outfit)', fontSize: '16px', fontWeight: '700', color: '#1a2332', marginBottom: '8px' }}>Visit Us</h5>
              <p style={{ fontSize: '14px', color: '#64748b', margin: 0, lineHeight: 1.5 }}>
                33, Maharshi Devendra Road<br />Kolkata-700006
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* Embed Map Section */}
      <section style={{ width: '100%', height: '450px', background: '#F8FAFC', position: 'relative' }}>
        <iframe
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d117925.33439927715!2d88.26495098904321!3d22.53540637453303!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39f882db4908f667%3A0x43e330e68f6c2cbc!2sKolkata%2C%20West%20Bengal!5e0!3m2!1sen!2sin!4v1712613612345!5m2!1sen!2sin"
          width="100%" 
          height="100%" 
          style={{ border: 0, display: 'block' }} 
          allowFullScreen="" 
          loading="lazy" 
          referrerPolicy="no-referrer-when-downgrade"
        />
      </section>

      {/* Related Search Tags Section */}
      <section style={{ padding: '60px 0', background: 'white' }}>
        <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '0 20px' }}>
          <h4 style={{ fontFamily: 'var(--font-outfit)', fontSize: '20px', fontWeight: '800', color: '#1a2332', marginBottom: '20px' }}>
            People Are Also Looking For
          </h4>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
            {[
              'Herbal Face Wash', 'Aloe Vera Skin Gel', 'Vitamin C Serum', 
              'Tea Tree Anti-Acne Cream', 'Natural Sunscreen SPF 50', 
              'Hair Radiance Oil', 'Organic Body Butter', 'Herbal Lip Balm'
            ].map((tag) => (
              <Link 
                key={tag} 
                href={`/shop?keyword=${encodeURIComponent(tag)}`}
                style={{
                  padding: '8px 18px',
                  borderRadius: '9999px',
                  background: '#F7FBFD',
                  border: '1.5px solid #e2e8f0',
                  color: '#475569',
                  textDecoration: 'none',
                  fontSize: '13px',
                  fontWeight: '600',
                  transition: 'all 0.15s ease',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = '#DDF7E3'; e.currentTarget.style.borderColor = '#3BAE56'; e.currentTarget.style.color = '#3BAE56'; }}
                onMouseLeave={e => { e.currentTarget.style.background = '#F7FBFD'; e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.color = '#475569'; }}
              >
                {tag}
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
