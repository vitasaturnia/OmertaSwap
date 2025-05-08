import React from 'react';
import ContactComponent from '../components/Contact';
import Layout from "../components/Layout";

const ContactPage = () => {
    return (
        <Layout>
        <div>
            <ContactComponent />
        </div>
        </Layout>
    );
};

export default ContactPage;