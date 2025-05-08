import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFacebook, faTwitter, faInstagram, faLinkedin, faTelegram } from '@fortawesome/free-brands-svg-icons';
import { faEnvelope } from '@fortawesome/free-solid-svg-icons';
import { SiSignal } from 'react-icons/si';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-section">
          <h3>About Us</h3>
          <p>
            We offer anonymous crypto to crypto swaps without KYC. Your Privacy is our priority.
          </p>
          <div className="social-icons">
            <a href="https://facebook.com" className="social-icon" aria-label="Facebook">
              <FontAwesomeIcon icon={faFacebook} size="lg" />
            </a>
            <a href="https://twitter.com" className="social-icon" aria-label="Twitter">
              <FontAwesomeIcon icon={faTwitter} size="lg" />
            </a>
            <a href="https://instagram.com" className="social-icon" aria-label="Instagram">
              <FontAwesomeIcon icon={faInstagram} size="lg" />
            </a>
            <a href="https://linkedin.com" className="social-icon" aria-label="LinkedIn">
              <FontAwesomeIcon icon={faLinkedin} size="lg" />
            </a>
          </div>
        </div>

        <div className="footer-section">
          <h3>Quick Links</h3>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            <li><a href="/faq" className="footer-link">F.A.Q</a></li>
            <li><a href="/tos" className="footer-link">Terms of Service</a></li>
            <li><a href="/contact" className="footer-link">Contact</a></li>
          </ul>
        </div>

        <div className="footer-section">
          <h3>Contact Info</h3>
          <p>
            <SiSignal style={{ marginRight: '10px', fontSize: '1.2em', verticalAlign: 'middle' }} />
            @YourSignalUsername
          </p>
          <p>
            <FontAwesomeIcon icon={faTelegram} style={{ marginRight: '10px', fontSize: '1.2em' }} />
            @YourTelegramUsername
          </p>
          <p>
            <FontAwesomeIcon icon={faEnvelope} style={{ marginRight: '10px', fontSize: '1.2em' }} />
            contact@yourwebsite.com
          </p>
        </div>
      </div>

      <div className="footer-bottom">
        <p>
          &copy; {new Date().getFullYear()} Your Website. All rights reserved. | 
          <a href="/tos" className="footer-link"> Terms of Service</a>
        </p>
      </div>
    </footer>
  );
};

export default Footer;
