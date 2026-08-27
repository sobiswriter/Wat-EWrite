import React, { useState, useEffect } from 'react';
import { useBlog } from '../context/BlogContext';
import {
  Shield,
  Lock,
  X,
  ArrowRight,
  AlertCircle,
  KeyRound,
  HelpCircle,
  CheckCircle2,
  Eye,
  EyeOff,
  RefreshCw,
  Sparkles,
  Copy,
  Clock,
  Check
} from 'lucide-react';
import {
  getRemainingLockoutSeconds,
  getRateLimitState,
  evaluatePasskeyStrength
} from '../utils/security';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

type ModalView = 'passkey' | 'trick_question' | 'recovery_success';

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const {
    settings,
    loginAdmin,
    verifySecurityTrickAnswer,
    resetAdminPasscode
  } = useBlog();

  const [view, setView] = useState<ModalView>('passkey');
  const [passcode, setPasscode] = useState('');
  const [showPasscode, setShowPasscode] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Trick question state
  const [trickAnswer, setTrickAnswer] = useState('');
  const [newPasscode, setNewPasscode] = useState('');
  const [showNewPasscode, setShowNewPasscode] = useState(false);
  const [passkeyResetSuccess, setPasskeyResetSuccess] = useState(false);
  const [copiedPasskey, setCopiedPasskey] = useState(false);

  // Rate limit / lockout live timer
  const [lockoutSeconds, setLockoutSeconds] = useState(0);
  const [attemptsRemaining, setAttemptsRemaining] = useState(5);

  // Poll / countdown lockout seconds
  useEffect(() => {
    if (!isOpen) return;
    const updateLockout = () => {
      const remaining = getRemainingLockoutSeconds();
      setLockoutSeconds(remaining);
      const rlState = getRateLimitState();
      setAttemptsRemaining(Math.max(0, 5 - rlState.failedAttempts));
    };

    updateLockout();
    const interval = setInterval(updateLockout, 1000);
    return () => clearInterval(interval);
  }, [isOpen, view]);

  // Reset internal state on open
  useEffect(() => {
    if (isOpen) {
      setView('passkey');
      setPasscode('');
      setTrickAnswer('');
      setNewPasscode('');
      setErrorMessage(null);
      setPasskeyResetSuccess(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const currentQuestion = settings.securityQuestion || "Your Sister's Name...?";
  const passkeyStrength = evaluatePasskeyStrength(newPasscode);

  const handlePasskeySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (lockoutSeconds > 0) return;

    setErrorMessage(null);
    const result = loginAdmin(passcode);

    if (result.success) {
      setPasscode('');
      setErrorMessage(null);
      onSuccess();
    } else {
      setErrorMessage(result.error || 'Incorrect passkey. Please try again.');
      if (result.remainingSeconds) {
        setLockoutSeconds(result.remainingSeconds);
      }
    }
  };

  const handleTrickQuestionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (lockoutSeconds > 0) return;

    setErrorMessage(null);
    const result = verifySecurityTrickAnswer(trickAnswer);

    if (result.success) {
      setView('recovery_success');
      setErrorMessage(null);
    } else {
      setErrorMessage(result.error || 'Incorrect answer to security question. Please try again.');
      if (result.remainingSeconds) {
        setLockoutSeconds(result.remainingSeconds);
      }
    }
  };

  const handleResetPasskey = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPasscode.trim()) return;

    const res = resetAdminPasscode(newPasscode);
    if (res.success) {
      setPasskeyResetSuccess(true);
      // Auto login
      loginAdmin(newPasscode);
      setTimeout(() => {
        onSuccess();
      }, 1000);
    } else {
      setErrorMessage(res.message);
    }
  };

  const handleCopyCurrentPasskey = () => {
    const currentKey = settings.adminPasscode || '';
    if (currentKey) {
      navigator.clipboard.writeText(currentKey);
      setCopiedPasskey(true);
      setTimeout(() => setCopiedPasskey(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-[#E7E5E4] p-6 sm:p-8 relative overflow-hidden transition-all"
        onClick={e => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 text-[#78716C] hover:text-[#1C1917] rounded-lg hover:bg-[#F5F5F4] transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* VIEW 1: PASSKEY LOGIN */}
        {view === 'passkey' && (
          <div>
            <div className="text-center mb-6">
              <div className="w-12 h-12 rounded-2xl bg-[#F9EBE7] text-[#D44D2E] flex items-center justify-center mx-auto mb-3 shadow-xs">
                <Shield className="w-6 h-6" />
              </div>
              <h3 className="font-serif text-2xl font-bold text-[#1A1A1A]">
                Wat'EWrites Studio
              </h3>
              <p className="text-xs text-[#6B665F] mt-1">
                Input your studio passkey to unlock the editorial writing desk and settings.
              </p>
            </div>

            {/* Lockout Warning Banner */}
            {lockoutSeconds > 0 && (
              <div className="mb-4 p-3.5 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-800 text-xs animate-pulse">
                <Clock className="w-5 h-5 shrink-0 text-red-600" />
                <div>
                  <span className="font-bold block">Security Lockout Active</span>
                  <span>Too many failed attempts. Cooldown: <strong>{lockoutSeconds}s</strong> remaining.</span>
                </div>
              </div>
            )}

            <form onSubmit={handlePasskeySubmit} className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-[#6B665F] uppercase tracking-wider">
                    Studio Passkey
                  </label>
                  {lockoutSeconds === 0 && attemptsRemaining < 5 && (
                    <span className="text-[11px] font-medium text-[#D44D2E]">
                      {attemptsRemaining} attempt{attemptsRemaining === 1 ? '' : 's'} left
                    </span>
                  )}
                </div>

                <div className="relative">
                  <Lock className="w-4 h-4 text-[#9C968B] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    id="admin-passcode-input"
                    type={showPasscode ? "text" : "password"}
                    required
                    autoFocus
                    disabled={lockoutSeconds > 0}
                    placeholder="Enter studio passkey..."
                    value={passcode}
                    onChange={e => {
                      setPasscode(e.target.value);
                      setErrorMessage(null);
                    }}
                    className={`w-full pl-10 pr-10 py-2.5 bg-[#F9F8F6] border rounded-xl text-sm text-[#1A1A1A] transition-colors focus:outline-hidden ${
                      lockoutSeconds > 0
                        ? 'border-red-300 bg-red-50/40 opacity-60 cursor-not-allowed'
                        : 'border-[#E5E2DC] focus:border-[#D44D2E]'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasscode(!showPasscode)}
                    disabled={lockoutSeconds > 0}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#888888] hover:text-[#111111] cursor-pointer"
                    title={showPasscode ? "Hide passkey" : "Show passkey"}
                  >
                    {showPasscode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {errorMessage && (
                <div className="p-3 bg-red-50 text-red-800 border border-red-200 rounded-xl text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Forgot Passkey Row */}
              <div className="flex items-center justify-end pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setView('trick_question');
                    setErrorMessage(null);
                  }}
                  className="text-xs text-[#6B665F] hover:text-[#111111] font-medium hover:underline flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <HelpCircle className="w-3.5 h-3.5 text-[#888888]" />
                  <span>Forgot Passkey? (Security Question)</span>
                </button>
              </div>

              <button
                type="submit"
                disabled={lockoutSeconds > 0 || !passcode.trim()}
                className={`w-full py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2 shadow-md mt-2 cursor-pointer ${
                  lockoutSeconds > 0 || !passcode.trim()
                    ? 'bg-[#E5E2DC] text-[#888888] cursor-not-allowed'
                    : 'bg-[#1A1A1A] hover:bg-[#332F2A] text-white'
                }`}
              >
                <span>Enter Studio</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        )}

        {/* VIEW 2: TRICK QUESTION RECOVERY CHALLENGE */}
        {view === 'trick_question' && (
          <div>
            <div className="text-center mb-6">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-3 shadow-xs">
                <HelpCircle className="w-6 h-6 text-amber-600" />
              </div>
              <h3 className="font-serif text-2xl font-bold text-[#1A1A1A]">
                Security Trick Question
              </h3>
              <p className="text-xs text-[#6B665F] mt-1">
                Answer your secret recovery challenge to instantly recover access and reset your passkey.
              </p>
            </div>

            {/* Lockout Warning */}
            {lockoutSeconds > 0 && (
              <div className="mb-4 p-3.5 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-800 text-xs animate-pulse">
                <Clock className="w-5 h-5 shrink-0 text-red-600" />
                <div>
                  <span className="font-bold block">Security Lockout Active</span>
                  <span>Cooldown: <strong>{lockoutSeconds}s</strong> remaining.</span>
                </div>
              </div>
            )}

            <form onSubmit={handleTrickQuestionSubmit} className="space-y-4">
              {/* Question Display Card */}
              <div className="p-4 bg-[#F9F8F6] border border-[#E5E2DC] rounded-2xl">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[#777777] block mb-1">
                  Recovery Challenge
                </span>
                <div className="font-serif text-base font-bold text-[#111111] leading-snug">
                  "{currentQuestion}"
                </div>
              </div>

              {/* Answer Input */}
              <div>
                <label className="block text-xs font-semibold text-[#6B665F] uppercase tracking-wider mb-1.5">
                  Your Answer
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  disabled={lockoutSeconds > 0}
                  placeholder="Type your answer..."
                  value={trickAnswer}
                  onChange={e => {
                    setTrickAnswer(e.target.value);
                    setErrorMessage(null);
                  }}
                  className={`w-full px-4 py-2.5 bg-[#F9F8F6] border rounded-xl text-sm text-[#1A1A1A] focus:outline-hidden ${
                    lockoutSeconds > 0
                      ? 'border-red-300 bg-red-50/40 opacity-60 cursor-not-allowed'
                      : 'border-[#E5E2DC] focus:border-[#D44D2E]'
                  }`}
                />
              </div>

              {errorMessage && (
                <div className="p-3 bg-red-50 text-red-800 border border-red-200 rounded-xl text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setView('passkey');
                    setErrorMessage(null);
                  }}
                  className="flex-1 py-2.5 bg-[#F3F1EC] hover:bg-[#E5E2DC] text-[#111111] rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                >
                  Back to Passkey
                </button>

                <button
                  type="submit"
                  disabled={lockoutSeconds > 0 || !trickAnswer.trim()}
                  className={`flex-1 py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5 shadow-xs cursor-pointer ${
                    lockoutSeconds > 0 || !trickAnswer.trim()
                      ? 'bg-[#E5E2DC] text-[#888888] cursor-not-allowed'
                      : 'bg-[#D44D2E] hover:bg-[#B83C1F] text-white'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Verify Answer</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* VIEW 3: RECOVERY SUCCESS & SET NEW PASSKEY */}
        {view === 'recovery_success' && (
          <div>
            <div className="text-center mb-6">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-3 shadow-xs">
                <CheckCircle2 className="w-6 h-6 text-emerald-600" />
              </div>
              <h3 className="font-serif text-2xl font-bold text-[#1A1A1A]">
                Identity Verified!
              </h3>
              <p className="text-xs text-[#6B665F] mt-1">
                You passed the security challenge. You can keep your existing passkey or create a new one.
              </p>
            </div>

            {/* Current Passkey Card */}
            <div className="p-4 bg-[#F9F8F6] border border-[#E5E2DC] rounded-2xl mb-5 space-y-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[#777777] block">
                Current Active Passkey
              </span>
              <div className="flex items-center justify-between">
                <code className="font-mono text-base font-bold text-[#111111] bg-white px-3 py-1 rounded-lg border border-[#E5E2DC]">
                  {settings.adminPasscode || '••••••••'}
                </code>
                <button
                  type="button"
                  onClick={handleCopyCurrentPasskey}
                  className="px-3 py-1 bg-white border border-[#E5E2DC] hover:border-[#111111] text-[#111111] rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-2xs transition-colors"
                >
                  {copiedPasskey ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Set New Passkey Form */}
            <form onSubmit={handleResetPasskey} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#6B665F] uppercase tracking-wider mb-1.5">
                  Set New Passkey (Optional)
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#9C968B] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showNewPasscode ? "text" : "password"}
                    placeholder="Enter new passkey (min 4 chars)..."
                    value={newPasscode}
                    onChange={e => {
                      setNewPasscode(e.target.value);
                      setErrorMessage(null);
                    }}
                    className="w-full pl-10 pr-10 py-2.5 bg-[#F9F8F6] border border-[#E5E2DC] rounded-xl text-sm text-[#1A1A1A] focus:outline-hidden focus:border-[#D44D2E]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPasscode(!showNewPasscode)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#888888] hover:text-[#111111] cursor-pointer"
                  >
                    {showNewPasscode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {/* Strength meter if user typed something */}
                {newPasscode.length > 0 && (
                  <div className="mt-2 space-y-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-[#777777]">Passkey Security:</span>
                      <span className="font-semibold" style={{ color: passkeyStrength.color }}>
                        {passkeyStrength.label}
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-[#E5E2DC] rounded-full overflow-hidden">
                      <div
                        className="h-full transition-all duration-300 rounded-full"
                        style={{
                          width: `${(passkeyStrength.score / 4) * 100}%`,
                          backgroundColor: passkeyStrength.color
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {passkeyResetSuccess && (
                <div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                  <span>Passkey reset successful! Unlocking Studio...</span>
                </div>
              )}

              {errorMessage && (
                <div className="p-3 bg-red-50 text-red-800 border border-red-200 rounded-xl text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <div className="flex flex-col gap-2 pt-2">
                {newPasscode.trim().length >= 4 && (
                  <button
                    type="submit"
                    className="w-full py-2.5 bg-[#D44D2E] hover:bg-[#B83C1F] text-white rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Save New Passkey & Enter Studio</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => {
                    loginAdmin(settings.adminPasscode || '');
                    onSuccess();
                  }}
                  className="w-full py-2.5 bg-[#111111] hover:bg-[#333333] text-white rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                >
                  <span>Enter Studio with Current Passkey</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
