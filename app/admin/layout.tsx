// app/admin/layout.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase-client';
import { Loader2 } from 'lucide-react';

// ============================================
// ADMIN EMAIL WHITELIST
// Must match the API route whitelist
// ============================================
const ADMIN_EMAILS = [
  'nkusmich@nicholaskusmich.com',
  'kayla@nicholaskusmich.com',
  'rachel@nicholaskusmich.com',
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        
        if (error || !user) {
          router.push('/login');
          return;
        }

        if (!ADMIN_EMAILS.includes(user.email || '')) {
          router.push('/chat'); // Redirect non-admins to main app
          return;
        }

        setIsAuthorized(true);
      } catch (err) {
        console.error('Auth check error:', err);
        router.push('/login');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [router, supabase]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 text-[#ff9e19] animate-spin" />
          <p className="text-gray-400">Verifying admin access...</p>
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-2">Access Denied</h1>
          <p className="text-gray-400">You don't have permission to view this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Admin Header */}
      <header className="border-b border-[#1a1a1a] bg-[#111111]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <h1 className="text-xl font-bold text-white">
                IOS <span className="text-[#ff9e19]">Admin</span>
              </h1>
              <span className="px-2 py-1 text-xs rounded bg-[#ff9e19]/20 text-[#ff9e19] border border-[#ff9e19]/30">
                Dashboard
              </span>
            </div>
            <nav className="flex items-center gap-6">
              <a 
                href="/admin" 
                className="text-sm text-gray-400 hover:text-white transition-colors"
              >
                Overview
              </a>
              <a 
                href="/admin/users" 
                className="text-sm text-gray-400 hover:text-white transition-colors"
              >
                Users
              </a>
              <a 
                href="/chat" 
                className="text-sm text-[#ff9e19] hover:text-[#ffb347] transition-colors"
              >
                Back to App →
              </a>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
