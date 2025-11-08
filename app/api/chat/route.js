import Anthropic from '@anthropic-ai/sdk';

const SYSTEM_PROMPT_URL = 'https://raw.githubusercontent.com/YOUR_USERNAME/YOUR_REPO/main/instructions/system-prompt.txt';

let cachedPrompt = null;

async function getSystemPrompt() {
  if (cachedPrompt) return cachedPrompt;
  
  const response = await fetch(SYSTEM_PROMPT_URL);
  cachedPrompt = await response.text();
  return cachedPrompt;
}

export async function POST(req) {
  const systemPrompt = await getSystemPrompt();
  
  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 8192,
    system: systemPrompt, // Use fetched prompt
    messages: messages,
  });
  // ... rest of code
}
```

### **Option B: Environment Variable (Vercel)**

If it fits in env var limits (~4KB), store in Vercel environment variables:

1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add `SYSTEM_PROMPT` with your full instructions
3. In code: `system: process.env.SYSTEM_PROMPT`

**Option A is better for large prompts.**

---

## **3. Supabase Setup**

### **Step 1: Create Supabase Project**

1. Go to https://supabase.com/
2. Sign in → New Project
3. Choose org, name it "IOS-Storage", set password
4. Wait 2-3 mins for setup

### **Step 2: Get API Keys**

1. Project Settings → API
2. Copy:
   - `Project URL` (looks like: `https://xxxxx.supabase.co`)
   - `anon public` key

### **Step 3: Add to Vercel Environment Variables**

In Vercel Dashboard → Settings → Environment Variables:
```
NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
Step 4: Create Storage Tables
In Supabase Dashboard → SQL Editor → New Query:
sql-- User data table
CREATE TABLE user_data (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id text UNIQUE NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Storage table (key-value pairs)
CREATE TABLE storage (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id text NOT NULL,
  key text NOT NULL,
  value jsonb NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id, key)
);

-- Enable Row Level Security
ALTER TABLE user_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE storage ENABLE ROW LEVEL SECURITY;

-- Create policies (allow all for now - tighten later)
CREATE POLICY "Allow all operations" ON user_data FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON storage FOR ALL USING (true);
Click "Run".
Step 5: Update Your Storage Implementation
Replace /lib/storage.js with:
javascriptimport { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

let supabase = null;

if (typeof window !== 'undefined' && supabaseUrl && supabaseKey) {
  supabase = createClient(supabaseUrl, supabaseKey);
}

export const storage = {
  async set(key, value) {
    if (!supabase) {
      console.error('Supabase not initialized');
      return { success: false, error: 'Storage not available' };
    }

    try {
      const userId = getUserId();
      
      const { data, error } = await supabase
        .from('storage')
        .upsert({
          user_id: userId,
          key: key,
          value: typeof value === 'string' ? JSON.parse(value) : value,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id,key'
        });

      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('Storage set error:', error);
      return { success: false, error };
    }
  },

  async get(key) {
    if (!supabase) {
      console.error('Supabase not initialized');
      return null;
    }

    try {
      const userId = getUserId();
      
      const { data, error } = await supabase
        .from('storage')
        .select('value')
        .eq('user_id', userId)
        .eq('key', key)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      
      return data ? { value: JSON.stringify(data.value) } : null;
    } catch (error) {
      console.error('Storage get error:', error);
      return null;
    }
  },

  async remove(key) {
    if (!supabase) {
      console.error('Supabase not initialized');
      return { success: false, error: 'Storage not available' };
    }

    try {
      const userId = getUserId();
      
      const { error } = await supabase
        .from('storage')
        .delete()
        .eq('user_id', userId)
        .eq('key', key);

      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('Storage remove error:', error);
      return { success: false, error };
    }
  },
};

function getUserId() {
  if (typeof window === 'undefined') return 'server';
  
  let userId = localStorage.getItem('ios_user_id');
  if (!userId) {
    userId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem('ios_user_id', userId);
  }
  return userId;
}

// Make it available globally
if (typeof window !== 'undefined') {
  window.storage = storage;
}
