'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#0a0a0a' }}>
      <div className="text-center max-w-2xl px-4">
        <h1 className="text-6xl font-bold mb-6" style={{ color: '#ff9e19' }}>
          IOS System
        </h1>
        <p className="text-2xl text-gray-300 mb-4">
          Integrated Operating System
        </p>
        <p className="text-lg text-gray-400 mb-12">
          A neural and mental transformation protocol that rewires how you regulate, think, and perform.
        </p>
        
        <div className="flex gap-4 justify-center">
          <Link
            href="/auth/signup"
            className="px-8 py-4 rounded-lg font-semibold text-lg transition-all hover:opacity-90"
            style={{ backgroundColor: '#ff9e19', color: '#0a0a0a' }}
          >
            Start Free Trial
          </Link>
          
          <Link
            href="/auth/signin"
            className="px-8 py-4 rounded-lg font-semibold text-lg transition-all hover:opacity-90"
            style={{ backgroundColor: '#111111', color: '#ff9e19', border: '1px solid #ff9e19' }}
          >
            Sign In
          </Link>
        </div>

        <p className="text-sm text-gray-500 mt-8">
          7-day free trial • No credit card required
        </p>
      </div>
    </div>
  );
}
