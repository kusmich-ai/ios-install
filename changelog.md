# IOS System Installer - Changelog

All notable changes to the IOS (Integrated Operating System) project will be documented in this file.

---

## [0.40.0] - 2026-02-28

### Fixed - Critical User Chat Failure
- **Fehren Chat Failure Diagnosis & Fix**
  - Users experiencing consistent "I'm having trouble responding right now" errors
  - Root cause: `baseline_completed` flag set to `false` despite completed assessments
  - `days_in_stage` stuck at 0 instead of reflecting actual days in program
  - Systemic issue: onboarding flow never properly sets `baseline_completed` to `true`
  - Manual database corrections applied for affected users
  - Broader fix implemented for all users with completed baselines

- **Input Sanitization False Positives**
  - Investigated 200 OK responses with empty `data.response`
  - Input sanitization potentially flagging legitimate messages as unsafe
  - Traced error flow through route.ts and ChatInterface.tsx

---

## [0.39.0] - 2026-02-27

### Added - Clinical Assessment System
- **Validated Psychological Measures Integration**
  - PHQ-9 (depression), GAD-7 (anxiety), PSS-10 (stress), PWB-18 (wellbeing)
  - Three-timepoint administration: onboarding, Stage 3 unlock, Stage 6 unlock
  - `clinical_assessments` table with RLS policies
  - Assessment completion tracking per user per phase

- **Assessment Reminder Banner**
  - `/components/AssessmentBanner.tsx` - Persistent auto-detecting banner
  - Phase-appropriate messaging for each assessment timepoint
  - Dismisses per session, reappears until assessment complete
  - Integrated into ChatInterface.tsx

- **Coach Prompting for Assessments**
  - System prompt additions for AI coach to mention assessments naturally
  - Triggers during Stage 3 and Stage 6 unlock conversations
  - Non-intrusive prompting that doesn't interrupt protocol flows

- **Admin Assessment Panel**
  - Individual assessment scores visible in admin dashboard
  - CSV export functionality for assessment data
  - Fixed admin view to query `user_profiles` instead of non-existent `profiles` table

### Fixed
- **RLS Policy for Clinical Assessments**
  - "Permission denied for table users" error on assessment save
  - Updated RLS policies to use JWT email claims instead of direct `auth.users` queries
  - Corrected Supabase import from deprecated `@supabase/auth-helpers-nextjs` to `@supabase/ssr`
  - Fixed .ts vs .tsx file extension issues causing JSX parsing failures

---

## [0.38.0] - 2026-02-25

### Added - Stage 1 Experience Layer (Full Implementation)
- **STAGE1_EXPERIENCE_LAYER Constant**
  - Complete 7-enhancement system injected into system prompt
  - Activated for both `ritual_completion` and `default` chat contexts
  - Conditional injection only for Stage 1 users

- **Enhancement #1: Daily Signal Check**
  - `record_signal_check` and `get_signal_trends` tool integration
  - Day-specific prompt scripts (Days 1-2, 3+, 7+)
  - Auto-triggered after both daily practices completed

- **Enhancement #2: Science Drip Library**
  - 14 daily entries + 7 extended entries (Days 15-21+)
  - Topics: vagal tone, neuroplasticity, HRV, Default Mode Network, compound effects
  - One per day maximum, tracked for non-repetition
  - Journal logging via `log_journal_entry` with `entry_type: "science_drip"`

- **Enhancement #3: Micro-Decentering Moments**
  - Three scripted awareness interrupts: Day 5 (The Noticer), Day 10 (Language Shift), Day 13 (Adaptive)
  - Never escalate into full Decentering Protocol
  - Max one per conversation

- **Enhancement #4: Day 7 Mirror**
  - Subjective-then-objective mid-stage reflection
  - "What do YOU think changed?" before showing data
  - Three outcome branches based on user response

- **Enhancement #5: Unlock Anticipation**
  - 4 contextual teasers about Stage 2 capabilities
  - Gated by day count (Day 7+) and delivery tracking

- **Enhancement #6: Pattern Surfacing**
  - Days 4-5 trigger connecting baseline scores to lived experience
  - Three scenarios: Mirror users, Reflection users, Skip users
  - Interpretation map for baseline score patterns

- **Enhancement #7: Milestone Celebrations**
  - 8 celebration moments (first completion, 3/7/10-day streaks, first calm 4+, adherence thresholds)
  - `check_milestones` and `record_milestone` tool integration

- **Session Flow Rules**
  - Never stack 3+ enhancements per message
  - Adapt to user's energy and engagement level
  - Signal check always first, then one contextual enhancement

- **Journal Entry Logging**
  - `journal_entries` Supabase table for transformation records
  - Entry types: science_drip, milestone, signal_trend, micro_decentering, day7_mirror, pattern_surfacing, coach_guest

### Fixed
- **Post-Ritual Check-in Race Condition**
  - `triggerPostRitualCheckin` silently dropped when loading guard active
  - Replaced simple return with retry mechanism (3 attempts, 1-second delays)
  - Consistent delivery for all users regardless of async state

- **Resend API Syntax**
  - `reply_to` changed to `replyTo` to match Resend's camelCase API

- **Stage 1 Enhancement Code Activation**
  - Initial implementation accidentally commented out with "//" prefixes
  - Uncommented all functional code in both `ritual_completion` and `default` cases

### Added - Awareness Rep Script Library
- **11 Script Variations Across 3 Progressive Tiers**
  - Tier 1 Foundation (Stages 1-2): 4 scripts with different sensory entry points
  - Tier 2 Recognition (Stages 3-5): 4 scripts with explicit interpretation detection
  - Tier 3 Integration (Stage 6+): 3 scripts with minimal instruction and extended silence
  - Stress-compatible and movement variants included
  - Full compliance audit against System Intent and non-negotiable checklist
  - Corrected 13 issues: calm-seeking language, identity reinforcement, possessive language, witness-entity creation
  - Implementation guidance for rotation logic, tier promotion, and audio production

---

## [0.37.0] - 2026-02-24

