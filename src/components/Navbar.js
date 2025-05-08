import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import logo from '../assets/logo.png';

const Navbar = () => {
  const [isActive, setIsActive] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`navbar is-fixed-top ${isScrolled ? 'is-scrolled' : ''}`} role="navigation" aria-label="main navigation">
      <div className="navbar-brand">
        <Link to="/" className="navbar-item">
          <img src={logo} alt="Omerta Swap Logo" style={{ marginRight: '10px', maxHeight: '2.5rem' }} />
          <h3 className="title is-4 has-text-white">Omerta Swap</h3>
        </Link>

        <button 
          className={`navbar-burger ${isActive ? 'is-active' : ''}`}
          onClick={() => setIsActive(!isActive)}
          aria-label="menu"
          aria-expanded={isActive}
        >
          <span aria-hidden="true"></span>
          <span aria-hidden="true"></span>
          <span aria-hidden="true"></span>
        </button>
      </div>

      <div className={`navbar-menu ${isActive ? 'is-active' : ''}`}>
        <div className="navbar-start">
          <Link to="/faq" className="navbar-item has-text-white">F.A.Q</Link>
          <Link to="/tos" className="navbar-item has-text-white">Terms of Service</Link>
          <Link to="/contact" className="navbar-item has-text-white">Contact</Link>
        </div>

        <div className="navbar-end">
          <div className="navbar-item">
            <div className="buttons">
              <Link to="/login" className="button is-light">
                Log in
              </Link>
              <Link to="/signup" className="button is-primary">
                <strong>Sign up</strong>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;