import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Badge } from '../../../components/ui/Badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../../components/ui/Table';
import { Select } from '../../../components/ui/Select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../../../components/ui/Dialog';
import { 
  Search, Filter, Download, Eye, AlertTriangle, 
  CheckCircle, XCircle, Calendar, RefreshCw, FileJson, Shield, Monitor 
} from 'lucide-react';
import { EXTENDED_AUDIT_LOGS, LogEntry } from '../../../lib/mockData';

export const Security: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedLog, setSelectedLog] = useState<LogEntry | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  // --- Filtering Logic ---
  const filteredLogs = useMemo(() => {
    return EXTENDED_AUDIT_LOGS.filter(log => {
      const matchesSearch = 
        log.actor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.event.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.actor.ip.includes(searchTerm);
      
      const matchesStatus = statusFilter === 'All' || log.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [searchTerm, statusFilter]);

  const handleViewDetails = (log: LogEntry) => {
    setSelectedLog(log);
    setIsDetailsOpen(true);
  };

  // --- Helpers for UI visuals ---
  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'Success': return <Badge variant="success">Success</Badge>;
      case 'Failure': return <Badge variant="destructive">Failure</Badge>;
      case 'Warning': return <Badge variant="warning">Warning</Badge>;
      default: return <Badge variant="neutral">{status}</Badge>;
    }
  };

  const getSeverityColor = (severity: string) => {
      switch(severity) {
          case 'Critical': return 'text-red-600 dark:text-red-400 font-bold';
          case 'High': return 'text-orange-600 dark:text-orange-400 font-semibold';
          case 'Medium': return 'text-amber-600 dark:text-amber-400';
          default: return 'text-zinc-500 dark:text-zinc-400';
      }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 h-[calc(100vh-100px)] flex flex-col">
      
      {/* Detail Modal */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-2xl bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-zinc-900 dark:text-zinc-50">
                <Shield className="h-5 w-5 text-brand-600 dark:text-brand-500" />
                Audit Log Details
            </DialogTitle>
            <DialogDescription className="font-mono text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                Event ID: {selectedLog?.id}
            </DialogDescription>
          </DialogHeader>
          {selectedLog && (
              <div className="space-y-6 py-2">
                  {/* Status Banner */}
                  <div className={`p-4 rounded-lg border flex items-center justify-between ${
                      selectedLog.status === 'Success' ? 'bg-emerald-50 border-emerald-100 dark:bg-emerald-950/20 dark:border-emerald-900/50' : 
                      selectedLog.status === 'Failure' ? 'bg-red-50 border-red-100 dark:bg-red-950/20 dark:border-red-900/50' : 
                      'bg-amber-50 border-amber-100 dark:bg-amber-950/20 dark:border-amber-900/50'
                  }`}>
                      <div className="flex items-center gap-3">
                          {selectedLog.status === 'Success' ? <CheckCircle className="h-5 w-5 text-emerald-600 dark:text-emerald-500" /> :
                           selectedLog.status === 'Failure' ? <XCircle className="h-5 w-5 text-red-600 dark:text-red-500" /> :
                           <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-500" />}
                          <div className="flex flex-col">
                              <span className={`text-sm font-semibold ${
                                  selectedLog.status === 'Success' ? 'text-emerald-900 dark:text-emerald-200' :
                                  selectedLog.status === 'Failure' ? 'text-red-900 dark:text-red-200' :
                                  'text-amber-900 dark:text-amber-200'
                              }`}>
                                  {selectedLog.event}
                              </span>
                              <span className="text-xs opacity-80 dark:text-zinc-300">{new Date(selectedLog.timestamp).toLocaleString()}</span>
                          </div>
                      </div>
                      <Badge variant={selectedLog.status === 'Success' ? 'success' : selectedLog.status === 'Failure' ? 'destructive' : 'warning'}>
                          {selectedLog.severity} Severity
                      </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-3">
                          <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 border-b border-zinc-100 dark:border-zinc-800 pb-1">Actor</h4>
                          <div className="flex items-center gap-3">
                              <div className="h-8 w-8 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-500 dark:text-zinc-400 font-bold text-xs">
                                  {selectedLog.actor.name.charAt(0)}
                              </div>
                              <div>
                                  <p className="text-sm font-medium text-zinc-900 dark:text-zinc-200">{selectedLog.actor.name}</p>
                                  <p className="text-xs text-zinc-500 dark:text-zinc-400">{selectedLog.actor.email}</p>
                              </div>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-900 p-2 rounded">
                              <Monitor className="h-3 w-3" /> {selectedLog.actor.ip}
                          </div>
                      </div>

                      <div className="space-y-3">
                          <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 border-b border-zinc-100 dark:border-zinc-800 pb-1">Resource</h4>
                          <div>
                              <p className="text-sm font-medium text-zinc-900 dark:text-zinc-200">{selectedLog.resource}</p>
                              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                                  Action performed directly on system resource.
                              </p>
                          </div>
                      </div>
                  </div>
                  
                  <div className="space-y-2">
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 flex items-center gap-2">
                          <FileJson className="h-3 w-3" /> Metadata Payload
                      </h4>
                      <div className="rounded-md bg-zinc-950 dark:bg-black border border-zinc-800 p-4 overflow-x-auto shadow-inner">
                          <pre className="text-xs text-zinc-300 font-mono leading-relaxed">
{JSON.stringify({
    ...selectedLog.metadata,
    status: selectedLog.status,
    resource: selectedLog.resource,
    severity: selectedLog.severity
}, null, 2)}
                          </pre>
                      </div>
                  </div>
              </div>
          )}
        </DialogContent>
      </Dialog>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shrink-0">
        <div>
            <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-50">Audit Logs</h3>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">Comprehensive trail of system activities and security events.</p>
        </div>
        <div className="flex gap-2">
             <Button variant="outline" size="sm"><RefreshCw className="h-4 w-4 mr-2"/> Refresh</Button>
             <Button variant="outline" size="sm"><Download className="h-4 w-4 mr-2"/> Export CSV</Button>
        </div>
      </div>

      <div className="flex-1 flex flex-col min-h-0 space-y-4">
            {/* Filter Bar */}
            <Card className="bg-zinc-50/50 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800 shrink-0">
                <CardContent className="p-4 flex flex-col sm:flex-row gap-4 items-end sm:items-center">
                    <div className="flex-1 w-full relative">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-zinc-400" />
                        <Input 
                            placeholder="Search by User, Event, ID, or IP..." 
                            className="pl-9 bg-white dark:bg-zinc-950"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-2 w-full sm:w-auto">
                         <div className="w-[150px]">
                            <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="bg-white dark:bg-zinc-950">
                                <option value="All">All Statuses</option>
                                <option value="Success">Success</option>
                                <option value="Failure">Failure</option>
                                <option value="Warning">Warning</option>
                            </Select>
                         </div>
                         <div className="w-[180px] relative">
                             <Calendar className="absolute left-2.5 top-2.5 h-4 w-4 text-zinc-400 z-10" />
                             <Input type="date" className="pl-9 bg-white dark:bg-zinc-950" />
                         </div>
                         <Button variant="outline" className="bg-white dark:bg-zinc-950"><Filter className="h-4 w-4 mr-2"/> More</Button>
                    </div>
                </CardContent>
            </Card>

            {/* Data Table */}
            <div className="flex-1 rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden flex flex-col">
                <div className="overflow-auto flex-1">
                    <Table>
                        <TableHeader className="bg-zinc-50 dark:bg-zinc-800/50 sticky top-0 z-10">
                            <TableRow>
                                <TableHead className="w-[180px]">Timestamp</TableHead>
                                <TableHead>Actor</TableHead>
                                <TableHead>Event / Resource</TableHead>
                                <TableHead className="w-[140px]">IP Address</TableHead>
                                <TableHead className="w-[100px]">Status</TableHead>
                                <TableHead className="w-[80px]">Severity</TableHead>
                                <TableHead className="w-[80px] text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredLogs.map((log) => (
                                <TableRow key={log.id} className="group cursor-default hover:bg-zinc-50/80 dark:hover:bg-zinc-800/50">
                                    <TableCell className="font-mono text-xs text-zinc-500 dark:text-zinc-400 whitespace-nowrap">
                                        {new Date(log.timestamp).toLocaleString(undefined, { 
                                            month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' 
                                        })}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span className="font-medium text-sm text-zinc-900 dark:text-zinc-100">{log.actor.name}</span>
                                            <span className="text-xs text-zinc-400">{log.actor.email}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span className="font-mono text-xs font-semibold text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 w-fit px-1.5 py-0.5 rounded border border-zinc-200 dark:border-zinc-700 mb-1">{log.event}</span>
                                            <span className="text-xs text-zinc-500 dark:text-zinc-400 truncate max-w-[200px]" title={log.resource}>{log.resource}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="font-mono text-xs text-zinc-500 dark:text-zinc-400">
                                        {log.actor.ip}
                                    </TableCell>
                                    <TableCell>
                                        {getStatusBadge(log.status)}
                                    </TableCell>
                                    <TableCell>
                                        <span className={`text-xs ${getSeverityColor(log.severity)}`}>{log.severity}</span>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-zinc-100 dark:hover:bg-zinc-700" onClick={() => handleViewDetails(log)}>
                                            <Eye className="h-4 w-4 text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-zinc-50" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {filteredLogs.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center py-10 text-zinc-500 dark:text-zinc-400">
                                        No audit logs found matching your criteria.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
                <div className="border-t border-zinc-200 dark:border-zinc-800 p-2 bg-zinc-50 dark:bg-zinc-900 text-xs text-zinc-500 dark:text-zinc-400 flex justify-between items-center shrink-0">
                    <span>Showing {filteredLogs.length} events</span>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" disabled className="h-7 text-xs">Previous</Button>
                        <Button variant="outline" size="sm" className="h-7 text-xs">Next</Button>
                    </div>
                </div>
            </div>
      </div>
    </div>
  );
};