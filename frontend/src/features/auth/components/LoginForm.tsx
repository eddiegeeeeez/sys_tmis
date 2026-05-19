import React, { useState, useRef } from 'react';
import ReCAPTCHA from 'react-google-recaptcha';
import { cn } from '../../../lib/utils';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Alert, AlertDescription } from '../../../components/ui/Alert';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';
import { UserRole } from '../../../types';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../../../lib/axios';

// reCAPTCHA v2 site key — read from Vite env variable.
// Set VITE_RECAPTCHA_SITE_KEY in your .env file.
// In development you can use the test key: 6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI
const RECAPTCHA_SITE_KEY =
  import.meta.env.VITE_RECAPTCHA_SITE_KEY ?? '6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI';

interface LoginFormProps extends React.HTMLAttributes<HTMLDivElement> {
  onLogin: (role?: UserRole, mustChangePassword?: boolean) => void;
  className?: string;
}

/**
 * Login form with:
 *  - Email + password inputs
 *  - Google reCAPTCHA v2 widget (bot protection)
 *  - Account lockout / rate-limit error handling
 *
 * How reCAPTCHA works here:
 *   1. The widget renders a checkbox ("I'm not a robot").
 *   2. On solve, Google returns a token to the onChange callback.
 *   3. The token is sent to the backend with the login request.
 *   4. The backend calls Google's siteverify API to validate it.
 *   5. If invalid, the login is rejected before any DB query.
 */
export function LoginForm({ className, onLogin, ...props }: LoginFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null);

  const recaptchaRef = useRef<ReCAPTCHA>(null);
  const navigate = useNavigate();
  const location = useLocation();

  const handleSuccess = (
    role: UserRole,
    token: string,
    name: string,
    mustChangePassword: boolean
  ) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify({ name, role, email, mustChangePassword }));
    onLogin(role, mustChangePassword);

    if (mustChangePassword) {
      navigate('/change-password', { replace: true });
      return;
    }

    const from = (location.state as any)?.from?.pathname;
    if (from && from !== '/login') {
      navigate(from, { replace: true });
      return;
    }

    if (role === UserRole.SUPER_ADMIN) navigate('/admin/users');
    else if (role === UserRole.CASHIER) navigate('/pos');
    else if (role === UserRole.INVENTORY_CLERK) navigate('/inventory');
    else navigate('/dashboard');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) return;

    // Require reCAPTCHA token before submitting
    if (!recaptchaToken) {
      setError('Please complete the reCAPTCHA verification.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await api.post('/auth/login', {
        email: email.trim(),
        password,
        recaptchaToken,
      });

      const { token, role, name, mustChangePassword } = response.data;
      handleSuccess(role as UserRole, token, name, mustChangePassword === true);
    } catch (err: any) {
      const status = err.response?.status;
      const message = err.response?.data?.message;

      if (status === 429) {
        setError(message ?? 'Too many login attempts. Please try again later.');
      } else {
        setError(message ?? 'Invalid credentials or server error.');
      }

      // Reset reCAPTCHA after every failed attempt — tokens are single-use
      recaptchaRef.current?.reset();
      setRecaptchaToken(null);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn('grid gap-6', className)} {...props}>
      <div className="flex flex-col space-y-2 text-center items-center">
        <img src="/logo-icon.png" alt="TradeMatrix" className="h-12 w-12 mb-2" />
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          Sign in to your account
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Enter your email below to access the dashboard
        </p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit}>
        <div className="grid gap-4">
          {/* Email */}
          <div className="grid gap-2">
            <label
              className="text-sm font-medium leading-none text-zinc-900 dark:text-zinc-100"
              htmlFor="email"
            >
              Email
            </label>
            <Input
              id="email"
              placeholder="name@example.com"
              type="email"
              autoCapitalize="none"
              autoComplete="email"
              autoCorrect="off"
              disabled={isLoading}
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
          </div>

          {/* Password */}
          <div className="grid gap-2">
            <label
              className="text-sm font-medium leading-none text-zinc-900 dark:text-zinc-100"
              htmlFor="password"
            >
              Password
            </label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                autoCapitalize="none"
                autoCorrect="off"
                disabled={isLoading}
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          {/* reCAPTCHA v2 widget
              - Uses the test key in development (always passes)
              - Replace VITE_RECAPTCHA_SITE_KEY with your real site key in production
          */}
          <div className="flex justify-center">
            <ReCAPTCHA
              ref={recaptchaRef}
              sitekey={RECAPTCHA_SITE_KEY}
              onChange={token => setRecaptchaToken(token)}
              onExpired={() => setRecaptchaToken(null)}
              onError={() => {
                setRecaptchaToken(null);
                setError('reCAPTCHA failed to load. Please refresh the page.');
              }}
            />
          </div>

          <Button
            disabled={isLoading || !recaptchaToken}
            className="mt-2 w-full"
          >
            {isLoading ? 'Signing In…' : 'Sign In with Email'}
          </Button>
        </div>
      </form>

      <p className="px-8 text-center text-xs text-zinc-500 dark:text-zinc-400">
        Protected by reCAPTCHA · TradeMatrix MIS Security
      </p>
    </div>
  );
}
