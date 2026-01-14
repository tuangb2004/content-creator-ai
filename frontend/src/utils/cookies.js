/**
 * Cookie utility functions
 * Helper functions to manage cookies in the browser
 */

/**
 * Set a cookie
 * @param {string} name - Cookie name
 * @param {string} value - Cookie value
 * @param {number} days - Number of days until expiration (default: 7)
 * @param {object} options - Additional options (path, domain, secure, sameSite)
 */
export const setCookie = (name, value, days = 7, options = {}) => {
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);

  let cookieString = `${name}=${encodeURIComponent(value)}; expires=${expires.toUTCString()}; path=${options.path || '/'}`;

  if (options.domain) {
    cookieString += `; domain=${options.domain}`;
  }

  if (options.secure || window.location.protocol === 'https:') {
    cookieString += '; secure';
  }

  if (options.sameSite) {
    cookieString += `; sameSite=${options.sameSite}`;
  } else {
    cookieString += '; sameSite=Lax';
  }

  document.cookie = cookieString;
};

/**
 * Get a cookie value by name
 * @param {string} name - Cookie name
 * @returns {string|null} - Cookie value or null if not found
 */
export const getCookie = (name) => {
  const nameEQ = name + '=';
  const ca = document.cookie.split(';');
  
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === ' ') c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) {
      return decodeURIComponent(c.substring(nameEQ.length, c.length));
    }
  }
  
  return null;
};

/**
 * Delete a cookie
 * @param {string} name - Cookie name
 * @param {object} options - Additional options (path, domain)
 */
export const deleteCookie = (name, options = {}) => {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=${options.path || '/'}${options.domain ? `; domain=${options.domain}` : ''}`;
};

/**
 * Check if a cookie exists
 * @param {string} name - Cookie name
 * @returns {boolean} - True if cookie exists
 */
export const hasCookie = (name) => {
  return getCookie(name) !== null;
};

/**
 * Get all cookies as an object
 * @returns {object} - Object with all cookies
 */
export const getAllCookies = () => {
  const cookies = {};
  const ca = document.cookie.split(';');
  
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === ' ') c = c.substring(1, c.length);
    const eqPos = c.indexOf('=');
    if (eqPos > 0) {
      const name = c.substring(0, eqPos);
      const value = decodeURIComponent(c.substring(eqPos + 1));
      cookies[name] = value;
    }
  }
  
  return cookies;
};

