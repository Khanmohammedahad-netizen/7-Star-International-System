import { useState } from 'react';
import { Plus, Search, Edit, Trash2, Receipt, Download, FileSpreadsheet } from 'lucide-react';
import { useInvoices, useCreateInvoice, useUpdateInvoice, useDeleteInvoice, Invoice } from '@/hooks/useInvoices';
import { useClients } from '@/hooks/useClients';
import { useAuth } from '@/contexts/AuthContext';
import { usePdfDownload } from '@/hooks/usePdfDownload';
import { useExcelExport } from '@/hooks/useExcelExport';
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
import { ClientCombobox } from '@/components/ClientCombobox';
import { format, parseISO, subMonths } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';

const statusColors: Record<string, string> = {
  draft: 'bg-secondary text-secondary-foreground',
  sent: 'bg-blue-500 text-white',
  approved: 'bg-emerald-500 text-white',
  rejected: 'bg-red-500 text-white',
};

interface InvoiceItem {
  serial_no: number;
  description: string;
  size: string;
  quantity: number;
  rate: number;
  amount: number;
}

export default function Invoices() {
  const { data: invoices, isLoading } = useInvoices();
  const { data: clients } = useClients();
  const createInvoice = useCreateInvoice();
  const updateInvoice = useUpdateInvoice();
  const deleteInvoice = useDeleteInvoice();
  const { userRole, isSuperAdmin, hasPermission } = useAuth();
  const { downloadPdf, isLoading: isPdfLoading } = usePdfDownload();
  const { exportToExcel, isLoading: isExportLoading } = useExcelExport();
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [exportFromDate, setExportFromDate] = useState(format(subMonths(new Date(), 3), 'yyyy-MM-dd'));
  const [exportToDate, setExportToDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [search, setSearch] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
  const [formData, setFormData] = useState({
    invoice_number: '',
    client_id: '',
    invoice_date: format(new Date(), 'yyyy-MM-dd'),
    notes: '',
    region: userRole?.region || 'UAE',
    status: 'draft' as 'draft' | 'sent' | 'approved' | 'rejected',
  });
  const [items, setItems] = useState<InvoiceItem[]>([
    { serial_no: 1, description: '', size: '', quantity: 1, rate: 0, amount: 0 },
  ]);
  const [isGeneratingNumber, setIsGeneratingNumber] = useState(false);

  const filteredInvoices = invoices?.filter(i =>
    i.invoice_number.toLowerCase().includes(search.toLowerCase()) ||
    i.clients?.name.toLowerCase().includes(search.toLowerCase())
  );

  const calculateTotals = () => {
    const netAmount = items.reduce((sum, item) => sum + item.amount, 0);
    const vatAmount = netAmount * 0.05;
    const totalAmount = netAmount + vatAmount;
    return { netAmount, vatAmount, totalAmount };
  };

  const updateItemAmount = (index: number, field: keyof InvoiceItem, value: any) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    if (field === 'quantity' || field === 'rate') {
      newItems[index].amount = newItems[index].quantity * newItems[index].rate;
    }
    setItems(newItems);
  };

  const addItem = () => {
    setItems([...items, { serial_no: items.length + 1, description: '', size: '', quantity: 1, rate: 0, amount: 0 }]);
  };

  const removeItem = (index: number) => {
    const newItems = items.filter((_, i) => i !== index).map((item, i) => ({ ...item, serial_no: i + 1 }));
    setItems(newItems);
  };

  const generateInvoiceNumber = async () => {
    setIsGeneratingNumber(true);
    try {
      const region = formData.region as 'UAE' | 'SAUDI';
      const { data, error } = await supabase.rpc('get_next_invoice_number', { _region: region });
      if (error) throw error;
      setFormData({ ...formData, invoice_number: data });
    } catch (error) {
      console.error('Failed to generate invoice number:', error);
    } finally {
      setIsGeneratingNumber(false);
    }
  };

  const resetForm = async () => {
    setFormData({
      invoice_number: '',
      client_id: '',
      invoice_date: format(new Date(), 'yyyy-MM-dd'),
      notes: '',
      region: userRole?.region || 'UAE',
      status: 'draft',
    });
    setItems([{ serial_no: 1, description: '', size: '', quantity: 1, rate: 0, amount: 0 }]);
    setEditingInvoice(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { netAmount, vatAmount, totalAmount } = calculateTotals();
    const data = {
      ...formData,
      net_amount: netAmount,
      vat_amount: vatAmount,
      total_amount: totalAmount,
      items: items.map(item => ({
        serial_no: item.serial_no,
        description: item.description,
        size: item.size || null,
        quantity: item.quantity,
        rate: item.rate,
        amount: item.amount,
      })),
    };
    
    if (editingInvoice) {
      await updateInvoice.mutateAsync({ id: editingInvoice.id, ...data });
      setEditingInvoice(null);
    } else {
      await createInvoice.mutateAsync(data as any);
      setIsCreateOpen(false);
    }
    resetForm();
  };

  const handleEdit = (invoice: Invoice) => {
    setEditingInvoice(invoice);
    setFormData({
      invoice_number: invoice.invoice_number,
      client_id: invoice.client_id,
      invoice_date: invoice.invoice_date,
      notes: invoice.notes || '',
      region: invoice.region,
      status: invoice.status,
    });
    if (invoice.invoice_items && invoice.invoice_items.length > 0) {
      setItems(invoice.invoice_items.map(item => ({
        serial_no: item.serial_no,
        description: item.description,
        size: item.size || '',
        quantity: item.quantity,
        rate: item.rate,
        amount: item.amount || 0,
      })));
    }
  };

  const canManage = hasPermission('canManageInvoices');
  const { netAmount, vatAmount, totalAmount } = calculateTotals();

  const FormContent = () => (
    <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto px-1">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Invoice Number *</Label>
          <div className="flex gap-2">
            <Input
              value={formData.invoice_number}
              onChange={(e) => setFormData({ ...formData, invoice_number: e.target.value })}
              required
            />
            {!editingInvoice && (
              <Button type="button" variant="outline" onClick={generateInvoiceNumber} disabled={isGeneratingNumber}>
                {isGeneratingNumber ? '...' : 'Auto'}
              </Button>
            )}
          </div>
        </div>
        <div className="space-y-2">
          <Label>Client *</Label>
          <ClientCombobox
            clients={clients}
            value={formData.client_id}
            onValueChange={(value) => setFormData({ ...formData, client_id: value })}
            placeholder="Search or select client..."
          />
        </div>
        <div className="space-y-2">
          <Label>Date *</Label>
          <Input
            type="date"
            value={formData.invoice_date}
            onChange={(e) => setFormData({ ...formData, invoice_date: e.target.value })}
            required
          />
        </div>
        <div className="space-y-2">
          <Label>Status</Label>
          <Select
            value={formData.status}
            onValueChange={(value) => setFormData({ ...formData, status: value as any })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="sent">Sent</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
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

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>Line Items</Label>
          <Button type="button" variant="outline" size="sm" onClick={addItem}>
            <Plus className="h-4 w-4 mr-1" /> Add Item
          </Button>
        </div>
        
        {/* Mobile-friendly line items */}
        <div className="space-y-4 sm:hidden">
          {items.map((item, index) => (
            <Card key={index} className="p-3">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Item #{item.serial_no}</span>
                {items.length > 1 && (
                  <Button type="button" variant="ghost" size="icon" onClick={() => removeItem(index)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                )}
              </div>
              <div className="space-y-2">
                <Input
                  value={item.description}
                  onChange={(e) => updateItemAmount(index, 'description', e.target.value)}
                  placeholder="Description"
                />
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    value={item.size}
                    onChange={(e) => updateItemAmount(index, 'size', e.target.value)}
                    placeholder="Size"
                  />
                  <Input
                    type="number"
                    value={item.quantity}
                    onChange={(e) => updateItemAmount(index, 'quantity', parseInt(e.target.value) || 0)}
                    min={1}
                    placeholder="Qty"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    type="number"
                    value={item.rate}
                    onChange={(e) => updateItemAmount(index, 'rate', parseFloat(e.target.value) || 0)}
                    min={0}
                    step="0.01"
                    placeholder="Rate"
                  />
                  <div className="flex items-center justify-end font-medium">
                    Amount: {item.amount.toFixed(2)}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Desktop table */}
        <div className="hidden sm:block overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[60px]">S.No</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="w-[100px]">Size</TableHead>
                <TableHead className="w-[80px]">Qty</TableHead>
                <TableHead className="w-[100px]">Rate</TableHead>
                <TableHead className="w-[100px]">Amount</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item, index) => (
                <TableRow key={index}>
                  <TableCell>{item.serial_no}</TableCell>
                  <TableCell>
                    <Input
                      value={item.description}
                      onChange={(e) => updateItemAmount(index, 'description', e.target.value)}
                      placeholder="Description"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      value={item.size}
                      onChange={(e) => updateItemAmount(index, 'size', e.target.value)}
                      placeholder="Size"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => updateItemAmount(index, 'quantity', parseInt(e.target.value) || 0)}
                      min={1}
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      value={item.rate}
                      onChange={(e) => updateItemAmount(index, 'rate', parseFloat(e.target.value) || 0)}
                      min={0}
                      step="0.01"
                    />
                  </TableCell>
                  <TableCell className="font-medium">{item.amount.toFixed(2)}</TableCell>
                  <TableCell>
                    {items.length > 1 && (
                      <Button type="button" variant="ghost" size="icon" onClick={() => removeItem(index)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      <div className="flex justify-end">
        <div className="text-right space-y-1">
          <div>Net Amount: <span className="font-medium">{netAmount.toFixed(2)} AED</span></div>
          <div>VAT (5%): <span className="font-medium">{vatAmount.toFixed(2)} AED</span></div>
          <div className="text-lg">Total: <span className="font-bold">{totalAmount.toFixed(2)} AED</span></div>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Notes</Label>
        <Textarea
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
        />
      </div>

      <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 pt-4 border-t">
        <Button type="button" variant="outline" onClick={() => { setIsCreateOpen(false); setEditingInvoice(null); }}>
          Cancel
        </Button>
        <Button type="submit" disabled={createInvoice.isPending || updateInvoice.isPending}>
          {createInvoice.isPending || updateInvoice.isPending ? 'Saving...' : editingInvoice ? 'Save Changes' : 'Create Invoice'}
        </Button>
      </div>
    </form>
  );

  // Mobile card view for invoices
  const InvoiceCard = ({ invoice }: { invoice: Invoice }) => (
    <Card className="p-4">
      <div className="flex justify-between items-start mb-2">
        <div>
          <p className="font-medium">{invoice.invoice_number}</p>
          <p className="text-sm text-muted-foreground">{invoice.clients?.name}</p>
        </div>
        <Badge className={statusColors[invoice.status]}>{invoice.status}</Badge>
      </div>
      <div className="grid grid-cols-2 gap-2 text-sm mb-3">
        <div>
          <p className="text-muted-foreground">Date</p>
          <p>{format(parseISO(invoice.invoice_date), 'MMM d, yyyy')}</p>
        </div>
        <div>
          <p className="text-muted-foreground">Total</p>
          <p className="font-medium">{invoice.total_amount.toFixed(2)} AED</p>
        </div>
        <div>
          <p className="text-muted-foreground">Paid</p>
          <p>{invoice.amount_paid.toFixed(2)} AED</p>
        </div>
        <div>
          <p className="text-muted-foreground">Balance</p>
          <p className={(invoice.balance || 0) > 0 ? 'text-destructive font-medium' : ''}>
            {(invoice.balance || 0).toFixed(2)} AED
          </p>
        </div>
      </div>
      <div className="flex gap-2 justify-end border-t pt-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => downloadPdf({
            type: 'invoice',
            id: invoice.id,
            filename: `Invoice-${invoice.invoice_number}.pdf`
          })}
          disabled={isPdfLoading}
        >
          <Download className="h-4 w-4" />
        </Button>
        {canManage && (
          <>
            <Dialog open={editingInvoice?.id === invoice.id} onOpenChange={(open) => !open && setEditingInvoice(null)}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="sm" onClick={() => handleEdit(invoice)}>
                  <Edit className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh]">
                <DialogHeader>
                  <DialogTitle>Edit Invoice</DialogTitle>
                </DialogHeader>
                <FormContent />
              </DialogContent>
            </Dialog>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="sm">
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Invoice</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete invoice "{invoice.invoice_number}"?
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => deleteInvoice.mutate(invoice.id)}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </>
        )}
      </div>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Invoices</h1>
          <p className="text-muted-foreground">Manage invoices and billing</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isExportOpen} onOpenChange={setIsExportOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="sm:size-default">
                <FileSpreadsheet className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Export</span>
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Export Invoices to Excel</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>From Date</Label>
                    <Input
                      type="date"
                      value={exportFromDate}
                      onChange={(e) => setExportFromDate(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>To Date</Label>
                    <Input
                      type="date"
                      value={exportToDate}
                      onChange={(e) => setExportToDate(e.target.value)}
                    />
                  </div>
                </div>
                <Button
                  className="w-full"
                  onClick={() => {
                    exportToExcel({
                      type: 'invoices',
                      fromDate: exportFromDate,
                      toDate: exportToDate,
                      region: isSuperAdmin ? undefined : userRole?.region,
                    });
                    setIsExportOpen(false);
                  }}
                  disabled={isExportLoading}
                >
                  <FileSpreadsheet className="mr-2 h-4 w-4" />
                  Download Excel
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          {canManage && (
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
              <DialogTrigger asChild>
                <Button onClick={resetForm} size="sm" className="sm:size-default">
                  <Plus className="h-4 w-4 sm:mr-2" />
                  <span className="hidden sm:inline">New Invoice</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh]">
                <DialogHeader>
                  <DialogTitle>Create Invoice</DialogTitle>
                </DialogHeader>
                <FormContent />
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search invoices..."
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
          ) : filteredInvoices?.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Receipt className="mx-auto h-12 w-12 mb-4 opacity-50" />
              <p>No invoices found</p>
            </div>
          ) : (
            <>
              {/* Mobile card view */}
              <div className="space-y-4 sm:hidden">
                {filteredInvoices?.map((invoice) => (
                  <InvoiceCard key={invoice.id} invoice={invoice} />
                ))}
              </div>

              {/* Desktop table view */}
              <div className="hidden sm:block overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Invoice #</TableHead>
                      <TableHead>Client</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Paid</TableHead>
                      <TableHead>Balance</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="w-[150px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredInvoices?.map((invoice) => (
                      <TableRow key={invoice.id}>
                        <TableCell className="font-medium">{invoice.invoice_number}</TableCell>
                        <TableCell>{invoice.clients?.name}</TableCell>
                        <TableCell>{format(parseISO(invoice.invoice_date), 'MMM d, yyyy')}</TableCell>
                        <TableCell>{invoice.total_amount.toFixed(2)} AED</TableCell>
                        <TableCell>{invoice.amount_paid.toFixed(2)} AED</TableCell>
                        <TableCell className={(invoice.balance || 0) > 0 ? 'text-destructive font-medium' : ''}>
                          {(invoice.balance || 0).toFixed(2)} AED
                        </TableCell>
                        <TableCell>
                          <Badge className={statusColors[invoice.status]}>{invoice.status}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => downloadPdf({
                                type: 'invoice',
                                id: invoice.id,
                                filename: `Invoice-${invoice.invoice_number}.pdf`
                              })}
                              disabled={isPdfLoading}
                              title="Download PDF"
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                            {canManage && (
                              <>
                                <Dialog open={editingInvoice?.id === invoice.id} onOpenChange={(open) => !open && setEditingInvoice(null)}>
                                  <DialogTrigger asChild>
                                    <Button variant="ghost" size="icon" onClick={() => handleEdit(invoice)}>
                                      <Edit className="h-4 w-4" />
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent className="max-w-4xl max-h-[90vh]">
                                    <DialogHeader>
                                      <DialogTitle>Edit Invoice</DialogTitle>
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
                                      <AlertDialogTitle>Delete Invoice</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        Are you sure you want to delete invoice "{invoice.invoice_number}"?
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                                      <AlertDialogAction
                                        onClick={() => deleteInvoice.mutate(invoice.id)}
                                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                      >
                                        Delete
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </>
                            )}
                          </div>
                        </TableCell>
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
