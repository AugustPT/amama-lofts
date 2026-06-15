# Original User Request

## Initial Request — 2026-06-15T00:47:30Z

Redesign the Amana Lofts website to be extremely clean, image-heavy, and visual, replacing text blocks with high-quality imagery and minimal text layouts, applying first-principles thinking, Occam's razor, visual design principles, and human psychology to ensure maximum ease of understanding.

Working directory: c:\PROJECTS\amama lofts
Integrity mode: development

## Requirements

### R1. How It Works (Leasing Steps) Redesign
- Redesign the "How It Works" section to be card-based and image-heavy, replacing long text descriptions.
- Generate and embed custom, high-quality images for each step (e.g., Household size check, uploading documents, signing lease) to match the premium brand theme.

### R2. Required Documents Checklist Redesign
- Redesign the "Required Verification Documents" section into a clean, visual grid.
- Generate and embed custom, high-quality images representing each document category (e.g., Photo ID, income statements, tax returns).

### R3. FAQs Redesign
- Redesign the FAQs section to use a clean, visually lightweight layout that minimizes overwhelming text lists.

### R4. Core Design Principles
- Apply Occam's razor: reduce unnecessary decorative elements, keeping layouts clean and direct.
- Apply human psychology and visual design: use high-contrast text, spacious padding, glassmorphic accents, and intuitive visual hierarchy to make the site feel premium and effortless to digest.

## Acceptance Criteria

### Visual Polish & Legibility
- [ ] Text volume across "How It Works", "Required Documents Checklist", and "FAQs" sections is reduced by at least 50% compared to the original code.
- [ ] All new sections feature custom-generated, brand-aligned images replacing plain text explanations.
- [ ] Contrast ratios for all text overlaying images or dark backgrounds meet a minimum of 4.5:1 (highly readable).
- [ ] The responsive layout is fully preserved on desktop, tablet, and mobile breakpoints (no overlaps or clipping).

### Technical Quality
- [ ] The codebase compiles successfully without any TypeScript or build errors (`npm run build`).
- [ ] Form submission, screener transitions, and interactive components continue to function normally.
- [ ] All generated image assets are saved under `public/images/` and referenced correctly.

## Follow-up — 2026-06-15T01:08:18Z

The user wants to simplify the codebase to eliminate duplicate code and potential regression bugs. 
Please consolidate the two separate screener forms:
1. Make the homepage embedded screener the single source of truth for the qualification form.
2. Refactor the standalone `/screener` page (app/screener/page.tsx) to redirect client-side directly to the homepage's screener section (e.g., redirecting to `/#screener-section` and scrolling down).
3. Update all header and page CTAs (like "See If I Qualify") that currently link to `/screener` to instead scroll smoothly to `#screener-section` on the homepage.
4. Clean up any redundant code or styling to ensure only one screener state machine exists.
