# IOS System Changelog

All notable changes to the Integrated Operating System (IOS) project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

### Added
- CHANGELOG.md file for tracking all system changes

---

## [0.12.2] - 2025-11-14

### Added
- **BCT (Breath Counting Task) full integration into baseline assessment**
  - Integrated as 5th assessment section (Presence Test) instead of standalone page
  - Manual cycle completion after breath 8 (no auto-cycling)
  - Mental counting requirement - all visual breath count displays removed
  - Enhanced instructions emphasizing "long, slow, deep breaths throughout"
  - Visual button feedback with scale animations on press
  - Proper data flow to Supabase with all required fields:
    - `presence_test_score`
    - `presence_test_elapsed_seconds`
    - `presence_test_cycles_completed`
    - Calculated `attention_domain` scores

- **Comprehensive results summary page**
  - Displays calculated REwired Index (0-100 scale)
  - Domain breakdowns with personalized commentary
  - Tier classification display
  - Manual "Start Your IOS Install Now" button
  - Routes to `/chat` for Stage 1 onboarding (no auto-redirect)

- **Email confirmation support**
  - Intelligent detection of Supabase email confirmation setting
  - Handles both scenarios (confirmation enabled/disabled)
  - Enhanced signup flow with email verification messaging

- **Full name field in signup**
  - Added to user profile collection
  - Stored in Supabase user metadata

### Fixed
- **Chat page server-side exception**
  - Added comprehensive null checks for storage API results
  - Proper validation before accessing `.value` properties
  - Error handling for missing baseline data

- **Layout.tsx forcing dynamic rendering**
  - Removed auth checks from root layout
  - Eliminated middleware conflicts on public pages
  - Individual pages now handle their own authentication

- **useSearchParams Suspense boundary error**
  - Wrapped signin page searchParams usage in Suspense component
  - Added appropriate fallback UI during parameter loading
  - Build now completes without Next.js 13+ warnings

- **Legal agreements text contrast**
  - Changed text colors from light gray to dark gray (`text-gray-800`, `text-gray-900`)
  - Added `prose-gray` for better readability
  - White sections now have proper contrast

- **Assessment routing flow**
  - Corrected `/legal-agreements` redirect from `/baseline` → `/assessment`
  - Assessment now properly includes BCT before completion
  - Removed auto-redirect to `/chat`, replaced with manual button in results

- **Screening page loading state**
  - Fixed Supabase client initialization
  - Changed from `createClient` to `createClientComponentClient`
  - Preserved all existing screening functionality (5 sections, clearance logic, crisis resources)

