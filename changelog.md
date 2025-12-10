# IOS System Installer - Changelog

All notable changes to the IOS (Integrated Operating System) project will be documented in this file.

---

## [0.20.0] - 2025-12-10

### Added - Phase 1: Sprint Renewal System
- **21-Day Sprint Renewal Flow**
  - Automatic detection when users reach Day 22+ of Identity or Flow Block sprints
  - Three renewal options: Continue (same focus), Evolve (deepen), Pivot (new direction)
  - Sprint completion tracking in database (`completion_status: 'completed'`)
  - New sprint creation with incremented `sprint_number`
  - Seamless conversation flow for renewal decisions

- **New Files Created**
  - `/lib/sprintRenewal.ts` - Sprint detection and renewal logic
  - `/lib/sprintDatabase.ts` - Database operations for sprint management

- **Database Updates**
  - `identity_sprints.completion_status` transitions: 'active' → 'completed'
  - `flow_block_sprints.completion_status` transitions: 'active' → 'completed'
  - Sprint history preserved for future analytics

### Added - Phase 2: Auto-Unlock Notification
- **Unlock Eligibility Detection**
  - Automatic notification when user meets stage unlock criteria
  - Uses `progress.unlockEligible` from existing unlock checker
  - Dynamic stage intro messages for Stages 2-6
  - "Yes, unlock Stage X" button triggers stage advancement

- **Stage Introduction Messages**
  - Stage 2: Embodied Awareness intro (Somatic Flow)
  - Stage 3: Identity Mode intro (Morning Micro-Action)
  - Stage 4: Flow Mode intro (Flow Block)
  - Stage 5: Relational Coherence intro (Co-Regulation)
  - Stage 6: Integration intro (Nightly Debrief)

### Added - Phase 3: Stage 5-6 Practice Modals
- **Co-Regulation Practice Modal** (`/components/CoRegulationModal.tsx`)
  - Full-screen modal matching existing ritual pattern
  - 5-day rotation system (Friend → Neutral → Self → Difficult → All beings)
  - Day calculated from day-of-year for universal consistency
  - Audio-driven practice (`/audio/Relational.mp3`)
  - Visual breath guide with inhale/exhale animation
  - Static instructions: "Inhale — Be Blessed" / "Exhale — I wish you peace and love"
  - Focus target display, End Early button
  - Optional reflection phase, auto-logging on completion
  - `useCoRegulation()` hook for easy integration

- **Nightly Debrief Modal** (`/components/NightlyDebriefModal.tsx`)
  - Full-screen modal for evening integration practice
  - 4 phases: intro → breathe (3 cycles) → reflect → complete
  - Core question: "What did reality teach me today?"
  - Lesson capture with styled quote display
  - Auto-logging with lesson text stored in notes
  - Evening reminder logic (after 6pm, Stage 6+ only)
  - `useNightlyDebrief()` hook for easy integration

- **Updated Components**
  - `ToolsSidebar.tsx` - Routes Co-Reg and Nightly Debrief to modals
  - `FloatingActionButton.tsx` - Mobile modal integration
  - `ChatInterface.tsx` - Removed chat-based handlers, kept evening reminder

### Changed
- **Practice Flow Architecture**
  - Stage 5-6 practices now use modal pattern (consistent with Stage 1-2 rituals)
  - Removed chat-based practice flows for Co-Regulation and Nightly Debrief
  - Sidebar shows "Start Practice" when incomplete, "Run Again" + ✓ when complete
  - Added timing hints: "3 min • Evening" and "2 min • Before sleep"

### Fixed
- **Unlock Detection**
  - Fixed property reference: `progress.unlockProgress.isEligible` → `progress.unlockEligible`
  - Ensures unlock notifications trigger correctly

---

## [0.19.1] - 2025-12-04

### Fixed
- **TypeScript compilation error on deployment**
  - Property name mismatch: `progress.unlockProgress.isEligible` → `progress.unlockEligible`
  - Fixed in ChatInterface.tsx line 2347

---

## [0.19.0] - 2025-12-04

### Added
- **Two-Stage Extraction Pattern for Micro-Action**
  - Stage 1: Claude responds naturally to user during identity discovery
  - Stage 2: When user commitment detected (e.g., "yes", "I commit"), silent API call extracts structured data
  - New functions: `isIdentityCommitmentResponse()`, `buildMicroActionExtractionMessages()`, `parseMicroActionExtraction()`
  - Data saved to `identity_sprints` table with correct column names
  - Sidebar updates to show "Day X of 21" after sprint creation

