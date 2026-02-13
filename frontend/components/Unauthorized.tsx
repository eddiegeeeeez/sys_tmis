import React from 'react';
import { ShieldAlert } from 'lucide-react';
import { Button } from './ui/Button';

interface UnauthorizedProps {
  onBack: () => void;
}

export const Unauthorized: React.FC<UnauthorizedProps> = ({ onBack }) => {
  return (
    <div className="h-[80vh] flex flex-col items-center justify-center text-center space-y-6 animate-in fade-in zoom-in duration-300">
      <div className="h-24 w-24 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-4">
        <ShieldAlert className="h-12 w-12" />
      </div>
      <div className="space-y-2 max-w-md">
        <h1 className="text-3xl font-bold text-zinc-900">Access Denied</h1>
        <p className="text-zinc-500">
          You do not have permission to view this page. Please contact your system administrator if you believe this is an error.
        </p>
      </div>
      <Button onClick={onBack} size="lg">
        Return to Dashboard
      </Button>
    </div>
  );
};