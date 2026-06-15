'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Menu, X, Mail } from 'lucide-react';

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const isHome = pathname === '/';

  // Toggle drawer body scroll lock
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Handle scroll to change header backdrop
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLinkClick = (href: string) => {
    setIsOpen(false);
    
    // If it's an anchor link and we are on home page, handle smooth scroll
    if (href.startsWith('/#') && isHome) {
      const id = href.substring(2);
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
        return;
      }
    }
    
    // Otherwise route normally
    router.push(href);
  };

  return (
    <>
      {/* Top Header Navigation */}
      <header
        className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 py-6 px-6 md:px-12 ${
          isHome
            ? isScrolled
              ? 'bg-[#121314]/95 backdrop-blur-md border-b border-[#c5a880]/15'
              : 'bg-transparent'
            : 'bg-[#121314] border-b border-[#c5a880]/15'
        }`}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between relative">
          
          {/* Left: Hamburger menu toggle */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center gap-3 text-white hover:text-[#c5a880] transition-colors focus:outline-none z-50 cursor-pointer"
            aria-label={isOpen ? 'Close menu' : 'Open menu'}
          >
            {isOpen ? (
              <X className="w-6 h-6 stroke-[1.25]" />
            ) : (
              <Menu className="w-6 h-6 stroke-[1.25]" />
            )}
            <span className="hidden md:inline font-sans text-xs uppercase tracking-[0.25em] font-light">
              Menu
            </span>
          </button>

          {/* Center: Brand Typography Logo */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-40">
            <Link
              href="/"
              onClick={() => handleLinkClick('/')}
              className="text-white hover:text-[#c5a880] transition-colors focus:outline-none"
            >
              <span className="font-display text-lg sm:text-2xl font-light tracking-[0.3em] uppercase block text-center whitespace-nowrap">
                AMANA LOFTS
              </span>
            </Link>
          </div>

          {/* Right: Inquire Button */}
          <button
            onClick={() => handleLinkClick('/#inquire')}
            className="flex items-center gap-2 px-4 py-2 border border-[#c5a880]/30 hover:border-[#c5a880] bg-black/20 hover:bg-[#c5a880]/10 text-white hover:text-[#c5a880] text-xs font-light tracking-[0.2em] uppercase transition-all duration-300 rounded-none cursor-pointer focus:outline-none"
          >
            <Mail className="w-3.5 h-3.5 stroke-[1.25]" />
            <span className="hidden sm:inline">Inquire</span>
          </button>

        </div>
      </header>

      {/* Navigation Drawer Panel */}
      <div
        className={`fixed top-0 left-0 w-full h-full bg-[#121314] z-45 transition-all duration-700 ease-in-out ${
          isOpen ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-full pointer-events-none'
        }`}
      >
        {/* Decorative thin gold lines and branding logo */}
        <div className="absolute inset-0 border-[16px] border-[#1c1e21] pointer-events-none flex items-center justify-center opacity-5">
          <div className="border border-[#c5a880] p-12 w-96 h-96 flex items-center justify-center">
            <span className="text-white font-display text-9xl font-light">A</span>
          </div>
        </div>

        <div className="h-full flex flex-col justify-between max-w-4xl mx-auto px-10 py-32 md:py-40">
          {/* Main Navigation Links */}
          <nav className="flex flex-col gap-6 md:gap-8">
            <button
              onClick={() => handleLinkClick('/')}
              className="text-left text-2xl md:text-4xl text-white hover:text-[#c5a880] font-display font-light tracking-[0.2em] uppercase transition-colors focus:outline-none cursor-pointer"
            >
              Home
            </button>
            <button
              onClick={() => handleLinkClick('/#building')}
              className="text-left text-2xl md:text-4xl text-white hover:text-[#c5a880] font-display font-light tracking-[0.2em] uppercase transition-colors focus:outline-none cursor-pointer"
            >
              Building
            </button>
            <button
              onClick={() => handleLinkClick('/#residences')}
              className="text-left text-2xl md:text-4xl text-white hover:text-[#c5a880] font-display font-light tracking-[0.2em] uppercase transition-colors focus:outline-none cursor-pointer"
            >
              Residences
            </button>
            <button
              onClick={() => handleLinkClick('/#design')}
              className="text-left text-2xl md:text-4xl text-white hover:text-[#c5a880] font-display font-light tracking-[0.2em] uppercase transition-colors focus:outline-none cursor-pointer"
            >
              Design
            </button>
            <button
              onClick={() => handleLinkClick('/#location')}
              className="text-left text-2xl md:text-4xl text-white hover:text-[#c5a880] font-display font-light tracking-[0.2em] uppercase transition-colors focus:outline-none cursor-pointer"
            >
              Location
            </button>
            <button
              onClick={() => handleLinkClick('/#inquire')}
              className="text-left text-2xl md:text-4xl text-white hover:text-[#c5a880] font-display font-light tracking-[0.2em] uppercase transition-colors focus:outline-none cursor-pointer"
            >
              Inquire
            </button>
            <Link
              href="/admin"
              onClick={() => setIsOpen(false)}
              className="text-left text-lg md:text-xl text-neutral-400 hover:text-[#c5a880] font-sans font-light tracking-[0.25em] uppercase transition-colors focus:outline-none"
            >
              Admin Portal
            </Link>
          </nav>

          {/* Drawer Footer Information */}
          <div className="border-t border-[#c5a880]/10 pt-8 mt-12 flex flex-col md:flex-row justify-between gap-6 text-[#8e9499] font-sans text-xs tracking-[0.15em] font-light uppercase">
            <div>
              <p className="text-white font-medium mb-1">Amana Lofts</p>
              <p>765 Amana St, Honolulu, HI 96814</p>
            </div>
            <div>
              <p className="text-white font-medium mb-1">Developer</p>
              <p>JL Capital</p>
            </div>
            <div>
              <p className="text-white font-medium mb-1">Leasing Office</p>
              <p>Associated Real Estate Advisors</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
