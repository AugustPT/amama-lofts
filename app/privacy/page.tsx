import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Shield } from 'lucide-react';

export default function PrivacyPage() {
  return (
    <main className="flex-1 max-w-4xl mx-auto w-full px-6 py-12 sm:py-20">
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-sm font-semibold text-charcoal-muted hover:text-brand-gold transition-colors mb-8 focus:outline-none"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Home
      </Link>

      <div className="bg-white border border-neutral-sand/30 shadow-md rounded-md p-6 sm:p-10">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-neutral-sand/20">
          <div className="p-3 bg-brand-gold/10 rounded-sm text-brand-gold">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-display font-semibold text-charcoal-dark">Privacy Policy</h1>
            <p className="text-xs text-charcoal-muted mt-1">Effective date: June 13, 2026</p>
          </div>
        </div>

        <div className="prose prose-sm max-w-none text-charcoal-muted space-y-6 text-sm leading-relaxed">
          <p>
            At <strong>Amana Lofts</strong>, we are committed to protecting your privacy and security. This Privacy Policy details how we collect, process, and protect your information when you interact with our preliminary self-check system and website.
          </p>

          <h2 className="text-lg font-semibold text-charcoal-dark uppercase tracking-wider pt-2">1. Information We Collect</h2>
          <p>
            To perform a preliminary self-check and include your details in the launch update notifications list, we collect:
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li><strong>Contact details:</strong> First name, last name, email address, and phone number.</li>
            <li><strong>Screener inputs:</strong> Estimated annual gross household income, total household size, and desired loft-style unit types.</li>
            <li><strong>Attribution details:</strong> UTM campaign identifiers, referring URLs, timestamps, and browser meta-headers.</li>
          </ul>

          <h2 className="text-lg font-semibold text-charcoal-dark uppercase tracking-wider pt-2">2. How We Use Your Data</h2>
          <p>
            The information captured is used for the following operational workflows:
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li>To compute your preliminary, compliance-aware eligibility status for Amana Lofts housing units.</li>
            <li>To compile contact databases for dispatching official leasing packets and updates.</li>
            <li>To optimize digital campaigns and marketing attributions.</li>
            <li>For internal administrative audits and leasing lead allocations.</li>
          </ul>

          <h2 className="text-lg font-semibold text-charcoal-dark uppercase tracking-wider pt-2">3. Data Sharing & Security</h2>
          <p>
            We respect your private files and contact logs.
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li><strong>No Sale of Data:</strong> We do not sell, rent, or lease your personal information to third parties.</li>
            <li><strong>Service Providers:</strong> Information is only shared with database nodes (such as Supabase) and transactional email providers (such as Resend) to fulfill notifications and records storage.</li>
            <li><strong>Equal Housing Partners:</strong> Lead information may be shared with Associated Real Estate Advisors and JL Capital for verification.</li>
          </ul>

          <h2 className="text-lg font-semibold text-charcoal-dark uppercase tracking-wider pt-2">4. Your Choices & Opt-Out</h2>
          <p>
            If you wish to remove your email address from our updates database, you may unsubscribe at any time by clicking the opt-out link in our emails, or by contacting our leasing managers.
          </p>

          <h2 className="text-lg font-semibold text-charcoal-dark uppercase tracking-wider pt-2">5. Updates to This Policy</h2>
          <p>
            We may periodically update this policy to reflect modifications in municipal compliance guidelines, technology systems, or operational workflows. Revised policies will be published on this portal.
          </p>
        </div>
      </div>
    </main>
  );
}
