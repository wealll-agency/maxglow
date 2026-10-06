"use client";
import Link from 'next/link';
import Image from 'next/image';
import React, { useState, useEffect } from 'react';
import MgCard from '../../components/ui/MgCard';
import api from '../../utils/axiosConfig';
import { getImageUrl } from '../../utils/imageConfig';

export default function AboutPage() {
  const [content, setContent] = useState(null);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const res = await api.get('/auth/settings');
        if (res.data.success && res.data.settings?.about_page_content) {
          setContent(res.data.settings.about_page_content);
        }
      } catch (err) {
        console.error('Failed to load about page content', err);
      }
    };
    fetchContent();
  }, []);
  return (
    <>


      {/* Premium Hero Banner */}
      <section className="position-relative py-5 d-flex align-items-center" style={{ minHeight: '350px' }}>
        <Image src={content?.hero?.image ? getImageUrl(content.hero.image) : "/trending_banner.png"} alt="About MaxGlow Banner" fill style={{ objectFit: 'cover', objectPosition: 'center' }} priority />
        <div className="position-absolute w-100 h-100" style={{ top: 0, left: 0, background: 'rgba(0, 0, 0, 0.25)' }}></div>
        <div className="container position-relative z-1 text-center mt-4">
          <h1 className="text-white fw-bold display-4 mb-3" style={{ textShadow: '0 4px 15px rgba(0,0,0,0.8)' }}>{content?.hero?.heading || 'About MaxGlow'}</h1>
          <nav aria-label="breadcrumb">
            <ol className="breadcrumb justify-content-center mb-0" style={{ fontSize: '1.1rem' }}>
              <li className="breadcrumb-item"><Link href="/" className="text-white text-opacity-75 text-decoration-none" style={{ textShadow: '0 2px 5px rgba(0,0,0,0.8)' }}>Home</Link></li>
              <li className="breadcrumb-item active text-white fw-bold" aria-current="page" style={{ textShadow: '0 2px 5px rgba(0,0,0,0.8)' }}>About Us</li>
            </ol>
          </nav>
        </div>
      </section>

      {/* Our Story Section */}
      <section className="py-5 my-md-5">
        <div className="container">
          <div className="row align-items-center gy-5">
            <div className="col-lg-6">
              <div className="position-relative">
                <Image 
                  src={content?.story?.image ? getImageUrl(content.story.image) : "/maxglow-hero-products.png"} 
                  alt="MaxGlow Store" 
                  width={800} height={600} 
                  style={{ width: '100%', height: 'auto', objectFit: 'cover' }} 
                  className="img-fluid rounded-5 shadow-lg" 
                />
              </div>
            </div>
            <div className="col-lg-6 ps-lg-5 text-center text-lg-start">
              <span className="d-inline-block px-4 py-2 rounded-pill mb-3 fw-bold shadow-sm" style={{ backgroundColor: '#eef6ff', color: '#1c72b9', fontSize: '0.9rem', letterSpacing: '1px' }}>
                {content?.story?.tagline || 'OUR STORY'}
              </span>
              <h2 className="display-5 fw-bold mb-4" style={{ color: '#1e293b' }}>{content?.story?.heading || 'A Legacy of Premium Herbal Wellness & Cosmetics'}</h2>
              
              {content?.story?.paragraphs && content.story.paragraphs.length > 0 ? (
                content.story.paragraphs.map((para, idx) => (
                  <p key={`story-para-${idx}`} className={`text-secondary fs-5 ${idx === content.story.paragraphs.length - 1 ? 'mb-5' : 'mb-4'}`} style={{ lineHeight: '1.8', whiteSpace: 'pre-wrap' }}>
                    {para}
                  </p>
                ))
              ) : (
                <>
                  <p className="text-secondary fs-5 mb-4" style={{ lineHeight: '1.8', whiteSpace: 'pre-wrap' }}>
                    MaxGlow was established in 2010 with a dream to bring pure nature into your daily skincare ritual. What began as a vision to connect premium organic ingredients with skin-conscious individuals has blossomed into an extraordinary journey.
                  </p>
                  <p className="text-secondary fs-5 mb-5" style={{ lineHeight: '1.8', whiteSpace: 'pre-wrap' }}>
                    Today, MaxGlow stands as a beloved skincare sensation, touching lives nationwide through trusted B2B and B2C connections. From our 2010 beginnings to a nationwide household name, our commitment remains unchanged: delivering effective, nurturing skincare that lets your natural glow shine daily.
                  </p>
                </>
              )}
              
              <div className="d-flex align-items-center gap-5 justify-content-center justify-content-lg-start">
                <div className="d-flex align-items-center gap-3">
                  <div className="rounded-circle d-flex align-items-center justify-content-center text-white shadow-sm" style={{ width: '50px', height: '50px', backgroundColor: '#1c72b9' }}>
                    <i className="fas fa-check fs-5"></i>
                  </div>
                  <div className="text-start">
                    <h5 className="mb-1 fw-bold text-dark">100% Natural</h5>
                    <span className="text-muted">No Preservatives</span>
                  </div>
                </div>
                <div className="d-flex align-items-center gap-3">
                  <div className="rounded-circle d-flex align-items-center justify-content-center text-white shadow-sm" style={{ width: '50px', height: '50px', backgroundColor: '#10b981' }}>
                    <i className="fas fa-leaf fs-5"></i>
                  </div>
                  <div className="text-start">
                    <h5 className="mb-1 fw-bold text-dark">Farm Fresh</h5>
                    <span className="text-muted">Sourced Locally</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us using MgCard */}
      <section className="py-5" style={{ backgroundColor: '#f8fafc' }}>
        <div className="container py-5">
          <div className="text-center mb-5 pb-3">
            <span className="d-inline-block px-4 py-2 rounded-pill mb-3 fw-bold shadow-sm" style={{ backgroundColor: '#fff', color: '#10b981', fontSize: '0.9rem', letterSpacing: '1px' }}>
              WHY CHOOSE MAXGLOW
            </span>
            <h2 className="display-5 fw-bold text-dark">The MaxGlow Advantage</h2>
          </div>
          
          <div className="row g-4 justify-content-center">
            <div className="col-lg-3 col-md-6">
              <MgCard className="text-center h-100 p-4">
                <div className="mx-auto mb-4 d-flex justify-content-center align-items-center rounded-circle" style={{ width: '80px', height: '80px', backgroundColor: '#f0fdf4' }}>
                  <Image src="/icon_organic.jpg" alt="Organic" width={48} height={48} style={{ width: '48px', height: 'auto', objectFit: 'contain', mixBlendMode: 'multiply' }} />
                </div>
                <h4 className="fw-bold mb-3 text-dark">Organic infusion</h4>
                <p className="text-secondary mb-0" style={{ fontSize: '1.05rem', lineHeight: '1.6' }}>Carefully formulated using organic botanical extracts.</p>
              </MgCard>
            </div>
            <div className="col-lg-3 col-md-6">
              <MgCard className="text-center h-100 p-4">
                <div className="mx-auto mb-4 d-flex justify-content-center align-items-center rounded-circle" style={{ width: '80px', height: '80px', backgroundColor: '#fff1f2' }}>
                  <Image src="/icon_cruelty_free.jpg" alt="Cruelty Free" width={48} height={48} style={{ width: '48px', height: 'auto', objectFit: 'contain', mixBlendMode: 'multiply' }} />
                </div>
                <h4 className="fw-bold mb-3 text-dark">Cruelty Free</h4>
                <p className="text-secondary mb-0" style={{ fontSize: '1.05rem', lineHeight: '1.6' }}>Ethically formulated and never tested on animals.</p>
              </MgCard>
            </div>
            <div className="col-lg-3 col-md-6">
              <MgCard className="text-center h-100 p-4">
                <div className="mx-auto mb-4 d-flex justify-content-center align-items-center rounded-circle" style={{ width: '80px', height: '80px', backgroundColor: '#fdf4ff' }}>
                  <Image src="/icon_toxin_free.jpg" alt="Toxin Free" width={48} height={48} style={{ width: '48px', height: 'auto', objectFit: 'contain', mixBlendMode: 'multiply' }} />
                </div>
                <h4 className="fw-bold mb-3 text-dark">Toxin Free</h4>
                <p className="text-secondary mb-0" style={{ fontSize: '1.05rem', lineHeight: '1.6' }}>Free of harmful artificial chemicals.</p>
              </MgCard>
            </div>
            <div className="col-lg-3 col-md-6">
              <MgCard className="text-center h-100 p-4">
                <div className="mx-auto mb-4 d-flex justify-content-center align-items-center rounded-circle" style={{ width: '80px', height: '80px', backgroundColor: '#e0f2fe' }}>
                  <Image src="/icon_tested.jpg" alt="Tested" width={48} height={48} style={{ width: '48px', height: 'auto', objectFit: 'contain', mixBlendMode: 'multiply' }} />
                </div>
                <h4 className="fw-bold mb-3 text-dark">Dermatologically Tested</h4>
                <p className="text-secondary mb-0" style={{ fontSize: '1.05rem', lineHeight: '1.6' }}>Clinically tested to be safe and gentle on your skin.</p>
              </MgCard>
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision Section */}
      <section className="py-5 my-md-5 bg-white">
        <div className="container py-4">
          <div className="row align-items-center mb-5 pb-5">
            <div className="col-lg-6 order-lg-2 mb-4 mb-lg-0">
              <Image src={content?.mission?.image ? getImageUrl(content.mission.image) : "/mg-offer1.jpg"} alt="Our Mission" width={800} height={600} style={{ width: '100%', height: 'auto', objectFit: 'cover' }} className="img-fluid rounded-5 shadow-lg" />
            </div>
            <div className="col-lg-6 order-lg-1 pe-lg-5 text-center text-lg-start">
              <span className="d-inline-block px-4 py-2 rounded-pill mb-3 fw-bold shadow-sm" style={{ backgroundColor: '#fff7ed', color: '#ea580c', fontSize: '0.9rem', letterSpacing: '1px' }}>
                {content?.mission?.tagline || 'OUR JOURNEY'}
              </span>
              <h2 className="display-6 fw-bold mb-4 text-dark">{content?.mission?.heading || "Started as B2B, now B2C also"}</h2>
              
              {content?.mission?.paragraphs && content.mission.paragraphs.length > 0 ? (
                content.mission.paragraphs.map((para, idx) => (
                  <p key={`mission-para-${idx}`} className={`text-secondary fs-5 ${idx === content.mission.paragraphs.length - 1 ? 'mb-0' : 'mb-3'}`} style={{ lineHeight: '1.8', whiteSpace: 'pre-wrap' }}>
                    {para}
                  </p>
                ))
              ) : (
                <p className="text-secondary fs-5 mb-0" style={{ lineHeight: '1.8', whiteSpace: 'pre-wrap' }}>
                  MaxGlow started out as a trusted B2B partner for parlours & salons initially before expanding its B2C journey directly to skincare lovers everywhere. Today, MaxGlow stands as a beloved household name across India, bringing the pure, natural extracts of organic botanical ingredients straight to your daily ritual for healthy skin.
                </p>
              )}
            </div>
          </div>
          
          <div className="row align-items-center pt-5">
            <div className="col-lg-6 mb-4 mb-lg-0">
              <Image src={content?.vision?.image ? getImageUrl(content.vision.image) : "/mg-offer2.jpg"} alt="Our Vision" width={800} height={600} style={{ width: '100%', height: 'auto', objectFit: 'cover' }} className="img-fluid rounded-5 shadow-lg" />
            </div>
            <div className="col-lg-6 ps-lg-5 text-center text-lg-start">
              <span className="d-inline-block px-4 py-2 rounded-pill mb-3 fw-bold shadow-sm" style={{ backgroundColor: '#f5f3ff', color: '#7c3aed', fontSize: '0.9rem', letterSpacing: '1px' }}>
                {content?.vision?.tagline || 'OUR VISION'}
              </span>
              <h2 className="display-6 fw-bold mb-4 text-dark">{content?.vision?.heading || "Redefining the Future of Organic Beauty"}</h2>
              
              {content?.vision?.paragraphs && content.vision.paragraphs.length > 0 ? (
                content.vision.paragraphs.map((para, idx) => (
                  <p key={`vision-para-${idx}`} className={`text-secondary fs-5 ${idx === content.vision.paragraphs.length - 1 ? 'mb-4' : 'mb-3'}`} style={{ lineHeight: '1.8', whiteSpace: 'pre-wrap' }}>
                    {para}
                  </p>
                ))
              ) : (
                <p className="text-secondary fs-5 mb-4" style={{ lineHeight: '1.8', whiteSpace: 'pre-wrap' }}>
                  We envision a world where luxury skincare is intrinsically linked with planetary well-being. Our goal is to pioneer the most innovative, sustainable, and 100% organic wellness brand in the industry, inspiring millions to embrace their natural glow while safeguarding the environment for future generations.
                </p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-5" style={{ backgroundColor: '#f8fafc' }}>
        <div className="container py-4" style={{ maxWidth: '900px' }}>
          <div className="text-center mb-5">
            <h2 className="display-6 fw-bold text-dark">Frequently Asked Questions</h2>
            <p className="text-muted fs-5">Everything you need to know about MaxGlow.</p>
          </div>
          <div className="accordion" id="faqAccordion">
            <div className="accordion-item border-0 shadow-sm rounded-4 mb-3 overflow-hidden">
              <h2 className="accordion-header" id="headingOne">
                <button className="accordion-button fw-bold fs-5 p-4 bg-white text-dark" type="button" data-bs-toggle="collapse" data-bs-target="#collapseOne" aria-expanded="true" aria-controls="collapseOne" style={{ boxShadow: 'none' }}>
                  1. Are MaxGlow products safe for sensitive skin types?
                </button>
              </h2>
              <div id="collapseOne" className="accordion-collapse collapse show" aria-labelledby="headingOne">
                <div className="accordion-body p-4 text-dark fs-5">
                  Yes, all MaxGlow formulations are dermatologically tested and carefully crafted to be gentle for all skin types, including sensitive skin.
                </div>
              </div>
            </div>
            
            <div className="accordion-item border-0 shadow-sm rounded-4 mb-3 overflow-hidden">
              <h2 className="accordion-header" id="headingTwo">
                <button className="accordion-button collapsed fw-bold fs-5 p-4 bg-white text-dark" type="button" data-bs-toggle="collapse" data-bs-target="#collapseTwo" aria-expanded="false" aria-controls="collapseTwo" style={{ boxShadow: 'none' }}>
                  2. Can I combine multiple MaxGlow products in one routine?
                </button>
              </h2>
              <div id="collapseTwo" className="accordion-collapse collapse" aria-labelledby="headingTwo">
                <div className="accordion-body p-4 text-dark fs-5">
                  Yes, our entire collection is thoughtfully designed to complement one another.
                </div>
              </div>
            </div>

            <div className="accordion-item border-0 shadow-sm rounded-4 mb-3 overflow-hidden">
              <h2 className="accordion-header" id="headingThree">
                <button className="accordion-button collapsed fw-bold fs-5 p-4 bg-white text-dark" type="button" data-bs-toggle="collapse" data-bs-target="#collapseThree" aria-expanded="false" aria-controls="collapseThree" style={{ boxShadow: 'none' }}>
                  3. Are MaxGlow products suitable for both men and women?
                </button>
              </h2>
              <div id="collapseThree" className="accordion-collapse collapse" aria-labelledby="headingThree">
                <div className="accordion-body p-4 text-dark fs-5">
                  Yes, our skincare ranges are universally formulated to nourish healthy skin for all individuals, regardless of gender.
                </div>
              </div>
            </div>

            <div className="accordion-item border-0 shadow-sm rounded-4 mb-3 overflow-hidden">
              <h2 className="accordion-header" id="headingFour">
                <button className="accordion-button collapsed fw-bold fs-5 p-4 bg-white text-dark" type="button" data-bs-toggle="collapse" data-bs-target="#collapseFour" aria-expanded="false" aria-controls="collapseFour" style={{ boxShadow: 'none' }}>
                  4. Are MaxGlow products cruelty-free?
                </button>
              </h2>
              <div id="collapseFour" className="accordion-collapse collapse" aria-labelledby="headingFour">
                <div className="accordion-body p-4 text-dark fs-5">
                  Yes, we love our furry friends. Every MaxGlow product is ethically formulated and never tested on animals.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
