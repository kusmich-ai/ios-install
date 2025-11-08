// Simple localStorage wrapper that matches the window.storage API pattern
export const storage = {
  async set(key, value) {
    try {
      localStorage.setItem(key, value);
      return { success: true };
    } catch (error) {
      console.error('Storage set error:', error);
      return { success: false, error };
    }
  },

  async get(key) {
    try {
      const value = localStorage.getItem(key);
      return value ? { value } : null;
    } catch (error) {
      console.error('Storage get error:', error);
      return null;
    }
  },

  async remove(key) {
    try {
      localStorage.removeItem(key);
      return { success: true };
    } catch (error) {
      console.error('Storage remove error:', error);
      return { success: false, error };
    }
  },
};

// Make it available globally
if (typeof window !== 'undefined') {
  window.storage = storage;
}
