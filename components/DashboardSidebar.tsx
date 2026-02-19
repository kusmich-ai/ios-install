// components/DashboardSidebar.tsx
// Extracted left sidebar from ChatInterface with luxury styling
// v2.1: Added Flow Block Schedule section with timeSlot support
'use client';

import Link from 'next/link';
import { 
  User,
  TrendingUp,
  TrendingDown,
  Zap,
  CheckCircle2,
  Lock,
  Sparkles,
  Target,
  BookOpen,
} from 'lucide-react';
import AwakenWithFiveCard from './AwakenWithFiveCard';

// ============================================
// TYPES
// ============================================

interface DomainScores {
  regulation: number;
  awareness: number;
  outlook: number;
  attention: number;
}

interface DomainDeltas {
  regulation?: number;
  awareness?: number;
  outlook?: number;
  attention?: number;
  average?: number;
}

interface UnlockProgress {
  adherenceMet: boolean;
  daysMet: boolean;
  deltaMet: boolean;
  qualitativeMet: boolean;
  requiredAdherence: number;
  requiredDays: number;
  requiredDelta: number;
}

// Flow Block types (matches flowBlockAPI.ts)
interface WeeklyMapEntry {
  day: string;
  domain: string;
  task: string;
  flowType: string;
  category: string;
  coherenceLink?: string;
  duration: number;
  timeSlot?: string;  // e.g., "9:00am", "7:00pm"
}

interface DashboardSidebarProps {
  // User info
  userName?: string;
  currentStage: number;
  
  // Baseline data
  baselineRewiredIndex: number;
  baselineDomainScores: DomainScores;
  
  // Current progress
  currentDomainScores?: DomainScores;
  domainDeltas?: DomainDeltas;
  unlockProgress?: UnlockProgress;
  unlockEligible?: boolean;
  adherencePercentage?: number;
  consecutiveDays?: number;
  
  // Aligned Action (Stage 3+) - with backwards compatibility
  coherenceStatement?: string;
  currentIdentity?: string;
  microAction?: string;
  sprintDay?: number;
  identitySprintDay?: number;
  
  // Flow Block (Stage 4+)
  flowBlockWeeklyMap?: WeeklyMapEntry[] | null;
  flowBlockSprintDay?: number;
  
  // Handlers
  onStage7Click?: () => void;
}

// ============================================
// HELPER FUNCTIONS
// ============================================

function getStageName(stage: number): string {
  const names: { [key: number]: string } = {
    1: 'Neural Priming',
    2: 'Embodied Awareness',
    3: 'Cue Training',
    4: 'Flow Mode',
    5: 'Relational Coherence',
    6: 'Integration',
    7: 'Accelerated Expansion'
  };
  return names[stage] || `Stage ${stage}`;
}

function getStatusTier(index: number): string {
  if (index <= 20) return 'System Offline';
  if (index <= 40) return 'Baseline Mode';
  if (index <= 60) return 'Operational';
  if (index <= 80) return 'Optimized';
  return 'Integrated';
}

function getStatusColor(index: number): string {
  if (index <= 20) return 'text-red-500';
  if (index <= 40) return 'text-amber-500';
  if (index <= 60) return 'text-blue-500';
  if (index <= 80) return 'text-emerald-500';
  return 'text-purple-500';
}

function getProgressBarColor(index: number): string {
  if (index <= 20) return 'bg-red-500';
  if (index <= 40) return 'bg-amber-500';
  if (index <= 60) return 'bg-blue-500';
  if (index <= 80) return 'bg-emerald-500';
  return 'bg-purple-500';
}

// Get abbreviated day name
function getShortDay(day: string): string {
  const shortNames: { [key: string]: string } = {
    'Monday': 'Mon',
    'Tuesday': 'Tue',
    'Wednesday': 'Wed',
    'Thursday': 'Thu',
    'Friday': 'Fri',
    'Saturday': 'Sat',
    'Sunday': 'Sun'
  };
  return shortNames[day] || day.slice(0, 3);
}

// Check if today matches the day
function isToday(day: string): boolean {
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const today = dayNames[new Date().getDay()];
  return day === today;
}

// Monochromatic amber shades for domains (luxury design)
const DOMAIN_COLORS = {
  regulation: { bar: 'bg-amber-600', text: 'text-amber-600' },
  awareness: { bar: 'bg-amber-500', text: 'text-amber-500' },
  outlook: { bar: 'bg-amber-400', text: 'text-amber-400' },
  attention: { bar: 'bg-amber-300', text: 'text-amber-500' },
};

