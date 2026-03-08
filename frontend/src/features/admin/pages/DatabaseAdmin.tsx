import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { Database, Activity, CheckCircle, CheckCircle2, FileText, RefreshCw, AlertTriangle, HardDrive, Download, Shield, Clock, ExternalLink, Loader2, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '../../../components/ui/Alert';
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

interface BackupRecord {
  id: number;
  fileName: string;
  s3Url?: string;
  fileSizeBytes: number;
  triggeredBy: string;
  status: 'Success' | 'Failed';
  errorMessage?: string;
  createdAt: string;
}

const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '—';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
};

const formatDatePHT = (iso: string): string => {
  return new Date(iso).toLocaleString('en-PH', {
    timeZone: 'Asia/Manila',
    month: 'short', day: 'numeric', year: 'numeric',
    hour: '2-digit', minute: '2-digit', hour12: true
  });
};

export const DatabaseAdmin: React.FC = () => {
  const [info, setInfo] = useState<DatabaseInfo | null>(null);
  const [stats, setStats] = useState<DatabaseStats | null>(null);
  const [health, setHealth] = useState<DatabaseHealth | null>(null);
  const [backups, setBackups] = useState<BackupRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isBackupsLoading, setIsBackupsLoading] = useState(true);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [activeAction, setActiveAction] = useState<{ id: string, description: string, fn: () => Promise<void> } | null>(null);
  const [actionFeedback, setActionFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const fetchData = useCallback(async () => {
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
  }, []);

  const fetchBackups = useCallback(async () => {
    setIsBackupsLoading(true);
    try {
      const res = await adminService.getBackupHistory();
      if (res.data.success) setBackups(res.data.data as unknown as BackupRecord[]);
    } catch {
      setBackups([]);
    } finally {
      setIsBackupsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    fetchBackups();
  }, [fetchData, fetchBackups]);

  // Auto-dismiss feedback
  useEffect(() => {
    if (!actionFeedback) return;
    const t = setTimeout(() => setActionFeedback(null), 5000);
    return () => clearTimeout(t);
  }, [actionFeedback]);

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
    } catch (error: any) {
      setActionFeedback({ type: 'error', message: error?.response?.data?.message || 'Action failed.' });
    } finally {
      setIsActionLoading(false);
      setActiveAction(null);
    }
  };

  const runBackup = async () => {
    const res = await adminService.runDatabaseBackup();
    if (res.data.success) {
      setActionFeedback({ type: 'success', message: `Backup created: ${res.data.data?.fileName}` });
      await fetchBackups();
    } else {
      setActionFeedback({ type: 'error', message: res.data.message || 'Backup failed.' });
    }
  };

  const runMigrations = async () => {
    const res = await adminService.runDatabaseMigrations();
    setActionFeedback({
      type: res.data.success ? 'success' : 'error',
      message: res.data.message || 'Migrations completed.'
    });
  };

  const exportUsers = async () => {
    try {
      const res = await adminService.exportUsers();
      const payload = res.data.data;
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(payload.data, null, 2));
      const a = document.createElement('a');
      a.href = dataStr;
      a.download = payload.filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
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
        <CardHeader><Skeleton className="h-6 w-48" /></CardHeader>
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

  if (isLoading) return renderSkeleton();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-50">Database Administration</h3>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">Manage backups, migrations, and view database health.</p>
        </div>
        <Button
          onClick={() => handleActionInitiate('backup', 'Create a full JSON backup of all system data and upload it to S3 storage.', runBackup)}
          disabled={isActionLoading}
        >
          {isActionLoading && activeAction?.id === 'backup'
            ? <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            : <HardDrive className="mr-2 h-4 w-4" />}
          Run Manual Backup
        </Button>
      </div>

      {/* Action feedback */}
      {actionFeedback && (
        <Alert variant={actionFeedback.type === 'success' ? 'success' : 'destructive'}>
          {actionFeedback.type === 'success'
            ? <CheckCircle2 className="h-4 w-4" />
            : <AlertCircle className="h-4 w-4" />}
          <AlertDescription>{actionFeedback.message}</AlertDescription>
        </Alert>
      )}

      {/* Status cards */}
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
      {/* Operations */}
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
        </CardContent>
      </Card>

      {/* Backup History */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-zinc-400" />
            <CardTitle className="text-base">Backup History</CardTitle>
          </div>
          <p className="text-xs text-zinc-400">Automatic backups run daily at 12:00 AM PHT · Last 30 kept</p>
        </CardHeader>
        <CardContent>
          {isBackupsLoading ? (
            <div className="space-y-3">
              {[1,2,3].map(i => <Skeleton key={i} className="h-12 w-full" />)}
            </div>
          ) : backups.length === 0 ? (
            <div className="text-center py-10 text-zinc-400 dark:text-zinc-500">
              <HardDrive className="h-8 w-8 mx-auto mb-2 opacity-40" />
              <p className="text-sm">No backups yet. Run a manual backup or wait for tonight's automatic backup.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-100 dark:border-zinc-800">
                    <th className="text-left py-2 pr-4 text-xs font-semibold text-zinc-500 dark:text-zinc-400">Date &amp; Time (PHT)</th>
                    <th className="text-left py-2 pr-4 text-xs font-semibold text-zinc-500 dark:text-zinc-400">File Name</th>
                    <th className="text-left py-2 pr-4 text-xs font-semibold text-zinc-500 dark:text-zinc-400">Size</th>
                    <th className="text-left py-2 pr-4 text-xs font-semibold text-zinc-500 dark:text-zinc-400">Triggered By</th>
                    <th className="text-left py-2 pr-4 text-xs font-semibold text-zinc-500 dark:text-zinc-400">Status</th>
                    <th className="text-right py-2 text-xs font-semibold text-zinc-500 dark:text-zinc-400">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-50 dark:divide-zinc-800/60">
                  {backups.map(b => (
                    <tr key={b.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors">
                      <td className="py-3 pr-4 text-zinc-700 dark:text-zinc-300 whitespace-nowrap text-xs">
                        {formatDatePHT(b.createdAt)}
                      </td>
                      <td className="py-3 pr-4 font-mono text-xs text-zinc-500 dark:text-zinc-400 max-w-[180px] truncate">
                        {b.fileName}
                      </td>
                      <td className="py-3 pr-4 text-xs text-zinc-500 dark:text-zinc-400 whitespace-nowrap">
                        {formatBytes(b.fileSizeBytes)}
                      </td>
                      <td className="py-3 pr-4 text-xs text-zinc-700 dark:text-zinc-300">
                        {b.triggeredBy === 'Automatic'
                          ? <span className="flex items-center gap-1"><Clock className="h-3 w-3 text-blue-500" /> Automatic</span>
                          : <span className="flex items-center gap-1"><Shield className="h-3 w-3 text-zinc-400" /> {b.triggeredBy}</span>}
                      </td>
                      <td className="py-3 pr-4">
                        {b.status === 'Success'
                          ? <Badge variant="success" className="text-xs">Success</Badge>
                          : <span title={b.errorMessage ?? ''}><Badge variant="destructive" className="text-xs cursor-help">Failed</Badge></span>}
                      </td>
                      <td className="py-3 text-right">
                        {b.s3Url
                          ? <a href={b.s3Url} target="_blank" rel="noopener noreferrer" download={b.fileName}>
                              <Button size="sm" variant="outline" className="h-7 text-xs px-2">
                                <ExternalLink className="mr-1 h-3 w-3" /> Download
                              </Button>
                            </a>
                          : <span className="text-xs text-zinc-400">—</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
      </div>

      <AuthConfirmationModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onConfirm={handleConfirmAction}
        actionDescription={activeAction?.description || ''}
      />
    </div>
  );
};