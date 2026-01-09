import { useState, useCallback } from 'react';
import { Plus, Search, Edit, Trash2, FileText } from 'lucide-react';
import { useCompanyAccounts, useCreateCompanyAccount, useUpdateCompanyAccount, useDeleteCompanyAccount, CompanyAccount } from '@/hooks/useAccounts';
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
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { format, parseISO } from 'date-fns';
import { ScrollArea } from '@/components/ui/scroll-area';
import { getCurrencyCode } from '@/lib/currency';

export default function Accounts() {
  const { data: accounts, isLoading } = useCompanyAccounts();
  const createAccount = useCreateCompanyAccount();
  const updateAccount = useUpdateCompanyAccount();
  const deleteAccount = useDeleteCompanyAccount();
  const { userRole, isSuperAdmin, hasPermission } = useAuth();
  
  const [search, setSearch] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<CompanyAccount | null>(null);
  const [formData, setFormData] = useState({
    entry_date: format(new Date(), 'yyyy-MM-dd'),
    project_name: '',
    expense_head: '',
    description: '',
    amount: 0,
    vat: 0,
    e7_bank_transfer: 0,
    e7_cash: 0,
    shaji_bank_transfer: 0,
    shaji_cash: 0,
    shaji_credit_card: 0,
    others: 0,
    mode_of_payment: 'bank_transfer' as 'bank_transfer' | 'cash' | 'credit_card' | 'cheque' | 'other',
    invoice_available: false,
    invoice_date: '',
    person_responsible: '',
    remarks: '',
    region: userRole?.region || 'UAE',
  });

  const filteredAccounts = accounts?.filter(acc =>
    acc.project_name?.toLowerCase().includes(search.toLowerCase()) ||
    acc.expense_head?.toLowerCase().includes(search.toLowerCase()) ||
    acc.description?.toLowerCase().includes(search.toLowerCase())
  );

  const calculateTotal = () => {
    return (formData.amount || 0) + (formData.vat || 0);
  };

  const resetForm = () => {
    setFormData({
      entry_date: format(new Date(), 'yyyy-MM-dd'),
      project_name: '',
      expense_head: '',
      description: '',
      amount: 0,
      vat: 0,
      e7_bank_transfer: 0,
      e7_cash: 0,
      shaji_bank_transfer: 0,
      shaji_cash: 0,
      shaji_credit_card: 0,
      others: 0,
      mode_of_payment: 'bank_transfer',
      invoice_available: false,
      invoice_date: '',
      person_responsible: '',
      remarks: '',
      region: userRole?.region || 'UAE',
    });
    setEditingAccount(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      ...formData,
      total: calculateTotal(),
      invoice_date: formData.invoice_date || null,
    };
    if (editingAccount) {
      await updateAccount.mutateAsync({ id: editingAccount.id, ...data });
      setEditingAccount(null);
    } else {
      await createAccount.mutateAsync(data as any);
      setIsCreateOpen(false);
    }
    resetForm();
  };

  const handleEdit = (account: CompanyAccount) => {
    setEditingAccount(account);
    setFormData({
      entry_date: account.entry_date,
      project_name: account.project_name || '',
      expense_head: account.expense_head || '',
      description: account.description || '',
      amount: account.amount || 0,
      vat: account.vat || 0,
      e7_bank_transfer: account.e7_bank_transfer || 0,
      e7_cash: account.e7_cash || 0,
      shaji_bank_transfer: account.shaji_bank_transfer || 0,
      shaji_cash: account.shaji_cash || 0,
      shaji_credit_card: account.shaji_credit_card || 0,
      others: account.others || 0,
      mode_of_payment: account.mode_of_payment || 'bank_transfer',
      invoice_available: account.invoice_available || false,
      invoice_date: account.invoice_date || '',
      person_responsible: account.person_responsible || '',
      remarks: account.remarks || '',
      region: account.region,
    });
  };

  const canManage = hasPermission('canManageAccounts');

  const FormContent = () => (
    <form onSubmit={handleSubmit}>
      <ScrollArea className="max-h-[70vh] pr-4">
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
              <Label>Project Name</Label>
              <Input
                value={formData.project_name}
                onChange={(e) => setFormData({ ...formData, project_name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Expense Head</Label>
              <Input
                value={formData.expense_head}
                onChange={(e) => setFormData({ ...formData, expense_head: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Person Responsible</Label>
              <Input
                value={formData.person_responsible}
                onChange={(e) => setFormData({ ...formData, person_responsible: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Amount</Label>
              <Input
                type="number"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                min={0}
                step="0.01"
              />
            </div>
            <div className="space-y-2">
              <Label>VAT</Label>
              <Input
                type="number"
                value={formData.vat}
                onChange={(e) => setFormData({ ...formData, vat: parseFloat(e.target.value) || 0 })}
                min={0}
                step="0.01"
              />
            </div>
            <div className="space-y-2">
              <Label>Total</Label>
              <Input value={calculateTotal().toFixed(2)} disabled />
            </div>
          </div>

          <div className="border rounded-lg p-4 space-y-4">
            <h4 className="font-medium">Payment Breakdown</h4>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>E7 Bank Transfer</Label>
                <Input
                  type="number"
                  value={formData.e7_bank_transfer}
                  onChange={(e) => setFormData({ ...formData, e7_bank_transfer: parseFloat(e.target.value) || 0 })}
                  min={0}
                  step="0.01"
                />
              </div>
              <div className="space-y-2">
                <Label>E7 Cash</Label>
                <Input
                  type="number"
                  value={formData.e7_cash}
                  onChange={(e) => setFormData({ ...formData, e7_cash: parseFloat(e.target.value) || 0 })}
                  min={0}
                  step="0.01"
                />
              </div>
              <div className="space-y-2">
                <Label>Shaji Bank Transfer</Label>
                <Input
                  type="number"
                  value={formData.shaji_bank_transfer}
                  onChange={(e) => setFormData({ ...formData, shaji_bank_transfer: parseFloat(e.target.value) || 0 })}
                  min={0}
                  step="0.01"
                />
              </div>
              <div className="space-y-2">
                <Label>Shaji Cash</Label>
                <Input
                  type="number"
                  value={formData.shaji_cash}
                  onChange={(e) => setFormData({ ...formData, shaji_cash: parseFloat(e.target.value) || 0 })}
                  min={0}
                  step="0.01"
                />
              </div>
              <div className="space-y-2">
                <Label>Shaji Credit Card</Label>
                <Input
                  type="number"
                  value={formData.shaji_credit_card}
                  onChange={(e) => setFormData({ ...formData, shaji_credit_card: parseFloat(e.target.value) || 0 })}
                  min={0}
                  step="0.01"
                />
              </div>
              <div className="space-y-2">
                <Label>Others</Label>
                <Input
                  type="number"
                  value={formData.others}
                  onChange={(e) => setFormData({ ...formData, others: parseFloat(e.target.value) || 0 })}
                  min={0}
                  step="0.01"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
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

          <div className="flex items-center gap-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="invoice_available"
                checked={formData.invoice_available}
                onCheckedChange={(checked) => setFormData({ ...formData, invoice_available: checked as boolean })}
              />
              <Label htmlFor="invoice_available">Invoice Available</Label>
            </div>
            {formData.invoice_available && (
              <div className="flex-1">
                <Input
                  type="date"
                  value={formData.invoice_date}
                  onChange={(e) => setFormData({ ...formData, invoice_date: e.target.value })}
                  placeholder="Invoice Date"
                />
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label>Remarks</Label>
            <Textarea
              value={formData.remarks}
              onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
            />
          </div>
        </div>
      </ScrollArea>
      <div className="flex justify-end gap-2 pt-4 mt-4 border-t">
        <Button type="button" variant="outline" onClick={() => { setIsCreateOpen(false); setEditingAccount(null); }}>
          Cancel
        </Button>
        <Button type="submit" disabled={createAccount.isPending || updateAccount.isPending}>
          {createAccount.isPending || updateAccount.isPending ? 'Saving...' : editingAccount ? 'Save Changes' : 'Create Entry'}
        </Button>
      </div>
    </form>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Company Accounts</h1>
          <p className="text-muted-foreground">Track company expenses and transactions</p>
        </div>
        {canManage && (
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="mr-2 h-4 w-4" /> Add Entry
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl">
              <DialogHeader>
                <DialogTitle>New Account Entry</DialogTitle>
              </DialogHeader>
              <FormContent />
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
                placeholder="Search accounts..."
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
              <FileText className="mx-auto h-12 w-12 mb-4 opacity-50" />
              <p>No account entries found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Project</TableHead>
                    <TableHead>Expense Head</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Invoice</TableHead>
                    <TableHead>Region</TableHead>
                    {canManage && <TableHead className="w-[100px]">Actions</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAccounts?.map((account) => (
                    <TableRow key={account.id}>
                      <TableCell>{format(parseISO(account.entry_date), 'MMM d, yyyy')}</TableCell>
                      <TableCell className="font-medium">{account.project_name || '-'}</TableCell>
                      <TableCell>{account.expense_head || '-'}</TableCell>
                      <TableCell>{(account.amount || 0).toFixed(2)} {getCurrencyCode(account.region)}</TableCell>
                      <TableCell className="font-medium">{(account.total || 0).toFixed(2)} {getCurrencyCode(account.region)}</TableCell>
                      <TableCell>
                        <Badge variant={account.invoice_available ? 'default' : 'secondary'}>
                          {account.invoice_available ? 'Yes' : 'No'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{account.region}</Badge>
                      </TableCell>
                      {canManage && (
                        <TableCell>
                          <div className="flex gap-1">
                            <Dialog open={editingAccount?.id === account.id} onOpenChange={(open) => !open && setEditingAccount(null)}>
                              <DialogTrigger asChild>
                                <Button variant="ghost" size="icon" onClick={() => handleEdit(account)}>
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-3xl">
                                <DialogHeader>
                                  <DialogTitle>Edit Account Entry</DialogTitle>
                                </DialogHeader>
                                <FormContent />
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
                                    Are you sure you want to delete this account entry?
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
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
