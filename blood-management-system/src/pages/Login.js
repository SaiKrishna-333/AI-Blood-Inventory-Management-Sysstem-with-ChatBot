import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  
  const { login, error } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = await login(formData.email, formData.password);
    if (success) {
      navigate('/dashboard');
    }
  };

  return (
    <div>
      <nav className="nav-container">
        <div className="nav-content">
          <Link to="/" className="nav-brand">BloodBank</Link>
        </div>
      </nav>

      <div className="container">
        <div className="form-container">
          <h2 className="form-title">Welcome Back</h2>
          
          <form onSubmit={handleSubmit}>
            {error && (
              <div className="error-message">{error}</div>
            )}
            
            <div className="form-group">
              <label htmlFor="email" className="form-label">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                className="form-input"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password" className="form-label">
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                className="form-input"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
              Sign In
            </button>

            <div className="text-center mt-4">
              <p style={{ color: 'var(--secondary-light)' }}>
                Don't have an account?{' '}
                <Link to="/register" style={{ color: 'var(--primary-color)', textDecoration: 'none' }}>
                  Register here
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
