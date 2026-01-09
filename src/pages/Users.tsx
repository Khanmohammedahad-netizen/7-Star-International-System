import { useState } from 'react';
import { Plus, Search, Edit, Trash2, UserCog, Mail, Clock, CheckCircle } from 'lucide-react';
import { useUsers, useInvitations, useCreateInvitation, useDeleteInvitation, useUpdateUserRole, useToggleUserActive, UserWithRole } from '@/hooks/useUsers';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { format, parseISO, isPast } from 'date-fns';

const roleLabels: Record<string, string> = {
  super_admin: 'Super Admin',
  manager: 'Manager',
  supervisor: 'Supervisor',
  accountant: 'Accountant',
  staff: 'Staff',
};

export default function Users() {
  const { data: users, isLoading: usersLoading } = useUsers();
  const { data: invitations, isLoading: invitationsLoading } = useInvitations();
  const createInvitation = useCreateInvitation();
  const deleteInvitation = useDeleteInvitation();
  const updateUserRole = useUpdateUserRole();
  const toggleUserActive = useToggleUserActive();
  
  const [search, setSearch] = useState('');
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserWithRole | null>(null);
  const [inviteData, setInviteData] = useState({
    email: '',
    role: 'staff' as const,
    region: 'UAE' as const,
  });
  const [editRoleData, setEditRoleData] = useState({
    role: '',
    region: '',
  });

  const filteredUsers = users?.filter(user =>
    user.full_name.toLowerCase().includes(search.toLowerCase()) ||
    user.email.toLowerCase().includes(search.toLowerCase())
  );

  const pendingInvitations = invitations?.filter(inv => !inv.accepted_at && !isPast(parseISO(inv.expires_at)));

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    await createInvitation.mutateAsync(inviteData);
    setIsInviteOpen(false);
    setInviteData({ email: '', role: 'staff', region: 'UAE' });
  };

  const handleEditRole = (user: UserWithRole) => {
    setEditingUser(user);
    const role = user.user_roles?.[0];
    setEditRoleData({
      role: role?.role || 'staff',
      region: role?.region || 'UAE',
    });
  };

  const handleUpdateRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    await updateUserRole.mutateAsync({
      userId: editingUser.id,
      role: editRoleData.role,
      region: editRoleData.region,
    });
    setEditingUser(null);
  };

  // Mobile card for users
  const UserCard = ({ user }: { user: UserWithRole }) => {
    const role = user.user_roles?.[0];
    return (
      <Card className="p-4">
        <div className="flex justify-between items-start mb-2">
          <div>
            <p className="font-medium">{user.full_name}</p>
            <p className="text-sm text-muted-foreground">{user.email}</p>
          </div>
          <div className="flex items-center gap-2">
            <Switch
              checked={user.is_active ?? true}
              onCheckedChange={(checked) => toggleUserActive.mutate({ userId: user.id, isActive: checked })}
            />
          </div>
        </div>
        <div className="flex gap-2 mb-3">
          <Badge variant="outline">{role ? roleLabels[role.role] : 'No Role'}</Badge>
          <Badge variant="secondary">{role?.region || '-'}</Badge>
        </div>
        <div className="flex gap-2 justify-end border-t pt-3">
          <Button variant="ghost" size="sm" onClick={() => handleEditRole(user)}><Edit className="h-4 w-4" /></Button>
        </div>
      </Card>
    );
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">User Management</h1>
          <p className="text-sm text-muted-foreground">Manage users and invitations</p>
        </div>
        <Dialog open={isInviteOpen} onOpenChange={setIsInviteOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="w-full sm:w-auto">
              <Mail className="h-4 w-4 sm:mr-2" /> <span className="sm:inline">Invite User</span>
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Invite New User</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleInvite} className="space-y-4">
              <div className="space-y-2">
                <Label>Email *</Label>
                <Input
                  type="email"
                  value={inviteData.email}
                  onChange={(e) => setInviteData({ ...inviteData, email: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Role *</Label>
                <Select
                  value={inviteData.role}
                  onValueChange={(value) => setInviteData({ ...inviteData, role: value as any })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="super_admin">Super Admin</SelectItem>
                    <SelectItem value="manager">Manager</SelectItem>
                    <SelectItem value="supervisor">Supervisor</SelectItem>
                    <SelectItem value="accountant">Accountant</SelectItem>
                    <SelectItem value="staff">Staff</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Region *</Label>
                <Select
                  value={inviteData.region}
                  onValueChange={(value) => setInviteData({ ...inviteData, region: value as any })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="UAE">UAE</SelectItem>
                    <SelectItem value="SAUDI">Saudi Arabia</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col-reverse sm:flex-row justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsInviteOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createInvitation.isPending}>
                  {createInvitation.isPending ? 'Sending...' : 'Send Invitation'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="users">
        <TabsList>
          <TabsTrigger value="users">Active Users</TabsTrigger>
          <TabsTrigger value="invitations">
            Pending Invitations
            {(pendingInvitations?.length || 0) > 0 && (
              <Badge variant="secondary" className="ml-2">{pendingInvitations?.length}</Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="users">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-4">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search users..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {usersLoading ? (
                <div className="text-center py-8 text-muted-foreground">Loading...</div>
              ) : filteredUsers?.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <UserCog className="mx-auto h-12 w-12 mb-4 opacity-50" />
                  <p>No users found</p>
                </div>
              ) : (
                <>
                  {/* Mobile card view */}
                  <div className="space-y-4 sm:hidden">
                    {filteredUsers?.map((user) => <UserCard key={user.id} user={user} />)}
                  </div>
                  {/* Desktop table view */}
                  <div className="hidden sm:block">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Role</TableHead>
                          <TableHead>Region</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="w-[100px]">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredUsers?.map((user) => {
                          const role = user.user_roles?.[0];
                          return (
                            <TableRow key={user.id}>
                              <TableCell className="font-medium">{user.full_name}</TableCell>
                              <TableCell>{user.email}</TableCell>
                              <TableCell>
                                <Badge variant="outline">{role ? roleLabels[role.role] : 'No Role'}</Badge>
                              </TableCell>
                          <TableCell>
                            <Badge variant="secondary">{role?.region || '-'}</Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Switch
                                checked={user.is_active ?? true}
                                onCheckedChange={(checked) => toggleUserActive.mutate({ userId: user.id, isActive: checked })}
                              />
                              <span className={user.is_active ? 'text-emerald-600' : 'text-muted-foreground'}>
                                {user.is_active ? 'Active' : 'Inactive'}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Dialog open={editingUser?.id === user.id} onOpenChange={(open) => !open && setEditingUser(null)}>
                              <DialogTrigger asChild>
                                <Button variant="ghost" size="icon" onClick={() => handleEditRole(user)}>
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Edit User Role</DialogTitle>
                                </DialogHeader>
                                <form onSubmit={handleUpdateRole} className="space-y-4">
                                  <div className="space-y-2">
                                    <Label>User</Label>
                                    <Input value={user.full_name} disabled />
                                  </div>
                                  <div className="space-y-2">
                                    <Label>Role</Label>
                                    <Select
                                      value={editRoleData.role}
                                      onValueChange={(value) => setEditRoleData({ ...editRoleData, role: value })}
                                    >
                                      <SelectTrigger>
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="super_admin">Super Admin</SelectItem>
                                        <SelectItem value="manager">Manager</SelectItem>
                                        <SelectItem value="supervisor">Supervisor</SelectItem>
                                        <SelectItem value="accountant">Accountant</SelectItem>
                                        <SelectItem value="staff">Staff</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                  <div className="space-y-2">
                                    <Label>Region</Label>
                                    <Select
                                      value={editRoleData.region}
                                      onValueChange={(value) => setEditRoleData({ ...editRoleData, region: value })}
                                    >
                                      <SelectTrigger>
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="UAE">UAE</SelectItem>
                                        <SelectItem value="SAUDI">Saudi Arabia</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                  <div className="flex justify-end gap-2">
                                    <Button type="button" variant="outline" onClick={() => setEditingUser(null)}>
                                      Cancel
                                    </Button>
                                    <Button type="submit" disabled={updateUserRole.isPending}>
                                      {updateUserRole.isPending ? 'Saving...' : 'Save Changes'}
                                    </Button>
                                  </div>
                                </form>
                              </DialogContent>
                            </Dialog>
                                  </TableCell>
                                </TableRow>
                              );
                            })}
                          </TableBody>
                        </Table>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="invitations">
          <Card>
            <CardContent className="pt-6">
              {invitationsLoading ? (
                <div className="text-center py-8 text-muted-foreground">Loading...</div>
              ) : pendingInvitations?.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Mail className="mx-auto h-12 w-12 mb-4 opacity-50" />
                  <p>No pending invitations</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Region</TableHead>
                      <TableHead>Sent</TableHead>
                      <TableHead>Expires</TableHead>
                      <TableHead className="w-[100px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pendingInvitations?.map((invitation) => (
                      <TableRow key={invitation.id}>
                        <TableCell className="font-medium">{invitation.email}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{roleLabels[invitation.role]}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">{invitation.region}</Badge>
                        </TableCell>
                        <TableCell>{format(parseISO(invitation.created_at), 'MMM d, yyyy')}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            {format(parseISO(invitation.expires_at), 'MMM d, yyyy')}
                          </div>
                        </TableCell>
                        <TableCell>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Cancel Invitation</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to cancel this invitation to {invitation.email}?
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Keep</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => deleteInvitation.mutate(invitation.id)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Cancel Invitation
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
