// app/admin/users/page.tsx
'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  RefreshCw,
  ChevronDown,
  ChevronUp,
  ArrowUpDown,
  X,
  Eye,
  Edit2
} from 'lucide-react';

// ============================================
// TYPE DEFINITIONS
// ============================================
interface User {
  user_id: string;
  first_name: string;
  email: string;
  referral_source: string;
  current_stage: number;
  stage_start_date: string;
  adherence_percentage: number;
  consecutive_days: number;
  rewired_index: number;
  is_paid: boolean;
  subscription_status: string;
  plan_id: string;
  joined_at: string;
  last_active: string;
  days_in_stage: number;
}

interface UserDetails {
  progress: any;
  recentPractices: any[];
  weeklyDeltas: any[];
  baseline: any;
}

type SortField = 'first_name' | 'current_stage' | 'adherence_percentage' | 'rewired_index' | 'joined_at' | 'last_active';
type SortDirection = 'asc' | 'desc';

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
// USER DETAIL MODAL
// ============================================
function UserDetailModal({ 
  user, 
  onClose 
}: { 
  user: User; 
  onClose: () => void;
}) {
  const [details, setDetails] = useState<UserDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const response = await fetch('/api/admin/metrics', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            userId: user.user_id, 
            action: 'getUserDetails' 
          })
        });
        const data = await response.json();
        setDetails(data);
      } catch (err) {
        console.error('Failed to fetch user details:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [user.user_id]);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#111111] border border-[#1a1a1a] rounded-xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#1a1a1a]">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-bold text-white">{user.first_name || 'Unknown User'}</h3>
              {user.referral_source && user.referral_source !== 'organic' && (
                <span className="px-1.5 py-0.5 text-[10px] font-semibold rounded bg-purple-500/20 text-purple-400 border border-purple-500/30 uppercase">
                  {user.referral_source === 'awaken5' ? 'AW5' : user.referral_source}
                </span>
              )}
            </div>
            <p className="text-sm text-gray-400">{user.email}</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-[#1a1a1a] rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(80vh-80px)]">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="w-6 h-6 text-[#ff9e19] animate-spin" />
            </div>
          ) : (
            <div className="space-y-6">
              {/* Quick Stats */}
              <div className="grid grid-cols-4 gap-4">
                <div className="bg-[#0a0a0a] rounded-lg p-4 text-center">
                  <p className="text-2xl font-bold text-white">{user.current_stage}</p>
                  <p className="text-xs text-gray-400">Stage</p>
                </div>
                <div className="bg-[#0a0a0a] rounded-lg p-4 text-center">
                  <p className="text-2xl font-bold text-[#ff9e19]">{user.adherence_percentage}%</p>
                  <p className="text-xs text-gray-400">Adherence</p>
                </div>
                <div className="bg-[#0a0a0a] rounded-lg p-4 text-center">
                  <p className="text-2xl font-bold text-white">{user.consecutive_days}</p>
                  <p className="text-xs text-gray-400">Day Streak</p>
                </div>
                <div className="bg-[#0a0a0a] rounded-lg p-4 text-center">
                  <p className="text-2xl font-bold text-emerald-500">{user.rewired_index?.toFixed(0) || 'N/A'}</p>
                  <p className="text-xs text-gray-400">REwired</p>
                </div>
              </div>

              {/* Subscription & Source */}
              <div className="bg-[#0a0a0a] rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-400 mb-2">Subscription & Source</h4>
                <div className="flex items-center gap-4">
                  <span className={`px-3 py-1 rounded-full text-sm ${
                    user.is_paid 
                      ? 'bg-emerald-500/20 text-emerald-500' 
                      : 'bg-gray-500/20 text-gray-400'
                  }`}>
                    {user.is_paid ? 'Active' : 'Free'}
                  </span>
                  {user.plan_id && (
                    <span className="text-sm text-gray-400">Plan: {user.plan_id}</span>
                  )}
                  <span className="text-sm text-gray-500">
                    Source: {user.referral_source && user.referral_source !== 'organic' 
                      ? user.referral_source === 'awaken5' ? 'Awaken with 5' : user.referral_source
                      : 'Organic'}
                  </span>
                </div>
              </div>

              {/* Baseline Scores */}
              {details?.baseline && (
                <div className="bg-[#0a0a0a] rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-400 mb-3">Baseline Assessment</h4>
                  <div className="grid grid-cols-4 gap-3">
                    <div>
                      <p className="text-lg font-bold text-blue-500">
                        {details.baseline.regulation_score?.toFixed(1) || 'N/A'}
                      </p>
                      <p className="text-xs text-gray-500">Regulation</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold text-cyan-500">
                        {details.baseline.awareness_score?.toFixed(1) || 'N/A'}
                      </p>
                      <p className="text-xs text-gray-500">Awareness</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold text-emerald-500">
                        {details.baseline.outlook_score?.toFixed(1) || 'N/A'}
                      </p>
                      <p className="text-xs text-gray-500">Outlook</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold text-yellow-500">
                        {details.baseline.attention_score?.toFixed(1) || 'N/A'}
                      </p>
                      <p className="text-xs text-gray-500">Attention</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Recent Practices */}
              {details?.recentPractices && details.recentPractices.length > 0 && (
                <div className="bg-[#0a0a0a] rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-400 mb-3">Recent Practices (Last 10)</h4>
                  <div className="space-y-2">
                    {details.recentPractices.slice(0, 10).map((practice: any, index: number) => (
                      <div 
                        key={index} 
                        className="flex items-center justify-between text-sm"
                      >
                        <span className="text-gray-300">{practice.practice_type}</span>
                        <div className="flex items-center gap-3">
                          <span className="text-gray-500">{practice.practice_date}</span>
                          <span className={practice.completed ? 'text-emerald-500' : 'text-red-500'}>
                            {practice.completed ? '✓' : '✗'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Timeline */}
              <div className="bg-[#0a0a0a] rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-400 mb-3">Timeline</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Joined</span>
                    <span className="text-white">
                      {new Date(user.joined_at).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Current Stage Started</span>
                    <span className="text-white">
                      {user.stage_start_date 
                        ? new Date(user.stage_start_date).toLocaleDateString()
                        : 'N/A'
                      }
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Last Active</span>
                    <span className="text-white">
                      {user.last_active 
                        ? new Date(user.last_active).toLocaleDateString()
                        : 'Never'
                      }
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Days in Stage</span>
                    <span className="text-white">{user.days_in_stage}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================
// MAIN USERS PAGE
// ============================================
export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [stageFilter, setStageFilter] = useState<number | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'paid' | 'free'>('all');
  const [referralFilter, setReferralFilter] = useState<'all' | 'awaken5' | 'organic'>('all');
  
  // Sorting
  const [sortField, setSortField] = useState<SortField>('joined_at');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  
  // Selected user for modal
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/metrics');
      if (!response.ok) throw new Error('Failed to fetch users');
      const data = await response.json();
      setUsers(data.recentUsers || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Filter and sort users
  const filteredUsers = useMemo(() => {
    let result = [...users];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(user => 
        user.first_name?.toLowerCase().includes(query) ||
        user.email?.toLowerCase().includes(query)
      );
    }

    // Stage filter
    if (stageFilter !== 'all') {
      result = result.filter(user => user.current_stage === stageFilter);
    }

    // Status filter
    if (statusFilter !== 'all') {
      result = result.filter(user => 
        statusFilter === 'paid' ? user.is_paid : !user.is_paid
      );
    }

    // Referral filter
    if (referralFilter !== 'all') {
      result = result.filter(user => 
        referralFilter === 'awaken5' 
          ? user.referral_source && user.referral_source !== 'organic'
          : !user.referral_source || user.referral_source === 'organic'
      );
    }

    // Sort
    result.sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];

      // Handle null values
      if (aVal === null || aVal === undefined) aVal = '';
      if (bVal === null || bVal === undefined) bVal = '';

      // Handle dates
      if (sortField === 'joined_at' || sortField === 'last_active') {
        aVal = aVal ? new Date(aVal).getTime() : 0;
        bVal = bVal ? new Date(bVal).getTime() : 0;
      }

      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [users, searchQuery, stageFilter, statusFilter, referralFilter, sortField, sortDirection]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ArrowUpDown className="w-4 h-4 text-gray-600" />;
    return sortDirection === 'asc' 
      ? <ChevronUp className="w-4 h-4 text-[#ff9e19]" />
      : <ChevronDown className="w-4 h-4 text-[#ff9e19]" />;
  };

  if (loading && users.length === 0) {
    return (
      <div className="flex items-center justify-center py-20">
        <RefreshCw className="w-8 h-8 text-[#ff9e19] animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">All Users</h2>
          <p className="text-sm text-gray-400">{filteredUsers.length} users found</p>
        </div>
        <button
          onClick={fetchUsers}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg text-white hover:bg-[#2a2a2a] transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[#111111] border border-[#1a1a1a] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#ff9e19]"
          />
        </div>

        {/* Stage Filter */}
        <select
          value={stageFilter}
          onChange={(e) => setStageFilter(e.target.value === 'all' ? 'all' : Number(e.target.value))}
          className="px-4 py-2 bg-[#111111] border border-[#1a1a1a] rounded-lg text-white focus:outline-none focus:border-[#ff9e19]"
        >
          <option value="all">All Stages</option>
          {[1, 2, 3, 4, 5, 6, 7].map(stage => (
            <option key={stage} value={stage}>Stage {stage}</option>
          ))}
        </select>

        {/* Status Filter */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as 'all' | 'paid' | 'free')}
          className="px-4 py-2 bg-[#111111] border border-[#1a1a1a] rounded-lg text-white focus:outline-none focus:border-[#ff9e19]"
        >
          <option value="all">All Status</option>
          <option value="paid">Paid</option>
          <option value="free">Free</option>
        </select>

        {/* Referral Filter */}
        <select
          value={referralFilter}
          onChange={(e) => setReferralFilter(e.target.value as 'all' | 'awaken5' | 'organic')}
          className="px-4 py-2 bg-[#111111] border border-[#1a1a1a] rounded-lg text-white focus:outline-none focus:border-[#ff9e19]"
        >
          <option value="all">All Sources</option>
          <option value="awaken5">Awaken with 5</option>
          <option value="organic">Organic</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-[#111111] border border-[#1a1a1a] rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#0a0a0a]">
              <tr>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer hover:text-white"
                  onClick={() => handleSort('first_name')}
                >
                  <div className="flex items-center gap-1">
                    User <SortIcon field="first_name" />
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer hover:text-white"
                  onClick={() => handleSort('current_stage')}
                >
                  <div className="flex items-center gap-1">
                    Stage <SortIcon field="current_stage" />
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer hover:text-white"
                  onClick={() => handleSort('adherence_percentage')}
                >
                  <div className="flex items-center gap-1">
                    Adherence <SortIcon field="adherence_percentage" />
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer hover:text-white"
                  onClick={() => handleSort('rewired_index')}
                >
                  <div className="flex items-center gap-1">
                    REwired <SortIcon field="rewired_index" />
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer hover:text-white"
                  onClick={() => handleSort('joined_at')}
                >
                  <div className="flex items-center gap-1">
                    Joined <SortIcon field="joined_at" />
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer hover:text-white"
                  onClick={() => handleSort('last_active')}
                >
                  <div className="flex items-center gap-1">
                    Last Active <SortIcon field="last_active" />
                  </div>
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1a1a1a]">
              {filteredUsers.map((user) => (
                <tr 
                  key={user.user_id} 
                  className="hover:bg-[#1a1a1a]/50 transition-colors"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-white">
                          {user.first_name || 'Unknown'}
                        </p>
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
                    <div>
                      <span className="text-sm font-medium text-white">
                        {user.current_stage}
                      </span>
                      <span className="text-xs text-gray-500 ml-2">
                        {STAGE_NAMES[user.current_stage]}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <div className="w-20 h-2 bg-[#1a1a1a] rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${
                            user.adherence_percentage >= 80 ? 'bg-emerald-500' : 
                            user.adherence_percentage >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${user.adherence_percentage}%` }}
                        />
                      </div>
                      <span className="text-sm text-gray-400">
                        {user.adherence_percentage}%
                      </span>
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
                    {new Date(user.joined_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                    {user.last_active 
                      ? new Date(user.last_active).toLocaleDateString()
                      : 'Never'
                    }
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <button
                      onClick={() => setSelectedUser(user)}
                      className="p-2 hover:bg-[#2a2a2a] rounded-lg transition-colors"
                      title="View Details"
                    >
                      <Eye className="w-4 h-4 text-gray-400 hover:text-white" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* User Detail Modal */}
      {selectedUser && (
        <UserDetailModal 
          user={selectedUser} 
          onClose={() => setSelectedUser(null)} 
        />
      )}
    </div>
  );
}
