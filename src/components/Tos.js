import React from 'react';

const TermsOfService = () => {
  return (
    <section className="tos-section">
      <div className="container">
        <h1 className="title">Terms of Service</h1>
        <div className="content">
          <div className="table-of-contents">
            <h3>Table of Contents</h3>
            <ul>
              <li><a href="#acceptance">1. Acceptance of Terms</a></li>
              <li><a href="#description">2. Description of Service</a></li>
              <li><a href="#eligibility">3. Eligibility</a></li>
              <li><a href="#user-responsibilities">4. User Responsibilities</a></li>
              <li><a href="#privacy">5. Privacy and Anonymity</a></li>
              <li><a href="#risks">6. Risks and Disclaimers</a></li>
              <li><a href="#fees">7. Fees and Payments</a></li>
              <li><a href="#availability">8. Service Availability</a></li>
              <li><a href="#intellectual-property">9. Intellectual Property</a></li>
              <li><a href="#termination">10. Termination</a></li>
              <li><a href="#changes">11. Changes to Terms</a></li>
              <li><a href="#governing-law">12. Governing Law</a></li>
            </ul>
          </div>

          <h2 id="acceptance">1. Acceptance of Terms</h2>
          <p>By accessing and using this cryptocurrency swap service, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our service.</p>

          <h2 id="description">2. Description of Service</h2>
          <p>Our service provides a platform for users to swap various cryptocurrencies anonymously. We do not hold custody of funds and act solely as a facilitator for these transactions.</p>

          <h2 id="eligibility">3. Eligibility</h2>
          <p>To use our service, you must be at least 18 years old and have the legal capacity to enter into a binding agreement. By using our service, you represent and warrant that you meet these eligibility requirements.</p>

          <h2 id="user-responsibilities">4. User Responsibilities</h2>
          <p>Users of our service agree to:</p>
          <ul>
            <li>Provide accurate and complete information when using the service</li>
            <li>Use the service only for legal purposes</li>
            <li>Not attempt to manipulate or exploit the system in any way</li>
            <li>Take full responsibility for their transactions and the management of their private keys</li>
            <li>Comply with all applicable laws and regulations in their jurisdiction</li>
          </ul>

          <h2 id="privacy">5. Privacy and Anonymity</h2>
          <p>While we strive to provide an anonymous service, users should be aware that blockchain transactions are inherently public. We do not collect personal information, but cannot guarantee complete anonymity in all circumstances.</p>

          <h2 id="risks">6. Risks and Disclaimers</h2>
          <p>Cryptocurrency trading involves significant risk. Users acknowledge that:</p>
          <ul>
            <li>Cryptocurrency values can be highly volatile</li>
            <li>Transactions cannot be reversed once initiated</li>
            <li>We are not responsible for any losses incurred through the use of our service</li>
            <li>Users are responsible for ensuring the accuracy of transaction details</li>
            <li>We do not provide financial, investment, legal, or tax advice</li>
          </ul>

          <h2 id="fees">7. Fees and Payments</h2>
          <p>Our fee structure is transparent and competitive. Users agree to pay all applicable fees associated with their transactions. Fees are subject to change, and any changes will be communicated through our platform.</p>

          <h2 id="availability">8. Service Availability</h2>
          <p>We strive to maintain high availability of our service, but do not guarantee uninterrupted access. We reserve the right to suspend or terminate the service at any time for maintenance, security reasons, or any other reason at our sole discretion.</p>

          <h2 id="intellectual-property">9. Intellectual Property</h2>
          <p>All content, designs, and software associated with our service are protected by intellectual property rights. Users may not copy, modify, distribute, or reverse engineer any part of our service without explicit permission.</p>

          <h2 id="termination">10. Termination</h2>
          <p>We reserve the right to terminate or suspend any user's access to our service for any reason, including violation of these Terms of Service, without prior notice or liability.</p>

          <h2 id="changes">11. Changes to Terms</h2>
          <p>We may update these Terms of Service from time to time. Continued use of the service after such changes constitutes acceptance of the new terms. We encourage users to review these terms periodically.</p>

          <h2 id="governing-law">12. Governing Law</h2>
          <p>These Terms of Service shall be governed by and construed in accordance with the laws of [Your Jurisdiction], without regard to its conflict of law provisions.</p>

          <p className="last-updated">Last Updated: August 27, 2024</p>
        </div>
      </div>
    </section>
  );
};

export default TermsOfService;