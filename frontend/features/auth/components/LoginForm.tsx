import React, { useState } from 'react';
import { cn } from "../../../lib/utils"
import { Button } from "../../../components/ui/Button"
import { Input } from "../../../components/ui/Input"
import { UserRole } from '../../../types';

import { useNavigate } from 'react-router-dom';

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
  const navigate = useNavigate();

  const handleSuccess = (role: UserRole) => {
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

    // Simulate network request with delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Mock Authentication Logic
    const mockUsers = {
      'admin@tmis.com': UserRole.SUPER_ADMIN,
      'manager@tmis.com': UserRole.MANAGER,
      'cashier@tmis.com': UserRole.CASHIER,
      'clerk@tmis.com': UserRole.INVENTORY_CLERK
    };

    const role = mockUsers[email as keyof typeof mockUsers];

    // Simple password check (allow 'password' or '123456')
    if (role && (password === 'password' || password === '123456')) {
      setIsLoading(false);
      handleSuccess(role);
    } else {
      setIsLoading(false);
      alert("Invalid credentials. Try using the mock accounts below.");
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