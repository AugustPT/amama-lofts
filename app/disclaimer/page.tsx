import React from 'react';
import Link from 'next/link';
import { ArrowLeft, AlertTriangle } from 'lucide-react';

export default function DisclaimerPage() {
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
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-display font-semibold text-charcoal-dark">Terms & Disclaimers</h1>
            <p className="text-xs text-charcoal-muted mt-1">Effective date: June 13, 2026</p>
          </div>
        </div>

        <div className="prose prose-sm max-w-none text-charcoal-muted space-y-6 text-sm leading-relaxed">
          <p>
            Please read these Terms of Use and regulatory disclaimers carefully before using the <strong>Amana Lofts</strong> preliminary eligibility checking tool and website.
          </p>

          <h2 className="text-lg font-semibold text-charcoal-dark uppercase tracking-wider pt-2">1. Preliminary Self-Check Only</h2>
          <p>
            The eligibility screening wizard on this site is designed for preliminary self-checks only.
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li><strong>No Approval Guarantees:</strong> Results showing a "Likely Fit" or "Needs Review" are calculations based on the gross figures provided. They do NOT constitute an approval, lease offer, reservation, or guarantee of qualification.</li>
            <li><strong>Subject to Full Verification:</strong> Final eligibility is subject to the submission of a completed official application package, review of certified verification documents, and administrative audit by the leasing team.</li>
          </ul>

          <h2 className="text-lg font-semibold text-charcoal-dark uppercase tracking-wider pt-2">2. Accuracy of Rents, Units & Limits</h2>
          <p>
            Rents, unit layouts, availability dates, and program parameters are subject to change.
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li><strong>Rent TBD:</strong> Monthly rental rates are currently under regulatory review and are marked as TBD. They will be published once officially approved by the City.</li>
            <li><strong>Area Median Income (AMI) limits:</strong> Household income limits are determined by federal and municipal guidelines (specifically Honolulu County 2026 80% AMI limits) and are updated periodically.</li>
          </ul>

          <h2 className="text-lg font-semibold text-charcoal-dark uppercase tracking-wider pt-2">3. Equal Housing Opportunity</h2>
          <p>
            Amana Lofts operates in full compliance with the Federal Fair Housing Act, Equal Housing Opportunity guidelines, and Hawaii state non-discrimination laws. We provide housing opportunities without regard to race, color, national origin, religion, gender, sexual orientation, disability, or familial status.
          </p>

          <h2 className="text-lg font-semibold text-charcoal-dark uppercase tracking-wider pt-2">4. Representative Credits</h2>
          <p>
            This portal is managed and represented by <strong>Associated Real Estate Advisors</strong> and developed by <strong>JL Capital</strong>. Any representations made here are subject to official approved leasing contracts.
          </p>

          <h2 className="text-lg font-semibold text-charcoal-dark uppercase tracking-wider pt-2">5. Contact Information</h2>
          <p>
            If you have questions regarding the municipal rules, Honolulu County guidelines, or document preparation details, please join our updates list or mail queries to our representative office.
          </p>
        </div>
      </div>
    </main>
  );
}
