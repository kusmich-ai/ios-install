// app/admin/page.tsx
'use client';

import { useEffect, useState, useCallback } from 'react';
import { 
  Users, 
  TrendingUp, 
  DollarSign, 
  Activity,
  RefreshCw,
  ChevronRight,
  AlertCircle,
  CheckCircle2,
  Clock,
  UserX
} from 'lucide-react';

// ============================================
// TYPE DEFINITIONS
// ============================================
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
}

// ============================================
// STAGE NAMES MAPPING
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

// ============================================
// METRIC CARD COMPONENT
// ============================================
function MetricCard({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  trend,
  color = 'orange'
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
          {subtitle && (
            <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
          )}
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
// STAGE DISTRIBUTION BAR
// ============================================
function StageDistributionBar({ data }: { data: DashboardData['stageDistribution'] }) {
  const colors = [
    'bg-blue-500',
    'bg-cyan-500', 
    'bg-emerald-500',
    'bg-yellow-500',
    'bg-orange-500',
    'bg-red-500',
    'bg-purple-500'
  ];

  const total = data?.reduce((sum, item) => sum + item.user_count, 0) || 0;

  return (
    <div className="bg-[#111111] border border-[#1a1a1a] rounded-lg p-6">
      <h3 className="text-lg font-semibold text-white mb-4">Stage Distribution</h3>
      
      {/* Stacked bar */}
      <div className="h-8 rounded-full overflow-hidden flex bg-[#1a1a1a] mb-4">
        {data?.map((stage, index) => (
          <div
            key={stage.current_stage}
            className={`${colors[index]} transition-all duration-300`}
            style={{ width: `${stage.percentage}%` }}
            title={`Stage ${stage.current_stage}: ${stage.user_count} users (${stage.percentage}%)`}
          />
        ))}
      </div>

      {/* Legend */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        {data?.map((stage, index) => (
          <div key={stage.current_stage} className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${colors[index]}`} />
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
        {stages.map((stage, index) => (
          <div key={stage.label} className="flex items-center gap-4">
            <div className="w-24 text-sm text-gray-400">{stage.label}</div>
            <div className="flex-1 h-8 bg-[#1a1a1a] rounded-full overflow-hidden relative">
              <div 
                className="h-full bg-gradient-to-r from-[#ff9e19] to-[#ffb347] transition-all duration-500"
                style={{ width: `${(stage.count / (data.started || 1)) * 100}%` }}
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xs font-medium text-white">
                  {stage.count} users
                </span>
              </div>
            </div>
            <div className="w-16 text-right">
              <span className={`text-sm font-medium ${stage.rate >= 50 ? 'text-emerald-500' : stage.rate >= 25 ? 'text-yellow-500' : 'text-red-500'}`}>
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
    { 
      label: 'Active (7d)', 
      value: data.active_7d, 
      icon: CheckCircle2,
      color: 'text-emerald-500',
      bgColor: 'bg-emerald-500/10'
    },
    { 
      label: 'Active (30d)', 
      value: data.active_30d, 
      icon: Activity,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10'
    },
    { 
      label: 'Churned (14d+)', 
      value: data.churned_14d, 
      icon: UserX,
      color: 'text-red-500',
      bgColor: 'bg-red-500/10'
    },
  ];

  return (
    <div className="bg-[#111111] border border-[#1a1a1a] rounded-lg p-6">
      <h3 className="text-lg font-semibold text-white mb-4">User Activity</h3>
      <div className="grid grid-cols-3 gap-4">
        {metrics.map((metric) => (
          <div key={metric.label} className="text-center">
            <div className={`inline-flex p-3 rounded-lg ${metric.bgColor} mb-2`}>
              <metric.icon className={`w-5 h-5 ${metric.color}`} />
            </div>
            <p className="text-2xl font-bold text-white">{metric.value}</p>
            <p className="text-xs text-gray-400">{metric.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================
// RECENT USERS TABLE
// ============================================
function RecentUsersTable({ users }: { users: DashboardData['recentUsers'] }) {
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
          <a 
            href="/admin/users" 
            className="text-sm text-[#ff9e19] hover:text-[#ffb347] flex items-center gap-1"
          >
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
                    <p className="text-sm font-medium text-white">{user.first_name || 'Unknown'}</p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-white">{user.current_stage}</span>
                    <span className="text-xs text-gray-500">
                      ({user.days_in_stage}d)
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-2 bg-[#1a1a1a] rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${
                          user.adherence_percentage >= 80 ? 'bg-emerald-500' : 
                          user.adherence_percentage >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${user.adherence_percentage}%` }}
                      />
                    </div>
                    <span className="text-sm text-gray-400">{user.adherence_percentage}%</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm text-[#ff9e19] font-medium">
                    {user.rewired_index?.toFixed(0) || 'N/A'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    user.is_paid 
                      ? 'bg-emerald-500/20 text-emerald-500' 
                      : 'bg-gray-500/20 text-gray-400'
                  }`}>
                    {user.is_paid ? 'Paid' : 'Free'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                  {user.last_active 
                    ? new Date(user.last_active).toLocaleDateString()
                    : 'Never'
                  }
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
        if (response.status === 403) {
          throw new Error('Access denied. Admin privileges required.');
        }
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

  useEffect(() => {
    fetchData();
  }, [fetchData]);

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
          <button
            onClick={fetchData}
            className="px-4 py-2 bg-[#ff9e19] text-black rounded-lg hover:bg-[#ffb347] transition-colors"
          >
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
        <button
          onClick={fetchData}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg text-white hover:bg-[#2a2a2a] transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Top Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Users"
          value={data?.overview?.total_users || 0}
          subtitle="All time signups"
          icon={Users}
          color="blue"
        />
        <MetricCard
          title="Paid Users"
          value={data?.overview?.paid_users || 0}
          subtitle={`${data?.overview?.conversion_rate || 0}% conversion`}
          icon={DollarSign}
          color="green"
        />
        <MetricCard
          title="Free Users"
          value={data?.overview?.free_users || 0}
          subtitle="Stage 1 (free tier)"
          icon={Users}
          color="orange"
        />
        <MetricCard
          title="Active (7d)"
          value={data?.activityMetrics?.active_7d || 0}
          subtitle={`${((data?.activityMetrics?.active_7d || 0) / (data?.overview?.total_users || 1) * 100).toFixed(0)}% of total`}
          icon={Activity}
          color="green"
        />
      </div>

      {/* Revenue Metrics */}
      {data?.revenueMetrics && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <MetricCard
            title="Active Subs"
            value={data.revenueMetrics.active_subscriptions || 0}
            icon={DollarSign}
            color="green"
          />
          <MetricCard
            title="Monthly"
            value={data.revenueMetrics.monthly_subs || 0}
            icon={TrendingUp}
            color="blue"
          />
          <MetricCard
            title="Annual"
            value={data.revenueMetrics.annual_subs || 0}
            icon={TrendingUp}
            color="orange"
          />
          <MetricCard
            title="In Trial"
            value={data.revenueMetrics.in_trial || 0}
            icon={Clock}
            color="blue"
          />
          <MetricCard
            title="Pending Cancel"
            value={data.revenueMetrics.pending_cancellations || 0}
            icon={AlertCircle}
            color="red"
          />
        </div>
      )}

      {/* Stage Distribution */}
      {data?.stageDistribution && (
        <StageDistributionBar data={data.stageDistribution} />
      )}

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Funnel */}
        {data?.funnelMetrics && (
          <ConversionFunnel data={data.funnelMetrics} />
        )}

        {/* Activity */}
        {data?.activityMetrics && (
          <ActivityBreakdown data={data.activityMetrics} />
        )}
      </div>

      {/* Recent Users Table */}
      {data?.recentUsers && (
        <RecentUsersTable users={data.recentUsers} />
      )}
    </div>
  );
}
