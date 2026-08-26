/**
 * Studio Security Engine
 * Provides rate-limiting / brute-force protection, timing-attack resistance,
 * secure challenge verification, and session state guards.
 */

const RATE_LIMIT_KEY = 'cc_blog_auth_ratelimit_v1';
const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 30 * 1000; // 30 seconds cooldown

export interface RateLimitState {
  failedAttempts: number;
  lockedUntil: number | null; // timestamp in ms
}

/**
 * Reads the current rate limit / brute-force protection state
 */
export function getRateLimitState(): RateLimitState {
  try {
    const raw = localStorage.getItem(RATE_LIMIT_KEY);
    if (!raw) return { failedAttempts: 0, lockedUntil: null };
    const parsed: RateLimitState = JSON.parse(raw);
    const now = Date.now();
    if (parsed.lockedUntil && now > parsed.lockedUntil) {
      // Cooldown has expired, reset
      const resetState = { failedAttempts: 0, lockedUntil: null };
      localStorage.setItem(RATE_LIMIT_KEY, JSON.stringify(resetState));
      return resetState;
    }
    return parsed;
  } catch {
    return { failedAttempts: 0, lockedUntil: null };
  }
}

/**
 * Returns remaining seconds of lockout if locked, or 0 if active
 */
export function getRemainingLockoutSeconds(): number {
  const state = getRateLimitState();
  if (!state.lockedUntil) return 0;
  const diff = state.lockedUntil - Date.now();
  return diff > 0 ? Math.ceil(diff / 1000) : 0;
}

/**
 * Records a failed authentication attempt
 */
export function recordFailedAttempt(): { isLocked: boolean; remainingSeconds: number; attemptsLeft: number } {
  const current = getRateLimitState();
  const newAttempts = current.failedAttempts + 1;
  const isLocked = newAttempts >= MAX_ATTEMPTS;
  const lockedUntil = isLocked ? Date.now() + LOCKOUT_DURATION_MS : null;

  const nextState: RateLimitState = {
    failedAttempts: isLocked ? MAX_ATTEMPTS : newAttempts,
    lockedUntil
  };

  try {
    localStorage.setItem(RATE_LIMIT_KEY, JSON.stringify(nextState));
  } catch {
    // ignore
  }

  const remainingSeconds = lockedUntil ? Math.ceil(LOCKOUT_DURATION_MS / 1000) : 0;
  const attemptsLeft = Math.max(0, MAX_ATTEMPTS - newAttempts);

  return { isLocked, remainingSeconds, attemptsLeft };
}

/**
 * Clears failed attempts upon legitimate authentication
 */
export function clearRateLimit(): void {
  try {
    localStorage.removeItem(RATE_LIMIT_KEY);
  } catch {
    // ignore
  }
}

/**
 * Constant-time string comparison helper to mitigate side-channel timing attacks
 */
export function constantTimeEquals(a: string, b: string): boolean {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  const aNorm = a.normalize();
  const bNorm = b.normalize();
  
  let mismatch = aNorm.length === bNorm.length ? 0 : 1;
  const maxLen = Math.max(aNorm.length, bNorm.length);
  
  for (let i = 0; i < maxLen; i++) {
    const charA = aNorm.charCodeAt(i) || 0;
    const charB = bNorm.charCodeAt(i) || 0;
    mismatch |= charA ^ charB;
  }
  
  return mismatch === 0;
}

/**
 * Normalizes and verifies security trick answers (case-insensitive, whitespace-trimmed)
 */
export function verifyTrickAnswer(userInput: string, expectedAnswer: string): boolean {
  if (!userInput || !expectedAnswer) return false;
  const cleanInput = userInput.trim().toLowerCase().replace(/\s+/g, ' ');
  const cleanExpected = expectedAnswer.trim().toLowerCase().replace(/\s+/g, ' ');
  return constantTimeEquals(cleanInput, cleanExpected);
}

/**
 * Default & Recommended Trick Questions
 */
export const SECURITY_QUESTION_PRESETS = [
  "Your Sister's Name...?",
  "What was the name of your first childhood street?",
  "What is your secret publication master key?",
  "What is your favorite editorial font?",
  "What is the secret city where you first coded?"
];

/**
 * Password strength evaluator for Studio Passkey
 */
export function evaluatePasskeyStrength(passkey: string): {
  score: number; // 0 to 4
  label: 'Weak' | 'Fair' | 'Good' | 'Strong';
  color: string;
} {
  if (!passkey) return { score: 0, label: 'Weak', color: '#EF4444' };
  let score = 0;
  if (passkey.length >= 6) score += 1;
  if (passkey.length >= 10) score += 1;
  if (/[0-9]/.test(passkey) && /[a-zA-Z]/.test(passkey)) score += 1;
  if (/[^A-Za-z0-9]/.test(passkey)) score += 1;

  if (score <= 1) return { score: 1, label: 'Weak', color: '#EF4444' };
  if (score === 2) return { score: 2, label: 'Fair', color: '#F59E0B' };
  if (score === 3) return { score: 3, label: 'Good', color: '#3B82F6' };
  return { score: 4, label: 'Strong', color: '#10B981' };
}
