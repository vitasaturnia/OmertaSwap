import React, { useState } from 'react';

const faqData = [
  {
    question: "What is cryptocurrency?",
    answer: "Cryptocurrency is a digital or virtual form of currency that uses cryptography for security and operates on decentralized networks."
  },
  {
    question: "How can I swap cryptocurrencies anonymously?",
    answer: "You can swap cryptocurrencies anonymously by using our platform, which does not require personal information. We use advanced encryption to ensure your privacy."
  },
  {
    question: "Which cryptocurrencies are supported?",
    answer: "We support a wide range of cryptocurrencies including Bitcoin, Ethereum, Monero, and many others. Check our exchange page for the full list of supported coins."
  },
  {
    question: "Are there any swap limits?",
    answer: "While we don't have a minimum swap amount, there may be maximum limits for certain pairs due to liquidity constraints. These are displayed in real-time when you initiate a swap."
  },
  // Add more FAQ items as needed
];

const Faq = () => {
  const [activeIndex, setActiveIndex] = useState(null);

  const toggleAccordion = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <section className="faq-section">
      <div className="container">
        <h1 className="title">Frequently Asked Questions</h1>
        <div className="accordion">
          {faqData.map((item, index) => (
            <div 
              key={index} 
              className={`accordion-item ${activeIndex === index ? 'active' : ''}`}
            >
              <div 
                className="accordion-header"
                onClick={() => toggleAccordion(index)}
              >
                <p>{item.question}</p>
                <span className="icon">
                  <i className="fas fa-chevron-down"></i>
                </span>
              </div>
              <div className="accordion-body">
                <p>{item.answer}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Faq;