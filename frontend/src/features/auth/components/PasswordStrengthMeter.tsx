import React from 'react';

interface PasswordStrengthMeterProps {
  password: string;
}

interface StrengthResult {
  score: number;       // 0–4
  label: string;
  color: string;
  checks: {
    label: string;
    passed: boolean;
  }[];
}

/**
 * Evaluates password strength against the system's password policy:
 * - Minimum 8 characters
 * - At least one uppercase letter
 * - At least one lowercase letter
 * - At least one digit
 * - At least one special character
 */
export function evaluatePasswordStrength(password: string): StrengthResult {
  const checks = [
    { label: 'At least 8 characters',       passed: password.length >= 8 },
    { label: 'Uppercase letter (A–Z)',       passed: /[A-Z]/.test(password) },
    { label: 'Lowercase letter (a–z)',       passed: /[a-z]/.test(password) },
    { label: 'Number (0–9)',                 passed: /\d/.test(password) },
    { label: 'Special character (!@#$…)',    passed: /[\W_]/.test(password) },
  ];

  const score = checks.filter(c => c.passed).length;

  const labels = ['Very Weak', 'Weak', 'Fair', 'Strong', 'Very Strong'];
  const colors = [
    'bg-red-500',
    'bg-orange-500',
    'bg-yellow-500',
    'bg-blue-500',
    'bg-green-500',
  ];

  return {
    score,
    label: labels[score] ?? 'Very Weak',
    color: colors[score] ?? 'bg-red-500',
    checks,
  };
}

export const PasswordStrengthMeter: React.FC<PasswordStrengthMeterProps> = ({ password }) => {
  if (!password) return null;

  const { score, label, color, checks } = evaluatePasswordStrength(password);
  const segments = 5;

  return (
    <div className="mt-2 space-y-2">
      {/* Strength bar */}
      <div className="flex gap-1">
        {Array.from({ length: segments }).map((_, i) => (
          <div
            key={i}
            className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
              i < score ? color : 'bg-zinc-200 dark:bg-zinc-700'
            }`}
          />
        ))}
      </div>

      {/* Label */}
      <p className="text-xs text-zinc-500 dark:text-zinc-400">
        Password strength: <span className="font-medium text-zinc-700 dark:text-zinc-300">{label}</span>
      </p>

      {/* Checklist */}
      <ul className="space-y-0.5">
        {checks.map((check) => (
          <li
            key={check.label}
            className={`flex items-center gap-1.5 text-xs transition-colors ${
              check.passed
                ? 'text-green-600 dark:text-green-400'
                : 'text-zinc-400 dark:text-zinc-500'
            }`}
          >
            <span className="text-[10px]">{check.passed ? '✓' : '○'}</span>
            {check.label}
          </li>
        ))}
      </ul>
    </div>
  );
};
