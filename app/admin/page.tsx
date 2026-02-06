// app/admin/page.tsx
'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { 
  Users, 
  TrendingUp, 
  TrendingDown,
  DollarSign, 
  Activity,
  RefreshCw,
  ChevronRight,
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Clock,
  UserX,
  Zap,
  Minus
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
  dailySignups: Array<{
    signup_date: string;
    signups: number;
  }>;
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
  // NEW data
  userAlerts: UserAlert[] | null;
  practiceCompletion: PracticeRow[] | null;
  practiceSummary: PracticeSummaryRow[] | null;
  cohortMetrics: CohortRow[] | null;
  userTrends: UserTrendRow[] | null;
}

// ============================================
// CONSTANTS
// ============================================
const STAGE_NAMES: { [key: number]: string } = {
  1: 'Neural Priming',
  2: 'Embodied Awareness',
  3: 'Identity Mode',
  4: 'Flow Mode',
  5: 'Relational Coherence',
  6: 'Integration',
  7: 'Accelerated Expansion'
};

const PRACTICE_LABELS: { [key: string]: string } = {
  'hrvb_breathing': 'HRVB Breathing',
  'awareness_rep': 'Awareness Rep',
  'somatic_flow': 'Somatic Flow',
  'micro_action': 'Micro-Action',
  'flow_block': 'Flow Block',
  'co_regulation': 'Co-Regulation',
  'nightly_debrief': 'Nightly Debrief',
  'thought_hygiene': 'Thought Hygiene',
  'decentering': 'Decentering',
  'meta_reflection': 'Meta-Reflection',
  'reframe': 'Reframe Protocol',
};

