import React, { useState } from 'react'
import Navbar from '../Component/Navbar';
import AuthModal from '../Component/AuthModal';

function Home() {
  const [isOpen,setIsOpen] = useState(false)


  return (
    <div className="App">
      <Navbar openAuth={() => setIsOpen(true)} />
      <AuthModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
      
    </div>
  );
}

export default Home
