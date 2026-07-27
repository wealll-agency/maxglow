import Link from 'next/link';
import Image from 'next/image';

import React from 'react';

export default function BlogPage() {
  return (
    <>
      <div className="marquee-wrapper">
        <marquee behavior="scroll" direction="left" scrollamount="5">
          || 🥜 Sweettree Anmol Jumbo Nuts - Extra 10% OFF! 🥜 || 🎁 Nuts For Savings 🎁 || 🔥 PayDay Sale Is LIVE - Extra 15% OFF Sitewide! 🔥 ||
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
                            <h6 className="mb-0 fw-bold blog-meta-bold">Dried Apricots Benefits <i className="fas fa-file-alt blog-meta-icon"></i></h6>
                            <span className="blog-meta-date">Sweettree <i className="fas fa-file-alt blog-meta-icon"></i></span>
                          </div>
                          <i className="fas fa-share blog-meta-share"></i>
                        </div>
                      </div>
                      <hr className="blog-hr" />
                      <h4 className="blog-heading">How Can Dried Apricots Fit into a Healthy Lifestyle?</h4>
                      <p className="blog-excerpt">Living a healthy lifestyle does not always require big changes. In most cases, it starts with small and consistent habits, especially when it comes to food. Today, people are looking for simple, natural and convenient...</p>
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
                            <h6 className="mb-0 fw-bold blog-meta-bold text-muted fw-normal">Sweettree <i className="fas fa-file-alt blog-meta-icon"></i></h6>
                            <span className="blog-meta-date">Sweettree Blog <i className="fas fa-file-alt blog-meta-icon"></i></span>
                          </div>
                          <i className="fas fa-share blog-meta-share"></i>
                        </div>
                      </div>
                      <hr className="blog-hr" />
                      <h4 className="blog-heading">Why Are Prunes Often Recommended for Digestive Wellness?</h4>
                      <p className="blog-excerpt">Digestive health is becoming a growing concern worldwide. Studies suggest that many adults experience digestive issues like constipation, bloating or irregular bowel movements at some point in...</p>
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
                            <h6 className="mb-0 fw-bold blog-meta-bold text-muted fw-normal">Sweettree <i className="fas fa-file-alt blog-meta-icon"></i></h6>
                            <span className="blog-meta-date">Sweettree Blog <i className="fas fa-file-alt blog-meta-icon"></i></span>
                          </div>
                          <i className="fas fa-share blog-meta-share"></i>
                        </div>
                      </div>
                      <hr className="blog-hr" />
                      <h4 className="blog-heading">Which Snacks Provide Energy Without Causing Heaviness or Sluggishness?</h4>
                      <p className="blog-excerpt">Choosing the right snack can make a big difference in how you feel throughout the day. While many snacks give quick satisfaction, they often leave you feeling...</p>
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
                      <h4 className="blog-heading">What Makes Sweettree Dry Fruits a Preferred Choice for Quality-Conscious Buyers?</h4>
                      <p className="blog-excerpt">In today's food industry, quality is no longer optional, it is expected. Consumers and businesses are becoming more aware of what they eat and use in their...</p>
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
                      <a href="#" className="blog-tag-pill">Ajwa Dates</a>
                      <a href="#" className="blog-tag-pill">Almond Recipes</a>
                      <a href="#" className="blog-tag-pill">Cardamom Recipes</a>
                      <a href="#" className="blog-tag-pill">Cashew Recipes</a>
                      <a href="#" className="blog-tag-pill">Chia Recipes</a>
                      <a href="#" className="blog-tag-pill">Chia Seeds</a>
                      <a href="#" className="blog-tag-pill">Clove Benefits</a>
                      <a href="#" className="blog-tag-pill">Cloves</a>
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
