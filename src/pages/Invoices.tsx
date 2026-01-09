import { useState, useCallback, useMemo, useEffect } from 'react';
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
import { Badge } from '@/components/ui/badge';
import { InvoiceFormFields } from '@/components/invoices/InvoiceFormFields';
import { format, parseISO, subMonths } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { getCurrencyCode } from '@/lib/currency';

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

  const totals = useMemo(() => {
    const netAmount = items.reduce((sum, item) => sum + item.amount, 0);
    const vatAmount = netAmount * 0.05;
    const totalAmount = netAmount + vatAmount;
    return { netAmount, vatAmount, totalAmount };
  }, [items]);

  const handleFieldChange = useCallback((field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleItemChange = useCallback((index: number, field: keyof InvoiceItem, value: any) => {
    setItems(prev => {
      const newItems = [...prev];
      newItems[index] = { ...newItems[index], [field]: value };
      if (field === 'quantity' || field === 'rate') {
        newItems[index].amount = newItems[index].quantity * newItems[index].rate;
      }
      return newItems;
    });
  }, []);

  const handleAddItem = useCallback(() => {
    setItems(prev => [...prev, { serial_no: prev.length + 1, description: '', size: '', quantity: 1, rate: 0, amount: 0 }]);
  }, []);

  const handleRemoveItem = useCallback((index: number) => {
    setItems(prev => prev.filter((_, i) => i !== index).map((item, i) => ({ ...item, serial_no: i + 1 })));
  }, []);

  const generateInvoiceNumber = useCallback(async () => {
    if (isGeneratingNumber) return;
    setIsGeneratingNumber(true);
    try {
      const region = formData.region as 'UAE' | 'SAUDI';
      const { data, error } = await supabase.rpc('get_next_invoice_number', { _region: region });
      if (error) throw error;
      setFormData(prev => ({ ...prev, invoice_number: data }));
    } catch (error) {
      console.error('Failed to generate invoice number:', error);
    } finally {
      setIsGeneratingNumber(false);
    }
  }, [formData.region, isGeneratingNumber]);

  // Auto-generate invoice number when opening create dialog
  useEffect(() => {
    if (isCreateOpen && !formData.invoice_number && !isGeneratingNumber) {
      generateInvoiceNumber();
    }
  }, [isCreateOpen, formData.invoice_number, isGeneratingNumber, generateInvoiceNumber]);

  const resetForm = useCallback(() => {
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
  }, [userRole?.region]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      ...formData,
      net_amount: totals.netAmount,
      vat_amount: totals.vatAmount,
      total_amount: totals.totalAmount,
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

  const handleEdit = useCallback((invoice: Invoice) => {
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
  }, []);

  const canManage = hasPermission('canManageInvoices');

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
        <div><p className="text-muted-foreground">Date</p><p>{format(parseISO(invoice.invoice_date), 'MMM d, yyyy')}</p></div>
        <div><p className="text-muted-foreground">Total</p><p className="font-medium">{invoice.total_amount.toFixed(2)} {getCurrencyCode(invoice.region)}</p></div>
        <div><p className="text-muted-foreground">Paid</p><p>{invoice.amount_paid.toFixed(2)} {getCurrencyCode(invoice.region)}</p></div>
        <div><p className="text-muted-foreground">Balance</p><p className={(invoice.balance || 0) > 0 ? 'text-destructive font-medium' : ''}>{(invoice.balance || 0).toFixed(2)} {getCurrencyCode(invoice.region)}</p></div>
      </div>
      <div className="flex gap-2 justify-end border-t pt-3">
        <Button variant="ghost" size="sm" onClick={() => downloadPdf({ type: 'invoice', id: invoice.id, filename: `Invoice-${invoice.invoice_number}.pdf` })} disabled={isPdfLoading}><Download className="h-4 w-4" /></Button>
        {canManage && (
          <>
            <Button variant="ghost" size="sm" onClick={() => handleEdit(invoice)}><Edit className="h-4 w-4" /></Button>
            <AlertDialog>
              <AlertDialogTrigger asChild><Button variant="ghost" size="sm"><Trash2 className="h-4 w-4 text-destructive" /></Button></AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader><AlertDialogTitle>Delete Invoice</AlertDialogTitle><AlertDialogDescription>Are you sure you want to delete invoice "{invoice.invoice_number}"?</AlertDialogDescription></AlertDialogHeader>
                <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => deleteInvoice.mutate(invoice.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction></AlertDialogFooter>
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
        <div><h1 className="text-2xl font-bold tracking-tight">Invoices</h1><p className="text-muted-foreground">Manage invoices and billing</p></div>
        <div className="flex gap-2">
          <Dialog open={isExportOpen} onOpenChange={setIsExportOpen}>
            <DialogTrigger asChild><Button variant="outline" size="sm"><FileSpreadsheet className="h-4 w-4 sm:mr-2" /><span className="hidden sm:inline">Export</span></Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Export Invoices to Excel</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2"><Label>From Date</Label><Input type="date" value={exportFromDate} onChange={(e) => setExportFromDate(e.target.value)} /></div>
                  <div className="space-y-2"><Label>To Date</Label><Input type="date" value={exportToDate} onChange={(e) => setExportToDate(e.target.value)} /></div>
                </div>
                <Button className="w-full" onClick={() => { exportToExcel({ type: 'invoices', fromDate: exportFromDate, toDate: exportToDate, region: isSuperAdmin ? undefined : userRole?.region }); setIsExportOpen(false); }} disabled={isExportLoading}><FileSpreadsheet className="mr-2 h-4 w-4" />Download Excel</Button>
              </div>
            </DialogContent>
          </Dialog>
          {canManage && (
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
              <DialogTrigger asChild><Button onClick={resetForm} size="sm"><Plus className="h-4 w-4 sm:mr-2" /><span className="hidden sm:inline">New Invoice</span></Button></DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh]">
                <DialogHeader><DialogTitle>Create Invoice</DialogTitle></DialogHeader>
                <form onSubmit={handleSubmit}>
                  <InvoiceFormFields formData={formData} onFieldChange={handleFieldChange} clients={clients} isSuperAdmin={isSuperAdmin} isEditing={false} isGeneratingNumber={isGeneratingNumber} onGenerateNumber={generateInvoiceNumber} items={items} onItemChange={handleItemChange} onAddItem={handleAddItem} onRemoveItem={handleRemoveItem} totals={totals} />
                  <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 pt-4 border-t mt-4">
                    <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
                    <Button type="submit" disabled={createInvoice.isPending}>{createInvoice.isPending ? 'Saving...' : 'Create Invoice'}</Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      <Card>
        <CardHeader><div className="flex items-center gap-4"><div className="relative flex-1"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input placeholder="Search invoices..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" /></div></div></CardHeader>
        <CardContent>
          {isLoading ? <div className="text-center py-8 text-muted-foreground">Loading...</div> : filteredInvoices?.length === 0 ? <div className="text-center py-8 text-muted-foreground"><Receipt className="mx-auto h-12 w-12 mb-4 opacity-50" /><p>No invoices found</p></div> : (
            <>
              <div className="space-y-4 sm:hidden">{filteredInvoices?.map((invoice) => <InvoiceCard key={invoice.id} invoice={invoice} />)}</div>
              <div className="hidden sm:block overflow-x-auto">
                <Table>
                  <TableHeader><TableRow><TableHead>Invoice #</TableHead><TableHead>Client</TableHead><TableHead>Date</TableHead><TableHead>Total</TableHead><TableHead>Paid</TableHead><TableHead>Balance</TableHead><TableHead>Status</TableHead><TableHead className="w-[150px]">Actions</TableHead></TableRow></TableHeader>
                  <TableBody>
                    {filteredInvoices?.map((invoice) => (
                      <TableRow key={invoice.id}>
                        <TableCell className="font-medium">{invoice.invoice_number}</TableCell>
                        <TableCell>{invoice.clients?.name}</TableCell>
                        <TableCell>{format(parseISO(invoice.invoice_date), 'MMM d, yyyy')}</TableCell>
                        <TableCell>{invoice.total_amount.toFixed(2)} {getCurrencyCode(invoice.region)}</TableCell>
                        <TableCell>{invoice.amount_paid.toFixed(2)} {getCurrencyCode(invoice.region)}</TableCell>
                        <TableCell className={(invoice.balance || 0) > 0 ? 'text-destructive font-medium' : ''}>{(invoice.balance || 0).toFixed(2)} {getCurrencyCode(invoice.region)}</TableCell>
                        <TableCell><Badge className={statusColors[invoice.status]}>{invoice.status}</Badge></TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button variant="ghost" size="icon" onClick={() => downloadPdf({ type: 'invoice', id: invoice.id, filename: `Invoice-${invoice.invoice_number}.pdf` })} disabled={isPdfLoading} title="Download PDF"><Download className="h-4 w-4" /></Button>
                            {canManage && (
                              <>
                                <Button variant="ghost" size="icon" onClick={() => handleEdit(invoice)}><Edit className="h-4 w-4" /></Button>
                                <AlertDialog>
                                  <AlertDialogTrigger asChild><Button variant="ghost" size="icon"><Trash2 className="h-4 w-4 text-destructive" /></Button></AlertDialogTrigger>
                                  <AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Delete Invoice</AlertDialogTitle><AlertDialogDescription>Are you sure you want to delete invoice "{invoice.invoice_number}"?</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => deleteInvoice.mutate(invoice.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction></AlertDialogFooter></AlertDialogContent>
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

      {/* Edit Dialog */}
      <Dialog open={!!editingInvoice} onOpenChange={(open) => !open && setEditingInvoice(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader><DialogTitle>Edit Invoice</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit}>
            <InvoiceFormFields formData={formData} onFieldChange={handleFieldChange} clients={clients} isSuperAdmin={isSuperAdmin} isEditing={true} isGeneratingNumber={isGeneratingNumber} onGenerateNumber={generateInvoiceNumber} items={items} onItemChange={handleItemChange} onAddItem={handleAddItem} onRemoveItem={handleRemoveItem} totals={totals} />
            <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 pt-4 border-t mt-4">
              <Button type="button" variant="outline" onClick={() => setEditingInvoice(null)}>Cancel</Button>
              <Button type="submit" disabled={updateInvoice.isPending}>{updateInvoice.isPending ? 'Saving...' : 'Save Changes'}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
