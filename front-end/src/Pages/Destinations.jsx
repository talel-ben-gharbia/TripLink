import React, { useEffect, useState } from 'react';
import Navbar from '../Component/Navbar';
import DestinationSection from '../Component/DestinationSection';
import AuthModal from '../Component/AuthModal';
import Footer from '../Component/Footer';

const Destinations = () => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handler = () => setIsOpen(true);
    window.addEventListener('open-auth-modal', handler);
    return () => window.removeEventListener('open-auth-modal', handler);
  }, []);

  return (
    <div className="min-h-screen page-bg flex flex-col">
      <Navbar openAuth={() => setIsOpen(true)} />
      <AuthModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
      <div className="flex-1">
        <DestinationSection mode="browse" />
      </div>
      <Footer />
    </div>
  );
};

export default Destinations;