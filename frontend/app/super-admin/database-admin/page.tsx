"use client";
import React, { useState, useEffect } from 'react';
import RoleGuard from "@/components/auth/role-guard";
import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Database, HardDrive, CheckCircle, Activity, RefreshCw, Server, Table, AlertCircle, AlertTriangle, Download, Clock } from 'lucide-react';
import { useAdminNavigation } from '@/lib/hooks/useAdminNavigation';
import { fetchApi } from '@/lib/api';

interface DatabaseInfo {
    server: string;
    database: string;
    isConnected: boolean;
    provider: string;
    appliedMigrations: number;
    pendingMigrations: number;
}

interface DatabaseStatistics {
    users: {
        total: number;
        active: number;
        locked: number;
        inactive: number;
    };
    roleDistribution: { role: string; count: number }[];
}

interface DatabaseHealth {
    status: string;
    connected: boolean;
    responseTime: string;
    pendingMigrations: number;
    message: string;
}

interface ConnectionInfo {
    server: string;
    database: string;
    poolSettings: {
        minSize: string;
        maxSize: string;
        connectionLifetime: string;
    };
    encryption: boolean;
    multipleActiveResultSets: boolean;
}

interface TableInfo {
    tables: {
        name: string;
        rowCount: number;
        schema: string;
    }[];
}

interface BackupInfo {
    hasBackup: boolean;
    lastBackupDate: string | null;
    backupType: string;
    backupSizeMb: number;
    recommendation: string;
}

