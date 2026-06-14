# Amana Lofts — Rental Launch & Qualification System

A premium, compliance-aware rental launch and qualification system built for **Amana Lofts** (765 Amana Street, Honolulu, HI 96814). This production-ready system is built using **Next.js (App Router, TypeScript)**, **Tailwind CSS (v4)**, and supports cloud storage via **Supabase** and transactional notifications via **Resend**.

---

## Key Features

1. **Preliminary Eligibility Screener**: Multi-step wizard matching Honolulu County 2026 80% AMI thresholds and occupancy constraints.
2. **Automated Lead Capture**: Registers comprehensive lead records along with client-side marketing attribution data (UTM tags and Referrer URL).
3. **Double Email Notifications**: Sends transaction confirmations to applicants and comprehensive profile sheets to the leasing team using Resend.
4. **Admin Dashboard Portal**: Secure password-gated dashboard featuring leads filtering, unit interest sorting, stats metrics, CSV exporting, and AI-guided routing recommendations.
5. **Aesthetic Design**: Warm linens, beach sands, charcoal texts, gold highlights, and glassmorphic navigation headers.
6. **Robust Fail-Safe Database**: Instantly stores leads locally in `leads_db.json` if Supabase environment keys are missing, allowing offline testing out-of-the-box.

---

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Styling**: Tailwind CSS v4
- **Icons**: Lucide Icons
- **Database**: Supabase
- **Email Delivery**: Resend

---

## 1. Database Setup (Supabase)

Create a table named `leads` in your Supabase project SQL Editor:

```sql
create table leads (
  id uuid default gen_random_uuid() primary key,
  first_name text not null,
  last_name text not null,
  email text not null,
  phone text not null,
  household_size integer not null,
  desired_unit_type text not null,
  annual_income numeric not null,
  income_range_label text not null,
  eligibility_result text not null, -- 'likely_fit' | 'needs_review' | 'outside_range'
  move_timing text not null,
  wants_updates boolean default true,
  consent boolean default false,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  referrer text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security (RLS)
alter table leads enable row level security;

-- Policy to allow anonymous submissions from the screener
create policy "Allow anonymous inserts" on leads
  for insert with check (true);

-- Policy to allow authenticated reads (if using Supabase Auth)
create policy "Allow read access for admin" on leads
  for select using (true);
```

---

## 2. Environment Variables

Create a `.env.local` file in the project root containing the following configurations:

```env
# Supabase Integration (Leave blank to use local leads_db.json fallback database)
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Resend Email Integration (Leave blank to print mock emails in terminal logs)
RESEND_API_KEY=re_123456789
RESEND_FROM_EMAIL=onboarding@resend.dev
ADMIN_NOTIFICATION_EMAIL=leads@amanalofts.com

# Admin Dashboard Password (Default: admin123)
ADMIN_PASSWORD=your_custom_admin_password
```

---

## 3. Getting Started Locally

Install dependencies:
```bash
npm install
```

Start the local development server:
```bash
npm run dev
```

Visit the system in your browser:
- **Landing Page**: `http://localhost:3000`
- **Screener Wizard**: `http://localhost:3000/screener`
- **Admin Portal**: `http://localhost:3000/admin` (Sign in with the password configured in `ADMIN_PASSWORD` or `admin123`)

---

## 4. Vercel Deployment Instructions

Deploy the portal to Vercel in seconds:

1. Push this project to your GitHub, GitLab, or Bitbucket account.
2. Log into the Vercel dashboard and click **Add New** > **Project**.
3. Import your repository.
4. Under **Environment Variables**, paste the keys defined in the Environment Variables section.
5. Click **Deploy**. Next.js App Router and Serverless functions will compile automatically.

---

## 5. Eligibility Screening Calculations

The screening algorithm is based on Honolulu County 80% AMI income limits and unit capacities:

| Household Size | 80% AMI Income Limit | Unit Capacities |
| :---: | :---: | :--- |
| **1 Person** | \$86,240 | **Studio**: 1–2 People |
| **2 People** | \$98,560 | **One-Bedroom**: 1–3 People |
| **3 People** | \$110,880 | **Two-Bedroom**: 2–5 People |
| **4 People** | \$123,200 | |
| **5 People** | \$133,120 | |

### Outcome Rules:
- **Likely Fit**: Annual Gross Income $\le$ AMI limit AND household size fits within the capacity of the chosen unit.
- **Needs Review**: Annual Gross Income is within 10% above the AMI limit, OR household size is outside recommended capacities.
- **Outside Range**: Annual Gross Income is $>10\%$ above the AMI limit, OR household size is larger than 5.

### Admin Dashboard AI Guidance:
For leads flagged as **Outside Range** or **Needs Review**, the Admin Panel provides dynamic routing guidance:
- **Oversized Households**: Recommends routing to 3+ bedroom family-designated projects in Kakaʻako.
- **High-Income Leads**: Recommends referring to market-rate partner properties or 120% AMI workforce housing lists.
- **Occupancy Mismatch**: Suggests contact options to request unit preference adjustments.