### Changed
- **Authentication pages styling consistency**
  - Updated signin/signup pages to match dark theme
  - Applied orange accent color (#ff9e19) throughout
  - Consistent UI/UX across all auth flows

- **Password validation enhancement**
  - Minimum 8 characters required
  - Must include uppercase letter
  - Must include number
  - Real-time visual feedback on requirements

- **Assessment flow architecture**
  - BCT integrated as final assessment section (not separate page)
  - Results page with manual progression (not auto-routing)
  - Clearer user control over flow progression

### Documentation
- **Updated application flow:**
  1. Signup → Email confirmation (if enabled)
  2. Screening (5 sections with clearance evaluation)
  3. Legal Agreements (Terms + Informed Consent)
  4. Baseline Assessment (5 assessments including BCT)
  5. Results Summary (REwired Index display)
  6. Chat (Stage 1 onboarding)

---

## [0.12.1] - 2025-11-14

### Fixed
- **Middleware redirect loop on /screening page**
  - Root cause: Missing `path !== '/screening'` check causing infinite redirects
  - Added path exclusion checks for all onboarding pages (/screening, /legal-agreement, /assessment)
  - Users can now access pages they're being redirected to without loops

- **Middleware syntax error causing build failure**
  - Missing closing brace after screening/legal/assessment checks
  - Added proper code block closure on line 73
  - Build now completes successfully

- **Table name mismatch in middleware**
  - Corrected `baseline_scores` → `baseline_assessments` (actual table name)
  - Changed column check from `rewired_index` → `id` for baseline validation
  - Middleware now queries correct database tables

- **Landing page redirect loop for authenticated users**
  - Implemented Option 1: Allow authenticated users to view landing page
  - Added `path !== '/'` check to prevent auto-redirect from home page
  - Authenticated users can now visit `/` without being forced into app flow

- **Email confirmation redirect configuration**
  - Updated Supabase redirect URLs to point to `/screening` instead of `/signin`
  - New users now properly routed to screening after email confirmation
  - Configured callback route to handle post-confirmation flow

### Changed
- **Middleware flow enforcement improvements**
  - More granular path checking to prevent redirect loops
  - Proper page access during onboarding steps
  - Cleaner logic for determining user's current stage

### Technical Details
- **Database table references corrected:**
  - `screening_responses` - verified exists ✅
  - `legal_acceptances` - verified exists ✅
  - `baseline_assessments` - corrected from `baseline_scores` ✅

- **Middleware config:**
  - Matcher pattern excludes static files and images
  - Public routes: `/`, `/auth/*` paths, `/auth/callback`
  - Protected routes: `/screening`, `/legal-agreement`, `/assessment`, `/chat`
  - Sequential enforcement: screening → legal → assessment → chat

---

## [0.12.0] - 2025-11-14

### Changed - BREAKING
- **Complete migration from Pages Router to App Router**
  - Rewrote all authentication pages for App Router architecture
  - Changed `next/router` → `next/navigation` throughout application
  - Added `'use client'` directives to all client components
  - Updated imports and routing patterns to App Router conventions
  - Removed dependency on `@supabase/auth-helpers-react` (Pages Router only)
  - Simplified layout structure (no SessionContextProvider needed)

### Added
- **Screening questionnaire system**
  - Medical and psychiatric safety screening before signup
  - Comprehensive risk assessment questionnaire
  - Database table `screening_responses` with RLS policies
  - Automated clearance evaluation logic
  - Crisis indicator detection (suicide, psychosis, recent hospitalization)
  - Medical condition checks (cardiovascular, epilepsy, pregnancy)
  - Medication and substance use screening
  - Helper functions for checking user clearance status
  - Triggers for updating user metadata
  - Four clearance levels: Granted, Granted with Modifications, Pending Medical Review, Denied

- **Legal agreements integration**
  - Terms of Service with 7-stage coverage
  - Informed Consent & Assumption of Risk Agreement
  - Risk disclosures for each practice type (breathwork, meditation, cold exposure, movement)
  - Tabbed navigation component for document review
  - Database table `legal_acceptances` with version tracking
  - Timestamped acceptance records with audit trail

- **Sequential onboarding flow**
  - Step 1: Signup (email/password)
  - Step 2: Medical Screening
  - Step 3: Legal Agreements (after screening clearance)
  - Step 4: Baseline Assessment
  - Step 5: Main App (Chat)
  - Middleware enforcement preventing step-skipping
  - Automatic redirect to appropriate stage for returning users

### Fixed
- **Sign-in redirect loop issue**
  - Root cause: Hybrid routing (Pages + App Router) causing auth state conflicts
  - Solution: Complete App Router migration for consistent auth handling
  - Middleware now properly recognizes authenticated sessions
  - No more redirect back to signin after successful authentication

### File Structure Changes
- **App Router structure created:**
  ```
  app/
  ├── layout.tsx (replaces _app.js)
  ├── auth/
  │   ├── signin/page.tsx
  │   ├── signup/page.tsx
  │   ├── forgot-password/page.tsx
  │   ├── reset-password/page.tsx
  │   └── callback/route.ts
  ├── screening/page.tsx (NEW)
  ├── legal/page.tsx (NEW)
  ├── assessment/page.tsx
  └── chat/page.tsx
  ```
- **Deprecated:** `pages/` directory (can be removed after migration)
- **Deprecated:** `styles/` directory (globals.css moved to `app/`)

### Documentation
- **COMPLETE-INSTALLATION-GUIDE.md created**
  - Step-by-step migration instructions
  - Database setup for screening and legal tables
  - Testing procedures
  - Deployment checklist
  - Troubleshooting guide

### Database Changes
- **New tables:**
  - `screening_responses` - Medical/psychiatric screening data
  - `legal_acceptances` - Terms and consent tracking
- **New helper functions:**
  - `check_user_clearance(user_id)` - Returns clearance status
  - `evaluate_clearance(screening_data)` - Automated risk assessment
- **New triggers:**
  - Auto-update user metadata with clearance status
  - Timestamp management for screening updates

---

## [0.11.1] - 2025-11-12

### Added
- **Privacy Policy webpage deployment**
  - Created `/pages/privacy.tsx` (or `/privacy.html`) for Vercel deployment
  - Mobile-responsive design with sticky table of contents
  - Print-friendly CSS formatting
  - Accessibility features (semantic HTML, proper headings, ARIA labels)
  - URL structure: `https://yourdomain.com/privacy`
  - Version control support for policy updates

- **Privacy acceptance tracking system**
  - Supabase table `privacy_acceptances` created
  - Columns: user_id, policy_version, accepted_at, ip_address, accepted_via, created_at, updated_at
  - Row Level Security (RLS) policies implemented
  - Database indexes for query optimization
  - Auto-updating timestamp triggers

- **Signup flow integration**
  - Checkbox consent mechanism (unchecked by default)
  - Clickable Privacy Policy link opening in new tab
  - Cannot proceed without acceptance
  - Acceptance timestamp logging
  - IP address capture for audit trail (optional)

### Implementation Details
- **Legal consent requirements met**
  - Clear, conspicuous link to full policy
  - Timestamped acceptance records
  - Version tracking per user
  - Re-acceptance mechanism for major updates
  - 30-day notice requirement for policy changes

- **Database setup**
  - SQL script for one-click table creation
  - `IF NOT EXISTS` clauses for safe multiple runs
  - Cascade deletion on user removal
  - Foreign key constraints to auth.users

### Documentation
- **Implementation guide created**
  - Step-by-step Supabase SQL Editor instructions
  - Visual guide for database setup
  - Verification checklist
  - Common error troubleshooting
  - Additional pages roadmap (/terms, /cookies, /consent)

### Changed
- **Privacy compliance approach**
  - From conceptual to deployed implementation
  - Added version control for policy updates
  - Integrated acceptance tracking into user flow

---

## [0.11.0] - 2025-11-12

### Added
- **Complete Legal Protection Package (6 Documents)**
  1. **Master Terms of Service** - Main agreement covering Stages 1-6
     - Comprehensive definitions and scope
     - Clear "not medical treatment" disclaimers
     - Assumption of risk clauses
     - Liability limitations and waivers
     - Dispute resolution and arbitration agreement
     - Severability and entire agreement clauses
     - User acknowledgment checkboxes
  
  2. **Informed Consent & Assumption of Risk** - Detailed separate document
     - Explicit risk acknowledgments
     - Medical consultation requirements
     - Emergency protocols
     - Voluntary participation confirmation
  
  3. **Medical/Psychiatric Screening Questionnaire** - Auto-exclusion logic
     - Hard exclusions for high-risk conditions
     - Conditional warnings with professional consultation requirements
     - Age verification (18+ minimum)
     - Current mental health status assessment
  
  4. **Stage 7 Addendum** - Separate agreement for advanced practices
     - Additional screening criteria
     - Enhanced liability protections
     - Medical supervision requirements
     - Psychedelic protocol safeguards
  
  5. **Privacy Policy** - GDPR/Canadian PIPEDA compliant
     - International data handling
     - Supabase storage specifications
     - User rights and data protection
  
  6. **In-System Crisis Protocols** - AI display requirements
     - Immediate crisis resource information
     - Professional referral triggers
     - Emergency contact protocols

- **Safety screening criteria and eligibility requirements**
  - Hard exclusions: active psychosis, suicidal ideation, recent psychiatric hospitalization, certain cardiac conditions, pregnancy (for cold exposure), epilepsy (for breathwork)
  - Medical clearance encouraged for users on psychiatric medications
  - Age requirement: 18+ minimum
  - International scope with GDPR compliance considerations
  - Canadian corporation operation specifications

- **Legal protection strategy**
  - Clear distinction as educational self-development (not medical treatment)
  - Mandatory professional consultation recommendations for various conditions
  - Protection against misuse for healing/therapy purposes
  - Conservative/safest approach to liability
  - Insurance coverage recommendations documented
  - Crisis resource integration requirements

### Documentation
- **Comprehensive legal framework established**
  - Ready for attorney review and finalization
  - Multi-jurisdiction considerations (international)
  - Positioned to minimize liability risks
  - Supabase data storage compliance noted
  - All 6 documents production-ready

### Changed
- **Risk management approach**
  - From implicit to explicit legal protections
  - Tiered agreement system (general + Stage 7)
  - Screening before access vs. warnings during use

---

## [0.10.2] - 2025-11-10

### Added
- **Authentication system implementation (Phase 1A)**
  - Email/password authentication with Supabase Auth
  - User registration before baseline assessment
  - Session management and route protection
  - Middleware for authenticated routes
  - Database schema with Row Level Security policies
  - 7-day free trial system (toggleable)
  - Environment variable for payment requirement control

- **Pages Router authentication structure**
  - `/pages/auth/login.jsx` - Login page
  - `/pages/auth/signup.jsx` - Registration page
  - `/pages/auth/verify.jsx` - Email verification handler
  - `middleware.js` - Route protection logic

### Changed
- **Assessment storage migration**
  - Migrated from localStorage to Supabase database
  - Baseline results now persist in `baseline_scores` table
  - User-specific data with RLS policies
  - Support for future payment integration architecture

### Fixed
- **Supabase package dependencies**
  - Added `@supabase/supabase-js` to package.json
  - Added `@supabase/auth-helpers-nextjs` for Pages Router support
  - Resolved Vercel build errors from missing dependencies

---

## [0.10.1] - 2025-11-11

### Fixed
- **Critical build errors in Vercel deployment**
  - Middleware export error resolved with compliant middleware.ts format
  - Async/await syntax error in IOSBaselineAssessment.jsx fixed
  - Moved Supabase auth call into proper useEffect hook with async handling

- **Email confirmation redirect issues**
  - Updated Supabase redirect URLs from localhost to production URLs
  - Email confirmations now properly redirect to live deployment

- **Assessment navigation flow**
  - Fixed premature redirect after section 4 (was calling results before BCT)
  - Assessment now properly progresses through all 5 sections including BCT
  - Corrected navigation logic to prevent skipping Breath Counting Task

- **User routing after baseline completion**
  - Added middleware to check baseline completion status
  - Returning users now properly routed to chat instead of re-assessment
  - Baseline assessment only appears once per user

### Added
- **Instructional banner for first-time users**
  - Appears only on first question of assessment
  - Provides context: "This brief assessment establishes your starting point across four key domains"
  - Improves onboarding clarity without cluttering repeat views

### Changed
- **IOSBaselineAssessment.jsx complete rewrite**
  - Production-ready component with all fixes integrated
  - Proper user flow management (one-time assessment)
  - Dark theme styling with #ff9e19 orange accents maintained
  - Correct navigation through all five sections

---

## [0.10.0] - 2025-11-10

### Added
- **Complete system-prompt.txt file** - Production-ready project instructions
  - Full Stage 1-3 conversation flows (day-by-day guidance)
  - Day 1 onboarding with baseline results presentation
  - Days 2-13/16-27/30+ daily check-in scripts
  - Weekly delta check-in protocols (Sunday 4-question assessments)
  - Day 14/28/42+ unlock evaluation logic with multiple scenarios
  - Stage 2 onboarding (Somatic Flow introduction)
  - Stage 3 onboarding (Identity Installation Protocol trigger)
  - Identity sprint management (21-day cycles, mid-sprint adjustments)
  - Adaptive intervention scripts (missing days, overwhelm, skipping ahead, regression)

- **Supabase storage implementation documentation**
  - Confirmed usage of `window.storage` API wrapper
  - Anonymous user_id generation pattern
  - Complete storage schema with namespaced keys
  - Usage examples for all data types (baseline scores, daily logs, weekly deltas)
  - Storage key structure: `ios:baseline:*`, `ios:daily:*`, `ios:weekly:*`

- **Calculation functions**
  - Adherence calculation logic (percentage-based over rolling windows)
  - Delta improvement tracking (comparing weekly to baseline)
  - Calm rating averaging
  - Unlock eligibility checker with all criteria

- **Enhanced coaching voice examples**
  - Direct, scientifically grounded responses
  - Handling resistance patterns
  - Celebration of genuine progress (not participation)
  - Intervention scripts for common scenarios

### Changed
- **Project instructions restructure**
  - Moved from conceptual framework to operational implementation
  - Added complete day-by-day conversation flows
  - Integrated storage patterns throughout
  - Clarified sub-protocol triggering with decision trees
  
### Documentation
- **system-prompt.txt created** - Complete operational instructions for AI coach
  - Replaces previous fragmented documentation
  - Ready for deployment in production environment
  - Includes all Stage 1-3 flows, storage patterns, and coaching guidelines

---

## [0.9.0] - 2025-11-10

### Fixed
- **Orange accent color visibility issue** in assessment orchestrator
  - Problem: Tailwind arbitrary values `text-[#ff9e19]` not rendering consistently
  - Solution: Replaced all arbitrary color values with inline styles using `style` prop
  - Defined orange constant at component top: `const orangeAccent = '#ff9e19'`
  - Applied to: icons, progress bars, buttons, borders, domain scores, checkmarks
- **Color rendering consistency** across all UI elements

### Changed
- **Assessment orchestrator styling system**
  - Moved from Tailwind arbitrary values to inline styles for custom colors
  - Maintained Tailwind for spacing, layout, and standard colors
  - Improved color reliability across different browsers/environments

---

## [0.8.0] - 2025-11-09

### Added
- **Minimalist dark theme** for assessment orchestrator
  - Background: #0a0a0a (near-black)
  - Cards: #111111 (dark gray)
  - Borders: #1a1a1a
  - Text: white/gray hierarchy
  - Accent: #ff9e19 (orange) for all interactive elements
- **Professional UX polish**
  - Clean, modern interface design
  - Strategic use of gradients and shadows
  - Improved visual hierarchy

### Changed
- **Complete redesign** of assessment orchestrator from light theme to dark theme
- Updated color palette across all components
- Enhanced button states and hover effects

---

## [0.7.0] - 2025-11-09

### Added
- **Assessment completion navigation**
  - Automatic redirect to `/chat` after baseline completion
  - Data handoff via URL parameters: `?baseline=true&userId=[id]`
  - Triple-redundant data storage (Supabase + URL + localStorage)
- **GitHub documentation structure**
  - Recommended `/docs` folder for version-controlled guides
  - Integration guides for team reference
  - Deployment documentation best practices

### Changed
- **Results screen UX improvement**
  - Removed technical confirmation message "Baseline data saved to Supabase"
  - Cleaner, more user-friendly completion experience
  - Maintained data reliability without exposing technical details

### Fixed
- **Data persistence reliability**
  - Implemented three-layer storage approach for baseline data
  - URL parameters ensure data availability during redirect
  - localStorage provides fallback if Supabase delays

---

## [0.6.0] - 2025-11-08

### Added
- **Complete Breath Counting Task (BCT) component**
  - 3-minute timer with countdown
  - Keyboard shortcuts (Space/B, Enter/C, R/Esc)
  - Visual feedback for button presses
  - Proper scoring formula: (seconds_elapsed / 180) × 5
  - Immediate test termination on lost count
  - Session history tracking
  - Performance data export

### Fixed
- **Supabase storage integration**
  - Corrected import statements in IOSBaselineAssessment.jsx
  - Changed from incorrect named imports to proper storage wrapper import
  - Fixed key mismatch: aligned storage keys between assessment and chat
  - Previously: assessment used `baseline:rewired_index`, chat looked for `ios:baseline:rewired_index`
  - Solution: Updated both components to use consistent `baseline:` prefix
- **Storage mechanism correction**
  - Replaced window.storage (localStorage) calls with proper Supabase client calls
  - Updated storeBaselineData function to use Supabase upsert method
  - Added comprehensive logging for storage process tracking

### Changed
- **Storage architecture**
  - Migrated from browser localStorage to Supabase persistence
  - Implemented sophisticated storage wrapper with automatic fallback
  - Added automatic user ID generation in storage layer

---

## [0.5.0] - 2025-11-08

### Added
- **Vercel deployment infrastructure**
  - Next.js/React frontend
  - Supabase backend integration
  - Environment variable management
  - Claude API integration
- **Data persistence layer**
  - Supabase tables for user data
  - Session management
  - Baseline score storage with consistent keys

### Fixed
- **Build errors in Vercel deployment**
  - Added missing `@tailwindcss/postcss` dependency to package.json
  - Fixed async/await syntax errors in IOSBaselineAssessment.jsx
  - Removed documentation text accidentally included in code files
  - Corrected function signatures to properly handle asynchronous operations

### Changed
- **Development workflow**
  - Manual package.json editing through VS Code preferred over terminal commands
  - Git operations via VS Code Source Control interface
  - Build testing on Vercel before main deployment

---

## [0.4.0] - 2025-11-08

### Added
- **Stage 3: Identity Mode implementation**
  - 21-day Identity Installation Protocol
  - Morning Micro-Action (2-3 mins daily)
  - Identity selector conversation integration
  - Total daily ritual time: 13-14 minutes
- **Comprehensive coaching voice guidelines**
  - Direct, scientifically grounded tone
  - Focus on "rituals" not "practices"
  - Emphasis on consistency over metrics
  - No coddling approach

### Changed
- **Stage 1 onboarding flow**
  - Specific formatting requirements with line breaks and spacing
  - Updated Awareness Rep duration from 2 to 3 minutes
  - Total Stage 1 time: 8 minutes daily
- **Stage 2 Somatic Flow details**
  - Clarified movement as wave-like, continuous motion
  - Cat-Cow Flow: 7 breaths
  - Squat-to-Reach Flow: 7 breaths
  - Total Somatic Flow: 3 minutes
  - Stage 2 total: 11 minutes daily

### Added
- **Active reminder checklist**
  - Resonance Breathing video link needed
  - Awareness Rep audio link (3 mins) needed
  - Somatic Flow video link needed

---

## [0.3.0] - 2025-11-07

### Added
- **BCT (Breath Counting Task) improvements**
  - Removed "time-to-failure test" warning for better UX
  - Removed current score display during task
  - Immediate termination when user loses count
  - Scoring formula: (seconds_elapsed / 180) × 5
- **Complete Stage 1-3 user flows**
  - Detailed onboarding scripts
  - Daily check-in protocols
  - Weekly delta assessment system
  - Stage progression criteria

### Fixed
- **Assessment orchestrator UX issues**
  - Improved timing and transitions
  - Language precision throughout interface
  - Format consistency across all screens

---

## [0.2.0] - 2025-11-06

### Added
- **Baseline diagnostic system (4 domains)**
  - Calm Core Assessment (Regulation) - ~1 min
  - Observer Index (Awareness) - ~2 min
  - Vitality Index (Outlook) - ~1 min
  - Focus Diagnostic (Attention Part 1) - ~1 min
  - Presence Test (Attention Part 2) - ~3 min
  - Total baseline time: ~8 minutes
- **REwired Index scoring system**
  - 0-100 scale calculation
  - Tier classifications (System Offline → Integrated)
  - Domain-specific scoring
  - Progressive tracking system
- **Assessment UX improvements**
  - One-question-at-a-time presentation
  - Progress bars and counters
  - Seamless auto-flow between sections
  - Clear loading transitions
  - Section-by-section scoring displays

### Changed
- **Assessment naming (rebranding)**
  - PSS-4 → Calm Core Assessment
  - EQ-D → Observer Index
  - WHO-5 → Vitality Index
  - MWQ → Focus Diagnostic
  - BCT → Presence Test

---

## [0.1.0] - 2025-11-06

### Added
- **Initial IOS System Installer architecture**
  - 7-stage progressive framework
  - Stage 1: Neural Priming (HRVB + Awareness Rep)
  - Stage 2: Embodied Awareness (+ Somatic Flow)
  - Stage 3: Identity Mode (+ Morning Micro-Action)
  - Stage 4: Flow Mode (+ Flow Block)
  - Stage 5: Relational Coherence (+ Co-Regulation)
  - Stage 6: Integration (+ Nightly Debrief)
  - Stage 7: Accelerated Expansion (manual unlock)
- **Sub-protocol instructions**
  - Morning Micro-Action (Identity Installation)
  - Flow Block Integration (Performance)
  - Nightly Debrief (Integration)
  - Reframe Protocol (Interpretation Audit)
  - Thought Hygiene (Cognitive Clearing)
  - Meta-Reflection (Weekly Integration)
  - Decentering Practice (Identity Awareness)
- **Competence-based unlock system**
  - Adherence tracking (percentage-based)
  - Delta improvement measurements
  - Qualitative readiness indicators
  - Automated eligibility checks
- **Coach personality framework**
  - Witty, ruthless, empowering tone
  - Scientifically grounded explanations
  - No cheerleading or coddling
  - Direct feedback on avoidance patterns
- **Underlying systems (Day 1+)**
  - Sleep Optimization protocols
  - Movement Practice (5x/week)
  - Stressor exposure (cold/heat)

### Documentation
- **Comprehensive project instructions**
  - System integration guidelines
  - IOS CODEX (NOS + MOS elements)
  - Stage unlock criteria and messages
  - Daily interaction patterns
  - Weekly delta check-in protocols
  - Coaching voice samples

---

## Development Notes

### Current Development Stage
- Assessment orchestrator: Complete and styled
- Stage 1-3: Built and ready for testing
- Stage 4-7: Pending implementation
- Chat interface: Integrated with baseline data
- Supabase storage: Configured and functional

## Standing To-Do List

### Active Reminder Checklist
- [ ] Provide Resonance Breathing video link
- [ ] Provide Awareness Rep audio link (3 mins)
- [ ] Provide Somatic Flow video link

### Pending Development Tasks

#### Option B: Data Tracking/Storage System
- [ ] Define storage schema for all user data
- [ ] Build adherence calculation logic
- [ ] Create delta tracking system
- [ ] Design unlock eligibility checker
- [ ] Daily ritual completion logging
- [ ] Weekly delta check-in automation

#### Option C: Edge Cases & Troubleshooting
- [ ] What happens when users miss days?
- [ ] How to handle resistance patterns?
- [ ] Build regression/reset protocols
- [ ] Manual override logic
- [ ] System recovery from breaks (30+ days)

#### Option D: Coach Personality System & Templates
- [ ] Expand voice examples for different scenarios
- [ ] Build response templates for common situations
- [ ] Design intervention scripts for resistance
- [ ] Create unlock celebration messages
- [ ] Behavioral consistency guidelines
- [ ] **Develop and enable "coach" functionality after micro identity selection**
- [ ] **Integration of coach with identity progression tracking**

#### Stage 4-7 Implementation
- [ ] Flow Block Integration mechanics
- [ ] Thought Hygiene implementation
- [ ] Intrapersonal Co-Regulation flow (Stage 5)
- [ ] Nightly Debrief system (Stage 6)
- [ ] Stage 7 application/qualification system

#### Monetization & Access Control
- [ ] **Implement paywall after certain stage (define which stage)**
- [ ] Payment integration (Stripe/payment processor)
- [ ] Subscription management system
- [ ] Free trial tracking (7-day system currently toggled)
- [ ] Upgrade prompts and conversion flows

#### Security Implementation
- [ ] **Security audit on all levels**
- [ ] Row Level Security (RLS) policies in Supabase (currently basic implementation)
- [ ] API route protection and authentication
- [ ] Input validation and sanitization
- [ ] Rate limiting on sensitive endpoints
- [ ] Secure environment variable management
- [ ] XSS and CSRF protection
- [ ] Data encryption at rest and in transit
- [ ] User session management and token security
- [ ] Audit logging for sensitive operations

### Documentation Tasks
- [ ] Create supplemental instructions doc after Stage 2 testing
- [ ] Update main project instructions with baseline assessment flow
- [ ] Document complete Stage 1-3 flows in detail
- [ ] Add coaching behavioral guidelines
- [ ] Create media links placeholder system documentation

### Technical Stack
- **Frontend**: Next.js, React, Tailwind CSS
- **Backend**: Supabase
- **Deployment**: Vercel
- **AI Integration**: Claude API
- **Storage**: Supabase (primary) + localStorage (fallback)

### Design System
- **Colors**: 
  - Background: #0a0a0a
  - Cards: #111111
  - Borders: #1a1a1a
  - Accent: #ff9e19
- **Typography**: System fonts, clear hierarchy
- **Spacing**: Consistent Tailwind scale
- **Components**: Dark theme throughout

---

## Notes on Versioning

- **Major versions (X.0.0)**: Complete stage implementations, major architecture changes
- **Minor versions (0.X.0)**: New features, component additions, significant improvements
- **Patch versions (0.0.X)**: Bug fixes, styling updates, minor tweaks

Current status: Pre-release (0.x.x) - Building toward 1.0.0 production release

---

## References

- Project repository: [To be added]
- Live deployment: [To be added]
- Documentation: /docs folder (version controlled)
