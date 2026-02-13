import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Lock, Clock } from 'lucide-react';
import { AUDIT_LOGS } from '../../lib/mockData';

export const Security: React.FC = () => (
  <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
    <div className="flex justify-between items-center">
        <div>
            <h3 className="text-lg font-medium text-zinc-900">Security Management</h3>
            <p className="text-sm text-zinc-500">Password policies, session limits, and audit logs.</p>
        </div>
    </div>

    <div className="grid md:grid-cols-2 gap-6">
        <Card>
            <CardHeader>
                <CardTitle className="text-base flex items-center gap-2"><Lock className="h-4 w-4"/> Password Policy</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                    <label className="text-sm text-zinc-700">Minimum Length</label>
                    <Input className="w-20" type="number" defaultValue="12" />
                </div>
                <div className="flex justify-between items-center">
                    <label className="text-sm text-zinc-700">Require Special Char</label>
                    <input type="checkbox" checked className="accent-zinc-900 h-4 w-4" readOnly />
                </div>
                <div className="flex justify-between items-center">
                    <label className="text-sm text-zinc-700">Password Expiry (days)</label>
                    <Input className="w-20" type="number" defaultValue="90" />
                </div>
                 <div className="flex justify-between items-center">
                    <label className="text-sm text-zinc-700">Session Timeout (mins)</label>
                    <Input className="w-20" type="number" defaultValue="30" />
                </div>
                <Button className="w-full mt-2" variant="secondary">Update Policy</Button>
            </CardContent>
        </Card>

        <Card>
             <CardHeader>
                <CardTitle className="text-base flex items-center gap-2"><Clock className="h-4 w-4"/> Recent Audit Logs</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {AUDIT_LOGS.map((log) => (
                        <div key={log.id} className="flex items-start gap-3 text-sm">
                            <div className={`mt-0.5 h-2 w-2 rounded-full ${log.status === 'Success' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                            <div className="flex-1 space-y-0.5">
                                <p className="font-medium text-zinc-900">{log.action}</p>
                                <p className="text-xs text-zinc-500">{log.user} • {log.time}</p>
                            </div>
                        </div>
                    ))}
                    <Button variant="link" className="w-full text-xs text-zinc-500">View All Logs</Button>
                </div>
            </CardContent>
        </Card>
    </div>
  </div>
);