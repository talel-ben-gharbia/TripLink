import React, { useEffect, useMemo, useState } from 'react';
import { Sparkles, ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';

function Hero({ onStart, showCTA = true }) {
  const images = useMemo(() => ([
    'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1600&q=80', // Paris
    'https://images.unsplash.com/photo-1549693578-d683be217e58?auto=format&fit=crop&w=1600&q=80', // Tokyo
    'https://images.unsplash.com/photo-1516997125298-4e3b7f0036d2?auto=format&fit=crop&w=1600&q=80', // Bali
    'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1600&q=80', // New York
    'https://images.unsplash.com/photo-1526772662000-3f88f10405ff?auto=format&fit=crop&w=1600&q=80', // Dubai
    'https://images.unsplash.com/photo-1544989164-311a6d12df5f?auto=format&fit=crop&w=1600&q=80', // Barcelona
    'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=1600&q=80', // Santorini
    'https://images.unsplash.com/photo-1504593811423-6dd665756598?auto=format&fit=crop&w=1600&q=80', // Maldives
    'https://images.unsplash.com/photo-1470777631079-1e18c5e0dc2d?auto=format&fit=crop&w=1600&q=80', // Swiss Alps
    'https://images.unsplash.com/photo-1465311440660-74f6d35b6a67?auto=format&fit=crop&w=1600&q=80'  // Kyoto
  ]), []);
  const phrases = useMemo(() => ([
    'Beach escapes tailored to you',
    'City adventures with smart tips',
    'Mountain trails and nature paths',
    'Luxury stays made simple',
    'Cultural gems across the globe'
  ]), []);

  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [activeImages, setActiveImages] = useState([]);

  useEffect(() => {
    const t = setInterval(() => {
      const len = (activeImages.length || images.length);
      if (!paused && len > 0) setIndex((i) => (i + 1) % len);
    }, 6000);
    return () => clearInterval(t);
  }, [images.length, activeImages.length, paused]);

  useEffect(() => {
    const t = setInterval(() => {
      setPhraseIndex((p) => (p + 1) % phrases.length);
    }, 3000);
    return () => clearInterval(t);
  }, [phrases.length]);

  useEffect(() => {
    const loaded = [];
    let pending = images.length;
    images.forEach((src) => {
      const img = new Image();
      img.onload = () => { loaded.push(src); if (--pending === 0) { setActiveImages(loaded); setIndex(0); } };
      img.onerror = () => { if (--pending === 0) { setActiveImages(loaded); setIndex(0); } };
      img.src = src;
    });
  }, [images]);

  return (
    <>
    <section className="relative min-h-screen md:min-h-screen pt-24 md:pt-28 pb-28" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      <div className="absolute inset-0 overflow-hidden rounded-none">
        {(activeImages.length ? activeImages : []).map((src, i) => (
          <div
            key={src}
            className={`absolute inset-0 transition-opacity duration-[1500ms] ease-out ${i === index ? 'opacity-100' : 'opacity-0'}`}
            style={{
              backgroundImage: `url(${src})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              filter: 'contrast(0.95) saturate(1.1) brightness(0.9)',
              animation: i === index ? 'kenburns 6000ms linear forwards' : undefined,
              willChange: 'transform'
            }}
          />
        ))}
        {activeImages.length === 0 && (
          <div className="absolute inset-0 bg-gradient-to-br from-purple-700 via-blue-700 to-purple-700" />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-transparent" />
        <div className="absolute -top-20 -left-20 w-80 h-80 rounded-full blur-3xl" style={{ background: 'radial-gradient(closest-side, rgba(124,58,237,0.25), transparent)' }} />
        <div className="absolute -bottom-20 -right-20 w-96 h-96 rounded-full blur-3xl" style={{ background: 'radial-gradient(closest-side, rgba(59,130,246,0.25), transparent)' }} />
      </div>

      <div className="relative w-full text-center flex flex-col items-center justify-center min-h-[70vh]">
        <div className="mb-4 inline-flex items-center px-5 py-2 bg-white/90 shadow-sm rounded-full">
          <Sparkles className="text-purple-600 mr-2" size={18} />
          <span className="text-sm font-medium text-gray-700">Plan your next trip • Smart planning</span>
        </div>
        <h1 className="text-5xl md:text-7xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent">Your Journey, Intelligently Crafted</h1>
        <div key={phraseIndex} className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto text-white font-medium transition-opacity duration-500">
          {phrases[phraseIndex]}
        </div>
        
        {showCTA && (
          <button
            onClick={onStart}
            className="px-10 py-5 bg-gradient-to-r from-purple-600 to-blue-500 text-white rounded-xl hover:opacity-90 transition shadow-2xl flex items-center justify-center space-x-2 font-semibold transform hover:scale-105 text-lg focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2"
          >
            <Sparkles size={20} />
            <span>Start Your AI Journey</span>
          </button>
        )}
        <div className="mt-6 flex items-center justify-center space-x-4">
          <button
            onClick={() => {
              const el = document.getElementById('destinations');
              if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }}
            className="px-6 py-3 rounded-xl border border-white/60 bg-white/10 text-white backdrop-blur-md hover:bg-white/20 transition shadow-lg text-sm font-semibold"
          >
            Explore Destinations
          </button>
        </div>
        
        <div className="absolute left-4 md:left-10 top-1/2 -translate-y-1/2">
          <button
            aria-label="Previous"
            onClick={() => setIndex((i) => (i - 1 + images.length) % images.length)}
            className="w-10 h-10 md:w-12 md:h-12 bg-white/80 backdrop-blur-md rounded-full flex items-center justify-center shadow-lg hover:bg-white focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2"
          >
            <ChevronLeft />
          </button>
        </div>
        <div className="absolute right-4 md:right-10 top-1/2 -translate-y-1/2">
          <button
            aria-label="Next"
            onClick={() => setIndex((i) => (i + 1) % images.length)}
            className="w-10 h-10 md:w-12 md:h-12 bg-white/80 backdrop-blur-md rounded-full flex items-center justify-center shadow-lg hover:bg-white focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2"
          >
            <ChevronRight />
          </button>
        </div>
        <div className="mt-6 flex items-center justify-center space-x-2">
          {images.map((_, i) => (
            <button
              key={i}
              aria-label={`Go to slide ${i + 1}`}
              onClick={() => setIndex(i)}
              className={`w-2.5 h-2.5 rounded-full transition-all ${i === index ? 'bg-purple-600 w-6' : 'bg-white/70'}`}
            />
          ))}
        </div>
          <button
            aria-label="Scroll down"
            onClick={() => { const el = document.getElementById('destinations'); if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' }); }}
            className="absolute left-1/2 -translate-x-1/2 bottom-6 w-12 h-12 bg-white/80 backdrop-blur-md rounded-full flex items-center justify-center shadow-xl hover:bg-white focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2"
          >
            <ChevronDown />
          </button>
      </div>
    </section>
    <div className="relative">
      <svg viewBox="0 0 1440 120" xmlns="http://www.w3.org/2000/svg" className="w-full h-24">
        <defs>
          <linearGradient id="waveGrad" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0%" stopColor="#7c3aed" />
            <stop offset="50%" stopColor="#2563eb" />
            <stop offset="100%" stopColor="#06b6d4" />
          </linearGradient>
        </defs>
        <path d="M0,80 C240,140 480,20 720,80 C960,140 1200,20 1440,80 L1440,120 L0,120 Z" fill="url(#waveGrad)" opacity="0.25" />
      </svg>
    </div>
    </>
  );
}

export default Hero;
