import React, { useState } from 'react';
import { cn } from "../../../lib/utils"
import { Button } from "../../../components/ui/Button"
import { Input } from "../../../components/ui/Input"
import { Alert, AlertDescription } from "../../../components/ui/Alert"
import { Eye, EyeOff, AlertCircle } from 'lucide-react';
import { UserRole } from '../../../types';

import { useNavigate, useLocation } from 'react-router-dom';
import api from '../../../lib/axios';

interface LoginFormProps extends React.HTMLAttributes<HTMLDivElement> {
  onLogin: (role?: UserRole) => void;
  className?: string;
}

export function LoginForm({
  className,
  onLogin,
  ...props
}: LoginFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  const handleSuccess = (role: UserRole, token: string, name: string) => {
    // Store token and user info
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify({ name, role, email }));

    onLogin(role);

    // If ProtectedRoute redirected the user here from a specific page, send them back there.
    const from = (location.state as any)?.from?.pathname;
    if (from && from !== '/login') {
      navigate(from, { replace: true });
      return;
    }

    // Default role-based redirect for fresh logins (no prior destination).
    if (role === UserRole.SUPER_ADMIN) {
      navigate('/admin/users');
    } else if (role === UserRole.CASHIER) {
      navigate('/pos');
    } else if (role === UserRole.INVENTORY_CLERK) {
      navigate('/inventory');
    } else {
      navigate('/dashboard');
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) return;

    setIsLoading(true);
    setError('');

    try {
      const response = await api.post('/auth/login', { email: email.trim(), password });

      const { token, role, name } = response.data;
      handleSuccess(role as UserRole, token, name);
    } catch (err: any) {
      const status = err.response?.status;
      const message = err.response?.data?.message;

      if (status === 429) {
        setError(message || "Too many login attempts. Please try again later.");
      } else {
        setError(message || "Invalid credentials or server error");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("grid gap-6", className)} {...props}>
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
          <div className="grid gap-2">
            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-zinc-900 dark:text-zinc-100" htmlFor="email">
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
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-zinc-900 dark:text-zinc-100" htmlFor="password">
                Password
              </label>
              <a href="#" className="text-xs text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300">Forgot password?</a>
            </div>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                autoCapitalize="none"
                autoCorrect="off"
                disabled={isLoading}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                <span className="sr-only">
                  {showPassword ? "Hide password" : "Show password"}
                </span>
              </button>
            </div>
          </div>
          <Button disabled={isLoading} className="mt-2 w-full">
            {isLoading ? "Signing In..." : "Sign In with Email"}
          </Button>
        </div>
      </form>

      <p className="px-8 text-center text-xs text-zinc-500 dark:text-zinc-400">
        By clicking continue, you agree to our{" "}
        <a href="#" className="underline underline-offset-4 hover:text-zinc-900 dark:hover:text-zinc-50">
          Terms of Service
        </a>{" "}
        and{" "}
        <a href="#" className="underline underline-offset-4 hover:text-zinc-900 dark:hover:text-zinc-50">
          Privacy Policy
        </a>
        .
      </p>
    </div>
  )
}