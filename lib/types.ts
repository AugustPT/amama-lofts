export type EligibilityResult = 'likely_fit' | 'needs_review' | 'outside_range' | 'under_qualified';

export interface LeadInput {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  household_size: number;
  desired_unit_type: string;
  annual_income: number;
  income_range_label: string;
  eligibility_result: EligibilityResult;
  move_timing: string;
  wants_updates: boolean;
  consent: boolean;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  referrer?: string;
  authorized_transfer?: boolean;
}

export interface Lead extends LeadInput {
  id: string;
  created_at: string;
}
