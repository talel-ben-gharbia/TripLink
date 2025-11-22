import React, { useEffect, useState } from 'react';
import Navbar from '../Component/Navbar';
import DestinationSection from '../Component/DestinationSection';
import AuthModal from '../Component/AuthModal';

const Destinations = () => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handler = () => setIsOpen(true);
    window.addEventListener('open-auth-modal', handler);
    return () => window.removeEventListener('open-auth-modal', handler);
  }, []);

  return (
    <div className="min-h-screen page-bg">
      <Navbar openAuth={() => setIsOpen(true)} />
      <AuthModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
      <DestinationSection mode="browse" />
    </div>
  );
};

export default Destinations;