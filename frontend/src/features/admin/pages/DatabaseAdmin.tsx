import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Database, Activity, CheckCircle, FileText, RefreshCw, AlertTriangle, HardDrive, Download, Shield } from 'lucide-react';
import { AuthConfirmationModal } from '../../../components/common/AuthConfirmationModal';
import { Skeleton } from '../../../components/ui/Skeleton';
import { adminService } from '../services/adminService';

interface DatabaseInfo {
  server: string;
  database: string;
  isConnected: boolean;
  appliedMigrations: number;
  pendingMigrations: number;
}

interface DatabaseStats {
  users: {
    total: number;
    active: number;
    locked: number;
  };
  roleDistribution: Array<{ role: string, count: number }>;
}

interface DatabaseHealth {
  status: string;
  connected: boolean;
  message: string;
}

export const DatabaseAdmin: React.FC = () => {
  const [info, setInfo] = useState<DatabaseInfo | null>(null);
  const [stats, setStats] = useState<DatabaseStats | null>(null);
  const [health, setHealth] = useState<DatabaseHealth | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [activeAction, setActiveAction] = useState<{ id: string, description: string, fn: () => Promise<void> } | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [infoRes, statsRes, healthRes] = await Promise.all([
        adminService.getDatabaseInfo(),
        adminService.getDatabaseStats(),
        adminService.getDatabaseHealth()
      ]);
      setInfo(infoRes.data.data as unknown as DatabaseInfo);
      setStats(statsRes.data.data as unknown as DatabaseStats);
      setHealth(healthRes.data.data as unknown as DatabaseHealth);
    } catch (error) {
      console.error('Failed to fetch database data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleActionInitiate = (id: string, description: string, fn: () => Promise<void>) => {
    setActiveAction({ id, description, fn });
    setIsAuthModalOpen(true);
  };

  const handleConfirmAction = async () => {
    if (!activeAction) return;
    setIsAuthModalOpen(false);
    setIsActionLoading(true);
    try {
      await activeAction.fn();
      await fetchData();
    } catch (error) {
      console.error(`Action ${activeAction.id} failed:`, error);
    } finally {
      setIsActionLoading(false);
      setActiveAction(null);
    }
  };

  const runBackup = async () => {
    const res = await adminService.runDatabaseBackup();
    alert(res.data.message);
  };

  const runMigrations = async () => {
    const res = await adminService.runDatabaseMigrations();
    alert(res.data.message);
  };

  const exportUsers = async () => {
    try {
      const res = await adminService.exportUsers();
      const payload = res.data.data;
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(payload.data, null, 2));
      const downloadAnchorNode = document.createElement('a');
      downloadAnchorNode.setAttribute("href", dataStr);
      downloadAnchorNode.setAttribute("download", payload.filename);
      document.body.appendChild(downloadAnchorNode);
      downloadAnchorNode.click();
      downloadAnchorNode.remove();
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  const renderSkeleton = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="space-y-2">
          <Skeleton className="h-7 w-64" />
          <Skeleton className="h-4 w-96" />
        </div>
        <Skeleton className="h-10 w-48" />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <Skeleton className="h-12 w-12 rounded-lg" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-7 w-20" />
                  <Skeleton className="h-3 w-32" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="flex items-center justify-between p-4 border border-zinc-100 dark:border-zinc-800 rounded-lg">
              <div className="flex items-center gap-3">
                <Skeleton className="h-5 w-5 rounded" />
                <div className="space-y-1">
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-3 w-64" />
                </div>
              </div>
              <Skeleton className="h-8 w-24" />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );

  if (isLoading) {
    return renderSkeleton();
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-50">Database Administration</h3>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">Manage backups, migrations, and view database health.</p>
        </div>
        <Button
          onClick={() => handleActionInitiate('backup', 'Request an automated backup of the system database.', runBackup)}
          disabled={isActionLoading}
        >
          <HardDrive className="mr-2 h-4 w-4" /> Run Manual Backup
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-zinc-50 border-zinc-200 dark:bg-zinc-900 dark:border-zinc-800">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white dark:bg-zinc-800 rounded-lg border border-zinc-100 dark:border-zinc-700 shadow-sm">
                <Database className="h-6 w-6 text-zinc-700 dark:text-zinc-300" />
              </div>
              <div>
                <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Database Status</p>
                <h4 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
                  {info?.isConnected ? 'Connected' : 'Offline'}
                </h4>
                <p className="text-xs text-zinc-400 truncate max-w-[150px]">{info?.database}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-zinc-50 border-zinc-200 dark:bg-zinc-900 dark:border-zinc-800">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white dark:bg-zinc-800 rounded-lg border border-zinc-100 dark:border-zinc-700 shadow-sm">
                <CheckCircle className={`h-6 w-6 ${health?.status === 'Healthy' ? 'text-emerald-600' : 'text-amber-600'}`} />
              </div>
              <div>
                <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">System Health</p>
                <h4 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">{health?.status || 'Unknown'}</h4>
                <p className="text-xs text-zinc-400">{health?.message}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-zinc-50 border-zinc-200 dark:bg-zinc-900 dark:border-zinc-800">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white dark:bg-zinc-800 rounded-lg border border-zinc-100 dark:border-zinc-700 shadow-sm">
                <Activity className="h-6 w-6 text-blue-600 dark:text-blue-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Users Count</p>
                <h4 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">{stats?.users.total || 0}</h4>
                <p className="text-xs text-zinc-400">{stats?.users.active} active users</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Database Operations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border border-zinc-100 dark:border-zinc-800 rounded-lg bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-zinc-400" />
                <div>
                  <p className="text-sm font-medium text-zinc-900 dark:text-zinc-200">Export User Data (Backup)</p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">Download a JSON snapshot of all current users and their roles.</p>
                </div>
              </div>
              <Button size="sm" variant="outline" onClick={exportUsers}>
                <Download className="mr-2 h-4 w-4" /> Download JSON
              </Button>
            </div>

            <div className="flex items-center justify-between p-4 border border-zinc-100 dark:border-zinc-800 rounded-lg bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
              <div className="flex items-center gap-3">
                <Shield className="h-5 w-5 text-zinc-400" />
                <div>
                  <p className="text-sm font-medium text-zinc-900 dark:text-zinc-200">Database Migrations</p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    {info?.pendingMigrations === 0
                      ? 'All migrations are up to date.'
                      : `There are ${info?.pendingMigrations} pending migrations.`}
                  </p>
                </div>
              </div>
              <Button
                size="sm"
                variant="outline"
                disabled={info?.pendingMigrations === 0 || isActionLoading}
                onClick={() => handleActionInitiate('migrate', 'Execute pending Entity Framework migrations to update the database schema.', runMigrations)}
              >
                <RefreshCw className={`mr-2 h-4 w-4 ${isActionLoading && activeAction?.id === 'migrate' ? 'animate-spin' : ''}`} /> Execute
              </Button>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-zinc-100 dark:border-zinc-800">
            <h4 className="text-sm font-medium text-red-600 dark:text-red-400 mb-3 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" /> Danger Zone
            </h4>
            <div className="p-4 border border-red-100 dark:border-red-900/30 rounded-lg bg-red-50/30 dark:bg-red-900/10">
              <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">
                These actions are destructive and should only be performed under supervision.
              </p>
              <div className="flex gap-4">
                <Button variant="outline" className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 dark:border-red-900/50 border-red-200">
                  Reset Database
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <AuthConfirmationModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onConfirm={handleConfirmAction}
        actionDescription={activeAction?.description || ''}
      />
    </div>
  );
};