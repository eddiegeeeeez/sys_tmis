import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Save, Mail, RefreshCcw } from 'lucide-react';
import { AuthConfirmationModal } from '../../../components/common/AuthConfirmationModal';
import { Skeleton } from '../../../components/ui/Skeleton';
import { adminService } from '../services/adminService';
import { SystemSetting } from '../../../types';

export const SystemConfig: React.FC = () => {
  const [settings, setSettings] = useState<SystemSetting[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [pendingChanges, setPendingChanges] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await adminService.getSystemSettings();
      const settingsData = response.data?.data || [];

      if (!Array.isArray(settingsData)) {
        throw new Error('Invalid settings data format');
      }

      setSettings(settingsData);

      // Initialize local changes
      const initialChanges: Record<string, string> = {};
      settingsData.forEach(s => {
        if (s && s.key) {
          initialChanges[s.key] = s.value || '';
        }
      });
      setPendingChanges(initialChanges);
    } catch (err) {
      console.error('Failed to fetch settings:', err);
      setError('Failed to load system configuration. Please check your permissions or try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (key: string, value: string) => {
    setPendingChanges(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSaveInitiate = () => {
    setIsAuthModalOpen(true);
  };

  const handleConfirmSave = async () => {
    setIsAuthModalOpen(false);
    setIsSaving(true);
    try {
      // Update each changed setting
      const changedKeys = Object.keys(pendingChanges).filter(
        key => pendingChanges[key] !== settings.find(s => s.key === key)?.value
      );

      await Promise.all(changedKeys.map(key =>
        adminService.updateSystemSetting(key, pendingChanges[key])
      ));

      await fetchSettings();
      // Success notification could be added here
    } catch (error) {
      console.error('Failed to save settings:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const getGroupedSettings = () => {
    const groups: Record<string, SystemSetting[]> = {};
    settings.forEach(s => {
      if (!groups[s.group]) groups[s.group] = [];
      groups[s.group].push(s);
    });
    return groups;
  };

  const groupedSettings = getGroupedSettings();

  // Sort groups and settings within groups alphabetically
  const sortedGroups = Object.entries(groupedSettings).sort(([a], [b]) => a.localeCompare(b));

  const renderSkeleton = () => (
    <div className="space-y-6 max-w-4xl">
      <div className="space-y-2">
        <Skeleton className="h-7 w-48" />
        <Skeleton className="h-4 w-96" />
      </div>
      {[1, 2].map((i) => (
        <Card key={i}>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((j) => (
                <div key={j} className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-3 w-32" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  if (isLoading) {
    return renderSkeleton();
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center bg-zinc-50 dark:bg-zinc-900/50 rounded-lg border border-dashed">
        <div className="text-red-500 mb-4 font-medium">{error}</div>
        <Button onClick={fetchSettings} variant="outline" size="sm">
          <RefreshCcw className="mr-2 h-4 w-4" />
          Retry
        </Button>
      </div>
    );
  }

  if (settings.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center bg-zinc-50 dark:bg-zinc-900/50 rounded-lg border border-dashed">
        <div className="text-zinc-500 mb-2 font-medium">No Configuration Settings Found</div>
        <p className="text-sm text-zinc-400 max-w-xs mb-6">There are no system settings currently available in the database.</p>
        <Button onClick={fetchSettings} variant="outline" size="sm">
          <RefreshCcw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-50">System Configuration</h3>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">General settings, email configuration, and global parameters.</p>
      </div>

      {sortedGroups.map(([group, groupSettings]) => (
        <Card key={group}>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              {group === 'Email' && <Mail className="h-4 w-4" />}
              {group} Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {[...groupSettings].sort((a, b) => (a.key || '').localeCompare(b.key || '')).map(setting => (
                <div key={setting.key} className="space-y-2">
                  <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    {(setting.key || '').replace(/([A-Z])/g, ' $1').trim()}
                  </label>
                  <Input
                    value={pendingChanges[setting.key] || ''}
                    onChange={(e) => handleInputChange(setting.key, e.target.value)}
                    title={setting.description}
                    type={(setting.key || '').toLowerCase().includes('password') || (setting.key || '').toLowerCase().includes('secret') ? 'password' : 'text'}
                  />
                  {setting.description && <p className="text-xs text-zinc-500">{setting.description}</p>}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}

      <div className="flex justify-end gap-3">
        <Button variant="ghost" onClick={fetchSettings} disabled={isSaving}>Discard Changes</Button>
        <Button onClick={handleSaveInitiate} disabled={isSaving}>
          <Save className="mr-2 h-4 w-4" />
          {isSaving ? 'Saving...' : 'Save Configuration'}
        </Button>
      </div>

      <AuthConfirmationModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onConfirm={handleConfirmSave}
        actionDescription="You are about to modify system-wide configuration settings. This may affect application behavior for all users."
      />
    </div>
  );
};