"use client";
import Link from 'next/link';



import React, { useState } from 'react';


const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://www.maxglowon.com/api';

export default function ContactPage() {
  const [form, setForm] = useState({ firstName: '', lastName: '', phone: '', email: '', queryType: 'Order Related Queries', message: '' });
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
        setForm({ firstName: '', lastName: '', phone: '', email: '', queryType: 'Order Related Queries', message: '' });
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
      <div className="marquee-wrapper">
        <marquee behavior="scroll" direction="left" scrollamount="5">
          || 🥜 MaxGlow Anmol Jumbo Nuts - Extra 10% OFF! 🥜 || 🎁 Nuts For Savings 🎁 || 🔥 PayDay Sale Is LIVE - Extra 15% OFF Sitewide! 🔥 ||
        </marquee>
      </div>

      {/* Contact Hero Section */}
      <section className="contact-hero-section">
        <div className="container text-center">
          <h1 className="contact-hero-title">We're Happy to Help!</h1>
          <p className="contact-hero-subtitle">Have any queries or feedback? We would be happy to assist you.</p>
          <p className="contact-hero-time">10:00 AM - 7:00 PM (Monday to Saturday)</p>
        </div>
      </section>

      {/* Contact Form Section */}
      <section className="contact-form-section">
        <div className="container">
          <div className="contact-wrapper-box d-flex align-items-center flex-column flex-md-row">
            {/* Sidebar */}
            <div className="contact-sidebar">
              <h4 className="contact-sidebar-title">Select Query Type</h4>
              <ul className="contact-query-list list-unstyled">
                {['Order Related Queries', 'Non-Order Related Issues', 'Other Issues'].map((type) => (
                  <li key={type}>
                    <a href="#" className={form.queryType === type ? 'active' : ''} onClick={(e) => { e.preventDefault(); setForm({ ...form, queryType: type }); }}>{type}</a>
                  </li>
                ))}
              </ul>
              <hr className="contact-sidebar-divider" />
              <a href="#" className="contact-faq-link">Frequently Asked Questions <i className="fas fa-chevron-right float-end mt-1" style={{ fontSize: '12px' }}></i></a>

              <div className="contact-social-icons">
                <a href="#"><i className="fab fa-facebook-f"></i></a>
                <a href="#"><i className="fab fa-instagram"></i></a>
                <a href="#"><i className="fab fa-linkedin-in"></i></a>
                <a href="#"><i className="fab fa-pinterest-p"></i></a>
                <a href="#"><i className="fab fa-telegram-plane"></i></a>
                <a href="#"><i className="fab fa-twitter"></i></a>
                <a href="#"><i className="fab fa-youtube"></i></a>
              </div>
            </div>

            {/* Main Form Body */}
            <div className="contact-main-body flex-grow-1">
              <h3 className="contact-form-title">Contact Me</h3>
              {submitted && (
                <div className="alert alert-success" role="alert">
                  ✅ Your message has been sent! We will get back to you soon.
                </div>
              )}
              {error && <div className="alert alert-danger">{error}</div>}
              <form className="contact-query-form" onSubmit={handleSubmit}>
                <div className="row g-4 mb-4">
                  <div className="col-md-6">
                    <label className="form-label mb-1">First Name*</label>
                    <input type="text" name="firstName" value={form.firstName} onChange={handleChange} className="form-control" required />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label mb-1">Last Name*</label>
                    <input type="text" name="lastName" value={form.lastName} onChange={handleChange} className="form-control" required />
                  </div>
                </div>
                <div className="row g-4 mb-4">
                  <div className="col-md-6">
                    <label className="form-label mb-1">Phone Number*</label>
                    <input type="tel" name="phone" value={form.phone} onChange={handleChange} className="form-control" required />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label mb-1">Email*</label>
                    <input type="email" name="email" value={form.email} onChange={handleChange} className="form-control" required />
                  </div>
                </div>
                <div className="mb-4">
                  <label className="form-label mb-1">Write Your Message*</label>
                  <textarea name="message" value={form.message} onChange={handleChange} className="form-control" rows="5" required></textarea>
                </div>
                <button type="submit" className="btn contact-submit-btn" disabled={submitting}>
                  {submitting ? 'Sending...' : 'SUBMIT NOW'}
                </button>
              </form>

              {/* Track Box */}
              <div className="contact-track-box mt-4">
                <div className="d-flex align-items-center flex-wrap gap-2 justify-content-between w-100">
                  <div className="d-flex align-items-center">
                    <div className="track-icon-box">
                      <svg xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" width="55" height="55" viewBox="0 0 55 55" fill="none">
                        <mask id="mask0_1220_4745" style={{ maskType: 'alpha' }} maskUnits="userSpaceOnUse" x="0" y="0" width="55" height="55">
                          <rect x="0.62793" y="0.486328" width="53.7197" height="53.7197" fill="url(#pattern0z)"></rect>
                        </mask>
                        <g mask="url(#mask0_1220_4745)">
                          <rect x="-8.00586" y="-0.473145" width="67.1496" height="58.5161" rx="29.258" fill="url(#paint0_linear_1220_4745)"></rect>
                        </g>
                        <defs>
                          <pattern id="pattern0z" patternContentUnits="objectBoundingBox" width="1" height="1">
                            <use xlinkHref="#image0_1220_4745" transform="scale(0.00195312)"></use>
                          </pattern>
                          <linearGradient id="paint0_linear_1220_4745" x1="-8.00586" y1="38.6386" x2="59.1437" y2="38.6386" gradientUnits="userSpaceOnUse">
                            <stop stopColor="#A81632"></stop>
                            <stop offset="1" stopColor="#E6445B"></stop>
                          </linearGradient>
                          <image id="image0_1220_4745" width="512" height="512" xlinkHref="data:image/png;base64,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">
                          </image>
                        </defs>
                      </svg>
                    </div>
                    <div className="track-text ms-3" style={{ fontFamily: "'Poppins', sans-serif" }}>
                      <h6 className="mb-0 text-dark text-uppercase" style={{ fontSize: '13px', fontWeight: 800, letterSpacing: '-0.3px' }}>TRACK, CANCEL, RETURN/EXCHANGE</h6>
                      <span className="text-dark" style={{ fontSize: '12px', fontWeight: 400, opacity: 0.8 }}>Manage your purchases</span>
                    </div>
                  </div>
                  <a href="#" className="btn shadow-none contact-enquire-btn">ENQUIRE NOW</a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Map Section */}
      <section className="contact-map-section mt-5 mb-5">
        <div className="container-fluid px-0">
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d117925.33439927715!2d88.26495098904321!3d22.53540637453303!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39f882db4908f667%3A0x43e330e68f6c2cbc!2sKolkata%2C%20West%20Bengal!5e0!3m2!1sen!2sin!4v1712613612345!5m2!1sen!2sin"
            width="100%" height="450" style={{ border: 0 }} allowFullScreen="" loading="lazy" referrerPolicy="no-referrer-when-downgrade">
          </iframe>
        </div>
      </section>

      {/* Contact Details from TopBar */}
      <section className="contact-info-blocks py-5 mb-5" style={{ backgroundColor: '#f8f9fa' }}>
        <div className="container text-center">
          <div className="row g-4 justify-content-center">
            <div className="col-md-4">
              <div className="p-4 bg-white rounded shadow-sm h-100 border-top border-3 border-success">
                <i className="fas fa-envelope fa-2x mb-3 text-success"></i>
                <h5 className="fw-bold mb-2">Email Us</h5>
                <p className="text-muted m-0">info@webmail.com</p>
              </div>
            </div>
            <div className="col-md-4">
              <div className="p-4 bg-white rounded shadow-sm h-100 border-top border-3 border-success">
                <i className="fas fa-phone-alt fa-2x mb-3 text-success"></i>
                <h5 className="fw-bold mb-2">Call Us</h5>
                <p className="text-muted m-0">+91 9748724689</p>
              </div>
            </div>
            <div className="col-md-4">
              <div className="p-4 bg-white rounded shadow-sm h-100 border-top border-3 border-success">
                <i className="fas fa-map-marker-alt fa-2x mb-3 text-success"></i>
                <h5 className="fw-bold mb-2">Visit Us</h5>
                <p className="text-muted m-0">33, Maharshi Devendra Road<br />Kolkata-700006</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* People Are Also Looking For Section */}
      <section className="tags-section bg-white py-5">
        <div className="container py-3">
          <h3 className="mb-4 text-start" style={{ fontSize: '24px', color: '#333' }}>People Are Also Looking For</h3>
          <div className="d-flex flex-wrap gap-2">
            <a href="#" className="search-tag-pill">Cashew Royale</a>
            <a href="#" className="search-tag-pill">Cashew Premium</a>
            <a href="#" className="search-tag-pill">Almond American</a>
            <a href="#" className="search-tag-pill">Mamra</a>
            <a href="#" className="search-tag-pill">Kishmish Royale</a>
            <a href="#" className="search-tag-pill">Kishmish Premium</a>
            <a href="#" className="search-tag-pill">Walnut Royale</a>
          </div>
        </div>
      </section>
    </>
  );
}
