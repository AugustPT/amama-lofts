import { NextRequest, NextResponse } from 'next/server';
import { insertLead } from '@/lib/db';
import { evaluateEligibility } from '@/lib/eligibility';
import { sendLeadEmails } from '@/lib/email';
import { LeadInput } from '@/lib/types';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    const {
      first_name,
      last_name,
      email,
      phone,
      household_size,
      desired_unit_type,
      annual_income,
      move_timing,
      wants_updates,
      consent,
      utm_source,
      utm_medium,
      utm_campaign,
      referrer
    } = body;

    // Validate required fields
    if (!first_name || !last_name || !email || !phone || !household_size || !desired_unit_type || (annual_income === undefined || annual_income === null || annual_income === '')) {
      return NextResponse.json(
        { error: 'Missing required screening or contact fields.' },
        { status: 400 }
      );
    }

    // Parse values to correct types
    const parsedHouseholdSize = parseInt(household_size, 10);
    const parsedAnnualIncome = parseFloat(annual_income);

    if (isNaN(parsedHouseholdSize) || isNaN(parsedAnnualIncome)) {
      return NextResponse.json(
        { error: 'Invalid household size or annual income values.' },
        { status: 400 }
      );
    }

    // Re-evaluate eligibility server-side for security and accuracy
    const screeningResult = evaluateEligibility({
      householdSize: parsedHouseholdSize,
      desiredUnitType: desired_unit_type,
      annualIncome: parsedAnnualIncome,
    });

    const leadData: LeadInput = {
      first_name: first_name.trim(),
      last_name: last_name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      household_size: parsedHouseholdSize,
      desired_unit_type: desired_unit_type,
      annual_income: parsedAnnualIncome,
      income_range_label: screeningResult.label,
      eligibility_result: screeningResult.result,
      move_timing,
      wants_updates: !!wants_updates,
      consent: !!consent,
      utm_source: utm_source || null,
      utm_medium: utm_medium || null,
      utm_campaign: utm_campaign || null,
      referrer: referrer || null,
      authorized_transfer: true,
    };

    // Insert to DB (Supabase or Local JSON)
    const savedLead = await insertLead(leadData);

    // Trigger emails (Asynchronous notification, don't block response)
    // We send emails in background or await them with a safe try-catch inside sendLeadEmails
    await sendLeadEmails({ lead: savedLead });

    return NextResponse.json({ success: true, lead: savedLead }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to capture lead details.';
    console.error('API lead capture error:', error);
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}

// Support GET for basic configuration checks
export async function GET() {
  return NextResponse.json({
    status: 'healthy',
    message: 'Amana Lofts lead capture endpoint is online.',
    timestamp: new Date().toISOString(),
  });
}
