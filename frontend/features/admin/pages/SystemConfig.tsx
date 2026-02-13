import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Save, Mail } from 'lucide-react';

export const SystemConfig: React.FC = () => (
  <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl">
    <div>
      <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-50">System Configuration</h3>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">General settings, email configuration, and global parameters.</p>
    </div>

    <Card>
      <CardHeader>
        <CardTitle className="text-base">General Settings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Company Name</label>
            <Input defaultValue="TradeMatrix Inc." />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Support Email</label>
            <Input defaultValue="support@tradematrix.com" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Currency Symbol</label>
            <Input defaultValue="$ (USD)" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Default Tax Rate (%)</label>
            <Input defaultValue="10.0" type="number" />
          </div>
        </div>
      </CardContent>
    </Card>

    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Mail className="h-4 w-4"/> SMTP Configuration
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">SMTP Host</label>
            <Input defaultValue="smtp.sendgrid.net" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Port</label>
            <Input defaultValue="587" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Username</label>
            <Input type="password" value="********" readOnly />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Password</label>
            <Input type="password" value="********" readOnly />
          </div>
        </div>
        <div className="pt-2 flex justify-end">
            <Button variant="outline" size="sm">Test Connection</Button>
        </div>
      </CardContent>
    </Card>

    <div className="flex justify-end gap-3">
        <Button variant="ghost">Discard Changes</Button>
        <Button><Save className="mr-2 h-4 w-4"/> Save Configuration</Button>
    </div>
  </div>
);