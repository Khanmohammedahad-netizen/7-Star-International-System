import { useState, useMemo } from 'react';
import { Plus, Search, Edit, Trash2, Store, Phone, Mail, MapPin, Eye, Calendar, TrendingUp, Activity } from 'lucide-react';
import { useVendors, useCreateVendor, useUpdateVendor, useDeleteVendor, useVendorEvents, useVendorsWithStats, VendorWithStats } from '@/hooks/useVendors';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from '@/components/ui/drawer';
import { Separator } from '@/components/ui/separator';
import { format, parseISO } from 'date-fns';
import { VENDOR_TYPE_LABELS, type Vendor, type VendorType, type VendorStatus, type Region } from '@/types/database';

const initialFormData = {
  vendor_name: '',
  vendor_type: 'other' as VendorType,
  facilities_provided: '',
  address: '',
  city: '',
  state: '',
  country: 'UAE',
  representative_name: '',
  representative_phone: '',
  representative_email: '',
  notes: '',
  status: 'active' as VendorStatus,
  region: 'UAE' as Region,
};

function VendorDetailDrawer({ vendor }: { vendor: Vendor }) {
  const { data: vendorEvents, isLoading } = useVendorEvents(vendor.id);

  return (
    <DrawerContent className="max-h-[90vh]">
      <DrawerHeader>
        <DrawerTitle className="flex items-center gap-2">
          <Store className="h-5 w-5" />
          {vendor.vendor_name}
        </DrawerTitle>
      </DrawerHeader>
      <div className="px-4 pb-6 overflow-y-auto">
        <div className="space-y-6">
          {/* Basic Info */}
          <div>
            <h3 className="font-semibold mb-3">Vendor Information</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Type:</span>
                <p className="font-medium">{VENDOR_TYPE_LABELS[vendor.vendor_type]}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Status:</span>
                <Badge variant={vendor.status === 'active' ? 'default' : 'secondary'} className="ml-2">
                  {vendor.status}
                </Badge>
              </div>
              <div>
                <span className="text-muted-foreground">Region:</span>
                <p className="font-medium">{vendor.region}</p>
              </div>
              {vendor.facilities_provided && (
                <div className="col-span-2">
                  <span className="text-muted-foreground">Facilities:</span>
                  <p className="font-medium">{vendor.facilities_provided}</p>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Contact Info */}
          <div>
            <h3 className="font-semibold mb-3">Contact Information</h3>
            <div className="space-y-2 text-sm">
              {vendor.representative_name && (
                <p><span className="text-muted-foreground">Representative:</span> {vendor.representative_name}</p>
              )}
              {vendor.representative_phone && (
                <p className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  {vendor.representative_phone}
                </p>
              )}
              {vendor.representative_email && (
                <p className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  {vendor.representative_email}
                </p>
              )}
            </div>
          </div>

          <Separator />

          {/* Location */}
          <div>
            <h3 className="font-semibold mb-3">Location</h3>
            <div className="text-sm">
              <p className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                <span>
                  {[vendor.address, vendor.city, vendor.state, vendor.country].filter(Boolean).join(', ') || 'Not specified'}
                </span>
              </p>
            </div>
          </div>

          {vendor.notes && (
            <>
              <Separator />
              <div>
                <h3 className="font-semibold mb-3">Notes</h3>
                <p className="text-sm text-muted-foreground">{vendor.notes}</p>
              </div>
            </>
          )}

          <Separator />

          {/* Linked Events */}
          <div>
            <h3 className="font-semibold mb-3">Linked Events</h3>
            {isLoading ? (
              <p className="text-sm text-muted-foreground">Loading...</p>
            ) : vendorEvents && vendorEvents.length > 0 ? (
              <div className="space-y-2">
                {vendorEvents.map((ev: any) => (
                  <Card key={ev.id} className="p-3">
                    <p className="font-medium">{ev.event?.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {ev.event?.client?.name} • {format(parseISO(ev.event?.event_date), 'MMM d, yyyy')}
                    </p>
                  </Card>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No linked events</p>
            )}
          </div>
        </div>
      </div>
    </DrawerContent>
  );
}

export default function Vendors() {
  const { data: vendorsWithStats, isLoading } = useVendorsWithStats();
  const createVendor = useCreateVendor();
  const updateVendor = useUpdateVendor();
  const deleteVendor = useDeleteVendor();
  const { isSuperAdmin, hasPermission, userRegion } = useAuth();

  const canManage = hasPermission('canManageVendors');

  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingVendor, setEditingVendor] = useState<Vendor | null>(null);
  const [formData, setFormData] = useState(initialFormData);

  // Calculate dashboard stats
  const stats = useMemo(() => {
    if (!vendorsWithStats) return { total: 0, active: 0, withEvents: 0, totalEvents: 0, byType: {} };
    
    const total = vendorsWithStats.length;
    const active = vendorsWithStats.filter(v => v.status === 'active').length;
    const withEvents = vendorsWithStats.filter(v => (v.events_count || 0) > 0).length;
    const totalEvents = vendorsWithStats.reduce((sum, v) => sum + (v.events_count || 0), 0);
    
    // Group by type
    const byType: Record<string, number> = {};
    vendorsWithStats.forEach(v => {
      byType[v.vendor_type] = (byType[v.vendor_type] || 0) + 1;
    });
    
    return { total, active, withEvents, totalEvents, byType };
  }, [vendorsWithStats]);

  const filteredVendors = vendorsWithStats?.filter(vendor => {
    const matchesSearch = 
      vendor.vendor_name.toLowerCase().includes(search.toLowerCase()) ||
      vendor.representative_name?.toLowerCase().includes(search.toLowerCase()) ||
      vendor.city?.toLowerCase().includes(search.toLowerCase());
    const matchesType = typeFilter === 'all' || vendor.vendor_type === typeFilter;
    const matchesStatus = statusFilter === 'all' || vendor.status === statusFilter;
    return matchesSearch && matchesType && matchesStatus;
  });

  const handleOpenDialog = (vendor?: Vendor) => {
    if (vendor) {
      setEditingVendor(vendor);
      setFormData({
        vendor_name: vendor.vendor_name,
        vendor_type: vendor.vendor_type,
        facilities_provided: vendor.facilities_provided || '',
        address: vendor.address || '',
        city: vendor.city || '',
        state: vendor.state || '',
        country: vendor.country || 'UAE',
        representative_name: vendor.representative_name || '',
        representative_phone: vendor.representative_phone || '',
        representative_email: vendor.representative_email || '',
        notes: vendor.notes || '',
        status: vendor.status,
        region: vendor.region,
      });
    } else {
      setEditingVendor(null);
      setFormData({ ...initialFormData, region: userRegion || 'UAE' });
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingVendor) {
      await updateVendor.mutateAsync({ id: editingVendor.id, ...formData });
    } else {
      await createVendor.mutateAsync(formData);
    }
    setIsDialogOpen(false);
    setEditingVendor(null);
    setFormData(initialFormData);
  };

  const VendorCard = ({ vendor }: { vendor: VendorWithStats }) => (
    <Card className="p-4">
      <div className="flex justify-between items-start mb-2">
        <div>
          <p className="font-medium">{vendor.vendor_name}</p>
          <p className="text-sm text-muted-foreground">{VENDOR_TYPE_LABELS[vendor.vendor_type]}</p>
        </div>
        <Badge variant={vendor.status === 'active' ? 'default' : 'secondary'}>
          {vendor.status}
        </Badge>
      </div>
      {vendor.representative_name && (
        <p className="text-sm text-muted-foreground">{vendor.representative_name}</p>
      )}
      {vendor.city && (
        <p className="text-sm text-muted-foreground flex items-center gap-1">
          <MapPin className="h-3 w-3" /> {vendor.city}, {vendor.country}
        </p>
      )}
      {(vendor.events_count || 0) > 0 && (
        <div className="flex items-center gap-1 text-sm text-primary mt-1">
          <Calendar className="h-3 w-3" />
          {vendor.events_count} event{vendor.events_count !== 1 ? 's' : ''}
        </div>
      )}
      <div className="flex gap-2 justify-end border-t pt-3 mt-3">
        <Drawer>
          <DrawerTrigger asChild>
            <Button variant="ghost" size="sm"><Eye className="h-4 w-4" /></Button>
          </DrawerTrigger>
          <VendorDetailDrawer vendor={vendor} />
        </Drawer>
        {canManage && (
          <>
            <Button variant="ghost" size="sm" onClick={() => handleOpenDialog(vendor)}>
              <Edit className="h-4 w-4" />
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="sm">
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Vendor</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete "{vendor.vendor_name}"? This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={() => deleteVendor.mutate(vendor.id)}>
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
    <div className="space-y-4 sm:space-y-6">
      {/* Dashboard Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Store className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-xs text-muted-foreground">Total Vendors</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-500/10 rounded-lg">
                <Activity className="h-5 w-5 text-emerald-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.active}</p>
                <p className="text-xs text-muted-foreground">Active Vendors</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <Calendar className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.withEvents}</p>
                <p className="text-xs text-muted-foreground">With Events</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-500/10 rounded-lg">
                <TrendingUp className="h-5 w-5 text-amber-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.totalEvents}</p>
                <p className="text-xs text-muted-foreground">Total Linked Events</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Vendors</h1>
          <p className="text-sm text-muted-foreground">Manage vendor information</p>
        </div>
        {canManage && (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" onClick={() => handleOpenDialog()}>
                <Plus className="h-4 w-4 sm:mr-2" /> <span className="hidden sm:inline">Add Vendor</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingVendor ? 'Edit Vendor' : 'Add New Vendor'}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Vendor Name *</Label>
                    <Input
                      value={formData.vendor_name}
                      onChange={(e) => setFormData({ ...formData, vendor_name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Vendor Type *</Label>
                    <Select
                      value={formData.vendor_type}
                      onValueChange={(v) => setFormData({ ...formData, vendor_type: v as VendorType })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(VENDOR_TYPE_LABELS).map(([value, label]) => (
                          <SelectItem key={value} value={value}>{label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label>Facilities Provided</Label>
                    <Input
                      value={formData.facilities_provided}
                      onChange={(e) => setFormData({ ...formData, facilities_provided: e.target.value })}
                      placeholder="e.g., Tables, Chairs, Linens"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Representative Name</Label>
                    <Input
                      value={formData.representative_name}
                      onChange={(e) => setFormData({ ...formData, representative_name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Representative Phone</Label>
                    <Input
                      value={formData.representative_phone}
                      onChange={(e) => setFormData({ ...formData, representative_phone: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label>Representative Email</Label>
                    <Input
                      type="email"
                      value={formData.representative_email}
                      onChange={(e) => setFormData({ ...formData, representative_email: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label>Address</Label>
                    <Input
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>City</Label>
                    <Input
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>State</Label>
                    <Input
                      value={formData.state}
                      onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Country</Label>
                    <Input
                      value={formData.country}
                      onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Status</Label>
                    <Select
                      value={formData.status}
                      onValueChange={(v) => setFormData({ ...formData, status: v as VendorStatus })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {isSuperAdmin && (
                    <div className="space-y-2">
                      <Label>Region</Label>
                      <Select
                        value={formData.region}
                        onValueChange={(v) => setFormData({ ...formData, region: v as Region })}
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
                  <div className="space-y-2 sm:col-span-2">
                    <Label>Notes</Label>
                    <Textarea
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      rows={3}
                    />
                  </div>
                </div>
                <div className="flex flex-col-reverse sm:flex-row justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createVendor.isPending || updateVendor.isPending}>
                    {editingVendor ? 'Update Vendor' : 'Create Vendor'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search vendors..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-[130px]">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {Object.entries(VENDOR_TYPE_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Loading...</div>
          ) : filteredVendors?.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Store className="mx-auto h-12 w-12 mb-4 opacity-50" />
              <p>No vendors found</p>
            </div>
          ) : (
            <>
              {/* Mobile card view */}
              <div className="space-y-4 sm:hidden">
                {filteredVendors?.map((vendor) => <VendorCard key={vendor.id} vendor={vendor} />)}
              </div>
              {/* Desktop table view */}
              <div className="hidden sm:block">
                <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Contact</TableHead>
                        <TableHead>Events</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="w-[120px]">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredVendors?.map((vendor) => (
                        <TableRow key={vendor.id}>
                          <TableCell>
                            <div className="font-medium">{vendor.vendor_name}</div>
                            {vendor.city && (
                              <div className="text-xs text-muted-foreground">{vendor.city}, {vendor.country}</div>
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{VENDOR_TYPE_LABELS[vendor.vendor_type]}</Badge>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              {vendor.representative_name && <p>{vendor.representative_name}</p>}
                              {vendor.representative_phone && (
                                <p className="text-muted-foreground">{vendor.representative_phone}</p>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            {(vendor.events_count || 0) > 0 ? (
                              <Badge variant="secondary" className="gap-1">
                                <Calendar className="h-3 w-3" />
                                {vendor.events_count}
                              </Badge>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge variant={vendor.status === 'active' ? 'default' : 'secondary'}>
                              {vendor.status}
                            </Badge>
                          </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Drawer>
                              <DrawerTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </DrawerTrigger>
                              <VendorDetailDrawer vendor={vendor} />
                            </Drawer>
                            {canManage && (
                              <>
                                <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(vendor)}>
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button variant="ghost" size="icon">
                                      <Trash2 className="h-4 w-4 text-destructive" />
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Delete Vendor</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        Are you sure you want to delete "{vendor.vendor_name}"? This action cannot be undone.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                                      <AlertDialogAction onClick={() => deleteVendor.mutate(vendor.id)}>
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
