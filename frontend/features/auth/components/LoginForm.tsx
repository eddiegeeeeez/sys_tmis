import React, { useState } from 'react';
import { cn } from "../../../lib/utils"
import { Button } from "../../../components/ui/Button"
import { Input } from "../../../components/ui/Input"
import { UserRole } from '../../../types';
import { Shield, Users, ShoppingCart, Package } from 'lucide-react';
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
    // Simulate network request
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsLoading(false);
    handleSuccess(UserRole.MANAGER); // Default fallback
  };

  const handleDemoLogin = (role: UserRole) => {
    handleSuccess(role);
  };

  return (
    <div className={cn("grid gap-6", className)} {...props}>
      <div className="flex flex-col space-y-2 text-center">
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

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-zinc-200 dark:border-zinc-800" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-zinc-50 dark:bg-zinc-950 px-2 text-zinc-500">
            Or continue with demo role
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => handleDemoLogin(UserRole.SUPER_ADMIN)}
          className="flex flex-col items-center justify-center gap-2 p-4 rounded-lg border border-zinc-200 bg-white hover:bg-zinc-50 hover:border-zinc-300 transition-all dark:bg-zinc-900 dark:border-zinc-800 dark:hover:bg-zinc-800"
        >
          <Shield className="h-5 w-5 text-red-500" />
          <span className="text-xs font-medium text-zinc-900 dark:text-zinc-200">Super Admin</span>
        </button>
        <button
          onClick={() => handleDemoLogin(UserRole.MANAGER)}
          className="flex flex-col items-center justify-center gap-2 p-4 rounded-lg border border-zinc-200 bg-white hover:bg-zinc-50 hover:border-zinc-300 transition-all dark:bg-zinc-900 dark:border-zinc-800 dark:hover:bg-zinc-800"
        >
          <Users className="h-5 w-5 text-blue-500" />
          <span className="text-xs font-medium text-zinc-900 dark:text-zinc-200">Manager</span>
        </button>
        <button
          onClick={() => handleDemoLogin(UserRole.CASHIER)}
          className="flex flex-col items-center justify-center gap-2 p-4 rounded-lg border border-zinc-200 bg-white hover:bg-zinc-50 hover:border-zinc-300 transition-all dark:bg-zinc-900 dark:border-zinc-800 dark:hover:bg-zinc-800"
        >
          <ShoppingCart className="h-5 w-5 text-emerald-500" />
          <span className="text-xs font-medium text-zinc-900 dark:text-zinc-200">Cashier</span>
        </button>
        <button
          onClick={() => handleDemoLogin(UserRole.INVENTORY_CLERK)}
          className="flex flex-col items-center justify-center gap-2 p-4 rounded-lg border border-zinc-200 bg-white hover:bg-zinc-50 hover:border-zinc-300 transition-all dark:bg-zinc-900 dark:border-zinc-800 dark:hover:bg-zinc-800"
        >
          <Package className="h-5 w-5 text-amber-500" />
          <span className="text-xs font-medium text-zinc-900 dark:text-zinc-200">Clerk</span>
        </button>
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