export default function DatabaseAdminPage() {
    const { currentRole, handleLogout, handleNavigate } = useAdminNavigation();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [dbInfo, setDbInfo] = useState<DatabaseInfo | null>(null);
    const [dbStats, setDbStats] = useState<DatabaseStatistics | null>(null);
    const [dbHealth, setDbHealth] = useState<DatabaseHealth | null>(null);
    const [connInfo, setConnInfo] = useState<ConnectionInfo | null>(null);
    const [tableInfo, setTableInfo] = useState<TableInfo | null>(null);
    const [backupInfo, setBackupInfo] = useState<BackupInfo | null>(null);
    const [migrating, setMigrating] = useState(false);
    const [exporting, setExporting] = useState(false);
    const [backingUp, setBackingUp] = useState(false);

    const fetchDatabaseData = async () => {
        setLoading(true);
        setError(null);
        try {
            const [info, stats, health, conn, tables, backup] = await Promise.all([
                fetchApi('/api/Database/info'),
                fetchApi('/api/Database/statistics'),
                fetchApi('/api/Database/health'),
                fetchApi('/api/Database/connection-info'),
                fetchApi('/api/Database/tables'),
                fetchApi('/api/Database/backup/info')
            ]);

            setDbInfo(info);
            setDbStats(stats);
            setDbHealth(health);
            setConnInfo(conn);
            setTableInfo(tables);
            setBackupInfo(backup);
            setError(null);
        } catch (error: any) {
            console.error('Error fetching database data:', error);
            setError(error?.message || 'Failed to connect to backend API. Please ensure the backend server is running.');
            // Set default values to prevent crashes
            setDbHealth({ status: 'Unhealthy', connected: false, responseTime: 'N/A', pendingMigrations: 0, message: 'Cannot connect to backend' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDatabaseData();
    }, []);

    const handleRunMigrations = async () => {
        setMigrating(true);
        try {
            const result = await fetchApi('/api/Database/migrate', { method: 'POST' });
            alert(result.message);
            await fetchDatabaseData(); // Refresh data
        } catch (error) {
            console.error('Error running migrations:', error);
            alert('Failed to run migrations');
        } finally {
            setMigrating(false);
        }
    };

    const handleExportUsers = async () => {
        setExporting(true);
        try {
            const result = await fetchApi('/api/Database/backup/export-users', { method: 'POST' });
            
            // Create downloadable JSON file
            const dataStr = JSON.stringify(result.data, null, 2);
            const dataBlob = new Blob([dataStr], { type: 'application/json' });
            const url = URL.createObjectURL(dataBlob);
            const link = document.createElement('a');
            link.href = url;
            link.download = result.filename;
            link.click();
            URL.revokeObjectURL(url);
            
            alert(`✓ Exported ${result.recordCount} users successfully`);
        } catch (error) {
            console.error('Error exporting users:', error);
            alert('Failed to export users');
        } finally {
            setExporting(false);
        }
    };

    const handleRequestBackup = async () => {
        setBackingUp(true);
        try {
            const result = await fetchApi('/api/Database/backup/request', { method: 'POST' });
            alert(`${result.message}\n\nProvider: ${result.info.provider}\nFrequency: ${result.info.backupFrequency}\n\n${result.info.recommendation}`);
            await fetchDatabaseData(); // Refresh data
        } catch (error) {
            console.error('Error requesting backup:', error);
            alert('Failed to request backup');
        } finally {
            setBackingUp(false);
        }
    };

    const getHealthColor = (status: string) => {
        switch (status) {
            case 'Healthy': return 'text-emerald-600';
            case 'Warning': return 'text-amber-600';
            case 'Unhealthy': return 'text-red-600';
            default: return 'text-muted-foreground';
        }
    };

    const getHealthIcon = (status: string) => {
        switch (status) {
            case 'Healthy': return <CheckCircle className="h-5 w-5 text-emerald-600" />;
            case 'Warning': return <AlertTriangle className="h-5 w-5 text-amber-600" />;
            case 'Unhealthy': return <AlertCircle className="h-5 w-5 text-red-600" />;
            default: return <Activity className="h-5 w-5 text-muted-foreground" />;
        }
    };

    return (
        <RoleGuard allowedRoles={["SuperAdmin"]}>
            <DashboardLayout
                currentRole={currentRole}
                activeView="admin-db"
                onNavigate={handleNavigate}
                onLogout={handleLogout}
            >
                <div className="space-y-4 pb-6">
                    {/* Header */}
                    <div className="flex justify-between items-center">
                        <div>
                            <h3 className="text-lg font-semibold text-foreground">Database Administration</h3>
                            <p className="text-xs text-muted-foreground mt-0.5">
                                {connInfo ? `${connInfo.server} / ${connInfo.database}` : 'MonsterASP.NET Hosted Database'}
                            </p>
                        </div>
                        <Button 
                            onClick={fetchDatabaseData} 
                            size="sm"
                            variant="outline"
                            disabled={loading}
                        >
                            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loading ? 'animate-spin' : ''}`} /> 
                            Refresh
                        </Button>
                    </div>

                    {/* Error Banner */}
                    {error && (
                        <Card className="border-red-300 bg-red-50">
                            <CardContent className="p-3">
                                <div className="flex items-start gap-2">
                                    <AlertCircle className="h-4 w-4 text-red-600 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <p className="text-xs font-semibold text-red-900">Connection Error</p>
                                        <p className="text-xs text-red-700 mt-0.5">{error}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Key Metrics */}
                    <div className="grid gap-3 md:grid-cols-4">
                        <Card className="border-border">
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-xs text-muted-foreground">Status</p>
                                        <p className={`text-lg font-bold mt-0.5 ${dbHealth?.connected ? 'text-emerald-600' : 'text-red-600'}`}>
                                            {loading ? '...' : dbHealth?.connected ? 'Online' : 'Offline'}
                                        </p>
                                    </div>
                                    {dbHealth && getHealthIcon(dbHealth.status)}
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-border">
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-xs text-muted-foreground">Total Users</p>
                                        <p className="text-lg font-bold text-foreground mt-0.5">
                                            {loading ? '...' : dbStats?.users.total || 0}
                                        </p>
                                    </div>
                                    <Database className="h-4 w-4 text-muted-foreground" />
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-border">
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-xs text-muted-foreground">Migrations</p>
                                        <p className="text-lg font-bold text-foreground mt-0.5">
                                            {loading ? '...' : `${dbInfo?.appliedMigrations || 0} / ${(dbInfo?.appliedMigrations || 0) + (dbInfo?.pendingMigrations || 0)}`}
                                        </p>
                                    </div>
                                    <CheckCircle className="h-4 w-4 text-emerald-600" />
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-border">
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-xs text-muted-foreground">Pool</p>
                                        <p className="text-lg font-bold text-foreground mt-0.5">
                                            {loading ? '...' : connInfo ? `${connInfo.poolSettings.minSize}-${connInfo.poolSettings.maxSize}` : 'N/A'}
                                        </p>
                                    </div>
                                    <Activity className="h-4 w-4 text-muted-foreground" />
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Main Content Grid */}
                    <div className="grid gap-4 md:grid-cols-3">
                        {/* Database Overview (merged with Health & Tables) */}
                        <Card className="border-border">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                                    <Server className="w-4 h-4 text-blue-600" />
                                    Database Overview
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-2 space-y-3">
                                {/* Connection Info */}
                                <div className="space-y-2">
                                    <div className="flex justify-between py-1.5 border-b border-border">
                                        <span className="text-xs text-muted-foreground">Server</span>
                                        <span className="text-xs font-medium text-foreground truncate max-w-[180px]">{loading ? '...' : dbInfo?.server}</span>
                                    </div>
                                    <div className="flex justify-between py-1.5 border-b border-border">
                                        <span className="text-xs text-muted-foreground">Database</span>
                                        <span className="text-xs font-medium text-foreground">{loading ? '...' : dbInfo?.database}</span>
                                    </div>
                                    <div className="flex justify-between py-1.5 border-b border-border">
                                        <span className="text-xs text-muted-foreground">Provider</span>
                                        <span className="text-xs font-medium text-foreground">SQL Server</span>
                                    </div>
                                    <div className="flex justify-between py-1.5 border-b border-border">
                                        <span className="text-xs text-muted-foreground">Encryption</span>
                                        <span className="text-xs font-medium text-emerald-600">
                                            {loading ? '...' : connInfo?.encryption ? 'Enabled' : 'Disabled'}
                                        </span>
                                    </div>
                                    <div className="flex justify-between py-1.5">
                                        <span className="text-xs text-muted-foreground">Response Time</span>
                                        <span className="text-xs font-medium text-foreground">{loading ? '...' : dbHealth?.responseTime}</span>
                                    </div>
                                </div>

                                {/* Health Status */}
                                <div className={`flex items-center gap-2 p-2 rounded text-xs ${dbHealth?.status === 'Healthy' ? 'bg-emerald-50 text-emerald-700' : dbHealth?.status === 'Warning' ? 'bg-amber-50 text-amber-700' : 'bg-red-50 text-red-700'}`}>
                                    {dbHealth && getHealthIcon(dbHealth.status)}
                                    <div>
                                        <p className="font-semibold">{loading ? 'Checking...' : dbHealth?.status}</p>
                                        <p className="text-xs opacity-80">{loading ? '...' : dbHealth?.message}</p>
                                    </div>
                                </div>
                                
                                {/* Database Tables */}
                                <div className="space-y-1.5 pt-2 border-t border-border">
                                    <p className="text-xs text-muted-foreground font-semibold">Database Tables</p>
                                    {loading ? (
                                        <p className="text-xs text-muted-foreground">Loading...</p>
                                    ) : tableInfo?.tables.map((table) => (
                                        <div key={table.name} className="flex justify-between py-1 text-xs">
                                            <span className="text-foreground">{table.name}</span>
                                            <span className="font-semibold text-foreground">{table.rowCount} rows</span>
                                        </div>
                                    ))}
                                </div>

                                {/* Migration Button */}
                                {dbInfo?.pendingMigrations && dbInfo.pendingMigrations > 0 && (
                                    <Button 
                                        onClick={handleRunMigrations} 
                                        size="sm"
                                        className="w-full mt-2" 
                                        disabled={migrating}
                                    >
                                        <Database className="w-3 h-3 mr-1" /> 
                                        {migrating ? 'Running...' : `Run ${dbInfo.pendingMigrations} Pending Migration(s)`}
                                    </Button>
                                )}
                            </CardContent>
                        </Card>

                        {/* User Statistics */}
                        <Card className="border-border">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                                    <Database className="w-4 h-4 text-violet-600" />
                                    User Statistics
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-2 space-y-2">
                                <div className="flex justify-between py-1.5 border-b border-border">
                                    <span className="text-xs text-muted-foreground">Total Users</span>
                                    <span className="text-xs font-bold text-foreground">{loading ? '...' : dbStats?.users.total || 0}</span>
                                </div>
                                <div className="flex justify-between py-1.5 border-b border-border">
                                    <span className="text-xs text-muted-foreground">Active</span>
                                    <span className="text-xs font-bold text-emerald-600">{loading ? '...' : dbStats?.users.active || 0}</span>
                                </div>
                                <div className="flex justify-between py-1.5 border-b border-border">
                                    <span className="text-xs text-muted-foreground">Inactive</span>
                                    <span className="text-xs font-bold text-muted-foreground">{loading ? '...' : dbStats?.users.inactive || 0}</span>
                                </div>
                                <div className="flex justify-between py-1.5">
                                    <span className="text-xs text-muted-foreground">Locked</span>
                                    <span className="text-xs font-bold text-amber-600">{loading ? '...' : dbStats?.users.locked || 0}</span>
                                </div>
                                <div className="mt-3 pt-2 border-t border-border">
                                    <p className="text-xs text-muted-foreground mb-2">Role Distribution</p>
                                    <div className="flex flex-wrap gap-1.5">
                                        {loading ? (
                                            <span className="text-xs text-muted-foreground">Loading...</span>
                                        ) : dbStats?.roleDistribution.map((role) => (
                                            <span key={role.role} className="text-xs px-2 py-0.5 bg-muted rounded">
                                                {role.role}: {role.count}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Database Backup */}
                        <Card className="border-border">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                                    <HardDrive className="w-4 h-4 text-amber-600" />
                                    Database Backup
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-2 space-y-3">
                                {/* Backup Status */}
                                <div className={`p-2 rounded text-xs ${backupInfo?.hasBackup ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                                    <div className="flex items-center gap-2 mb-1">
                                        <Clock className="w-3 h-3" />
                                        <p className="font-semibold">
                                            {loading ? 'Checking...' : backupInfo?.hasBackup ? 'Backup Available' : 'No Recent Backup'}
                                        </p>
                                    </div>
                                    {backupInfo?.lastBackupDate && (
                                        <p className="text-xs opacity-80">
                                            Last: {new Date(backupInfo.lastBackupDate).toLocaleString()}
                                        </p>
                                    )}
                                </div>

                                {/* Backup Info */}
                                <div className="space-y-2">
                                    <div className="flex justify-between py-1.5 border-b border-border">
                                        <span className="text-xs text-muted-foreground">Backup Type</span>
                                        <span className="text-xs font-medium text-foreground">{loading ? '...' : backupInfo?.backupType}</span>
                                    </div>
                                    <div className="flex justify-between py-1.5 border-b border-border">
                                        <span className="text-xs text-muted-foreground">Size</span>
                                        <span className="text-xs font-medium text-foreground">
                                            {loading ? '...' : backupInfo?.backupSizeMb ? `${backupInfo.backupSizeMb} MB` : 'N/A'}
                                        </span>
                                    </div>
                                    <div className="flex justify-between py-1.5">
                                        <span className="text-xs text-muted-foreground">Recommendation</span>
                                        <span className="text-xs font-medium text-foreground truncate max-w-[150px]">
                                            {loading ? '...' : backupInfo?.recommendation}
                                        </span>
                                    </div>
                                </div>

                                {/* Backup Actions */}
                                <div className="space-y-2 pt-2 border-t border-border">
                                    <Button 
                                        onClick={handleRequestBackup} 
                                        size="sm"
                                        variant="outline"
                                        className="w-full" 
                                        disabled={backingUp}
                                    >
                                        <HardDrive className="w-3 h-3 mr-1" /> 
                                        {backingUp ? 'Processing...' : 'Backup Info'}
                                    </Button>
                                    <Button 
                                        onClick={handleExportUsers} 
                                        size="sm"
                                        className="w-full" 
                                        disabled={exporting}
                                    >
                                        <Download className="w-3 h-3 mr-1" /> 
                                        {exporting ? 'Exporting...' : 'Export Users'}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </DashboardLayout>
        </RoleGuard>
    );
}
