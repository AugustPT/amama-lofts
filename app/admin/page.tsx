'use client';

import React, { useState, useEffect } from 'react';
import { 
  Lock, 
  Download, 
  Filter, 
  Search, 
  ArrowUpDown, 
  Users,
  CheckCircle,
  HelpCircle,
  AlertOctagon,
  Layers,
  ArrowLeft,
  X,
  Mail,
  ChevronRight,
  TrendingUp,
  Lightbulb,
  Send,
  Building
} from 'lucide-react';
import Link from 'next/link';
import { Lead, EligibilityResult } from '@/lib/types';
import { AMI_LIMITS, OCCUPANCY_GUIDANCE } from '@/lib/eligibility';

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  
  // Leads data
  const [leads, setLeads] = useState<Lead[]>([]);
  const [dbMode, setDbMode] = useState<'supabase' | 'local'>('local');

  // Selected Lead for Detail Modal/Drawer
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  
  // Email simulation states
  const [isSendingReferral, setIsSendingReferral] = useState(false);
  const [referralSentStatus, setReferralSentStatus] = useState<boolean>(false);

  // Filters & Sorting state
  const [searchTerm, setSearchTerm] = useState('');
  const [filterResult, setFilterResult] = useState<string>('all');
  const [filterUnit, setFilterUnit] = useState<string>('all');
  const [filterPortfolio, setFilterPortfolio] = useState<string>('all');
  const [sortField, setSortField] = useState<'created_at' | 'desired_unit_type' | 'annual_income'>('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const verifyAndFetchLeads = async (pwd: string) => {
    setLoading(true);
    setErrorMessage('');
    try {
      const response = await fetch(`/api/admin/leads?password=${encodeURIComponent(pwd)}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to authenticate.');
      }

      setLeads(data.leads || []);
      setDbMode(data.database_mode || 'local');
      setIsAuthenticated(true);
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('admin_session_pwd', pwd);
      }
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : 'Invalid password.';
      setErrorMessage(errMsg);
      setIsAuthenticated(false);
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem('admin_session_pwd');
      }
    } finally {
      setLoading(false);
    }
  };

  // Load password from session storage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedPassword = sessionStorage.getItem('admin_session_pwd');
      if (savedPassword) {
        setTimeout(() => {
          verifyAndFetchLeads(savedPassword);
        }, 0);
      }
    }
  }, []);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) return;
    verifyAndFetchLeads(password);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setPassword('');
    setLeads([]);
    setSelectedLead(null);
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('admin_session_pwd');
    }
  };

  // Metrics Calculation
  const totalLeads = leads.length;
  const likelyFitCount = leads.filter(l => l.eligibility_result === 'likely_fit').length;
  const needsReviewCount = leads.filter(l => l.eligibility_result === 'needs_review').length;
  const outsideRangeCount = leads.filter(l => l.eligibility_result === 'outside_range').length;
  const underQualifiedCount = leads.filter(l => l.eligibility_result === 'under_qualified').length;

  // Filter and Sort leads
  const processedLeads = leads
    .filter((lead) => {
      // 1. Search term match
      const fullName = `${lead.first_name} ${lead.last_name}`.toLowerCase();
      const email = lead.email.toLowerCase();
      const phone = lead.phone.toLowerCase();
      const matchesSearch = fullName.includes(searchTerm.toLowerCase()) || 
                            email.includes(searchTerm.toLowerCase()) || 
                            phone.includes(searchTerm.toLowerCase());

      // 2. Result filter
      const matchesResult = filterResult === 'all' || lead.eligibility_result === filterResult;

      // 3. Unit filter
      const matchesUnit = filterUnit === 'all' || lead.desired_unit_type.toLowerCase() === filterUnit.toLowerCase();

      // 4. Portfolio Option filter
      const matchesPortfolio = filterPortfolio === 'all' || 
                              (filterPortfolio === 'authorized' && !!lead.authorized_transfer) ||
                              (filterPortfolio === 'not_authorized' && !lead.authorized_transfer);
 
      return matchesSearch && matchesResult && matchesUnit && matchesPortfolio;
    })
    .sort((a, b) => {
      let comparison = 0;
      if (sortField === 'created_at') {
        comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      } else if (sortField === 'annual_income') {
        comparison = Number(a.annual_income) - Number(b.annual_income);
      } else if (sortField === 'desired_unit_type') {
        comparison = a.desired_unit_type.localeCompare(b.desired_unit_type);
      }

      return sortOrder === 'desc' ? -comparison : comparison;
    });

  const toggleSort = (field: typeof sortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  // CSV Exporter
  const exportToCSV = () => {
    if (processedLeads.length === 0) return;

    const headers = [
      'ID', 'First Name', 'Last Name', 'Email', 'Phone', 
      'Household Size', 'Desired Unit', 'Annual Income', 'Income Target Detail',
      'Eligibility Result', 'Move Timing', 'Launch updates', 'Consent Given',
      'Portfolio Matching', 'UTM Source', 'UTM Medium', 'UTM Campaign', 'Referrer URL', 'Timestamp (UTC)'
    ];

    const rows = processedLeads.map(lead => [
      lead.id,
      lead.first_name,
      lead.last_name,
      lead.email,
      lead.phone,
      lead.household_size,
      lead.desired_unit_type,
      lead.annual_income,
      `"${lead.income_range_label}"`,
      lead.eligibility_result,
      lead.move_timing,
      lead.wants_updates ? 'Yes' : 'No',
      lead.consent ? 'Yes' : 'No',
      lead.authorized_transfer ? 'Yes' : 'No',
      lead.utm_source || '',
      lead.utm_medium || '',
      lead.utm_campaign || '',
      `"${lead.referrer || ''}"`,
      lead.created_at
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(e => e.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `amana_lofts_leads_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Generate dynamic routing and recommendations based on lead metrics
  const getAIRecommendations = (lead: Lead) => {
    const size = lead.household_size;
    const income = Number(lead.annual_income);
    const unit = lead.desired_unit_type.toLowerCase();
    
    const lookupSize = Math.min(Math.max(size, 1), 5);
    const incomeLimit = AMI_LIMITS[lookupSize] || AMI_LIMITS[5];
    const guidance = OCCUPANCY_GUIDANCE[unit];

    if (lead.eligibility_result === 'likely_fit') {
      return {
        statusText: "Lead is fully qualified under preliminary 80% AMI income guidelines.",
        points: [
          "Include in launch update list for Amana Lofts official application packets.",
          "Check documentation readiness: advise lead to finalize photo ID and recent paystubs.",
          "Estimated target monthly rent aligns with Honolulu County affordable parameters (TBD)."
        ],
        referralDestination: "Amana Lofts standard leasing intake queue",
        nextAction: "Queue Amana Lofts Application Packet on launch."
      };
    }

    if (lead.eligibility_result === 'needs_review') {
      const points = [];
      let destination = "Manual underwriter review";
      let action = "Flag for manual income verify check.";

      if (income > incomeLimit && income <= incomeLimit * 1.10) {
        points.push(`Income ($${income.toLocaleString()}) is within 10% of the 80% AMI limit ($${incomeLimit.toLocaleString()}). Check for variable/seasonal earnings or commissions.`);
        points.push("Advise applicant to gather 2025 W2s, tax returns, and 3 months of bank ledgers to resolve exact gross income.");
      }

      if (guidance) {
        if (size < guidance.min) {
          points.push(`Household size of ${size} is below the recommended occupancy of ${guidance.min} for a ${lead.desired_unit_type}.`);
          const recommendedUnit = size === 1 ? "Studio" : "One-Bedroom";
          points.push(`Recommendation: Suggest switching preference to ${recommendedUnit} to match guidelines.`);
          destination = `Amana Lofts Unit Adjust (${recommendedUnit})`;
          action = `Recommend adjusting unit interest to ${recommendedUnit}.`;
        } else if (size > guidance.max) {
          points.push(`Household size of ${size} exceeds the maximum occupancy of ${guidance.max} for a ${lead.desired_unit_type}.`);
          const recommendedUnit = "Two-Bedroom";
          points.push(`Recommendation: Suggest upgrading unit preference to ${recommendedUnit} to meet occupancy requirements.`);
          destination = `Amana Lofts Unit Adjust (${recommendedUnit})`;
          action = `Recommend adjusting unit interest to ${recommendedUnit}.`;
        }
      }

      return {
        statusText: "Lead has compliance parameters requiring manual review or minor adjustment.",
        points: points.length > 0 ? points : ["Verify household size certification forms.", "Cross-reference all income streams manually."],
        referralDestination: destination,
        nextAction: action
      };
    }

    if (lead.eligibility_result === 'under_qualified') {
      return {
        statusText: "Lead is under-qualified for workforce housing at Amana Lofts due to low income.",
        points: [
          "Refer to county-funded low-income rent assistance programs (Section 8 voucher).",
          "Provide referrals to Aloha United Way 2-1-1 for localized housing assistance options.",
          "Guide applicant to alternative deeply subsidized senior or family housing complexes."
        ],
        referralDestination: "Honolulu County Rental Assistance / Section 8",
        nextAction: "Refer to Aloha United Way and Section 8 housing office."
      };
    }

    // Outside Range (unqualified)
    const points = [];
    let destination = "Market-Rate Partner Properties";
    let action = "Refer to market-rate listings in Ala Moana.";

    if (size > 5) {
      points.push(`Household size of ${size} exceeds the maximum allowable capacity for Amana Lofts two-bedroom units (5 people).`);
      points.push("Guide applicant to family-designated housing projects featuring 3-bedroom or 4-bedroom units in Honolulu (e.g. Halekauwila Place).");
      destination = "Honolulu Family Housing Projects (3+ Bedrooms)";
      action = "Refer to family-designated 3+ bedroom projects.";
    } else if (income > incomeLimit * 1.10) {
      const excess = income - incomeLimit;
      points.push(`Household income ($${income.toLocaleString()}) exceeds the 80% AMI limit ($${incomeLimit.toLocaleString()}) by $${excess.toLocaleString()}.`);
      points.push("Guide applicant to 120% AMI workforce housing programs or market-rate rental units operated by JL Capital partner properties in Ala Moana.");
      destination = "JL Capital Market-Rate Listings / 120% AMI Projects";
      action = "Refer to market-rate partner properties / 120% AMI lists.";
    }

    return {
      statusText: "Household exceeds qualifying thresholds. Guide to alternative housing routes.",
      points: points.length > 0 ? points : ["Refer to general Honolulu County rent assistance programs."],
      referralDestination: destination,
      nextAction: action
    };
  };

  // Simulate future AI auto-referral dispatch
  const handleSendReferral = () => {
    setIsSendingReferral(true);
    setReferralSentStatus(false);
    setTimeout(() => {
      setIsSendingReferral(false);
      setReferralSentStatus(true);
    }, 1200);
  };

  const getResultBadgeClass = (res: EligibilityResult) => {
    switch (res) {
      case 'likely_fit':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'needs_review':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'under_qualified':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'outside_range':
        return 'bg-red-50 text-red-700 border-red-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getResultLabel = (res: EligibilityResult) => {
    switch (res) {
      case 'likely_fit': return 'Likely Fit';
      case 'needs_review': return 'Needs Review';
      case 'under_qualified': return 'Under Qualified';
      case 'outside_range': return 'Outside Range';
      default: return res;
    }
  };

  // Login View
  if (!isAuthenticated) {
    return (
      <main className="flex-1 flex flex-col justify-center items-center px-4 py-24 bg-neutral-linen/25">
        <div className="w-full max-w-md bg-white border border-neutral-sand/35 shadow-lg rounded-md p-8 sm:p-10 text-center animate-scale-up">
          
          <Link href="/" className="inline-flex items-center gap-2 text-xs font-semibold text-charcoal-muted hover:text-brand-gold transition-colors mb-8 focus:outline-none">
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Website
          </Link>

          <div className="inline-flex p-3.5 bg-brand-gold/10 rounded-sm text-brand-gold mb-5">
            <Lock className="w-6 h-6" />
          </div>

          <h1 className="text-2xl font-display font-semibold text-charcoal-dark mb-2">Leads Administration</h1>
          <p className="text-sm text-charcoal-muted mb-6">Enter the administrator password to view captured screening leads.</p>

          {errorMessage && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-sm text-left">
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label htmlFor="admin-password" className="sr-only">Password</label>
              <input
                id="admin-password"
                type="password"
                required
                placeholder="Enter password (default: admin123)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                className="w-full px-4 py-3.5 border border-neutral-sand/50 rounded-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/40 focus:border-brand-gold text-sm bg-neutral-ivory/10 text-center font-medium"
              />
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="w-full px-5 py-3.5 bg-brand-gold hover:bg-brand-gold-dark text-white rounded-sm text-sm font-semibold tracking-wide transition-all shadow-md focus:outline-none"
            >
              {loading ? 'Authenticating...' : 'Sign In'}
            </button>
          </form>
        </div>
      </main>
    );
  }

  // Dashboard View
  return (
    <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 animate-fade-in relative">
      
      {/* Dashboard Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-neutral-sand/20 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-display font-semibold text-charcoal-dark">
            Leads Management Portal
          </h1>
          <p className="text-xs text-charcoal-muted mt-1.5 flex items-center gap-2">
            <span className={`inline-block w-2.5 h-2.5 rounded-full ${dbMode === 'supabase' ? 'bg-green-500' : 'bg-amber-500 animate-pulse'}`} />
            <span>Database Node: <strong className="uppercase">{dbMode}</strong> Mode</span>
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={exportToCSV}
            disabled={processedLeads.length === 0}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-brand-gold text-white text-xs font-semibold rounded-sm hover:bg-brand-gold-dark disabled:opacity-40 disabled:cursor-not-allowed transition-all focus:outline-none shadow-sm"
          >
            <Download className="w-4 h-4" />
            Export CSV ({processedLeads.length})
          </button>
          <button
            onClick={handleLogout}
            className="px-4 py-2.5 border border-neutral-sand hover:bg-neutral-linen/25 text-charcoal-body text-xs font-semibold rounded-sm transition-all focus:outline-none"
          >
            Log Out
          </button>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
        <div className="bg-white border border-neutral-sand/25 p-5 rounded-sm shadow-sm flex items-center gap-4">
          <div className="p-3 bg-brand-gold/10 text-brand-gold rounded-sm">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <span className="block text-xs font-semibold text-charcoal-muted uppercase tracking-wider">Total Leads</span>
            <span className="text-xl sm:text-2xl font-bold text-charcoal-dark">{totalLeads}</span>
          </div>
        </div>

        <div className="bg-white border border-neutral-sand/25 p-5 rounded-sm shadow-sm flex items-center gap-4">
          <div className="p-3 bg-green-50 text-green-600 rounded-sm">
            <CheckCircle className="w-5 h-5" />
          </div>
          <div>
            <span className="block text-xs font-semibold text-charcoal-muted uppercase tracking-wider">Likely Fit</span>
            <span className="text-xl sm:text-2xl font-bold text-charcoal-dark">{likelyFitCount}</span>
          </div>
        </div>

        <div className="bg-white border border-neutral-sand/25 p-5 rounded-sm shadow-sm flex items-center gap-4">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-sm">
            <HelpCircle className="w-5 h-5" />
          </div>
          <div>
            <span className="block text-xs font-semibold text-charcoal-muted uppercase tracking-wider">Needs Review</span>
            <span className="text-xl sm:text-2xl font-bold text-charcoal-dark">{needsReviewCount}</span>
          </div>
        </div>

        <div className="bg-white border border-neutral-sand/25 p-5 rounded-sm shadow-sm flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-sm">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <span className="block text-xs font-semibold text-charcoal-muted uppercase tracking-wider">Under Qualified</span>
            <span className="text-xl sm:text-2xl font-bold text-charcoal-dark">{underQualifiedCount}</span>
          </div>
        </div>

        <div className="bg-white border border-neutral-sand/25 p-5 rounded-sm shadow-sm flex items-center gap-4">
          <div className="p-3 bg-red-50 text-red-500 rounded-sm">
            <AlertOctagon className="w-5 h-5" />
          </div>
          <div>
            <span className="block text-xs font-semibold text-charcoal-muted uppercase tracking-wider">Outside Range</span>
            <span className="text-xl sm:text-2xl font-bold text-charcoal-dark">{outsideRangeCount}</span>
          </div>
        </div>
      </div>

      {/* Filters & Controls */}
      <div className="bg-white border border-neutral-sand/20 rounded-sm shadow-sm p-5 mb-6 flex flex-col lg:flex-row gap-4 items-center justify-between">
        
        {/* Search */}
        <div className="w-full lg:w-80 relative">
          <Search className="w-4 h-4 text-charcoal-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by name, email, phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm border border-neutral-sand/50 rounded-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/30 focus:border-brand-gold"
          />
        </div>

        {/* Filter Controls */}
        <div className="w-full flex flex-col sm:flex-row gap-3 items-stretch justify-end">
          
          <div className="flex items-center gap-2 bg-neutral-ivory/30 px-3.5 py-1 rounded-sm border border-neutral-sand/35">
            <Filter className="w-4 h-4 text-brand-gold flex-shrink-0" />
            <select
              value={filterResult}
              onChange={(e) => setFilterResult(e.target.value)}
              className="text-xs bg-transparent font-semibold text-charcoal-body focus:outline-none border-none py-1 cursor-pointer"
            >
              <option value="all">Outcome: All Results</option>
              <option value="likely_fit">Outcome: Likely Fit</option>
              <option value="needs_review">Outcome: Needs Review</option>
              <option value="under_qualified">Outcome: Under Qualified</option>
              <option value="outside_range">Outcome: Outside Range</option>
            </select>
          </div>

          <div className="flex items-center gap-2 bg-neutral-ivory/30 px-3.5 py-1 rounded-sm border border-neutral-sand/35">
            <Layers className="w-4 h-4 text-brand-gold flex-shrink-0" />
            <select
              value={filterUnit}
              onChange={(e) => setFilterUnit(e.target.value)}
              className="text-xs bg-transparent font-semibold text-charcoal-body focus:outline-none border-none py-1 cursor-pointer"
            >
              <option value="all">Unit Type: All</option>
              <option value="studio">Unit Type: Studio</option>
              <option value="one-bedroom">Unit Type: One-Bedroom</option>
              <option value="two-bedroom">Unit Type: Two-Bedroom</option>
            </select>
          </div>

          <div className="flex items-center gap-2 bg-neutral-ivory/30 px-3.5 py-1 rounded-sm border border-neutral-sand/35">
            <Building className="w-4 h-4 text-brand-gold flex-shrink-0" />
            <select
              value={filterPortfolio}
              onChange={(e) => setFilterPortfolio(e.target.value)}
              className="text-xs bg-transparent font-semibold text-charcoal-body focus:outline-none border-none py-1 cursor-pointer"
            >
              <option value="all">Portfolio Option: All</option>
              <option value="authorized">Portfolio Match Enabled</option>
              <option value="not_authorized">Amana Lofts Only</option>
            </select>
          </div>

        </div>
      </div>

      {/* Leads Table */}
      <div className="bg-white border border-neutral-sand/20 rounded-sm shadow-md overflow-hidden mb-6">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-neutral-linen/40 border-b border-neutral-sand/20 text-xs font-semibold text-charcoal-dark uppercase tracking-wider">
                <th className="p-4 sm:p-5">Applicant</th>
                <th className="p-4 sm:p-5">Preferences</th>
                <th 
                  onClick={() => toggleSort('annual_income')} 
                  className="p-4 sm:p-5 cursor-pointer hover:bg-neutral-linen/60 transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    Annual Income
                    <ArrowUpDown className="w-3.5 h-3.5 text-charcoal-muted" />
                  </div>
                </th>
                <th className="p-4 sm:p-5 text-center">Status</th>
                <th 
                  onClick={() => toggleSort('created_at')} 
                  className="p-4 sm:p-5 cursor-pointer hover:bg-neutral-linen/60 transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    Submitted
                    <ArrowUpDown className="w-3.5 h-3.5 text-charcoal-muted" />
                  </div>
                </th>
                <th className="p-4 sm:p-5 text-right">Actions</th>
              </tr>
            </thead>
            
            <tbody className="divide-y divide-neutral-sand/15 text-sm">
              {processedLeads.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-10 text-center text-charcoal-muted">
                    No matching leads found.
                  </td>
                </tr>
              ) : (
                processedLeads.map((lead) => (
                  <tr 
                    key={lead.id} 
                    onClick={() => { setSelectedLead(lead); setReferralSentStatus(false); }}
                    className="hover:bg-neutral-linen/15 transition-colors cursor-pointer font-sans"
                  >
                    {/* Applicant Info */}
                    <td className="p-4 sm:p-5">
                      <div className="font-semibold text-charcoal-dark flex flex-wrap items-center gap-1.5">
                        <span>{lead.first_name} {lead.last_name}</span>
                        {lead.authorized_transfer && (
                          <span className="inline-block px-1.5 py-0.5 bg-brand-gold/15 text-brand-gold-dark border border-brand-gold/20 text-[9px] font-bold rounded-sm uppercase tracking-wider">
                            Transfer Enabled
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-charcoal-muted mt-1">
                        {lead.email} &bull; {lead.phone}
                      </div>
                    </td>

                    {/* Preferences */}
                    <td className="p-4 sm:p-5">
                      <div className="font-medium text-charcoal-body capitalize">
                        {lead.desired_unit_type.replace('-', ' ')} &bull; {lead.household_size} {lead.household_size === 1 ? 'person' : 'people'}
                      </div>
                      <div className="text-xs text-charcoal-muted mt-1 capitalize">
                        Move-in: {lead.move_timing.replace(/-/g, ' ')}
                      </div>
                    </td>

                    {/* Annual Income */}
                    <td className="p-4 sm:p-5">
                      <div className="font-semibold text-charcoal-dark">
                        ${Number(lead.annual_income).toLocaleString()}
                      </div>
                      <div className="text-[10px] text-charcoal-muted mt-0.5">
                        {lead.income_range_label}
                      </div>
                    </td>

                    {/* Status Badge */}
                    <td className="p-4 sm:p-5 text-center">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getResultBadgeClass(lead.eligibility_result)}`}>
                        {getResultLabel(lead.eligibility_result)}
                      </span>
                    </td>

                    {/* Submitted Date */}
                    <td className="p-4 sm:p-5 text-xs text-charcoal-muted">
                      {new Date(lead.created_at).toLocaleDateString(undefined, { 
                        month: 'short', 
                        day: 'numeric', 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </td>

                    {/* Action Button */}
                    <td className="p-4 sm:p-5 text-right">
                      <button className="text-xs text-brand-gold hover:text-brand-gold-dark font-semibold focus:outline-none">
                        Details &rarr;
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Side slide-over drawer for Lead Details & AI Referrals */}
      {selectedLead && (
        <div className="fixed inset-0 z-50 flex justify-end bg-charcoal-dark/40 backdrop-blur-xs transition-opacity">
          
          <div 
            className="w-full max-w-xl bg-white h-full shadow-2xl flex flex-col justify-between overflow-y-auto border-l border-neutral-sand/30 animate-fade-in"
            role="dialog"
            aria-modal="true"
          >
            {/* Drawer Header */}
            <div>
              <div className="p-6 border-b border-neutral-sand/20 flex items-center justify-between bg-neutral-ivory/40">
                <div>
                  <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getResultBadgeClass(selectedLead.eligibility_result)} mb-2`}>
                    {getResultLabel(selectedLead.eligibility_result)}
                  </span>
                  <h2 className="text-xl font-display font-semibold text-charcoal-dark">
                    {selectedLead.first_name} {selectedLead.last_name}
                  </h2>
                  <p className="text-xs text-charcoal-muted mt-1">Lead ID: {selectedLead.id}</p>
                </div>
                <button
                  onClick={() => setSelectedLead(null)}
                  className="p-1.5 rounded-full hover:bg-neutral-linen text-charcoal-muted"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Drawer Content */}
              <div className="p-6 space-y-6">
                
                {/* 1. Core Profile Details */}
                <div>
                  <h3 className="text-xs font-semibold text-charcoal-dark uppercase tracking-wider mb-3 pb-1.5 border-b border-neutral-sand/10">
                    Lead Profile
                  </h3>
                  
                  <div className="grid grid-cols-2 gap-y-3.5 gap-x-4 text-xs">
                    <div>
                      <span className="block text-charcoal-muted mb-0.5">Email Address</span>
                      <strong className="text-charcoal-dark text-sm">{selectedLead.email}</strong>
                    </div>
                    <div>
                      <span className="block text-charcoal-muted mb-0.5">Phone Number</span>
                      <strong className="text-charcoal-dark text-sm">{selectedLead.phone}</strong>
                    </div>
                    <div>
                      <span className="block text-charcoal-muted mb-0.5">Household Size</span>
                      <strong className="text-charcoal-dark text-sm">{selectedLead.household_size} Persons</strong>
                    </div>
                    <div>
                      <span className="block text-charcoal-muted mb-0.5">Unit Preference</span>
                      <strong className="text-charcoal-dark text-sm capitalize">{selectedLead.desired_unit_type}</strong>
                    </div>
                    <div>
                      <span className="block text-charcoal-muted mb-0.5">Gross Income</span>
                      <strong className="text-charcoal-dark text-sm">${Number(selectedLead.annual_income).toLocaleString()} / yr</strong>
                    </div>
                    <div>
                      <span className="block text-charcoal-muted mb-0.5">Income Category</span>
                      <strong className="text-charcoal-dark text-xs">{selectedLead.income_range_label}</strong>
                    </div>
                    <div>
                      <span className="block text-charcoal-muted mb-0.5">Move-In Timing</span>
                      <strong className="text-charcoal-dark text-xs capitalize">{selectedLead.move_timing.replace(/-/g, ' ')}</strong>
                    </div>
                    <div>
                      <span className="block text-charcoal-muted mb-0.5">Updates Subscribed</span>
                      <strong className="text-charcoal-dark text-xs">{selectedLead.wants_updates ? 'Yes' : 'No'}</strong>
                    </div>
                    <div>
                      <span className="block text-charcoal-muted mb-0.5">Portfolio Matching</span>
                      <strong className={`inline-block px-2 py-0.5 rounded-sm border text-xs font-semibold ${
                        selectedLead.authorized_transfer 
                          ? 'bg-green-50 text-green-700 border-green-200' 
                          : 'bg-neutral-sand/10 text-charcoal-muted border-neutral-sand/20'
                      }`}>
                        {selectedLead.authorized_transfer ? 'Yes (Enabled)' : 'No'}
                      </strong>
                    </div>
                  </div>
                </div>

                {/* 2. Marketing Attribution */}
                <div>
                  <h3 className="text-xs font-semibold text-charcoal-dark uppercase tracking-wider mb-3 pb-1.5 border-b border-neutral-sand/10">
                    Marketing & Channel Source
                  </h3>
                  
                  <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-xs">
                    <div>
                      <span className="block text-charcoal-muted mb-0.5">UTM Source</span>
                      <strong className="text-charcoal-dark font-mono">{selectedLead.utm_source || 'direct'}</strong>
                    </div>
                    <div>
                      <span className="block text-charcoal-muted mb-0.5">UTM Medium</span>
                      <strong className="text-charcoal-dark font-mono">{selectedLead.utm_medium || 'none'}</strong>
                    </div>
                    <div className="col-span-2">
                      <span className="block text-charcoal-muted mb-0.5">Referrer URL</span>
                      <strong className="text-charcoal-dark font-mono text-[10px] break-all block">{selectedLead.referrer || 'direct browser visit'}</strong>
                    </div>
                  </div>
                </div>

                {/* 3. AI Referral & Smart Routing Actions (New Section) */}
                <div className="p-4 bg-brand-gold/5 border border-brand-gold/20 rounded-sm">
                  <h3 className="text-xs font-semibold text-brand-gold-dark uppercase tracking-wider mb-3 flex items-center gap-1.5">
                    <Lightbulb className="w-4 h-4 text-brand-gold" />
                    AI Smart Routing Assessment
                  </h3>
                  
                  <p className="text-xs text-charcoal-body italic mb-3 font-medium">
                    {getAIRecommendations(selectedLead).statusText}
                  </p>

                  <div className="space-y-2.5 mb-4">
                    {getAIRecommendations(selectedLead).points.map((pt, index) => (
                      <div key={index} className="flex gap-2 text-xs text-charcoal-muted leading-relaxed">
                        <ChevronRight className="w-3.5 h-3.5 text-brand-gold flex-shrink-0 mt-0.5" />
                        <span>{pt}</span>
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-brand-gold/15 pt-3 mt-3 flex justify-between items-center text-xs">
                    <div>
                      <span className="block text-charcoal-muted text-[10px] uppercase tracking-wider">Referral Destination</span>
                      <strong className="text-charcoal-dark font-semibold">{getAIRecommendations(selectedLead).referralDestination}</strong>
                    </div>
                    
                    <span className="px-2 py-0.5 bg-brand-gold/10 text-brand-gold-dark border border-brand-gold/20 text-[10px] font-semibold rounded-sm">
                      Recommended Action
                    </span>
                  </div>
                </div>

                {/* 4. Future System Integrations Trigger */}
                <div className="p-4 bg-neutral-linen/30 border border-neutral-sand/25 rounded-sm">
                  <h4 className="text-xs font-semibold text-charcoal-dark uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-brand-gold" />
                    Future Email Dispatch Integrations
                  </h4>
                  <p className="text-xs text-charcoal-muted leading-relaxed mb-4">
                    Queue and trigger automated referrals to partner portfolios (e.g. 120% AMI, market-rate units) or customized guidelines instructions based on this assessment profile.
                  </p>
                  
                  {referralSentStatus ? (
                    <div className="p-2.5 bg-green-50 text-green-700 text-xs font-semibold rounded-sm flex items-center gap-2 border border-green-200">
                      <CheckCircle className="w-4 h-4" />
                      <span>Referral queued for dispatch successfully!</span>
                    </div>
                  ) : (
                    <button
                      onClick={handleSendReferral}
                      disabled={isSendingReferral}
                      className="inline-flex items-center gap-2 px-3 py-2 bg-charcoal-dark hover:bg-brand-gold text-white text-xs font-semibold rounded-sm transition-all focus:outline-none"
                    >
                      <Send className="w-3 h-3" />
                      {isSendingReferral ? 'Processing Referral...' : 'Dispatch AI Referral Recommendation'}
                    </button>
                  )}
                </div>

              </div>
            </div>

            {/* Drawer Footer */}
            <div className="p-6 border-t border-neutral-sand/20 bg-neutral-linen/25 flex justify-end gap-3">
              <button
                onClick={() => setSelectedLead(null)}
                className="px-4 py-2 border border-neutral-sand text-charcoal-body text-xs font-semibold rounded-sm hover:bg-neutral-linen/15 transition-all"
              >
                Close Panel
              </button>
            </div>

          </div>
        </div>
      )}

    </main>
  );
}
