/**
 * Password strength checker
 * Returns: { score: 0-4, strength: 'weak'|'fair'|'good'|'strong', feedback: string[] }
 */
export const checkPasswordStrength = (password) => {
  if (!password) {
    return { score: 0, strength: 'weak', feedback: [] };
  }

  const feedback = [];
  let score = 0;

  // Length check
  if (password.length >= 8) {
    score += 1;
  } else {
    feedback.push('At least 8 characters');
  }

  // Lowercase check
  if (/[a-z]/.test(password)) {
    score += 1;
  } else {
    feedback.push('One lowercase letter');
  }

  // Uppercase check
  if (/[A-Z]/.test(password)) {
    score += 1;
  } else {
    feedback.push('One uppercase letter');
  }

  // Number check
  if (/\d/.test(password)) {
    score += 1;
  } else {
    feedback.push('One number');
  }

  // Special character check
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    score += 1;
  } else {
    feedback.push('One special character');
  }

  let strength = 'weak';
  if (score >= 4) strength = 'strong';
  else if (score >= 3) strength = 'good';
  else if (score >= 2) strength = 'fair';

  return { score, strength, feedback };
};

/**
 * Email validation
 */
export const validateEmail = (email) => {
  if (!email) return { valid: false, message: 'Email is required' };
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { valid: false, message: 'Please enter a valid email address' };
  }
  
  return { valid: true, message: '' };
};

/**
 * Password requirements for display
 */
export const passwordRequirements = [
  { id: 'length', text: 'At least 8 characters', test: (pwd) => pwd.length >= 8 },
  { id: 'lowercase', text: 'One lowercase letter', test: (pwd) => /[a-z]/.test(pwd) },
  { id: 'uppercase', text: 'One uppercase letter', test: (pwd) => /[A-Z]/.test(pwd) },
  { id: 'number', text: 'One number', test: (pwd) => /\d/.test(pwd) },
  { id: 'special', text: 'One special character (!@#$%^&*)', test: (pwd) => /[!@#$%^&*(),.?":{}|<>]/.test(pwd) }
];

