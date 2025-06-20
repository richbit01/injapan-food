
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import AdminLayout from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, Shield, User as UserIcon, RefreshCw } from 'lucide-react';

interface UserProfile {
  id: string;
  firebase_uid: string;
  full_name: string;
  role: 'admin' | 'user';
  created_at: string;
  updated_at: string;
}

const UserManagement = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  const fetchUsers = async () => {
    try {
      console.log('Fetching all user profiles...');
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching users:', error);
        throw error;
      }

      console.log('Fetched users:', data);
      
      // Type the data properly to match UserProfile interface
      const typedUsers: UserProfile[] = (data || []).map(user => ({
        id: user.id,
        firebase_uid: user.firebase_uid || '',
        full_name: user.full_name || '',
        role: (user.role === 'admin' ? 'admin' : 'user') as 'admin' | 'user',
        created_at: user.created_at,
        updated_at: user.updated_at
      }));
      
      setUsers(typedUsers);
    } catch (error) {
      console.error('Error in fetchUsers:', error);
      toast({
        title: "Error",
        description: "Gagal memuat data pengguna",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const updateUserRole = async (userId: string, newRole: 'admin' | 'user') => {
    if (!user) return;

    setUpdating(userId);
    
    try {
      console.log(`Updating user ${userId} role to ${newRole}`);
      
      const { error } = await supabase
        .from('profiles')
        .update({ 
          role: newRole,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (error) {
        console.error('Error updating user role:', error);
        throw error;
      }

      // Update local state
      setUsers(prevUsers => 
        prevUsers.map(u => 
          u.id === userId 
            ? { ...u, role: newRole, updated_at: new Date().toISOString() }
            : u
        )
      );

      toast({
        title: "Berhasil!",
        description: `Role pengguna berhasil diubah menjadi ${newRole}`,
      });

      console.log('User role updated successfully');
    } catch (error) {
      console.error('Error updating user role:', error);
      toast({
        title: "Error",
        description: "Gagal mengubah role pengguna",
        variant: "destructive"
      });
    } finally {
      setUpdating(null);
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    return role === 'admin' ? 'destructive' : 'secondary';
  };

  const getRoleIcon = (role: string) => {
    return role === 'admin' ? Shield : UserIcon;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const currentUserRole = users.find(u => u.id === user?.id)?.role;
  const canEditRoles = currentUserRole === 'admin';

  return (
    <AdminLayout>
      <div className="p-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Users className="w-8 h-8 text-blue-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Kelola Pengguna</h1>
              <p className="text-gray-600">Manage user roles dan permissions</p>
            </div>
          </div>
          <Button onClick={fetchUsers} variant="outline" disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="w-5 h-5" />
              <span>Daftar Pengguna ({users.length})</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-2">Memuat data pengguna...</span>
              </div>
            ) : users.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                Tidak ada data pengguna
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nama Lengkap</TableHead>
                      <TableHead>User ID</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Bergabung</TableHead>
                      <TableHead>Terakhir Update</TableHead>
                      {canEditRoles && <TableHead>Aksi</TableHead>}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((userProfile) => {
                      const RoleIcon = getRoleIcon(userProfile.role);
                      const isCurrentUser = userProfile.id === user?.id;
                      
                      return (
                        <TableRow key={userProfile.id}>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <RoleIcon className="w-4 h-4" />
                              <span className="font-medium">
                                {userProfile.full_name || 'Tidak ada nama'}
                                {isCurrentUser && (
                                  <span className="text-blue-600 text-xs ml-2">(Anda)</span>
                                )}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                              {userProfile.id}
                            </code>
                          </TableCell>
                          <TableCell>
                            <Badge variant={getRoleBadgeVariant(userProfile.role)}>
                              {userProfile.role}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm text-gray-600">
                            {formatDate(userProfile.created_at)}
                          </TableCell>
                          <TableCell className="text-sm text-gray-600">
                            {formatDate(userProfile.updated_at)}
                          </TableCell>
                          {canEditRoles && (
                            <TableCell>
                              {isCurrentUser ? (
                                <span className="text-xs text-gray-500">
                                  Tidak bisa mengubah role sendiri
                                </span>
                              ) : (
                                <Select
                                  value={userProfile.role}
                                  onValueChange={(newRole: 'admin' | 'user') => 
                                    updateUserRole(userProfile.id, newRole)
                                  }
                                  disabled={updating === userProfile.id}
                                >
                                  <SelectTrigger className="w-32">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="user">User</SelectItem>
                                    <SelectItem value="admin">Admin</SelectItem>
                                  </SelectContent>
                                </Select>
                              )}
                              {updating === userProfile.id && (
                                <div className="flex items-center mt-1">
                                  <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mr-2"></div>
                                  <span className="text-xs text-gray-500">Updating...</span>
                                </div>
                              )}
                            </TableCell>
                          )}
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {!canEditRoles && (
          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-yellow-800 text-sm">
              <Shield className="w-4 h-4 inline mr-2" />
              Anda perlu role admin untuk mengubah role pengguna lain.
            </p>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default UserManagement;
