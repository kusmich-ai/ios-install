// app/admin/page.tsx — ADMIN DASHBOARD V2
// Full metrics dashboard with survival curve, signal trends, enhancement tracking,
// time-to-unlock, tool usage, engagement depth, and baseline completion
'use client';

import { useEffect, useState, useCallback } from 'react';
import AdminClinicalPanel from '@/components/admin/AdminClinicalPanel'
import { 
  Users, TrendingUp, TrendingDown, DollarSign, Activity,
  RefreshCw, ChevronRight, AlertCircle, AlertTriangle,
  CheckCircle2, Clock, UserX, Zap, Minus, BarChart3,
  Brain, Target, BookOpen, MessageSquare, Layers,
  ArrowDown, ArrowUp, Mail, Send, X, Eye
} from 'lucide-react';

// ============================================
// TYPE DEFINITIONS
// ============================================
interface UserAlert {
  user_id: string;
  first_name: string;
  email: string;
  current_stage: number;
  adherence_percentage: number;
  consecutive_days: number;
  referral_source: string;
  days_since_practice: number;
  days_in_stage: number;
  adherence_7d: number;
  adherence_prior_7d: number;
  adherence_trend: number;
  alert_type: 'at_risk' | 'stalling' | 'ready_to_unlock' | 'healthy';
  alert_reason: string;
}

interface PracticeRow {
  practice_type: string;
  practice_date: string;
  total_logged: number;
  completed_count: number;
  completion_rate: number;
}

interface PracticeSummaryRow {
  practice_type: string;
  total_logged: number;
  total_completed: number;
  overall_rate: number;
  unique_users: number;
}

interface CohortRow {
  cohort: string;
  user_count: number;
  avg_adherence: number;
  avg_stage: number;
  avg_rewired: number;
  avg_streak: number;
  active_count: number;
  churned_count: number;
  engagement_rate: number;
}

interface UserTrendRow {
  user_id: string;
  week_start: string;
  completed: number;
  total: number;
  weekly_rate: number;
}

// NEW V2 types
interface SurvivalRow {
  day_num: number;
  total_started: number;
  active_on_day: number;
  survival_rate: number;
  day_over_day_change: number;
}

interface SignalTrendRow {
  day_in_stage: number;
  check_count: number;
  unique_users: number;
  avg_calm: number;
  avg_presence: number;
  stddev_calm: number;
  stddev_presence: number;
}

interface EnhancementRow {
  milestone_key: string;
  users_received: number;
  total_eligible: number;
  delivery_rate: number;
}

interface TimeToUnlockRow {
  stage_number: number;
  unlock_count: number;
  avg_days: number;
  min_days: number;
  max_days: number;
  median_days: number;
  unlocked_by_day_10: number;
  unlocked_by_day_14: number;
  unlocked_by_day_21: number;
  unlocked_after_day_21: number;
}

interface ToolUsageRow {
  tool_type: string;
  total_sessions: number;
  unique_users: number;
  avg_duration_min: number;
  sessions_last_7d: number;
  sessions_last_30d: number;
  eligible_users?: number;
  adoption_rate?: number;
  min_stage?: number;
}

interface JournalStatRow {
  entry_type: string;
  total_entries: number;
  unique_users: number;
  entries_last_7d: number;
}

interface WeeklyCheckinStats {
  users_with_checkins: number;
  total_checkins: number;
  avg_qualitative: number;
  avg_delta: number;
  checkins_last_7d: number;
  checkins_last_30d: number;
  total_users: number;
  checkin_participation_rate: number;
}

interface EngagementSummary {
  practicing_users_7d: number;
  total_practices_7d: number;
  avg_practices_per_active_user_7d: number;
  signal_checks_7d: number;
  journal_entries_7d: number;
  tool_sessions_7d: number;
  weekly_checkins_7d: number;
  resistance_events_7d: number;
}

interface BaselineCompletion {
  total_users: number;
  completed_baseline: number;
  completion_rate: number;
  avg_rewired_index: number;
  avg_regulation: number;
  avg_awareness: number;
  avg_outlook: number;
  avg_attention: number;
}

interface TransformationSnapshot {
  baseline_regulation: number;
  baseline_awareness: number;
  baseline_outlook: number;
  baseline_attention: number;
  baseline_rewired: number;
  current_regulation: number;
  current_awareness: number;
  current_outlook: number;
  current_attention: number;
  current_rewired: number;
  delta_regulation: number;
  delta_awareness: number;
  delta_outlook: number;
  delta_attention: number;
  delta_rewired: number;
  users_with_checkins: number;
}

interface TransformationWeeklyRow {
  week_of: string;
  users_reporting: number;
  avg_regulation: number;
  avg_awareness: number;
  avg_outlook: number;
  avg_attention: number;
  avg_rewired: number;
  avg_regulation_delta: number;
  avg_awareness_delta: number;
  avg_outlook_delta: number;
  avg_attention_delta: number;
  avg_overall_delta: number;
}

interface DashboardData {
  overview: {
    total_users: number;
    paid_users: number;
    free_users: number;
    conversion_rate: number;
  };
  stageDistribution: Array<{
    current_stage: number;
    user_count: number;
    percentage: number;
  }>;
  activityMetrics: {
    total_users: number;
    active_7d: number;
    active_30d: number;
    churned_14d: number;
  };
  funnelMetrics: {
    started: number;
    completed_stage_1: number;
    completed_stage_2: number;
    completed_stage_3: number;
    completed_stage_4: number;
    completed_stage_5: number;
    completed_stage_6: number;
    rate_1_to_2: number;
    rate_2_to_3: number;
    rate_3_to_4: number;
    rate_4_to_5: number;
    rate_5_to_6: number;
    rate_6_to_7: number;
  };
  revenueMetrics: {
    active_subscriptions: number;
    monthly_subs: number;
    annual_subs: number;
    pending_cancellations: number;
    in_trial: number;
  };
  dailySignups: Array<{ signup_date: string; signups: number }>;
  recentUsers: Array<{
    user_id: string;
    first_name: string;
    email: string;
    referral_source: string;
    current_stage: number;
    adherence_percentage: number;
    consecutive_days: number;
    rewired_index: number;
    is_paid: boolean;
    subscription_status: string;
    joined_at: string;
    last_active: string;
    days_in_stage: number;
  }>;
  userAlerts: UserAlert[] | null;
  practiceCompletion: PracticeRow[] | null;
  practiceSummary: PracticeSummaryRow[] | null;
  cohortMetrics: CohortRow[] | null;
  userTrends: UserTrendRow[] | null;
  // NEW V2
  stage1Survival: SurvivalRow[] | null;
  signalCheckTrends: SignalTrendRow[] | null;
  enhancementDelivery: EnhancementRow[] | null;
  timeToUnlock: TimeToUnlockRow[] | null;
  toolUsage: ToolUsageRow[] | null;
  journalStats: JournalStatRow[] | null;
  weeklyCheckinStats: WeeklyCheckinStats | null;
  engagementSummary: EngagementSummary | null;
  baselineCompletion: BaselineCompletion | null;
  transformationSnapshot: TransformationSnapshot | null;
  transformationWeekly: TransformationWeeklyRow[] | null;
}

// ============================================
// CONSTANTS
// ============================================
const STAGE_NAMES: { [key: number]: string } = {
  1: 'Neural Priming', 2: 'Embodied Awareness', 3: 'Identity Mode',
  4: 'Flow Mode', 5: 'Relational Coherence', 6: 'Integration', 7: 'Accelerated Expansion'
};

const PRACTICE_LABELS: { [key: string]: string } = {
  'hrvb_breathing': 'HRVB Breathing', 'hrvb': 'HRVB Breathing',
  'awareness_rep': 'Awareness Rep', 'somatic_flow': 'Somatic Flow',
  'micro_action': 'Micro-Action', 'flow_block': 'Flow Block',
  'co_regulation': 'Co-Regulation', 'nightly_debrief': 'Nightly Debrief',
  'thought_hygiene': 'Thought Hygiene', 'decentering': 'Decentering',
  'meta_reflection': 'Meta-Reflection', 'reframe': 'Reframe Protocol',
  'worry_loop': 'Worry Loop Dissolver',
};

const MILESTONE_LABELS: { [key: string]: string } = {
  'first_completion': 'First Completion',
  '3_day_streak': '3-Day Streak',
  'first_calm_4': 'First Calm 4+',
  '7_day_streak': '7-Day Streak',
  'first_presence_4': 'First Presence 4+',
  '50_pct_adherence': '50% Adherence',
  '10_day_streak': '10-Day Streak',
  '80_pct_adherence': '80% Adherence',
  'day_10_progress': 'Day 10 Report',
  'system_map_delivered': 'System Map',
};