### Fixed - Flow Block System Overhaul
- **Commitment Detection Premature Firing**
  - System attempting data extraction on first user response ("ready")
  - Added minimum conversation length guard before extraction triggers
  - Relaxed overly strict commitment detection patterns

- **Sprint Renewal System**
  - Removed artificial day cap in `useUserProgress.ts` that blocked evolution flow
  - Sprint renewal now triggers naturally at day 21+

- **Flow Block API Model Switch**
  - Changed from default model to Claude Opus at 0.1 temperature
  - Better instruction adherence for structured installer flow
  - Added detailed compliance examples to system prompt

- **Mirror Onboarding Failures**
  - Column name mismatches between API routes and `pattern_profiles` table
  - Silent failures during both skip and guided reflection flows
  - Fixed column names to match Supabase schema

- **Weekly Check-in / IOS Cue Conflicts**
  - UI state conflicts between weekly check-ins and IOS Cue confirmations
  - Resolved competing state handlers

### Added
- **BreathPacer Component**
  - Custom expanding/contracting circle animation for Worry Loop Dissolver
  - 4-second inhale / 6-second exhale timing
  - 2-minute countdown timer
  - Smooth CSS transitions

### Fixed - Mobile Layout
- **Ritual Modal Button Clipping**
  - Action buttons clipped by browser chrome on mobile
  - Switched from `100vh` to `100dvh` (dynamic viewport height)
  - Adjusted padding strategies for mobile Safari/Chrome

---

## [0.36.0] - 2026-02-23

### Fixed - CI/CD Pipeline Recovery
- **Vercel × GitHub Integration Broken**
  - GitHub webhooks returning 404 errors
  - Root cause: `vercel.json` with hourly cron (`0 * * * *`) violated Hobby plan limits
  - All subsequent deployments silently rejected

- **Resolution**
  - Upgraded Vercel account to Pro (enabling hourly crons)
  - Fixed TypeScript errors in `app/api/cron/notifications/route.ts`
  - Changed `ReturnType<typeof createClient>` parameters to `any` (5 instances)
  - Added `.npmrc` with `legacy-peer-deps=true` for ESLint 8/9 conflict
  - Used GitHub Codespaces + Vercel CLI as deployment workaround
  - Cleaned up duplicate deploy hooks causing double deployments

- **Notification Cron System Restored**
  - Hourly cron job back online: `0 * * * *`
  - Morning reminders (7am local), missed day nudges (10am local)
  - 3-day absence notifications, Sunday weekly summaries (6pm local)
  - Timezone-aware notification delivery
  - Email templates via Resend: `morningReminder`, `missedDay`, `threeDayAbsence`, `weeklySummary`
  - `notification_log` table for deduplication
  - `notification_preferences` table with unsubscribe support

---

## [0.35.0] - 2026-02-22

### Changed - Mobile UI Redesign
- **Floating Button Repositioning**
  - Rituals button was covering send button and blending into chat (amber on amber)
  - Dashboard button covering content behind it

- **New Mobile Button Layout**
  - Both buttons positioned as matching white pills at top of screen (`top-14`)
  - Dashboard pill with hamburger icon on the left
  - Rituals pill with lightning bolt icon on the right
  - White backgrounds with amber accents for visibility against dark chat
  - Explicit text labels (not icons alone)
  - Positioned below existing header to avoid overlap

---

## [0.34.0] - 2026-02-20

### Fixed - Supabase Security Audit
- **16 ERROR-Level Issues Resolved**
  - 3 `auth_users_exposed` views: Revoked anonymous access to `auth.users`
  - 13 `security_definer_view` issues: Recreated views with `security_invoker = true`

- **Admin Views Decoupled from auth.users**
  - Added `email` column to `user_profiles` table
  - Backfilled emails from `auth.users`
  - Created trigger for automatic email sync on new signups
  - Rewrote `admin_user_details` and `admin_user_alerts` views to eliminate `auth.users` dependencies

- **Overly Permissive RLS Policies Tightened**
  - `storage` table: Replaced allow-all with user-scoped policies
  - `user_data` table: Replaced allow-all with `user_id = auth.uid()` restrictions
  - Confirmed both tables contained active data before policy changes

---

## [0.33.0] - 2026-02-19

### Changed - Philosophical Alignment Audit
- **Comprehensive Tool Ecosystem Audit**
  - Cross-referenced 15 tools against CODEX, Unbecoming Protocols, and sub-protocol instructions
  - Assessed philosophical alignment, functional role, stage placement, naming consistency

- **Morning Micro-Action → IOS Cue Renaming (Full Implementation)**
  - `stages.ts`: Stage 3 renamed from "Aligned Action Mode" to "Cue Training"
  - All practice entries updated: name → "IOS Cue", shortName → "Cue", description → "RAS detection training"
  - `ChatInterface.tsx`: 10 logical edits (~18 string replacements)
    - Practice name maps, error messages, evolution context, trigger patterns, button text, status bar text
    - Sprint fallback strings updated from "coherence statement" to "current cue"
  - Evolution flow updated to use cue decision tree: Interpretation / Effort / Attention Collapse
  - Trigger patterns expanded: 'ios cue', 'set up cue', 'setup cue', 'start cue', 'run cue', 'cue training'

- **Reframe Protocol → Interpretation Audit**
  - Identified naming discrepancy between app ("Reframe") and CODEX ("Interpretation Audit")
  - Name change planned to align with recognition-based philosophy

- **Thought Hygiene → MOS Dump**
  - Renamed to align with Nicholas's book methodology for high performers

- **Tool Framing in ToolsSidebar**
  - Added "Tools don't fix states. They restore clarity when interpretation is distorting signal." under On-Demand Tools
  - Applied to both desktop and mobile versions

### Added
- **Signal Reset Micro-Tool**
  - Planned as both sidebar option and AI-triggered tool

- **Worry Loop Dissolver Analysis**
  - Placement reviewed within system architecture

---

## [0.32.0] - 2026-02-12

