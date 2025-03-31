import React from 'react';
import { Link } from 'react-router-dom';
import ChatBot from '../components/Chatbot';

const Home = () => {
  return (
    <div>
      <nav className="nav-container">
        <div className="nav-content">
          <Link to="/" className="nav-brand">BloodBank</Link>
          <div className="nav-links">
            <Link to="/login" className="nav-link">Login</Link>
          </div>
        </div>
      </nav>

      <section className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">Save Lives</h1>
          <h2 className="hero-subtitle">Donate Blood</h2>
          <p className="hero-text">
            Join our mission to save lives through blood donation. Every drop counts in making a difference.
          </p>
          <Link to="/donate" className="btn btn-primary">
            Donate Now
          </Link>
        </div>
      </section>

      <section className="container">
        <div className="grid grid-cols-3">
          <div className="card">
            <h3 className="text-center mb-4" style={{ color: 'var(--primary-color)', fontSize: '1.25rem', fontWeight: 'bold' }}>
              Easy Registration
            </h3>
            <p style={{ color: 'var(--secondary-light)' }}>
              Quick and simple process to register as a donor or recipient.
            </p>
          </div>
          <div className="card">
            <h3 className="text-center mb-4" style={{ color: 'var(--primary-color)', fontSize: '1.25rem', fontWeight: 'bold' }}>
              Real-time Availability
            </h3>
            <p style={{ color: 'var(--secondary-light)' }}>
              Check blood availability across different blood banks instantly.
            </p>
          </div>
          <div className="card">
            <h3 className="text-center mb-4" style={{ color: 'var(--primary-color)', fontSize: '1.25rem', fontWeight: 'bold' }}>
              Emergency Support
            </h3>
            <p style={{ color: 'var(--secondary-light)' }}>
              24/7 support for emergency blood requirements.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-secondary-900 text-white py-16">
        <div className="page-container">
          <h2 className="text-3xl font-bold text-primary-500 mb-8 text-center">Why Donate Blood?</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="text-center">
              <h3 className="text-xl font-bold text-primary-400 mb-4">Save Lives</h3>
              <p className="text-gray-300">Your donation can help save up to three lives.</p>
            </div>
            <div className="text-center">
              <h3 className="text-xl font-bold text-primary-400 mb-4">Regular Need</h3>
              <p className="text-gray-300">Every two seconds someone needs blood.</p>
            </div>
          </div>
        </div>
      </section>

      <ChatBot />

      <footer className="bg-secondary-800 text-white py-8">
        <div className="page-container text-center">
          <p className="text-gray-400"> 2025 BloodBank. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Home;
