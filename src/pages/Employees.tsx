import { useState } from 'react';
import { Plus, Search, Edit, Trash2, Users, Upload, Calendar } from 'lucide-react';
import { useEmployees, useCreateEmployee, useUpdateEmployee, useDeleteEmployee, Employee } from '@/hooks/useEmployees';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { format, differenceInDays, parseISO } from 'date-fns';

export default function Employees() {
  const { data: employees, isLoading } = useEmployees();
  const createEmployee = useCreateEmployee();
  const updateEmployee = useUpdateEmployee();
  const deleteEmployee = useDeleteEmployee();
  const { userRole, isSuperAdmin, hasPermission } = useAuth();
  
  const [search, setSearch] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    emirates_id: '',
    emirates_id_expiry: '',
    passport_number: '',
    passport_expiry: '',
    visa_number: '',
    visa_expiry: '',
    position: '',
    region: userRole?.region || 'UAE',
  });

  const filteredEmployees = employees?.filter(emp =>
    emp.full_name.toLowerCase().includes(search.toLowerCase()) ||
    emp.email?.toLowerCase().includes(search.toLowerCase()) ||
    emp.emirates_id?.includes(search)
  );

  const resetForm = () => {
    setFormData({
      full_name: '',
      email: '',
      phone: '',
      emirates_id: '',
      emirates_id_expiry: '',
      passport_number: '',
      passport_expiry: '',
      visa_number: '',
      visa_expiry: '',
      position: '',
      region: userRole?.region || 'UAE',
    });
    setEditingEmployee(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      ...formData,
      emirates_id_expiry: formData.emirates_id_expiry || null,
      passport_expiry: formData.passport_expiry || null,
      visa_expiry: formData.visa_expiry || null,
    };
    if (editingEmployee) {
      await updateEmployee.mutateAsync({ id: editingEmployee.id, ...data });
      setEditingEmployee(null);
    } else {
      await createEmployee.mutateAsync(data as any);
      setIsCreateOpen(false);
    }
    resetForm();
  };

  const handleEdit = (employee: Employee) => {
    setEditingEmployee(employee);
    setFormData({
      full_name: employee.full_name,
      email: employee.email || '',
      phone: employee.phone || '',
      emirates_id: employee.emirates_id || '',
      emirates_id_expiry: employee.emirates_id_expiry || '',
      passport_number: employee.passport_number || '',
      passport_expiry: employee.passport_expiry || '',
      visa_number: employee.visa_number || '',
      visa_expiry: employee.visa_expiry || '',
      position: employee.position || '',
      region: employee.region,
    });
  };

  const getExpiryBadge = (expiryDate: string | null) => {
    if (!expiryDate) return null;
    const daysUntilExpiry = differenceInDays(parseISO(expiryDate), new Date());
    if (daysUntilExpiry < 0) {
      return <Badge variant="destructive">Expired</Badge>;
    } else if (daysUntilExpiry <= 30) {
      return <Badge className="bg-amber-500 hover:bg-amber-600">Expiring Soon</Badge>;
    }
    return null;
  };

  const canManage = hasPermission('canManageEmployees');

  // Mobile card component
  const EmployeeCard = ({ employee }: { employee: Employee }) => (
    <Card className="p-4">
      <div className="flex justify-between items-start mb-2">
        <div>
          <p className="font-medium">{employee.full_name}</p>
          <p className="text-sm text-muted-foreground">{employee.position || '-'}</p>
        </div>
        <div className="flex flex-col gap-1 items-end">
          <Badge variant="outline">{employee.region}</Badge>
          <Badge variant={employee.is_active ? 'default' : 'secondary'}>
            {employee.is_active ? 'Active' : 'Inactive'}
          </Badge>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2 text-sm mb-3">
        <div>
          <p className="text-muted-foreground">Emirates ID</p>
          <p>{employee.emirates_id || '-'}</p>
          {employee.emirates_id_expiry && (
            <div className="flex items-center gap-1 mt-1">
              {getExpiryBadge(employee.emirates_id_expiry)}
            </div>
          )}
        </div>
        <div>
          <p className="text-muted-foreground">Contact</p>
          <p className="text-xs">{employee.email || '-'}</p>
          <p className="text-xs text-muted-foreground">{employee.phone || '-'}</p>
        </div>
      </div>
      {canManage && (
        <div className="flex gap-2 justify-end border-t pt-3">
          <Button variant="ghost" size="sm" onClick={() => handleEdit(employee)}><Edit className="h-4 w-4" /></Button>
          <AlertDialog>
            <AlertDialogTrigger asChild><Button variant="ghost" size="sm"><Trash2 className="h-4 w-4 text-destructive" /></Button></AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader><AlertDialogTitle>Delete Employee</AlertDialogTitle><AlertDialogDescription>Are you sure you want to delete "{employee.full_name}"?</AlertDialogDescription></AlertDialogHeader>
              <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => deleteEmployee.mutate(employee.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction></AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      )}
    </Card>
  );

  const FormFields = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label>Full Name *</Label>
        <Input
          value={formData.full_name}
          onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
          required
        />
      </div>
      <div className="space-y-2">
        <Label>Position</Label>
        <Input
          value={formData.position}
          onChange={(e) => setFormData({ ...formData, position: e.target.value })}
        />
      </div>
      <div className="space-y-2">
        <Label>Email</Label>
        <Input
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        />
      </div>
      <div className="space-y-2">
        <Label>Phone</Label>
        <Input
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
        />
      </div>
      <div className="space-y-2">
        <Label>Emirates ID</Label>
        <Input
          value={formData.emirates_id}
          onChange={(e) => setFormData({ ...formData, emirates_id: e.target.value })}
        />
      </div>
      <div className="space-y-2">
        <Label>Emirates ID Expiry</Label>
        <Input
          type="date"
          value={formData.emirates_id_expiry}
          onChange={(e) => setFormData({ ...formData, emirates_id_expiry: e.target.value })}
        />
      </div>
      <div className="space-y-2">
        <Label>Passport Number</Label>
        <Input
          value={formData.passport_number}
          onChange={(e) => setFormData({ ...formData, passport_number: e.target.value })}
        />
      </div>
      <div className="space-y-2">
        <Label>Passport Expiry</Label>
        <Input
          type="date"
          value={formData.passport_expiry}
          onChange={(e) => setFormData({ ...formData, passport_expiry: e.target.value })}
        />
      </div>
      <div className="space-y-2">
        <Label>Visa Number</Label>
        <Input
          value={formData.visa_number}
          onChange={(e) => setFormData({ ...formData, visa_number: e.target.value })}
        />
      </div>
      <div className="space-y-2">
        <Label>Visa Expiry</Label>
        <Input
          type="date"
          value={formData.visa_expiry}
          onChange={(e) => setFormData({ ...formData, visa_expiry: e.target.value })}
        />
      </div>
      {isSuperAdmin && (
        <div className="space-y-2">
          <Label>Region</Label>
          <Select
            value={formData.region}
            onValueChange={(value) => setFormData({ ...formData, region: value as any })}
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
      )}
    </div>
  );

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Employees</h1>
          <p className="text-sm text-muted-foreground">Manage employee records and documents</p>
        </div>
        {canManage && (
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm} size="sm" className="w-full sm:w-auto">
                <Plus className="h-4 w-4 sm:mr-2" /> <span className="sm:inline">Add Employee</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add New Employee</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <FormFields />
                <div className="flex flex-col-reverse sm:flex-row justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createEmployee.isPending}>
                    {createEmployee.isPending ? 'Creating...' : 'Create Employee'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search employees..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Loading...</div>
          ) : filteredEmployees?.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="mx-auto h-12 w-12 mb-4 opacity-50" />
              <p>No employees found</p>
            </div>
          ) : (
            <>
              {/* Mobile card view */}
              <div className="space-y-4 sm:hidden">
                {filteredEmployees?.map((employee) => <EmployeeCard key={employee.id} employee={employee} />)}
              </div>
              {/* Desktop table view */}
              <div className="hidden sm:block">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Position</TableHead>
                      <TableHead>Emirates ID</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Region</TableHead>
                      <TableHead>Status</TableHead>
                      {canManage && <TableHead className="w-[100px]">Actions</TableHead>}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredEmployees?.map((employee) => (
                      <TableRow key={employee.id}>
                        <TableCell className="font-medium">{employee.full_name}</TableCell>
                        <TableCell>{employee.position || '-'}</TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div>{employee.emirates_id || '-'}</div>
                        {employee.emirates_id_expiry && (
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Calendar className="h-3 w-3" />
                            {format(parseISO(employee.emirates_id_expiry), 'MMM d, yyyy')}
                            {getExpiryBadge(employee.emirates_id_expiry)}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {employee.email && <div>{employee.email}</div>}
                        {employee.phone && <div className="text-muted-foreground">{employee.phone}</div>}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{employee.region}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={employee.is_active ? 'default' : 'secondary'}>
                        {employee.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    {canManage && (
                      <TableCell>
                        <div className="flex gap-1">
                          <Dialog open={editingEmployee?.id === employee.id} onOpenChange={(open) => !open && setEditingEmployee(null)}>
                            <DialogTrigger asChild>
                              <Button variant="ghost" size="icon" onClick={() => handleEdit(employee)}>
                                <Edit className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                              <DialogHeader>
                                <DialogTitle>Edit Employee</DialogTitle>
                              </DialogHeader>
                              <form onSubmit={handleSubmit} className="space-y-4">
                                <FormFields />
                                <div className="flex justify-end gap-2">
                                  <Button type="button" variant="outline" onClick={() => setEditingEmployee(null)}>
                                    Cancel
                                  </Button>
                                  <Button type="submit" disabled={updateEmployee.isPending}>
                                    {updateEmployee.isPending ? 'Saving...' : 'Save Changes'}
                                  </Button>
                                </div>
                              </form>
                            </DialogContent>
                          </Dialog>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Employee</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete "{employee.full_name}"? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => deleteEmployee.mutate(employee.id)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    )}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
