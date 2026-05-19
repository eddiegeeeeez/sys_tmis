import React, { useState, useRef, useEffect } from 'react';
import { Button } from '../../../components/ui/Button';
import { Alert, AlertDescription } from '../../../components/ui/Alert';
import { AlertCircle, ShieldCheck } from 'lucide-react';
import api from '../../../lib/axios';

interface OtpVerificationModalProps {
  email: string;
  purpose: 'login' | 'password-reset';
  onVerified: (sessionToken: string) => void;
  onCancel: () => void;
}

const OTP_LENGTH = 6;
const RESEND_COOLDOWN = 60; // seconds

/**
 * OTP verification modal.
 *
 * How it works:
 *   1. Renders 6 individual digit inputs for a clean UX.
 *   2. Submits the OTP to POST /api/auth/otp/verify.
 *   3. On success, calls onVerified(sessionToken) so the parent can proceed.
 *   4. Includes a resend button with a 60-second cooldown.
 */
export const OtpVerificationModal: React.FC<OtpVerificationModalProps> = ({
  email,
  purpose,
  onVerified,
  onCancel,
}) => {
  const [digits, setDigits] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [cooldown, setCooldown] = useState(RESEND_COOLDOWN);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Start cooldown timer on mount
  useEffect(() => {
    const timer = setInterval(() => {
      setCooldown(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const otp = digits.join('');

  const handleDigitChange = (index: number, value: string) => {
    // Only accept single digits
    const digit = value.replace(/\D/g, '').slice(-1);
    const newDigits = [...digits];
    newDigits[index] = digit;
    setDigits(newDigits);

    // Auto-advance to next input
    if (digit && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH);
    const newDigits = [...digits];
    pasted.split('').forEach((char, i) => {
      if (i < OTP_LENGTH) newDigits[i] = char;
    });
    setDigits(newDigits);
    // Focus last filled input
    const lastIndex = Math.min(pasted.length, OTP_LENGTH - 1);
    inputRefs.current[lastIndex]?.focus();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== OTP_LENGTH) return;

    setIsLoading(true);
    setError('');

    try {
      const response = await api.post('/auth/otp/verify', {
        email,
        purpose,
        otp,
      });
      onVerified(response.data.sessionToken);
    } catch (err: any) {
      setError(err.response?.data?.message ?? 'Invalid or expired OTP. Please try again.');
      // Clear inputs on failure
      setDigits(Array(OTP_LENGTH).fill(''));
      inputRefs.current[0]?.focus();
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (cooldown > 0) return;
    try {
      await api.post('/auth/otp/request', { email, purpose });
      setCooldown(RESEND_COOLDOWN);
      setError('');
      setDigits(Array(OTP_LENGTH).fill(''));
      inputRefs.current[0]?.focus();
    } catch {
      setError('Failed to resend OTP. Please try again.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-xl bg-white dark:bg-zinc-900 p-6 shadow-2xl space-y-5">
        {/* Header */}
        <div className="flex flex-col items-center gap-2 text-center">
          <div className="p-3 rounded-full bg-brand-50 dark:bg-brand-900/30">
            <ShieldCheck className="h-6 w-6 text-brand-600" />
          </div>
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
            Verify Your Identity
          </h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Enter the 6-digit code sent to{' '}
            <span className="font-medium text-zinc-700 dark:text-zinc-300">
              {maskEmail(email)}
            </span>
          </p>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* OTP Input */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex justify-center gap-2" onPaste={handlePaste}>
            {digits.map((digit, index) => (
              <input
                key={index}
                ref={el => { inputRefs.current[index] = el; }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={e => handleDigitChange(index, e.target.value)}
                onKeyDown={e => handleKeyDown(index, e)}
                disabled={isLoading}
                className="w-11 h-12 text-center text-lg font-semibold rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition disabled:opacity-50"
                aria-label={`OTP digit ${index + 1}`}
              />
            ))}
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={isLoading || otp.length !== OTP_LENGTH}
          >
            {isLoading ? 'Verifying…' : 'Verify Code'}
          </Button>
        </form>

        {/* Resend + Cancel */}
        <div className="flex items-center justify-between text-sm">
          <button
            type="button"
            onClick={handleResend}
            disabled={cooldown > 0}
            className="text-brand-600 hover:underline disabled:text-zinc-400 disabled:no-underline disabled:cursor-not-allowed"
          >
            {cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend code'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

/** Masks an email for display: john@example.com → j***@example.com */
function maskEmail(email: string): string {
  const [local, domain] = email.split('@');
  if (!local || !domain) return email;
  return `${local[0]}***@${domain}`;
}
