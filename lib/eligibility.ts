import { EligibilityResult } from './types';

export const AMI_LIMITS: Record<number, number> = {
  1: 86240,
  2: 98560,
  3: 110880,
  4: 123200,
  5: 133120,
};

export const OCCUPANCY_GUIDANCE: Record<string, { min: number; max: number }> = {
  'studio': { min: 1, max: 2 },
  'one-bedroom': { min: 1, max: 3 },
  'two-bedroom': { min: 2, max: 5 },
};

export interface ScreeningInput {
  householdSize: number;
  desiredUnitType: string;
  annualIncome: number;
}

export function evaluateEligibility(input: ScreeningInput): {
  result: EligibilityResult;
  message: string;
  label: string;
} {
  const { householdSize, desiredUnitType, annualIncome } = input;
  
  // Cap at household size 5 for limits search
  const lookupSize = Math.min(Math.max(householdSize, 1), 5);
  const incomeLimit = AMI_LIMITS[lookupSize] || AMI_LIMITS[5];
  
  const guidance = OCCUPANCY_GUIDANCE[desiredUnitType.toLowerCase()];
  
  // Format income label
  const label = `Household of ${householdSize}, Limit $${incomeLimit.toLocaleString()}`;

  // 1. Under-qualified (Income below the minimum threshold required to support the workforce lofts rent)
  if (annualIncome < 32000 && householdSize >= 1 && householdSize <= 5) {
    return {
      result: 'under_qualified',
      message: 'Based on your income, you may be below the minimum threshold to comfortably afford the workforce rents at Amana Lofts. However, there are alternative housing programs and assistance options available for your range.',
      label,
    };
  }

  // 2. May Be Outside Current Range
  // Income is more than 10% above the limit OR household size is larger than the 2-bedroom limit (5 people)
  // or household size is 0 or less
  if (annualIncome > incomeLimit * 1.10 || householdSize > 5 || householdSize < 1) {
    return {
      result: 'outside_range',
      message: 'Based on your answers, this community may not match your current eligibility range. You may still join updates or explore other rental options.',
      label,
    };
  }

  // 2. Needs Review
  // Income is between 100% and 110% of the limit
  // OR the household size is outside the recommended occupancy guidelines for the desired unit type
  const isIncomeNearLimit = annualIncome > incomeLimit && annualIncome <= incomeLimit * 1.10;
  const isOccupancyMismatch = guidance ? (householdSize < guidance.min || householdSize > guidance.max) : false;

  if (isIncomeNearLimit || isOccupancyMismatch) {
    return {
      result: 'needs_review',
      message: 'Your answers may need a full review. Join updates and prepare your documents before applications open.',
      label,
    };
  }

  // 3. Likely Fit
  // Income is <= limit AND occupancy matches the unit type guidelines
  return {
    result: 'likely_fit',
    message: 'Based on your answers, your household may fit the current published income range. Join launch updates to receive application timing and next steps.',
    label,
  };
}
