import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../ui/Dialog';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Label } from '../ui/Label';
import { Lock } from 'lucide-react';

interface AuthConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  actionDescription: string;
}

export const AuthConfirmationModal: React.FC<AuthConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  actionDescription
}) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Simulate auth check delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Demo logic: Accept any password longer than 3 chars for prototype
    if (password.length > 3) { 
       onConfirm();
       setPassword('');
    } else {
       setError('Authentication failed. Please verify your credentials.');
    }
    setIsLoading(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-amber-700">
            <Lock className="h-5 w-5" />
            Security Verification
          </DialogTitle>
          <DialogDescription className="pt-2 text-zinc-600">
            {actionDescription}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleConfirm} className="space-y-4">
            <div className="bg-amber-50/50 p-3 rounded-md border border-amber-100 text-sm text-amber-900 mt-2">
                Please enter your password to confirm this action.
            </div>

            <div className="space-y-2">
                <Label htmlFor="auth-password">Password</Label>
                <Input 
                    id="auth-password"
                    type="password" 
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setError(''); }}
                    placeholder="Enter your password"
                    autoFocus
                    className="border-zinc-300 focus:border-amber-500 focus:ring-amber-500"
                />
                {error && <p className="text-xs text-red-600 font-medium animate-in slide-in-from-top-1">{error}</p>}
            </div>
            
            <DialogFooter className="pt-2">
                <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>Cancel</Button>
                <Button type="submit" disabled={!password || isLoading} className="bg-amber-600 hover:bg-amber-700 text-white border-transparent">
                    {isLoading ? 'Verifying...' : 'Confirm Changes'}
                </Button>
            </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};