### Changed - Opening Message Overhaul
- **First-Time Opening Message Rewrite**
  - Removed API call for dynamic interpretation (caused inconsistency)
  - Added comprehensive IOS context: what it is, 7-stage system, competence-based unlocking
  - Explains Stage 1 Neural Priming purpose and science
  - Sets expectations for AI coach communication style
  - References toolbar interface

- **New Day Morning Message Enhancement**
  - Changed from generic greeting to "Day X of building your operating system"
  - Reinforces progress and continuity
  - Updated `getNewDayMorningMessage` function (lines 402-430)

- **Same Day Return Message**
  - Minor personality tweaks for returning users

---

## [0.31.0] - 2026-02-06

### Added - Referral Tracking & Slack Notifications
- **Slack Enrollment Notifications**
  - Webhook system using Supabase database triggers
  - Next.js API route for Slack integration
  - Real-time notification on new user signups

- **Referral Source Tagging**
  - `referral_source` column added to `user_profiles`
  - UTM parameter capture from signup URLs (`?ref=awaken5`)
  - Database trigger syncing user metadata to profiles on `auth.users` update
  - Fixed timing issues with email confirmation and RLS policies

- **Admin Dashboard Referral Integration**
  - Referral source visible in user management
  - "AW5" badges to distinguish Awaken with 5 referrals from organic signups
  - Updated stage progression funnel to clarify current distribution vs historical progression

### Added - Admin Dashboard Enhancements (v2)
- **Needs Attention Alert System**
  - At-risk: no practice for 3+ days or 20%+ adherence drop
  - Stalling: 30+ days in stage below unlock threshold
  - Ready to unlock: meeting advancement criteria
  - Color-coded alert cards with user details
  - `healthy` alert type added to TypeScript union

- **Practice Completion Heatmap**
  - Visual grid showing completion rates by practice type over last 7 days
  - Identifies which specific practices users skip most

- **Cohort Comparison**
  - "Awaken with 5" referrals vs organic signup metrics
  - Average adherence, stage progression, churn rates by cohort

- **Weekly Trend Sparklines**
  - User adherence trajectories over time
  - Visual trend indicators in user list

- **New Database Views**
  - `admin_user_alerts` - At-risk user detection
  - `admin_practice_heatmap` - Practice completion grid
  - `admin_cohort_metrics` - Referral source comparison
  - `admin_weekly_trends` - Adherence trend data
  - Updated `get_admin_dashboard_data()` RPC function

---

## [0.30.0] - 2026-01-29

### Added - Re-engagement System
- **Conversational Re-engagement Flow**
  - Purely conversational approach (Option A) - removed all re-engagement buttons
  - Handles users returning after multiple days away
  - Keyword lockout during re-engagement to prevent practice name triggers
  - ChatInterface.tsx reduced from 4868 to 4664 lines

- **Route.ts Re-engagement Protection**
  - Practice names blocked from triggering setup flows during re-engagement
  - Clear examples of correct vs incorrect responses in system prompt

### Fixed - Intervention Button State Management
- **Phase-Aware Intervention Handling**
  - Regression intervention buttons persisting after user selection
  - Added `phase` property to intervention state ('initial', 'exploring', 'complete')
  - Button rendering conditional on current phase
  - Applied to regression, missed days, and system recovery interventions

- **Weekly Check-in Data Sync**
  - Scores saved to `weekly_checkins` but UI reading from `weekly_deltas`
  - Updated `saveWeeklyCheckIn` to upsert into both tables
  - Fixed column names: `week_of` instead of `week_start_date`
  - Added `unique` constraints for proper upsert behavior
  - `useUserProgress` hook now queries correct columns

### Fixed - Build Errors
- **ChatInterface.tsx Syntax Error**
  - "Return statement is not allowed here" at line 3865
  - Orphaned code block: `if (isAffirmative)` closed properly but subsequent `try` block lacked `else` wrapper
  - Fixed by changing `}` to `} else {` with additional closing brace

---

## [0.29.5] - 2026-01-26

### Added - Course Library Integration
- **Science of Neural Liberation Course System**
  - `/lib/courseIntegration.ts` - Complete course structure (4 modules)
  - Stage-gating: Stage 1 = Module 1 only, Stage 2+ = all modules
  - Helper functions for content access control

- **AI Coach Video Suggestions (Layer 2)**
  - `[[VIDEO_SUGGESTION:module:tutorial:reason]]` markup format
  - `VideoSuggestionCard.tsx` - Clickable cards parsed from AI responses
  - Both coaches (Nic and Fehren) can suggest contextual tutorials
  - Trigger maps for conversation-to-tutorial matching
  - Progress tracking with source attribution

- **Coach Knowledge Integration (Layer 3)**
  - Course concepts embedded in `coachPrompts.ts` for both coaches
  - Coaches reference tutorial content naturally in conversations

- **In-Chat Video Playback**
  - VideoModal opens directly within chat interface (not navigation away)
  - Maintains conversation flow during video viewing
  - Fetches tutorial data from Supabase on click

### Added - Flow Block Dashboard Widget
- **Desktop Sidebar Schedule Display**
  - `DashboardSidebar.tsx` - Weekly task schedule with time slots
  - TypeScript interfaces for `WeeklyMapEntry` with `timeSlot` support
  - Custom tooltip showing full task details on hover
  - Today's block highlighted

- **Mobile Dashboard Schedule**
  - `MobileDashboard.tsx` - Tap-to-expand interaction pattern
  - Smooth expand/collapse animations
  - Touch-friendly row interactions

- **Timezone-Safe Sprint Day Counter**
  - Fixed "Day 2/21" showing instead of "Day 1/21"
  - `getSprintDayNumber` function with local timezone handling

---

## [0.29.4] - 2026-01-22

### Changed - Flow Block System v3.0
- **Complete Protocol Implementation**
  - Four-phase structure: Discovery & Strategy, Planning, Execution Support, Pattern Analysis
  - "Rule of 3's": top 3 domains, 3G balance (Goal/Growth/Gratitude), 5 blocks/week
  - 30-second primer explaining 3 Types and 3G hierarchy before domain selection
  - Sequential questioning (one domain at a time with wait periods)
  - Flow Menu built as distinct output before Weekly Map
  - Explicit 3G balance auditing
  - Concentrated vs distributed decision-making with signal detection
  - Setup questions asked individually
  - Pattern Analyst framework for ongoing support

