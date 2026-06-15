'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  Shield, 
  MapPin, 
  ArrowRight, 
  Home as HomeIcon, 
  Check, 
  Plus, 
  Minus,
  ArrowUpRight,
  Bookmark,
  Users,
  FileCheck,
  Phone,
  DollarSign,
  Calendar,
  Mail,
  ArrowLeft,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { evaluateEligibility } from '@/lib/eligibility';

export default function HomePage() {
  // FAQs Accordion State
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  // Inline Launch Updates capture state
  const [updatesEmail, setUpdatesEmail] = useState('');
  const [updatesName, setUpdatesName] = useState('');
  const [updatesStatus, setUpdatesStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  // Screener Wizard States (homepage embedded)
  const [step, setStep] = useState(1);
  const [householdSize, setHouseholdSize] = useState<number | null>(null);
  const [desiredUnitType, setDesiredUnitType] = useState<string>('');
  const [annualIncome, setAnnualIncome] = useState<string>('');
  const [moveTiming, setMoveTiming] = useState<string>('');
  const [wantsUpdates, setWantsUpdates] = useState<boolean>(true);
  const [consent, setConsent] = useState<boolean>(false);
  
  // Contact State
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  
  // Assessment Result State
  const [assessment, setAssessment] = useState<{
    result: 'likely_fit' | 'needs_review' | 'outside_range' | 'under_qualified';
    message: string;
    label: string;
  } | null>(null);

  // One-Click Profile Transfer State
  const [transferAuthorized, setTransferAuthorized] = useState(false);
  const [transferLoading, setTransferLoading] = useState(false);
  const [submittedLeadId, setSubmittedLeadId] = useState<string | null>(null);

  // Load saved assessment or preview overrides on mount
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const previewParam = urlParams.get('preview');
      
      if (previewParam) {
        setStep(6);
        setFirstName('Guest');
        setPhone('(808) 555-0147');
        if (previewParam === 'likely_fit') {
          setAssessment({
            result: 'likely_fit',
            message: 'Your profile aligns fully with workforce housing guidelines. We have recorded your pre-qualification details. Please check your email for a checklist of documents to gather before applications open.',
            label: 'likely_fit'
          });
        } else if (previewParam === 'needs_review') {
          setAssessment({
            result: 'needs_review',
            message: 'Your profile is close to program limits or desired occupancy guidelines. We have queued your details for priority coordinator review.',
            label: 'needs_review'
          });
        } else if (previewParam === 'under_qualified') {
          setAssessment({
            result: 'under_qualified',
            message: 'Your estimated household gross income is below the minimum affordable range set for workforce lofts. However, you qualify for the Alternative Resources Path!',
            label: 'under_qualified'
          });
        } else if (previewParam === 'outside_range') {
          setAssessment({
            result: 'outside_range',
            message: 'Your income exceeds workforce guidelines. However, you qualify for the Premium & Expanded Path!',
            label: 'outside_range'
          });
        }
        return;
      }

      try {
        const savedAssessment = localStorage.getItem('amana_screener_assessment');
        const savedFirstName = localStorage.getItem('amana_screener_first_name');
        const savedPhone = localStorage.getItem('amana_screener_phone');
        const savedLeadId = localStorage.getItem('amana_screener_lead_id');
        const savedTransfer = localStorage.getItem('amana_screener_transfer_authorized');
        
        if (savedAssessment) {
          const parsed = JSON.parse(savedAssessment);
          setAssessment(parsed);
          setStep(6);
          if (savedFirstName) setFirstName(savedFirstName);
          if (savedPhone) setPhone(savedPhone);
          if (savedLeadId) setSubmittedLeadId(savedLeadId);
          if (savedTransfer === 'true') setTransferAuthorized(true);
        }
      } catch (e) {
        console.error('Error loading state from localStorage:', e);
      }
    }
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  const handleTransferAuthorize = async () => {
    if (!submittedLeadId) return;
    setTransferLoading(true);
    try {
      const res = await fetch('/api/leads/transfer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leadId: submittedLeadId }),
      });
      if (res.ok) {
        setTransferAuthorized(true);
        if (typeof window !== 'undefined') {
          localStorage.setItem('amana_screener_transfer_authorized', 'true');
        }
      }
    } catch (err) {
      console.error('Error authorizing transfer:', err);
    } finally {
      setTransferLoading(false);
    }
  };

  const canGoNext = () => {
    switch (step) {
      case 1:
        return householdSize !== null;
      case 2:
        return desiredUnitType !== '';
      case 3:
        return annualIncome !== '' && Number(annualIncome) >= 0;
      case 4:
        return moveTiming !== '';
      case 5:
        return firstName.trim() !== '' && 
               lastName.trim() !== '' && 
               email.trim() !== '' && 
               phone.trim() !== '' && 
               consent;
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (canGoNext()) {
      setStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep((prev) => prev - 1);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canGoNext()) return;

    setLoading(true);
    setErrorMessage('');

    // Precalculate results for instant UI updates
    const screenRes = evaluateEligibility({
      householdSize: householdSize!,
      desiredUnitType,
      annualIncome: Number(annualIncome),
    });
    setAssessment(screenRes);

    try {
      const payload = {
        first_name: firstName,
        last_name: lastName,
        email,
        phone,
        household_size: householdSize,
        desired_unit_type: desiredUnitType,
        annual_income: annualIncome,
        move_timing: moveTiming,
        wants_updates: wantsUpdates,
        consent,
      };

      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit form.');
      }

      if (data.lead && data.lead.id) {
        setSubmittedLeadId(data.lead.id);
        if (typeof window !== 'undefined') {
          localStorage.setItem('amana_screener_lead_id', data.lead.id);
        }
      }
      if (typeof window !== 'undefined') {
        localStorage.setItem('amana_screener_assessment', JSON.stringify(screenRes));
        localStorage.setItem('amana_screener_first_name', firstName);
        localStorage.setItem('amana_screener_phone', phone);
      }
      setStep(6);
    } catch (err) {
      const error = err as Error;
      setErrorMessage(error.message || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatesSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!updatesEmail || !updatesName) return;

    setUpdatesStatus('loading');
    try {
      // Register updates lead with basic dummy fields for screener, indicating updates only
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          first_name: updatesName.split(' ')[0] || updatesName,
          last_name: updatesName.split(' ').slice(1).join(' ') || 'Updates',
          email: updatesEmail,
          phone: '000-000-0000', // Placeholder for quick capture
          household_size: 1,
          desired_unit_type: 'studio',
          annual_income: 0,
          move_timing: 'launch-summer-2026',
          wants_updates: true,
          consent: true,
          utm_source: 'homepage_updates_signup',
        }),
      });

      if (!response.ok) throw new Error();
      setUpdatesStatus('success');
      setUpdatesEmail('');
      setUpdatesName('');
    } catch {
      setUpdatesStatus('error');
    }
  };


  const units = [
    {
      type: "Studio",
      count: "32 homes",
      size: "289–346 sq ft",
      rent: "Rent TBD",
      term: "12-month lease term",
      occupancy: "1–2 people"
    },
    {
      type: "One Bedroom",
      count: "20 homes",
      size: "365–393 sq ft",
      rent: "Rent TBD",
      term: "12-month lease term",
      occupancy: "1–3 people"
    },
    {
      type: "Two Bedroom",
      count: "12 homes",
      size: "471–561 sq ft",
      rent: "Rent TBD",
      term: "12-month lease term",
      occupancy: "2–5 people"
    }
  ];

  const landmarks = [
    { name: "Ala Moana Center", distance: "0.4 miles", time: "8 min walk" },
    { name: "Walmart & Sam's Club", distance: "0.1 miles", time: "2 min walk" },
    { name: "Don Quijote Grocery", distance: "0.2 miles", time: "4 min walk" },
    { name: "Ala Moana Beach Park", distance: "0.8 miles", time: "16 min walk" },
    { name: "Ward Village / Kakaʻako", distance: "1.1 miles", time: "5 min drive" },
    { name: "Waikīkī", distance: "1.5 miles", time: "7 min drive" },
    { name: "Downtown Honolulu", distance: "2.3 miles", time: "10 min drive" },
    { name: "Primary Bus Routes", distance: "0.05 miles", time: "1 min walk" }
  ];


  const faqData = [
    {
      q: "Who qualifies for Amana Lofts?",
      a: "Households meeting Honolulu's income guidelines. Gross income is capped at 80% Area Median Income (AMI)."
    },
    {
      q: "What does 80% AMI mean?",
      a: "It is the area median income threshold. Honolulu's 2026 limits range from $86,240 (1 person) to $133,120 (5 people)."
    },
    {
      q: "When do applications open?",
      a: "Applications open prior to completion in Summer 2026. Join our list to receive notification packets."
    },
    {
      q: "Are monthly rents posted?",
      a: "Rents are TBD. Approved rental rates will be published prior to application launch."
    },
    {
      q: "Is parking available?",
      a: "Yes, limited covered garage stalls are available for a monthly fee. Bike storage is free."
    },
    {
      q: "Is this screener a final decision?",
      a: "No. This is a preliminary check. Final eligibility requires a full application and document review."
    },
    {
      q: "Can I join the list if I am unsure?",
      a: "Yes. Anyone interested in project status and updates is welcome to subscribe."
    }
  ];

  return (
    <div className="flex-1">
      
      {/* Hero Section with Fullscreen Background Video & Glass Card */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden border-b border-neutral-sand/20 bg-charcoal-dark z-0">
        {/* Background Video */}
        <video 
          src="/videos/hero.mp4" 
          autoPlay 
          loop 
          muted 
          playsInline 
          className="absolute inset-0 w-full h-full object-cover pointer-events-none z-0"
        />
        {/* Soft Vignette Overlay to enhance contrast on the left side */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/55 via-black/20 to-transparent z-10 pointer-events-none" />
        <div className="absolute inset-0 bg-black/15 z-10 pointer-events-none" />
        
        {/* Content Container */}
        <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 min-h-[90vh] flex items-center justify-start w-full">
          
          <div className="w-full max-w-[450px] animate-slide-up">
            {/* Glassmorphic Card */}
            <div className="bg-[#1c1a17]/75 backdrop-blur-2xl border border-white/10 rounded-[32px] p-8 sm:p-12 flex flex-col items-center text-center shadow-2xl">
              
              {/* Gold double peaked logo */}
              <svg className="w-16 h-16 text-[#dcae76] mb-4" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="4.5">
                <path d="M20 80 L50 20 L80 80" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M35 80 L50 45 L65 80" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              
              {/* Spaced logo text */}
              <h2 className="text-[26px] font-sans font-light tracking-[0.25em] text-white leading-none">
                AMANA
              </h2>
              <div className="flex items-center justify-center gap-1.5 mt-2.5 mb-8 text-[11px] font-semibold text-[#dcae76] tracking-[0.4em]">
                <span className="w-4 h-[1px] bg-[#dcae76]/40" />
                LOFTS
                <span className="w-4 h-[1px] bg-[#dcae76]/40" />
              </div>

              {/* Title */}
              <h1 className="text-3xl sm:text-4xl font-display font-medium text-white mb-4 leading-tight">
                Modern Lofts.<br />Elevated Living.
              </h1>

              {/* Description */}
              <p className="text-zinc-300 text-sm sm:text-base mb-8 leading-relaxed max-w-xs">
                Refined loft residences in the heart of Honolulu—where design, lifestyle, and convenience come together.
              </p>

              {/* Centered Golden See If I Qualify Button */}
              <Link
                href="#screener-section"
                className="w-full max-w-[280px] py-4 rounded-xl bg-[#dcae76] hover:bg-[#cda26b] active:scale-[0.98] text-[#1c1a17] font-semibold text-center transition-all tracking-wide text-sm shadow-md focus:outline-none"
              >
                See If I Qualify
              </Link>
            </div>
          </div>

        </div>

        {/* Floating Address Badge in Bottom Right */}
        <div className="absolute bottom-6 right-6 hidden md:flex items-center gap-2 px-4 py-2 bg-black/45 backdrop-blur-md border border-white/10 rounded-full text-white text-xs z-20">
          <MapPin className="w-3.5 h-3.5 text-[#dcae76]" />
          <span className="font-medium">765 Amana Street, Honolulu, HI 96814</span>
        </div>
      </section>

      {/* Modern Living Section */}
      <section className="py-24 bg-[#f4f0ea] border-t border-b border-neutral-sand/15">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center">
          
          {/* Logo & Header */}
          <div className="flex flex-col items-center text-center mb-16 animate-fade-in">
            {/* Gold double peaks logo */}
            <svg className="w-12 h-12 text-[#cda26b] mb-4" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="3.5">
              <path d="M20 80 L50 20 L80 80" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M35 80 L50 45 L65 80" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            
            {/* Logo Text */}
            <span className="text-xl font-sans font-light tracking-[0.25em] text-charcoal-dark uppercase leading-none">
              AMANA
            </span>
            <div className="flex items-center justify-center gap-2 mt-2.5 mb-6 text-[10px] font-semibold text-[#cda26b] tracking-[0.4em] uppercase">
              <span className="w-6 h-[1px] bg-[#cda26b]/40" />
              LOFTS
              <span className="w-6 h-[1px] bg-[#cda26b]/40" />
            </div>
            
            {/* Elegant Title */}
            <h2 className="text-4xl sm:text-5xl font-serif font-light text-charcoal-dark tracking-wide leading-tight">
              Modern Living. Elevated.
            </h2>
          </div>

          {/* 4 Image Columns */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 w-full mb-16">
            {[
              { img: "/images/1.jpg", title: "High Ceilings", subtitle: "Open Feeling" },
              { img: "/images/2.jpg", title: "Ala Moana", subtitle: "Location" },
              { img: "/images/3.jpg", title: "Modern Everyday", subtitle: "Convenience" },
              { img: "/images/4.jpg", title: "Studio, 1 & 2 Bedroom", subtitle: "Options" }
            ].map((col, idx) => (
              <div key={idx} className="flex flex-col items-center group">
                <div className="relative w-full aspect-[692/880] rounded-[24px] overflow-hidden shadow-md mb-5 bg-neutral-sand/25">
                  <Image 
                    src={col.img} 
                    alt={col.title}
                    fill
                    className="object-cover group-hover:scale-[1.03] transition-transform duration-700 ease-out"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  />
                </div>
                <h3 className="text-lg font-sans font-semibold text-charcoal-dark uppercase tracking-wider text-center mb-1.5">
                  {col.title}
                </h3>
                <span className="text-xs sm:text-sm font-sans text-charcoal-muted uppercase tracking-widest text-center">
                  {col.subtitle}
                </span>
              </div>
            ))}
          </div>

          {/* Centered See If I Qualify Button */}
          <Link
            href="#screener-section"
            className="px-14 py-4.5 rounded-sm bg-[#dcae76] hover:bg-[#cda26b] active:scale-[0.98] text-[#1c1a17] font-semibold text-center transition-all tracking-wider text-sm shadow-md focus:outline-none"
          >
            See If I Qualify
          </Link>
          
        </div>
      </section>

      {/* Layer 3: Interactive Eligibility Screener Section */}
      <section id="screener-section" className="relative py-24 bg-cover bg-center overflow-hidden z-0" style={{ backgroundImage: "url('/images/back.jpg')" }}>
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-black/65 z-10 pointer-events-none" />

        <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col justify-between h-full min-h-[90vh]">
          {/* Header Bar inside Section */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 border-b border-white/10 pb-6 mb-8">
            <div className="flex items-center gap-3">
              {/* Gold double peaked logo */}
              <svg className="w-10 h-10 text-[#dcae76]" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="4">
                <path d="M20 80 L50 20 L80 80" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M35 80 L50 45 L65 80" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <div>
                <span className="text-[18px] font-sans font-light tracking-[0.2em] text-white block leading-none">AMANA</span>
                <span className="text-[8px] font-semibold text-[#dcae76] tracking-[0.35em] block mt-1 uppercase">LOFTS</span>
              </div>
            </div>
            
            <div className="flex items-center gap-2 text-sm text-zinc-300">
              <span>Need help?</span>
              <a href="tel:8085550147" className="font-semibold text-[#dcae76] hover:text-[#cda26b] transition-colors flex items-center gap-1.5">
                <Phone className="w-4 h-4" />
                (808) 555-0147
              </a>
            </div>
          </div>

          {/* Step Tracker Bar (Step 1 to 4) */}
          {step < 6 && (
            <div className="w-full max-w-3xl mx-auto mb-12">
              <div className="flex justify-between items-center relative">
                {/* Horizontal progress bar backgrounds */}
                <div className="absolute top-1/2 left-0 right-0 h-[2px] bg-white/10 -translate-y-1/2 z-0" />
                <div 
                  className="absolute top-1/2 left-0 h-[2px] bg-[#dcae76] -translate-y-1/2 z-0 transition-all duration-500 ease-out" 
                  style={{ width: `${Math.min(((step - 1) / 4) * 100, 100)}%` }}
                />

                {[
                  { label: 'Household Size', icon: Users },
                  { label: 'Unit Type', icon: HomeIcon },
                  { label: 'Income Range', icon: DollarSign },
                  { label: 'Move Timing', icon: Calendar },
                ].map((s, idx) => {
                  const stepNum = idx + 1;
                  const isActive = step === stepNum;
                  const isCompleted = step > stepNum;
                  return (
                    <div key={idx} className="flex flex-col sm:flex-row items-center gap-2.5 z-10 bg-black/60 px-3 py-1.5 rounded-full border border-white/5">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-all ${
                        isActive 
                          ? 'bg-[#dcae76] text-[#1c1a17]' 
                          : isCompleted 
                          ? 'bg-[#dcae76]/85 text-[#1c1a17]' 
                          : 'bg-[#1c1a17] text-zinc-400 border border-white/15'
                      }`}>
                        {isCompleted ? <Check className="w-4 h-4" /> : stepNum}
                      </div>
                      <span className={`text-xs font-medium tracking-wide hidden md:inline-block ${
                        isActive || isCompleted ? 'text-white' : 'text-zinc-400'
                      }`}>
                        {s.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Grid Layout: Left Column Title, Right Column Card */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center flex-1">
            {/* Left Content Column */}
            <div className="lg:col-span-5 text-left">
              <h2 className="font-serif font-light text-4xl sm:text-5xl text-white mb-6 leading-tight">
                A Quick Check<br />Before the Next Step
              </h2>
              <div className="w-20 h-1 bg-[#dcae76] mb-8" />
              <p className="text-zinc-300 text-base leading-relaxed mb-10 max-w-md">
                Answer a few quick questions to help us find the right workforce housing or premium placement options for you in our Honolulu portfolio.
              </p>
              
              <div className="border border-white/10 bg-black/35 rounded-full px-6 py-3.5 inline-flex items-center gap-3.5 text-white text-sm shadow-md">
                <Shield className="w-4 h-4 text-[#dcae76]" />
                <span className="font-medium text-zinc-200">Secure. Private. Takes 1 minute.</span>
              </div>
            </div>

            {/* Right Card Column */}
            <div className="lg:col-span-7 w-full">
              <div className="bg-[#f5f0eb] border border-neutral-sand/25 rounded-[32px] p-6 sm:p-10 shadow-2xl flex flex-col justify-between min-h-[460px] text-charcoal-dark transition-all">
                
                {/* Active Step Content */}
                <div className="flex-1 flex flex-col justify-center">
                  
                  {step === 1 && (
                    <div className="animate-fade-in text-center">
                      <div className="w-14 h-14 rounded-full bg-[#dcae76]/10 flex items-center justify-center text-[#dcae76] mx-auto mb-6">
                        <Users className="w-6 h-6" />
                      </div>
                      <h3 className="text-2xl sm:text-3xl font-serif font-semibold text-charcoal-dark mb-2">
                        How many people will be living in your household?
                      </h3>
                      <p className="text-sm text-charcoal-muted mb-8">Including yourself</p>
                      
                      <div className="flex items-center justify-center gap-3 mb-6 relative px-8">
                        {/* Scroll cards */}
                        <div className="flex justify-center gap-3 overflow-x-auto py-2">
                          {[1, 2, 3, 4, 5].map((size) => {
                            const isSel = householdSize === size;
                            const word = size === 1 ? 'One' : size === 2 ? 'Two' : size === 3 ? 'Three' : size === 4 ? 'Four' : 'Five or more';
                            return (
                              <button
                                key={size}
                                type="button"
                                onClick={() => setHouseholdSize(size)}
                                className={`w-24 h-28 flex flex-col items-center justify-center rounded-2xl border transition-all duration-300 focus:outline-none ${
                                  isSel 
                                    ? 'border-[#dcae76] bg-white text-[#dcae76] shadow-md scale-[1.03]' 
                                    : 'border-neutral-sand/35 bg-white/70 text-charcoal-dark hover:border-[#dcae76]/50'
                                }`}
                              >
                                <span className="text-3xl font-serif font-semibold mb-1">{size === 5 ? '5+' : size}</span>
                                <span className="text-[9px] font-semibold text-charcoal-muted uppercase tracking-wider">{word}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                      
                      {/* Dots pagination indicator */}
                      <div className="flex justify-center gap-1.5 mb-2">
                        {[1, 2, 3, 4, 5].map((idx) => (
                          <div 
                            key={idx} 
                            className={`w-2 h-2 rounded-full transition-all duration-300 ${
                              householdSize === idx ? 'bg-[#dcae76] w-4' : 'bg-neutral-sand/40'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {step === 2 && (
                    <div className="animate-fade-in">
                      <div className="w-14 h-14 rounded-full bg-[#dcae76]/10 flex items-center justify-center text-[#dcae76] mx-auto mb-6">
                        <HomeIcon className="w-6 h-6" />
                      </div>
                      <h3 className="text-2xl sm:text-3xl font-serif font-semibold text-charcoal-dark text-center mb-2">
                        Desired Unit Type
                      </h3>
                      <p className="text-sm text-charcoal-muted text-center mb-6">Choose the type of loft-style home you are interested in.</p>
                      
                      <div className="grid grid-cols-1 gap-3.5 mb-6">
                        {[
                          { value: 'studio', label: 'Studio', desc: '32 homes (289–346 sq ft)', occupancy: '1–2 people' },
                          { value: 'one-bedroom', label: 'One-Bedroom', desc: '20 homes (365–393 sq ft)', occupancy: '1–3 people' },
                          { value: 'two-bedroom', label: 'Two-Bedroom', desc: '12 homes (471–561 sq ft)', occupancy: '2–5 people' },
                        ].map((opt) => (
                          <button
                            key={opt.value}
                            type="button"
                            onClick={() => setDesiredUnitType(opt.value)}
                            className={`flex items-center justify-between p-4 rounded-xl border text-left bg-white transition-all duration-300 focus:outline-none ${
                              desiredUnitType === opt.value
                                ? 'border-[#dcae76] bg-[#dcae76]/5 ring-2 ring-[#dcae76]/10'
                                : 'border-neutral-sand/30 hover:border-[#dcae76]/45'
                            }`}
                          >
                            <div>
                              <span className="block font-semibold text-charcoal-dark text-base">{opt.label}</span>
                              <span className="block text-xs text-charcoal-muted mt-0.5">{opt.desc}</span>
                            </div>
                            <span className="px-2.5 py-1 text-[10px] font-semibold bg-neutral-linen text-charcoal-muted rounded-full uppercase tracking-wider">
                              Occupancy: {opt.occupancy}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {step === 3 && (
                    <div className="animate-fade-in max-w-md mx-auto w-full">
                      <div className="w-14 h-14 rounded-full bg-[#dcae76]/10 flex items-center justify-center text-[#dcae76] mx-auto mb-6">
                        <DollarSign className="w-6 h-6" />
                      </div>
                      <h3 className="text-2xl sm:text-3xl font-serif font-semibold text-charcoal-dark text-center mb-2">
                        Household Gross Income
                      </h3>
                      <p className="text-sm text-charcoal-muted text-center mb-8">Enter your total estimated annual household income before taxes.</p>
                      
                      <div className="mb-6">
                        <label htmlFor="income-input-home" className="block text-xs font-semibold text-charcoal-dark uppercase tracking-wider mb-2">
                          Estimated Annual Gross Income (USD)
                        </label>
                        <div className="relative rounded-xl shadow-xs">
                          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-charcoal-muted text-lg font-medium">
                            $
                          </div>
                          <input
                            id="income-input-home"
                            type="number"
                            required
                            placeholder="85,000"
                            value={annualIncome}
                            onChange={(e) => setAnnualIncome(e.target.value)}
                            className="block w-full pl-10 pr-4 py-4 border border-neutral-sand/40 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#dcae76]/45 focus:border-[#dcae76] text-lg font-semibold bg-white"
                          />
                        </div>
                        <p className="text-xs text-charcoal-muted mt-2 leading-relaxed">
                          Include wages, salaries, business profits, social security, pension, and other recurring household revenue.
                        </p>
                      </div>
                    </div>
                  )}

                  {step === 4 && (
                    <div className="animate-fade-in">
                      <div className="w-14 h-14 rounded-full bg-[#dcae76]/10 flex items-center justify-center text-[#dcae76] mx-auto mb-6">
                        <Calendar className="w-6 h-6" />
                      </div>
                      <h3 className="text-2xl sm:text-3xl font-serif font-semibold text-charcoal-dark text-center mb-2">
                        Timeline &amp; Updates
                      </h3>
                      <p className="text-sm text-charcoal-muted text-center mb-6">Let us know your preferred move-in window.</p>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                        {[
                          { value: 'launch-summer-2026', label: 'Project Launch (Summer 2026)' },
                          { value: 'immediate', label: 'As soon as units are ready' },
                          { value: 'within-3-months', label: 'Within 3 months of launch' },
                          { value: 'flexible', label: 'Flexible / Not sure' },
                        ].map((opt) => (
                          <button
                            key={opt.value}
                            type="button"
                            onClick={() => setMoveTiming(opt.value)}
                            className={`p-4 rounded-xl border bg-white text-left transition-all duration-300 font-medium text-xs sm:text-sm focus:outline-none ${
                              moveTiming === opt.value
                                ? 'border-[#dcae76] bg-[#dcae76]/5 text-[#dcae76]'
                                : 'border-neutral-sand/35 text-charcoal-body hover:border-[#dcae76]/50'
                            }`}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>

                      <div className="flex items-start gap-3 border-t border-neutral-sand/20 pt-5">
                        <input
                          id="wants-updates-home"
                          type="checkbox"
                          checked={wantsUpdates}
                          onChange={(e) => setWantsUpdates(e.target.checked)}
                          className="mt-1 h-4 w-4 rounded border-neutral-sand text-[#dcae76] focus:ring-[#dcae76]/50 cursor-pointer"
                        />
                        <label htmlFor="wants-updates-home" className="text-xs text-charcoal-body font-medium select-none cursor-pointer">
                          I would like to receive preliminary launch packets, rent updates, and application opening dates by email.
                        </label>
                      </div>
                    </div>
                  )}

                  {step === 5 && (
                    <div className="animate-fade-in">
                      <div className="w-14 h-14 rounded-full bg-[#dcae76]/10 flex items-center justify-center text-[#dcae76] mx-auto mb-6">
                        <Mail className="w-6 h-6" />
                      </div>
                      <h3 className="text-2xl sm:text-3xl font-serif font-semibold text-charcoal-dark text-center mb-2">
                        Contact Information
                      </h3>
                      <p className="text-sm text-charcoal-muted text-center mb-6">Complete your details to view your preliminary qualification result.</p>
                      
                      {errorMessage && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg flex items-center gap-2">
                          <AlertCircle className="w-4 h-4 flex-shrink-0" />
                          <span>{errorMessage}</span>
                        </div>
                      )}

                      <div className="grid grid-cols-2 gap-3 mb-3">
                        <div>
                          <label htmlFor="first-name-home" className="block text-[10px] font-semibold text-charcoal-dark uppercase tracking-wider mb-1">
                            First Name
                          </label>
                          <input
                            id="first-name-home"
                            type="text"
                            required
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            className="w-full px-3.5 py-2.5 border border-neutral-sand/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#dcae76]/40 bg-white text-sm"
                          />
                        </div>
                        <div>
                          <label htmlFor="last-name-home" className="block text-[10px] font-semibold text-charcoal-dark uppercase tracking-wider mb-1">
                            Last Name
                          </label>
                          <input
                            id="last-name-home"
                            type="text"
                            required
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                            className="w-full px-3.5 py-2.5 border border-neutral-sand/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#dcae76]/40 bg-white text-sm"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3 mb-4">
                        <div>
                          <label htmlFor="email-home" className="block text-[10px] font-semibold text-charcoal-dark uppercase tracking-wider mb-1">
                            Email
                          </label>
                          <input
                            id="email-home"
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-3.5 py-2.5 border border-neutral-sand/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#dcae76]/40 bg-white text-sm"
                          />
                        </div>
                        <div>
                          <label htmlFor="phone-home" className="block text-[10px] font-semibold text-charcoal-dark uppercase tracking-wider mb-1">
                            Phone
                          </label>
                          <input
                            id="phone-home"
                            type="tel"
                            required
                            placeholder="(808) 555-0199"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            className="w-full px-3.5 py-2.5 border border-neutral-sand/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#dcae76]/40 bg-white text-sm"
                          />
                        </div>
                      </div>

                      <div className="flex items-start gap-2.5 p-3.5 bg-white border border-neutral-sand/20 rounded-xl mb-4">
                        <input
                          id="consent-checkbox-home"
                          type="checkbox"
                          required
                          checked={consent}
                          onChange={(e) => setConsent(e.target.checked)}
                          className="mt-0.5 h-4 w-4 rounded border-neutral-sand text-[#dcae76] focus:ring-[#dcae76]/50 cursor-pointer"
                        />
                        <label htmlFor="consent-checkbox-home" className="text-[10px] text-charcoal-body leading-relaxed select-none cursor-pointer">
                          I consent to being contacted by Associated Real Estate Advisors regarding this preliminary check.
                        </label>
                      </div>
                    </div>
                  )}

                  {step === 6 && assessment && (
                    <div className="animate-fade-in py-6 flex flex-col items-center justify-center text-center w-full max-w-xl mx-auto">
                      
                      {/* Modern Elegant Path Badge */}
                      <div className={`px-5 py-2 rounded-full border text-xs font-semibold tracking-wider uppercase mb-6 shadow-xs ${
                        assessment.result === 'likely_fit'
                          ? 'bg-green-50/55 border-green-200 text-green-700'
                          : assessment.result === 'needs_review'
                          ? 'bg-amber-50/55 border-amber-200 text-amber-700'
                          : assessment.result === 'under_qualified'
                          ? 'bg-blue-50/55 border-blue-200 text-blue-700'
                          : 'bg-[#dcae76]/10 border-[#dcae76]/35 text-[#cda26b]'
                      }`}>
                        {assessment.result === 'likely_fit' && 'Standard Program Path'}
                        {assessment.result === 'needs_review' && 'Priority Review Path'}
                        {assessment.result === 'under_qualified' && 'Alternative Resources Path'}
                        {assessment.result === 'outside_range' && 'Premium & Expanded Path'}
                      </div>
                      
                      {/* Bold Status Heading */}
                      <h3 className="text-2xl sm:text-3xl font-display font-bold text-charcoal-dark mb-4 tracking-tight">
                        {assessment.result === 'likely_fit' && 'Pre-Qualification Confirmed'}
                        {assessment.result === 'needs_review' && 'Priority Review Queued'}
                        {assessment.result === 'under_qualified' && 'Alternative Guidance Active'}
                        {assessment.result === 'outside_range' && 'Premium Placement Active'}
                      </h3>

                      {/* Effortless Advisor Notes (Clean Sans-Serif Font, Increased Line Height, Readable Sizes) */}
                      <div className="text-charcoal-body text-sm sm:text-base leading-relaxed mb-8 max-w-md bg-white border border-neutral-sand/20 rounded-2xl p-6 shadow-xs w-full text-center">
                        {assessment.result === 'likely_fit' && (
                          <p>
                            Aloha {firstName}, your profile aligns with workforce housing guidelines. We&apos;ve sent your document checklist by email. An advisor will contact you at <strong className="text-charcoal-dark">{phone}</strong> soon.
                          </p>
                        )}
                        {assessment.result === 'needs_review' && (
                          <p>
                            Aloha {firstName}, your profile is close to guidelines. We have queued your details. An advisor will call you at <strong className="text-charcoal-dark">{phone}</strong> to guide you and discuss manual verification.
                          </p>
                        )}
                        {assessment.result === 'under_qualified' && (
                          <p>
                            Aloha {firstName}, your estimated household income is below the workforce rent thresholds. We have unlocked local rental support and community resources for you below.
                          </p>
                        )}
                        {assessment.result === 'outside_range' && (
                          <p>
                            Aloha {firstName}, your income exceeds workforce guidelines. We have unlocked premium market-rate showcases and partner listings for you below.
                          </p>
                        )}
                      </div>

                      {/* One Click Transfer Card - Keep it simple, minimalist, and high contrast */}
                      {(assessment.result === 'outside_range' || moveTiming === 'immediate') && (
                        <div className="w-full p-6 rounded-2xl border border-[#dcae76]/25 bg-[#dcae76]/5 text-center shadow-xs">
                          <div className="flex flex-col items-center gap-3">
                            <FileCheck className="w-6 h-6 text-[#cda26b]" />
                            <div>
                              <h4 className="font-semibold text-charcoal-dark text-sm uppercase tracking-wider mb-1">
                                {assessment.result === 'outside_range' ? 'One-Click Premium Transfer' : 'Immediate Placement Transfer'}
                              </h4>
                              <p className="text-xs text-charcoal-muted leading-normal max-w-sm mx-auto mb-4">
                                {assessment.result === 'outside_range' 
                                  ? 'Match with premium partner properties (like Sky Ala Moana) instantly without re-applying.'
                                  : 'Match with partner workforce properties that have immediate vacancies instantly without re-applying.'}
                              </p>
                              
                              {transferAuthorized ? (
                                <div className="text-xs text-green-700 font-bold bg-green-50 border border-green-200 rounded-lg py-2 px-4 flex items-center justify-center gap-1.5 animate-fade-in">
                                  <CheckCircle2 className="w-4 h-4" />
                                  Portfolio Match Enabled!
                                </div>
                              ) : (
                                <button
                                  type="button"
                                  onClick={handleTransferAuthorize}
                                  disabled={transferLoading}
                                  className="px-6 py-3.5 bg-[#dcae76] hover:bg-[#cda26b] active:scale-[0.98] text-[#1c1a17] font-semibold text-xs rounded-xl tracking-wider transition-all focus:outline-none shadow-xs"
                                >
                                  {transferLoading ? 'Enabling...' : 'Enable Portfolio Match'}
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      )}

                    </div>
                  )}

                </div>

                {/* Footer Controls */}
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6 pt-5 border-t border-neutral-sand/25">
                  <div className="flex items-center gap-2 text-xs text-charcoal-muted">
                    <Shield className="w-3.5 h-3.5 text-[#dcae76]" />
                    <span>Your information is secure and private.</span>
                  </div>

                  <div className="flex items-center gap-3">
                    {step > 1 && step < 6 && (
                      <button
                        type="button"
                        onClick={handleBack}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-charcoal-muted hover:text-[#dcae76] transition-colors focus:outline-none"
                      >
                        <ArrowLeft className="w-3.5 h-3.5" />
                        Back
                      </button>
                    )}

                    {step < 5 ? (
                      <button
                        type="button"
                        onClick={handleNext}
                        disabled={!canGoNext()}
                        className="inline-flex items-center gap-1.5 px-6 py-3 rounded-lg bg-[#dcae76] disabled:bg-neutral-sand/40 disabled:text-charcoal-muted/50 disabled:cursor-not-allowed hover:bg-[#cda26b] text-[#1c1a17] text-xs font-semibold tracking-wide transition-all shadow-md focus:outline-none"
                      >
                        Continue
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    ) : step === 5 ? (
                      <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={!canGoNext() || loading}
                        className="inline-flex items-center gap-1.5 px-6 py-3 rounded-lg bg-[#dcae76] disabled:bg-neutral-sand/40 disabled:text-charcoal-muted/50 disabled:cursor-not-allowed hover:bg-[#cda26b] text-[#1c1a17] text-xs font-semibold tracking-wide transition-all shadow-md focus:outline-none"
                      >
                        {loading ? 'Submitting...' : 'See Results'}
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          setStep(1);
                          setHouseholdSize(null);
                          setDesiredUnitType('');
                          setAnnualIncome('');
                          setMoveTiming('');
                          setFirstName('');
                          setLastName('');
                          setEmail('');
                          setPhone('');
                          setConsent(false);
                          setAssessment(null);
                          setTransferAuthorized(false);
                          if (typeof window !== 'undefined') {
                            localStorage.removeItem('amana_screener_assessment');
                            localStorage.removeItem('amana_screener_first_name');
                            localStorage.removeItem('amana_screener_phone');
                            localStorage.removeItem('amana_screener_lead_id');
                            localStorage.removeItem('amana_screener_transfer_authorized');
                          }
                        }}
                        className="inline-flex items-center gap-1 px-5 py-2.5 rounded-lg border border-neutral-sand text-charcoal-body text-xs font-semibold hover:bg-neutral-linen/25 transition-all focus:outline-none"
                      >
                        Restart Screener
                      </button>
                    )}
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
      </section>




      {/* Units Section - Show only for Standard Path */}
      {step === 6 && assessment && assessment.result === 'likely_fit' && (
        <section id="units" className="py-20 sm:py-28 bg-neutral-linen/35 border-t border-b border-neutral-sand/15 animate-fade-in">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            
            <div className="text-center mb-16 max-w-2xl mx-auto">
              <h2 className="text-3xl sm:text-4xl font-display font-semibold text-charcoal-dark mb-4">
                Apartment Floor Plans
              </h2>
              <p className="text-charcoal-muted mb-3">
                Explore our range of 64 income-qualified rental units tailored to meet various household needs.
              </p>
              <span className="inline-block px-3 py-1 bg-brand-gold/10 border border-brand-gold/20 text-[#cda26b] text-xs font-semibold rounded-full uppercase tracking-wider">
                64 Total Residences
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
              {units.map((unit, idx) => {
                const imageUrl = unit.type === 'Studio' 
                  ? '/images/amana_studio.png' 
                  : unit.type === 'One Bedroom' 
                  ? '/images/amana_one_bedroom.png' 
                  : '/images/amana_two_bedroom.png';
                return (
                  <div key={idx} className="bg-white border border-neutral-sand/25 shadow-md rounded-2xl overflow-hidden flex flex-col justify-between group">
                    <div>
                      {/* Top Image Render */}
                      <div className="relative w-full aspect-[4/3] bg-neutral-sand/10 overflow-hidden">
                        <Image
                          src={imageUrl}
                          alt={`${unit.type} Floor Plan`}
                          fill
                          className="object-cover group-hover:scale-[1.03] transition-transform duration-500 ease-out"
                        />
                      </div>
                      
                      <div className="p-8 pb-0">
                        <div className="flex justify-between items-start mb-6">
                          <h3 className="text-2xl font-display font-semibold text-charcoal-dark">{unit.type}</h3>
                          <span className="px-2.5 py-1 text-xs font-semibold bg-neutral-linen text-charcoal-muted rounded-full">
                            {unit.count}
                          </span>
                        </div>
                        
                        <div className="space-y-4 mb-8">
                          <div className="flex justify-between text-sm py-2 border-b border-neutral-sand/10">
                            <span className="text-charcoal-muted">Estimated Area</span>
                            <span className="font-semibold text-charcoal-dark">{unit.size}</span>
                          </div>
                          <div className="flex justify-between text-sm py-2 border-b border-neutral-sand/10">
                            <span className="text-charcoal-muted">Monthly Rent</span>
                            <span className="font-semibold text-[#cda26b]">{unit.rent}</span>
                          </div>
                          <div className="flex justify-between text-sm py-2 border-b border-neutral-sand/10">
                            <span className="text-charcoal-muted">Lease Term</span>
                            <span className="font-semibold text-charcoal-dark">{unit.term}</span>
                          </div>
                          <div className="flex justify-between text-sm py-2 border-b border-neutral-sand/10">
                            <span className="text-charcoal-muted">Occupancy Limit</span>
                            <span className="font-semibold text-charcoal-dark">{unit.occupancy}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="px-8 pb-8">
                      <Link
                        href="#how-it-works"
                        className="w-full block text-center py-3.5 bg-neutral-ivory hover:bg-[#dcae76] hover:text-[#1c1a17] border border-neutral-sand text-charcoal-body text-sm font-semibold rounded-xl transition-all focus:outline-none"
                      >
                        View Leasing Process
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="max-w-2xl mx-auto text-center bg-white p-5 rounded-xl border border-neutral-sand/25 text-xs text-charcoal-muted leading-relaxed shadow-sm">
              <strong>Notice:</strong> Final rents, availability, and application timing will be published when approved. Rents and income qualification thresholds are subject to change based on municipal regulatory review.
            </div>

          </div>
        </section>
      )}

      {/* Alternative Housing Resources - Show for Under-qualified Path */}
      {step === 6 && assessment && assessment.result === 'under_qualified' && (
        <section className="py-20 sm:py-28 bg-neutral-linen/35 border-t border-b border-neutral-sand/15 animate-fade-in">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            
            <div className="text-center mb-16 max-w-2xl mx-auto">
              <h2 className="text-3xl sm:text-4xl font-display font-semibold text-charcoal-dark mb-4">
                Community Housing Resources
              </h2>
              <p className="text-charcoal-muted mb-3">
                Since your income range falls below our workforce affordable thresholds, we recommend exploring these local assistance and rental subsidy programs.
              </p>
              <span className="inline-block px-3 py-1 bg-brand-gold/10 border border-brand-gold/20 text-[#cda26b] text-xs font-semibold rounded-full uppercase tracking-wider">
                Support Options Available
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
              {/* Honolulu County Section 8 */}
              <div className="bg-white border border-neutral-sand/25 shadow-md rounded-2xl overflow-hidden flex flex-col justify-between group">
                <div>
                  <div className="relative w-full aspect-[16/10] bg-neutral-sand/10 overflow-hidden">
                    <Image
                      src="/images/county_support.png"
                      alt="County Support Program"
                      fill
                      className="object-cover group-hover:scale-[1.03] transition-transform duration-500 ease-out"
                    />
                  </div>
                  
                  <div className="p-8">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-2xl font-display font-semibold text-charcoal-dark">Hawaii Public Housing Authority</h3>
                      <span className="px-2.5 py-1 text-[10px] font-semibold bg-green-50 text-green-700 border border-green-200 rounded-full uppercase">
                        Active Subsidies
                      </span>
                    </div>
                    
                    <p className="text-sm text-charcoal-muted leading-relaxed mb-6">
                      Instead of waiting on closed county lists, the HPHA frequently updates open waitlists for Low-Income Housing Tax Credit (LIHTC) properties and active state subsidized vacancies across Honolulu.
                    </p>
                  </div>
                </div>

                <div className="px-8 pb-8">
                  <a
                    href="https://www.hpha.hawaii.gov/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full block text-center py-3.5 bg-neutral-ivory hover:bg-[#dcae76] hover:text-[#1c1a17] border border-neutral-sand text-charcoal-body text-sm font-semibold rounded-xl transition-all focus:outline-none"
                  >
                    View Active State Waitlists &rarr;
                  </a>
                </div>
              </div>

              {/* AUW 2-1-1 */}
              <div className="bg-white border border-neutral-sand/25 shadow-md rounded-2xl overflow-hidden flex flex-col justify-between group">
                <div>
                  <div className="relative w-full aspect-[16/10] bg-neutral-sand/10 overflow-hidden">
                    <Image
                      src="/images/housing_assistance.png"
                      alt="Housing Assistance Help"
                      fill
                      className="object-cover group-hover:scale-[1.03] transition-transform duration-500 ease-out"
                    />
                  </div>
                  
                  <div className="p-8">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-2xl font-display font-semibold text-charcoal-dark">Aloha United Way 2-1-1</h3>
                      <span className="px-2.5 py-1 text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200 rounded-full uppercase">
                        Community Helpline
                      </span>
                    </div>
                    
                    <p className="text-sm text-charcoal-muted leading-relaxed mb-6">
                      AUW 2-1-1 is Hawaii&apos;s only comprehensive community helpline. Connect with local specialists to find emergency financial assistance, food services, rent support, utility help, and transitional shelter.
                    </p>
                  </div>
                </div>

                <div className="px-8 pb-8">
                  <a
                    href="https://www.auw211.org"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full block text-center py-3.5 bg-neutral-ivory hover:bg-[#dcae76] hover:text-[#1c1a17] border border-neutral-sand text-charcoal-body text-sm font-semibold rounded-xl transition-all focus:outline-none"
                  >
                    Connect to AUW 2-1-1 &rarr;
                  </a>
                </div>
              </div>
            </div>

          </div>
        </section>
      )}

      {/* Premium Residences Showcase - Show for Over-qualified Path */}
      {step === 6 && assessment && assessment.result === 'outside_range' && (
        <section className="py-20 sm:py-28 bg-neutral-linen/35 border-t border-b border-neutral-sand/15 animate-fade-in">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            
            <div className="text-center mb-16 max-w-2xl mx-auto">
              <h2 className="text-3xl sm:text-4xl font-display font-semibold text-charcoal-dark mb-4">
                Premium Residences Showcase
              </h2>
              <p className="text-charcoal-muted mb-3">
                Since your income range exceeds the workforce housing program caps, we recommend checking these premium market-rate offerings in our Honolulu portfolio.
              </p>
              <span className="inline-block px-3 py-1 bg-brand-gold/10 border border-brand-gold/20 text-[#cda26b] text-xs font-semibold rounded-full uppercase tracking-wider">
                Market-Rate Options
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
              {/* Sky Ala Moana */}
              <div className="bg-white border border-neutral-sand/25 shadow-md rounded-2xl overflow-hidden flex flex-col justify-between group">
                <div>
                  <div className="relative w-full aspect-[16/10] bg-neutral-sand/10 overflow-hidden">
                    <Image
                      src="/images/sky_ala_moana.png"
                      alt="Sky Ala Moana Premium Condominium"
                      fill
                      className="object-cover group-hover:scale-[1.03] transition-transform duration-500 ease-out"
                    />
                  </div>
                  
                  <div className="p-8">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-2xl font-display font-semibold text-charcoal-dark">The Flats at Sky Ala Moana</h3>
                      <span className="px-2.5 py-1 text-[10px] font-semibold bg-brand-gold/10 text-[#cda26b] border border-brand-gold/20 rounded-full uppercase tracking-wider">
                        Premium High-Rise
                      </span>
                    </div>
                    
                    <p className="text-sm text-charcoal-muted leading-relaxed mb-6">
                      Located right next door, Sky Ala Moana features upscale studio, one-bedroom, and two-bedroom residences. Enjoy resort-style amenities including an expansive pool deck, fitness center, spas, and cabanas.
                    </p>
                  </div>
                </div>

                <div className="px-8 pb-8">
                  <a
                    href="https://skyalamoana.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full block text-center py-3.5 bg-neutral-ivory hover:bg-[#dcae76] hover:text-[#1c1a17] border border-neutral-sand text-charcoal-body text-sm font-semibold rounded-xl transition-all focus:outline-none"
                  >
                    Explore Sky Ala Moana &rarr;
                  </a>
                </div>
              </div>

              {/* Amana Lofts Penthouses */}
              <div className="bg-white border border-neutral-sand/25 shadow-md rounded-2xl overflow-hidden flex flex-col justify-between group">
                <div>
                  <div className="relative w-full aspect-[16/10] bg-neutral-sand/10 overflow-hidden">
                    <Image
                      src="/images/amana_penthouse.png"
                      alt="Amana Lofts Penthouse Collection"
                      fill
                      className="object-cover group-hover:scale-[1.03] transition-transform duration-500 ease-out"
                    />
                  </div>
                  
                  <div className="p-8">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-2xl font-display font-semibold text-charcoal-dark">Amana Loft Penthouses</h3>
                      <span className="px-2.5 py-1 text-[10px] font-semibold bg-brand-gold/10 text-[#cda26b] border border-brand-gold/20 rounded-full uppercase tracking-wider">
                        Market Rate
                      </span>
                    </div>
                    
                    <p className="text-sm text-charcoal-muted leading-relaxed mb-6">
                      A select collection of premier, top-floor market-rate penthouses within Amana Lofts. Featuring upgraded appliances, expansive city and ocean views, and soaring 12-foot vertical volumes.
                    </p>
                  </div>
                </div>

                <div className="px-8 pb-8">
                  <a
                    href="mailto:sales@amanalofts.com?subject=Penthouse Inquiry"
                    className="w-full block text-center py-3.5 bg-neutral-ivory hover:bg-[#dcae76] hover:text-[#1c1a17] border border-neutral-sand text-charcoal-body text-sm font-semibold rounded-xl transition-all focus:outline-none"
                  >
                    Request Callback for Penthouses &rarr;
                  </a>
                </div>
              </div>
            </div>

          </div>
        </section>
      )}

      {/* Location Map Section - Show only for Standard and Priority Paths */}
      {step === 6 && assessment && (assessment.result === 'likely_fit' || assessment.result === 'needs_review') && (
        <section 
          id="location" 
          className="relative py-28 bg-cover bg-center animate-fade-in z-10 border-b border-neutral-sand/15 overflow-hidden"
          style={{ backgroundImage: "url('/images/ala_moana_aerial_map.jpg')" }}
        >
          {/* Dark Overlay for Legibility */}
          <div className="absolute inset-0 bg-charcoal-dark/55 z-0" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
              
              {/* Left Column: Heading, description, and maps button */}
              <div className="lg:col-span-5 space-y-6">
                <div className="inline-flex p-3 bg-white/10 rounded-2xl text-[#dcae76] border border-white/10">
                  <MapPin className="w-6 h-6" />
                </div>
                <h2 
                  className="text-3xl sm:text-4xl font-serif font-light tracking-wide leading-tight"
                  style={{ color: 'white' }}
                >
                  Everything Ala Moana Has to Offer
                </h2>
                <p className="text-neutral-sand/90 leading-relaxed text-sm sm:text-base">
                  Located at 765 Amana Street, Amana Lofts places you at the center of Honolulu&apos;s most walkable and transit-friendly district. Walk to grocery stores, beaches, shopping center terminals, and primary employment zones.
                </p>
                <div className="pt-2">
                  <a
                    href="https://maps.google.com/?q=765+Amana+Street+Honolulu+HI+96814"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-6 py-3.5 bg-[#dcae76] hover:bg-[#cda26b] active:scale-[0.98] text-[#1c1a17] font-semibold text-xs rounded-xl tracking-wider uppercase transition-all focus:outline-none shadow-md"
                  >
                    Open in Google Maps
                    <ArrowUpRight className="w-4 h-4" />
                  </a>
                </div>
              </div>

              {/* Right Column: Glassmorphic Grid of Landmarks */}
              <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
                {landmarks.map((lm, idx) => (
                  <div 
                    key={idx} 
                    className="flex justify-between items-center p-5 bg-[#1c1a17]/65 backdrop-blur-md border border-white/10 rounded-2xl hover:bg-[#1c1a17]/85 hover:border-[#dcae76]/50 transition-all duration-300 group shadow-md"
                  >
                    <div>
                      <span className="block font-semibold text-white text-sm">{lm.name}</span>
                      <span className="block text-xs font-semibold text-[#dcae76] mt-0.5">{lm.distance}</span>
                    </div>
                    <span className="text-xs font-semibold text-white whitespace-nowrap bg-white/10 border border-white/10 px-3 py-1.5 rounded-lg group-hover:bg-[#dcae76] group-hover:text-[#1c1a17] transition-all duration-300">
                      {lm.time}
                    </span>
                  </div>
                ))}
              </div>

            </div>
          </div>
        </section>
      )}

      {/* How It Works Section - Show for Standard and Priority Paths */}
      {step === 6 && assessment && (assessment.result === 'likely_fit' || assessment.result === 'needs_review') && (
        <section id="how-it-works" className="py-28 bg-[#f4f0ea] animate-fade-in relative z-10 border-b border-neutral-sand/15">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16 max-w-3xl mx-auto">
              <span className="text-xs font-semibold text-[#cda26b] uppercase tracking-widest block mb-2">Leasing Steps</span>
              <h2 className="text-3xl sm:text-4xl font-serif font-light text-charcoal-dark tracking-wide leading-tight mb-4">
                How It Works
              </h2>
              <p className="text-charcoal-muted leading-relaxed text-sm sm:text-base">
                Follow our 6-step compliance process to secure your loft.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                { step: "01", title: "Verify Income", desc: "Verify income guidelines.", img: "/images/verify_income.png" },
                { step: "02", title: "Join List", desc: "Get launch date notifications.", img: "/images/join_list.png" },
                { step: "03", title: "Prepare Documents", desc: "Collect paystubs & tax files.", img: "/images/prepare_documents.png" },
                { step: "04", title: "Submit Application", desc: "Submit file when window opens.", img: "/images/submit_application.png" },
                { step: "05", title: "Compliance Review", desc: "Verification of your assets.", img: "/images/compliance_review.png" },
                { step: "06", title: "Final Placement", desc: "Sign lease & secure loft.", img: "/images/final_placement.png" }
              ].map((item, idx) => (
                <div key={idx} className="bg-white border border-neutral-sand/25 shadow-md rounded-2xl overflow-hidden flex flex-col justify-between group">
                  <div className="relative w-full aspect-[16/10] bg-neutral-sand/10 overflow-hidden">
                    <Image
                      src={item.img}
                      alt={item.title}
                      fill
                      className="object-cover group-hover:scale-[1.03] transition-transform duration-500 ease-out"
                    />
                  </div>
                  <div className="p-6">
                    <div className="flex gap-3 items-center mb-2">
                      <span className="text-xs font-serif font-bold text-[#cda26b] bg-[#dcae76]/10 px-2.5 py-1 rounded-md">
                        {item.step}
                      </span>
                      <h3 className="text-base font-semibold text-charcoal-dark">{item.title}</h3>
                    </div>
                    <p className="text-xs text-charcoal-muted leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Document Checklist Section - Show for Standard and Priority Paths */}
      {step === 6 && assessment && (assessment.result === 'likely_fit' || assessment.result === 'needs_review') && (
        <section id="checklist" className="py-28 bg-[#faf8f5] animate-fade-in relative z-10 border-b border-neutral-sand/15">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16 max-w-3xl mx-auto">
              <span className="text-xs font-semibold text-[#cda26b] uppercase tracking-widest block mb-2">Verification</span>
              <h2 className="text-3xl sm:text-4xl font-serif font-light text-charcoal-dark tracking-wide leading-tight mb-4">
                Required Documents
              </h2>
              <p className="text-charcoal-muted leading-relaxed text-sm sm:text-base">
                Honolulu regulations require income certification. Prepare these four items:
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
              {[
                { title: "Photo ID", desc: "Government photo ID.", img: "/images/photo_id.png" },
                { title: "Paystubs", desc: "Last 2-3 months of stubs.", img: "/images/paystubs.png" },
                { title: "Bank Statements", desc: "2 months of statements.", img: "/images/bank_statements.png" },
                { title: "Tax Filings", desc: "Recent tax return & W-2.", img: "/images/tax_filings.png" }
              ].map((doc, idx) => (
                <div key={idx} className="bg-white border border-neutral-sand/25 shadow-md rounded-2xl overflow-hidden flex flex-col justify-between group">
                  <div className="relative w-full aspect-square bg-neutral-sand/10 overflow-hidden">
                    <Image
                      src={doc.img}
                      alt={doc.title}
                      fill
                      className="object-cover group-hover:scale-[1.03] transition-transform duration-500 ease-out"
                    />
                  </div>
                  <div className="p-6">
                    <h3 className="text-base font-semibold text-charcoal-dark mb-1">{doc.title}</h3>
                    <p className="text-xs text-charcoal-muted leading-relaxed">{doc.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-center">
              <div className="inline-flex items-center gap-3 bg-[#dcae76]/10 border border-[#dcae76]/20 rounded-xl px-5 py-3.5 shadow-sm">
                <CheckCircle2 className="w-4 h-4 text-[#cda26b] flex-shrink-0" />
                <span className="text-xs font-semibold text-charcoal-dark uppercase tracking-wider">A full checklist was sent to your email.</span>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* FAQ Section - Show only for Standard and Priority Paths */}
      {step === 6 && assessment && (assessment.result === 'likely_fit' || assessment.result === 'needs_review') && (
        <section id="faq" className="py-28 bg-[#f4f0ea] animate-fade-in relative z-10 border-b border-neutral-sand/15">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
              
              {/* Left Column: Heading and Large Building Rendering */}
              <div className="lg:col-span-5 lg:sticky lg:top-8 space-y-6">
                <span className="text-xs font-semibold text-[#cda26b] uppercase tracking-widest block">Learn More</span>
                <h2 className="text-3xl sm:text-4xl font-serif font-light text-charcoal-dark tracking-wide leading-tight">
                  Frequently Asked Questions
                </h2>
                <p className="text-charcoal-muted leading-relaxed text-sm sm:text-base">
                  Find answers on leasing and qualifications.
                </p>
                
                {/* Large Exterior Rendering */}
                <div className="relative w-full aspect-[4/3] rounded-[24px] overflow-hidden shadow-lg border border-neutral-sand/20">
                  <Image
                    src="/images/Exterior-of-planned-765-Amana-Street-project.webp"
                    alt="Amana Lofts Planned Building Exterior Rendering"
                    fill
                    className="object-cover"
                  />
                </div>
              </div>

              {/* Right Column: Accordion Toggles */}
              <div className="lg:col-span-7 space-y-4">
                {faqData.map((faq, idx) => {
                  const isOpen = openFaq === idx;
                  return (
                    <div key={idx} className="bg-white border border-neutral-sand/20 rounded-2xl overflow-hidden shadow-2xs transition-all duration-300">
                      <button
                        onClick={() => toggleFaq(idx)}
                        className="w-full flex items-center justify-between p-5 text-left focus:outline-none hover:bg-neutral-linen/10 transition-colors"
                      >
                        <span className="font-semibold text-charcoal-dark text-sm sm:text-base pr-4">{faq.q}</span>
                        <span className={`p-1.5 rounded-full transition-colors flex-shrink-0 ${isOpen ? 'bg-[#dcae76]/20 text-[#cda26b]' : 'bg-[#f5f0eb] text-charcoal-muted'}`}>
                          {isOpen ? <Minus className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                        </span>
                      </button>
                      {isOpen && (
                        <div className="px-5 pb-5 pt-1.5 text-xs sm:text-sm text-charcoal-muted border-t border-neutral-sand/10 leading-relaxed bg-[#fdfcfb]">
                          {faq.a}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

            </div>
          </div>
        </section>
      )}

      {/* Launch Updates Capture Section - Show for Standard and Priority Paths */}
      {step === 6 && assessment && (assessment.result === 'likely_fit' || assessment.result === 'needs_review') && !wantsUpdates && (
        <section id="join-updates" className="py-28 bg-[#faf8f5] text-center animate-fade-in relative z-10 border-b border-neutral-sand/15">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 relative z-10">
            <div className="bg-white border border-neutral-sand/25 rounded-[32px] p-8 sm:p-12 shadow-lg">
              <div className="inline-flex p-3 bg-[#dcae76]/10 rounded-2xl text-[#cda26b] mb-6 border border-[#dcae76]/20 shadow-xs">
                <Bookmark className="w-5 h-5" />
              </div>
              <h2 className="text-3xl sm:text-4xl font-serif font-light text-charcoal-dark mb-4 leading-tight">
                Join Amana Lofts Launch List
              </h2>
              <p className="text-charcoal-muted max-w-lg mx-auto mb-8 text-sm sm:text-base leading-relaxed">
                Sign up to receive development updates, municipal assessment timelines, and leasing instructions directly in your inbox.
              </p>

              {updatesStatus === 'success' ? (
                <div className="max-w-md mx-auto p-8 bg-green-50/10 border border-green-500/20 rounded-2xl">
                  <Check className="w-8 h-8 text-green-600 mx-auto mb-4" />
                  <h3 className="font-semibold text-green-800 text-lg mb-2">You&apos;re on the list!</h3>
                  <p className="text-xs sm:text-sm text-green-700/80">
                    Thank you for signing up. We will notify you when applications open or new guidelines are released.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleUpdatesSubmit} className="max-w-lg mx-auto flex flex-col gap-4">
                  {updatesStatus === 'error' && (
                    <p className="text-sm text-red-600 bg-red-50 p-4 rounded-xl border border-red-500/20 mb-2">
                      Failed to sign up. Please check your inputs or try again.
                    </p>
                  )}
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <input
                      type="text"
                      required
                      placeholder="Your Name"
                      value={updatesName}
                      onChange={(e) => setUpdatesName(e.target.value)}
                      disabled={updatesStatus === 'loading'}
                      className="w-full px-5 py-3.5 border border-neutral-sand/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#dcae76]/30 focus:border-[#dcae76] text-sm bg-white text-charcoal-dark placeholder:text-charcoal-muted/50 transition-all"
                    />
                    <input
                      type="email"
                      required
                      placeholder="Email Address"
                      value={updatesEmail}
                      onChange={(e) => setUpdatesEmail(e.target.value)}
                      disabled={updatesStatus === 'loading'}
                      className="w-full px-5 py-3.5 border border-neutral-sand/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#dcae76]/30 focus:border-[#dcae76] text-sm bg-white text-charcoal-dark placeholder:text-charcoal-muted/50 transition-all"
                    />
                  </div>
                  
                  <button
                    type="submit"
                    disabled={updatesStatus === 'loading'}
                    className="w-full px-8 py-3.5 bg-[#dcae76] hover:bg-[#cda26b] active:scale-[0.98] text-[#1c1a17] rounded-xl text-sm font-semibold tracking-wider uppercase transition-all shadow-md focus:outline-none self-center mt-2"
                  >
                    {updatesStatus === 'loading' ? 'Joining...' : 'Subscribe to Updates'}
                  </button>
                  
                  <p className="text-xs text-charcoal-muted leading-relaxed mt-4 max-w-md mx-auto">
                    By joining, you agree to receive project emails. We value privacy and never share credentials. You can unsubscribe at any time.
                  </p>
                </form>
              )}
            </div>
          </div>
        </section>
      )}


      {/* Footer Disclaimer/Credits */}
      <footer className="bg-charcoal-dark text-neutral-sand/75 border-t border-neutral-sand/10 pt-16 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="grid grid-cols-1 md:grid-cols-12 gap-10 border-b border-neutral-sand/10 pb-12 mb-10 text-left">
            
            <div className="md:col-span-5">
              <h3 className="font-display font-bold text-2xl text-white tracking-wider mb-4">AMANA LOFTS</h3>
              <p className="text-xs text-neutral-sand/65 leading-relaxed max-w-sm mb-4">
                An income-qualified residential complex featuring 64 studio, one-bedroom, and two-bedroom rental options. Nestled in Ala Moana, Honolulu.
              </p>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 text-white rounded-full text-xs font-semibold">
                <Shield className="w-3.5 h-3.5 text-brand-gold" />
                Equal Housing Opportunity
              </span>
            </div>

            <div className="md:col-span-4 text-xs space-y-2">
              <h4 className="font-semibold text-white text-xs uppercase tracking-wider mb-4">Location Details</h4>
              <p className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-brand-gold flex-shrink-0 mt-0.5" />
                <span>765 Amana Street, Honolulu, HI 96814</span>
              </p>
              <p className="pt-2 text-neutral-sand/55">
                Developed by <strong>JL Capital</strong>
              </p>
              <p className="text-neutral-sand/55">
                Represented/Managed by <strong>Associated Real Estate Advisors</strong>
              </p>
            </div>

            <div className="md:col-span-3 text-xs space-y-4">
              <h4 className="font-semibold text-white text-xs uppercase tracking-wider mb-0">Legal Information</h4>
              <div className="flex flex-col gap-2">
                <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
                <Link href="/disclaimer" className="hover:text-white transition-colors">Terms of Use & Disclaimers</Link>
              </div>
            </div>

          </div>

          <div className="text-left text-xs text-neutral-sand/65 leading-relaxed space-y-4">
            <p>
              <strong>Compliance Statement:</strong> Amana Lofts does not discriminate on the basis of race, color, national origin, religion, sex, familial status, disability, sexual orientation, or gender identity. Preliminary screening metrics do not guarantee placement. Rental rates and qualifying parameters are subject to the official municipal guidelines for Honolulu County.
            </p>
            <p>
              <strong>Regulatory Disclaimer:</strong> This website serves as a preliminary informational portal. Final rental approvals, document compliance verifications, lease signings, monthly rental costs, and availability dates are governed strictly by the approved program guidelines and administrative review.
            </p>
            <p className="text-center pt-8 border-t border-neutral-sand/5 text-neutral-sand/40">
              &copy; {new Date().getFullYear()} Amana Lofts. All Rights Reserved.
            </p>
          </div>

        </div>
      </footer>

    </div>
  );
}
