import React from 'react';
import { LoginForm } from "../components/LoginForm"
import { UserRole } from '../../../types';
import { CircuitBoard } from 'lucide-react';

interface LoginPageProps {
  onLogin: (role?: UserRole) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  return (
    <div className="min-h-screen w-full lg:grid lg:grid-cols-2">
      {/* Left Column: Branding / Visuals */}
      <div className="hidden lg:flex flex-col justify-between bg-gradient-to-br from-brand-900 to-brand-950 p-10 text-white relative overflow-hidden">
        {/* Abstract Background Pattern */}
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <svg className="h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <defs>
              <pattern id="grid" width="8" height="8" patternUnits="userSpaceOnUse">
                <path d="M 8 0 L 0 0 0 8" fill="none" stroke="currentColor" strokeWidth="0.5" />
              </pattern>
              <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style={{ stopColor: '#0ea5e9', stopOpacity: 1 }} />
                <stop offset="100%" style={{ stopColor: '#f59e0b', stopOpacity: 1 }} />
              </linearGradient>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
            <circle cx="90" cy="10" r="20" fill="url(#grad1)" opacity="0.3" filter="blur(20px)" />
            <circle cx="10" cy="90" r="30" fill="#2563eb" opacity="0.2" filter="blur(40px)" />
          </svg>
        </div>

        <div className="relative z-10 flex items-center gap-3">
          <img
            src="/logo-full.png"
            alt="TradeMatrix MIS"
            className="h-12 w-auto"
          />
        </div>

        <div className="relative z-10 max-w-md">
          <blockquote className="space-y-2">
            <p className="text-lg font-medium leading-relaxed text-brand-50">
              "This platform has completely transformed how we manage our retail operations. The real-time inventory tracking and HR integration are game changers."
            </p>
            <footer className="text-sm text-brand-200/60">
              Sofia Davis, Operations Director
            </footer>
          </blockquote>
        </div>

        <div className="relative z-10 text-xs text-brand-300/50">
          © 2024 TradeMatrix Inc. All rights reserved.
        </div>
      </div>

      {/* Right Column: Form */}
      <div className="flex items-center justify-center p-6 bg-zinc-50 transition-colors duration-300">
        <div className="w-full max-w-[400px] space-y-6">
          {/* Mobile Logo for small screens */}
          <div className="lg:hidden flex items-center gap-2 mb-8 justify-center text-zinc-900">
            <div className="p-1.5 bg-brand-600 rounded">
              <CircuitBoard size={20} className="text-white" />
            </div>
            <span className="text-xl font-bold">TradeMatrix</span>
          </div>

          <LoginForm onLogin={onLogin} />
        </div>
      </div>
    </div>
  )
}