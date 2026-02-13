import React, { useState } from 'react';
import { cn } from "../lib/utils"
import { Button } from "./ui/Button"
import { Card, CardContent } from "./ui/Card"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "./ui/Field"
import { Input } from "./ui/Input"
import { UserRole } from '../types';

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

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Default login behavior (defaults to Manager if no specific logic)
        onLogin(UserRole.MANAGER);
    };

    const handleDemoLogin = (role: UserRole) => {
        onLogin(role);
    };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden p-0">
        <CardContent className="grid p-0 md:grid-cols-2">
          <form className="p-6 md:p-8" onSubmit={handleSubmit}>
            <FieldGroup>
              <div className="flex flex-col items-center gap-2 text-center">
                <h1 className="text-2xl font-bold">Welcome back</h1>
                <p className="text-zinc-500 text-balance">
                  Login to your TradeMatrix account
                </p>
              </div>
              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </Field>
              <Field>
                <div className="flex items-center">
                  <FieldLabel htmlFor="password">Password</FieldLabel>
                  <a
                    href="#"
                    className="ml-auto text-sm underline-offset-2 hover:underline"
                  >
                    Forgot your password?
                  </a>
                </div>
                <Input 
                    id="password" 
                    type="password" 
                    required 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
              </Field>
              <Field>
                <Button type="submit" className="w-full">Login</Button>
              </Field>
              
              <div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-zinc-200">
                <span className="relative z-10 bg-white px-2 text-zinc-500">
                  Demo Accounts
                </span>
              </div>
              
              <div className="grid gap-2">
                <Button variant="outline" type="button" onClick={() => handleDemoLogin(UserRole.SUPER_ADMIN)} className="w-full justify-between font-normal px-4 h-auto py-2 hover:bg-zinc-50 hover:text-zinc-900 hover:border-zinc-300">
                    <span className="font-medium">Super Admin</span>
                    <span className="text-zinc-500 text-xs">admin@tradematrix.com</span>
                </Button>
                <Button variant="outline" type="button" onClick={() => handleDemoLogin(UserRole.MANAGER)} className="w-full justify-between font-normal px-4 h-auto py-2 hover:bg-zinc-50 hover:text-zinc-900 hover:border-zinc-300">
                     <span className="font-medium">Manager</span>
                     <span className="text-zinc-500 text-xs">manager@tradematrix.com</span>
                </Button>
                 <Button variant="outline" type="button" onClick={() => handleDemoLogin(UserRole.CASHIER)} className="w-full justify-between font-normal px-4 h-auto py-2 hover:bg-zinc-50 hover:text-zinc-900 hover:border-zinc-300">
                     <span className="font-medium">Cashier</span>
                     <span className="text-zinc-500 text-xs">cashier@tradematrix.com</span>
                </Button>
                 <Button variant="outline" type="button" onClick={() => handleDemoLogin(UserRole.INVENTORY_CLERK)} className="w-full justify-between font-normal px-4 h-auto py-2 hover:bg-zinc-50 hover:text-zinc-900 hover:border-zinc-300">
                     <span className="font-medium">Clerk</span>
                     <span className="text-zinc-500 text-xs">clerk@tradematrix.com</span>
                </Button>
              </div>
            </FieldGroup>
          </form>
          <div className="bg-zinc-100 relative hidden md:block border-l border-zinc-200">
            <img
              src="https://images.unsplash.com/photo-1605810230434-7631ac76ec81?q=80&w=2070&auto=format&fit=crop"
              alt="Office"
              className="absolute inset-0 h-full w-full object-cover"
            />
          </div>
        </CardContent>
      </Card>
      <FieldDescription className="px-6 text-center text-xs">
        By clicking continue, you agree to our <a href="#" className="underline">Terms of Service</a>{" "}
        and <a href="#" className="underline">Privacy Policy</a>.
      </FieldDescription>
    </div>
  )
}