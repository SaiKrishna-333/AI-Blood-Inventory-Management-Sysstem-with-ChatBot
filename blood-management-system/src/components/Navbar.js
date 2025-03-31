import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth, ROLES } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="bg-black text-white shadow-lg border-b border-red-600">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <span className="text-red-600 text-2xl font-bold">Blood</span>
              <span className="text-white text-2xl font-bold">Bank</span>
            </Link>
          </div>
          <div className="flex space-x-4">
            {!user && (
              <>
                <Link to="/" className="text-white hover:text-red-500 px-3 py-2 rounded-md text-sm font-medium">
                  Home
                </Link>
                <Link to="/login" className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium">
                  Login
                </Link>
              </>
            )}

            {user && user.role === ROLES.USER && (
              <>
                <Link to="/dashboard" className="text-white hover:text-red-500 px-3 py-2 rounded-md text-sm font-medium">
                  Dashboard
                </Link>
                <Link to="/donate" className="text-white hover:text-red-500 px-3 py-2 rounded-md text-sm font-medium">
                  Donate Blood
                </Link>
                <Link to="/request" className="text-white hover:text-red-500 px-3 py-2 rounded-md text-sm font-medium">
                  Request Blood
                </Link>
              </>
            )}

            {user && user.role === ROLES.HOSPITAL && (
              <Link to="/hospital" className="text-white hover:text-red-500 px-3 py-2 rounded-md text-sm font-medium">
                Hospital Dashboard
              </Link>
            )}

            {user && (
              <div className="flex items-center space-x-4">
                <span className="text-white text-sm">
                  Welcome, {user.name}
                </span>
                <button
                  onClick={handleLogout}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
