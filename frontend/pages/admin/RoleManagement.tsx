import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Key } from 'lucide-react';
import { ROLES_LIST, ALL_PERMISSIONS } from '../../lib/mockData';

export const RoleManagement: React.FC = () => {
  const [editingRole, setEditingRole] = useState<string | null>(null);
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);

  // Mock initial permissions based on role
  const getInitialPermissions = (roleName: string) => {
    if (roleName.includes('Admin')) return ALL_PERMISSIONS;
    if (roleName === 'Manager') return ALL_PERMISSIONS.filter(p => !p.includes('database') && !p.includes('roles'));
    if (roleName === 'Cashier') return ['view_pos', 'process_transactions', 'view_inventory'];
    if (roleName === 'Inventory Clerk') return ['view_inventory', 'manage_inventory'];
    return ['view_dashboard'];
  };

  const handleEditClick = (roleName: string) => {
    setEditingRole(roleName);
    setSelectedPermissions(getInitialPermissions(roleName));
  };

  const togglePermission = (permission: string) => {
    setSelectedPermissions(prev => 
      prev.includes(permission) 
        ? prev.filter(p => p !== permission)
        : [...prev, permission]
    );
  };

  const handleSave = () => {
    // In a real app, you would make an API call here
    console.log(`Saving permissions for ${editingRole}:`, selectedPermissions);
    setEditingRole(null);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 relative">
      
      {/* Edit Permissions Modal */}
      {editingRole && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <Card className="w-full max-w-2xl shadow-2xl border-zinc-200 animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
            <CardHeader className="border-b border-zinc-100 pb-4 shrink-0">
              <CardTitle className="text-xl">Edit Permissions: {editingRole}</CardTitle>
              <CardDescription>Configure the access control list for this role. Changes will take effect immediately.</CardDescription>
            </CardHeader>
            <CardContent className="pt-6 overflow-y-auto flex-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {ALL_PERMISSIONS.map((permission) => (
                  <label 
                    key={permission} 
                    className={`flex items-center space-x-3 p-4 rounded-lg border cursor-pointer transition-all ${selectedPermissions.includes(permission) ? 'bg-zinc-50 border-zinc-900 ring-1 ring-zinc-900' : 'bg-white border-zinc-200 hover:border-zinc-300'}`}
                  >
                    <input 
                      type="checkbox" 
                      className="h-5 w-5 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900 accent-zinc-900"
                      checked={selectedPermissions.includes(permission)}
                      onChange={() => togglePermission(permission)}
                    />
                    <div className="flex flex-col">
                       <span className="text-sm font-semibold text-zinc-900 capitalize leading-none">
                         {permission.replace(/_/g, ' ')}
                       </span>
                       <span className="text-xs text-zinc-500 mt-1">
                         Grants access to {permission.split('_')[0]} {permission.split('_')[1]}
                       </span>
                    </div>
                  </label>
                ))}
              </div>
            </CardContent>
             <div className="p-6 border-t border-zinc-100 flex justify-end gap-3 shrink-0 bg-white rounded-b-xl">
                <Button variant="outline" onClick={() => setEditingRole(null)}>Cancel</Button>
                <Button onClick={handleSave} className="min-w-[120px]">Save Changes</Button>
              </div>
          </Card>
        </div>
      )}

      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium text-zinc-900">Role & Permission Management</h3>
          <p className="text-sm text-zinc-500">Define access levels and create new user roles.</p>
        </div>
        <Button><Key className="mr-2 h-4 w-4"/> Create New Role</Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {ROLES_LIST.map((role) => (
          <Card key={role.name} className="flex flex-col">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex justify-between items-center">
                {role.name}
                <Badge variant="outline" className="font-normal">{role.users} Users</Badge>
              </CardTitle>
              <CardDescription>{role.desc}</CardDescription>
            </CardHeader>
            <CardContent className="mt-auto pt-0">
              <div className="flex gap-2 pt-4 border-t border-zinc-100">
                <Button variant="ghost" size="sm" className="w-full text-xs">View Permissions</Button>
                <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full text-xs"
                    onClick={() => handleEditClick(role.name)}
                >
                    Edit
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};