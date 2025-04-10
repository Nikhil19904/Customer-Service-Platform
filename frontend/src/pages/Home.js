import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  const heroRef = useRef(null);
  
  useEffect(() => {
    // Animate hero section on load
    if (heroRef.current) {
      heroRef.current.classList.add('animate-hero');
    }

    // Observer for card animations on scroll
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('card-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.3 }
    );

    // Observe all cards
    const cards = document.querySelectorAll('.animate-card');
    cards.forEach((card) => {
      observer.observe(card);
    });

    return () => {
      cards.forEach((card) => {
        observer.unobserve(card);
      });
    };
  }, []);

  return (
    <div className="home-container">
      {/* Hero Section */}
      <div className="hero-section" ref={heroRef}>
        <div className="hero-content text-center">
          <h1 className="hero-title">Welcome to the <span className="text-highlight">Customer Service Platform</span></h1>
          <p className="hero-subtitle">
            Get assistance with product features, pricing, and implementation requests
          </p>
          <div className="hero-divider">
            <span className="divider-dot"></span>
            <span className="divider-line"></span>
            <span className="divider-dot"></span>
          </div>
          <p className="hero-text">
            Our platform enables seamless customer service interactions through Google authentication and Intercom integration.
          </p>
          <Link className="btn-hero-cta" to="/login" role="button">
            <span className="btn-text">Get Started</span>
            <i className="bi bi-arrow-right-circle ms-2"></i>
          </Link>
        </div>
        <div className="hero-shapes">
          <div className="shape shape-1"></div>
          <div className="shape shape-2"></div>
          <div className="shape shape-3"></div>
        </div>
      </div>

      {/* Features Section */}
      <div className="section-title text-center">
        <h2>Our Services</h2>
        <p>Choose the service you need assistance with</p>
      </div>

      <div className="features-grid">
        <div className="feature-card animate-card">
          <div className="icon-container">
            <i className="bi bi-question-circle"></i>
          </div>
          <h3>General Queries</h3>
          <p>
            Have a general question about our services? Submit a request and get answers quickly.
          </p>
          <Link to="/login" className="feature-link">
            <span>Submit Query</span>
            <i className="bi bi-chevron-right"></i>
          </Link>
        </div>

        <div className="feature-card animate-card">
          <div className="icon-container">
            <i className="bi bi-gear"></i>
          </div>
          <h3>Product Features</h3>
          <p>
            Learn more about specific features and how they can benefit your workflow.
          </p>
          <Link to="/login" className="feature-link">
            <span>Explore Features</span>
            <i className="bi bi-chevron-right"></i>
          </Link>
        </div>

        <div className="feature-card animate-card">
          <div className="icon-container">
            <i className="bi bi-cash-coin"></i>
          </div>
          <h3>Pricing Queries</h3>
          <p>
            Get information about our pricing plans and find the best option for your needs.
          </p>
          <Link to="/login" className="feature-link">
            <span>Check Pricing</span>
            <i className="bi bi-chevron-right"></i>
          </Link>
        </div>

        <div className="feature-card animate-card">
          <div className="icon-container">
            <i className="bi bi-tools"></i>
          </div>
          <h3>Implementation Requests</h3>
          <p>
            Request specific feature implementations or integrations for your organization.
          </p>
          <Link to="/login" className="feature-link">
            <span>Request Implementation</span>
            <i className="bi bi-chevron-right"></i>
          </Link>
        </div>
      </div>

      {/* Call to Action */}
      <div className="cta-section animate-card">
        <div className="cta-content">
          <h2>Ready to get started?</h2>
          <p>Sign in to access our customer service platform and submit your requests</p>
          <Link to="/login" className="btn-cta">
            <i className="bi bi-box-arrow-in-right me-2"></i>
            Sign In Now
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Home; 