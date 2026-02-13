import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Database, Activity, CheckCircle, FileText, RefreshCw, AlertTriangle, HardDrive } from 'lucide-react';

export const DatabaseAdmin: React.FC = () => (
  <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
    <div className="flex justify-between items-center">
      <div>
        <h3 className="text-lg font-medium text-zinc-900">Database Administration</h3>
        <p className="text-sm text-zinc-500">Manage backups, migrations, and view database health.</p>
      </div>
      <Button><HardDrive className="mr-2 h-4 w-4"/> Run Manual Backup</Button>
    </div>

    <div className="grid gap-4 md:grid-cols-3">
      <Card className="bg-zinc-50 border-zinc-200">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white rounded-lg border border-zinc-100 shadow-sm">
              <Database className="h-6 w-6 text-zinc-700" />
            </div>
            <div>
              <p className="text-sm font-medium text-zinc-500">Database Size</p>
              <h4 className="text-2xl font-bold text-zinc-900">1.24 GB</h4>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card className="bg-zinc-50 border-zinc-200">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white rounded-lg border border-zinc-100 shadow-sm">
              <CheckCircle className="h-6 w-6 text-emerald-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-zinc-500">Last Backup</p>
              <h4 className="text-2xl font-bold text-zinc-900">2h ago</h4>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card className="bg-zinc-50 border-zinc-200">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white rounded-lg border border-zinc-100 shadow-sm">
              <Activity className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-zinc-500">Connection Pool</p>
              <h4 className="text-2xl font-bold text-zinc-900">45/100</h4>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>

    <Card>
        <CardHeader>
            <CardTitle className="text-base">Backup History & Migrations</CardTitle>
        </CardHeader>
        <CardContent>
            <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center justify-between p-3 border border-zinc-100 rounded-lg bg-white hover:bg-zinc-50 transition-colors">
                        <div className="flex items-center gap-3">
                            <FileText className="h-5 w-5 text-zinc-400" />
                            <div>
                                <p className="text-sm font-medium text-zinc-900">backup_2023_10_{20-i}.sql</p>
                                <p className="text-xs text-zinc-500">October {20-i}, 2023 • 1.2 GB</p>
                            </div>
                        </div>
                        <div className="flex gap-2">
                             <Button size="sm" variant="outline">Download</Button>
                             <Button size="sm" variant="ghost">Restore</Button>
                        </div>
                    </div>
                ))}
            </div>
            
            <div className="mt-6 pt-6 border-t border-zinc-100">
                <h4 className="text-sm font-medium text-zinc-900 mb-3">Advanced Actions</h4>
                <div className="flex gap-4">
                    <Button variant="outline" className="text-zinc-600"><RefreshCw className="mr-2 h-4 w-4"/> Execute Migrations</Button>
                    <Button variant="outline" className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"><AlertTriangle className="mr-2 h-4 w-4"/> Reset Database</Button>
                </div>
            </div>
        </CardContent>
    </Card>
  </div>
);