import React from 'react'
import { Link } from 'react-router-dom'
import { Gem, Star, Shield, Truck } from 'lucide-react'

const Home = () => {
  return (
    <div className="home">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <h1 className="hero-title">
            Exquisite Jewelry for Every Occasion
          </h1>
          <p className="hero-subtitle">
            Discover our stunning collection of handcrafted jewelry, perfect for both retail customers and wholesale partners.
          </p>
          <div className="hero-buttons">
            <Link to="/products" className="btn btn-primary">
              Shop Now
            </Link>
            <Link to="/reseller-application" className="btn btn-secondary">
              Become a Partner
            </Link>
          </div>
        </div>
        <div className="hero-image">
          <div className="jewelry-showcase">
            <Gem className="showcase-icon" />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <div className="container">
          <h2 className="section-title">Why Choose Us</h2>
          <div className="features-grid">
            <div className="feature-card">
              <Star className="feature-icon" />
              <h3>Premium Quality</h3>
              <p>Each piece is carefully crafted with the finest materials and attention to detail.</p>
            </div>
            <div className="feature-card">
              <Shield className="feature-icon" />
              <h3>Authentic Guarantee</h3>
              <p>All our jewelry comes with certificates of authenticity and quality assurance.</p>
            </div>
            <div className="feature-card">
              <Truck className="feature-icon" />
              <h3>Fast Delivery</h3>
              <p>Quick and secure delivery to your doorstep with tracking information.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Business Types Section */}
      <section className="business-types">
        <div className="container">
          <h2 className="section-title">Shop Your Way</h2>
          <div className="business-grid">
            <div className="business-card">
              <h3>Retail Shopping (B2C)</h3>
              <p>Browse our collection and shop directly. No account needed - just add to cart and checkout!</p>
              <ul>
                <li>No registration required</li>
                <li>Direct WhatsApp communication</li>
                <li>Instant product catalog sharing</li>
                <li>Flexible payment options</li>
              </ul>
              <Link to="/products" className="btn btn-primary">Start Shopping</Link>
            </div>
            <div className="business-card">
              <h3>Wholesale Partners (B2B)</h3>
              <p>Join our reseller network and access wholesale pricing with minimum quantity requirements.</p>
              <ul>
                <li>Wholesale pricing</li>
                <li>Minimum quantity orders</li>
                <li>Dedicated support</li>
                <li>Priority access to new collections</li>
              </ul>
              <Link to="/reseller-application" className="btn btn-secondary">Apply Now</Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta">
        <div className="container">
          <h2>Ready to Find Your Perfect Piece?</h2>
          <p>Explore our extensive collection of rings, necklaces, earrings, and more.</p>
          <Link to="/products" className="btn btn-primary btn-large">
            View All Products
          </Link>
        </div>
      </section>
    </div>
  )
}

export default Home