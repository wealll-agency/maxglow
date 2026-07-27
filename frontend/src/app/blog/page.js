import Link from 'next/link';
import Image from 'next/image';

import React from 'react';

export default function BlogPage() {
  return (
    <>
      <div className="marquee-wrapper">
        <marquee behavior="scroll" direction="left" scrollamount="5">
          || 🌿 MaxGlow Premium Skin & Hair Care - Extra 10% OFF! 🌿 || 🎁 Gift of Herbal Glow 🎁 || 🔥 PayDay Sale Is LIVE - Extra 15% OFF Sitewide! 🔥 ||
        </marquee>
      </div>

      {/* Blog Archive Section */}
      <section className="blog-archive-section py-5 bg-white">
        <div className="container pt-3 pb-2">
          <div className="row g-4">
            {/* Main Blog Content Region (Left Sidebar) */}
            <div className="col-lg-8">
              <div className="row g-4">
                {/* Blog 1 */}
                <div className="col-md-6">
                  <div className="blog-card mb-0">
                    <Image src="/blog_image3.png" alt="Blog 1" width={800} height={400} style={{ width: '100%', height: 'auto' }} className="blog-img" />
                    <div className="blog-content-box">
                      <div className="d-flex justify-content-between align-items-center mb-0">
                        <div className="d-flex align-items-center">
                          <div className="logo-circle-mini">
                            <Image src="/logo.png" alt="MaxGlow Logo" width={40} height={40} style={{ width: '100%', height: 'auto' }} />
                          </div>
                          <div className="text-start ms-2">
                            <h6 className="mb-0 fw-bold blog-meta-bold">Admin</h6>
                            <span className="blog-meta-date">Apr 07, 2026</span>
                          </div>
                        </div>
                        <div className="d-flex align-items-center">
                          <div className="text-end me-2">
                            <h6 className="mb-0 fw-bold blog-meta-bold">Organic Facial Cleanser <i className="fas fa-file-alt blog-meta-icon"></i></h6>
                            <span className="blog-meta-date">MaxGlow <i className="fas fa-file-alt blog-meta-icon"></i></span>
                          </div>
                          <i className="fas fa-share blog-meta-share"></i>
                        </div>
                      </div>
                      <hr className="blog-hr" />
                      <h4 className="blog-heading">How Can Organic Face Cleansers Improve Your Skin Glow?</h4>
                      <p className="blog-excerpt">Achieving a radiant, healthy complexion does not require complex procedures. In most cases, it starts with choosing natural, organic face cleansers that nurture and hydrate your skin layers without harsh chemicals...</p>
                      <Link href="/blog-details" className="blog-read-more">Read More...</Link>
                    </div>
                  </div>
                </div>

                {/* Blog 2 */}
                <div className="col-md-6">
                  <div className="blog-card mb-0">
                    <Image src="/blog_image2.png" alt="Blog 2" width={800} height={400} style={{ width: '100%', height: 'auto' }} className="blog-img" />
                    <div className="blog-content-box">
                      <div className="d-flex justify-content-between align-items-center mb-0">
                        <div className="d-flex align-items-center">
                          <div className="logo-circle-mini">
                            <Image src="/logo.png" alt="MaxGlow Logo" width={40} height={40} style={{ width: '100%', height: 'auto' }} />
                          </div>
                          <div className="text-start ms-2">
                            <h6 className="mb-0 fw-bold blog-meta-bold">Admin</h6>
                            <span className="blog-meta-date">Apr 05, 2026</span>
                          </div>
                        </div>
                        <div className="d-flex align-items-center">
                          <div className="text-end me-2">
                            <h6 className="mb-0 fw-bold blog-meta-bold text-muted fw-normal">MaxGlow <i className="fas fa-file-alt blog-meta-icon"></i></h6>
                            <span className="blog-meta-date">MaxGlow Blog <i className="fas fa-file-alt blog-meta-icon"></i></span>
                          </div>
                          <i className="fas fa-share blog-meta-share"></i>
                        </div>
                      </div>
                      <hr className="blog-hr" />
                      <h4 className="blog-heading">Why Is Rosehip Seed Oil Highly Recommended for Anti-Aging?</h4>
                      <p className="blog-excerpt">Skin regeneration and elasticity are key priorities in modern skincare. Clinical studies suggest that botanical extracts like Rosehip oil help fade dark spots, smooth fine wrinkles, and restore moisture...</p>
                      <Link href="/blog-details" className="blog-read-more">Read More...</Link>
                    </div>
                  </div>
                </div>

                {/* Blog 3 */}
                <div className="col-md-6">
                  <div className="blog-card mb-0">
                    <Image src="/blog_image3.png" alt="Blog 3" width={800} height={400} style={{ width: '100%', height: 'auto' }} className="blog-img" />
                    <div className="blog-content-box">
                      <div className="d-flex justify-content-between align-items-center mb-0">
                        <div className="d-flex align-items-center">
                          <div className="logo-circle-mini">
                            <Image src="/logo.png" alt="MaxGlow Logo" width={40} height={40} style={{ width: '100%', height: 'auto' }} />
                          </div>
                          <div className="text-start ms-2">
                            <h6 className="mb-0 fw-bold blog-meta-bold">Admin</h6>
                            <span className="blog-meta-date">Apr 03, 2026</span>
                          </div>
                        </div>
                        <div className="d-flex align-items-center">
                          <div className="text-end me-2">
                            <h6 className="mb-0 fw-bold blog-meta-bold text-muted fw-normal text-start">Healthy Living <i className="fas fa-file-alt blog-meta-icon"></i></h6>
                          </div>
                          <i className="fas fa-share blog-meta-share"></i>
                        </div>
                      </div>
                      <hr className="blog-hr" />
                      <h4 className="blog-heading">What Makes MaxGlow Cosmetics the Preferred Choice for Sensitive Skin?</h4>
                      <p className="blog-excerpt">In the beauty and wellness industry, quality and purity are of paramount importance. Conscious consumers are seeking clean, allergen-free skincare products that align with their healthy lifestyle...</p>
                      <Link href="/blog-details" className="blog-read-more">Read More...</Link>
                    </div>
                  </div>
                </div>

                {/* Blog 4 */}
                <div className="col-md-6">
                  <div className="blog-card mb-0">
                    <Image src="/blog_image1.png" alt="Blog 4" width={800} height={400} style={{ width: '100%', height: 'auto' }} className="blog-img" />
                    <div className="blog-content-box">
                      <div className="d-flex justify-content-between align-items-center mb-0">
                        <div className="d-flex align-items-center">
                          <div className="logo-circle-mini">
                            <Image src="/logo.png" alt="MaxGlow Logo" width={40} height={40} style={{ width: '100%', height: 'auto' }} />
                          </div>
                          <div className="text-start ms-2">
                            <h6 className="mb-0 fw-bold blog-meta-bold">Admin</h6>
                            <span className="blog-meta-date">Apr 03, 2026</span>
                          </div>
                        </div>
                        <div className="d-flex align-items-center">
                          <div className="text-end me-2">
                            <h6 className="mb-0 fw-bold blog-meta-bold text-muted fw-normal">Healthy Living <i className="fas fa-file-alt blog-meta-icon"></i></h6>
                          </div>
                          <i className="fas fa-share blog-meta-share"></i>
                        </div>
                      </div>
                      <hr className="blog-hr" />
                      <h4 className="blog-heading">What Makes MaxGlow Cosmetics a Preferred Choice for Quality-Conscious Buyers?</h4>
                      <p className="blog-excerpt">In today's beauty industry, quality is no longer optional, it is expected. Consumers and businesses are becoming more aware of what they apply to their skin...</p>
                      <Link href="/blog-details" className="blog-read-more">Read More...</Link>
                    </div>
                  </div>
                </div>
              </div>

              {/* Pagination Section */}
              <div className="blog-pagination d-flex justify-content-center mt-5">
                <ul className="d-flex list-unstyled gap-4 align-items-center">
                  <li className="active"><a href="#">1</a></li>
                  <li><a href="#">2</a></li>
                  <li><a href="#">3</a></li>
                  <li><span>...</span></li>
                  <li><a href="#">14</a></li>
                  <li><a href="#" className="next">Next &gt;</a></li>
                </ul>
              </div>

            </div>

            {/* Dedicated Right Sidebar Region */}
            <div className="col-lg-4">
              <div className="d-flex flex-column gap-4">
                {/* Promo Banner 1 (Black Banner) */}
                <div className="blog-promo-banner w-100">
                  <Image src="/banner_slider_image1.jpeg" alt="Special Offer" width={400} height={400} style={{ width: '100%', height: 'auto' }} className="img-fluid w-100" />
                </div>

                {/* Promo Banner 2 (Red Banner) */}
                <div className="blog-promo-banner w-100">
                  <Image src="/top_product4.png" alt="Special Offer 2" width={400} height={400} style={{ width: '100%', height: 'auto' }} className="img-fluid w-100" />
                </div>

                {/* Follow Us Section */}
                <div className="blog-widget p-0">
                  <div className="blog-widget-header">
                    <h4 className="blog-widget-title">Follow Us:</h4>
                  </div>
                  <div className="blog-widget-body">
                    <div className="blog-social-icons">
                      <a href="#"><i className="fab fa-facebook-f"></i></a>
                      <a href="#"><i className="fab fa-instagram"></i></a>
                      <a href="#"><i className="fab fa-linkedin-in"></i></a>
                      <a href="#"><i className="fab fa-pinterest-p"></i></a>
                      <a href="#"><i className="fa-brands fa-twitter"></i></a>
                      <a href="#"><i className="fab fa-youtube"></i></a>
                    </div>
                  </div>
                </div>

                {/* TAGS Section */}
                <div className="blog-widget p-0">
                  <div className="blog-widget-header">
                    <h4 className="blog-widget-title">TAGS</h4>
                  </div>
                  <div className="blog-widget-body">
                    <div className="blog-tags-container">
                      <a href="#" className="blog-tag-pill">Face Serums</a>
                      <a href="#" className="blog-tag-pill">Hair Care</a>
                      <a href="#" className="blog-tag-pill">Anti-Aging</a>
                      <a href="#" className="blog-tag-pill">Herbal Cleanse</a>
                      <a href="#" className="blog-tag-pill">Organic Skincare</a>
                      <a href="#" className="blog-tag-pill">Face Oils</a>
                      <a href="#" className="blog-tag-pill">Glowing Skin</a>
                      <a href="#" className="blog-tag-pill">Essential Oils</a>
                    </div>
                  </div>
                </div>

                {/* Newsletter Section */}
                <div className="blog-widget p-0">
                  <div className="blog-widget-header">
                    <h4 className="blog-widget-title">NEWSLETTER</h4>
                  </div>
                  <div className="blog-widget-body">
                    <div className="blog-newsletter-text">DO NOT MISS OUR NEWS</div>
                    <span className="blog-newsletter-sub">Sign up and receive the latest news of our company</span>
                    <form action="#">
                      <input type="email" className="blog-newsletter-input" required />
                      <button type="submit" className="blog-newsletter-btn">SEND</button>
                    </form>
                  </div>
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
            <a href="#" className="search-tag-pill">Brightening Cream</a>
            <a href="#" className="search-tag-pill">Anti-Acne Serum</a>
            <a href="#" className="search-tag-pill">Rose Water Toner</a>
            <a href="#" className="search-tag-pill">Herbal Shampoo</a>
            <a href="#" className="search-tag-pill">Hydrating Lotion</a>
            <a href="#" className="search-tag-pill">Organic Cleanser</a>
            <a href="#" className="search-tag-pill">Vitamin C Serum</a>
          </div>
        </div>
      </section>
    </>
  );
}
