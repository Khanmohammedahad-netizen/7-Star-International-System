import { useState } from 'react';
import { X, Package, User, Phone, CreditCard, FileText, Edit, CheckCircle, XCircle, Clock, Download } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Event, useApproveEvent } from '@/hooks/useEvents';
import { useInvoices } from '@/hooks/useInvoices';
import { useQuotations } from '@/hooks/useQuotations';
import { usePayments } from '@/hooks/usePayments';
import { useEmployees } from '@/hooks/useEmployees';
import { usePdfDownload } from '@/hooks/usePdfDownload';
import { useAuth } from '@/contexts/AuthContext';
import { format, parseISO } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

const statusColors: Record<string, string> = {
  pending: 'bg-amber-500',
  approved: 'bg-emerald-500',
  rejected: 'bg-red-500',
  completed: 'bg-blue-500',
};

interface EventControlCenterProps {
  event: Event | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (event: Event) => void;
  canManage: boolean;
}

export function EventControlCenter({ event, isOpen, onClose, onEdit, canManage }: EventControlCenterProps) {
  const { hasPermission } = useAuth();
  const approveEvent = useApproveEvent();
  const { downloadPdf, isLoading: isPdfLoading } = usePdfDownload();
  const queryClient = useQueryClient();

  // Fetch event materials
  const { data: eventMaterials } = useQuery({
    queryKey: ['event-materials', event?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('event_materials')
        .select('*, materials(*)')
        .eq('event_id', event!.id);
      if (error) throw error;
      return data;
    },
    enabled: !!event?.id,
  });

  // Fetch all materials for adding
  const { data: allMaterials } = useQuery({
    queryKey: ['materials'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('materials')
        .select('*')
        .eq('is_active', true);
      if (error) throw error;
      return data;
    },
  });

  // Fetch employees
  const { data: employees } = useEmployees();

  // Fetch event-related invoices
  const { data: allInvoices } = useInvoices();
  const eventInvoices = allInvoices?.filter(inv => inv.client_id === event?.client_id);

  // Fetch event-related quotations
  const { data: allQuotations } = useQuotations();
  const eventQuotations = allQuotations?.filter(q => q.client_id === event?.client_id);

  // Fetch payments for event invoices
  const { data: allPayments } = usePayments();
  const eventPayments = allPayments?.filter(p => 
    eventInvoices?.some(inv => inv.id === p.invoice_id)
  );

  // Add material mutation
  const addMaterial = useMutation({
    mutationFn: async ({ materialId, quantity }: { materialId: string; quantity: number }) => {
      const material = allMaterials?.find(m => m.id === materialId);
      const { error } = await supabase
        .from('event_materials')
        .insert({
          event_id: event!.id,
          material_id: materialId,
          quantity,
          unit_price: material?.unit_price || 0,
          total_price: (material?.unit_price || 0) * quantity,
        });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['event-materials', event?.id] });
      toast.success('Material added');
    },
    onError: (error: any) => {
      toast.error(`Failed to add material: ${error.message}`);
    },
  });

  // Remove material mutation
  const removeMaterial = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('event_materials').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['event-materials', event?.id] });
      toast.success('Material removed');
    },
  });

  // Local state for adding materials
  const [selectedMaterial, setSelectedMaterial] = useState('');
  const [materialQuantity, setMaterialQuantity] = useState(1);

  if (!event) return null;

  const pendingPayments = eventPayments?.filter(p => {
    const invoice = eventInvoices?.find(inv => inv.id === p.invoice_id);
    return invoice && (invoice.balance || 0) > 0;
  }) || [];

  const approvedPayments = eventPayments || [];

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-full sm:max-w-xl md:max-w-2xl overflow-hidden flex flex-col">
        <SheetHeader className="flex-shrink-0">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-xl">{event.title}</SheetTitle>
            <Badge className={`${statusColors[event.status]} text-white`}>
              {event.status}
            </Badge>
          </div>
          <div className="text-sm text-muted-foreground">
            {event.clients?.name} • {format(parseISO(event.event_date), 'MMM d, yyyy')}
            {event.location && ` • ${event.location}`}
          </div>
        </SheetHeader>

        <ScrollArea className="flex-1 -mx-6 px-6">
          <div className="space-y-4 pb-6">
            {/* Quick Actions */}
            {canManage && (
              <div className="flex flex-wrap gap-2 pt-2">
                {event.status === 'pending' && (
                  <>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => approveEvent.mutate({ id: event.id, status: 'approved' })}
                      className="text-emerald-600"
                    >
                      <CheckCircle className="h-4 w-4 mr-1" /> Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => approveEvent.mutate({ id: event.id, status: 'rejected' })}
                      className="text-red-600"
                    >
                      <XCircle className="h-4 w-4 mr-1" /> Reject
                    </Button>
                  </>
                )}
                {event.status === 'approved' && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => approveEvent.mutate({ id: event.id, status: 'completed' })}
                    className="text-blue-600"
                  >
                    <Clock className="h-4 w-4 mr-1" /> Mark Complete
                  </Button>
                )}
                <Button size="sm" variant="outline" onClick={() => onEdit(event)}>
                  <Edit className="h-4 w-4 mr-1" /> Edit Event
                </Button>
              </div>
            )}

            <Separator />

            <Tabs defaultValue="materials" className="w-full">
              <TabsList className="grid w-full grid-cols-5 h-auto">
                <TabsTrigger value="materials" className="text-xs px-2 py-1.5">
                  <Package className="h-3 w-3 mr-1 hidden sm:inline" />
                  Materials
                </TabsTrigger>
                <TabsTrigger value="manager" className="text-xs px-2 py-1.5">
                  <User className="h-3 w-3 mr-1 hidden sm:inline" />
                  Manager
                </TabsTrigger>
                <TabsTrigger value="client" className="text-xs px-2 py-1.5">
                  <Phone className="h-3 w-3 mr-1 hidden sm:inline" />
                  Client
                </TabsTrigger>
                <TabsTrigger value="payments" className="text-xs px-2 py-1.5">
                  <CreditCard className="h-3 w-3 mr-1 hidden sm:inline" />
                  Payments
                </TabsTrigger>
                <TabsTrigger value="documents" className="text-xs px-2 py-1.5">
                  <FileText className="h-3 w-3 mr-1 hidden sm:inline" />
                  Docs
                </TabsTrigger>
              </TabsList>

              {/* Materials Tab */}
              <TabsContent value="materials" className="space-y-4 mt-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Event Materials</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {eventMaterials?.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No materials assigned</p>
                    ) : (
                      <div className="space-y-2">
                        {eventMaterials?.map((em: any) => (
                          <div key={em.id} className="flex items-center justify-between p-2 bg-muted rounded">
                            <div>
                              <p className="text-sm font-medium">{em.materials?.name}</p>
                              <p className="text-xs text-muted-foreground">
                                Qty: {em.quantity} × {em.unit_price} = {em.total_price}
                              </p>
                            </div>
                            {canManage && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeMaterial.mutate(em.id)}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {canManage && (
                      <>
                        <Separator />
                        <div className="space-y-2">
                          <Label className="text-xs">Add Material</Label>
                          <div className="flex gap-2">
                            <Select value={selectedMaterial} onValueChange={setSelectedMaterial}>
                              <SelectTrigger className="flex-1">
                                <SelectValue placeholder="Select material" />
                              </SelectTrigger>
                              <SelectContent>
                                {allMaterials?.map((m) => (
                                  <SelectItem key={m.id} value={m.id}>
                                    {m.name} ({m.unit_price})
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <Input
                              type="number"
                              min={1}
                              value={materialQuantity}
                              onChange={(e) => setMaterialQuantity(parseInt(e.target.value) || 1)}
                              className="w-20"
                              placeholder="Qty"
                            />
                            <Button
                              size="sm"
                              onClick={() => {
                                if (selectedMaterial) {
                                  addMaterial.mutate({ materialId: selectedMaterial, quantity: materialQuantity });
                                  setSelectedMaterial('');
                                  setMaterialQuantity(1);
                                }
                              }}
                              disabled={!selectedMaterial}
                            >
                              Add
                            </Button>
                          </div>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Manager Tab */}
              <TabsContent value="manager" className="space-y-4 mt-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Responsible Manager</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <p className="text-sm text-muted-foreground">
                        Select from available employees:
                      </p>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select manager" />
                        </SelectTrigger>
                        <SelectContent>
                          {employees?.filter(e => e.position?.toLowerCase().includes('manager'))
                            .map((emp) => (
                              <SelectItem key={emp.id} value={emp.id}>
                                {emp.full_name} - {emp.position}
                              </SelectItem>
                            ))}
                          {employees?.filter(e => !e.position?.toLowerCase().includes('manager'))
                            .map((emp) => (
                              <SelectItem key={emp.id} value={emp.id}>
                                {emp.full_name} - {emp.position || 'Staff'}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground">
                        Staff count for this event: {event.staff_count || 0}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Client Tab */}
              <TabsContent value="client" className="space-y-4 mt-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Client Representative</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <Label className="text-xs text-muted-foreground">Client Name</Label>
                      <p className="text-sm font-medium">{event.clients?.name}</p>
                    </div>
                    {event.clients?.company_name && (
                      <div>
                        <Label className="text-xs text-muted-foreground">Company</Label>
                        <p className="text-sm">{event.clients?.company_name}</p>
                      </div>
                    )}
                    <div>
                      <Label className="text-xs text-muted-foreground">Representative Name</Label>
                      <p className="text-sm">{event.clients?.representative_name || 'Not specified'}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Representative Phone</Label>
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <p className="text-sm font-medium">
                          {event.clients?.representative_phone || 'Not specified'}
                        </p>
                      </div>
                    </div>
                    {event.clients?.email && (
                      <div>
                        <Label className="text-xs text-muted-foreground">Email</Label>
                        <p className="text-sm">{event.clients?.email}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Payments Tab */}
              <TabsContent value="payments" className="space-y-4 mt-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Payments Status</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline" className="text-amber-600 border-amber-600">
                          Pending
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {eventInvoices?.filter(inv => (inv.balance || 0) > 0).length || 0} invoices
                        </span>
                      </div>
                      {eventInvoices?.filter(inv => (inv.balance || 0) > 0).length === 0 ? (
                        <p className="text-sm text-muted-foreground">No pending payments</p>
                      ) : (
                        <div className="space-y-2">
                          {eventInvoices?.filter(inv => (inv.balance || 0) > 0).map((inv) => (
                            <div key={inv.id} className="flex justify-between items-center p-2 bg-muted rounded text-sm">
                              <span>{inv.invoice_number}</span>
                              <span className="text-amber-600 font-medium">{inv.balance} AED</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <Separator />

                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline" className="text-emerald-600 border-emerald-600">
                          Completed
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {approvedPayments.length} payments
                        </span>
                      </div>
                      {approvedPayments.length === 0 ? (
                        <p className="text-sm text-muted-foreground">No completed payments</p>
                      ) : (
                        <div className="space-y-2">
                          {approvedPayments.slice(0, 5).map((payment) => (
                            <div key={payment.id} className="flex justify-between items-center p-2 bg-muted rounded text-sm">
                              <span>{format(parseISO(payment.payment_date), 'MMM d, yyyy')}</span>
                              <span className="text-emerald-600 font-medium">{payment.amount} AED</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Documents Tab */}
              <TabsContent value="documents" className="space-y-4 mt-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Financial Documents</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label className="text-xs text-muted-foreground mb-2 block">Invoices</Label>
                      {eventInvoices?.length === 0 ? (
                        <p className="text-sm text-muted-foreground">No invoices for this client</p>
                      ) : (
                        <div className="space-y-2">
                          {eventInvoices?.slice(0, 5).map((inv) => (
                            <div key={inv.id} className="flex justify-between items-center p-2 bg-muted rounded">
                              <div>
                                <p className="text-sm font-medium">{inv.invoice_number}</p>
                                <p className="text-xs text-muted-foreground">
                                  {format(parseISO(inv.invoice_date), 'MMM d, yyyy')} • {inv.total_amount} AED
                                </p>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => downloadPdf({
                                  type: 'invoice',
                                  id: inv.id,
                                  filename: `Invoice-${inv.invoice_number}.pdf`
                                })}
                                disabled={isPdfLoading}
                              >
                                <Download className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <Separator />

                    <div>
                      <Label className="text-xs text-muted-foreground mb-2 block">Quotations</Label>
                      {eventQuotations?.length === 0 ? (
                        <p className="text-sm text-muted-foreground">No quotations for this client</p>
                      ) : (
                        <div className="space-y-2">
                          {eventQuotations?.slice(0, 5).map((q) => (
                            <div key={q.id} className="flex justify-between items-center p-2 bg-muted rounded">
                              <div>
                                <p className="text-sm font-medium">{q.quotation_number}</p>
                                <p className="text-xs text-muted-foreground">
                                  {format(parseISO(q.quotation_date), 'MMM d, yyyy')} • {q.total_amount} AED
                                </p>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => downloadPdf({
                                  type: 'quotation',
                                  id: q.id,
                                  filename: `Quotation-${q.quotation_number}.pdf`
                                })}
                                disabled={isPdfLoading}
                              >
                                <Download className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
