import React from 'react';
import { Route, Routes } from 'react-router-dom';
import Swap from './pages/swap.js';
import Faq from './pages/faq.js';
import Tos from './pages/tos.js';
import Contact from './pages/contact.js';

import { SwapProvider } from './context/swapContext.js'; 

const AppRoutes = () => {
  return (
    <SwapProvider>
    <Routes>
      <Route exact path="/" element={<Swap />} />
      <Route exact path="/faq" element={<Faq />} />
      <Route exact path="/tos" element={<Tos />} />
      <Route exact path="/contact" element={<Contact />} />

    </Routes>
    </SwapProvider>

  );
};

export default AppRoutes;
