import React from 'react';
import { LoginForm } from "./LoginForm"
import { UserRole } from '../types';

interface LoginPageProps {
  onLogin: (role?: UserRole) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  return (
    <div className="bg-zinc-100 flex min-h-svh flex-col items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm md:max-w-4xl">
        <LoginForm onLogin={onLogin} />
      </div>
    </div>
  )
}