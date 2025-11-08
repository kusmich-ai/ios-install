import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('🔧 Supabase Config Check:');
console.log('  URL:', supabaseUrl ? '✅ Set' : '❌ Missing');
console.log('  Key:', supabaseKey ? '✅ Set' : '❌ Missing');

let supabase = null;

if (typeof window !== 'undefined' && supabaseUrl && supabaseKey) {
  supabase = createClient(supabaseUrl, supabaseKey);
  console.log('✅ Supabase client initialized');
} else {
  console.warn('⚠️ Supabase not initialized - missing config');
}

export const storage = {
  async set(key, value) {
    console.log('💾 Storage.set called:', { key, valueLength: value?.length });
    
    if (!supabase) {
      console.error('❌ Supabase not initialized');
      
      // Fallback to localStorage
      console.log('📦 Using localStorage fallback');
      try {
        localStorage.setItem(key, value);
        console.log('✅ Saved to localStorage:', key);
        return { success: true };
      } catch (error) {
        console.error('❌ localStorage error:', error);
        return { success: false, error };
      }
    }

    try {
      const userId = getUserId();
      console.log('👤 User ID:', userId);
      
      const parsedValue = typeof value === 'string' ? JSON.parse(value) : value;
      console.log('📝 Parsed value:', parsedValue);
      
      const { data, error } = await supabase
        .from('storage')
        .upsert({
          user_id: userId,
          key: key,
          value: parsedValue,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id,key'
        });

      if (error) {
        console.error('❌ Supabase error:', error);
        throw error;
      }
      
      console.log('✅ Saved to Supabase:', key);
      console.log('📊 Response data:', data);
      return { success: true };
    } catch (error) {
      console.error('❌ Storage.set error:', error);
      
      // Fallback to localStorage
      console.log('📦 Using localStorage fallback after error');
      try {
        localStorage.setItem(key, value);
        return { success: true };
      } catch (fallbackError) {
        console.error('❌ localStorage fallback error:', fallbackError);
        return { success: false, error };
      }
    }
  },

  async get(key) {
    console.log('🔍 Storage.get called:', key);
    
    if (!supabase) {
      console.warn('⚠️ Supabase not initialized, using localStorage');
      try {
        const value = localStorage.getItem(key);
        console.log('📦 Retrieved from localStorage:', { key, hasValue: !!value });
        return value ? { value } : null;
      } catch (error) {
        console.error('❌ localStorage get error:', error);
        return null;
      }
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
        console.error('❌ Supabase get error:', error);
        
        // Fallback to localStorage
        const localValue = localStorage.getItem(key);
        if (localValue) {
          console.log('📦 Retrieved from localStorage fallback:', key);
          return { value: localValue };
        }
        throw error;
      }
      
      if (data) {
        console.log('✅ Retrieved from Supabase:', key);
        return { value: JSON.stringify(data.value) };
      }
      
      console.log('ℹ️ No data found in Supabase for:', key);
      
      // Check localStorage as fallback
      const localValue = localStorage.getItem(key);
      if (localValue) {
        console.log('📦 Found in localStorage:', key);
        return { value: localValue };
      }
      
      return null;
    } catch (error) {
      console.error('❌ Storage.get error:', error);
      
      // Try localStorage
      const localValue = localStorage.getItem(key);
      if (localValue) {
        console.log('📦 Retrieved from localStorage fallback:', key);
        return { value: localValue };
      }
      
      return null;
    }
  },

  async remove(key) {
    if (!supabase) {
      console.warn('⚠️ Supabase not initialized, using localStorage');
      try {
        localStorage.removeItem(key);
        return { success: true };
      } catch (error) {
        return { success: false, error };
      }
    }

    try {
      const userId = getUserId();
      
      const { error } = await supabase
        .from('storage')
        .delete()
        .eq('user_id', userId)
        .eq('key', key);

      if (error) throw error;
      
      // Also remove from localStorage
      localStorage.removeItem(key);
      
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
    console.log('🆔 Created new user ID:', userId);
  } else {
    console.log('🆔 Using existing user ID:', userId);
  }
  return userId;
}

// Make it available globally
if (typeof window !== 'undefined') {
  window.storage = storage;
}