- **Two-Stage Extraction Pattern for Flow Block**
  - Mirrors Micro-Action pattern for consistency
  - Stage 1: Natural conversation through Flow Block discovery and planning
  - Stage 2: Silent extraction when user commits to weekly schedule
  - New functions: `isFlowBlockCommitmentResponse()`, `buildFlowBlockExtractionMessages()`, `parseFlowBlockExtraction()`
  - Weekly map, setup requirements, and sprint data saved to database

- **Sprint Database Architecture**
  - New `identity_sprints` table for 21-day cycle tracking
  - Columns: `identity_statement`, `micro_action`, `start_date`, `completion_status`, `sprint_number`
  - `flow_block_sprints` table for Flow Block tracking
  - Columns: `weekly_map`, `setup_requirements`, `start_date`, `completion_status`
  - SQL migration scripts for table creation

- **Button Text Updates**
  - "Complete Today's Flow Block" button text (dynamic based on sprint status)
  - "Complete Today's Micro-Action" button text
  - "Day X of 21" sprint progress display

### Changed
- **Flow Block API route handling**
  - Added `flow_block_setup` context case
  - Added `flow_block_extraction` context with lower temperature (0.3)
  - Added `micro_action_extraction` context case

### Fixed
- **Database column name mismatches**
  - `identity_statement` (not `identity`)
  - `start_date` (not `sprint_start_date`)
  - `completion_status: 'active'` (not `is_active: true`)
  - `isComplete` and `isActive` (not `isSetupComplete` and `isSetupActive`)

- **FlowBlockState interface alignment**
  - Refactored variable names throughout ChatInterface.tsx to match imported FlowBlockState interface
  - Fixed property references in buildSelectionContext, loadFlowBlockStatus, unlock checks, and tool handlers

---

## [0.18.2] - 2025-12-03

### Fixed
- **Weekly check-in duplicate flow conflict**
  - Conflict between "all-at-once" prompt (4 numbers) and step-by-step handler
  - Created new step 6 in check-in handler to parse all 4 numbers simultaneously
  - Fixed `last_weekly_checkin` not updating in database after completion

- **Data inconsistencies in user_progress**
  - `stage_start_date` reset during testing affected days-in-stage calculation
  - Manual database corrections applied

---

## [0.18.1] - 2025-12-03

### Added
- **Weekly Check-in Auto-Detection**
  - Automatic prompt when user opens chat after 7+ days since last check-in
  - Sunday detection for weekly timing
  - Logic added to ChatInterface initialization
  - Checks `last_weekly_checkin` field from Supabase

### Changed
- **Unlock Progress Element Repositioned**
  - Moved from ToolsSidebar to left sidebar in ChatInterface
  - Better organization of UI elements
  - Reduced clutter in tools panel

### Fixed
- **Morning Micro-Action button behavior**
  - "Mark Complete" button incorrectly triggering chat guidance
  - Changed onClick handler from `handleStartPractice` to `handleMarkComplete`
  - Fixed in both ToolsSidebar.tsx and FloatingActionButton.tsx

---

## [0.18.0] - 2025-12-03

### Fixed
- **Stage 3 Opening Message Bug**
  - Users in Stage 3+ seeing Stage 1 content instead of appropriate stage content
  - Root cause: Missing `last_visit` column causing `determineOpeningType` to default to 'first_time'
  - Added null checks for all onboarding status fields

- **Daily Ritual Reset Issues**
  - Rituals showing as "completed" despite being done previous day
  - UTC vs local date mismatch in multiple files
  - Fixed in: ChatInterface, ProgressDisplay, useUserProgress, practice API

- **Duplicate Adherence UI Elements**
  - Removed duplicate tracking display from left sidebar
  - Now only appears in tools panel

### Changed
- **Stage 3 Micro-Action Template Cleanup**
  - Eliminated redundant body-check questions
  - Fixed awkward framing issues
  - Smoother conversation flow

---

## [0.17.0] - 2025-12-02

### Added
- **Code Cleanup for ChatInterface.tsx**
  - Removed unused imports
  - Removed duplicate useEffect hooks
  - Removed dead comments
  - Implemented development-only console logging (`devLog` function)
  - File size reduced by ~5% while maintaining all functionality

