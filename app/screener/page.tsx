'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  Users, 
  Home, 
  DollarSign, 
  Calendar, 
  Mail, 
  ArrowLeft, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle, 
  HelpCircle,
  FileText,
  FileCheck,
  ChevronRight,
  ClipboardList,
  Building,
  Phone,
  Sparkles,
  ArrowUpRight,
  Shield,
  Coins,
  Bookmark,
  MapPin,
  Minus,
  Plus,
  Check
} from 'lucide-react';
import { evaluateEligibility } from '@/lib/eligibility';
import { EligibilityResult } from '@/lib/types';

export default function ScreenerPage() {
  // Wizard Steps: 
  // 1: Household Size
  // 2: Unit Type
  // 3: Income
  // 4: Timing & Updates
  // 5: Contact Details
  // 6: Result Outcome
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Form State
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

  // Inline FAQ and Updates States
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [updatesName, setUpdatesName] = useState('');
  const [updatesEmail, setUpdatesEmail] = useState('');
  const [updatesStatus, setUpdatesStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const handleUpdatesSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!updatesEmail || !updatesName) return;

    setUpdatesStatus('loading');
    try {
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          first_name: updatesName.split(' ')[0] || updatesName,
          last_name: updatesName.split(' ').slice(1).join(' ') || 'Updates',
          email: updatesEmail,
          phone: '000-000-0000',
          household_size: 1,
          desired_unit_type: 'studio',
          annual_income: '0',
          move_timing: 'flexible',
          wants_updates: true,
          consent: true,
        }),
      });
      if (response.ok) {
        setUpdatesStatus('success');
      } else {
        setUpdatesStatus('error');
      }
    } catch (err) {
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

  const faqData = [
    {
      q: "Who qualifies for housing at Amana Lofts?",
      a: "Amana Lofts is an income-qualified rental housing community. Households must meet City & County of Honolulu guidelines. Eligible household gross income is capped at 80% of the Area Median Income (AMI), depending on household size."
    },
    {
      q: "What does 80% AMI mean?",
      a: "Area Median Income (AMI) is the midpoint income level for a specific region. For Amana Lofts, applicants' gross annual household income must be at or below 80% of Honolulu's median income. The published 2026 limits range from $86,240 for a single person to $133,120 for a household of five."
    },
    {
      q: "When do leasing applications open?",
      a: "Applications are not yet open. Project construction is tracking toward completion in Summer 2026. Official application packets, timing, and leasing instructions will be sent to members of our launch updates list as soon as they are approved."
    },
    {
      q: "Are the monthly rents posted yet?",
      a: "Rents are currently listed as TBD. Final approved monthly rental rates and utilities breakdowns will be officially published prior to the application launch, subject to guidelines."
    },
    {
      q: "What documents should I begin preparing?",
      a: "We recommend gathering photo IDs, 2 months of consecutive paystubs, 2 months of complete bank statements, and your most recent federal tax returns. Additional documentation may be required during the compliance review process."
    },
    {
      q: "Is parking available at the property?",
      a: "Limited covered garage parking is planned. Vehicle parking is subject to monthly rental fees, availability, and a separate application. The property includes extensive bike racks and access to on-site car-sharing options."
    },
    {
      q: "How are leasing applicants selected?",
      a: "Once applications officially open, all submissions will be processed in accordance with established program guidelines and fair housing regulations. Incomplete files will not be reviewed."
    },
    {
      q: "Is this online screening tool a final eligibility decision?",
      a: "No. This tool is a preliminary self-check only and does not guarantee eligibility, approval, availability, rent, or unit placement. Final eligibility is subject to a full review of your formal application and documents."
    },
    {
      q: "Can I join the launch list if I am unsure if I qualify?",
      a: "Yes. Anyone interested in receiving project status updates, architectural progress reports, and rental updates is welcome to join our launch list, regardless of screening outcomes."
    }
  ];

  // Marketing Tracking
  const [utmParams, setUtmParams] = useState({
    utm_source: '',
    utm_medium: '',
    utm_campaign: '',
    referrer: '',
  });

  // Final Assessment Result State
  const [assessment, setAssessment] = useState<{
    result: EligibilityResult;
    message: string;
    label: string;
  } | null>(null);

  // One-Click Profile Transfer State
  const [transferAuthorized, setTransferAuthorized] = useState(false);
  const [transferLoading, setTransferLoading] = useState(false);
  const [submittedLeadId, setSubmittedLeadId] = useState<string | null>(null);

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

  // Capture UTM parameters and referrer on mount, and load localStorage / previews
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      setUtmParams({
        utm_source: urlParams.get('utm_source') || '',
        utm_medium: urlParams.get('utm_medium') || '',
        utm_campaign: urlParams.get('utm_campaign') || '',
        referrer: document.referrer || '',
      });

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

  // Household sizing options
  const householdSizes = [1, 2, 3, 4, 5];

  // Unit Options
  const unitOptions = [
    { value: 'studio', label: 'Studio', desc: '32 homes (289–346 sq ft)', occupancy: '1–2 people' },
    { value: 'one-bedroom', label: 'One-Bedroom', desc: '20 homes (365–393 sq ft)', occupancy: '1–3 people' },
    { value: 'two-bedroom', label: 'Two-Bedroom', desc: '12 homes (471–561 sq ft)', occupancy: '2–5 people' },
  ];

  // Move-in Timing options
  const timingOptions = [
    { value: 'launch-summer-2026', label: 'Project Launch (Summer 2026)' },
    { value: 'immediate', label: 'As soon as units are ready' },
    { value: 'within-3-months', label: 'Within 3 months of launch' },
    { value: 'flexible', label: 'Flexible / Not sure' },
  ];

  // Validation before changing steps
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

    // Precalculate results for instant UI updates, but API will double check
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
        ...utmParams,
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
      // Submission success, transition to result screen
      setStep(6);
    } catch (err: any) {
      setErrorMessage(err.message || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Progress percentage calculate
  const progressPercent = Math.min(((step - 1) / 5) * 100, 100);

  return (
    <div className="flex-1 flex flex-col w-full bg-neutral-ivory animate-fade-in">
      
      {/* Centered Screener Wizard Container */}
      <section className="max-w-4xl mx-auto w-full px-4 py-12 sm:py-20 flex-1 flex flex-col justify-center">
        <div className="text-center mb-10">
          <h1 className="text-3xl sm:text-4xl font-display font-semibold text-charcoal-dark mb-3">
            {step === 6 ? 'Advisor Placement Report' : 'Preliminary Eligibility Screener'}
          </h1>
          <p className="text-charcoal-muted max-w-lg mx-auto">
            {step === 6 
              ? `Aloha ${firstName || 'Guest'}, here is your preliminary assessment result.`
              : 'Assess your household income qualification for Amana Lofts in Ala Moana in just a few steps.'
            }
          </p>
        </div>

        {/* Progress Indicator */}
        {step < 6 && (
          <div className="w-full max-w-md mx-auto mb-10">
            <div className="flex justify-between items-center text-xs font-semibold text-charcoal-muted mb-2">
              <span>STEP {step} OF 5</span>
              <span>{Math.round(progressPercent)}% COMPLETE</span>
            </div>
            <div className="w-full h-1.5 bg-neutral-sand/30 rounded-full overflow-hidden">
              <div 
                className="h-full bg-brand-gold transition-all duration-500 ease-out"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        )}

        {/* Screener Card Frame */}
        <div className="w-full max-w-2xl mx-auto bg-white border border-neutral-sand/30 shadow-md rounded-md overflow-hidden p-6 sm:p-10 transition-all">
          {step === 1 && (
            <div className="animate-fade-in">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-brand-gold/10 rounded-sm text-brand-gold">
                  <Users className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-display font-semibold text-charcoal-dark">Household Size</h2>
                  <p className="text-sm text-charcoal-muted">Select the total number of people who will live in the apartment.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 mb-8">
                {householdSizes.map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => setHouseholdSize(size)}
                    className={`py-4 rounded-sm border font-medium text-lg transition-all focus:outline-none focus:ring-2 focus:ring-brand-gold/40 ${
                      householdSize === size
                        ? 'border-brand-gold bg-brand-gold/5 text-brand-gold'
                        : 'border-neutral-sand/45 bg-neutral-ivory/30 text-charcoal-body hover:border-neutral-sand'
                    }`}
                  >
                    {size === 5 ? '5+' : size}
                  </button>
                ))}
              </div>

              <p className="text-xs text-charcoal-muted bg-neutral-linen/40 p-3 rounded-sm leading-relaxed mb-6">
                Income eligibility limits are scaled strictly based on household size under City Affordable Rental guidelines.
              </p>
            </div>
          )}

          {step === 2 && (
            <div className="animate-fade-in">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-brand-gold/10 rounded-sm text-brand-gold">
                  <Home className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-display font-semibold text-charcoal-dark">Desired Unit Type</h2>
                  <p className="text-sm text-charcoal-muted">Choose the type of loft-style home you are interested in.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 mb-8">
                {unitOptions.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setDesiredUnitType(opt.value)}
                    className={`flex items-center justify-between p-5 rounded-sm border text-left transition-all focus:outline-none focus:ring-2 focus:ring-brand-gold/40 ${
                      desiredUnitType === opt.value
                        ? 'border-brand-gold bg-brand-gold/5'
                        : 'border-neutral-sand/45 bg-neutral-ivory/30 hover:border-neutral-sand'
                    }`}
                  >
                    <div>
                      <span className="block font-semibold text-charcoal-dark text-lg">{opt.label}</span>
                      <span className="block text-xs text-charcoal-muted mt-1">{opt.desc}</span>
                    </div>
                    <div className="text-right">
                      <span className="inline-block px-2.5 py-1 text-xs font-semibold bg-neutral-sand/20 text-charcoal-muted rounded-full">
                        Occupancy: {opt.occupancy}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="animate-fade-in">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-brand-gold/10 rounded-sm text-brand-gold">
                  <DollarSign className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-display font-semibold text-charcoal-dark">Household Gross Income</h2>
                  <p className="text-sm text-charcoal-muted">Enter your total estimated annual household income before taxes.</p>
                </div>
              </div>

              <div className="mb-8">
                <label htmlFor="income-input" className="block text-sm font-semibold text-charcoal-dark mb-2">
                  Estimated Annual Gross Income (USD)
                </label>
                <div className="relative rounded-sm shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-charcoal-muted">
                    <span className="text-lg font-medium">$</span>
                  </div>
                  <input
                    id="income-input"
                    type="number"
                    required
                    placeholder="85,000"
                    value={annualIncome}
                    onChange={(e) => setAnnualIncome(e.target.value)}
                    className="block w-full pl-10 pr-4 py-4 border border-neutral-sand/50 rounded-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/40 focus:border-brand-gold text-lg font-medium bg-neutral-ivory/20"
                  />
                </div>
                <p className="text-xs text-charcoal-muted mt-3 leading-relaxed">
                  Include all gross wages, salaries, business profits, interest, dividends, social security, pension, alimony, and other recurring household revenue.
                </p>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="animate-fade-in">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-brand-gold/10 rounded-sm text-brand-gold">
                  <Calendar className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-display font-semibold text-charcoal-dark">Timeline & Updates</h2>
                  <p className="text-sm text-charcoal-muted">Let us know your preferred move-in window and updates preference.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 mb-8">
                {timingOptions.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setMoveTiming(opt.value)}
                    className={`p-4 rounded-sm border text-left transition-all font-medium focus:outline-none focus:ring-2 focus:ring-brand-gold/40 ${
                      moveTiming === opt.value
                        ? 'border-brand-gold bg-brand-gold/5 text-brand-gold'
                        : 'border-neutral-sand/45 bg-neutral-ivory/30 text-charcoal-body hover:border-neutral-sand'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>

              <div className="flex items-start gap-3 border-t border-neutral-sand/20 pt-6">
                <input
                  id="wants-updates"
                  type="checkbox"
                  checked={wantsUpdates}
                  onChange={(e) => setWantsUpdates(e.target.checked)}
                  className="mt-1 h-5 w-5 rounded border-neutral-sand text-brand-gold focus:ring-brand-gold/50 cursor-pointer"
                />
                <label htmlFor="wants-updates" className="text-sm text-charcoal-body font-medium select-none cursor-pointer">
                  I would like to receive preliminary launch packets, rent updates, and application opening dates by email.
                </label>
              </div>
            </div>
          )}

          {step === 5 && (
            <form onSubmit={handleSubmit} className="animate-fade-in">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-brand-gold/10 rounded-sm text-brand-gold">
                  <Mail className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-display font-semibold text-charcoal-dark">Contact Information</h2>
                  <p className="text-sm text-charcoal-muted">Complete your details to view your preliminary assessment result.</p>
                </div>
              </div>

              {errorMessage && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-sm flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
                <div>
                  <label htmlFor="first-name" className="block text-xs font-semibold text-charcoal-dark uppercase tracking-wider mb-2">
                    First Name
                  </label>
                  <input
                    id="first-name"
                    type="text"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full px-4 py-3 border border-neutral-sand/50 rounded-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/40 focus:border-brand-gold bg-neutral-ivory/20"
                  />
                </div>
                <div>
                  <label htmlFor="last-name" className="block text-xs font-semibold text-charcoal-dark uppercase tracking-wider mb-2">
                    Last Name
                  </label>
                  <input
                    id="last-name"
                    type="text"
                    required
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full px-4 py-3 border border-neutral-sand/50 rounded-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/40 focus:border-brand-gold bg-neutral-ivory/20"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                <div>
                  <label htmlFor="email" className="block text-xs font-semibold text-charcoal-dark uppercase tracking-wider mb-2">
                    Email Address
                  </label>
                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 border border-neutral-sand/50 rounded-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/40 focus:border-brand-gold bg-neutral-ivory/20"
                  />
                </div>
                <div>
                  <label htmlFor="phone" className="block text-xs font-semibold text-charcoal-dark uppercase tracking-wider mb-2">
                    Phone Number
                  </label>
                  <input
                    id="phone"
                    type="tel"
                    required
                    placeholder="(808) 555-0199"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-4 py-3 border border-neutral-sand/50 rounded-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/40 focus:border-brand-gold bg-neutral-ivory/20"
                  />
                </div>
              </div>

              {/* Consent Box */}
              <div className="flex items-start gap-3 p-4 bg-neutral-linen/35 rounded-sm border border-neutral-sand/20 mb-6">
                <input
                  id="consent-checkbox"
                  type="checkbox"
                  required
                  checked={consent}
                  onChange={(e) => setConsent(e.target.checked)}
                  className="mt-1 h-5 w-5 rounded border-neutral-sand text-brand-gold focus:ring-brand-gold/50 cursor-pointer"
                />
                <label htmlFor="consent-checkbox" className="text-xs text-charcoal-body leading-relaxed select-none cursor-pointer">
                  I consent to being contacted by Amana Lofts representatives regarding this preliminary self-check and program updates. I understand that this screening is not a final approval decision.
                </label>
              </div>

              {/* Mandatory Disclaimer */}
              <p className="text-[11px] text-charcoal-muted border-t border-neutral-sand/25 pt-4 leading-relaxed mb-6">
                <strong>Disclaimer:</strong> This tool is a preliminary self-check only and does not guarantee eligibility, approval, availability, rent amount, or unit placement. Final eligibility, rents, application timing, required documents, and selection process are subject to official published program guidelines and full review.
              </p>
            </form>
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
                  : 'bg-brand-gold/10 border-brand-gold/20 text-brand-gold'
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
                    Aloha {firstName || 'Guest'}, your profile aligns with workforce housing guidelines. We have sent your document checklist by email. An advisor will contact you at <strong className="text-charcoal-dark">{phone}</strong> soon.
                  </p>
                )}
                {assessment.result === 'needs_review' && (
                  <p>
                    Aloha {firstName || 'Guest'}, your profile is close to guidelines. We have queued your details for priority coordinator review. We will contact you at <strong className="text-charcoal-dark">{phone}</strong> to guide you.
                  </p>
                )}
                {assessment.result === 'outside_range' && (
                  <p>
                    Aloha {firstName || 'Guest'}, your income exceeds workforce guidelines. We have unlocked premium market-rate showcases and partner listings for you.
                  </p>
                )}
                {assessment.result === 'under_qualified' && (
                  <p>
                    Aloha {firstName || 'Guest'}, your household income is below workforce guidelines. We have unlocked alternative community rent assistance resources for you.
                  </p>
                )}
              </div>

              {/* One Click Transfer Card */}
              <div className="w-full p-6 rounded-2xl border border-[#dcae76]/25 bg-[#dcae76]/5 text-center mb-6 shadow-xs">
                <div className="flex flex-col items-center gap-3">
                  <FileCheck className="w-6 h-6 text-brand-gold" />
                  <div>
                    <h4 className="font-semibold text-charcoal-dark text-sm uppercase tracking-wider mb-1">
                      One-Click Profile Transfer
                    </h4>
                    <p className="text-xs text-charcoal-muted leading-normal max-w-sm mx-auto mb-4">
                      Match with premium partner properties (like Sky Ala Moana) instantly without re-applying.
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
                        className="px-6 py-3.5 bg-brand-gold hover:bg-brand-gold-dark active:scale-[0.98] text-white font-semibold text-xs rounded-xl tracking-wider transition-all focus:outline-none shadow-xs"
                      >
                        {transferLoading ? 'Enabling...' : 'Enable Portfolio Match'}
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Footer controls for step 6 */}
              <div className="w-full flex flex-col sm:flex-row justify-between items-center gap-4 mt-6 pt-5 border-t border-neutral-sand/25">
                <div className="flex items-center gap-2 text-xs text-charcoal-muted">
                  <Shield className="w-3.5 h-3.5 text-brand-gold" />
                  <span>Your information is secure and private.</span>
                </div>
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
                  className="px-5 py-2.5 border border-neutral-sand/50 hover:bg-neutral-linen/20 text-charcoal-dark text-xs font-semibold rounded-sm transition-all focus:outline-none"
                >
                  Restart Screener
                </button>
              </div>

            </div>
          )}

          {/* Wizard Controls */}
          {step < 6 && (
            <div className="flex justify-between items-center mt-10 pt-6 border-t border-neutral-sand/20">
              {step > 1 ? (
                <button
                  type="button"
                  onClick={handleBack}
                  className="inline-flex items-center gap-2 text-sm font-semibold text-charcoal-muted hover:text-brand-gold transition-colors focus:outline-none"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </button>
              ) : (
                <div />
              )}

              {step < 5 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  disabled={!canGoNext()}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-sm bg-brand-gold disabled:bg-neutral-sand/40 disabled:text-charcoal-muted/50 disabled:cursor-not-allowed hover:bg-brand-gold-dark text-white text-sm font-semibold tracking-wide transition-all shadow-sm focus:outline-none"
                >
                  Continue
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="submit"
                  onClick={handleSubmit}
                  disabled={!canGoNext() || loading}
                  className="inline-flex items-center gap-2 px-7 py-3 rounded-sm bg-brand-gold disabled:bg-neutral-sand/40 disabled:text-charcoal-muted/50 disabled:cursor-not-allowed hover:bg-brand-gold-dark text-white text-sm font-semibold tracking-wide transition-all shadow-sm focus:outline-none"
                >
                  {loading ? 'Submitting...' : 'Submit Assessment'}
                  <CheckCircle2 className="w-4 h-4" />
                </button>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Dynamic Results Sections */}
      {step === 6 && assessment && (
        <div className="w-full">
          
          {/* Units Section - Show only for Standard Path */}
          {assessment.result === 'likely_fit' && (
            <section id="units" className="py-20 sm:py-28 bg-neutral-linen/35 border-t border-b border-neutral-sand/15 animate-fade-in w-full">
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
                            
                            <div className="space-y-3.5 border-t border-neutral-sand/15 pt-6 text-sm text-charcoal-muted mb-8">
                              <div className="flex justify-between">
                                <span>Dimensions</span>
                                <span className="font-semibold text-charcoal-dark">{unit.size}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Monthly Rent</span>
                                <span className="font-semibold text-[#cda26b]">{unit.rent}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Occupancy Guidance</span>
                                <span className="font-semibold text-charcoal-dark">{unit.occupancy}</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="px-8 pb-8">
                          <Link
                            href="/screener"
                            className="w-full block text-center py-3.5 bg-neutral-ivory hover:bg-[#dcae76] hover:text-[#1c1a17] border border-neutral-sand text-charcoal-body text-sm font-semibold rounded-xl transition-all focus:outline-none"
                          >
                            Reserve Unit &rarr;
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="max-w-3xl mx-auto mt-16 p-6 rounded-2xl border border-neutral-sand/20 bg-white shadow-xs text-xs sm:text-sm text-charcoal-muted leading-relaxed text-center">
                  <strong>Notice:</strong> Final rents, availability, and application timing will be published when approved. Rents and income qualification thresholds are subject to change based on municipal regulatory review.
                </div>
              </div>
            </section>
          )}

          {/* Alternative Housing Resources - Show for Under-qualified Path */}
          {assessment.result === 'under_qualified' && (
            <section className="py-20 sm:py-28 bg-neutral-linen/35 border-t border-b border-neutral-sand/15 animate-fade-in w-full">
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
                          <h3 className="text-2xl font-display font-semibold text-charcoal-dark">Honolulu County Section 8</h3>
                          <span className="px-2.5 py-1 text-[10px] font-semibold bg-green-50 text-green-700 border border-green-200 rounded-full uppercase">
                            Government Subsidy
                          </span>
                        </div>
                        <p className="text-sm text-charcoal-muted leading-relaxed mb-6">
                          The Housing Choice Voucher program assists extremely low-income families, elderly, and disabled individuals. Vouchers are applied directly toward rent to make housing affordable in the private market.
                        </p>
                      </div>
                    </div>

                    <div className="px-8 pb-8">
                      <a
                        href="https://www.honolulu.gov/dcs/housing.html"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full block text-center py-3.5 bg-neutral-ivory hover:bg-[#dcae76] hover:text-[#1c1a17] border border-neutral-sand text-charcoal-body text-sm font-semibold rounded-xl transition-all focus:outline-none"
                      >
                        Visit County Housing Office &rarr;
                      </a>
                    </div>
                  </div>

                  {/* Aloha United Way */}
                  <div className="bg-white border border-neutral-sand/25 shadow-md rounded-2xl overflow-hidden flex flex-col justify-between group">
                    <div>
                      <div className="relative w-full aspect-[16/10] bg-neutral-sand/10 overflow-hidden">
                        <Image
                          src="/images/housing_assistance.png"
                          alt="Housing Assistance Directory"
                          fill
                          className="object-cover group-hover:scale-[1.03] transition-transform duration-500 ease-out"
                        />
                      </div>
                      
                      <div className="p-8">
                        <div className="flex justify-between items-start mb-4">
                          <h3 className="text-2xl font-display font-semibold text-charcoal-dark">Aloha United Way 2-1-1</h3>
                          <span className="px-2.5 py-1 text-[10px] font-semibold bg-[#dcae76]/10 text-[#cda26b] border border-brand-gold/20 rounded-full uppercase tracking-wider">
                            Helpline & Care
                          </span>
                        </div>
                        <p className="text-sm text-charcoal-muted leading-relaxed mb-6">
                          AUW 2-1-1 connects families with local resources for food, shelter, rent assistance, utility help, and other social needs. It is free, confidential, and accessible across Hawaii.
                        </p>
                      </div>
                    </div>

                    <div className="px-8 pb-8">
                      <a
                        href="https://www.auw.org/211"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full block text-center py-3.5 bg-neutral-ivory hover:bg-[#dcae76] hover:text-[#1c1a17] border border-neutral-sand text-charcoal-body text-sm font-semibold rounded-xl transition-all focus:outline-none"
                      >
                        Find Rent Assistance Resources &rarr;
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* Premium Residences Showcase - Show for Over-qualified Path */}
          {assessment.result === 'outside_range' && (
            <section className="py-20 sm:py-28 bg-neutral-linen/35 border-t border-b border-neutral-sand/15 animate-fade-in w-full">
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
                          <h3 className="text-2xl font-display font-semibold text-charcoal-dark">Amana Lofts Penthouse Collection</h3>
                          <span className="px-2.5 py-1 text-[10px] font-semibold bg-brand-gold/10 text-[#cda26b] border border-brand-gold/20 rounded-full uppercase tracking-wider">
                            Luxury Residences
                          </span>
                        </div>
                        <p className="text-sm text-charcoal-muted leading-relaxed mb-6">
                          Experience elevated living in our top-tier penthouse suites. Features extra tall ceilings, premium countertops, panoramic floor-to-ceiling city views, and dedicated concierge services.
                        </p>
                      </div>
                    </div>

                    <div className="px-8 pb-8">
                      <Link
                        href="/screener"
                        className="w-full block text-center py-3.5 bg-neutral-ivory hover:bg-[#dcae76] hover:text-[#1c1a17] border border-neutral-sand text-charcoal-body text-sm font-semibold rounded-xl transition-all focus:outline-none"
                      >
                        Inquire About Penthouses &rarr;
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* Document Checklist Section - Show for Standard and Priority Paths */}
          {(assessment.result === 'likely_fit' || assessment.result === 'needs_review') && (
            <section id="checklist" className="py-20 sm:py-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center animate-fade-in w-full">
              <div className="lg:col-span-5 order-2 lg:order-1 relative h-[350px] sm:h-[450px] w-full rounded-[24px] overflow-hidden border border-neutral-sand/20 shadow-lg">
                <Image
                  src="/images/amana-lofts-groundbreaking-053025.webp"
                  alt="Amana Lofts construction updates and groundbreaking"
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 45vw"
                />
              </div>

              <div className="lg:col-span-7 order-1 lg:order-2">
                <div className="inline-flex p-3 bg-brand-gold/10 rounded-xl text-brand-gold mb-5">
                  <ClipboardList className="w-6 h-6" />
                </div>
                <h2 className="text-3xl sm:text-4xl font-display font-semibold text-charcoal-dark mb-4">
                  Required Verification Documents
                </h2>
                <p className="text-charcoal-muted leading-relaxed mb-8 text-sm sm:text-base">
                  Under City and County of Honolulu regulations, all household income variables must be fully certified. We recommend organizing these four key items beforehand to expedite your compliance review.
                </p>
                
                {/* Visual 2x2 Checklist Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                  {[
                    { title: "1. Photo Identification", desc: "Government-issued photo IDs for all adult household members.", icon: Shield },
                    { title: "2. Paystubs", desc: "2–3 months of recent consecutive paystubs for all active employment.", icon: Coins },
                    { title: "3. Bank Statements", desc: "2 months of complete statements for all checking and savings accounts.", icon: FileText },
                    { title: "4. Tax Filings", desc: "Most recent year federal returns (all schedules) and W-2/1099 forms.", icon: FileCheck },
                  ].map((doc, idx) => {
                    const Icon = doc.icon;
                    return (
                      <div key={idx} className="p-5 bg-white border border-neutral-sand/20 rounded-2xl shadow-xs hover:border-[#dcae76]/40 transition-colors flex items-start gap-4">
                        <div className="p-2.5 bg-[#dcae76]/10 text-[#cda26b] rounded-lg flex-shrink-0">
                          <Icon className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-charcoal-dark text-sm mb-1">{doc.title}</h4>
                          <p className="text-xs text-charcoal-muted leading-relaxed">{doc.desc}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
                
                <p className="text-xs font-semibold text-[#cda26b] flex items-center gap-1.5 bg-[#dcae76]/5 border border-[#dcae76]/15 rounded-xl px-4 py-3">
                  <CheckCircle2 className="w-4 h-4 text-[#cdae76] flex-shrink-0" />
                  <span>A full compliance checklist and official self-certification packets have been sent to your email.</span>
                </p>
              </div>
            </section>
          )}

          {/* FAQ Section - Show only for Standard and Priority Paths */}
          {(assessment.result === 'likely_fit' || assessment.result === 'needs_review') && (
            <section id="faq" className="py-20 sm:py-28 bg-neutral-linen/35 border-t border-b border-neutral-sand/15 animate-fade-in w-full">
              <div className="max-w-4xl mx-auto px-4 sm:px-6">
                <div className="text-center mb-16">
                  <h2 className="text-3xl sm:text-4xl font-display font-semibold text-charcoal-dark mb-4">
                    Frequently Asked Questions
                  </h2>
                  <p className="text-charcoal-muted">
                    Find detailed explanations regarding Amana Lofts leasing parameters, timing, and qualifications.
                  </p>
                </div>

                <div className="space-y-4">
                  {faqData.map((faq, idx) => {
                    const isOpen = openFaq === idx;
                    return (
                      <div key={idx} className="bg-white border border-neutral-sand/20 rounded-sm overflow-hidden shadow-sm">
                        <button
                          onClick={() => toggleFaq(idx)}
                          className="w-full flex items-center justify-between p-6 text-left focus:outline-none transition-colors"
                        >
                          <span className="font-semibold text-charcoal-dark text-base sm:text-lg pr-4">{faq.q}</span>
                          <span className="p-1.5 bg-neutral-linen/55 rounded-full text-charcoal-muted">
                            {isOpen ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                          </span>
                        </button>
                        {isOpen && (
                          <div className="px-6 pb-6 pt-1 text-sm text-charcoal-muted leading-relaxed border-t border-neutral-sand/10 bg-neutral-ivory/20">
                            {faq.a}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </section>
          )}

          {/* Launch Updates Capture Section - Show for Standard and Priority Paths */}
          {(assessment.result === 'likely_fit' || assessment.result === 'needs_review') && (
            <section id="join-updates" className="py-20 sm:py-28 bg-white max-w-4xl mx-auto px-4 sm:px-6 text-center animate-fade-in w-full">
              <div className="inline-flex p-3 bg-brand-gold/10 rounded-sm text-brand-gold mb-5">
                <Bookmark className="w-6 h-6" />
              </div>
              <h2 className="text-3xl sm:text-4xl font-display font-semibold text-charcoal-dark mb-4">
                Join Amana Lofts Launch List
              </h2>
              <p className="text-charcoal-muted max-w-lg mx-auto mb-10 text-sm sm:text-base leading-relaxed">
                Sign up to receive development updates, municipal assessment timelines, and leasing instructions directly in your inbox.
              </p>

              {updatesStatus === 'success' ? (
                <div className="max-w-md mx-auto p-8 bg-green-50 border border-green-200 rounded-sm">
                  <Check className="w-10 h-10 text-green-600 mx-auto mb-4" />
                  <h3 className="font-semibold text-green-800 text-lg mb-2">You're on the list!</h3>
                  <p className="text-sm text-green-700">
                    Thank you for signing up. We will notify you when applications open or new guidelines are released.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleUpdatesSubmit} className="max-w-lg mx-auto flex flex-col gap-3">
                  {updatesStatus === 'error' && (
                    <p className="text-sm text-red-600 bg-red-50 p-3 rounded-sm border border-red-200 mb-2">
                      Failed to sign up. Please check your inputs or try again.
                    </p>
                  )}
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      type="text"
                      required
                      placeholder="Your Name"
                      value={updatesName}
                      onChange={(e) => setUpdatesName(e.target.value)}
                      disabled={updatesStatus === 'loading'}
                      className="w-full px-4 py-3.5 border border-neutral-sand/65 rounded-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/40 focus:border-brand-gold text-sm bg-neutral-ivory/10"
                    />
                    <input
                      type="email"
                      required
                      placeholder="Email Address"
                      value={updatesEmail}
                      onChange={(e) => setUpdatesEmail(e.target.value)}
                      disabled={updatesStatus === 'loading'}
                      className="w-full px-4 py-3.5 border border-neutral-sand/65 rounded-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/40 focus:border-brand-gold text-sm bg-neutral-ivory/10"
                    />
                  </div>
                  
                  <button
                    type="submit"
                    disabled={updatesStatus === 'loading'}
                    className="w-full sm:w-auto px-8 py-4 bg-brand-gold hover:bg-brand-gold-dark text-white rounded-sm text-sm font-semibold tracking-wide transition-all shadow-md focus:outline-none self-center mt-2"
                  >
                    {updatesStatus === 'loading' ? 'Joining...' : 'Subscribe to Updates'}
                  </button>
                  
                  <p className="text-[11px] text-charcoal-muted leading-relaxed mt-4 max-w-md mx-auto">
                    By joining, you agree to receive project emails. We value privacy and never share credentials. You can unsubscribe at any time.
                  </p>
                </form>
              )}
            </section>
          )}

        </div>
      )}

      {/* Footer Disclaimer/Credits */}
      <footer className="bg-charcoal-dark text-neutral-sand/75 border-t border-neutral-sand/10 pt-16 pb-12 w-full mt-auto">
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

          <div className="text-left text-[11px] text-neutral-sand/55 leading-relaxed space-y-4">
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
