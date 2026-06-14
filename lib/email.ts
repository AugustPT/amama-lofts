import { Resend } from 'resend';
import { Lead } from './types';

const resendApiKey = process.env.RESEND_API_KEY;
const resend = resendApiKey ? new Resend(resendApiKey) : null;

export interface EmailParams {
  lead: Lead;
  adminEmailRecipient?: string;
}

// Convert eligibility result to human-readable text
function formatResult(result: string): string {
  switch (result) {
    case 'likely_fit':
      return 'Likely Fit';
    case 'needs_review':
      return 'Needs Review';
    case 'under_qualified':
      return 'Under Qualified';
    case 'outside_range':
      return 'May Be Outside Current Range';
    default:
      return result;
  }
}

export async function sendLeadEmails({ lead, adminEmailRecipient }: EmailParams): Promise<boolean> {
  const fromEmail = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';
  const notificationRecipient = adminEmailRecipient || process.env.ADMIN_NOTIFICATION_EMAIL || 'leads@amanalofts.com';

  const resultLabel = formatResult(lead.eligibility_result);

  // 1. Applicant Confirmation Email Template
  const applicantSubject = `Amana Lofts — Your Personalized Real Estate Recommendation & Placement Path`;
  
  let applicantHtml = `
    <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 30px 20px; color: #1C1E21; line-height: 1.6; background-color: #FFFFFF; border: 1px solid #E5E7EB; border-radius: 4px;">
      <h2 style="color: #1C1E21; font-weight: normal; margin-top: 0; border-bottom: 2px solid #C5A880; padding-bottom: 15px; font-size: 24px; tracking: -0.5px;">Amana Lofts</h2>
      <p style="font-size: 16px; margin-top: 20px;">Aloha ${lead.first_name},</p>
      <p>Thank you for completing our preliminary self-check for <strong>Amana Lofts</strong> in Ala Moana, Honolulu. We have processed your household parameters and generated your personalized recommendation report.</p>
      
      <div style="background-color: #FCFBF9; border-left: 4px solid #C5A880; padding: 20px; margin: 25px 0; border-radius: 4px;">
        <h4 style="margin: 0 0 10px 0; color: #1C1E21; text-transform: uppercase; font-size: 11px; letter-spacing: 1px; color: #8F7654;">Your Placement Path:</h4>
        <p style="margin: 0; font-size: 18px; font-weight: bold; color: #1C1E21;">
          ${lead.eligibility_result === 'likely_fit' 
            ? 'Standard Program Path — Pre-Qualified' 
            : lead.eligibility_result === 'needs_review'
            ? 'Priority Review Path'
            : lead.eligibility_result === 'under_qualified'
            ? 'Alternative Resources Path'
            : 'Premium & Expanded Affordability Path'
          }
        </p>
        <p style="margin: 10px 0 0 0; font-size: 13px; color: #6B7280; line-height: 1.5;">
          ${lead.eligibility_result === 'likely_fit' 
            ? `Your household profile matches our initial 80% AMI income guidelines. We have queued your details for standard intake and added you to our launch updates list.` 
            : lead.eligibility_result === 'needs_review'
            ? `Your profile is very close to our boundaries. Our senior leasing coordinator has flagged your file for a priority review to manually check your occupancy or variable income.`
            : lead.eligibility_result === 'under_qualified'
            ? `Your estimated household gross income is below the minimum range for workforce lofts at Amana Lofts. However, you qualify for our Alternative Resources Path! We have compiled a set of community support and local assistance resources for you.`
            : `Amana Lofts operates under strict city-defined income brackets (maximum of $86,240 for a household size of 1). Since your income exceeds this threshold, you actually qualify for premium market-rate apartments or sister properties with expanded limits (up to 100% or 120% AMI). This gives you immediate unit choices and bypasses extensive city paperwork.`
          }
        </p>
      </div>

      <h3 style="font-size: 16px; color: #1C1E21; margin-top: 30px; border-bottom: 1px solid #E5E7EB; padding-bottom: 8px;">Associated Real Estate Advisors Portfolio Options:</h3>
      <p style="font-size: 13px; color: #6B7280; margin-bottom: 15px;">
        Because Associated Real Estate Advisors (AREA) is the exclusive leasing and management agency for Amana Lofts, we also oversee other premier properties in the Ala Moana area. Based on your household size and income details, we have identified these additional options in our portfolio that may suit your goals:
      </p>

      <div style="margin-bottom: 15px; padding: 15px; border: 1px solid #E5E7EB; border-radius: 4px; background-color: #FAF9F6;">
        <strong style="font-size: 14px; color: #1C1E21; display: block;">The Flats at Sky Ala Moana</strong>
        <span style="font-size: 11px; background-color: #C5A880; color: #FFFFFF; padding: 2px 6px; border-radius: 10px; font-weight: bold; text-transform: uppercase; display: inline-block; margin: 4px 0 8px 0;">Affordable & Market Rate</span>
        <p style="font-size: 12px; color: #6B7280; margin: 0 0 8px 0; line-height: 1.5;">Modern studio, 1-bed, and 2-bed loft rentals with options for City & County of Honolulu programs up to 100% AMI, as well as premium market-rate rental availability.</p>
        <a href="https://theflatshonolulu.com" style="font-size: 12px; color: #C5A880; font-weight: bold; text-decoration: none;">Visit Website &rarr;</a>
      </div>

      <div style="margin-bottom: 25px; padding: 15px; border: 1px solid #E5E7EB; border-radius: 4px; background-color: #FAF9F6;">
        <strong style="font-size: 14px; color: #1C1E21; display: block;">Associated Hawaii Property Directory</strong>
        <span style="font-size: 11px; background-color: #E5E7EB; color: #6B7280; padding: 2px 6px; border-radius: 10px; font-weight: bold; text-transform: uppercase; display: inline-block; margin: 4px 0 8px 0;">Oahu Rental Search</span>
        <p style="font-size: 12px; color: #6B7280; margin: 0 0 8px 0; line-height: 1.5;">Browse other long-term residential listings, high-rise condominiums, and single-family home rentals managed by our Property Management division across Oahu.</p>
        <a href="https://associatedhawaii.com/area-property-management/" style="font-size: 12px; color: #C5A880; font-weight: bold; text-decoration: none;">Search Properties &rarr;</a>
      </div>

      <p style="font-size: 14px; margin-top: 25px;"><strong>Your Next Steps:</strong></p>
      <ul style="font-size: 13px; color: #6B7280; padding-left: 20px; margin-top: 10px;">
        <li style="margin-bottom: 8px;"><strong>Leasing Coordinator Call:</strong> A dedicated coordinator from Associated Real Estate Advisors will call you directly at <strong>${lead.phone}</strong> to discuss layouts at Amana Lofts and review alternative fits from our managed portfolio.</li>
        <li style="margin-bottom: 8px;"><strong>Document Readiness:</strong> We suggest compiling your photo IDs, recent paystubs, bank statements, and tax returns so you are ready to secure a home.</li>
      </ul>

      <p style="font-size: 14px; margin-top: 30px;">If you have any questions or would like to speak to an advisor immediately, simply reply to this email or contact us at <strong>(808) 445-9199</strong>.</p>
      
      <p style="font-size: 14px; margin-top: 25px; font-style: italic; color: #6B7280;">Warm regards,<br />Amana Lofts Advisory Team</p>

      <p style="margin-top: 40px; padding-top: 15px; border-top: 1px solid #E5E7EB; font-size: 11px; color: #9CA3AF; line-height: 1.4;">
        Amana Lofts &bull; 765 Amana Street, Honolulu, HI 96814<br />
        Represented by Associated Real Estate Advisors (AREA) &bull; RB-23019 License<br />
        Equal Housing Opportunity &bull; Preliminary self-check tool only, not a final lease offer.
      </p>
    </div>
  `;

  // 2. Admin Notification Email Template
  const adminSubject = `[New Lead] Amana Lofts: ${lead.first_name} ${lead.last_name} (${resultLabel})`;
  
  let adminHtml = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #1C1E21; line-height: 1.6; border: 1px solid #E5E7EB; border-radius: 8px;">
      <h2 style="color: #1C1E21; font-weight: normal; margin-top: 0; border-bottom: 1px solid #E5E7EB; padding-bottom: 10px;">New Lead Submitted</h2>
      
      <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
        <tr>
          <td style="padding: 6px 0; font-weight: bold; width: 40%;">Applicant Name:</td>
          <td style="padding: 6px 0;">${lead.first_name} ${lead.last_name}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; font-weight: bold;">Email:</td>
          <td style="padding: 6px 0;"><a href="mailto:${lead.email}">${lead.email}</a></td>
        </tr>
        <tr>
          <td style="padding: 6px 0; font-weight: bold;">Phone:</td>
          <td style="padding: 6px 0;"><a href="tel:${lead.phone}">${lead.phone}</a></td>
        </tr>
        <tr>
          <td style="padding: 6px 0; font-weight: bold;">Household Size:</td>
          <td style="padding: 6px 0;">${lead.household_size}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; font-weight: bold;">Desired Unit:</td>
          <td style="padding: 6px 0; text-transform: capitalize;">${lead.desired_unit_type}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; font-weight: bold;">Est. Annual Income:</td>
          <td style="padding: 6px 0;">$${Number(lead.annual_income).toLocaleString()} (${lead.income_range_label})</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; font-weight: bold;">Screening Result:</td>
          <td style="padding: 6px 0; font-weight: bold; color: ${lead.eligibility_result === 'likely_fit' ? '#16A34A' : lead.eligibility_result === 'needs_review' ? '#D97706' : lead.eligibility_result === 'under_qualified' ? '#3B82F6' : '#DC2626'}">${resultLabel}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; font-weight: bold;">Move-In Timing:</td>
          <td style="padding: 6px 0;">${lead.move_timing}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; font-weight: bold;">Consent Given:</td>
          <td style="padding: 6px 0;">${lead.consent ? 'Yes' : 'No'}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; font-weight: bold;">Launch Updates Opt-in:</td>
          <td style="padding: 6px 0;">${lead.wants_updates ? 'Yes' : 'No'}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; font-weight: bold;">Timestamp (UTC):</td>
          <td style="padding: 6px 0;">${lead.created_at || new Date().toISOString()}</td>
        </tr>
      </table>

      <h3 style="border-top: 1px solid #E5E7EB; padding-top: 15px; margin-top: 20px;">Marketing Attribution</h3>
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 6px 0; font-weight: bold; width: 40%;">UTM Source:</td>
          <td style="padding: 6px 0;">${lead.utm_source || 'direct/none'}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; font-weight: bold;">UTM Medium:</td>
          <td style="padding: 6px 0;">${lead.utm_medium || 'none'}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; font-weight: bold;">UTM Campaign:</td>
          <td style="padding: 6px 0;">${lead.utm_campaign || 'none'}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; font-weight: bold;">Referrer:</td>
          <td style="padding: 6px 0; font-size: 12px; word-break: break-all;">${lead.referrer || 'direct'}</td>
        </tr>
      </table>
    </div>
  `;

  if (resend) {
    try {
      // Send applicant confirmation email
      await resend.emails.send({
        from: fromEmail,
        to: lead.email,
        subject: applicantSubject,
        html: applicantHtml,
      });

      // Send admin notification email
      await resend.emails.send({
        from: fromEmail,
        to: notificationRecipient,
        subject: adminSubject,
        html: adminHtml,
      });

      console.log('Emails successfully queued via Resend.');
      return true;
    } catch (err) {
      console.error('Resend email sending failure:', err);
      // We return true anyway to not break lead creation if email delivery fails
      return false;
    }
  } else {
    // Log emails to console for local developers
    console.log('--- MOCK EMAIL SENDER (RESEND_API_KEY NOT SET) ---');
    console.log(`[To Applicant: ${lead.email}] Subject: ${applicantSubject}`);
    console.log(`[To Admin: ${notificationRecipient}] Subject: ${adminSubject}`);
    console.log('--- EMAIL CONTENTS LOGGED ABOVE ---');
    return true;
  }
}
