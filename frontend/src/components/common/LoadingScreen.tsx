import React from 'react';
import { useTheme } from '../providers/ThemeProvider';

interface LoadingScreenProps {
  message?: string;
  subMessage?: string;
}

/**
 * Full-screen branded loading overlay.
 * Automatically picks the correct logo variant based on current light/dark theme.
 * - Light mode → /logo-full-black.png (black logo on white background)
 * - Dark mode  → /logo-full.png       (white/colour logo on dark background)
 */
export const LoadingScreen: React.FC<LoadingScreenProps> = ({
  message = 'Loading...',
  subMessage,
}) => {
  const { theme } = useTheme();

  // Resolve 'system' to the actual OS preference
  const effectiveTheme =
    theme === 'system'
      ? window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light'
      : theme;

  const logoSrc = effectiveTheme === 'dark' ? '/logo-full.png' : '/logo-full-black.png';

  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-6">
        <img
          src={logoSrc}
          alt="TradeMatrix"
          className="h-10 w-auto select-none"
          draggable={false}
        />

        {/* Spinner */}
        <div className="h-7 w-7 rounded-full border-[3px] border-brand-100 border-t-brand-600 animate-spin dark:border-brand-900 dark:border-t-brand-400" />

        {/* Text */}
        <div className="flex flex-col items-center gap-1 text-center">
          <p className="text-sm font-medium text-foreground">{message}</p>
          {subMessage && (
            <p className="text-xs text-muted-foreground">{subMessage}</p>
          )}
        </div>
      </div>
    </div>
  );
};
