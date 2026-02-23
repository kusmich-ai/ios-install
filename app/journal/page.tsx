'use client';

import { useState, useEffect } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { 
  Wind, Eye, Activity, Zap, Target, Heart, Moon,
  Layers, Compass, Sparkles, Award, BookOpen, 
  Brain, Lightbulb, TrendingUp, ArrowLeft
} from 'lucide-react';
import Link from 'next/link';

interface JournalEntry {
  id: string;
  entry_type: string;
  stage: number;
  day_in_stage: number | null;
  title: string;
  content: string;
  created_at: string;
}

const ENTRY_TYPE_CONFIG: Record<string, { icon: React.ComponentType<{ className?: string }>; label: string; color: string }> = {
  milestone: { icon: Award, label: 'Milestone', color: 'text-amber-500' },
  science_drip: { icon: Brain, label: 'Science', color: 'text-blue-400' },
  signal_trend: { icon: TrendingUp, label: 'Trend', color: 'text-emerald-400' },
  micro_decentering: { icon: Layers, label: 'Decentering', color: 'text-purple-400' },
  day7_mirror: { icon: Eye, label: 'Day 7 Mirror', color: 'text-amber-400' },
  weekly_narrative: { icon: BookOpen, label: 'Weekly', color: 'text-cyan-400' },
  pattern_surfacing: { icon: Compass, label: 'Pattern', color: 'text-rose-400' },
  reframe_anchor: { icon: Sparkles, label: 'Reframe', color: 'text-yellow-400' },
  debrief_lesson: { icon: Moon, label: 'Debrief', color: 'text-indigo-400' },
  coach_guest: { icon: Lightbulb, label: 'Coach', color: 'text-orange-400' },
};

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { 
    weekday: 'short', 
    month: 'short', 
    day: 'numeric' 
  });
}

function formatTime(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleTimeString('en-US', { 
    hour: 'numeric', 
    minute: '2-digit',
    hour12: true 
  });
}

function groupByDate(entries: JournalEntry[]): Record<string, JournalEntry[]> {
  const groups: Record<string, JournalEntry[]> = {};
  entries.forEach(entry => {
    const dateKey = new Date(entry.created_at).toLocaleDateString('en-CA');
    if (!groups[dateKey]) groups[dateKey] = [];
    groups[dateKey].push(entry);
  });
  return groups;
}

export default function JournalPage() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    async function loadEntries() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      const { data, error } = await (supabase
        .from('journal_entries') as any)
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(100);

      if (!error && data) {
        setEntries(data);
      }
      setLoading(false);
    }

    loadEntries();
  }, []);

  const grouped = groupByDate(entries);
  const dateKeys = Object.keys(grouped).sort((a, b) => b.localeCompare(a));

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-zinc-500 text-sm">Loading journal...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-[#0a0a0a]/95 backdrop-blur-sm border-b border-white/5">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-3">
          <Link href="/chat" className="text-zinc-500 hover:text-zinc-300 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-lg font-semibold text-white">IOS Journal</h1>
            <p className="text-xs text-zinc-500">{entries.length} entries logged</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-4 py-6">
        {entries.length === 0 ? (
          <div className="text-center py-20">
            <BookOpen className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
            <p className="text-zinc-500 text-sm">Your journal is empty.</p>
            <p className="text-zinc-600 text-xs mt-2">
              As you progress through the IOS, milestones, insights, and breakthroughs will be captured here automatically.
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {dateKeys.map(dateKey => {
              const dayEntries = grouped[dateKey];
              const displayDate = formatDate(dayEntries[0].created_at);

              return (
                <div key={dateKey}>
                  {/* Date header */}
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">
                      {displayDate}
                    </span>
                    <div className="flex-1 h-px bg-white/5" />
                  </div>

                  {/* Entries for this date */}
                  <div className="space-y-2">
                    {dayEntries.map(entry => {
                      const config = ENTRY_TYPE_CONFIG[entry.entry_type] || { 
                        icon: Sparkles, label: entry.entry_type, color: 'text-zinc-400' 
                      };
                      const Icon = config.icon;
                      const isExpanded = expandedId === entry.id;
                      const isLong = entry.content.length > 150;

                      return (
                        <div
                          key={entry.id}
                          onClick={() => isLong ? setExpandedId(isExpanded ? null : entry.id) : null}
                          className={`
                            p-4 rounded-xl border border-white/5 bg-white/[0.02]
                            ${isLong ? 'cursor-pointer hover:border-white/10' : ''}
                            transition-colors
                          `}
                        >
                          <div className="flex items-start gap-3">
                            <div className={`w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0 ${config.color}`}>
                              <Icon className="w-4 h-4" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-sm font-medium text-white">
                                  {entry.title}
                                </span>
                                <span className={`text-xs px-1.5 py-0.5 rounded-full bg-white/5 ${config.color}`}>
                                  {config.label}
                                </span>
                                {entry.day_in_stage && (
                                  <span className="text-xs text-zinc-600">
                                    Day {entry.day_in_stage}
                                  </span>
                                )}
                              </div>
                              <p className={`text-sm text-zinc-400 leading-relaxed ${!isExpanded && isLong ? 'line-clamp-2' : ''}`}>
                                {entry.content}
                              </p>
                              <div className="flex items-center gap-2 mt-2">
                                <span className="text-xs text-zinc-600">
                                  {formatTime(entry.created_at)}
                                </span>
                                <span className="text-xs text-zinc-700">
                                  Stage {entry.stage}
                                </span>
                                {isLong && (
                                  <span className="text-xs text-amber-600/60">
                                    {isExpanded ? 'tap to collapse' : 'tap to expand'}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
