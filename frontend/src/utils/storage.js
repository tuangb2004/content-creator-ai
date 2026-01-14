/**
 * Storage utility wrapper
 * Uses window.storage API if available (for Artifacts compliance)
 * Falls back to localStorage for backward compatibility
 */

// Check if window.storage API is available
const hasStorageAPI = typeof window !== 'undefined' && window.storage && typeof window.storage.get === 'function';

/**
 * Get value from storage
 * @param {string} key - Storage key
 * @param {any} defaultValue - Default value if key doesn't exist
 * @returns {Promise<any>} Stored value or default
 */
export const getStorage = async (key, defaultValue = null) => {
  try {
    if (hasStorageAPI) {
      const value = await window.storage.get(key);
      return value !== undefined ? value : defaultValue;
    } else {
      // Fallback to localStorage
      const item = localStorage.getItem(key);
      if (item === null) return defaultValue;
      try {
        return JSON.parse(item);
      } catch {
        return item;
      }
    }
  } catch (error) {
    console.error(`Error getting storage key "${key}":`, error);
    return defaultValue;
  }
};

/**
 * Set value in storage
 * @param {string} key - Storage key
 * @param {any} value - Value to store
 * @returns {Promise<void>}
 */
export const setStorage = async (key, value) => {
  try {
    if (hasStorageAPI) {
      await window.storage.set(key, value);
    } else {
      // Fallback to localStorage
      const serialized = typeof value === 'string' ? value : JSON.stringify(value);
      localStorage.setItem(key, serialized);
    }
  } catch (error) {
    console.error(`Error setting storage key "${key}":`, error);
  }
};

/**
 * Remove value from storage
 * @param {string} key - Storage key
 * @returns {Promise<void>}
 */
export const removeStorage = async (key) => {
  try {
    if (hasStorageAPI) {
      await window.storage.delete(key);
    } else {
      // Fallback to localStorage
      localStorage.removeItem(key);
    }
  } catch (error) {
    console.error(`Error removing storage key "${key}":`, error);
  }
};

/**
 * Clear all storage
 * @returns {Promise<void>}
 */
export const clearStorage = async () => {
  try {
    if (hasStorageAPI) {
      await window.storage.clear();
    } else {
      // Fallback to localStorage
      localStorage.clear();
    }
  } catch (error) {
    console.error('Error clearing storage:', error);
  }
};

// Synchronous versions for backward compatibility (uses localStorage only)
export const getStorageSync = (key, defaultValue = null) => {
  try {
    const item = localStorage.getItem(key);
    if (item === null) return defaultValue;
    try {
      return JSON.parse(item);
    } catch {
      return item;
    }
  } catch (error) {
    console.error(`Error getting storage key "${key}":`, error);
    return defaultValue;
  }
};

export const setStorageSync = (key, value) => {
  try {
    const serialized = typeof value === 'string' ? value : JSON.stringify(value);
    localStorage.setItem(key, serialized);
  } catch (error) {
    console.error(`Error setting storage key "${key}":`, error);
  }
};

export const removeStorageSync = (key) => {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error(`Error removing storage key "${key}":`, error);
  }
};