// ============================================
// METRIC CARD
// ============================================
function MetricCard({ 
  title, value, subtitle, icon: Icon, trend, color = 'orange'
}: { 
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ElementType;
  trend?: { value: number; label: string };
  color?: 'orange' | 'green' | 'blue' | 'red';
}) {
  const colorClasses = {
    orange: 'text-[#ff9e19] bg-[#ff9e19]/10',
    green: 'text-emerald-500 bg-emerald-500/10',
    blue: 'text-blue-500 bg-blue-500/10',
    red: 'text-red-500 bg-red-500/10'
  };
  return (
    <div className="bg-[#111111] border border-[#1a1a1a] rounded-lg p-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-400 mb-1">{title}</p>
          <p className="text-3xl font-bold text-white">{value}</p>
          {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
          {trend && (
            <p className={`text-sm mt-2 ${trend.value >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
              {trend.value >= 0 ? '↑' : '↓'} {Math.abs(trend.value)}% {trend.label}
            </p>
          )}
        </div>
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
}

// ============================================
// NEEDS ATTENTION PANEL (NEW)
// ============================================
function NeedsAttentionPanel({ alerts }: { alerts: UserAlert[] | null }) {
  if (!alerts || alerts.length === 0) {
    return (
      <div className="bg-[#111111] border border-[#1a1a1a] rounded-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <CheckCircle2 className="w-5 h-5 text-emerald-500" />
          <h3 className="text-lg font-semibold text-white">Needs Attention</h3>
        </div>
        <div className="text-center py-4">
          <p className="text-gray-400 text-sm">All users are on track. Nothing requires your attention right now.</p>
        </div>
      </div>
    );
  }

  const atRisk = alerts.filter(a => a.alert_type === 'at_risk');
  const stalling = alerts.filter(a => a.alert_type === 'stalling');
  const ready = alerts.filter(a => a.alert_type === 'ready_to_unlock');

  const AlertCard = ({ 
    user, borderColor, textColor, bgColor 
  }: { 
    user: UserAlert; borderColor: string; textColor: string; bgColor: string;
  }) => (
    <div className={`${bgColor} border ${borderColor} rounded-lg p-3`}>
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-white">{user.first_name}</span>
          {user.referral_source !== 'organic' && (
            <span className="px-1 py-0.5 text-[9px] font-semibold rounded bg-purple-500/20 text-purple-400 uppercase">
              AW5
            </span>
          )}
        </div>
        <span className="text-[10px] text-gray-500">Stage {user.current_stage}</span>
      </div>
      <p className={`text-xs ${textColor}`}>{user.alert_reason}</p>
      {user.adherence_trend !== 0 && (
        <div className="flex items-center gap-1 mt-1.5">
          {user.adherence_trend < 0 ? (
            <TrendingDown className="w-3 h-3 text-red-500" />
          ) : (
            <TrendingUp className="w-3 h-3 text-emerald-500" />
          )}
          <span className={`text-[10px] ${user.adherence_trend < 0 ? 'text-red-400' : 'text-emerald-400'}`}>
            {user.adherence_trend > 0 ? '+' : ''}{user.adherence_trend}% week-over-week
          </span>
        </div>
      )}
    </div>
  );

  return (
    <div className="bg-[#111111] border border-[#1a1a1a] rounded-lg p-6">
      <h3 className="text-lg font-semibold text-white mb-4">Needs Attention</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* At Risk Column */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <AlertCircle className="w-4 h-4 text-red-500" />
            <span className="text-sm font-medium text-red-500">At Risk ({atRisk.length})</span>
          </div>
          {atRisk.length === 0 ? (
            <p className="text-xs text-gray-600 italic">None</p>
          ) : (
            <div className="space-y-2">
              {atRisk.map(user => (
                <AlertCard 
                  key={user.user_id} user={user}
                  borderColor="border-red-500/20" textColor="text-red-400" bgColor="bg-red-500/5"
                />
              ))}
            </div>
          )}
        </div>

        {/* Stalling Column */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-4 h-4 text-yellow-500" />
            <span className="text-sm font-medium text-yellow-500">Stalling ({stalling.length})</span>
          </div>
          {stalling.length === 0 ? (
            <p className="text-xs text-gray-600 italic">None</p>
          ) : (
            <div className="space-y-2">
              {stalling.map(user => (
                <AlertCard 
                  key={user.user_id} user={user}
                  borderColor="border-yellow-500/20" textColor="text-yellow-400" bgColor="bg-yellow-500/5"
                />
              ))}
            </div>
          )}
        </div>

        {/* Ready to Unlock Column */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Zap className="w-4 h-4 text-emerald-500" />
            <span className="text-sm font-medium text-emerald-500">Ready to Unlock ({ready.length})</span>
          </div>
          {ready.length === 0 ? (
            <p className="text-xs text-gray-600 italic">None</p>
          ) : (
            <div className="space-y-2">
              {ready.map(user => (
                <AlertCard 
                  key={user.user_id} user={user}
                  borderColor="border-emerald-500/20" textColor="text-emerald-400" bgColor="bg-emerald-500/5"
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================
// PRACTICE HEATMAP (NEW)
// ============================================
function PracticeHeatmap({ 
  data, summary 
}: { 
  data: PracticeRow[] | null; 
  summary: PracticeSummaryRow[] | null;
}) {
  if ((!data || data.length === 0) && (!summary || summary.length === 0)) {
    return (
      <div className="bg-[#111111] border border-[#1a1a1a] rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-3">Practice Completion (Last 7 Days)</h3>
        <p className="text-sm text-gray-500 text-center py-6">No practice data yet</p>
      </div>
    );
  }

  // Get unique practices and dates from heatmap data
  const practiceTypes = [...new Set((data || []).map(d => d.practice_type))].sort();
  const dates = [...new Set((data || []).map(d => d.practice_date))].sort();

  // Build lookup
  const lookup: { [key: string]: PracticeRow } = {};
  (data || []).forEach(row => {
    lookup[`${row.practice_type}|${row.practice_date}`] = row;
  });

  // Summary lookup
  const summaryLookup: { [key: string]: PracticeSummaryRow } = {};
  (summary || []).forEach(row => {
    summaryLookup[row.practice_type] = row;
  });

  // All practice types from both sources
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
      <h3 className="text-lg font-semibold text-white mb-4">Practice Completion (Last 7 Days)</h3>
      
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
                    <td className="text-xs text-gray-300 py-1.5 pr-4 whitespace-nowrap">
                      {PRACTICE_LABELS[practice] || practice.replace(/_/g, ' ')}
                    </td>
                    {dates.map(date => {
                      const row = lookup[`${practice}|${date}`];
                      return (
                        <td key={date} className="py-1.5 px-1">
                          <div 
                            className={`w-full h-7 rounded ${rateColor(row?.completion_rate)} flex items-center justify-center`}
                            title={row ? `${row.completion_rate}% (${row.completed_count}/${row.total_logged})` : 'No data'}
                          >
                            {row && (
                              <span className="text-[9px] font-medium text-white/80">
                                {row.completed_count}/{row.total_logged}
                              </span>
                            )}
                          </div>
                        </td>
                      );
                    })}
                    <td className="text-right pl-4">
                      <span className={`text-xs font-medium ${
                        (sumRow?.overall_rate || 0) >= 70 ? 'text-emerald-500' : 
                        (sumRow?.overall_rate || 0) >= 40 ? 'text-yellow-500' : 'text-red-500'
                      }`}>
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
        // Fallback: just show summary bars if no daily data
        <div className="space-y-3">
          {(summary || []).map(row => (
            <div key={row.practice_type} className="flex items-center gap-3">
              <span className="text-xs text-gray-300 w-32 shrink-0">
                {PRACTICE_LABELS[row.practice_type] || row.practice_type}
              </span>
              <div className="flex-1 h-5 bg-[#1a1a1a] rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full ${rateColor(row.overall_rate)}`}
                  style={{ width: `${row.overall_rate}%` }}
                />
              </div>
              <span className={`text-xs font-medium w-10 text-right ${
                row.overall_rate >= 70 ? 'text-emerald-500' : 
                row.overall_rate >= 40 ? 'text-yellow-500' : 'text-red-500'
              }`}>
                {row.overall_rate}%
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Legend */}
      <div className="flex items-center gap-3 mt-4 pt-3 border-t border-[#1a1a1a]">
        <span className="text-[10px] text-gray-500">Completion:</span>
        {[
          { color: 'bg-red-500/20', label: '0%' },
          { color: 'bg-red-500/40', label: '1-39%' },
          { color: 'bg-yellow-500/60', label: '40-59%' },
          { color: 'bg-emerald-500/60', label: '60-79%' },
          { color: 'bg-emerald-500', label: '80%+' },
        ].map(item => (
          <div key={item.label} className="flex items-center gap-1">
            <div className={`w-3 h-3 rounded ${item.color}`} />
            <span className="text-[10px] text-gray-500">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================
// COHORT COMPARISON (NEW)
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
    { label: 'Avg Streak', aw5: `${aw5?.avg_streak || 0}d`, org: `${organic?.avg_streak || 0}d`, aw5Num: aw5?.avg_streak || 0, orgNum: organic?.avg_streak || 0, higherBetter: true },
    { label: 'Engagement (7d)', aw5: `${aw5?.engagement_rate || 0}%`, org: `${organic?.engagement_rate || 0}%`, aw5Num: aw5?.engagement_rate || 0, orgNum: organic?.engagement_rate || 0, higherBetter: true },
    { label: 'Churned (14d+)', aw5: aw5?.churned_count || 0, org: organic?.churned_count || 0, aw5Num: aw5?.churned_count || 0, orgNum: organic?.churned_count || 0, higherBetter: false },
  ];

  return (
    <div className="bg-[#111111] border border-[#1a1a1a] rounded-lg p-6">
      <h3 className="text-lg font-semibold text-white mb-4">Cohort Comparison</h3>
      
      {/* Column headers */}
      <div className="flex items-center justify-between mb-3 pb-2 border-b border-[#2a2a2a]">
        <span className="text-[10px] text-gray-500 uppercase tracking-wider">Metric</span>
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-1.5 w-16 justify-end">
            <span className="px-1.5 py-0.5 text-[9px] font-bold rounded bg-purple-500/20 text-purple-400 border border-purple-500/30">AW5</span>
            <span className="text-[10px] text-gray-600">({aw5?.user_count || 0})</span>
          </div>
          <div className="flex items-center gap-1.5 w-16 justify-end">
            <span className="px-1.5 py-0.5 text-[9px] font-bold rounded bg-[#ff9e19]/20 text-[#ff9e19] border border-[#ff9e19]/30">ORG</span>
            <span className="text-[10px] text-gray-600">({organic?.user_count || 0})</span>
          </div>
        </div>
      </div>

      {/* Rows */}
      <div className="space-y-0">
        {rows.map(row => {
          const aw5Better = row.higherBetter ? row.aw5Num > row.orgNum : row.aw5Num < row.orgNum;
          const orgBetter = row.higherBetter ? row.orgNum > row.aw5Num : row.orgNum < row.aw5Num;
          return (
            <div key={row.label} className="flex items-center justify-between py-2.5 border-b border-[#1a1a1a] last:border-0">
              <span className="text-xs text-gray-400">{row.label}</span>
              <div className="flex items-center gap-8">
                <span className={`text-sm font-medium w-16 text-right ${aw5Better ? 'text-purple-400' : 'text-gray-400'}`}>
                  {row.aw5}
                </span>
                <span className={`text-sm font-medium w-16 text-right ${orgBetter ? 'text-[#ff9e19]' : 'text-gray-400'}`}>
                  {row.org}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ============================================
// TREND SPARKLINE (NEW - inline for user table)
// ============================================
function TrendSparkline({ trends, userId }: { trends: UserTrendRow[] | null; userId: string }) {
  if (!trends) return <span className="text-gray-600 text-xs">—</span>;

  const userWeeks = trends
    .filter(t => t.user_id === userId)
    .sort((a, b) => a.week_start.localeCompare(b.week_start));

  if (userWeeks.length === 0) return <span className="text-gray-600 text-xs">—</span>;

  // Calculate overall trend direction
  const first = userWeeks[0]?.weekly_rate || 0;
  const last = userWeeks[userWeeks.length - 1]?.weekly_rate || 0;
  const trendDir = last - first;

  return (
    <div className="flex items-center gap-2">
      {/* Mini bar chart */}
      <div className="flex items-end gap-0.5 h-5">
        {userWeeks.map((week) => (
          <div
            key={week.week_start}
            className={`w-2.5 rounded-sm transition-all ${
              week.weekly_rate >= 70 ? 'bg-emerald-500' :
              week.weekly_rate >= 40 ? 'bg-yellow-500' :
              week.weekly_rate > 0 ? 'bg-red-500' : 'bg-[#2a2a2a]'
            }`}
            style={{ height: `${Math.max((week.weekly_rate / 100) * 20, 2)}px` }}
            title={`${new Date(week.week_start).toLocaleDateString()}: ${week.weekly_rate}%`}
          />
        ))}
      </div>
      {/* Trend arrow */}
      {trendDir > 5 && <TrendingUp className="w-3 h-3 text-emerald-500" />}
      {trendDir < -5 && <TrendingDown className="w-3 h-3 text-red-500" />}
      {trendDir >= -5 && trendDir <= 5 && <Minus className="w-3 h-3 text-gray-600" />}
    </div>
  );
}

// ============================================
// STAGE DISTRIBUTION BAR
// ============================================
function StageDistributionBar({ data }: { data: DashboardData['stageDistribution'] }) {
  const colors = [
    'bg-blue-500', 'bg-cyan-500', 'bg-emerald-500', 'bg-yellow-500',
    'bg-orange-500', 'bg-red-500', 'bg-purple-500'
  ];
  return (
    <div className="bg-[#111111] border border-[#1a1a1a] rounded-lg p-6">
      <h3 className="text-lg font-semibold text-white mb-4">Stage Distribution</h3>
      <div className="h-8 rounded-full overflow-hidden flex bg-[#1a1a1a] mb-4">
        {data?.map((stage, i) => (
          <div key={stage.current_stage} className={`${colors[i]} transition-all duration-300`}
            style={{ width: `${stage.percentage}%` }}
            title={`Stage ${stage.current_stage}: ${stage.user_count} (${stage.percentage}%)`}
          />
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
// CONVERSION FUNNEL
// ============================================
function ConversionFunnel({ data }: { data: DashboardData['funnelMetrics'] }) {
  if (!data) return null;
  const stages = [
    { label: 'Total Users', count: data.started, rate: 100 },
    { label: 'Stage 1', count: data.completed_stage_1, rate: data.rate_1_to_2 },
    { label: 'Stage 2', count: data.completed_stage_2, rate: data.rate_2_to_3 },
    { label: 'Stage 3', count: data.completed_stage_3, rate: data.rate_3_to_4 },
    { label: 'Stage 4', count: data.completed_stage_4, rate: data.rate_4_to_5 },
    { label: 'Stage 5', count: data.completed_stage_5, rate: data.rate_5_to_6 },
    { label: 'Stage 6', count: data.completed_stage_6, rate: data.rate_6_to_7 },
  ];
  return (
    <div className="bg-[#111111] border border-[#1a1a1a] rounded-lg p-6">
      <h3 className="text-lg font-semibold text-white mb-4">Current Stage Distribution</h3>
      <div className="space-y-3">
        {stages.map((stage) => (
          <div key={stage.label} className="flex items-center gap-4">
            <div className="w-24 text-sm text-gray-400">{stage.label}</div>
            <div className="flex-1 h-8 bg-[#1a1a1a] rounded-full overflow-hidden relative">
              <div className="h-full bg-gradient-to-r from-[#ff9e19] to-[#ffb347] transition-all duration-500"
                style={{ width: `${(stage.count / (data.started || 1)) * 100}%` }} />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xs font-medium text-white">{stage.count} users</span>
              </div>
            </div>
            <div className="w-16 text-right">
              <span className={`text-sm font-medium ${
                stage.rate >= 50 ? 'text-emerald-500' : stage.rate >= 25 ? 'text-yellow-500' : 'text-red-500'
              }`}>
                {stage.rate?.toFixed(0) || 0}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================
// ACTIVITY BREAKDOWN
// ============================================
function ActivityBreakdown({ data }: { data: DashboardData['activityMetrics'] }) {
  if (!data) return null;
  const metrics = [
    { label: 'Active (7d)', value: data.active_7d, icon: CheckCircle2, color: 'text-emerald-500', bgColor: 'bg-emerald-500/10' },
    { label: 'Active (30d)', value: data.active_30d, icon: Activity, color: 'text-blue-500', bgColor: 'bg-blue-500/10' },
    { label: 'Churned (14d+)', value: data.churned_14d, icon: UserX, color: 'text-red-500', bgColor: 'bg-red-500/10' },
  ];
  return (
    <div className="bg-[#111111] border border-[#1a1a1a] rounded-lg p-6">
      <h3 className="text-lg font-semibold text-white mb-4">User Activity</h3>
      <div className="grid grid-cols-3 gap-4">
        {metrics.map((m) => (
          <div key={m.label} className="text-center">
            <div className={`inline-flex p-3 rounded-lg ${m.bgColor} mb-2`}>
              <m.icon className={`w-5 h-5 ${m.color}`} />
            </div>
            <p className="text-2xl font-bold text-white">{m.value}</p>
            <p className="text-xs text-gray-400">{m.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================
// RECENT USERS TABLE (Updated with sparklines)
// ============================================
function RecentUsersTable({ users, trends }: { users: DashboardData['recentUsers']; trends: UserTrendRow[] | null }) {
  if (!users?.length) {
    return (
      <div className="bg-[#111111] border border-[#1a1a1a] rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Recent Users</h3>
        <p className="text-gray-400">No users found.</p>
      </div>
    );
  }
  return (
    <div className="bg-[#111111] border border-[#1a1a1a] rounded-lg overflow-hidden">
      <div className="p-6 border-b border-[#1a1a1a]">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">Recent Users</h3>
          <a href="/admin/users" className="text-sm text-[#ff9e19] hover:text-[#ffb347] flex items-center gap-1">
            View All <ChevronRight className="w-4 h-4" />
          </a>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-[#0a0a0a]">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">User</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Stage</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Adherence</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">4-Wk Trend</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">REwired</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Last Active</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1a1a1a]">
            {users.slice(0, 10).map((user) => (
              <tr key={user.user_id} className="hover:bg-[#1a1a1a]/50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-white">{user.first_name || 'Unknown'}</p>
                      {user.referral_source && user.referral_source !== 'organic' && (
                        <span className="px-1.5 py-0.5 text-[10px] font-semibold rounded bg-purple-500/20 text-purple-400 border border-purple-500/30 uppercase">
                          {user.referral_source === 'awaken5' ? 'AW5' : user.referral_source}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500">{user.email}</p>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-white">{user.current_stage}</span>
                    <span className="text-xs text-gray-500">({user.days_in_stage}d)</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-2 bg-[#1a1a1a] rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${
                        user.adherence_percentage >= 80 ? 'bg-emerald-500' : 
                        user.adherence_percentage >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                      }`} style={{ width: `${user.adherence_percentage}%` }} />
                    </div>
                    <span className="text-sm text-gray-400">{user.adherence_percentage}%</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <TrendSparkline trends={trends} userId={user.user_id} />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm text-[#ff9e19] font-medium">
                    {user.rewired_index?.toFixed(0) || 'N/A'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    user.is_paid ? 'bg-emerald-500/20 text-emerald-500' : 'bg-gray-500/20 text-gray-400'
                  }`}>
                    {user.is_paid ? 'Paid' : 'Free'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
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
          <button onClick={fetchData} className="px-4 py-2 bg-[#ff9e19] text-black rounded-lg hover:bg-[#ffb347] transition-colors">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Dashboard Overview</h2>
          {lastUpdated && (
            <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
              <Clock className="w-3 h-3" />
              Last updated: {lastUpdated.toLocaleTimeString()}
            </p>
          )}
        </div>
        <button onClick={fetchData} disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg text-white hover:bg-[#2a2a2a] transition-colors disabled:opacity-50">
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* ★ NEEDS ATTENTION - First thing you see */}
      <NeedsAttentionPanel alerts={data?.userAlerts || null} />

      {/* Top Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard title="Total Users" value={data?.overview?.total_users || 0} subtitle="All time signups" icon={Users} color="blue" />
        <MetricCard title="Paid Users" value={data?.overview?.paid_users || 0} subtitle={`${data?.overview?.conversion_rate || 0}% conversion`} icon={DollarSign} color="green" />
        <MetricCard title="Free Users" value={data?.overview?.free_users || 0} subtitle="Stage 1 (free tier)" icon={Users} color="orange" />
        <MetricCard title="Active (7d)" value={data?.activityMetrics?.active_7d || 0}
          subtitle={`${((data?.activityMetrics?.active_7d || 0) / (data?.overview?.total_users || 1) * 100).toFixed(0)}% of total`}
          icon={Activity} color="green" />
      </div>

      {/* Revenue Metrics */}
      {data?.revenueMetrics && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <MetricCard title="Active Subs" value={data.revenueMetrics.active_subscriptions || 0} icon={DollarSign} color="green" />
          <MetricCard title="Monthly" value={data.revenueMetrics.monthly_subs || 0} icon={TrendingUp} color="blue" />
          <MetricCard title="Annual" value={data.revenueMetrics.annual_subs || 0} icon={TrendingUp} color="orange" />
          <MetricCard title="In Trial" value={data.revenueMetrics.in_trial || 0} icon={Clock} color="blue" />
          <MetricCard title="Pending Cancel" value={data.revenueMetrics.pending_cancellations || 0} icon={AlertCircle} color="red" />
        </div>
      )}

      {/* Stage Distribution */}
      {data?.stageDistribution && <StageDistributionBar data={data.stageDistribution} />}

      {/* ★ PRACTICE HEATMAP - Full width */}
      <PracticeHeatmap data={data?.practiceCompletion || null} summary={data?.practiceSummary || null} />

      {/* Three Column: Funnel + Activity + Cohort */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {data?.funnelMetrics && <ConversionFunnel data={data.funnelMetrics} />}
        {data?.activityMetrics && <ActivityBreakdown data={data.activityMetrics} />}
        <CohortComparison data={data?.cohortMetrics || null} />
      </div>

      {/* Recent Users Table with Sparklines */}
      {data?.recentUsers && (
        <RecentUsersTable users={data.recentUsers} trends={data?.userTrends || null} />
      )}
    </div>
  );
}
