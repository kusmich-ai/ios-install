import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('Supabase Config:', {
  url: supabaseUrl ? 'Set' : 'Missing',
  key: supabaseKey ? 'Set' : 'Missing'
});

let supabase = null;

if (typeof window !== 'undefined' && supabaseUrl && supabaseKey) {
  supabase = createClient(supabaseUrl, supabaseKey);
  console.log('Supabase client initialized');
}

export const storage = {
  async set(key, value) {
    if (!supabase) {
      if (typeof window !== 'undefined') {
        localStorage.setItem(key, value);
      }
      return { success: true };
    }

    try {
      const userId = getUserId();
      const parsedValue = typeof value === 'string' ? JSON.parse(value) : value;
      
      const { error } = await supabase
        .from('storage')
        .upsert({
          user_id: userId,
          key: key,
          value: parsedValue,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id,key'
        });

      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('Storage set error:', error);
      if (typeof window !== 'undefined') {
        localStorage.setItem(key, value);
      }
      return { success: true };
    }
  },

  async get(key) {
    if (!supabase) {
      if (typeof window !== 'undefined') {
        const value = localStorage.getItem(key);
        return value ? { value } : null;
      }
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

      if (error && error.code !== 'PGRST116') {
        if (typeof window !== 'undefined') {
          const value = localStorage.getItem(key);
          return value ? { value } : null;
        }
        return null;
      }
      
      if (data) {
        return { value: JSON.stringify(data.value) };
      }
      
      if (typeof window !== 'undefined') {
        const value = localStorage.getItem(key);
        return value ? { value } : null;
      }
      
      return null;
    } catch (error) {
      console.error('Storage get error:', error);
      if (typeof window !== 'undefined') {
        const value = localStorage.getItem(key);
        return value ? { value } : null;
      }
      return null;
    }
  },

  async remove(key) {
    if (!supabase) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem(key);
      }
      return { success: true };
    }

    try {
      const userId = getUserId();
      
      const { error } = await supabase
        .from('storage')
        .delete()
        .eq('user_id', userId)
        .eq('key', key);

      if (error) throw error;
      
      if (typeof window !== 'undefined') {
        localStorage.removeItem(key);
      }
      
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

if (typeof window !== 'undefined') {
  window.storage = storage;
}