// ============================================
// COMPONENT
// ============================================

export default function DashboardSidebar({
  userName,
  currentStage,
  baselineRewiredIndex,
  baselineDomainScores,
  currentDomainScores,
  domainDeltas,
  unlockProgress,
  unlockEligible,
  adherencePercentage = 0,
  consecutiveDays = 0,
  coherenceStatement,
  currentIdentity,
  microAction,
  sprintDay,
  identitySprintDay,
  flowBlockWeeklyMap,
  flowBlockSprintDay,
  onStage7Click,
}: DashboardSidebarProps) {
  
  // Use sprintDay with fallback to identitySprintDay for backwards compatibility
  const displaySprintDay = sprintDay ?? identitySprintDay;
  
  // Use coherenceStatement with fallback to currentIdentity for backwards compatibility
  const displayStatement = coherenceStatement ?? currentIdentity;
  
  // Calculate current REwired Index
  const currentReg = currentDomainScores?.regulation ?? baselineDomainScores.regulation;
  const currentAware = currentDomainScores?.awareness ?? baselineDomainScores.awareness;
  const currentOut = currentDomainScores?.outlook ?? baselineDomainScores.outlook;
  const currentAtt = currentDomainScores?.attention ?? baselineDomainScores.attention;
  const currentRewired = Math.round((currentReg + currentAware + currentOut + currentAtt) / 4 * 20);
  const rewiredDelta = currentRewired - baselineRewiredIndex;

  return (
    <aside className="hidden md:flex flex-col w-80 border-r border-black/5 bg-[#fafaf8] overflow-y-auto">
      <div className="p-5 space-y-4">
        
        {/* ==========================================
            USER INFO HEADER
            ========================================== */}
        <div className="border-b border-black/5 pb-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-100 to-amber-50 flex items-center justify-center">
              <User className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-zinc-800">
                {userName ? `Hey, ${userName}` : 'Welcome'}
              </h2>
              <p className="text-xs text-zinc-500">
                Stage {currentStage}: {getStageName(currentStage)}
              </p>
            </div>
          </div>
          
          <div className="flex flex-col gap-2 mt-2">
            <Link 
              href="/profile/patterns"
              className="inline-flex items-center gap-2 px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 rounded-lg text-xs font-medium transition-colors border border-amber-200/50"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Pattern Profile & Transformation Map
            </Link>
            <Link 
              href="/library"
              className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-xs font-medium transition-colors border border-blue-200/50"
            >
              <BookOpen className="w-3.5 h-3.5" />
              Course Library
            </Link>
          </div>
        </div>
        {/* ==========================================
            REWIRED INDEX
            ========================================== */}
        <div className="bg-white rounded-xl p-4 border border-black/[0.04] shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">REwired Index</span>
            <div className="flex items-center gap-2">
              <span className={`text-2xl font-bold ${getStatusColor(currentRewired)}`}>
                {currentRewired}
              </span>
              {rewiredDelta !== 0 && (
                <span className={`text-sm font-semibold flex items-center gap-0.5 ${rewiredDelta > 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                  {rewiredDelta > 0 ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                  {rewiredDelta > 0 ? '+' : ''}{rewiredDelta}
                </span>
              )}
            </div>
          </div>
          <div className="w-full rounded-full h-2 bg-black/[0.04] overflow-hidden">
            <div 
              className={`h-2 rounded-full transition-all duration-500 ${getProgressBarColor(currentRewired)}`}
              style={{ width: `${currentRewired}%` }}
            />
          </div>
          <p className="text-xs text-zinc-500 mt-2 font-medium">{getStatusTier(currentRewired)}</p>
        </div>

        {/* ==========================================
            DOMAIN SCORES
            ========================================== */}
        <div className="bg-white rounded-xl p-4 border border-black/[0.04] shadow-sm space-y-4">
          <h3 className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Domain Scores</h3>
          
          {/* Regulation */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-medium text-zinc-600">Regulation</span>
              <div className="flex items-center gap-2">
                <span className={`text-sm font-semibold ${DOMAIN_COLORS.regulation.text}`}>
                  {(currentDomainScores?.regulation ?? baselineDomainScores.regulation).toFixed(1)}/5
                </span>
                {domainDeltas?.regulation !== undefined && domainDeltas.regulation !== 0 && (
                  <span className={`text-xs font-medium flex items-center gap-0.5 ${domainDeltas.regulation > 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                    {domainDeltas.regulation > 0 ? '↑' : '↓'}{Math.abs(domainDeltas.regulation).toFixed(1)}
                  </span>
                )}
              </div>
            </div>
            <div className="w-full rounded-full h-1.5 bg-black/[0.04]">
              <div 
                className={`h-1.5 rounded-full ${DOMAIN_COLORS.regulation.bar} transition-all duration-500`}
                style={{ width: `${((currentDomainScores?.regulation ?? baselineDomainScores.regulation) / 5) * 100}%` }}
              />
            </div>
          </div>

          {/* Awareness */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-medium text-zinc-600">Awareness</span>
              <div className="flex items-center gap-2">
                <span className={`text-sm font-semibold ${DOMAIN_COLORS.awareness.text}`}>
                  {(currentDomainScores?.awareness ?? baselineDomainScores.awareness).toFixed(1)}/5
                </span>
                {domainDeltas?.awareness !== undefined && domainDeltas.awareness !== 0 && (
                  <span className={`text-xs font-medium flex items-center gap-0.5 ${domainDeltas.awareness > 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                    {domainDeltas.awareness > 0 ? '↑' : '↓'}{Math.abs(domainDeltas.awareness).toFixed(1)}
                  </span>
                )}
              </div>
            </div>
            <div className="w-full rounded-full h-1.5 bg-black/[0.04]">
              <div 
                className={`h-1.5 rounded-full ${DOMAIN_COLORS.awareness.bar} transition-all duration-500`}
                style={{ width: `${((currentDomainScores?.awareness ?? baselineDomainScores.awareness) / 5) * 100}%` }}
              />
            </div>
          </div>

          {/* Outlook */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-medium text-zinc-600">Outlook</span>
              <div className="flex items-center gap-2">
                <span className={`text-sm font-semibold ${DOMAIN_COLORS.outlook.text}`}>
                  {(currentDomainScores?.outlook ?? baselineDomainScores.outlook).toFixed(1)}/5
                </span>
                {domainDeltas?.outlook !== undefined && domainDeltas.outlook !== 0 && (
                  <span className={`text-xs font-medium flex items-center gap-0.5 ${domainDeltas.outlook > 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                    {domainDeltas.outlook > 0 ? '↑' : '↓'}{Math.abs(domainDeltas.outlook).toFixed(1)}
                  </span>
                )}
              </div>
            </div>
            <div className="w-full rounded-full h-1.5 bg-black/[0.04]">
              <div 
                className={`h-1.5 rounded-full ${DOMAIN_COLORS.outlook.bar} transition-all duration-500`}
                style={{ width: `${((currentDomainScores?.outlook ?? baselineDomainScores.outlook) / 5) * 100}%` }}
              />
            </div>
          </div>

          {/* Attention */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-medium text-zinc-600">Attention</span>
              <div className="flex items-center gap-2">
                <span className={`text-sm font-semibold ${DOMAIN_COLORS.attention.text}`}>
                  {(currentDomainScores?.attention ?? baselineDomainScores.attention).toFixed(1)}/5
                </span>
                {domainDeltas?.attention !== undefined && domainDeltas.attention !== 0 && (
                  <span className={`text-xs font-medium flex items-center gap-0.5 ${domainDeltas.attention > 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                    {domainDeltas.attention > 0 ? '↑' : '↓'}{Math.abs(domainDeltas.attention).toFixed(1)}
                  </span>
                )}
              </div>
            </div>
            <div className="w-full rounded-full h-1.5 bg-black/[0.04]">
              <div 
                className={`h-1.5 rounded-full ${DOMAIN_COLORS.attention.bar} transition-all duration-500`}
                style={{ width: `${((currentDomainScores?.attention ?? baselineDomainScores.attention) / 5) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* ==========================================
            UNLOCK PROGRESS
            ========================================== */}
        {unlockProgress && !unlockEligible && (
          <div className="bg-white rounded-xl p-4 border border-black/[0.04] shadow-sm">
            <h3 className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-3">
              Stage {currentStage + 1} Unlock Progress
            </h3>
            
            <div className="space-y-3">
              {/* Adherence Progress */}
              <div className="flex items-center gap-2">
                <span className={`text-xs w-16 font-medium ${unlockProgress.adherenceMet ? 'text-emerald-600' : 'text-zinc-500'}`}>
                  {unlockProgress.adherenceMet && <CheckCircle2 className="w-3 h-3 inline mr-1" />}
                  Adherence
                </span>
                <div className="flex-1 h-1.5 bg-black/[0.04] rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all rounded-full ${unlockProgress.adherenceMet ? 'bg-emerald-500' : 'bg-amber-500'}`}
                    style={{ width: unlockProgress.adherenceMet ? '100%' : `${Math.min(100, (adherencePercentage / unlockProgress.requiredAdherence) * 100)}%` }}
                  />
                </div>
                <span className="text-xs text-zinc-400 w-10 text-right font-medium">
                  {unlockProgress.adherenceMet ? '✓' : `${adherencePercentage}%`}
                </span>
              </div>
              
              {/* Days Progress */}
              <div className="flex items-center gap-2">
                <span className={`text-xs w-16 font-medium ${unlockProgress.daysMet ? 'text-emerald-600' : 'text-zinc-500'}`}>
                  {unlockProgress.daysMet && <CheckCircle2 className="w-3 h-3 inline mr-1" />}
                  Days
                </span>
                <div className="flex-1 h-1.5 bg-black/[0.04] rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all rounded-full ${unlockProgress.daysMet ? 'bg-emerald-500' : 'bg-amber-500'}`}
                    style={{ width: unlockProgress.daysMet ? '100%' : `${Math.min(100, (consecutiveDays / unlockProgress.requiredDays) * 100)}%` }}
                  />
                </div>
                <span className="text-xs text-zinc-400 w-10 text-right font-medium">
                  {unlockProgress.daysMet ? '✓' : `${consecutiveDays}/${unlockProgress.requiredDays}`}
                </span>
              </div>
              
              {/* Delta Progress */}
              <div className="flex items-center gap-2">
                <span className={`text-xs w-16 font-medium ${unlockProgress.deltaMet ? 'text-emerald-600' : 'text-zinc-500'}`}>
                  {unlockProgress.deltaMet && <CheckCircle2 className="w-3 h-3 inline mr-1" />}
                  Growth
                </span>
                <div className="flex-1 h-1.5 bg-black/[0.04] rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all rounded-full ${unlockProgress.deltaMet ? 'bg-emerald-500' : 'bg-amber-500'}`}
                    style={{ width: unlockProgress.deltaMet ? '100%' : `${Math.min(100, Math.max(0, ((domainDeltas?.average || 0) / unlockProgress.requiredDelta) * 100))}%` }}
                  />
                </div>
                <span className="text-xs text-zinc-400 w-10 text-right font-medium">
                  {unlockProgress.deltaMet ? '✓' : `+${(domainDeltas?.average || 0).toFixed(1)}`}
                </span>
              </div>
              
              {/* Weekly Check-in */}
              <div className="flex items-center gap-2">
                <span className={`text-xs w-16 font-medium ${unlockProgress.qualitativeMet ? 'text-emerald-600' : 'text-zinc-500'}`}>
                  {unlockProgress.qualitativeMet && <CheckCircle2 className="w-3 h-3 inline mr-1" />}
                  Check-in
                </span>
                <div className="flex-1 h-1.5 bg-black/[0.04] rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all rounded-full ${unlockProgress.qualitativeMet ? 'bg-emerald-500' : 'bg-zinc-300'}`}
                    style={{ width: unlockProgress.qualitativeMet ? '100%' : '0%' }}
                  />
                </div>
                <span className="text-xs text-zinc-400 w-10 text-right font-medium">
                  {unlockProgress.qualitativeMet ? '✓' : '—'}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* ==========================================
            STAGE 7 UNLOCK BUTTON
            ========================================== */}
        {currentStage === 6 && unlockEligible && onStage7Click && (
          <div className="bg-gradient-to-br from-purple-50 to-amber-50 border border-purple-200/50 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Lock className="w-4 h-4 text-purple-600" />
              <h3 className="text-sm font-semibold text-purple-800">Final Stage Available</h3>
            </div>
            <p className="text-xs text-zinc-600 mb-3">
              You've demonstrated mastery at Stage 6. Ready to explore what's beyond?
            </p>
            <button
              onClick={onStage7Click}
              className="w-full px-4 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-semibold rounded-xl transition-all shadow-sm shadow-amber-500/20"
            >
              Unlock Stage 7?
            </button>
          </div>
        )}

        {/* ==========================================
            MY ALIGNED ACTION (Stage 3+)
            ========================================== */}
        {displayStatement && (
          <div className="bg-white rounded-xl p-4 border border-black/[0.04] shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-4 h-4 text-amber-500" />
              <h3 className="text-xs font-medium text-zinc-500 uppercase tracking-wider">My IOS Cue</h3>
            </div>
            <p className="text-sm text-zinc-700 leading-relaxed">{displayStatement}</p>
            {microAction && (
              <p className="text-xs text-amber-600 font-medium mt-2">
                Daily practice: {microAction}
              </p>
            )}
            {displaySprintDay && (
              <div className="mt-3 flex items-center gap-2">
                <div className="flex-1 h-1 bg-black/[0.04] rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-amber-500 rounded-full transition-all"
                    style={{ width: `${(displaySprintDay / 21) * 100}%` }}
                  />
                </div>
                <span className="text-xs text-zinc-400 font-medium">
                  Day {displaySprintDay}/21
                </span>
              </div>
            )}
          </div>
        )}

        {/* ==========================================
            MY FLOW BLOCK SCHEDULE (Stage 4+)
            ========================================== */}
        {flowBlockWeeklyMap && flowBlockWeeklyMap.length > 0 && (
          <div className="bg-white rounded-xl p-4 border border-black/[0.04] shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <Target className="w-4 h-4 text-blue-500" />
              <h3 className="text-xs font-medium text-zinc-500 uppercase tracking-wider">My Flow Block Schedule</h3>
            </div>
            
            {/* Weekly Map Display */}
            <div className="space-y-2">
              {flowBlockWeeklyMap.map((entry, index) => {
                const isTodayBlock = isToday(entry.day);
                return (
                  <div 
                    key={index}
                    className={`group relative flex items-center gap-2 py-1.5 px-2 rounded-lg text-xs transition-colors ${
                      isTodayBlock 
                        ? 'bg-blue-50 border border-blue-200/50' 
                        : 'hover:bg-zinc-50'
                    }`}
                  >
                    {/* Day */}
                    <span className={`w-10 font-semibold ${isTodayBlock ? 'text-blue-600' : 'text-zinc-500'}`}>
                      {getShortDay(entry.day)}
                    </span>
                    
                    {/* Divider */}
                    <span className="text-zinc-300">|</span>
                    
                    {/* Task (truncated with instant tooltip) */}
                    <span className={`flex-1 truncate cursor-default ${isTodayBlock ? 'text-blue-700 font-medium' : 'text-zinc-600'}`}>
                      {entry.task}
                    </span>
                    
                    {/* Instant Tooltip - shows full task on hover */}
                    <div className="absolute left-0 right-0 -top-1 -translate-y-full opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150 z-50 pointer-events-none">
                      <div className="bg-zinc-900 text-white text-xs rounded-lg px-3 py-2 shadow-lg mx-2">
                        <div className="font-medium">{entry.task}</div>
                        <div className="text-zinc-400 mt-0.5">
                          {entry.domain} · {entry.flowType} · {entry.category}
                        </div>
                        {/* Tooltip arrow */}
                        <div className="absolute left-4 bottom-0 translate-y-full w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-zinc-900"></div>
                      </div>
                    </div>
                    
                    {/* Time and Duration */}
                    <span className={`text-xs whitespace-nowrap ${isTodayBlock ? 'text-blue-500' : 'text-zinc-400'}`}>
                      {entry.timeSlot ? `${entry.timeSlot} · ` : ''}{entry.duration}m
                    </span>
                  </div>
                );
              })}
            </div>
            
            {/* Sprint Progress */}
            {flowBlockSprintDay && (
              <div className="mt-3 pt-3 border-t border-black/[0.04] flex items-center gap-2">
                <div className="flex-1 h-1 bg-black/[0.04] rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-500 rounded-full transition-all"
                    style={{ width: `${(flowBlockSprintDay / 21) * 100}%` }}
                  />
                </div>
                <span className="text-xs text-zinc-400 font-medium">
                  Day {flowBlockSprintDay}/21
                </span>
              </div>
            )}
          </div>
        )}

        {/* ==========================================
            AWAKEN WITH 5 CTA
            ========================================== */}
        <AwakenWithFiveCard />
      </div>
    </aside>
  );
}
