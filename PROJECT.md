# Project: Amana Lofts Website Redesign

## Architecture
- **Tech Stack**: Next.js App Router (TypeScript, Tailwind CSS, Lucide icons).
- **Core Components**:
  - `app/page.tsx`: The main landing page including Hero, Modern Living highlights, Eligibility Screener (interactive state machine), Units Showcase, Location Map, How It Works, Required Documents, and FAQs.
  - `lib/eligibility.ts`: Logic to evaluate household eligibility.
  - `lib/db.ts`: In-memory file-backed storage/read of leads (`leads_db.json`).
  - `app/api/leads/route.ts`: Leads submission API.
  - `app/api/leads/transfer/route.ts`: Portfolio transfer endpoint.

## Milestones
| # | Track / Milestone Name | Scope | Dependencies | Status | Conversation ID |
|---|------------------------|-------|--------------|--------|-----------------|
| 1 | E2E Testing Track | Design and implement the opaque-box test suite (Tiers 1-4) and publish `TEST_READY.md`. | None | IN_PROGRESS | b6072888-56ab-459c-94eb-769d7520f53f |
| 2 | Implementation Track | Refactor landing page, generate images, integrate with E2E tests, pass all checks, and run adversarial coverage hardening. | M1 | IN_PROGRESS | bfb19b9b-bfe4-4a69-b4c0-a7883735e1ed |

## Interface Contracts & Layout
- **Code Layout**:
  - Landing Page: `app/page.tsx`
  - Asset Directory: `public/images/`
  - Leads Database: `leads_db.json`
- **Asset Contracts**:
  - Generated images must be saved to `public/images/` with descriptive filenames (all lowercase, underscores).
  - All text overlaying images must have a minimum contrast of 4.5:1.
  - Images must scale responsively without clipping or aspect distortion.

## Screener Consolidation Requirements
- Homepage screener in `app/page.tsx` is the single source of truth for the qualification form.
- Refactor the standalone `/screener` page (`app/screener/page.tsx`) to redirect client-side directly to the homepage's screener section (`/#screener-section` and scrolling down).
- Update all header and page CTAs that link to `/screener` to instead scroll smoothly to `#screener-section` on the homepage.
- Clean up any redundant code or styling to ensure only one screener state machine exists.

