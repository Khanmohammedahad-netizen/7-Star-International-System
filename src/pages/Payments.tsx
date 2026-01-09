import { useState } from 'react';
import { Plus, Search, Edit, Trash2, CreditCard } from 'lucide-react';
import { usePayments, useCreatePayment, useUpdatePayment, useDeletePayment, Payment } from '@/hooks/usePayments';
import { useInvoices } from '@/hooks/useInvoices';
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
import { format, parseISO } from 'date-fns';

const paymentModeLabels: Record<string, string> = {
  bank_transfer: 'Bank Transfer',
  cash: 'Cash',
  credit_card: 'Credit Card',
  cheque: 'Cheque',
  other: 'Other',
};

export default function Payments() {
  const { data: payments, isLoading } = usePayments();
  const { data: invoices } = useInvoices();
  const createPayment = useCreatePayment();
  const updatePayment = useUpdatePayment();
  const deletePayment = useDeletePayment();
  const { userRole, isSuperAdmin, hasPermission } = useAuth();
  
  const [search, setSearch] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingPayment, setEditingPayment] = useState<Payment | null>(null);
  const [formData, setFormData] = useState({
    invoice_id: '',
    payment_date: format(new Date(), 'yyyy-MM-dd'),
    amount: 0,
    payment_mode: 'bank_transfer' as 'bank_transfer' | 'cash' | 'credit_card' | 'cheque' | 'other',
    reference_number: '',
    notes: '',
    region: userRole?.region || 'UAE',
  });

  const filteredPayments = payments?.filter(p =>
    p.invoices?.invoice_number.toLowerCase().includes(search.toLowerCase()) ||
    p.invoices?.clients?.name.toLowerCase().includes(search.toLowerCase()) ||
    p.reference_number?.toLowerCase().includes(search.toLowerCase())
  );

  // Get invoices with pending balance
  const invoicesWithBalance = invoices?.filter(inv => (inv.balance || 0) > 0);

  const resetForm = () => {
    setFormData({
      invoice_id: '',
      payment_date: format(new Date(), 'yyyy-MM-dd'),
      amount: 0,
      payment_mode: 'bank_transfer',
      reference_number: '',
      notes: '',
      region: userRole?.region || 'UAE',
    });
    setEditingPayment(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingPayment) {
      await updatePayment.mutateAsync({ id: editingPayment.id, ...formData });
      setEditingPayment(null);
    } else {
      await createPayment.mutateAsync(formData as any);
      setIsCreateOpen(false);
    }
    resetForm();
  };

  const handleEdit = (payment: Payment) => {
    setEditingPayment(payment);
    setFormData({
      invoice_id: payment.invoice_id,
      payment_date: payment.payment_date,
      amount: payment.amount,
      payment_mode: payment.payment_mode,
      reference_number: payment.reference_number || '',
      notes: payment.notes || '',
      region: payment.region,
    });
  };

  const handleInvoiceSelect = (invoiceId: string) => {
    const invoice = invoices?.find(inv => inv.id === invoiceId);
    setFormData({
      ...formData,
      invoice_id: invoiceId,
      amount: invoice?.balance || 0,
      region: invoice?.region || formData.region,
    });
  };

  const canManage = hasPermission('canManagePayments');

  const FormFields = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Invoice *</Label>
          <Select
            value={formData.invoice_id}
            onValueChange={handleInvoiceSelect}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select invoice" />
            </SelectTrigger>
            <SelectContent>
              {(editingPayment ? invoices : invoicesWithBalance)?.map(invoice => (
                <SelectItem key={invoice.id} value={invoice.id}>
                  {invoice.invoice_number} - {invoice.clients?.name} (Balance: {(invoice.balance || 0).toFixed(2)})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Payment Date *</Label>
          <Input
            type="date"
            value={formData.payment_date}
            onChange={(e) => setFormData({ ...formData, payment_date: e.target.value })}
            required
          />
        </div>
        <div className="space-y-2">
          <Label>Amount *</Label>
          <Input
            type="number"
            value={formData.amount}
            onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
            min={0}
            step="0.01"
            required
          />
        </div>
        <div className="space-y-2">
          <Label>Payment Mode *</Label>
          <Select
            value={formData.payment_mode}
            onValueChange={(value) => setFormData({ ...formData, payment_mode: value as any })}
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
        <div className="space-y-2">
          <Label>Reference Number</Label>
          <Input
            value={formData.reference_number}
            onChange={(e) => setFormData({ ...formData, reference_number: e.target.value })}
            placeholder="Transaction/Check number"
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
      <div className="space-y-2">
        <Label>Notes</Label>
        <Textarea
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
        />
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Payments</h1>
          <p className="text-muted-foreground">Track and record payments</p>
        </div>
        {canManage && (
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="mr-2 h-4 w-4" /> Record Payment
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Record Payment</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <FormFields />
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createPayment.isPending}>
                    {createPayment.isPending ? 'Recording...' : 'Record Payment'}
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
                placeholder="Search payments..."
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
          ) : filteredPayments?.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <CreditCard className="mx-auto h-12 w-12 mb-4 opacity-50" />
              <p>No payments found</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Invoice</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Mode</TableHead>
                  <TableHead>Reference</TableHead>
                  <TableHead>Region</TableHead>
                  {canManage && <TableHead className="w-[100px]">Actions</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPayments?.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell>{format(parseISO(payment.payment_date), 'MMM d, yyyy')}</TableCell>
                    <TableCell className="font-medium">{payment.invoices?.invoice_number}</TableCell>
                    <TableCell>{payment.invoices?.clients?.name}</TableCell>
                    <TableCell className="font-medium text-emerald-600">{payment.amount.toFixed(2)} AED</TableCell>
                    <TableCell>
                      <Badge variant="outline">{paymentModeLabels[payment.payment_mode]}</Badge>
                    </TableCell>
                    <TableCell>{payment.reference_number || '-'}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{payment.region}</Badge>
                    </TableCell>
                    {canManage && (
                      <TableCell>
                        <div className="flex gap-1">
                          <Dialog open={editingPayment?.id === payment.id} onOpenChange={(open) => !open && setEditingPayment(null)}>
                            <DialogTrigger asChild>
                              <Button variant="ghost" size="icon" onClick={() => handleEdit(payment)}>
                                <Edit className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                              <DialogHeader>
                                <DialogTitle>Edit Payment</DialogTitle>
                              </DialogHeader>
                              <form onSubmit={handleSubmit} className="space-y-4">
                                <FormFields />
                                <div className="flex justify-end gap-2">
                                  <Button type="button" variant="outline" onClick={() => setEditingPayment(null)}>
                                    Cancel
                                  </Button>
                                  <Button type="submit" disabled={updatePayment.isPending}>
                                    {updatePayment.isPending ? 'Saving...' : 'Save Changes'}
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
                                <AlertDialogTitle>Delete Payment</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete this payment? This will update the invoice balance.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => deletePayment.mutate(payment.id)}
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
          )}
        </CardContent>
      </Card>
    </div>
  );
}