const JOURNAL_TYPE_LABELS: { [key: string]: string } = {
  'milestone': 'Milestone', 'science_drip': 'Science Drip',
  'signal_trend': 'Signal Trend', 'micro_decentering': 'Micro-Decentering',
  'day7_mirror': 'Day 7 Mirror', 'weekly_narrative': 'Weekly Narrative',
  'pattern_surfacing': 'Pattern Surfacing', 'reframe_anchor': 'Reframe Anchor',
  'debrief_lesson': 'Debrief Lesson', 'coach_guest': 'Coach Guest',
};

// ============================================
// SECTION HEADER COMPONENT
// ============================================
function SectionHeader({ title, subtitle, icon: Icon }: { title: string; subtitle?: string; icon?: React.ElementType }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      {Icon && (
        <div className="p-2 rounded-lg bg-[#ff9e19]/10">
          <Icon className="w-5 h-5 text-[#ff9e19]" />
        </div>
      )}
      <div>
        <h3 className="text-lg font-semibold text-white">{title}</h3>
        {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
      </div>
    </div>
  );
}

// ============================================
// METRIC CARD
// ============================================
function MetricCard({ 
  title, value, subtitle, icon: Icon, color = 'orange'
}: { 
  title: string; value: string | number; subtitle?: string;
  icon: React.ElementType; color?: 'orange' | 'green' | 'blue' | 'red';
}) {
  const colorClasses = {
    orange: 'text-[#ff9e19] bg-[#ff9e19]/10',
    green: 'text-emerald-500 bg-emerald-500/10',
    blue: 'text-blue-500 bg-blue-500/10',
    red: 'text-red-500 bg-red-500/10'
  };
  return (
    <div className="bg-[#111111] border border-[#1a1a1a] rounded-lg p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-gray-400 mb-1">{title}</p>
          <p className="text-2xl font-bold text-white">{value}</p>
          {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
        </div>
        <div className={`p-2.5 rounded-lg ${colorClasses[color]}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
}

// ============================================
// MINI STAT (for compact inline stats)
// ============================================
function MiniStat({ label, value, color = 'white' }: { label: string; value: string | number; color?: string }) {
  return (
    <div className="text-center">
      <p className={`text-lg font-bold ${color === 'orange' ? 'text-[#ff9e19]' : color === 'green' ? 'text-emerald-500' : color === 'red' ? 'text-red-500' : 'text-white'}`}>{value}</p>
      <p className="text-[10px] text-gray-500 uppercase tracking-wider">{label}</p>
    </div>
  );
}

// ============================================
// INTERVENTION MODAL
// Click a user in Needs Attention → take action
// ============================================
const INTERVENTION_ACTIONS: { [alertType: string]: Array<{ id: string; label: string; icon: React.ElementType; description: string; color: string }> } = {
  at_risk: [
    { id: 'reengagement_email', label: 'Send Re-engagement Email', icon: Mail, description: 'Personalized email acknowledging their absence and inviting them back with encouragement', color: 'text-red-400' },
    { id: 'personal_note', label: 'Send Personal Note', icon: Send, description: 'Custom message from you — write it below', color: 'text-red-400' },
  ],
  stalling: [
    { id: 'encouragement_email', label: 'Send Encouragement Email', icon: Mail, description: 'Highlight their progress so far and remind them how close they are to the next milestone', color: 'text-yellow-400' },
    { id: 'personal_note', label: 'Send Personal Note', icon: Send, description: 'Custom message from you — write it below', color: 'text-yellow-400' },
  ],
  ready_to_unlock: [
    { id: 'unlock_prompt_email', label: 'Send Unlock Congratulations', icon: Zap, description: 'Celebrate their achievement and prompt them to unlock the next stage', color: 'text-emerald-400' },
    { id: 'personal_note', label: 'Send Personal Note', icon: Send, description: 'Custom message from you — write it below', color: 'text-emerald-400' },
  ],
};

function InterventionModal({ 
  user, onClose, onSent 
}: { 
  user: UserAlert; 
  onClose: () => void; 
  onSent: (userId: string, action: string) => void;
}) {
  const [selectedAction, setSelectedAction] = useState<string | null>(null);
  const [customMessage, setCustomMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [recentInterventions, setRecentInterventions] = useState<Array<{ notification_type: string; sent_at: string }>>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  const actions = INTERVENTION_ACTIONS[user.alert_type] || [];

  // Load recent interventions for this user
  useEffect(() => {
    async function loadHistory() {
      try {
        const res = await fetch('/api/admin/interventions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'getHistory', userId: user.user_id }),
        });
        if (res.ok) {
          const data = await res.json();
          setRecentInterventions(data.history || []);
        }
      } catch (e) { /* silent */ }
      setLoadingHistory(false);
    }
    loadHistory();
  }, [user.user_id]);

  const handleSend = async () => {
    if (!selectedAction) return;
    setSending(true);
    try {
      const res = await fetch('/api/admin/interventions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'sendIntervention',
          userId: user.user_id,
          interventionType: selectedAction,
          alertType: user.alert_type,
          customMessage: selectedAction === 'personal_note' ? customMessage : undefined,
        }),
      });
      if (res.ok) {
        setSent(true);
        onSent(user.user_id, selectedAction);
        setTimeout(() => onClose(), 2000);
      }
    } catch (e) {
      console.error('Failed to send intervention:', e);
    }
    setSending(false);
  };

  const alertColors = {
    at_risk: { border: 'border-red-500/30', bg: 'bg-red-500/5', text: 'text-red-400', label: 'At Risk' },
    stalling: { border: 'border-yellow-500/30', bg: 'bg-yellow-500/5', text: 'text-yellow-400', label: 'Stalling' },
    ready_to_unlock: { border: 'border-emerald-500/30', bg: 'bg-emerald-500/5', text: 'text-emerald-400', label: 'Ready to Unlock' },
    healthy: { border: 'border-gray-500/30', bg: 'bg-gray-500/5', text: 'text-gray-400', label: 'Healthy' },
  };
  const colors = alertColors[user.alert_type] || alertColors.at_risk;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-[#111111] border border-[#2a2a2a] rounded-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-[#1a1a1a]">
          <div>
            <h3 className="text-lg font-semibold text-white">{user.first_name}</h3>
            <p className="text-xs text-gray-500">{user.email}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-[#1a1a1a] rounded-lg transition-colors">
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Context */}
        <div className="p-5 border-b border-[#1a1a1a]">
          <div className="grid grid-cols-3 gap-3 mb-3">
            <div className="text-center p-2 bg-[#0a0a0a] rounded-lg">
              <p className="text-sm font-bold text-white">Stage {user.current_stage}</p>
              <p className="text-[10px] text-gray-500">{user.days_in_stage} days</p>
            </div>
            <div className="text-center p-2 bg-[#0a0a0a] rounded-lg">
              <p className={`text-sm font-bold ${user.adherence_percentage >= 60 ? 'text-emerald-400' : user.adherence_percentage >= 30 ? 'text-yellow-400' : 'text-red-400'}`}>
                {user.adherence_percentage}%
              </p>
              <p className="text-[10px] text-gray-500">Adherence</p>
            </div>
            <div className="text-center p-2 bg-[#0a0a0a] rounded-lg">
              <p className="text-sm font-bold text-gray-400">{user.days_since_practice}d ago</p>
              <p className="text-[10px] text-gray-500">Last Practice</p>
            </div>
          </div>
          <div className={`p-2.5 rounded-lg ${colors.bg} border ${colors.border}`}>
            <div className="flex items-center gap-2 mb-1">
              <span className={`text-xs font-medium ${colors.text}`}>{colors.label}</span>
              {user.adherence_trend !== 0 && (
                <span className={`text-[10px] ${user.adherence_trend < 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                  ({user.adherence_trend > 0 ? '+' : ''}{user.adherence_trend}% WoW)
                </span>
              )}
            </div>
            <p className="text-xs text-gray-300">{user.alert_reason}</p>
          </div>
        </div>

        {/* Recent intervention history */}
        {!loadingHistory && recentInterventions.length > 0 && (
          <div className="px-5 pt-4">
            <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-2">Recent Outreach</p>
            <div className="space-y-1 mb-3">
              {recentInterventions.slice(0, 3).map((item, i) => (
                <div key={i} className="flex items-center justify-between py-1.5 px-2 bg-[#0a0a0a] rounded text-xs">
                  <span className="text-gray-400">{item.notification_type.replace(/_/g, ' ')}</span>
                  <span className="text-gray-600">{new Date(item.sent_at).toLocaleDateString()}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        {sent ? (
          <div className="p-8 text-center">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-3" />
            <p className="text-white font-medium">Sent successfully</p>
            <p className="text-xs text-gray-500 mt-1">Logged to notification history</p>
          </div>
        ) : (
          <div className="p-5">
            <p className="text-xs text-gray-400 mb-3">Choose an action:</p>
            <div className="space-y-2">
              {actions.map(action => (
                <button 
                  key={action.id}
                  onClick={() => setSelectedAction(action.id)}
                  className={`w-full text-left p-3 rounded-lg border transition-all ${
                    selectedAction === action.id
                      ? 'border-[#ff9e19] bg-[#ff9e19]/5'
                      : 'border-[#1a1a1a] bg-[#0a0a0a] hover:border-[#2a2a2a]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <action.icon className={`w-4 h-4 ${selectedAction === action.id ? 'text-[#ff9e19]' : 'text-gray-500'}`} />
                    <div>
                      <p className={`text-sm font-medium ${selectedAction === action.id ? 'text-white' : 'text-gray-300'}`}>{action.label}</p>
                      <p className="text-[10px] text-gray-500">{action.description}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {/* Custom message textarea */}
            {selectedAction === 'personal_note' && (
              <div className="mt-3">
                <textarea 
                  value={customMessage}
                  onChange={e => setCustomMessage(e.target.value)}
                  placeholder={`Write a personal message to ${user.first_name}...`}
                  className="w-full h-28 p-3 bg-[#0a0a0a] border border-[#2a2a2a] rounded-lg text-sm text-white placeholder-gray-600 resize-none focus:outline-none focus:border-[#ff9e19]"
                />
              </div>
            )}

            {/* Send button */}
            <button 
              onClick={handleSend}
              disabled={!selectedAction || sending || (selectedAction === 'personal_note' && !customMessage.trim())}
              className="w-full mt-4 py-3 bg-[#ff9e19] text-black font-medium rounded-lg hover:bg-[#ffb347] transition-colors disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {sending ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              {sending ? 'Sending...' : 'Send Intervention'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================
// NEEDS ATTENTION PANEL
// ============================================
function NeedsAttentionPanel({ alerts, onUserClick }: { alerts: UserAlert[] | null; onUserClick: (user: UserAlert) => void }) {
  if (!alerts || alerts.length === 0) {
    return (
      <div className="bg-[#111111] border border-emerald-500/20 rounded-lg p-5">
        <div className="flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-500" />
          <span className="text-sm text-emerald-400">All users on track — nothing requires attention.</span>
        </div>
      </div>
    );
  }

  const atRisk = alerts.filter(a => a.alert_type === 'at_risk');
  const stalling = alerts.filter(a => a.alert_type === 'stalling');
  const ready = alerts.filter(a => a.alert_type === 'ready_to_unlock');

  const AlertCard = ({ user, textColor, bgColor, borderColor }: { 
    user: UserAlert; textColor: string; bgColor: string; borderColor: string;
  }) => (
    <button 
      onClick={() => onUserClick(user)}
      className={`${bgColor} border ${borderColor} rounded-lg p-3 w-full text-left hover:brightness-125 transition-all cursor-pointer`}
    >
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-1.5">
          <span className="text-sm font-medium text-white">{user.first_name}</span>
          <Eye className="w-3 h-3 text-gray-600" />
        </div>
        <span className="text-[10px] text-gray-500">Stage {user.current_stage}</span>
      </div>
      <p className={`text-xs ${textColor}`}>{user.alert_reason}</p>
      {user.adherence_trend !== 0 && (
        <div className="flex items-center gap-1 mt-1.5">
          {user.adherence_trend < 0 ? <TrendingDown className="w-3 h-3 text-red-500" /> : <TrendingUp className="w-3 h-3 text-emerald-500" />}
          <span className={`text-[10px] ${user.adherence_trend < 0 ? 'text-red-400' : 'text-emerald-400'}`}>
            {user.adherence_trend > 0 ? '+' : ''}{user.adherence_trend}% WoW
          </span>
        </div>
      )}
    </button>
  );

  return (
    <div className="bg-[#111111] border border-[#1a1a1a] rounded-lg p-6">
      <SectionHeader title="Needs Attention" subtitle="Click a user to take action" icon={AlertCircle} />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <AlertCircle className="w-4 h-4 text-red-500" />
            <span className="text-sm font-medium text-red-500">At Risk ({atRisk.length})</span>
          </div>
          {atRisk.length === 0 ? <p className="text-xs text-gray-600 italic">None</p> : (
            <div className="space-y-2">{atRisk.map(u => <AlertCard key={u.user_id} user={u} textColor="text-red-400" bgColor="bg-red-500/5" borderColor="border-red-500/20" />)}</div>
          )}
        </div>
        <div>
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-4 h-4 text-yellow-500" />
            <span className="text-sm font-medium text-yellow-500">Stalling ({stalling.length})</span>
          </div>
          {stalling.length === 0 ? <p className="text-xs text-gray-600 italic">None</p> : (
            <div className="space-y-2">{stalling.map(u => <AlertCard key={u.user_id} user={u} textColor="text-yellow-400" bgColor="bg-yellow-500/5" borderColor="border-yellow-500/20" />)}</div>
          )}
        </div>
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Zap className="w-4 h-4 text-emerald-500" />
            <span className="text-sm font-medium text-emerald-500">Ready to Unlock ({ready.length})</span>
          </div>
          {ready.length === 0 ? <p className="text-xs text-gray-600 italic">None</p> : (
            <div className="space-y-2">{ready.map(u => <AlertCard key={u.user_id} user={u} textColor="text-emerald-400" bgColor="bg-emerald-500/5" borderColor="border-emerald-500/20" />)}</div>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================
// STAGE 1 SURVIVAL CURVE (NEW)
// ============================================
function SurvivalCurve({ data }: { data: SurvivalRow[] | null }) {
  if (!data || data.length === 0) {
    return (
      <div className="bg-[#111111] border border-[#1a1a1a] rounded-lg p-6">
        <SectionHeader title="Stage 1 Survival Curve" subtitle="Day-by-day retention through Stage 1" icon={BarChart3} />
        <p className="text-sm text-gray-500 text-center py-6">No data yet — needs users completing Stage 1 practices</p>
      </div>
    );
  }

  const maxRate = 100;
  const criticalDays = data.filter(d => (d.day_over_day_change || 0) < -5);
  const biggestDrop = criticalDays.sort((a, b) => (a.day_over_day_change || 0) - (b.day_over_day_change || 0))[0];

  return (
    <div className="bg-[#111111] border border-[#1a1a1a] rounded-lg p-6">
      <SectionHeader title="Stage 1 Survival Curve" subtitle="Day-by-day retention — where do users drop off?" icon={BarChart3} />
      
      {/* Insight callout */}
      {biggestDrop && (
        <div className="mb-4 p-3 bg-red-500/5 border border-red-500/20 rounded-lg">
          <p className="text-xs text-red-400">
            ⚠️ Biggest drop: <strong>Day {biggestDrop.day_num}</strong> ({biggestDrop.day_over_day_change}% change). 
            This is where intervention is most needed.
          </p>
        </div>
      )}
      
      {/* Bar chart */}
      <div className="flex items-end gap-1 h-40 mb-2">
        {data.slice(0, 14).map((d) => {
          const height = (d.survival_rate / maxRate) * 100;
          const isDropDay = (d.day_over_day_change || 0) < -5;
          return (
            <div key={d.day_num} className="flex-1 flex flex-col items-center gap-1" title={`Day ${d.day_num}: ${d.active_on_day}/${d.total_started} users (${d.survival_rate}%)`}>
              <span className="text-[9px] text-gray-500">{d.survival_rate}%</span>
              <div className="w-full relative" style={{ height: `${height}%`, minHeight: '4px' }}>
                <div className={`w-full h-full rounded-t transition-all ${
                  isDropDay ? 'bg-red-500' : d.survival_rate >= 70 ? 'bg-emerald-500' : d.survival_rate >= 40 ? 'bg-yellow-500' : 'bg-red-500/60'
                }`} />
              </div>
            </div>
          );
        })}
      </div>
      <div className="flex gap-1 mb-4">
        {data.slice(0, 14).map(d => (
          <div key={d.day_num} className="flex-1 text-center">
            <span className="text-[9px] text-gray-600">D{d.day_num}</span>
          </div>
        ))}
      </div>
      
      {/* Key stats */}
      <div className="grid grid-cols-4 gap-4 pt-4 border-t border-[#1a1a1a]">
        <MiniStat label="Day 1" value={`${data[0]?.survival_rate || 0}%`} color="green" />
        <MiniStat label="Day 7" value={`${data[6]?.survival_rate || 0}%`} color={data[6]?.survival_rate >= 50 ? 'green' : 'red'} />
        <MiniStat label="Day 10" value={`${data[9]?.survival_rate || 0}%`} color={data[9]?.survival_rate >= 40 ? 'green' : 'red'} />
        <MiniStat label="Day 14" value={`${data[13]?.survival_rate || 0}%`} color={data[13]?.survival_rate >= 30 ? 'green' : 'red'} />
      </div>
    </div>
  );
}

// ============================================
// SIGNAL CHECK TRENDS (NEW)
// ============================================
function SignalCheckTrends({ data }: { data: SignalTrendRow[] | null }) {
  if (!data || data.length === 0) {
    return (
      <div className="bg-[#111111] border border-[#1a1a1a] rounded-lg p-6">
        <SectionHeader title="Signal Check Trends" subtitle="Average calm & presence scores by day-in-stage" icon={Brain} />
        <p className="text-sm text-gray-500 text-center py-6">No signal check data yet</p>
      </div>
    );
  }

  const firstDay = data[0];
  const lastDay = data[data.length - 1];
  const calmDelta = lastDay && firstDay ? (lastDay.avg_calm - firstDay.avg_calm).toFixed(2) : '0';
  const presenceDelta = lastDay && firstDay ? (lastDay.avg_presence - firstDay.avg_presence).toFixed(2) : '0';

  return (
    <div className="bg-[#111111] border border-[#1a1a1a] rounded-lg p-6">
      <SectionHeader title="Signal Check Trends" subtitle="Are practices producing measurable shifts?" icon={Brain} />
      
      {/* Dual line chart as bars */}
      <div className="space-y-4">
        {/* Calm */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-blue-400 font-medium">Calm (avg across all users)</span>
            <span className={`text-xs font-medium ${Number(calmDelta) >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {Number(calmDelta) >= 0 ? '+' : ''}{calmDelta} overall
            </span>
          </div>
          <div className="flex items-end gap-0.5 h-16">
            {data.map(d => (
              <div key={`c-${d.day_in_stage}`} className="flex-1" title={`Day ${d.day_in_stage}: ${d.avg_calm}/5 (${d.unique_users} users)`}>
                <div className="w-full bg-blue-500/80 rounded-t" style={{ height: `${(d.avg_calm / 5) * 100}%`, minHeight: '2px' }} />
              </div>
            ))}
          </div>
        </div>
        
        {/* Presence */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-purple-400 font-medium">Presence (avg across all users)</span>
            <span className={`text-xs font-medium ${Number(presenceDelta) >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {Number(presenceDelta) >= 0 ? '+' : ''}{presenceDelta} overall
            </span>
          </div>
          <div className="flex items-end gap-0.5 h-16">
            {data.map(d => (
              <div key={`p-${d.day_in_stage}`} className="flex-1" title={`Day ${d.day_in_stage}: ${d.avg_presence}/5 (${d.unique_users} users)`}>
                <div className="w-full bg-purple-500/80 rounded-t" style={{ height: `${(d.avg_presence / 5) * 100}%`, minHeight: '2px' }} />
              </div>
            ))}
          </div>
        </div>
        
        {/* Day labels */}
        <div className="flex gap-0.5">
          {data.map(d => (
            <div key={`l-${d.day_in_stage}`} className="flex-1 text-center">
              <span className="text-[8px] text-gray-600">D{d.day_in_stage}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ============================================
// ENHANCEMENT DELIVERY (NEW)
// ============================================
function EnhancementDelivery({ data }: { data: EnhancementRow[] | null }) {
  if (!data || data.length === 0) {
    return (
      <div className="bg-[#111111] border border-[#1a1a1a] rounded-lg p-6">
        <SectionHeader title="Enhancement Delivery" subtitle="Stage 1 experience layer — what's been delivered?" icon={Layers} />
        <p className="text-sm text-gray-500 text-center py-6">No enhancement data yet</p>
      </div>
    );
  }

  return (
    <div className="bg-[#111111] border border-[#1a1a1a] rounded-lg p-6">
      <SectionHeader title="Enhancement Delivery" subtitle="Stage 1 milestones & enhancements — are they firing?" icon={Layers} />
      <div className="space-y-2">
        {data.map(row => (
          <div key={row.milestone_key} className="flex items-center gap-3">
            <span className="text-xs text-gray-300 w-36 shrink-0">
              {MILESTONE_LABELS[row.milestone_key] || row.milestone_key.replace(/_/g, ' ')}
            </span>
            <div className="flex-1 h-5 bg-[#1a1a1a] rounded-full overflow-hidden relative">
              <div 
                className={`h-full rounded-full transition-all ${
                  row.delivery_rate >= 70 ? 'bg-emerald-500' : row.delivery_rate >= 40 ? 'bg-yellow-500' : 'bg-red-500/60'
                }`}
                style={{ width: `${Math.min(row.delivery_rate, 100)}%` }}
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-[9px] font-medium text-white/80">
                  {row.users_received}/{row.total_eligible}
                </span>
              </div>
            </div>
            <span className={`text-xs font-medium w-12 text-right ${
              row.delivery_rate >= 70 ? 'text-emerald-500' : row.delivery_rate >= 40 ? 'text-yellow-500' : 'text-red-500'
            }`}>
              {row.delivery_rate}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================
// TIME TO UNLOCK (NEW)
// ============================================
function TimeToUnlock({ data }: { data: TimeToUnlockRow[] | null }) {
  if (!data || data.length === 0) {
    return (
      <div className="bg-[#111111] border border-[#1a1a1a] rounded-lg p-6">
        <SectionHeader title="Time to Unlock" subtitle="How long does each stage take?" icon={Clock} />
        <p className="text-sm text-gray-500 text-center py-6">No unlock data yet — needs users completing stages</p>
      </div>
    );
  }

  return (
    <div className="bg-[#111111] border border-[#1a1a1a] rounded-lg p-6">
      <SectionHeader title="Time to Unlock" subtitle="Distribution of days to complete each stage" icon={Clock} />
      <div className="space-y-4">
        {data.map(row => (
          <div key={row.stage_number} className="p-3 bg-[#0a0a0a] rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-white">Stage {row.stage_number} → {row.stage_number + 1}</span>
              <span className="text-xs text-gray-400">{row.unlock_count} unlocks</span>
            </div>
            <div className="grid grid-cols-4 gap-3 mb-2">
              <MiniStat label="Median" value={`${row.median_days}d`} color="orange" />
              <MiniStat label="Avg" value={`${row.avg_days}d`} />
              <MiniStat label="Fastest" value={`${row.min_days}d`} color="green" />
              <MiniStat label="Slowest" value={`${row.max_days}d`} color="red" />
            </div>
            {row.stage_number === 1 && (
              <div className="flex items-center gap-3 pt-2 border-t border-[#1a1a1a]">
                <div className="flex items-center gap-1">
                  <Zap className="w-3 h-3 text-[#ff9e19]" />
                  <span className="text-[10px] text-gray-400">By Day 10: <span className="text-white font-medium">{row.unlocked_by_day_10}</span></span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-[10px] text-gray-400">By Day 14: <span className="text-white font-medium">{row.unlocked_by_day_14}</span></span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-[10px] text-gray-400">After Day 21: <span className={`font-medium ${row.unlocked_after_day_21 > 0 ? 'text-yellow-500' : 'text-gray-500'}`}>{row.unlocked_after_day_21}</span></span>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================
// TOOL USAGE (NEW)
// ============================================
ffunction ToolUsagePanel({ data }: { data: ToolUsageRow[] | null }) {
  if (!data || data.length === 0) {
    return (
      <div className="bg-[#111111] border border-[#1a1a1a] rounded-lg p-6">
        <SectionHeader title="On-Demand Tool Usage" subtitle="Which tools are being used?" icon={Target} />
        <p className="text-sm text-gray-500 text-center py-6">No tool usage data yet</p>
      </div>
    );
  }

  // Sort: tools with eligible users first, then by adoption rate desc
  const sorted = [...data].sort((a, b) => {
    if ((a.eligible_users || 0) > 0 && (b.eligible_users || 0) === 0) return -1;
    if ((a.eligible_users || 0) === 0 && (b.eligible_users || 0) > 0) return 1;
    return (b.adoption_rate || 0) - (a.adoption_rate || 0);
  });

  return (
    <div className="bg-[#111111] border border-[#1a1a1a] rounded-lg p-6">
      <SectionHeader title="On-Demand Tool Usage" subtitle="Adoption rate = users who used / users who have access" icon={Target} />
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#1a1a1a]">
              <th className="text-left text-xs text-gray-400 pb-2 font-medium">Tool</th>
              <th className="text-right text-xs text-gray-400 pb-2 font-medium">Access</th>
              <th className="text-right text-xs text-gray-400 pb-2 font-medium">Used</th>
              <th className="text-right text-xs text-gray-400 pb-2 font-medium">Adoption</th>
              <th className="text-right text-xs text-gray-400 pb-2 font-medium">Sessions</th>
              <th className="text-right text-xs text-gray-400 pb-2 font-medium">Last 7d</th>
              <th className="text-right text-xs text-gray-400 pb-2 font-medium">Avg Min</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map(row => {
              const hasEligible = (row.eligible_users || 0) > 0;
              const adoptionRate = row.adoption_rate || 0;
              return (
                <tr key={row.tool_type} className={`border-b border-[#1a1a1a]/50 ${!hasEligible ? 'opacity-40' : ''}`}>
                  <td className="py-2.5">
                    <div className="text-sm text-gray-300">{PRACTICE_LABELS[row.tool_type] || row.tool_type.replace(/_/g, ' ')}</div>
                    {row.min_stage && row.min_stage > 1 && (
                      <div className="text-[10px] text-gray-600">Unlocks Stage {row.min_stage}+</div>
                    )}
                  </td>
                  <td className="text-sm text-gray-400 text-right py-2.5">{row.eligible_users || 0}</td>
                  <td className="text-sm text-white text-right py-2.5 font-medium">{row.unique_users}</td>
                  <td className="text-right py-2.5">
                    {hasEligible ? (
                      <span className={`text-sm font-bold ${
                        adoptionRate >= 50 ? 'text-emerald-400' : adoptionRate > 0 ? 'text-yellow-400' : 'text-gray-600'
                      }`}>
                        {adoptionRate}%
                      </span>
                    ) : (
                      <span className="text-xs text-gray-600">—</span>
                    )}
                  </td>
                  <td className="text-sm text-white text-right py-2.5 font-medium">{row.total_sessions}</td>
                  <td className="text-sm text-right py-2.5">
                    <span className={row.sessions_last_7d > 0 ? 'text-emerald-400' : 'text-gray-600'}>{row.sessions_last_7d}</span>
                  </td>
                  <td className="text-sm text-gray-400 text-right py-2.5">{row.avg_duration_min || '—'}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="text-[10px] text-gray-600 mt-3 pt-3 border-t border-[#1a1a1a]">
        Dimmed rows = no users have unlocked that stage yet. Adoption rate normalizes usage by who can actually access each tool.
      </p>
    </div>
  );
}

// ============================================
// ENGAGEMENT DEPTH (NEW)
// ============================================
function EngagementDepth({ data, checkins }: { data: EngagementSummary | null; checkins: WeeklyCheckinStats | null }) {
  if (!data) return null;

  const items = [
    { label: 'Practices (7d)', value: data.total_practices_7d || 0, icon: Activity, color: 'text-emerald-500' },
    { label: 'Signal Checks (7d)', value: data.signal_checks_7d || 0, icon: BarChart3, color: 'text-blue-500' },
    { label: 'Journal Entries (7d)', value: data.journal_entries_7d || 0, icon: BookOpen, color: 'text-purple-500' },
    { label: 'Tool Sessions (7d)', value: data.tool_sessions_7d || 0, icon: Target, color: 'text-[#ff9e19]' },
    { label: 'Weekly Check-ins (7d)', value: data.weekly_checkins_7d || 0, icon: CheckCircle2, color: 'text-cyan-500' },
    { label: 'Resistance Events (7d)', value: data.resistance_events_7d || 0, icon: AlertTriangle, color: 'text-red-500' },
  ];

  return (
    <div className="bg-[#111111] border border-[#1a1a1a] rounded-lg p-6">
      <SectionHeader title="Engagement Depth (Last 7 Days)" subtitle="How deeply are users using the system?" icon={MessageSquare} />
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-4">
        {items.map(item => (
          <div key={item.label} className="text-center p-3 bg-[#0a0a0a] rounded-lg">
            <item.icon className={`w-4 h-4 mx-auto mb-1 ${item.color}`} />
            <p className="text-xl font-bold text-white">{item.value}</p>
            <p className="text-[10px] text-gray-500">{item.label}</p>
          </div>
        ))}
      </div>
      
      {/* Quick stats row */}
      <div className="flex items-center gap-6 pt-3 border-t border-[#1a1a1a]">
        <div className="text-xs text-gray-400">
          Active users (7d): <span className="text-white font-medium">{data.practicing_users_7d || 0}</span>
        </div>
        <div className="text-xs text-gray-400">
          Avg practices/user: <span className="text-white font-medium">{data.avg_practices_per_active_user_7d || 0}</span>
        </div>
        {checkins && (
          <>
            <div className="text-xs text-gray-400">
              Check-in participation: <span className="text-white font-medium">{checkins.checkin_participation_rate || 0}%</span>
            </div>
            <div className="text-xs text-gray-400">
              Avg qualitative: <span className="text-[#ff9e19] font-medium">{checkins.avg_qualitative || 0}/5</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ============================================
// BASELINE COMPLETION (NEW)
// ============================================
function BaselinePanel({ data }: { data: BaselineCompletion | null }) {
  if (!data) return null;
  return (
    <div className="bg-[#111111] border border-[#1a1a1a] rounded-lg p-6">
      <SectionHeader title="Baseline Diagnostics" subtitle="Onboarding completion & starting scores" icon={BarChart3} />
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <div className="text-center p-3 bg-[#0a0a0a] rounded-lg col-span-2 md:col-span-1">
          <p className="text-xl font-bold text-[#ff9e19]">{data.completion_rate}%</p>
          <p className="text-[10px] text-gray-500">Completed</p>
          <p className="text-[10px] text-gray-600">{data.completed_baseline}/{data.total_users}</p>
        </div>
        <div className="text-center p-3 bg-[#0a0a0a] rounded-lg">
          <p className="text-lg font-bold text-white">{data.avg_rewired_index}</p>
          <p className="text-[10px] text-gray-500">Avg REwired</p>
        </div>
        <div className="text-center p-3 bg-[#0a0a0a] rounded-lg">
          <p className="text-lg font-bold text-[#22c55e]">{data.avg_regulation}</p>
          <p className="text-[10px] text-gray-500">Avg Regulation</p>
        </div>
        <div className="text-center p-3 bg-[#0a0a0a] rounded-lg">
          <p className="text-lg font-bold text-[#10b981]">{data.avg_awareness}</p>
          <p className="text-[10px] text-gray-500">Avg Awareness</p>
        </div>
        <div className="text-center p-3 bg-[#0a0a0a] rounded-lg">
          <p className="text-lg font-bold text-[#f59e0b]">{data.avg_outlook}</p>
          <p className="text-[10px] text-gray-500">Avg Outlook</p>
        </div>
        <div className="text-center p-3 bg-[#0a0a0a] rounded-lg">
          <p className="text-lg font-bold text-[#8b5cf6]">{data.avg_attention}</p>
          <p className="text-[10px] text-gray-500">Avg Attention</p>
        </div>
      </div>
    </div>
  );
}

// ============================================
// TRANSFORMATION TRACKER (NEW)
// Baseline → Current → Delta for REwired + 4 domains
// Plus week-over-week progression chart
// ============================================
function TransformationTracker({ 
  snapshot, weekly 
}: { 
  snapshot: TransformationSnapshot | null; 
  weekly: TransformationWeeklyRow[] | null;
}) {
  if (!snapshot) {
    return (
      <div className="bg-[#111111] border border-[#1a1a1a] rounded-lg p-6">
        <SectionHeader title="Transformation Tracker" subtitle="Baseline → Current across REwired Index + 4 domains" icon={TrendingUp} />
        <p className="text-sm text-gray-500 text-center py-6">No transformation data yet — needs baseline + at least one weekly check-in</p>
      </div>
    );
  }

  const domains = [
    { key: 'regulation', label: 'Regulation', color: 'text-emerald-500', barColor: 'bg-emerald-500', bgColor: 'bg-emerald-500/20',
      baseline: snapshot.baseline_regulation, current: snapshot.current_regulation, delta: snapshot.delta_regulation },
    { key: 'awareness', label: 'Awareness', color: 'text-blue-500', barColor: 'bg-blue-500', bgColor: 'bg-blue-500/20',
      baseline: snapshot.baseline_awareness, current: snapshot.current_awareness, delta: snapshot.delta_awareness },
    { key: 'outlook', label: 'Outlook', color: 'text-yellow-500', barColor: 'bg-yellow-500', bgColor: 'bg-yellow-500/20',
      baseline: snapshot.baseline_outlook, current: snapshot.current_outlook, delta: snapshot.delta_outlook },
    { key: 'attention', label: 'Attention', color: 'text-purple-500', barColor: 'bg-purple-500', bgColor: 'bg-purple-500/20',
      baseline: snapshot.baseline_attention, current: snapshot.current_attention, delta: snapshot.delta_attention },
  ];

  const hasWeeklyData = weekly && weekly.length > 1;

  return (
    <div className="bg-[#111111] border border-[#1a1a1a] rounded-lg p-6">
      <SectionHeader title="Transformation Tracker" subtitle={`Baseline → Current (${snapshot.users_with_checkins} users with check-ins)`} icon={TrendingUp} />
      
      {/* REwired Index Hero */}
      <div className="mb-6 p-4 bg-[#0a0a0a] rounded-lg border border-[#ff9e19]/20">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-[#ff9e19]">REwired Index</span>
          <span className={`text-lg font-bold ${snapshot.delta_rewired >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            {snapshot.delta_rewired >= 0 ? '+' : ''}{snapshot.delta_rewired}
          </span>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-400">{snapshot.baseline_rewired}</p>
            <p className="text-[10px] text-gray-600">Baseline</p>
          </div>
          <div className="flex-1 h-3 bg-[#1a1a1a] rounded-full overflow-hidden relative">
            {/* Baseline marker */}
            <div className="absolute h-full w-0.5 bg-gray-500 z-10" style={{ left: `${(snapshot.baseline_rewired / 100) * 100}%` }} />
            {/* Current fill */}
            <div className={`h-full rounded-full transition-all ${snapshot.current_rewired >= snapshot.baseline_rewired ? 'bg-[#ff9e19]' : 'bg-red-500'}`}
              style={{ width: `${(snapshot.current_rewired / 100) * 100}%` }} />
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-[#ff9e19]">{snapshot.current_rewired}</p>
            <p className="text-[10px] text-gray-600">Current</p>
          </div>
        </div>
      </div>

      {/* 4 Domain Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {domains.map(d => (
          <div key={d.key} className="p-3 bg-[#0a0a0a] rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className={`text-xs font-medium ${d.color}`}>{d.label}</span>
              <span className={`text-sm font-bold ${d.delta >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {d.delta >= 0 ? '+' : ''}{d.delta}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex-1">
                {/* Baseline bar */}
                <div className="flex items-center gap-1.5 mb-1">
                  <div className="w-full h-2 bg-[#1a1a1a] rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${d.barColor} opacity-30`} style={{ width: `${(d.baseline / 5) * 100}%` }} />
                  </div>
                  <span className="text-[10px] text-gray-500 w-6 text-right">{d.baseline}</span>
                </div>
                {/* Current bar */}
                <div className="flex items-center gap-1.5">
                  <div className="w-full h-2 bg-[#1a1a1a] rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${d.barColor}`} style={{ width: `${(d.current / 5) * 100}%` }} />
                  </div>
                  <span className={`text-[10px] font-medium w-6 text-right ${d.color}`}>{d.current}</span>
                </div>
              </div>
            </div>
            <div className="flex justify-between mt-1.5">
              <span className="text-[9px] text-gray-600">Baseline</span>
              <span className="text-[9px] text-gray-600">Current</span>
            </div>
          </div>
        ))}
      </div>

      {/* Week-over-Week Progression Chart */}
      {hasWeeklyData && (
        <div>
          <div className="flex items-center justify-between mb-3 pt-3 border-t border-[#1a1a1a]">
            <span className="text-xs text-gray-400 font-medium">Weekly REwired Index Progression</span>
            <span className="text-[10px] text-gray-600">{weekly!.length} weeks tracked</span>
          </div>
          <div className="flex items-end gap-1 h-24 mb-2">
            {weekly!.map((w, i) => {
              const height = Math.max((w.avg_rewired / 100) * 100, 4);
              const prevRewired = i > 0 ? weekly![i - 1].avg_rewired : snapshot.baseline_rewired;
              const improving = w.avg_rewired >= prevRewired;
              return (
                <div key={w.week_of} className="flex-1 flex flex-col items-center gap-0.5"
                  title={`Week of ${new Date(w.week_of).toLocaleDateString()}: REwired ${w.avg_rewired} (${w.users_reporting} users)\nReg: ${w.avg_regulation} | Awr: ${w.avg_awareness} | Out: ${w.avg_outlook} | Att: ${w.avg_attention}`}>
                  <span className="text-[8px] text-gray-500">{w.avg_rewired}</span>
                  <div className="w-full rounded-t" style={{ height: `${height}%`, minHeight: '4px' }}>
                    <div className={`w-full h-full rounded-t ${improving ? 'bg-[#ff9e19]' : 'bg-[#ff9e19]/40'}`} />
                  </div>
                </div>
              );
            })}
          </div>
          <div className="flex gap-1">
            {weekly!.map(w => (
              <div key={`l-${w.week_of}`} className="flex-1 text-center">
                <span className="text-[7px] text-gray-600">
                  {new Date(w.week_of).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </span>
              </div>
            ))}
          </div>

          {/* Domain delta trend (mini) */}
          <div className="grid grid-cols-4 gap-3 mt-4 pt-3 border-t border-[#1a1a1a]">
            {[
              { label: 'Regulation', key: 'avg_regulation_delta' as const, color: 'text-emerald-500' },
              { label: 'Awareness', key: 'avg_awareness_delta' as const, color: 'text-blue-500' },
              { label: 'Outlook', key: 'avg_outlook_delta' as const, color: 'text-yellow-500' },
              { label: 'Attention', key: 'avg_attention_delta' as const, color: 'text-purple-500' },
            ].map(d => {
              const latest = weekly![weekly!.length - 1];
              const val = latest[d.key];
              return (
                <div key={d.key} className="text-center">
                  <span className={`text-sm font-bold ${val >= 0 ? d.color : 'text-red-400'}`}>
                    {val >= 0 ? '+' : ''}{val}
                  </span>
                  <p className="text-[9px] text-gray-500">{d.label} Δ</p>
                  <p className="text-[8px] text-gray-600">latest week</p>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================
// PRACTICE HEATMAP (existing, cleaned up)
// ============================================
function PracticeHeatmap({ data, summary }: { data: PracticeRow[] | null; summary: PracticeSummaryRow[] | null }) {
  if ((!data || data.length === 0) && (!summary || summary.length === 0)) {
    return (
      <div className="bg-[#111111] border border-[#1a1a1a] rounded-lg p-6">
        <SectionHeader title="Practice Completion (Last 7 Days)" icon={Activity} />
        <p className="text-sm text-gray-500 text-center py-6">No practice data yet</p>
      </div>
    );
  }

  const practiceTypes = [...new Set((data || []).map(d => d.practice_type))].sort();
  const dates = [...new Set((data || []).map(d => d.practice_date))].sort();
  const lookup: { [key: string]: PracticeRow } = {};
  (data || []).forEach(row => { lookup[`${row.practice_type}|${row.practice_date}`] = row; });
  const summaryLookup: { [key: string]: PracticeSummaryRow } = {};
  (summary || []).forEach(row => { summaryLookup[row.practice_type] = row; });
  const allPractices = [...new Set([...practiceTypes, ...Object.keys(summaryLookup)])].sort();

  const rateColor = (rate: number | undefined) => {
    if (rate === undefined) return 'bg-[#1a1a1a]';
    if (rate >= 80) return 'bg-emerald-500';
    if (rate >= 60) return 'bg-emerald-500/60';
    if (rate >= 40) return 'bg-yellow-500/60';
    if (rate > 0) return 'bg-red-500/40';
    return 'bg-red-500/20';
  };

  return (
    <div className="bg-[#111111] border border-[#1a1a1a] rounded-lg p-6">
      <SectionHeader title="Practice Completion (Last 7 Days)" icon={Activity} />
      {dates.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th className="text-left text-xs text-gray-400 pb-3 pr-4 font-medium min-w-[120px]">Practice</th>
                {dates.map(date => (
                  <th key={date} className="text-center text-[10px] text-gray-500 pb-3 px-1 font-medium">
                    {new Date(date + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'numeric', day: 'numeric' })}
                  </th>
                ))}
                <th className="text-right text-xs text-gray-400 pb-3 pl-4 font-medium">14d Avg</th>
              </tr>
            </thead>
            <tbody>
              {allPractices.map(practice => {
                const sumRow = summaryLookup[practice];
                return (
                  <tr key={practice}>
                    <td className="text-xs text-gray-300 py-1.5 pr-4 whitespace-nowrap">{PRACTICE_LABELS[practice] || practice.replace(/_/g, ' ')}</td>
                    {dates.map(date => {
                      const row = lookup[`${practice}|${date}`];
                      return (
                        <td key={date} className="py-1.5 px-1">
                          <div className={`w-full h-7 rounded ${rateColor(row?.completion_rate)} flex items-center justify-center`}
                            title={row ? `${row.completion_rate}% (${row.completed_count}/${row.total_logged})` : 'No data'}>
                            {row && <span className="text-[9px] font-medium text-white/80">{row.completed_count}/{row.total_logged}</span>}
                          </div>
                        </td>
                      );
                    })}
                    <td className="text-right pl-4">
                      <span className={`text-xs font-medium ${(sumRow?.overall_rate || 0) >= 70 ? 'text-emerald-500' : (sumRow?.overall_rate || 0) >= 40 ? 'text-yellow-500' : 'text-red-500'}`}>
                        {sumRow?.overall_rate || 0}%
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="space-y-3">
          {(summary || []).map(row => (
            <div key={row.practice_type} className="flex items-center gap-3">
              <span className="text-xs text-gray-300 w-32 shrink-0">{PRACTICE_LABELS[row.practice_type] || row.practice_type}</span>
              <div className="flex-1 h-5 bg-[#1a1a1a] rounded-full overflow-hidden">
                <div className={`h-full rounded-full ${rateColor(row.overall_rate)}`} style={{ width: `${row.overall_rate}%` }} />
              </div>
              <span className={`text-xs font-medium w-10 text-right ${row.overall_rate >= 70 ? 'text-emerald-500' : row.overall_rate >= 40 ? 'text-yellow-500' : 'text-red-500'}`}>{row.overall_rate}%</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================
// JOURNAL STATS (NEW)
// ============================================
function JournalStatsPanel({ data }: { data: JournalStatRow[] | null }) {
  if (!data || data.length === 0) return null;
  return (
    <div className="bg-[#111111] border border-[#1a1a1a] rounded-lg p-6">
      <SectionHeader title="Journal Entries" subtitle="Automated logging — what's being captured?" icon={BookOpen} />
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-2">
        {data.map(row => (
          <div key={row.entry_type} className="p-3 bg-[#0a0a0a] rounded-lg text-center">
            <p className="text-lg font-bold text-white">{row.total_entries}</p>
            <p className="text-[10px] text-gray-500">{JOURNAL_TYPE_LABELS[row.entry_type] || row.entry_type.replace(/_/g, ' ')}</p>
            <p className="text-[9px] text-gray-600">{row.unique_users} users · {row.entries_last_7d} this week</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================
// STAGE DISTRIBUTION BAR (existing, cleaned up)
// ============================================
function StageDistributionBar({ data }: { data: DashboardData['stageDistribution'] }) {
  const colors = ['bg-blue-500','bg-cyan-500','bg-emerald-500','bg-yellow-500','bg-orange-500','bg-red-500','bg-purple-500'];
  return (
    <div className="bg-[#111111] border border-[#1a1a1a] rounded-lg p-6">
      <SectionHeader title="Stage Distribution" />
      <div className="h-8 rounded-full overflow-hidden flex bg-[#1a1a1a] mb-4">
        {data?.map((stage, i) => (
          <div key={stage.current_stage} className={`${colors[i]} transition-all duration-300`}
            style={{ width: `${stage.percentage}%` }}
            title={`Stage ${stage.current_stage}: ${stage.user_count} (${stage.percentage}%)`} />
        ))}
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        {data?.map((stage, i) => (
          <div key={stage.current_stage} className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${colors[i]}`} />
            <div className="text-xs">
              <p className="text-gray-400">Stage {stage.current_stage}</p>
              <p className="text-white font-medium">{stage.user_count} ({stage.percentage}%)</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================
// CONVERSION FUNNEL (existing)
// ============================================
function ConversionFunnel({ data }: { data: DashboardData['funnelMetrics'] }) {
  if (!data) return null;
  
  // True funnel: how many users passed through each gate
  // "completed_stage_1" now means users who COMPLETED Stage 1 and reached Stage 2+
  const stages = [
    { label: 'Signed Up', count: data.started, rate: 100, desc: 'Total users' },
    { label: 'Completed S1', count: data.completed_stage_1, rate: data.rate_1_to_2, desc: 'Reached Stage 2' },
    { label: 'Completed S2', count: data.completed_stage_2, rate: data.rate_2_to_3, desc: 'Reached Stage 3' },
    { label: 'Completed S3', count: data.completed_stage_3, rate: data.rate_3_to_4, desc: 'Reached Stage 4' },
    { label: 'Completed S4', count: data.completed_stage_4, rate: data.rate_4_to_5, desc: 'Reached Stage 5' },
    { label: 'Completed S5', count: data.completed_stage_5, rate: data.rate_5_to_6, desc: 'Reached Stage 6' },
    { label: 'Completed S6', count: data.completed_stage_6, rate: data.rate_6_to_7, desc: 'Reached Stage 7' },
  ];
  return (
    <div className="bg-[#111111] border border-[#1a1a1a] rounded-lg p-6">
      <SectionHeader title="Conversion Funnel" subtitle="Users who passed through each stage gate" />
      <div className="space-y-2">
        {stages.map((stage, i) => (
          <div key={stage.label} className="flex items-center gap-3">
            <div className="w-24 shrink-0">
              <div className="text-xs text-gray-300">{stage.label}</div>
              {i > 0 && <div className="text-[9px] text-gray-600">{stage.desc}</div>}
            </div>
            <div className="flex-1 h-6 bg-[#1a1a1a] rounded-full overflow-hidden relative">
              <div className="h-full bg-gradient-to-r from-[#ff9e19] to-[#ffb347] transition-all"
                style={{ width: `${(stage.count / (data.started || 1)) * 100}%` }} />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-[10px] font-medium text-white">{stage.count} users</span>
              </div>
            </div>
            <span className={`text-xs font-medium w-10 text-right ${
              i === 0 ? 'text-gray-400' : stage.rate >= 50 ? 'text-emerald-500' : stage.rate >= 25 ? 'text-yellow-500' : stage.rate === 0 ? 'text-gray-600' : 'text-red-500'
            }`}>
              {i === 0 ? '' : `${stage.rate?.toFixed(0) || 0}%`}
            </span>
          </div>
        ))}
      </div>
      {/* Explainer */}
      <p className="text-[10px] text-gray-600 mt-3 pt-3 border-t border-[#1a1a1a]">
        Rates show stage-to-stage conversion (% of previous stage that advanced). 0% = no one has completed that stage yet.
      </p>
    </div>
  );
}

// ============================================
// COHORT COMPARISON (existing)
// ============================================
function CohortComparison({ data }: { data: CohortRow[] | null }) {
  if (!data || data.length === 0) return null;
  const organic = data.find(d => d.cohort === 'organic');
  const aw5 = data.find(d => d.cohort === 'awaken5');
  if (!organic && !aw5) return null;

  const rows = [
    { label: 'Avg Adherence', aw5: `${aw5?.avg_adherence || 0}%`, org: `${organic?.avg_adherence || 0}%`, aw5Num: aw5?.avg_adherence || 0, orgNum: organic?.avg_adherence || 0, higherBetter: true },
    { label: 'Avg Stage', aw5: aw5?.avg_stage || 0, org: organic?.avg_stage || 0, aw5Num: aw5?.avg_stage || 0, orgNum: organic?.avg_stage || 0, higherBetter: true },
    { label: 'Avg REwired', aw5: aw5?.avg_rewired || 0, org: organic?.avg_rewired || 0, aw5Num: aw5?.avg_rewired || 0, orgNum: organic?.avg_rewired || 0, higherBetter: true },
    { label: 'Engagement (7d)', aw5: `${aw5?.engagement_rate || 0}%`, org: `${organic?.engagement_rate || 0}%`, aw5Num: aw5?.engagement_rate || 0, orgNum: organic?.engagement_rate || 0, higherBetter: true },
    { label: 'Churned', aw5: aw5?.churned_count || 0, org: organic?.churned_count || 0, aw5Num: aw5?.churned_count || 0, orgNum: organic?.churned_count || 0, higherBetter: false },
  ];

  return (
    <div className="bg-[#111111] border border-[#1a1a1a] rounded-lg p-6">
      <SectionHeader title="Cohort Comparison" />
      <div className="flex items-center justify-between mb-3 pb-2 border-b border-[#2a2a2a]">
        <span className="text-[10px] text-gray-500 uppercase">Metric</span>
        <div className="flex items-center gap-8">
          <span className="px-1.5 py-0.5 text-[9px] font-bold rounded bg-purple-500/20 text-purple-400">AW5 ({aw5?.user_count || 0})</span>
          <span className="px-1.5 py-0.5 text-[9px] font-bold rounded bg-[#ff9e19]/20 text-[#ff9e19]">ORG ({organic?.user_count || 0})</span>
        </div>
      </div>
      {rows.map(row => {
        const aw5Better = row.higherBetter ? row.aw5Num > row.orgNum : row.aw5Num < row.orgNum;
        const orgBetter = row.higherBetter ? row.orgNum > row.aw5Num : row.orgNum < row.aw5Num;
        return (
          <div key={row.label} className="flex items-center justify-between py-2 border-b border-[#1a1a1a] last:border-0">
            <span className="text-xs text-gray-400">{row.label}</span>
            <div className="flex items-center gap-8">
              <span className={`text-sm font-medium w-14 text-right ${aw5Better ? 'text-purple-400' : 'text-gray-400'}`}>{row.aw5}</span>
              <span className={`text-sm font-medium w-14 text-right ${orgBetter ? 'text-[#ff9e19]' : 'text-gray-400'}`}>{row.org}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ============================================
// TREND SPARKLINE (existing)
// ============================================
function TrendSparkline({ trends, userId }: { trends: UserTrendRow[] | null; userId: string }) {
  if (!trends) return <span className="text-gray-600 text-xs">—</span>;
  const userWeeks = trends.filter(t => t.user_id === userId).sort((a, b) => a.week_start.localeCompare(b.week_start));
  if (userWeeks.length === 0) return <span className="text-gray-600 text-xs">—</span>;
  const first = userWeeks[0]?.weekly_rate || 0;
  const last = userWeeks[userWeeks.length - 1]?.weekly_rate || 0;
  const trendDir = last - first;
  return (
    <div className="flex items-center gap-2">
      <div className="flex items-end gap-0.5 h-5">
        {userWeeks.map(week => (
          <div key={week.week_start} className={`w-2.5 rounded-sm ${week.weekly_rate >= 70 ? 'bg-emerald-500' : week.weekly_rate >= 40 ? 'bg-yellow-500' : week.weekly_rate > 0 ? 'bg-red-500' : 'bg-[#2a2a2a]'}`}
            style={{ height: `${Math.max((week.weekly_rate / 100) * 20, 2)}px` }}
            title={`${new Date(week.week_start).toLocaleDateString()}: ${week.weekly_rate}%`} />
        ))}
      </div>
      {trendDir > 5 && <TrendingUp className="w-3 h-3 text-emerald-500" />}
      {trendDir < -5 && <TrendingDown className="w-3 h-3 text-red-500" />}
      {trendDir >= -5 && trendDir <= 5 && <Minus className="w-3 h-3 text-gray-600" />}
    </div>
  );
}

// ============================================
// RECENT USERS TABLE (existing)
// ============================================
function RecentUsersTable({ users, trends }: { users: DashboardData['recentUsers']; trends: UserTrendRow[] | null }) {
  if (!users?.length) return null;
  return (
    <div className="bg-[#111111] border border-[#1a1a1a] rounded-lg overflow-hidden">
      <div className="p-6 border-b border-[#1a1a1a]">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">Recent Users</h3>
          <a href="/admin/users" className="text-sm text-[#ff9e19] hover:text-[#ffb347] flex items-center gap-1">View All <ChevronRight className="w-4 h-4" /></a>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-[#0a0a0a]">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">User</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Stage</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Adherence</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">4-Wk Trend</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">REwired</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Status</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Last Active</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1a1a1a]">
            {users.slice(0, 15).map(user => (
              <tr key={user.user_id} className="hover:bg-[#1a1a1a]/50 transition-colors">
                <td className="px-4 py-3 whitespace-nowrap">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-white">{user.first_name || 'Unknown'}</p>
                      {user.referral_source && user.referral_source !== 'organic' && (
                        <span className="px-1 py-0.5 text-[9px] font-semibold rounded bg-purple-500/20 text-purple-400 uppercase">AW5</span>
                      )}
                    </div>
                    <p className="text-[10px] text-gray-500">{user.email}</p>
                  </div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <span className="text-sm text-white">{user.current_stage}</span>
                  <span className="text-[10px] text-gray-500 ml-1">({user.days_in_stage}d)</span>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <div className="w-14 h-2 bg-[#1a1a1a] rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${user.adherence_percentage >= 80 ? 'bg-emerald-500' : user.adherence_percentage >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`}
                        style={{ width: `${user.adherence_percentage}%` }} />
                    </div>
                    <span className="text-xs text-gray-400">{user.adherence_percentage}%</span>
                  </div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap"><TrendSparkline trends={trends} userId={user.user_id} /></td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <span className="text-sm text-[#ff9e19] font-medium">{user.rewired_index?.toFixed(0) || '—'}</span>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs rounded-full ${user.is_paid ? 'bg-emerald-500/20 text-emerald-500' : 'bg-gray-500/20 text-gray-400'}`}>
                    {user.is_paid ? 'Paid' : 'Free'}
                  </span>
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-xs text-gray-400">
                  {user.last_active ? new Date(user.last_active).toLocaleDateString() : 'Never'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ============================================
// MAIN DASHBOARD PAGE
// ============================================
export default function AdminDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [selectedUser, setSelectedUser] = useState<UserAlert | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/admin/metrics');
      if (!response.ok) {
        if (response.status === 403) throw new Error('Access denied. Admin privileges required.');
        throw new Error('Failed to fetch dashboard data');
      }
      const dashboardData = await response.json();
      setData(dashboardData);
      setLastUpdated(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex flex-col items-center gap-4">
          <RefreshCw className="w-8 h-8 text-[#ff9e19] animate-spin" />
          <p className="text-gray-400">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex flex-col items-center gap-4 text-center">
          <AlertCircle className="w-12 h-12 text-red-500" />
          <p className="text-white font-medium">{error}</p>
          <button onClick={fetchData} className="px-4 py-2 bg-[#ff9e19] text-black rounded-lg hover:bg-[#ffb347] transition-colors">Try Again</button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Dashboard Overview</h2>
          {lastUpdated && (
            <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
              <Clock className="w-3 h-3" /> Updated: {lastUpdated.toLocaleTimeString()}
            </p>
          )}
        </div>
        <button onClick={fetchData} disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg text-white hover:bg-[#2a2a2a] transition-colors disabled:opacity-50">
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
        </button>
      </div>

      {/* ═══ ROW 1: ALERTS ═══ */}
      <NeedsAttentionPanel alerts={data?.userAlerts || null} onUserClick={setSelectedUser} />

      {/* Intervention Modal */}
      {selectedUser && (
        <InterventionModal 
          user={selectedUser} 
          onClose={() => setSelectedUser(null)} 
          onSent={(userId, action) => {
            console.log(`Intervention sent: ${action} → ${userId}`);
          }}
        />
      )}

      {/* ═══ ROW 2: TOP-LINE METRICS ═══ */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard title="Total Users" value={data?.overview?.total_users || 0} subtitle="All time" icon={Users} color="blue" />
        <MetricCard title="Paid Users" value={data?.overview?.paid_users || 0} subtitle={`${data?.overview?.conversion_rate || 0}% conversion`} icon={DollarSign} color="green" />
        <MetricCard title="Active (7d)" value={data?.activityMetrics?.active_7d || 0}
          subtitle={`${((data?.activityMetrics?.active_7d || 0) / (data?.overview?.total_users || 1) * 100).toFixed(0)}% of total`}
          icon={Activity} color="green" />
        <MetricCard title="Churned (14d+)" value={data?.activityMetrics?.churned_14d || 0}
          subtitle={`${((data?.activityMetrics?.churned_14d || 0) / (data?.overview?.total_users || 1) * 100).toFixed(0)}% of total`}
          icon={UserX} color="red" />
      </div>

      {/* ═══ ROW 3: REVENUE (compact) ═══ */}
      {data?.revenueMetrics && (data.revenueMetrics.active_subscriptions > 0 || data.revenueMetrics.in_trial > 0) && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <MetricCard title="Active Subs" value={data.revenueMetrics.active_subscriptions || 0} icon={DollarSign} color="green" />
          <MetricCard title="Monthly" value={data.revenueMetrics.monthly_subs || 0} icon={TrendingUp} color="blue" />
          <MetricCard title="Annual" value={data.revenueMetrics.annual_subs || 0} icon={TrendingUp} color="orange" />
          <MetricCard title="In Trial" value={data.revenueMetrics.in_trial || 0} icon={Clock} color="blue" />
          <MetricCard title="Pending Cancel" value={data.revenueMetrics.pending_cancellations || 0} icon={AlertCircle} color="red" />
        </div>
      )}

      {/* ═══ ROW 4: BASELINE + TRANSFORMATION + STAGE DISTRIBUTION ═══ */}
      <BaselinePanel data={data?.baselineCompletion || null} />
      <TransformationTracker snapshot={data?.transformationSnapshot || null} weekly={data?.transformationWeekly || null} />
      
      {/* ═══ CLINICAL ASSESSMENTS ═══ */}
      <AdminClinicalPanel />
      
      {data?.stageDistribution && <StageDistributionBar data={data.stageDistribution} />}

      {/* ═══ ROW 5: STAGE 1 DEEP DIVE ═══ */}
      <div className="border-l-4 border-[#ff9e19] pl-4">
        <h2 className="text-lg font-bold text-white mb-1">Stage 1 Deep Dive</h2>
        <p className="text-xs text-gray-500 mb-4">The critical first 14 days — where decisions live</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SurvivalCurve data={data?.stage1Survival || null} />
        <SignalCheckTrends data={data?.signalCheckTrends || null} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <EnhancementDelivery data={data?.enhancementDelivery || null} />
        <TimeToUnlock data={data?.timeToUnlock || null} />
      </div>

      {/* ═══ ROW 6: ENGAGEMENT DEPTH ═══ */}
      <EngagementDepth data={data?.engagementSummary || null} checkins={data?.weeklyCheckinStats || null} />

      {/* ═══ ROW 7: PRACTICE + TOOLS + JOURNAL ═══ */}
      <PracticeHeatmap data={data?.practiceCompletion || null} summary={data?.practiceSummary || null} />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ToolUsagePanel data={data?.toolUsage || null} />
        <JournalStatsPanel data={data?.journalStats || null} />
      </div>

      {/* ═══ ROW 8: FUNNEL + COHORTS ═══ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {data?.funnelMetrics && <ConversionFunnel data={data.funnelMetrics} />}
        <CohortComparison data={data?.cohortMetrics || null} />
      </div>

      {/* ═══ ROW 9: USERS TABLE ═══ */}
      {data?.recentUsers && <RecentUsersTable users={data.recentUsers} trends={data?.userTrends || null} />}
    </div>
  );
}
