// lib/storage-client.js
'use client';

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

let supabase = null;

if (typeof window !== 'undefined' && supabaseUrl && supabaseKey) {
  supabase = createClient(supabaseUrl, supabaseKey);
}

export const storage = {
  async set(key, value) {
    if (!supabase) {
      localStorage.setItem(key, value);
      return { success: true };
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      const userId = user?.id || getUserId();
      
      const parsedValue = typeof value === 'string' ? JSON.parse(value) : value;
      
      const { error } = await supabase
        .from('user_data')
        .upsert({
          user_id: userId,
          key: key,
          value: JSON.stringify(parsedValue),
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id,key'
        });

      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('Storage set error:', error);
      localStorage.setItem(key, value);
      return { success: true };
    }
  },

  async get(key) {
    if (!supabase) {
      const value = localStorage.getItem(key);
      return value ? { value } : null;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      const userId = user?.id || getUserId();
      
      const { data, error } = await supabase
        .from('user_data')
        .select('value')
        .eq('user_id', userId)
        .eq('key', key)
        .single();

      if (error && error.code !== 'PGRST116') {
        const value = localStorage.getItem(key);
        return value ? { value } : null;
      }
      
      if (data) {
        return { value: data.value };
      }
      
      const value = localStorage.getItem(key);
      return value ? { value } : null;
    } catch (error) {
      console.error('Storage get error:', error);
      const value = localStorage.getItem(key);
      return value ? { value } : null;
    }
  },

  async remove(key) {
    if (!supabase) {
      localStorage.removeItem(key);
      return { success: true };
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      const userId = user?.id || getUserId();
      
      const { error } = await supabase
        .from('user_data')
        .delete()
        .eq('user_id', userId)
        .eq('key', key);

      if (error) throw error;
      
      localStorage.removeItem(key);
      
      return { success: true };
    } catch (error) {
      console.error('Storage remove error:', error);
      return { success: false, error };
    }
  },
};

function getUserId() {
  let userId = localStorage.getItem('ios_user_id');
  if (!userId) {
    userId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem('ios_user_id', userId);
  }
  return userId;
}

// Make storage available globally
if (typeof window !== 'undefined') {
  window.storage = storage;
}