- **Flow Block API Fixes**
  - Task Clarity Check added after each task acknowledgment
  - Domain-Time Intelligence: flags relational blocks during work hours
  - Calendar Scheduling restored as standard flow element
  - System prompt isolation from security/cue kernel wrappers
  - Lower temperature (0.1) for deterministic behavior
  - Fixed system message handling in route.ts (messages included system prompt but route filtered it out)

- **Extraction System Fixes**
  - `flowBlockExtractionSystemPrompt` constant created and properly exported
  - Extraction contexts forced to use designated system prompts regardless of message array
  - `flow_block_sprints` table: added `created_at` and `updated_at` columns

### Changed - Micro-Action → IOS Cue Evolution
- **microActionAPI v4.0-v4.2**
  - Evolved from identity-model ("I am someone who...") to cue kernel ("Notice → Label → Release")
  - Context-first rule: explanations before questions
  - Selection-based action design (concrete options vs open-ended)
  - Removed redundant verification phases
  - Embodied validation at key moments
  - Execution cue creation and storage
  - `execution_cue` field added to `identity_sprints` table

- **Extraction Chain Debugging**
  - Commitment detection not triggering extraction
  - `isActive` flag not resetting after completion (UI stuck in setup mode)
  - Route.ts filtering out system messages for extraction contexts
  - Fixed: extraction contexts now always receive designated system prompts

### Fixed - Database & Query Issues
- **406 "Not Acceptable" Errors**
  - `.single()` calls failing when no active sprint existed
  - Replaced with `.limit(1)` + array destructuring pattern
  - Applied to both `identity_sprints` and `flow_block_sprints` queries in `useUserProgress.ts` and `sprintDatabase.ts`

- **Flow Block State Inversion**
  - `hasFlowBlockConfig: !flowBlockSprint` → `hasFlowBlockConfig: !!flowBlockSprint`
  - Sidebar now correctly shows sprint status

- **RLS Policy Fixes**
  - Missing policies on `identity_sprints` table
  - Table name mismatch: code queried `flow_block_config` but table was `flow_block_sprints`
  - Stub functions in ChatInterface.tsx overriding actual database operations
  - Dropped and recreated RLS policies for `identity_sprints`

### Changed - UX Improvements
- **Practice Button Styling**
  - Aligned Action and Flow Block buttons changed from green to amber
  - "Complete Block" text changed to "Mark Done"
  - Consistent with other practice buttons
  - Updated in both `ToolsSidebar.tsx` and `FloatingActionButton.tsx`

- **UI Language Updates**
  - "Start Identity Installation" → "Set Up Morning Coherence"
  - "Setting up your identity" → "Setting up coherence practice"
  - Practice title "Morning Micro-Action" updated across stages configuration

---

## [0.29.3] - 2026-01-20

### Added - Mirror Alternative Pathways
- **Guided Reflection Questionnaire**
  - 7 targeted questions surfacing behavioral patterns
  - Covers: stress responses, attention patterns, relational dynamics
  - Database migrations, API routes, React components
  - Questions audited against kernel philosophy (recognition over improvement)
  - Revised to eliminate self-improvement language and archaeological digging

- **Skip Option for Mirror**
  - Defers Mirror until after Stage 1 completion
  - Database flag for skip tracking
  - Re-offer logic after sufficient conversation history

### Changed
- **PaywallModal Enhancement**
  - Added "Want to learn more? See full details →" link to footer
  - Bridges in-app modal to standalone /upgrade page

- **Upgrade Page Image Quality**
  - Coach images doubled from 128px to 256px for retina displays
  - Added `quality={100}` to Next.js Image components
  - Recommended AVIF format over WebP for superior compression

- **Copy Alignment with Kernel Philosophy**
  - "Become who you're meant to be through daily micro-proof" reframed
  - New: Focus on dissolving false identities and recognizing authentic self

---

## [0.29.2] - 2026-01-19

### Added - Reorientation System (Continued)
- **Tool Framing in Sidebar**
  - "Tools don't fix states. They restore clarity when interpretation is distorting signal."
  - Added under On-Demand Tools heading in ToolsSidebar
  - Desktop and mobile versions updated

- **Mirror Exercise Concerns Identified**
  - Users without substantial ChatGPT history receive less relevant analysis
  - Proposed disclaimer for 50+ conversation minimum
  - Alternative pathways designed (guided reflection + skip option)

### Fixed
- **ToolsSidebar Map Syntax Error**
  - Arrow function using parentheses instead of curly braces when declaring variables
  - Caused deployment failure

---

## [0.29.0] - 2026-01-19

### Added - Reorientation System
- **Reorientation Modal Triggers**
  - Day 7 checkpoint: "One week in. The practices aren't about 'doing it right.' They're about noticing what happens when you show up consistently."
  - Day 21 checkpoint: "Neural pathways don't respond to motivation — they respond to repetition."
  - Missed week (7+ days away): "You've been away. That's data, not failure."
  - Pre-Stage 4 unlock: "Flow Blocks don't train productivity — they train the capacity to hold focus without force."

- **New Files Created**
  - `/lib/reorientationTriggers.ts` - Trigger detection + database operations
  - `/components/ReorientationModal.tsx` - Modal component with hook

- **Database Updates**
  - `user_progress.onboarding_started_at` - Timestamp when baseline completes
  - `user_progress.last_ritual_completed_at` - Auto-updated via database trigger
  - `user_progress.reorientation_day7_seen` - Flag for day 7 checkpoint
  - `user_progress.reorientation_day21_seen` - Flag for day 21 checkpoint
  - `user_progress.reorientation_missedweek_seen` - Flag for missed week (resets on return)
  - `user_progress.reorientation_stage4_seen` - Flag for Stage 4 preface
  - Database trigger `on_practice_logged` auto-updates `last_ritual_completed_at`

