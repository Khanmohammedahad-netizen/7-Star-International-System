import { useState, useCallback, useMemo } from 'react';
import { Plus, Search, Edit, Trash2, FileText, Download } from 'lucide-react';
import { useQuotations, useCreateQuotation, useUpdateQuotation, useDeleteQuotation, Quotation } from '@/hooks/useQuotations';
import { useClients } from '@/hooks/useClients';
import { useAuth } from '@/contexts/AuthContext';
import { usePdfDownload } from '@/hooks/usePdfDownload';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { QuotationFormFields } from '@/components/quotations/QuotationFormFields';
import { format, parseISO } from 'date-fns';

const statusColors: Record<string, string> = {
  draft: 'bg-secondary text-secondary-foreground',
  sent: 'bg-blue-500 text-white',
  approved: 'bg-emerald-500 text-white',
  rejected: 'bg-red-500 text-white',
};

interface QuotationItem {
  serial_no: number;
  description: string;
  size: string;
  quantity: number;
  rate: number;
  amount: number;
}

export default function Quotations() {
  const { data: quotations, isLoading } = useQuotations();
  const { data: clients } = useClients();
  const createQuotation = useCreateQuotation();
  const updateQuotation = useUpdateQuotation();
  const deleteQuotation = useDeleteQuotation();
  const { userRole, isSuperAdmin, hasPermission } = useAuth();
  const { downloadPdf, isLoading: isPdfLoading } = usePdfDownload();
  
  const [search, setSearch] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingQuotation, setEditingQuotation] = useState<Quotation | null>(null);
  const [formData, setFormData] = useState({
    quotation_number: '',
    client_id: '',
    quotation_date: format(new Date(), 'yyyy-MM-dd'),
    element: '',
    notes: '',
    region: userRole?.region || 'UAE',
    status: 'draft' as 'draft' | 'sent' | 'approved' | 'rejected',
  });
  const [items, setItems] = useState<QuotationItem[]>([
    { serial_no: 1, description: '', size: '', quantity: 1, rate: 0, amount: 0 },
  ]);

  const filteredQuotations = quotations?.filter(q =>
    q.quotation_number.toLowerCase().includes(search.toLowerCase()) ||
    q.clients?.name.toLowerCase().includes(search.toLowerCase())
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

  const handleItemChange = useCallback((index: number, field: keyof QuotationItem, value: any) => {
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

  const resetForm = useCallback(() => {
    setFormData({
      quotation_number: `Q-${Date.now()}`,
      client_id: '',
      quotation_date: format(new Date(), 'yyyy-MM-dd'),
      element: '',
      notes: '',
      region: userRole?.region || 'UAE',
      status: 'draft',
    });
    setItems([{ serial_no: 1, description: '', size: '', quantity: 1, rate: 0, amount: 0 }]);
    setEditingQuotation(null);
  }, [userRole?.region]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      ...formData,
      net_amount: totals.netAmount,
      vat_amount: totals.vatAmount,
      total_amount: totals.totalAmount,
      items: items.map(item => ({ serial_no: item.serial_no, description: item.description, size: item.size || null, quantity: item.quantity, rate: item.rate, amount: item.amount })),
    };
    
    if (editingQuotation) {
      await updateQuotation.mutateAsync({ id: editingQuotation.id, ...data });
      setEditingQuotation(null);
    } else {
      await createQuotation.mutateAsync(data as any);
      setIsCreateOpen(false);
    }
    resetForm();
  };

  const handleEdit = useCallback((quotation: Quotation) => {
    setEditingQuotation(quotation);
    setFormData({
      quotation_number: quotation.quotation_number,
      client_id: quotation.client_id,
      quotation_date: quotation.quotation_date,
      element: quotation.element || '',
      notes: quotation.notes || '',
      region: quotation.region,
      status: quotation.status,
    });
    if (quotation.quotation_items && quotation.quotation_items.length > 0) {
      setItems(quotation.quotation_items.map(item => ({ serial_no: item.serial_no, description: item.description, size: item.size || '', quantity: item.quantity, rate: item.rate, amount: item.amount || 0 })));
    }
  }, []);

  const canManage = hasPermission('canManageQuotations');

  const QuotationCard = ({ quotation }: { quotation: Quotation }) => (
    <Card className="p-4">
      <div className="flex justify-between items-start mb-2">
        <div><p className="font-medium">{quotation.quotation_number}</p><p className="text-sm text-muted-foreground">{quotation.clients?.name}</p></div>
        <Badge className={statusColors[quotation.status]}>{quotation.status}</Badge>
      </div>
      <div className="grid grid-cols-2 gap-2 text-sm mb-3">
        <div><p className="text-muted-foreground">Date</p><p>{format(parseISO(quotation.quotation_date), 'MMM d, yyyy')}</p></div>
        <div><p className="text-muted-foreground">Total</p><p className="font-medium">{quotation.total_amount.toFixed(2)} AED</p></div>
        <div><p className="text-muted-foreground">Region</p><Badge variant="outline">{quotation.region}</Badge></div>
      </div>
      <div className="flex gap-2 justify-end border-t pt-3">
        <Button variant="ghost" size="sm" onClick={() => downloadPdf({ type: 'quotation', id: quotation.id, filename: `Quotation-${quotation.quotation_number}.pdf` })} disabled={isPdfLoading}><Download className="h-4 w-4" /></Button>
        {canManage && (
          <>
            <Button variant="ghost" size="sm" onClick={() => handleEdit(quotation)}><Edit className="h-4 w-4" /></Button>
            <AlertDialog>
              <AlertDialogTrigger asChild><Button variant="ghost" size="sm"><Trash2 className="h-4 w-4 text-destructive" /></Button></AlertDialogTrigger>
              <AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Delete Quotation</AlertDialogTitle><AlertDialogDescription>Are you sure you want to delete quotation "{quotation.quotation_number}"?</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => deleteQuotation.mutate(quotation.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction></AlertDialogFooter></AlertDialogContent>
            </AlertDialog>
          </>
        )}
      </div>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div><h1 className="text-2xl font-bold tracking-tight">Quotations</h1><p className="text-muted-foreground">Manage quotations and proposals</p></div>
        {canManage && (
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild><Button onClick={resetForm} size="sm"><Plus className="h-4 w-4 sm:mr-2" /><span className="hidden sm:inline">New Quotation</span></Button></DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh]">
              <DialogHeader><DialogTitle>Create Quotation</DialogTitle></DialogHeader>
              <form onSubmit={handleSubmit}>
                <QuotationFormFields formData={formData} onFieldChange={handleFieldChange} clients={clients} isSuperAdmin={isSuperAdmin} items={items} onItemChange={handleItemChange} onAddItem={handleAddItem} onRemoveItem={handleRemoveItem} totals={totals} />
                <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 pt-4 border-t mt-4">
                  <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
                  <Button type="submit" disabled={createQuotation.isPending}>{createQuotation.isPending ? 'Saving...' : 'Create Quotation'}</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <Card>
        <CardHeader><div className="flex items-center gap-4"><div className="relative flex-1"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input placeholder="Search quotations..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" /></div></div></CardHeader>
        <CardContent>
          {isLoading ? <div className="text-center py-8 text-muted-foreground">Loading...</div> : filteredQuotations?.length === 0 ? <div className="text-center py-8 text-muted-foreground"><FileText className="mx-auto h-12 w-12 mb-4 opacity-50" /><p>No quotations found</p></div> : (
            <>
              <div className="space-y-4 sm:hidden">{filteredQuotations?.map((quotation) => <QuotationCard key={quotation.id} quotation={quotation} />)}</div>
              <div className="hidden sm:block overflow-x-auto">
                <Table>
                  <TableHeader><TableRow><TableHead>Quotation #</TableHead><TableHead>Client</TableHead><TableHead>Date</TableHead><TableHead>Total</TableHead><TableHead>Status</TableHead><TableHead>Region</TableHead><TableHead className="w-[150px]">Actions</TableHead></TableRow></TableHeader>
                  <TableBody>
                    {filteredQuotations?.map((quotation) => (
                      <TableRow key={quotation.id}>
                        <TableCell className="font-medium">{quotation.quotation_number}</TableCell>
                        <TableCell>{quotation.clients?.name}</TableCell>
                        <TableCell>{format(parseISO(quotation.quotation_date), 'MMM d, yyyy')}</TableCell>
                        <TableCell>{quotation.total_amount.toFixed(2)} AED</TableCell>
                        <TableCell><Badge className={statusColors[quotation.status]}>{quotation.status}</Badge></TableCell>
                        <TableCell><Badge variant="outline">{quotation.region}</Badge></TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button variant="ghost" size="icon" onClick={() => downloadPdf({ type: 'quotation', id: quotation.id, filename: `Quotation-${quotation.quotation_number}.pdf` })} disabled={isPdfLoading} title="Download PDF"><Download className="h-4 w-4" /></Button>
                            {canManage && (
                              <>
                                <Button variant="ghost" size="icon" onClick={() => handleEdit(quotation)}><Edit className="h-4 w-4" /></Button>
                                <AlertDialog>
                                  <AlertDialogTrigger asChild><Button variant="ghost" size="icon"><Trash2 className="h-4 w-4 text-destructive" /></Button></AlertDialogTrigger>
                                  <AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Delete Quotation</AlertDialogTitle><AlertDialogDescription>Are you sure you want to delete quotation "{quotation.quotation_number}"?</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => deleteQuotation.mutate(quotation.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction></AlertDialogFooter></AlertDialogContent>
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
      <Dialog open={!!editingQuotation} onOpenChange={(open) => !open && setEditingQuotation(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader><DialogTitle>Edit Quotation</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit}>
            <QuotationFormFields formData={formData} onFieldChange={handleFieldChange} clients={clients} isSuperAdmin={isSuperAdmin} items={items} onItemChange={handleItemChange} onAddItem={handleAddItem} onRemoveItem={handleRemoveItem} totals={totals} />
            <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 pt-4 border-t mt-4">
              <Button type="button" variant="outline" onClick={() => setEditingQuotation(null)}>Cancel</Button>
              <Button type="submit" disabled={updateQuotation.isPending}>{updateQuotation.isPending ? 'Saving...' : 'Save Changes'}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