- **Sprint Tracking System Architecture**
  - 21-day cycle tracking for MicroAction and FlowBlock
  - Database tables for sprint history
  - Completion tracking and performance metrics
  - Sprint day calculation ("Day X of 21")

### Fixed
- **Opening Message Logic**
  - Users in Stage 3+ incorrectly seeing first-time onboarding messages
  - Added backup check based on user's current stage progression
  - Fixed incomplete database flags issue

---

## [0.16.0] - 2025-12-02

### Added
- **Comprehensive Template Library Specification**
  - All template scenarios mapped across 7 stages
  - Stage 1: Ritual introduction flow (4 templates with quick-reply buttons)
  - Stage 2-6: Daily prompts, stage introductions, completion acknowledgments
  - Weekly delta check-in templates
  - Stage unlock notification templates
  - Progress summary templates
  - Universal templates (greetings, missed day detection)

- **Template Engine Implementation**
  - `/lib/templates/templateLibrary.ts` - All template content
  - `/lib/templates/selectTemplate.ts` - Selection logic based on context
  - `/lib/templates/processTemplate.ts` - Variable interpolation
  - Zustand store for shared state management

### Changed
- **Architecture Decision: Template vs Claude Split (80/20 rule)**
  - Templates handle: daily prompts, stage unlocks, progress summaries, scripted intros
  - Claude handles: questions, on-demand protocols, pattern recognition, coaching
  - Benefits: 80% cost savings, instant responses, consistency

---

## [0.15.0] - 2025-11-28

### Added
- **Practice Tracking System Enhancements**
  - `onPracticeCompleted` callback from FloatingActionButton to ChatInterface
  - Chat automatically acknowledges when user completes practice via modal
  - Real-time progress display updates
  - Stage-specific practice requirements tracking

- **Toolbar Refresh Fix**
  - Zustand store for shared state management
  - Practice tracking interface updates without page reload
  - Resolved sync issues between chat and toolbar

### Changed
- **Terminology Consistency**
  - "Start Practice" → "Start Ritual"
  - Full practice names displayed (e.g., "Resonance Breathing" not "Resonance")
  - "Daily Practices" → "Daily Rituals" throughout UI

---

## [0.14.0] - 2025-11-27

### Added
- **Hybrid Template System for Ritual Introduction**
  - New `introStep` state machine (0-4) tracks position in scripted flow
  - Template-driven messages for Stage 1 ritual introductions (zero API calls for compliant users)
  - Quick-reply buttons: "Yes, let's go", "Got it, next ritual", "Got it, I'm ready"
  - Affirmative text detection: recognizes "yes", "got it", "makes sense", "ready", etc.
  - Escape hatch with redirect: if user asks question mid-intro, Claude answers then prompts return to flow
  - `ritualIntroTemplates` object with ritual1Intro, ritual2Intro, wrapUp messages
  - `introQuickReplies` object defining button text per step
  - `getIntroRedirectMessage()` function for graceful flow recovery
  - Database column: `ritual_intro_completed` boolean in user_progress table

- **Practice Completion Chat Integration**
  - `onPracticeCompleted` callback from FloatingActionButton to ChatInterface
  - Chat automatically acknowledges when user completes practice via modal
  - Seamless connection between practice tracking UI and conversational interface

### Changed
- **Terminology Standardization**
  - "HRVB (Resonance Breathing)" → "Resonance Breathing" (simpler, user-friendly)
  - "Daily Practices" → "Daily Rituals" throughout UI
  - Consistent naming across stageRituals object, progress display, and chat messages

### Architecture Decision
- **Template vs Claude Split (80/20 rule)**
  - Templates handle: daily prompts, stage unlocks, progress summaries, scripted intros
  - Claude handles: questions, on-demand protocols, pattern recognition, coaching
  - Benefits: 80% cost savings, instant responses, consistency, Claude stays fresh

---

## [0.13.2] - 2025-11-27

### Added
- **Resonance Breathing Modal Integration**
  - Full visual breathing animation (inhale 4s, exhale 6s rhythm)
  - Expanding/contracting circle with gradient effects
  - Phase indicator text ("Inhale..." / "Exhale...")
  - 5-minute guided session with countdown timer
  - Session completion tracking and acknowledgment

- **Audio System for Breathing Practice**
  - Singing bowl tones marking breath phase transitions
  - Optional binaural beats toggle (hidden until user requests)
  - Dual audio approach: HTML5 Audio for iOS Safari, Web Audio API for desktop
  - Graceful fallback when audio context blocked

