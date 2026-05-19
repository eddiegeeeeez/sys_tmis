import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { KeyRound, Eye, EyeOff, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Alert, AlertDescription } from '../../../components/ui/Alert';
import api from '../../../lib/axios';
import { UserRole } from '../../../types';

interface ForceChangePasswordPageProps {
  onPasswordChanged: () => void;
  currentRole: UserRole;
}

export const ForceChangePasswordPage: React.FC<ForceChangePasswordPageProps> = ({
  onPasswordChanged,
  currentRole,
}) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsLoading(true);
    try {
      await api.post('/auth/change-password', { currentPassword, newPassword });

      // Clear the flag from localStorage
      const savedUser = localStorage.getItem('user');
      if (savedUser) {
        const userData = JSON.parse(savedUser);
        userData.mustChangePassword = false;
        localStorage.setItem('user', JSON.stringify(userData));
      }

      onPasswordChanged();

      // Navigate to default route for the role
      if (currentRole === UserRole.SUPER_ADMIN) {
        navigate('/admin/users', { replace: true });
      } else if (currentRole === UserRole.CASHIER) {
        navigate('/pos', { replace: true });
      } else if (currentRole === UserRole.INVENTORY_CLERK) {
        navigate('/inventory', { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to change password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const strength = newPassword.length === 0
    ? null
    : newPassword.length < 8
      ? 'weak'
      : newPassword.length < 12
        ? 'fair'
        : 'strong';

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-br from-blue-600 to-blue-700 p-8 text-white text-center">
            <div className="flex justify-center mb-4">
              <div className="h-14 w-14 rounded-full bg-white/20 flex items-center justify-center">
                <KeyRound className="h-7 w-7 text-white" />
              </div>
            </div>
            <h1 className="text-2xl font-bold">Create Your Password</h1>
            <p className="text-blue-100 text-sm mt-2">
              Your account requires a new password before you can continue.
            </p>
          </div>

          {/* Body */}
          <div className="p-8 space-y-5">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Current (Temporary) Password */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Current (Temporary) Password
                </label>
                <Input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter your temporary password"
                  disabled={isLoading}
                  autoFocus
                />
              </div>

              {/* New Password */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  New Password
                </label>
                <div className="relative">
                  <Input
                    type={showNew ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Minimum 8 characters"
                    disabled={isLoading}
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNew(!showNew)}
                    className="absolute right-3 top-2.5 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
                  >
                    {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {/* Strength indicator */}
                {strength && (
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex gap-1 flex-1">
                      <div className={`h-1 flex-1 rounded-full transition-colors ${strength !== null ? 'bg-red-400' : 'bg-zinc-200'}`} />
                      <div className={`h-1 flex-1 rounded-full transition-colors ${strength === 'fair' || strength === 'strong' ? 'bg-yellow-400' : 'bg-zinc-200'}`} />
                      <div className={`h-1 flex-1 rounded-full transition-colors ${strength === 'strong' ? 'bg-emerald-500' : 'bg-zinc-200'}`} />
                    </div>
                    <span className={`text-xs font-medium ${strength === 'weak' ? 'text-red-500' : strength === 'fair' ? 'text-yellow-500' : 'text-emerald-600'}`}>
                      {strength === 'weak' ? 'Too short' : strength === 'fair' ? 'Fair' : 'Strong'}
                    </span>
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Confirm Password
                </label>
                <div className="relative">
                  <Input
                    type={showConfirm ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter your new password"
                    disabled={isLoading}
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3 top-2.5 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
                  >
                    {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {confirmPassword.length > 0 && newPassword === confirmPassword && (
                  <p className="text-xs text-emerald-600 flex items-center gap-1 mt-1">
                    <CheckCircle2 className="h-3 w-3" /> Passwords match
                  </p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full mt-2"
                disabled={isLoading || !currentPassword || newPassword.length < 8 || newPassword !== confirmPassword}
              >
                {isLoading ? 'Saving...' : 'Set New Password'}
              </Button>
            </form>
          </div>

          <p className="text-center text-xs text-zinc-400 pb-6">
            Powered by TradeMatrix MIS Security
          </p>
        </div>
      </div>
    </div>
  );
};
