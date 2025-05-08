import React from 'react';
import { Link } from 'react-router-dom';


const Header = () => {
  return (
    <nav className="navbar is-primary" role="navigation" aria-label="main navigation">
      <div className="navbar-brand">
        <Link to="/" className="navbar-item">
          <h3 className="is-bold">Omerta Swap</h3>
        </Link>

        <button className="navbar-burger" aria-label="menu" aria-expanded="false">
          <span aria-hidden="true"></span>
          <span aria-hidden="true"></span>
          <span aria-hidden="true"></span>
        </button>
      </div>

      <div className="navbar-menu">
        <div className="navbar-start">
          <Link to="/faq" className="navbar-item">F.A.Q</Link>
          <Link to="/tos" className="navbar-item">Terms of service</Link>
          <Link to="/contact" className="navbar-item">Contact</Link>
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

export default Header;