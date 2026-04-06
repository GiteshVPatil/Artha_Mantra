import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  const handleLogout = () => {
    logout();
    navigate('/');
    setShowDropdown(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navStyle = {
    backgroundColor: 'white',
    borderBottom: '1px solid #dadce0',
    position: 'sticky',
    top: 0,
    zIndex: 100,
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
  };

  const containerStyle = {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 20px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: '64px'
  };

  const brandStyle = {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#1a73e8',
    textDecoration: 'none',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  };

  const menuStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '32px'
  };

  const linkStyle = {
    textDecoration: 'none',
    color: '#202124',
    fontWeight: '500',
    padding: '8px 0',
    borderBottom: '2px solid transparent',
    transition: 'all 0.2s'
  };

  const activeLinkStyle = {
    ...linkStyle,
    color: '#1a73e8',
    borderBottomColor: '#1a73e8'
  };

  // ✅ NEW: Special style for educator links
  const educatorLinkStyle = {
    ...linkStyle,
    color: '#6200ea',
    fontWeight: '600',
    position: 'relative'
  };

  const activeEducatorLinkStyle = {
    ...educatorLinkStyle,
    borderBottomColor: '#6200ea'
  };

  const userButtonStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '8px 12px',
    borderRadius: '8px',
    transition: 'background-color 0.2s',
    backgroundColor: showDropdown ? '#f8f9fa' : 'transparent'
  };

  const avatarStyle = {
    width: '32px',
    height: '32px',
    backgroundColor: '#1a73e8',
    color: 'white',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '500',
    fontSize: '12px'
  };

  // ✅ NEW: Educator avatar style
  const educatorAvatarStyle = {
    ...avatarStyle,
    backgroundColor: '#6200ea'
  };

  const dropdownStyle = {
    position: 'absolute',
    top: '100%',
    right: 0,
    background: 'white',
    border: '1px solid #dadce0',
    borderRadius: '8px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
    minWidth: '200px',
    zIndex: 1000,
    marginTop: '4px'
  };

  const dropdownItemStyle = {
    display: 'block',
    width: '100%',
    padding: '12px 16px',
    color: '#202124',
    textDecoration: 'none',
    border: 'none',
    background: 'none',
    textAlign: 'left',
    cursor: 'pointer',
    fontSize: '14px',
    transition: 'background-color 0.2s'
  };

  const dividerStyle = {
    height: '1px',
    backgroundColor: '#f1f3f4',
    margin: '4px 0'
  };

  // ✅ NEW: Role badge style
  const roleBadgeStyle = {
    fontSize: '10px',
    backgroundColor: user?.role === 'educator' ? '#6200ea' : '#1a73e8',
    color: 'white',
    padding: '2px 6px',
    borderRadius: '4px',
    marginLeft: '6px',
    fontWeight: '600'
  };

  return (
    <nav style={navStyle}>
      <div style={containerStyle}>
        <div>
          <Link to="/" style={brandStyle}>
            <span style={{ fontSize: '20px' }}>📈</span>
            Artha-Mantra
          </Link>
        </div>

        <div style={menuStyle}>
          {isAuthenticated ? (
            <>
              <Link
                to="/dashboard"
                style={location.pathname === '/dashboard' ? activeLinkStyle : linkStyle}
              >
                Dashboard
              </Link>
              <Link
                to="/news"
                style={location.pathname === '/news' ? activeLinkStyle : linkStyle}
              >
                News
              </Link>
              


              {/* ✅ ROLE-BASED NAVIGATION */}
              {user?.role === 'educator' ? (
                <>
                  {/* Educator-specific links */}
                  <Link
                    to="/educator-dashboard"
                    style={
                      location.pathname === '/educator-dashboard'
                        ? activeEducatorLinkStyle
                        : educatorLinkStyle
                    }
                  >
                    👨‍🏫 Student Analytics
                  </Link>
                  <Link
                    to="/portfolio"
                    style={location.pathname === '/portfolio' ? activeLinkStyle : linkStyle}
                  >
                    My Portfolio
                  </Link>
                </>
              ) : (
                <>
                  {/* Student-specific links */}
                  <Link
                    to="/portfolio"
                    style={location.pathname === '/portfolio' ? activeLinkStyle : linkStyle}
                  >
                    Portfolio
                  </Link>
                  <Link
                    to="/trading"
                    style={location.pathname === '/trading' ? activeLinkStyle : linkStyle}
                  >
                    Trading
                  </Link>
                </>
              )}

              {/* Common links for both roles */}
              <Link
                to="/market"
                style={location.pathname === '/market' ? activeLinkStyle : linkStyle}
              >
                Market
              </Link>
              <Link
                to="/analytics"
                style={location.pathname === '/analytics' ? activeLinkStyle : linkStyle}
              >
                Analytics
              </Link>
              <Link
                to="/about"
                style={location.pathname === '/about' ? activeLinkStyle : linkStyle}
              >
                About
              </Link>
              <div style={{ position: 'relative' }} ref={dropdownRef}>
                <button
                  style={userButtonStyle}
                  onClick={() => setShowDropdown(!showDropdown)}
                  onMouseEnter={(e) => e.target.style.backgroundColor = '#f8f9fa'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = showDropdown ? '#f8f9fa' : 'transparent'}
                >
                  <div style={user?.role === 'educator' ? educatorAvatarStyle : avatarStyle}>
                    {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
                  </div>
                  <span style={{ fontWeight: '500', color: '#202124' }}>
                    {user?.firstName}
                    <span style={roleBadgeStyle}>
                      {user?.role === 'educator' ? '👨‍🏫' : '🎓'}
                    </span>
                  </span>
                  <span style={{ fontSize: '12px', color: '#5f6368' }}>▼</span>
                </button>

                {showDropdown && (
                  <div style={dropdownStyle}>
                    <div style={{ padding: '12px 16px', borderBottom: '1px solid #f1f3f4' }}>
                      <div style={{ fontWeight: '600', fontSize: '14px' }}>
                        {user?.firstName} {user?.lastName}
                      </div>
                      <div style={{ fontSize: '12px', color: '#5f6368' }}>
                        {user?.email}
                      </div>
                      <div style={{
                        fontSize: '11px',
                        color: user?.role === 'educator' ? '#6200ea' : '#1a73e8',
                        fontWeight: '600',
                        marginTop: '4px'
                      }}>
                        {user?.role === 'educator' ? '👨‍🏫 Educator' : '🎓 Student'}
                      </div>
                    </div>

                    <Link
                      to="/profile"
                      style={dropdownItemStyle}
                      onClick={() => setShowDropdown(false)}
                      onMouseEnter={(e) => e.target.style.backgroundColor = '#f8f9fa'}
                      onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                    >
                      👤 Profile Settings
                    </Link>
                    <Link
                      to="/ai-report"
                      style={dropdownItemStyle}
                      onClick={() => setShowDropdown(false)}
                      onMouseEnter={(e) => e.target.style.backgroundColor = '#f8f9fa'}
                      onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                    >
                      🧠 AI Report
                    </Link>
                    <Link
                      to="/notifications"
                      style={dropdownItemStyle}
                      onClick={() => setShowDropdown(false)}
                      onMouseEnter={(e) => e.target.style.backgroundColor = '#f8f9fa'}
                      onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                    >
                      🔔 Notifications
                    </Link>

                    <Link
                      to="/settings"
                      style={dropdownItemStyle}
                      onClick={() => setShowDropdown(false)}
                      onMouseEnter={(e) => e.target.style.backgroundColor = '#f8f9fa'}
                      onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                    >
                      ⚙️ Settings
                    </Link>

                    <Link
                      to="/help"
                      style={dropdownItemStyle}
                      onClick={() => setShowDropdown(false)}
                      onMouseEnter={(e) => e.target.style.backgroundColor = '#f8f9fa'}
                      onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                    >
                      ❓ Help & Support
                    </Link>

                    <div style={dividerStyle}></div>

                    <button
                      onClick={handleLogout}
                      style={{ ...dropdownItemStyle, color: '#d93025' }}
                      onMouseEnter={(e) => e.target.style.backgroundColor = '#fef2f2'}
                      onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                    >
                      🚪 Logout
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link to="/login" style={linkStyle}>
                Login
              </Link>
              <Link to="/register" className="btn btn-primary" style={{
                backgroundColor: '#1a73e8',
                color: 'white',
                padding: '12px 24px',
                borderRadius: '8px',
                textDecoration: 'none',
                fontWeight: '500'
              }}>
                Sign Up
              </Link>
              <Link
                to="/about"
                style={location.pathname === '/about' ? activeLinkStyle : linkStyle}
              >
                About
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
