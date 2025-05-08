// src/components/Layout.js
import React from 'react';
import Navbar from './Navbar.js';
import Footer from './Footer';
import "../assets/all.sass"

const Layout = ({ children }) => {
    return (
        <div>
            <Navbar />
           {children}
            <Footer />
        </div>
    );
};

export default Layout;
