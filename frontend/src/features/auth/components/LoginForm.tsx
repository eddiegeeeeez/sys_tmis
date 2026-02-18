import React, { useState } from 'react';
import { cn } from "../../../lib/utils"
import { Button } from "../../../components/ui/Button"
import { Input } from "../../../components/ui/Input"
import { UserRole } from '../../../types';

import { useNavigate } from 'react-router-dom';
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
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSuccess = (role: UserRole, token?: string, name?: string) => {
    // If no token is provided (demo mode), create a mock one for session persistence
    const finalToken = token || `demo_token_${role}_${Date.now()}`;
    const finalName = name || `Demo ${role}`;

    // Store token and user info
    localStorage.setItem('token', finalToken);
    localStorage.setItem('user', JSON.stringify({ name: finalName, role, email: email || 'demo@tmis.com' }));

    onLogin(role);

    // Redirect based on role
    if (role === UserRole.SUPER_ADMIN || role === UserRole.SYSTEM_ADMIN) {
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
    setIsLoading(true);
    setError('');

    try {
      const response = await api.post('/auth/login', { email, password });

      const { token, role, name } = response.data;
      handleSuccess(role as UserRole, token, name);
    } catch (err: any) {
      console.error('Login failed:', err);
      const message = err.response?.data?.message || "Invalid credentials or server error";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = (role: UserRole) => {
    handleSuccess(role);
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
        <div className="p-3 text-sm text-red-500 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
          {error}
        </div>
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
              className="bg-white dark:bg-zinc-900"
            />
          </div>
          <div className="grid gap-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-zinc-900 dark:text-zinc-100" htmlFor="password">
                Password
              </label>
              <a href="#" className="text-xs text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300">Forgot password?</a>
            </div>
            <Input
              id="password"
              type="password"
              autoCapitalize="none"
              autoCorrect="off"
              disabled={isLoading}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-white dark:bg-zinc-900"
            />
          </div>
          <Button disabled={isLoading} className="mt-2 w-full">
            {isLoading ? "Signing In..." : "Sign In with Email"}
          </Button>
        </div>
      </form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-zinc-200 dark:border-zinc-800" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-zinc-50 dark:bg-zinc-950 px-2 text-zinc-500">
            Or continue with Demo Accounts
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <Button variant="outline" type="button" onClick={() => handleDemoLogin(UserRole.SUPER_ADMIN as any)} className="text-xs h-9">
          Super Admin
        </Button>
        <Button variant="outline" type="button" onClick={() => handleDemoLogin(UserRole.MANAGER as any)} className="text-xs h-9">
          Manager
        </Button>
        <Button variant="outline" type="button" onClick={() => handleDemoLogin(UserRole.CASHIER as any)} className="text-xs h-9">
          Cashier
        </Button>
        <Button variant="outline" type="button" onClick={() => handleDemoLogin(UserRole.INVENTORY_CLERK as any)} className="text-xs h-9">
          Clerk
        </Button>
      </div>

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