### Fixed
- **iOS Safari Audio Issues**
  - Safari blocks Web Audio API autoplay - implemented HTML5 Audio fallback
  - Touch event triggers audio context resume
  - Mobile detection for appropriate audio strategy

---

## [0.13.1] - 2025-11-27

### Added
- **Comprehensive Practice Tracking System**
  - Practice logging API endpoint with user authentication
  - Adherence percentage calculation (completed/expected over time window)
  - Consecutive day streak tracking
  - Real-time progress display in dashboard
  - Stage-specific practice requirements

### Fixed
- **CRITICAL: Timezone Bug in Practice Tracking**
  - Root cause: Server using UTC, user in Calgary (Mountain Time, UTC-7)
  - Symptom: Practices logged in evening stored under next day's UTC date
  - Example: Nov 26 10:30 PM MT = Nov 27 05:30 AM UTC → wrongly counted as Nov 27
  - Solution: Frontend sends client's local date string, all calculations use local time
  - Files affected: practice logging API, adherence calculations, streak logic, progress display

### Changed
- **Date Handling Architecture**
  - All practice dates now stored as local date strings (YYYY-MM-DD)
  - Removed server-side UTC conversions for user-facing dates
  - Dashboard "today" logic uses client timezone

---

## [0.13.0] - 2025-11-26

### Added
- **Mobile Dashboard Drawer**
  - Hamburger menu icon replacing full sidebar on mobile
  - Slide-out drawer with all navigation options
  - Touch-friendly tap targets (44px minimum)
  - Backdrop overlay with tap-to-close
  - Smooth animation transitions

- **Mobile Tools Feature Parity**
  - FloatingActionButton now shows progress information
  - Quick-access to daily rituals from any screen
  - Responsive breakpoints: mobile (<768px), tablet, desktop

### Changed
- **Responsive Layout System**
  - Sidebar hidden on mobile, visible on tablet+
  - Content area full-width on mobile
  - Consistent spacing across breakpoints

---

## [0.12.9] - 2025-11-26

### Fixed
- **Daily Ritual Reset Bug (Timezone)**
  - Same UTC vs local date issue affecting "new day" detection
  - Rituals showing as incomplete despite being done
  - Fixed in 4 files: ChatInterface, ProgressDisplay, useUserProgress, practice API

---

## [0.12.8] - 2025-11-25

### Changed
- **Decentering Practice Protocol v2.0**
  - Removed step labels ("Step 1", "Step 2") - now flows conversationally
  - Added bridge stages between decentering and re-engagement
  - "Stay with the Felt Sense" stage - locate emotion as physical sensation
  - "Soft Inquiry" stage - gentler awareness-pointing questions
  - Enhanced "player vs avatar" metaphor integration
  - Improved closing ritual with pause instructions
  - Integration anchors connecting insight to real-world application

---

## [0.12.7] - 2025-11-24

### Fixed
- **Onboarding Redirect Loop (Again)**
  - Edge case: users with partial data getting stuck
  - Added null checks for all onboarding status fields
  - Improved middleware logic for incomplete states

---

## [0.12.6] - 2025-11-22

### Added
- **Opening Message Architecture**
  - Hybrid approach: template for structure, API call for personalized insight
  - Morning greeting varies by time of day
  - Progress summary pulled from database
  - One personalized observation from Claude based on recent activity

### Changed
- **Conversation Pacing System**
  - Added explicit "STOP" instructions in system prompt
  - Rituals introduced one at a time, waiting for user confirmation
  - Prevents information overwhelm during onboarding

---

## [0.12.5] - 2025-11-21

### Fixed
- **Multiple Onboarding Edge Cases**
  - Users stuck between screening and legal agreement
  - Assessment completion not properly flagged
  - Baseline data present but user routed back to assessment

---

## [0.12.4] - 2025-11-15

### Added
- **Weekly Delta Check-in System**
  - 4-question self-report (Regulation, Awareness, Outlook, Attention)
  - Comparison to baseline scores
  - Delta calculation and trend tracking
  - Sunday default with user-customizable day

### Changed
- **Progress Visualization**
  - Added delta arrows (↑↓) next to domain scores
  - Color coding: green for improvement, red for decline
  - Baseline comparison always visible

---

## [0.12.3] - 2025-11-15

### Fixed
- **Chat Interface Initial Load**
  - First message sometimes not appearing
  - Race condition between auth check and message fetch
  - Added loading state to prevent premature render