- **AI Response Protocol**
  - AI only explains reorientation messages if user explicitly asks
  - No proactive mentions of the modal system
  - Brief responses (1-2 sentences) then return to current task

### Added - Capacity Signals Telemetry
- **Tool Sessions Database Table**
  - `tool_sessions` table for tracking tool usage
  - Stores "what happened" not "success/fail"
  - Columns: `clarity_rating`, `was_signal_named`, `was_interpretation_identified`, `action_selected`, `sessions_today`

- **Updated All Tool Modals**
  - `ReframeModal.tsx` - Capacity signals in session data
  - `ThoughtHygieneModal.tsx` - Capacity signals in session data
  - `DecenteringModal.tsx` - Capacity signals in session data
  - `LoopDeLoopingModal.tsx` - Capacity signals in session data
  - `MetaReflectionModal.tsx` - Capacity signals in session data

### Added - Stage 7 & Media Assets
- **Stage 7 Application Form UI**
  - Application form for Stage 7 qualification
  - Manual unlock gate preserved

- **Media Assets Completed**
  - Awareness Rep audio file (3 mins) - integrated
  - Somatic Flow video - integrated

### Fixed
- **useUserProgress Hook Column Names**
  - Fixed `delta_awareness` → `awareness_delta`
  - Fixed `awareness_deltas` → `awareness_delta` (typo)
  - Fixed `++` → `+` operator in average calculation

---

## [0.28.0] - 2026-01-18

### Added - AI Frustration Detection & Attribution Drift Prevention
- **Frustration Detection System**
  - `/lib/frustrationDetection.ts` - Detects user frustration patterns
  - Patterns detected: "isn't working", "not helping", "feel worse", "nothing changed", "waste of time"
  - Tool-aware attribution reset injections

- **Context Injections in `/api/chat/route.ts`**
  - `detectAttributionDrift()` function checks user messages
  - `getAttributionResetInjection()` returns tool-aware context
  - Enforces Signal → Interpretation → Action framework
  - No motivational padding, no outcome promises

- **Outcome Framing Constraints**
  - Added to `SECURITY_INSTRUCTIONS` block
  - AI cannot promise "this will fix" or "this will help"
  - Must use capacity-building language: "this trains" vs "this will fix"
  - Tools restore clarity — they don't "fix" states

### Added - Tool Framing System
- **Universal Tool Framing**
  - `/lib/toolFraming.ts` - Shared framing constants
  - `toolUniversalFrame`: "Tools don't fix states. They restore clarity when interpretation is distorting signal."
  - `lowResultFrame`: Shown when rating ≤2 or 3+ sessions in one day

- **Updated Tool Modals (firstTimeMessage only)**
  - ReframeModal - Universal frame added
  - ThoughtHygieneModal - Universal frame added
  - DecenteringModal - Universal frame added
  - LoopDeLoopingModal - Universal frame added
  - MetaReflectionModal - Universal frame added

---

## [0.27.0] - 2026-01-17

### Added - Stage Attribution System
- **Stage Attribution Copy**
  - `/lib/attributioncopy.ts` - Stage unlock copy for all 6 stages
  - `unlockTitle`: Stage unlock modal header
  - `unlockBody`: Stage unlock explanation
  - `ritualMicrocopy`: One-line header in ritual modals

