import { useState } from 'react';
import { Plus, Search, Edit, Trash2, Lock } from 'lucide-react';
import { usePersonalAccounts, useCreatePersonalAccount, useUpdatePersonalAccount, useDeletePersonalAccount, PersonalAccount } from '@/hooks/useAccounts';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { format, parseISO } from 'date-fns';

export default function PersonalAccounts() {
  const { data: accounts, isLoading } = usePersonalAccounts();
  const createAccount = useCreatePersonalAccount();
  const updateAccount = useUpdatePersonalAccount();
  const deleteAccount = useDeletePersonalAccount();
  
  const [search, setSearch] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<PersonalAccount | null>(null);
  const [formData, setFormData] = useState({
    entry_date: format(new Date(), 'yyyy-MM-dd'),
    description: '',
    credit: 0,
    debit: 0,
    mode_of_payment: 'bank_transfer' as 'bank_transfer' | 'cash' | 'credit_card' | 'cheque' | 'other',
    remarks: '',
  });

  const filteredAccounts = accounts?.filter(acc =>
    acc.description.toLowerCase().includes(search.toLowerCase()) ||
    acc.remarks?.toLowerCase().includes(search.toLowerCase())
  );

  // Calculate running balance
  const calculateBalance = () => {
    let balance = 0;
    accounts?.forEach(acc => {
      balance += (acc.credit || 0) - (acc.debit || 0);
    });
    return balance;
  };

  const totalCredit = accounts?.reduce((sum, acc) => sum + (acc.credit || 0), 0) || 0;
  const totalDebit = accounts?.reduce((sum, acc) => sum + (acc.debit || 0), 0) || 0;
  const balance = calculateBalance();

  const resetForm = () => {
    setFormData({
      entry_date: format(new Date(), 'yyyy-MM-dd'),
      description: '',
      credit: 0,
      debit: 0,
      mode_of_payment: 'bank_transfer',
      remarks: '',
    });
    setEditingAccount(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingAccount) {
      await updateAccount.mutateAsync({ id: editingAccount.id, ...formData });
      setEditingAccount(null);
    } else {
      await createAccount.mutateAsync(formData as any);
      setIsCreateOpen(false);
    }
    resetForm();
  };

  const handleEdit = (account: PersonalAccount) => {
    setEditingAccount(account);
    setFormData({
      entry_date: account.entry_date,
      description: account.description,
      credit: account.credit || 0,
      debit: account.debit || 0,
      mode_of_payment: account.mode_of_payment || 'bank_transfer',
      remarks: account.remarks || '',
    });
  };

  const FormFields = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Entry Date *</Label>
          <Input
            type="date"
            value={formData.entry_date}
            onChange={(e) => setFormData({ ...formData, entry_date: e.target.value })}
            required
          />
        </div>
        <div className="space-y-2">
          <Label>Mode of Payment</Label>
          <Select
            value={formData.mode_of_payment}
            onValueChange={(value) => setFormData({ ...formData, mode_of_payment: value as any })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
              <SelectItem value="cash">Cash</SelectItem>
              <SelectItem value="credit_card">Credit Card</SelectItem>
              <SelectItem value="cheque">Cheque</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Description *</Label>
        <Textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Credit (Money In)</Label>
          <Input
            type="number"
            value={formData.credit}
            onChange={(e) => setFormData({ ...formData, credit: parseFloat(e.target.value) || 0 })}
            min={0}
            step="0.01"
          />
        </div>
        <div className="space-y-2">
          <Label>Debit (Money Out)</Label>
          <Input
            type="number"
            value={formData.debit}
            onChange={(e) => setFormData({ ...formData, debit: parseFloat(e.target.value) || 0 })}
            min={0}
            step="0.01"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Remarks</Label>
        <Textarea
          value={formData.remarks}
          onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
        />
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight">Personal Accounts</h1>
            <Badge variant="outline" className="gap-1">
              <Lock className="h-3 w-3" /> Private
            </Badge>
          </div>
          <p className="text-muted-foreground">7 Star Account Statement - Super Admin Only</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="mr-2 h-4 w-4" /> Add Entry
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>New Personal Account Entry</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <FormFields />
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createAccount.isPending}>
                  {createAccount.isPending ? 'Creating...' : 'Create Entry'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Credit</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">+{totalCredit.toFixed(2)} AED</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Debit</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">-{totalDebit.toFixed(2)} AED</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${balance >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
              {balance >= 0 ? '+' : ''}{balance.toFixed(2)} AED
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search entries..."
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
          ) : filteredAccounts?.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Lock className="mx-auto h-12 w-12 mb-4 opacity-50" />
              <p>No personal account entries found</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Credit</TableHead>
                  <TableHead>Debit</TableHead>
                  <TableHead>Payment Mode</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAccounts?.map((account) => (
                  <TableRow key={account.id}>
                    <TableCell>{format(parseISO(account.entry_date), 'MMM d, yyyy')}</TableCell>
                    <TableCell>
                      <div className="font-medium">{account.description}</div>
                      {account.remarks && (
                        <div className="text-xs text-muted-foreground">{account.remarks}</div>
                      )}
                    </TableCell>
                    <TableCell className="text-emerald-600 font-medium">
                      {(account.credit || 0) > 0 ? `+${account.credit?.toFixed(2)}` : '-'}
                    </TableCell>
                    <TableCell className="text-red-600 font-medium">
                      {(account.debit || 0) > 0 ? `-${account.debit?.toFixed(2)}` : '-'}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{account.mode_of_payment?.replace('_', ' ') || '-'}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Dialog open={editingAccount?.id === account.id} onOpenChange={(open) => !open && setEditingAccount(null)}>
                          <DialogTrigger asChild>
                            <Button variant="ghost" size="icon" onClick={() => handleEdit(account)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Edit Entry</DialogTitle>
                            </DialogHeader>
                            <form onSubmit={handleSubmit} className="space-y-4">
                              <FormFields />
                              <div className="flex justify-end gap-2">
                                <Button type="button" variant="outline" onClick={() => setEditingAccount(null)}>
                                  Cancel
                                </Button>
                                <Button type="submit" disabled={updateAccount.isPending}>
                                  {updateAccount.isPending ? 'Saving...' : 'Save Changes'}
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
                              <AlertDialogTitle>Delete Entry</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete this personal account entry?
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => deleteAccount.mutate(account.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
