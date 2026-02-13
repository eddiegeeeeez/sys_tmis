import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../../components/ui/Table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../../../components/ui/Dialog';
import { Input } from '../../../components/ui/Input';
import { Label } from '../../../components/ui/Label';
import { LayoutGrid, List, Plus, Shield, Users, Eye, Edit } from 'lucide-react';
import { ROLES_LIST, ALL_PERMISSIONS } from '../../../lib/mockData';
import { AuthConfirmationModal } from '../../../components/common/AuthConfirmationModal';

// Helper to simulate data fetching for permissions
const getRolePermissions = (roleName: string) => {
    if (roleName.includes('Admin')) return ALL_PERMISSIONS;
    if (roleName === 'Manager') return ALL_PERMISSIONS.filter(p => !p.includes('database') && !p.includes('roles'));
    if (roleName === 'Cashier') return ['view_pos', 'process_transactions', 'view_inventory'];
    if (roleName === 'Inventory Clerk') return ['view_inventory', 'manage_inventory'];
    return ['view_dashboard'];
};

interface RoleManagementProps {
    onNavigate: (view: string) => void;
}

export const RoleManagement: React.FC<RoleManagementProps> = ({ onNavigate }) => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isCreateRoleOpen, setIsCreateRoleOpen] = useState(false);
  const [viewingRole, setViewingRole] = useState<any | null>(null);
  
  // Create Role State
  const [newRoleName, setNewRoleName] = useState('');
  const [newRoleDesc, setNewRoleDesc] = useState('');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  
  const handleEditClick = (roleName: string) => {
    // Navigate to the editor page instead of opening a modal
    onNavigate(`admin-roles-edit|${roleName}`);
  };

  const handleCreateRoleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      setIsAuthModalOpen(true);
  };

  const handleAuthConfirm = () => {
      console.log(`Creating new role: ${newRoleName} - ${newRoleDesc}`);
      // Close modals
      setIsAuthModalOpen(false);
      setIsCreateRoleOpen(false);
      // Reset form
      setNewRoleName('');
      setNewRoleDesc('');
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 relative">
      
      {/* Auth Confirmation Modal for Create Role */}
      <AuthConfirmationModal 
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onConfirm={handleAuthConfirm}
        actionDescription={`You are about to create a new system role: "${newRoleName}". This will allow you to assign permissions to users under this role.`}
      />

      {/* Create Role Modal */}
      <Dialog open={isCreateRoleOpen} onOpenChange={setIsCreateRoleOpen}>
        <DialogContent className="bg-white dark:bg-zinc-900 dark:border-zinc-800">
            <DialogHeader>
                <DialogTitle className="text-zinc-900 dark:text-zinc-50">Create New Role</DialogTitle>
                <DialogDescription className="text-zinc-500 dark:text-zinc-400">Define a new role to assign to system users.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateRoleSubmit} className="space-y-4 py-4">
                <div className="space-y-2">
                    <Label className="text-zinc-900 dark:text-zinc-200">Role Name</Label>
                    <Input 
                        placeholder="e.g. Regional Manager" 
                        required 
                        value={newRoleName}
                        onChange={(e) => setNewRoleName(e.target.value)}
                        className="dark:bg-zinc-950 dark:border-zinc-800"
                    />
                </div>
                <div className="space-y-2">
                    <Label className="text-zinc-900 dark:text-zinc-200">Description</Label>
                    <Input 
                        placeholder="Brief description of responsibilities" 
                        required 
                        value={newRoleDesc}
                        onChange={(e) => setNewRoleDesc(e.target.value)}
                        className="dark:bg-zinc-950 dark:border-zinc-800"
                    />
                </div>
                 <div className="p-3 bg-zinc-50 border border-zinc-100 rounded-md text-sm text-zinc-500 dark:bg-zinc-800/50 dark:border-zinc-800 dark:text-zinc-400">
                    <p className="flex items-center gap-2"><Shield className="h-4 w-4"/> Permissions can be configured after creation.</p>
                </div>
                <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setIsCreateRoleOpen(false)}>Cancel</Button>
                    <Button type="submit">Create Role</Button>
                </DialogFooter>
            </form>
        </DialogContent>
      </Dialog>

      {/* View Details Modal */}
      <Dialog open={!!viewingRole} onOpenChange={(open) => !open && setViewingRole(null)}>
        <DialogContent className="bg-white dark:bg-zinc-900 dark:border-zinc-800">
            <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-zinc-900 dark:text-zinc-50">
                    <Shield className="h-5 w-5 text-zinc-500 dark:text-zinc-400"/>
                    {viewingRole?.name}
                </DialogTitle>
                <DialogDescription className="text-zinc-500 dark:text-zinc-400">Role Details and Usage</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <Label className="text-zinc-500 dark:text-zinc-400 text-xs uppercase tracking-wider">Status</Label>
                        <div className="font-medium text-sm text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                            <Badge variant="success">Active</Badge>
                        </div>
                    </div>
                     <div className="space-y-1">
                        <Label className="text-zinc-500 dark:text-zinc-400 text-xs uppercase tracking-wider">Users Assigned</Label>
                        <div className="flex items-center gap-2 font-medium text-sm text-zinc-900 dark:text-zinc-200">
                            <Users className="h-4 w-4 text-zinc-400 dark:text-zinc-500"/> {viewingRole?.users}
                        </div>
                    </div>
                </div>
                <div className="space-y-1">
                     <Label className="text-zinc-500 dark:text-zinc-400 text-xs uppercase tracking-wider">Description</Label>
                     <p className="text-sm text-zinc-700 bg-zinc-50 p-3 rounded-md border border-zinc-100 dark:bg-zinc-950 dark:border-zinc-800 dark:text-zinc-300">
                        {viewingRole?.desc}
                     </p>
                </div>
                
                <div className="space-y-2">
                    <Label className="text-zinc-500 dark:text-zinc-400 text-xs uppercase tracking-wider">Configured Permissions</Label>
                    <div className="flex flex-wrap gap-1.5 p-3 bg-zinc-50 rounded-md border border-zinc-100 max-h-[150px] overflow-y-auto dark:bg-zinc-950 dark:border-zinc-800">
                        {viewingRole && getRolePermissions(viewingRole.name).map((p: string) => (
                            <Badge key={p} variant="secondary" className="text-xs font-normal border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800">
                                {p.replace(/_/g, ' ')}
                            </Badge>
                        ))}
                    </div>
                </div>

                <div className="pt-2">
                    <Button className="w-full" variant="outline" onClick={() => {
                        const roleName = viewingRole?.name;
                        setViewingRole(null);
                        handleEditClick(roleName);
                    }}>
                        <Edit className="h-4 w-4 mr-2"/> Edit Permissions
                    </Button>
                </div>
            </div>
        </DialogContent>
      </Dialog>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-50">Role & Permission Management</h3>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">Define access levels and create new user roles.</p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="flex bg-zinc-100 p-1 rounded-md border border-zinc-200 dark:bg-zinc-900 dark:border-zinc-800">
                <button 
                    onClick={() => setViewMode('grid')}
                    className={`p-1.5 rounded-sm transition-all ${viewMode === 'grid' ? 'bg-white shadow-sm text-zinc-900 dark:bg-zinc-800 dark:text-zinc-50' : 'text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200'}`}
                    title="Grid View"
                >
                    <LayoutGrid className="h-4 w-4" />
                </button>
                <button 
                    onClick={() => setViewMode('list')}
                    className={`p-1.5 rounded-sm transition-all ${viewMode === 'list' ? 'bg-white shadow-sm text-zinc-900 dark:bg-zinc-800 dark:text-zinc-50' : 'text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200'}`}
                    title="List View"
                >
                    <List className="h-4 w-4" />
                </button>
            </div>
            <Button className="flex-1 sm:flex-none" onClick={() => setIsCreateRoleOpen(true)}>
                <Plus className="mr-2 h-4 w-4"/> Create New Role
            </Button>
        </div>
      </div>

      {viewMode === 'grid' ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {ROLES_LIST.map((role) => {
                const permissions = getRolePermissions(role.name);
                return (
                <Card key={role.name} className="flex flex-col hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors group bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800">
                    <CardHeader className="pb-3">
                    <CardTitle className="text-base flex justify-between items-center text-zinc-900 dark:text-zinc-50">
                        {role.name}
                        <Badge variant="outline" className="font-normal bg-zinc-50 dark:bg-zinc-950 dark:border-zinc-700 dark:text-zinc-400">{role.users} Users</Badge>
                    </CardTitle>
                    <CardDescription className="line-clamp-2 min-h-[40px] text-zinc-500 dark:text-zinc-400">{role.desc}</CardDescription>
                    </CardHeader>
                    <CardContent className="mt-auto pt-0">
                    <div className="mb-4 space-y-2">
                        <Label className="text-[10px] text-zinc-400 dark:text-zinc-500 uppercase tracking-wider font-semibold">Permissions Preview</Label>
                        <div className="flex flex-wrap gap-1">
                            {permissions.slice(0, 4).map(p => (
                                <Badge key={p} variant="secondary" className="text-[10px] px-1.5 py-0.5 h-auto font-normal bg-zinc-50 border-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-400">
                                    {p.replace(/_/g, ' ')}
                                </Badge>
                            ))}
                            {permissions.length > 4 && (
                                <span className="text-[10px] text-zinc-400 dark:text-zinc-500 flex items-center px-1">+{permissions.length - 4} more</span>
                            )}
                        </div>
                    </div>
                    <div className="flex gap-2 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                        <Button variant="ghost" size="sm" className="w-full text-xs text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200" onClick={() => setViewingRole(role)}>
                            <Eye className="h-3.5 w-3.5 mr-2" /> Details
                        </Button>
                        <Button 
                            variant="outline" 
                            size="sm" 
                            className="w-full text-xs hover:bg-zinc-900 hover:text-zinc-50 hover:border-zinc-900 dark:hover:bg-zinc-50 dark:hover:text-zinc-900 dark:hover:border-zinc-50 transition-colors"
                            onClick={() => handleEditClick(role.name)}
                        >
                            <Edit className="h-3.5 w-3.5 mr-2" /> Edit Permissions
                        </Button>
                    </div>
                    </CardContent>
                </Card>
            )})}
        </div>
      ) : (
        <div className="rounded-md border border-zinc-200 bg-white overflow-hidden shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <Table>
                <TableHeader className="bg-zinc-50/50 dark:bg-zinc-800/50">
                    <TableRow>
                        <TableHead className="w-[200px] text-zinc-500 dark:text-zinc-400">Role Name</TableHead>
                        <TableHead className="text-zinc-500 dark:text-zinc-400">Description</TableHead>
                        <TableHead className="w-[120px] text-zinc-500 dark:text-zinc-400">Active Users</TableHead>
                        <TableHead className="text-right w-[240px] text-zinc-500 dark:text-zinc-400">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {ROLES_LIST.map((role) => {
                         return (
                        <TableRow key={role.name} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/50">
                            <TableCell className="font-semibold text-zinc-900 dark:text-zinc-100 align-top">
                                <div className="flex items-center gap-2 mt-1">
                                    <Shield className="h-4 w-4 text-zinc-400 dark:text-zinc-500" />
                                    {role.name}
                                </div>
                            </TableCell>
                            <TableCell className="text-zinc-500 dark:text-zinc-400 align-top">
                                <span className="line-clamp-2 mt-1">{role.desc}</span>
                            </TableCell>
                            <TableCell className="align-top">
                                <Badge variant="secondary" className="font-normal gap-1 mt-1 dark:bg-zinc-800 dark:text-zinc-300">
                                    <Users className="h-3 w-3" /> {role.users}
                                </Badge>
                            </TableCell>
                            <TableCell className="text-right align-top">
                                <div className="flex justify-end gap-2 mt-0.5">
                                     <Button 
                                        variant="ghost" 
                                        size="sm" 
                                        className="h-8 px-3 text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200"
                                        onClick={() => setViewingRole(role)}
                                     >
                                         <Eye className="h-3.5 w-3.5 mr-1.5" /> Details
                                     </Button>
                                     <Button 
                                        variant="outline" 
                                        size="sm" 
                                        className="h-8 px-3 text-xs font-medium"
                                        onClick={() => handleEditClick(role.name)}
                                    >
                                        <Edit className="h-3.5 w-3.5 mr-1.5" /> Edit Permissions
                                    </Button>
                                </div>
                            </TableCell>
                        </TableRow>
                    )})}
                </TableBody>
            </Table>
        </div>
      )}
    </div>
  );
};