- **Stage Attribution Modal**
  - `/components/StageAttributionModal.tsx` - Show-once unlock celebration
  - Imports from `lib/attributioncopy.ts`
  - Amber accent (#ff9e19) styling
  - "Continue →" button marks as seen

- **Database Updates**
  - `user_progress.stage_1_attribution_seen` through `stage_6_attribution_seen`
  - Flags prevent modal from showing again after first view

- **Integration with ChatInterface**
  - `showAttributionModal` state
  - `attributionStage` state
  - Modified `handleUnlockConfirmation` to show modal first
  - `handleAttributionContinue` function for post-modal flow

### Changed
- **useUserProgress Hook**
  - Added stage attribution "seen" flags to UserProgress interface
  - Returns all 6 `stage_X_attribution_seen` booleans

---

## [0.26.0] - 2026-01-07

### Added - Admin Dashboard
- **Admin Route Structure**
  - `/app/admin/layout.tsx` - Admin auth gate with email whitelist
  - `/app/admin/page.tsx` - Main dashboard with metrics
  - `/app/admin/users/page.tsx` - User list with detail modals
  - `/app/api/admin/metrics/route.ts` - Protected API endpoint

- **Dashboard Metrics**
  - Total users, paid users, free users, conversion rate
  - Stage distribution bar chart with percentages
  - Conversion funnel (stage-to-stage progression rates)
  - Activity breakdown (active 7d, 30d, churned 14d+)
  - Revenue metrics (active subs, monthly, annual, trials)
  - Daily signup trends (last 30 days)
  - Recent users table

- **User Management**
  - Search by name or email
  - Filter by stage or subscription status
  - Sortable columns
  - User detail modal with:
    - Quick stats (stage, adherence, streak, REwired)
    - Subscription status
    - Baseline assessment scores
    - Recent practices
    - Timeline (joined, stage started, last active)

- **Database Views**
  - `admin_stage_distribution`
  - `admin_subscription_overview`
  - `admin_activity_metrics`
  - `admin_funnel_metrics`
  - `admin_user_details`
  - `admin_daily_signups`
  - `admin_revenue_metrics`
  - `get_admin_dashboard_data()` function

- **Access Control**
  - Email whitelist: `ADMIN_EMAILS` array
  - Only authenticated users with whitelisted emails can access
  - Uses `SUPABASE_SERVICE_ROLE_KEY` to bypass RLS for admin queries

---

## [0.25.0] - 2025-12-27

### Added - AI Coaching Limitations for Free Users
- **Stage 1 Free Access Confirmation**
  - Stage 1 completely free (baseline + HRVB + Awareness Rep + Decentering)
  - "Coach with Nic" and "Coach with Fehren" links visible but gated

- **Coaching Access Gate Options**
  - Option A: Simple modal message (implemented)
  - Option B: Limited taste (3-5 free messages) considered

---

## [0.24.0] - 2025-12-25

### Added - Paywall & Subscription System
- **Stripe Integration**
  - `/lib/stripe.ts` - Server-side Stripe client
  - `/lib/stripe-client.ts` - Client-side Stripe loader
  - `/app/api/stripe/create-checkout/route.ts` - Creates checkout sessions
  - `/app/api/stripe/webhook/route.ts` - Handles Stripe events
  - `/app/api/stripe/portal/route.ts` - Customer billing portal

- **Subscription Management**
  - `/hooks/useSubscription.ts` - React hook for subscription state
  - `subscriptions` table in database
  - Real-time subscription status sync via webhooks

- **Paywall Modal**
  - `/components/PaywallModal.tsx` - Upgrade modal with plan selection
  - Matches design system (#ff9e19 accent)
  - Two tracks: IOS Installer / Installer + Coaching

- **Pricing Structure**
  - IOS Installer: $447 (3mo) / $597 (6mo) / $697 (annual)
  - Installer + Coaching: $1,038 (3mo) / $1,397 (6mo) / $1,797 (annual)

- **Integration with ChatInterface**
  - Paywall intercepts Stage 2+ unlock for non-subscribers
  - Post-payment success handler (`?upgrade=success`)
  - Refetch subscription → retry pending unlock

### Changed
- **Stage Unlock Flow**
  - `handleUnlockConfirmation` checks `hasActiveSubscription`
  - Stage 1 = Free, Stage 2+ = Requires subscription

---

## [0.23.0] - 2025-12-17

### Added - Personalized AI Coaching Modals
- **Coach with Nic (Mind & Nervous System)**
  - Distinct personality profile extracted from conversation analysis
  - Direct opener style, contrarian positioning
  - Nervous system as the lever
  - Body-first inquiry ("Where do you feel this?")
  - Signature phrases: "Let's slow this down", "That's a story. What's the sensation?"

- **Coach with Fehren (Heart & Body)**
  - Distinct personality profile extracted from conversation analysis
  - Heart-centered approach
  - Somatic awareness focus
  - Complementary to Nic's cognitive approach

- **Coach Profile Template Structure**
  - Core Identity (background, mission, relationship)
  - Coaching Philosophy (beliefs, theory, view of user)
  - Voice & Personality (patterns, phrases, humor, tone)
  - Methodology (frameworks, questions, interventions)
  - Sample Responses (10-15+ scenarios)
  - Signature Content (stories, metaphors, quotes)
  - Boundaries (never say, never do)
  - Memory & Continuity (track, reference, build)
  - Conversation Flow (open, transition, close)
  - Handoffs (when to suggest other coach)

- **New Files**
  - `/lib/coachPrompts.ts` - Coach system prompts
  - `/components/CoachModal.tsx` - Coaching chat interface
  - Coach conversation storage with memory

- **Database Updates**
  - `coach_conversations` table for persistent history
  - Coach-specific memory storage

---

## [0.22.0] - 2025-12-12

### Added - Comprehensive Security Implementation
- **Authentication Enforcement**
  - All API routes require authenticated user
  - `verifyAuth()` helper function
  - 401 Unauthorized for unauthenticated requests

- **Rate Limiting**
  - `/lib/security/rateLimit.ts` - Rate limit implementation
  - Chat: 30 requests/min, 5-minute block
  - Practice: 60 requests/min, 2-minute block
  - Progress: 30 requests/min, 2-minute block

- **Input Sanitization & Prompt Injection Protection**
  - `/lib/security/inputSanitization.ts` - Injection pattern detection
  - Blocks: "ignore previous instructions", "what is your system prompt", etc.
  - Safe error responses for blocked requests

- **Row Level Security (RLS) Policies**
  - All tables protected: `user_progress`, `practice_logs`, `weekly_deltas`, etc.
  - `resistance_events` table secured (was unrestricted)
  - Users can only access their own data

- **Anti-Extraction Instructions**
  - `SECURITY_INSTRUCTIONS` block in chat route
  - Prevents system prompt extraction
  - Redirects meta-questions back to user goals

- **Audit Logging**
  - `logAuditEvent()` function
  - Tracks: rate limit hits, injection attempts, auth failures
  - Database persistence for security review

### Changed
- **API Routes Updated**
  - `/api/chat/route.ts` - Full security implementation
  - `/api/practices/log/route.js` - Auth + rate limit
  - `/api/progress/calculate/route.js` - Auth + rate limit
  - `/api/chat/coaching/route.ts` - Secured
  - `/api/chat/insight/route.js` - Secured

### Fixed
- **Critical Security Issues**
  - Chat API had NO authentication
  - Progress API accepted spoofable userId
  - Practice log accepted userId from body
  - No prompt injection protection
  - No rate limiting

---

## [0.21.0] - 2025-12-11

### Added - Unlock Eligibility Auto-Checker Improvements
- **Competence Threshold Logic**
  - Average domain score ≥4.0 can bypass delta requirement
  - Prevents users at high competence from being blocked by low deltas
  - Hybrid approach: either delta improvement OR high competence

### Fixed
- **Unlock Eligibility Checker**
  - Fixed edge case where high-performing users couldn't unlock
  - Corrected delta calculation for users already near ceiling

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

- **Unlock Eligibility Auto-Checker** (`useUserProgress.ts`)
  - `UNLOCK_THRESHOLDS` configuration for stages 1-6
  - `checkBasicUnlockEligibility()` function with hybrid approach
  - Checks: adherence ≥ threshold, days in stage ≥ threshold, delta OR competence met, qualitative rating met
  - `unlockProgress` object for UI visualization of individual criteria
  - Competence threshold (4.0) allows advanced users to progress without large deltas

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
  2. **Informed Consent & Assumption of Risk** - Detailed separate document
  3. **Medical/Psychiatric Screening Questionnaire** - Auto-exclusion logic
  4. **Stage 7 Addendum** - Separate agreement for advanced practices
  5. **Privacy Policy** - GDPR/Canadian PIPEDA compliant
  6. **In-System Crisis Protocols** - AI display requirements

- **Safety screening criteria and eligibility requirements**
- **Legal protection strategy**

### Documentation
- **Comprehensive legal framework established**

### Changed
- **Risk management approach**

---

## [0.10.2] - 2025-11-10

### Added
- **Authentication system implementation (Phase 1A)**
- **Pages Router authentication structure**

### Changed
- **Assessment storage migration**

### Fixed
- **Supabase package dependencies**

---

## [0.10.1] - 2025-11-11

### Fixed
- **Critical build errors in Vercel deployment**
- **Email confirmation redirect issues**
- **Assessment navigation flow**
- **User routing after baseline completion**

### Added
- **Instructional banner for first-time users**

### Changed
- **IOSBaselineAssessment.jsx complete rewrite**

---

## [0.10.0] - 2025-11-10

### Added
- **Complete system-prompt.txt file** - Production-ready project instructions

---

## [0.9.0] - 2025-11-10

### Fixed
- **Orange accent color visibility issue** in assessment orchestrator

### Changed
- **Assessment orchestrator styling system**

---

## [0.8.0] - 2025-11-09

### Added
- **Minimalist dark theme** for assessment orchestrator

### Changed
- **Complete redesign** of assessment orchestrator from light theme to dark theme

---

## [0.7.0] - 2025-11-09

### Added
- **Assessment completion navigation**
- **GitHub documentation structure**

### Changed
- **Results screen UX improvement**

### Fixed
- **Data persistence reliability**

---

## [0.6.0] - 2025-11-08

### Added
- **Complete Breath Counting Task (BCT) component**

### Fixed
- **Supabase storage integration**
- **Storage mechanism correction**

### Changed
- **Storage architecture**

---

## [0.5.0] - 2025-11-08

### Added
- **Vercel deployment infrastructure**
- **Data persistence layer**

### Fixed
- **Build errors in Vercel deployment**

### Changed
- **Development workflow**

---

## [0.4.0] - 2025-11-08

### Added
- **Stage 3: Identity Mode implementation**
- **Comprehensive coaching voice guidelines**

### Changed
- **Stage 1 onboarding flow**
- **Stage 2 Somatic Flow details**

---

## [0.3.0] - 2025-11-07

### Added
- **BCT improvements**
- **Complete Stage 1-3 user flows**

### Fixed
- **Assessment orchestrator UX issues**

---

## [0.2.0] - 2025-11-06

### Added
- **Baseline diagnostic system (4 domains)**
- **REwired Index scoring system**
- **Assessment UX improvements**

### Changed
- **Assessment naming (rebranding)**

---

## [0.1.0] - 2025-11-06

### Added
- **Initial IOS System Installer architecture**
- **Sub-protocol instructions**
- **Competence-based unlock system**
- **Coach personality framework**
- **Underlying systems (Day 1+)**

### Documentation
- **Comprehensive project instructions**


## Development Notes

### Current Development Stage
- Assessment orchestrator: Complete and styled
- Stage 1: Fully implemented with practice tracking + Stage 1 Experience Layer (7 enhancements)
- Stage 2: Fully implemented with Somatic Flow modal + intro templates
- Stage 3: Fully implemented with IOS Cue (formerly Micro-Action) + Two-Stage Extraction + intro templates
- Stage 4: Fully implemented with Flow Block v3.0 + Two-Stage Extraction + intro templates
- Stage 5: Fully implemented with Co-Regulation modal + 5-day rotation + intro templates
- Stage 6: Fully implemented with Nightly Debrief modal + evening reminder + intro templates
- Stage 7: Templates complete, application form UI complete, pending qualification review system
- Template Library: **COMPLETE** - All stages 1-7 fully templated
- Unlock Eligibility Auto-Checker: **COMPLETE** - Hybrid approach with competence threshold
- Sprint Renewal: Complete for Identity and Flow Block sprints
- Chat interface: Integrated with baseline data + hybrid template system
- Supabase storage: Configured and functional
- Mobile responsive: Complete with drawer navigation + redesigned pill buttons
- **Security: COMPLETE** - Auth, rate limiting, input sanitization, RLS, Supabase linter audit
- **Paywall: COMPLETE** - Stripe integration, subscription management
- **Admin Dashboard: COMPLETE** - Team analytics, user management, alerts, heatmaps, cohort comparison
- **AI Coaching: COMPLETE** - Nic and Fehren coach modals with distinct personalities + course integration
- **Attribution System: COMPLETE** - Stage unlock modals, tool framing, frustration detection
- **Reorientation System: COMPLETE** - Day 7/21/missed week/Stage 4 triggers
- **Notification System: COMPLETE** - Hourly cron, timezone-aware emails (morning/missed/absence/weekly)
- **Clinical Assessments: COMPLETE** - PHQ-9, GAD-7, PSS-10, PWB-18 at 3 timepoints
- **Stage 1 Experience Layer: COMPLETE** - 7 enhancements (signal check, science drips, micro-decentering, Day 7 Mirror, unlock anticipation, pattern surfacing, milestones)
- **Referral Tracking: COMPLETE** - UTM capture, Slack notifications, cohort analytics

## Standing To-Do List

### Completed Development Tasks ✓

#### Core Platform
- [x] All stage templates (1-7)
- [x] Unlock auto-checker with competence threshold
- [x] Sprint Renewal (Continue/Evolve/Pivot)
- [x] Two-stage extraction for identity sprints
- [x] Two-stage extraction for flow block sprints
- [x] Mobile responsive with drawer navigation
- [x] Opening message overhaul (first-time, returning, new-day)

#### Stage 1 Experience Layer
- [x] Daily Signal Check with tool integration
- [x] Science Drip Library (14 entries + 7 extended)
- [x] Micro-Decentering Moments (Days 5, 10, 13)
- [x] Day 7 Mirror (subjective-then-objective reflection)
- [x] Unlock Anticipation teasers
- [x] Pattern Surfacing (Days 4-5)
- [x] Milestone Celebrations (8 moments)
- [x] Journal entry logging system

#### Philosophical Alignment
- [x] Morning Micro-Action → IOS Cue (full rename across codebase)
- [x] Stage 3 "Aligned Action Mode" → "Cue Training"
- [x] Tool framing: "Tools don't fix states. They restore clarity..."
- [x] Evolution flow updated to cue decision tree
- [x] Awareness Rep script library (11 scripts, 3 tiers)

#### Security & Infrastructure
- [x] Security audit implementation (v0.22.0)
- [x] Row Level Security (RLS) policies
- [x] API route protection and authentication
- [x] Input validation and sanitization
- [x] Rate limiting on sensitive endpoints
- [x] Audit logging for sensitive operations
- [x] Stripe integration and subscription management (v0.24.0)
- [x] Paywall implementation (v0.24.0)
- [x] Admin dashboard with team analytics (v0.26.0)
- [x] Supabase security linter audit - 16 ERRORs resolved (v0.34.0)
- [x] Admin views decoupled from auth.users
- [x] Overly permissive RLS policies tightened
- [x] Vercel Pro upgrade + hourly cron support
- [x] CI/CD pipeline recovery (GitHub ↔ Vercel)

#### Notification System
- [x] Hourly cron job (`0 * * * *`)
- [x] Morning reminders (7am local)
- [x] Missed day nudges (10am local)
- [x] 3-day absence notifications
- [x] Sunday weekly summaries (6pm local)
- [x] Email templates via Resend
- [x] Timezone-aware delivery
- [x] Unsubscribe support

#### Clinical Assessments
- [x] PHQ-9, GAD-7, PSS-10, PWB-18 integration
- [x] Three-timepoint administration
- [x] Assessment reminder banner
- [x] Coach prompting for assessments
- [x] Admin panel with CSV export

#### AI Coaching & Personalization
- [x] Coach with Nic modal (v0.23.0)
- [x] Coach with Fehren modal (v0.23.0)
- [x] Coach personality extraction from conversation data
- [x] Coach conversation memory and persistence
- [x] Course integration (Layer 2: video suggestions, Layer 3: embedded knowledge)
- [x] In-chat video playback (VideoModal)

#### Attribution & Engagement
- [x] Stage attribution copy and modals (v0.27.0)
- [x] Tool framing system (v0.28.0)
- [x] AI frustration detection (v0.28.0)
- [x] Attribution drift context injections (v0.28.0)
- [x] Outcome framing constraints (v0.28.0)
- [x] Reorientation system (v0.29.0)
- [x] Capacity signals telemetry (v0.29.0)
- [x] Referral source tracking + Slack notifications
- [x] Admin alerts (at-risk, stalling, ready-to-unlock)
- [x] Practice completion heatmap
- [x] Cohort comparison (AW5 vs organic)

#### Media Assets
- [x] Resonance Breathing video (www.unbecoming.app/breathe)
- [x] Awareness Rep audio file (3 mins)
- [x] Somatic Flow video
- [x] Co-Regulation audio (`/audio/Relational.mp3`)

### Pending Development Tasks

#### Naming/Alignment (In Progress)
- [ ] Reframe Protocol → Interpretation Audit (rename)
- [ ] Thought Hygiene → MOS Dump (rename)
- [ ] Signal Reset micro-tool implementation
- [ ] Decentering Practice elevation (on-demand → potential daily ritual)
- [ ] Worry Loop Dissolver placement finalization

#### Stage 7 Completion
- [x] Stage 7 application form UI - COMPLETE
- [ ] Stage 7 qualification review system

#### Edge Cases & Troubleshooting
- [x] System recovery from breaks (30+ days) - Reorientation system handles
- [ ] Build regression/reset protocols
- [ ] Manual override logic for stage changes
- [ ] `baseline_completed` flag fix (systemic - onboarding flow never sets it)
- [ ] `days_in_stage` auto-increment (never automatically updated)

#### Future Enhancements
- [ ] iOS native app conversion (Capacitor)
- [ ] Circle integration for community features
- [ ] "Science of Neural Liberation" course integration (4 modules, 16 tutorials) — Layer 1 (library page) complete, Layers 2-3 integrated
- [ ] Landing page for film viewers (`/begin` route)
- [ ] Stage 1 duration optimization (14 days vs shorter — pending beta data)

### Technical Stack
- **Frontend**: Next.js 16, React, Tailwind CSS
- **Backend**: Supabase
- **Deployment**: Vercel (Pro plan)
- **AI Integration**: Claude API (Opus for Flow Block setup, Sonnet for general chat)
- **Payments**: Stripe
- **Email**: Resend
- **Notifications**: Vercel Cron (hourly)
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
- **Mobile**: White pill buttons with amber accents at top-14

### Database Schema (Key Tables)
- `user_progress` - Stage, adherence, streaks, attribution flags, reorientation flags
- `user_profiles` - Name, email (synced from auth), referral_source
- `baseline_assessments` - Initial 4-domain scores, REwired Index
- `clinical_assessments` - PHQ-9, GAD-7, PSS-10, PWB-18 scores at 3 timepoints
- `practice_logs` - Daily ritual completion records (includes nightly_debrief notes)
- `weekly_deltas` - Weekly check-in scores and deltas
- `screening_responses` - Medical/psychiatric screening
- `legal_acceptances` - Terms and consent records
- `identity_sprints` - 21-day IOS Cue sprint tracking (includes execution_cue)
- `flow_block_sprints` - Flow Block sprint tracking (includes weekly_map with timeSlots)
- `subscriptions` - Stripe subscription tracking
- `tool_sessions` - On-demand tool usage and capacity signals
- `coach_conversations` - AI coaching conversation history
- `signal_checks` - Daily signal check data
- `journal_entries` - Science drips, milestones, micro-decentering, pattern surfacing logs
- `notification_preferences` - Email notification settings per user
- `notification_log` - Sent notification deduplication
- `pattern_profiles` - Mirror/guided reflection pattern data
- `admin_*` views - Dashboard analytics (decoupled from auth.users)

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
