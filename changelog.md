# IOS System Changelog

All notable changes to the Integrated Operating System (IOS) project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

### Added
- CHANGELOG.md file for tracking all system changes

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

#### Stage 4-7 Implementation
- [ ] Flow Block Integration mechanics
- [ ] Thought Hygiene implementation
- [ ] Intrapersonal Co-Regulation flow (Stage 5)
- [ ] Nightly Debrief system (Stage 6)
- [ ] Stage 7 application/qualification system

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
