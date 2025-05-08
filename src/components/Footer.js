import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFacebook, faTwitter, faInstagram } from '@fortawesome/free-brands-svg-icons';
import "../assets/all.sass"
const Footer = () => {
  return (
    <footer className="footer is-primary">
      <div className="content has-text-centered">
        <p>
          <strong>My Website</strong> by <a href="https://yourwebsite.com">Your Name</a>. 
        </p>
        <p>
          &copy; {new Date().getFullYear()} My Website. All rights reserved.
        </p>
        <div className="social-icons">
          <a href="https://facebook.com" className="icon is-large">
            <FontAwesomeIcon icon={faFacebook} size="2x" />
          </a>
          <a href="https://twitter.com" className="icon is-large">
            <FontAwesomeIcon icon={faTwitter} size="2x" />
          </a>
          <a href="https://instagram.com" className="icon is-large">
            <FontAwesomeIcon icon={faInstagram} size="2x" />
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