### Changed
- **Error Handling Improvements**
  - More descriptive error messages for API failures
  - Retry logic for transient network issues
  - User-friendly fallback states

---

## [0.12.2] - 2025-11-15

### Added
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
  - `screening_responses` - verified exists ✓
  - `legal_acceptances` - verified exists ✓
  - `baseline_assessments` - corrected from `baseline_scores` ✓

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
- Stage 1: Fully implemented with practice tracking
- Stage 2: Fully implemented with Somatic Flow
- Stage 3: Fully implemented with Identity Installation + Two-Stage Extraction
- Stage 4: Fully implemented with Flow Block + Two-Stage Extraction
- Stage 5: Fully implemented with Co-Regulation modal + 5-day rotation
- Stage 6: Fully implemented with Nightly Debrief modal + evening reminder
- Stage 7: Pending implementation (manual unlock/application system)
- Sprint Renewal: Complete for Identity and Flow Block sprints
- Chat interface: Integrated with baseline data + hybrid template system
- Supabase storage: Configured and functional
- Mobile responsive: Complete with drawer navigation

## Standing To-Do List

### Active Reminder Checklist
- [x] Provide Resonance Breathing video link (www.unbecoming.app/breathe)
- [ ] Provide Awareness Rep audio link (3 mins) - placeholder exists
- [ ] Provide Somatic Flow video link
- [x] Co-Regulation audio (`/audio/Relational.mp3`) - integrated

### Pending Development Tasks

#### HIGH PRIORITY: Template Library Development
- [x] Stage 1 ritual introduction templates (COMPLETE - v0.14.0)
- [x] Template engine implementation (COMPLETE - v0.16.0)
- [ ] Stage 2 ritual introduction templates (Somatic Flow)
- [ ] Stage 3 ritual introduction templates (Morning Micro-Action)
- [ ] Stage 4-6 introduction templates
- [ ] Daily check-in templates (all stages)
- [ ] Weekly delta check-in templates
- [ ] Stage unlock notification templates
- [ ] Progress summary templates

#### Data Tracking/Storage System
- [x] Define storage schema for all user data
- [x] Build adherence calculation logic
- [x] Create delta tracking system
- [x] Daily ritual completion logging
- [x] Weekly delta check-in automation
- [x] Two-stage extraction for identity sprints
- [x] Two-stage extraction for flow block sprints
- [x] Sprint renewal system (Continue/Evolve/Pivot)
- [ ] Design unlock eligibility checker (auto-evaluation)

#### Edge Cases & Troubleshooting
- [ ] What happens when users miss days?
- [ ] How to handle resistance patterns?
- [ ] Build regression/reset protocols
- [ ] Manual override logic
- [ ] System recovery from breaks (30+ days)

#### Coach Personality System & Templates
- [ ] Expand voice examples for different scenarios
- [ ] Build response templates for common situations
- [ ] Design intervention scripts for resistance
- [ ] Create unlock celebration messages
- [ ] Behavioral consistency guidelines
- [ ] **Develop and enable "coach" functionality after micro identity selection**
- [ ] **Integration of coach with identity progression tracking**

#### Stage 5-7 Implementation
- [x] Co-Regulation Practice modal (Stage 5) - COMPLETE v0.20.0
- [x] Nightly Debrief modal (Stage 6) - COMPLETE v0.20.0
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
- **Frontend**: Next.js 16, React, Tailwind CSS
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

### Database Schema (Key Tables)
- `user_progress` - Stage, adherence, streaks, ritual_intro_completed, current_identity
- `baseline_assessments` - Initial 4-domain scores, REwired Index
- `practice_logs` - Daily ritual completion records (now includes nightly_debrief notes)
- `weekly_deltas` - Weekly check-in scores
- `screening_responses` - Medical/psychiatric screening
- `legal_acceptances` - Terms and consent records
- `identity_sprints` - 21-day Micro-Action sprint tracking
- `flow_block_sprints` - Flow Block sprint tracking

---

## Notes on Versioning

- **Major versions (X.0.0)**: Complete stage implementations, major architecture changes
- **Minor versions (0.X.0)**: New features, component additions, significant improvements
- **Patch versions (0.0.X)**: Bug fixes, styling updates, minor tweaks

Current status: Pre-release (0.x.x) - Building toward 1.0.0 production release

---

## References

- Project repository: github.com/kusmich-ai/ios-install
- Live deployment: unbecoming.app
- Documentation: /docs folder (version controlled)
