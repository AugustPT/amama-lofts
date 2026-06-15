'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowDown, Mail, Phone, CheckCircle2, ChevronDown } from 'lucide-react';

export default function HomePage() {
  // Contact Form State
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [unitType, setUnitType] = useState('Studio');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Handle smooth scroll to anchor
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleInquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName || !lastName || !email || !phone) {
      setErrorMsg('Please fill in all required fields.');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          first_name: firstName,
          last_name: lastName,
          email: email,
          phone: phone,
          desired_unit_type: unitType,
          household_size: 1, // Default fallback
          annual_income: 0,   // Default fallback
          move_timing: 'Inquiry',
          wants_updates: true,
          consent: true,
        }),
      });

      if (res.ok) {
        setSuccess(true);
        setFirstName('');
        setLastName('');
        setEmail('');
        setPhone('');
      } else {
        const data = await res.json();
        setErrorMsg(data.error || 'Failed to submit inquiry. Please try again.');
      }
    } catch (err) {
      console.error('Error submitting inquiry:', err);
      setErrorMsg('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#fdfcf7] text-[#1c1e21] min-h-screen">
      
      {/* 1. Fullscreen Video Hero */}
      <section className="relative h-screen w-full flex items-center justify-center overflow-hidden">
        {/* Background Video */}
        <div className="absolute inset-0 z-0">
          <video
            src="/videos/hero.mp4"
            className="w-full h-full object-cover"
            autoPlay
            muted
            loop
            playsInline
          />
          {/* Subtle overlay matching sky's dark tint */}
          <div className="absolute inset-0 bg-[#121314]/35 z-10" />
        </div>

        {/* Centered Crest and Title Overlay */}
        <div className="relative z-20 flex flex-col items-center max-w-4xl px-6 text-center">
          
          {/* Monogram crest: elegant gold box watermark */}
          <div className="flex flex-col items-center justify-center border border-[#c5a880]/60 p-6 md:p-8 w-36 h-36 md:w-44 md:h-44 mb-8 bg-[#121314]/20 backdrop-blur-[3px] select-none">
            <span className="font-display text-4xl md:text-5xl font-extralight tracking-widest text-[#c5a880]">A</span>
            <span className="font-sans text-[9px] tracking-[0.3em] text-[#e0ceb6] mt-2 uppercase font-light">HONOLULU</span>
          </div>

          <h1 className="text-3xl sm:text-5xl md:text-6xl font-light tracking-[0.35em] text-white uppercase mb-6 leading-tight font-display">
            AMANA LOFTS
          </h1>

          <p className="text-xs sm:text-sm tracking-[0.2em] text-[#e0ceb6] uppercase font-sans font-light max-w-xl leading-relaxed">
            Income-Qualified Rental Residences in the Ala Moana Corridor
          </p>
        </div>

        {/* Bouncing Arrow Down */}
        <button
          onClick={() => scrollToSection('welcome')}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 text-white/70 hover:text-[#c5a880] transition-colors cursor-pointer animate-bounce focus:outline-none"
          aria-label="Scroll down to welcome section"
        >
          <ArrowDown className="w-8 h-8 stroke-[1.25]" />
        </button>
      </section>

      {/* 2. Welcome Banner Section */}
      <section id="welcome" className="bg-[#fcfbf7] border-y border-[#c5a880]/15 py-12 text-center px-6">
        <div className="max-w-2xl mx-auto flex flex-col items-center">
          <span className="text-[10px] tracking-[0.3em] text-[#c5a880] uppercase font-sans font-semibold mb-3">
            A NEW STANDARD FOR MODERN LIVING
          </span>
          <div className="w-12 h-[1px] bg-[#c5a880]/40 mb-4" />
          <p className="font-display font-light text-charcoal-dark text-base sm:text-lg tracking-[0.05em] leading-relaxed uppercase">
            64 Brand-New Residences Soaring in the heart of Honolulu
          </p>
        </div>
      </section>

      {/* 3. Section 1: The Residences (Image Right / Text Left) */}
      <section id="residences" className="py-20 md:py-32 px-6 md:px-12 bg-[#fdfcf7]">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-20 items-center">
          <div className="md:col-span-5 flex flex-col justify-center">
            <span className="text-[10px] tracking-[0.3em] text-[#c5a880] uppercase font-sans font-light mb-2">
              Modern Spaces
            </span>
            <h2 className="text-3xl md:text-5xl font-light tracking-[0.2em] text-[#121314] uppercase mb-8 font-display">
              The Residences
            </h2>
            <div className="w-16 h-[1px] bg-[#c5a880] mb-8" />
            <p className="text-charcoal-muted leading-relaxed font-sans text-sm md:text-base font-light">
              Abundant natural light. Panoramic city, mountain, and sunset views. Contemporary interior finishes and expansive windows. Welcome to your residence at Amana Lofts, soaring above the dynamic Ala Moana and Kapiolani Corridor.
            </p>
          </div>
          <div className="md:col-span-7 relative h-[300px] sm:h-[450px] w-full overflow-hidden border border-[#c5a880]/10">
            <Image
              src="/images/3.jpg"
              alt="Amana Lofts Residence Interior"
              fill
              className="object-cover"
              sizes="(max-w-768px) 100vw, 50vw"
              priority
            />
          </div>
        </div>
      </section>

      {/* 4. Section 2: The Terrace (Full-bleed Parallax Image) */}
      <section id="building" className="relative min-h-[75vh] flex items-center justify-center bg-black overflow-hidden">
        {/* Parallax Background */}
        <div className="absolute inset-0 z-0">
          <div 
            className="w-full h-full bg-cover bg-center bg-no-repeat opacity-85 bg-fixed"
            style={{ backgroundImage: `url('/images/back.jpg')` }}
          />
          {/* Parallax overlay */}
          <div className="absolute inset-0 bg-[#121314]/40" />
        </div>

        {/* Text content over Parallax */}
        <div className="relative z-10 max-w-3xl px-8 text-center text-white py-16">
          <span className="text-[10px] tracking-[0.3em] text-[#e0ceb6] uppercase font-sans font-light mb-3 block">
            Community Sanctuary
          </span>
          <h2 className="text-3xl md:text-5xl font-light tracking-[0.2em] text-white uppercase mb-8 font-display">
            The Terrace
          </h2>
          <div className="w-16 h-[1px] bg-[#c5a880] mx-auto mb-8" />
          <p className="text-[#f4efeb] leading-relaxed font-sans text-sm md:text-base font-light max-w-xl mx-auto">
            From resident gathering areas to shared everyday conveniences, Amana Lofts offers beautiful urban spaces designed to elevate the daily lives of local professionals.
          </p>
        </div>
      </section>

      {/* 5. Section 3: Design (Image Left / Text Right) */}
      <section id="design" className="py-20 md:py-32 px-6 md:px-12 bg-[#fdfcf7]">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-20 items-center">
          <div className="md:col-span-7 order-last md:order-first relative h-[300px] sm:h-[450px] w-full overflow-hidden border border-[#c5a880]/10">
            <Image
              src="/images/1.jpg"
              alt="Amana Lofts High Ceilings Interior"
              fill
              className="object-cover"
              sizes="(max-w-768px) 100vw, 50vw"
            />
          </div>
          <div className="md:col-span-5 flex flex-col justify-center">
            <span className="text-[10px] tracking-[0.3em] text-[#c5a880] uppercase font-sans font-light mb-2">
              Curated Style
            </span>
            <h2 className="text-3xl md:text-5xl font-light tracking-[0.2em] text-[#121314] uppercase mb-8 font-display">
              Design
            </h2>
            <div className="w-16 h-[1px] bg-[#c5a880] mb-8" />
            <p className="text-charcoal-muted leading-relaxed font-sans text-sm md:text-base font-light">
              Based on proven urban design principles, Amana Lofts features high-volume ceilings, modern kitchens, clean cabinetry, and highly functional layouts. It represents a fusion of intelligent planning and contemporary styling.
            </p>
          </div>
        </div>
      </section>

      {/* 6. Section 4: Location (Image Right / Text Left) */}
      <section id="location" className="py-20 md:py-32 px-6 md:px-12 bg-[#fcfbf7] border-t border-[#c5a880]/10">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-20 items-center">
          <div className="md:col-span-5 flex flex-col justify-center">
            <span className="text-[10px] tracking-[0.3em] text-[#c5a880] uppercase font-sans font-light mb-2">
              Honolulu Retail Hub
            </span>
            <h2 className="text-3xl md:text-5xl font-light tracking-[0.2em] text-[#121314] uppercase mb-8 font-display">
              Location
            </h2>
            <div className="w-16 h-[1px] bg-[#c5a880] mb-8" />
            <p className="text-charcoal-muted leading-relaxed font-sans text-sm md:text-base font-light">
              Living at 765 Amana Street puts you minutes from Ala Moana Center, local restaurants, supermarkets, and parks. Located along reef-protected sandy beaches and surf breaks, it is the perfect gathering place for work and play.
            </p>
          </div>
          <div className="md:col-span-7 relative h-[300px] sm:h-[450px] w-full overflow-hidden border border-[#c5a880]/10">
            <Image
              src="/images/2.jpg"
              alt="Amana Lofts Location Area"
              fill
              className="object-cover"
              sizes="(max-w-768px) 100vw, 50vw"
            />
          </div>
        </div>
      </section>

      {/* 7. Section 5: Inquire (Contact Inquiry Form) */}
      <section id="inquire" className="bg-[#121314] text-white py-24 px-6 md:px-12 border-t border-[#c5a880]/15 relative overflow-hidden">
        {/* Subtle background monogram layout watermark */}
        <div className="absolute right-0 bottom-0 translate-x-1/4 translate-y-1/4 w-96 h-96 border border-[#c5a880]/5 rounded-none pointer-events-none flex items-center justify-center">
          <span className="font-display text-9xl text-white/5 font-extralight select-none">A</span>
        </div>

        <div className="max-w-4xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <span className="text-[10px] tracking-[0.3em] text-[#c5a880] uppercase font-sans font-medium mb-3 block">
              Join the Launch Update List
            </span>
            <h2 className="text-3xl md:text-4xl font-light tracking-[0.25em] text-white uppercase font-display">
              Inquire
            </h2>
            <div className="w-12 h-[1px] bg-[#c5a880]/50 mx-auto mt-6" />
          </div>

          {success ? (
            <div className="max-w-md mx-auto text-center py-12 px-6 border border-[#c5a880]/20 bg-[#1c1e21]/40 backdrop-blur-sm">
              <CheckCircle2 className="w-12 h-12 text-[#c5a880] mx-auto mb-4 animate-scale-up" />
              <h3 className="text-xl font-display font-light text-white tracking-[0.1em] mb-2">Registration Complete</h3>
              <p className="text-[#8e9499] text-sm font-sans font-light leading-relaxed">
                Thank you for your interest in Amana Lofts. We have recorded your registration and will contact you as launch details and eligibility guidelines are published.
              </p>
            </div>
          ) : (
            <form onSubmit={handleInquirySubmit} className="max-w-2xl mx-auto space-y-8">
              
              {errorMsg && (
                <div className="p-4 bg-red-950/30 border border-red-500/20 text-red-200 text-sm font-sans text-center">
                  {errorMsg}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                {/* First Name */}
                <div className="flex flex-col">
                  <label className="text-[10px] tracking-[0.2em] text-[#8e9499] uppercase font-sans font-light mb-2">
                    First Name *
                  </label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                    className="bg-transparent border-b border-neutral-700/60 focus:border-[#c5a880] py-2 text-white font-sans text-sm tracking-[0.05em] font-light outline-none transition-colors"
                  />
                </div>

                {/* Last Name */}
                <div className="flex flex-col">
                  <label className="text-[10px] tracking-[0.2em] text-[#8e9499] uppercase font-sans font-light mb-2">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                    className="bg-transparent border-b border-neutral-700/60 focus:border-[#c5a880] py-2 text-white font-sans text-sm tracking-[0.05em] font-light outline-none transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                {/* Email */}
                <div className="flex flex-col">
                  <label className="text-[10px] tracking-[0.2em] text-[#8e9499] uppercase font-sans font-light mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="bg-transparent border-b border-neutral-700/60 focus:border-[#c5a880] py-2 text-white font-sans text-sm tracking-[0.05em] font-light outline-none transition-colors"
                  />
                </div>

                {/* Phone */}
                <div className="flex flex-col">
                  <label className="text-[10px] tracking-[0.2em] text-[#8e9499] uppercase font-sans font-light mb-2">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    className="bg-transparent border-b border-neutral-700/60 focus:border-[#c5a880] py-2 text-white font-sans text-sm tracking-[0.05em] font-light outline-none transition-colors"
                  />
                </div>
              </div>

              {/* Unit Type Selection */}
              <div className="flex flex-col">
                <label className="text-[10px] tracking-[0.2em] text-[#8e9499] uppercase font-sans font-light mb-2">
                  Desired Residence Size
                </label>
                <div className="relative">
                  <select
                    value={unitType}
                    onChange={(e) => setUnitType(e.target.value)}
                    className="w-full bg-transparent border-b border-neutral-700/60 focus:border-[#c5a880] py-2 text-white font-sans text-sm tracking-[0.05em] font-light outline-none appearance-none rounded-none cursor-pointer transition-colors"
                  >
                    <option value="Studio" className="bg-[#121314] text-white">Studio</option>
                    <option value="1-Bedroom" className="bg-[#121314] text-white">1-Bedroom</option>
                    <option value="2-Bedroom" className="bg-[#121314] text-white">2-Bedroom</option>
                  </select>
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none text-[#8e9499]">
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-6 text-center">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-12 py-3.5 border border-[#c5a880]/30 hover:border-[#c5a880] bg-transparent hover:bg-[#c5a880]/10 text-white hover:text-[#c5a880] text-xs font-light tracking-[0.25em] uppercase transition-all duration-300 rounded-none cursor-pointer focus:outline-none w-full sm:w-auto"
                >
                  {loading ? 'Registering...' : 'Submit Inquiry'}
                </button>
              </div>

              <p className="text-[10px] text-center text-[#5c6166] font-sans font-light leading-relaxed max-w-md mx-auto pt-6">
                By submitting this form, you consent to receive marketing updates from Amana Lofts and its authorized representatives. You may opt out at any time.
              </p>
            </form>
          )}
        </div>
      </section>

      {/* 8. Custom Footer */}
      <footer className="bg-[#121314] text-[#8e9499] font-sans text-xs tracking-[0.15em] font-light uppercase py-16 px-6 md:px-12 border-t border-neutral-800/40 relative z-10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between gap-10">
          {/* Address and contact */}
          <div className="space-y-3">
            <h6 className="text-white text-xs tracking-[0.2em] font-medium font-display">Amana Lofts</h6>
            <p className="normal-case tracking-normal text-[#8e9499]">
              765 Amana St<br />
              Honolulu, HI 96814
            </p>
          </div>

          {/* Legal Pages Links */}
          <div className="flex gap-8 items-center">
            <Link href="/disclaimer" className="hover:text-white transition-colors">
              Disclaimer
            </Link>
            <Link href="/privacy" className="hover:text-white transition-colors">
              Privacy Policy
            </Link>
          </div>

          {/* Copyright, Developer info */}
          <div className="space-y-2 text-left md:text-right">
            <p className="normal-case tracking-normal">© 2026 JL Capital. All Rights Reserved.</p>
            <p className="text-[10px] text-[#5c6166]">
              Represented by Associated Real Estate Advisors
            </p>
          </div>
        </div>
      </footer>

    </div>
  );
}
