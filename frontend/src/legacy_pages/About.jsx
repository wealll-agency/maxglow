import Link from 'next/link';
import Image from 'next/image';

import React from 'react';

export default function AboutPage() {
  return (
    <>
      <div className="marquee-wrapper">
        <marquee behavior="scroll" direction="left" scrollamount="5">
          || 🧴 MaxGlow Skincare - Glow Up Sale Is LIVE! 🧴 || 🎁 Beauty For Savings 🎁 || 🔥 Sitewide - Extra 15% OFF! 🔥 ||
        </marquee>
      </div>

      {/* Breadcrumb Banner */}
      <section className="breadcrumb-banner position-relative about-hero-banner">
        <div className="position-absolute top-0 start-0 w-100 h-100 about-hero-overlay"></div>
        <div className="container position-relative h-100 d-flex flex-column justify-content-center text-center about-hero-content">
          <h1 className="text-white fw-bold mb-3 about-hero-title">About MaxGlow</h1>
          <nav aria-label="breadcrumb">
            <ol className="breadcrumb justify-content-center mb-0 about-breadcrumb">
              <li className="breadcrumb-item"><Link href="/" className="text-white text-decoration-none">Home</Link></li>
              <li className="breadcrumb-item active text-warning fw-bold" aria-current="page">About Us</li>
            </ol>
          </nav>
        </div>
      </section>

      {/* Our Story Section */}
      <section className="our-story py-5 mt-md-4 mb-md-2">
        <div className="container">
          <div className="row align-items-center gy-5">
            <div className="col-lg-6 position-relative">
              <div className="position-relative about-story-img-wrap">
                <Image src="/banner_slider_image3.jpeg" alt="MaxGlow Store" width={800} height={600} style={{ width: '100%', height: 'auto' }} className="img-fluid rounded-4 shadow-lg w-100 about-story-img" />
              </div>
              <div className="position-absolute rounded-4 d-none d-lg-block about-story-bg-shape"></div>
            </div>
            <div className="col-lg-6 ps-lg-5 text-center text-lg-start mt-5 mt-lg-0">
              <span className="d-inline-block px-3 py-1 rounded-pill mb-3 fw-bold shadow-sm about-story-badge">OUR STORY</span>
              <h2 className="fw-bold mb-4 about-story-title">A Legacy of Premium Skincare & Wellness</h2>
              <p className="text-muted about-story-text">
                At MaxGlow, we believe in delivering nothing but the best to your family. Our journey started with a simple vision: to bridge the gap between premium quality, natural skincare, and health-conscious consumers. Over the years, we have mastered the art of sourcing the most exquisite ingredients from around the world.
              </p>
              <p className="text-muted about-story-text">
                Every product in our collection is carefully formulated, rigorously tested, and meticulously packed to preserve its natural benefits and immense nourishing value. With a deep commitment to excellence, MaxGlow isn't just a brand—it's a promise of purity, tradition, and well-being.
              </p>
              <div className="d-flex align-items-center mt-4 gap-4 justify-content-center justify-content-lg-start">
                <div className="d-flex align-items-center gap-3 text-start">
                  <div className="rounded-circle d-flex align-items-center justify-content-center text-white about-feature-icon-wrapper">
                    <i className="fas fa-check"></i>
                  </div>
                  <div>
                    <h6 className="mb-0 fw-bold about-feature-title">100% Natural</h6>
                    <small className="text-muted about-feature-subtitle">No Preservatives</small>
                  </div>
                </div>
                <div className="d-flex align-items-center gap-3 text-start">
                  <div className="rounded-circle d-flex align-items-center justify-content-center text-white about-feature-icon-wrapper">
                    <i className="fas fa-leaf"></i>
                  </div>
                  <div>
                    <h6 className="mb-0 fw-bold about-feature-title">Farm Fresh</h6>
                    <small className="text-muted about-feature-subtitle">Sourced Locally</small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="why-choose-us py-5" style={{ backgroundColor: '#fcfaf8' }}>
        <div className="container py-4">
          <div className="text-center mb-5">
            <span className="d-inline-block px-3 py-1 rounded-pill mb-2 fw-bold about-advantage-badge">WHY CHOOSE MAXGLOW</span>
            <h2 className="fw-bold about-advantage-title">The MaxGlow Advantage</h2>
          </div>
          <div className="row g-4 justify-content-center">
            <div className="col-lg-3 col-md-6 col-sm-6">
              <div className="card border-0 h-100 text-center p-4 rounded-4 shadow-sm about-advantage-card">
                <div className="mx-auto mb-4 mt-2 about-advantage-icon-box">
                  <Image src="/icon_nutrition.png" alt="Nutrition" width={60} height={60} className="about-advantage-icon" />
                </div>
                <h5 className="fw-bold mb-2 about-advantage-card-title">Nutrient Rich</h5>
                <p className="text-muted mb-0 about-advantage-card-text">Packed with essential vitamins and minerals for a healthier lifestyle.</p>
              </div>
            </div>
            <div className="col-lg-3 col-md-6 col-sm-6">
              <div className="card border-0 h-100 text-center p-4 rounded-4 shadow-sm about-advantage-card">
                <div className="mx-auto mb-4 mt-2 about-advantage-icon-box">
                  <Image src="/icon_heart.png" alt="Heart Healthy" width={60} height={60} className="about-advantage-icon" />
                </div>
                <h5 className="fw-bold mb-2 about-advantage-card-title">Heart Healthy</h5>
                <p className="text-muted mb-0 about-advantage-card-text">Carefully curated selections to promote exceptional cardiovascular wellness.</p>
              </div>
            </div>
            <div className="col-lg-3 col-md-6 col-sm-6">
              <div className="card border-0 h-100 text-center p-4 rounded-4 shadow-sm about-advantage-card">
                <div className="mx-auto mb-4 mt-2 about-advantage-icon-box">
                  <Image src="/icon_gluten.png" alt="Gluten Free" width={60} height={60} className="about-advantage-icon" />
                </div>
                <h5 className="fw-bold mb-2 about-advantage-card-title">Gluten Free</h5>
                <p className="text-muted mb-0 about-advantage-card-text">100% free of gluten, making it perfectly safe for sensitive diets.</p>
              </div>
            </div>
            <div className="col-lg-3 col-md-6 col-sm-6">
              <div className="card border-0 h-100 text-center p-4 rounded-4 shadow-sm about-advantage-card">
                <div className="mx-auto mb-4 mt-2 about-advantage-icon-box">
                  <Image src="/icon_cholesterol.png" alt="Cholesterol Free" width={60} height={60} className="about-advantage-icon" />
                </div>
                <h5 className="fw-bold mb-2 about-advantage-card-title">Cholesterol Free</h5>
                <p className="text-muted mb-0 about-advantage-card-text">Enjoy guilt-free snacking with zero cholesterol natural products.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision Section */}
      <section className="about-mission-section py-5 my-md-2" style={{ backgroundColor: '#fff' }}>
        <div className="container py-3">
          <div className="row align-items-center mb-5 pb-lg-4">
            <div className="col-lg-6 order-lg-2 position-relative mb-4 mb-lg-0">
              <div className="about-mission-img-wrap">
                <Image src="/banner_slider_image1.jpeg" alt="Our Mission" width={800} height={600} style={{ width: '100%', height: 'auto' }} className="img-fluid w-100 about-mission-img" />
              </div>
            </div>
            <div className="col-lg-6 order-lg-1 pe-lg-5 text-center text-lg-start">
              <span className="d-inline-block px-3 py-1 rounded-pill mb-3 fw-bold about-mission-badge">OUR MISSION</span>
              <h2 className="fw-bold mb-3 about-mission-title">Bringing Nature's Best to Your Table</h2>
              <p className="text-muted mb-0 about-mission-text">
                Our mission is to establish a robust and ethical supply chain that empowers local farmers while delivering uncompromised quality dry fruits and nuts globally. We are dedicated to making nutritional excellence and natural flavors seamlessly accessible to households everywhere, ensuring every bite is as wholesome as nature intended.
              </p>
            </div>
          </div>
          <div className="row align-items-center">
            <div className="col-lg-6 position-relative mb-4 mb-lg-0">
              <div className="about-vision-img-wrap">
                <Image src="/banner_slider_image2.jpeg" alt="Our Vision" width={800} height={600} style={{ width: '100%', height: 'auto' }} className="img-fluid w-100 about-vision-img" />
              </div>
            </div>
            <div className="col-lg-6 ps-lg-5 text-center text-lg-start">
              <span className="d-inline-block px-3 py-1 rounded-pill mb-3 fw-bold about-vision-badge">OUR VISION</span>
              <h2 className="fw-bold mb-3 about-mission-title">Redefining Premium Health Snacking</h2>
              <p className="text-muted mb-0 about-mission-text">
                We envision a world where wholesome, natural snacks universally replace artificial and processed alternatives. By continuously innovating and expanding our sustainably sourced offerings, we strive to become the leading symbol of purity, enriching lives and fostering a globally health-conscious community.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Wholesale / CTA Banner */}
      <section className="cta-banner my-5 py-md-3">
        <div className="container">
          <div className="position-relative overflow-hidden rounded-4 shadow-sm text-center text-md-start about-cta-container">
            <Image src="/wholesale-banner.jpg" alt="Wholesale" fill style={{ objectFit: 'cover' }} className="position-absolute about-cta-bg-img" />
            <div className="position-absolute w-100 h-100 about-cta-bg-overlay"></div>
            <div className="position-relative py-5 px-4 px-md-5 d-flex flex-column justify-content-center h-100 about-cta-content">
              <div className="col-md-9 col-lg-7">
                <span className="text-white fw-bold mb-3 d-inline-block px-3 py-1 rounded-pill about-cta-badge">BULK ORDERS & GIFTING</span>
                <h2 className="text-white fw-bold mb-4 about-cta-title">Premium Corporate Gifting & Wholesale Supplies</h2>
                <p className="text-light mb-4 about-cta-text">
                  Looking to enchant your clients or source top-tier quality nuts for your business? We offer flexible bulk solutions, beautifully crafted gift boxes tailored for every occasion, and a seamless B2B sourcing experience.
                </p>
                <div className="d-flex flex-wrap gap-3 mt-2 justify-content-center justify-content-md-start">
                  <a href="#" className="btn fw-bold px-4 py-2 rounded-pill shadow about-cta-btn-primary">Contact Us Today <i className="fas fa-arrow-right ms-2"></i></a>
                  <a href="#" className="btn btn-outline-light fw-bold px-4 py-2 rounded-pill about-cta-btn-outline">Download Catalog <i className="fas fa-file-pdf ms-2"></i></a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="faq-section bg-white pt-3 pb-5">
        <div className="container" style={{ maxWidth: '900px' }}>
          <h2 className="main-title mb-5" style={{ fontWeight: 800, fontSize: '38px' }}>FAQs</h2>
          <div className="accordion custom-accordion" id="faqAccordion">
            <div className="accordion-item">
              <h2 className="accordion-header" id="headingOne">
                <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseOne" aria-expanded="false" aria-controls="collapseOne">
                  1. How many dry fruits to eat in a day?
                </button>
              </h2>
              <div id="collapseOne" className="accordion-collapse collapse show" aria-labelledby="headingOne" data-bs-parent="#faqAccordion">
                <div className="accordion-body">
                  A handful of dry fruits, roughly 30 grams (or about 10-15 mixed nuts and dried fruits), is a healthy daily amount for most individuals.
                </div>
              </div>
            </div>
            {/* Additional FAQs omitted for brevity, adding a few */}
            <div className="accordion-item">
              <h2 className="accordion-header" id="headingTwo">
                <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseTwo" aria-expanded="false" aria-controls="collapseTwo">
                  2. Which dry fruit is best for weight loss?
                </button>
              </h2>
              <div id="collapseTwo" className="accordion-collapse collapse" aria-labelledby="headingTwo" data-bs-parent="#faqAccordion">
                <div className="accordion-body">
                  Almonds, walnuts, and pistachios are excellent for weight loss due to their high fiber and protein content which keeps you full longer.
                </div>
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
