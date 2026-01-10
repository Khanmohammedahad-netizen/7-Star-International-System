import { useState, useMemo, useCallback } from 'react';
import { Plus, Search, Calendar as CalendarIcon, List, ChevronLeft, ChevronRight, Edit, Trash2, CheckCircle, XCircle, Clock, Store, Filter } from 'lucide-react';
import { useEvents, useCreateEvent, useUpdateEvent, useDeleteEvent, useApproveEvent, Event } from '@/hooks/useEvents';
import { useClients } from '@/hooks/useClients';
import { useVendors, useAllEventVendors, useLinkVendorToEvent, useUnlinkVendorFromEvent } from '@/hooks/useVendors';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, parseISO, startOfWeek, endOfWeek } from 'date-fns';
import { EventFormFields } from '@/components/events/EventFormFields';
import { EventControlCenter } from '@/components/events/EventControlCenter';
import { VENDOR_TYPE_LABELS } from '@/types/database';

const statusColors: Record<string, string> = {
  pending: 'bg-amber-500',
  approved: 'bg-emerald-500',
  rejected: 'bg-red-500',
  completed: 'bg-blue-500',
};

export default function Events() {
  const { data: events, isLoading } = useEvents();
  const { data: clients } = useClients();
  const { data: vendors } = useVendors();
  const { data: allEventVendors } = useAllEventVendors();
  const createEvent = useCreateEvent();
  const updateEvent = useUpdateEvent();
  const deleteEvent = useDeleteEvent();
  const approveEvent = useApproveEvent();
  const linkVendor = useLinkVendorToEvent();
  const unlinkVendor = useUnlinkVendorFromEvent();
  const { userRole, isSuperAdmin, hasPermission } = useAuth();

  // Helper to get vendors for an event
  const getEventVendors = useCallback((eventId: string) => {
    return allEventVendors?.filter(ev => ev.event_id === eventId) || [];
  }, [allEventVendors]);
  
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar'); // Calendar first!
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isControlCenterOpen, setIsControlCenterOpen] = useState(false);
  const [vendorFilter, setVendorFilter] = useState<string>('all');
  
  // Form state - kept at this level but with stable update function
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    client_id: '',
    event_date: '',
    event_end_date: '',
    location: '',
    staff_count: 0,
    region: userRole?.region || 'UAE',
  });
  const [selectedVendorIds, setSelectedVendorIds] = useState<string[]>([]);
  const [editingVendorIds, setEditingVendorIds] = useState<string[]>([]);

  // Filter events by search and vendor
  const filteredEvents = useMemo(() => {
    return events?.filter(event => {
      const matchesSearch = 
        event.title.toLowerCase().includes(search.toLowerCase()) ||
        event.clients?.name.toLowerCase().includes(search.toLowerCase());
      
      const matchesVendor = vendorFilter === 'all' || 
        getEventVendors(event.id).some(ev => ev.vendor_id === vendorFilter);
      
      return matchesSearch && matchesVendor;
    });
  }, [events, search, vendorFilter, getEventVendors]);

  const resetForm = useCallback(() => {
    setFormData({
      title: '',
      description: '',
      client_id: '',
      event_date: '',
      event_end_date: '',
      location: '',
      staff_count: 0,
      region: userRole?.region || 'UAE',
    });
    setEditingEvent(null);
    setSelectedVendorIds([]);
    setEditingVendorIds([]);
  }, [userRole?.region]);

  // Stable field change handler to prevent re-renders
  const handleFieldChange = useCallback((field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      ...formData,
      event_end_date: formData.event_end_date || null,
      staff_count: Number(formData.staff_count),
    };
    
    if (editingEvent) {
      await updateEvent.mutateAsync({ id: editingEvent.id, ...data });
      
      // Handle vendor linking for edit
      const currentVendorIds = editingVendorIds;
      const newVendorIds = selectedVendorIds;
      
      // Unlink vendors that were removed
      for (const vendorId of currentVendorIds) {
        if (!newVendorIds.includes(vendorId)) {
          await unlinkVendor.mutateAsync({ eventId: editingEvent.id, vendorId });
        }
      }
      
      // Link new vendors
      for (const vendorId of newVendorIds) {
        if (!currentVendorIds.includes(vendorId)) {
          await linkVendor.mutateAsync({ eventId: editingEvent.id, vendorId });
        }
      }
      
      setEditingEvent(null);
    } else {
      const result = await createEvent.mutateAsync(data as any);
      
      // Link vendors to new event
      if (result && selectedVendorIds.length > 0) {
        for (const vendorId of selectedVendorIds) {
          await linkVendor.mutateAsync({ eventId: result.id, vendorId });
        }
      }
      
      setIsCreateOpen(false);
    }
    resetForm();
  };

  const handleEdit = useCallback(async (event: Event) => {
    setEditingEvent(event);
    setFormData({
      title: event.title,
      description: event.description || '',
      client_id: event.client_id,
      event_date: event.event_date,
      event_end_date: event.event_end_date || '',
      location: event.location || '',
      staff_count: event.staff_count || 0,
      region: event.region,
    });
    
    // Fetch existing vendors for this event
    const { data: eventVendors } = await import('@/integrations/supabase/client').then(m => 
      m.supabase.from('event_vendors').select('vendor_id').eq('event_id', event.id)
    );
    const vendorIds = eventVendors?.map((ev: any) => ev.vendor_id) || [];
    setSelectedVendorIds(vendorIds);
    setEditingVendorIds(vendorIds);
    
    setIsControlCenterOpen(false);
  }, []);

  const handleEventClick = useCallback((event: Event) => {
    setSelectedEvent(event);
    setIsControlCenterOpen(true);
  }, []);

  const canManage = hasPermission('canManageEvents');

  // Calendar logic with proper padding
  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const calendarStart = startOfWeek(monthStart);
    const calendarEnd = endOfWeek(monthEnd);
    return eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  }, [currentMonth]);

  const getEventsForDay = useCallback((day: Date) => {
    return events?.filter(event => {
      const eventDate = parseISO(event.event_date);
      return isSameDay(eventDate, day);
    }) || [];
  }, [events]);

  // Mobile event card for list view
  const EventCard = ({ event }: { event: Event }) => {
    const eventVendors = getEventVendors(event.id);
    return (
      <Card className="p-4 cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => handleEventClick(event)}>
        <div className="flex justify-between items-start mb-2">
          <div>
            <p className="font-medium">{event.title}</p>
            <p className="text-sm text-muted-foreground">{event.clients?.name}</p>
          </div>
          <Badge className={`${statusColors[event.status]} text-white`}>
            {event.status}
          </Badge>
        </div>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <p className="text-muted-foreground">Date</p>
            <p>{format(parseISO(event.event_date), 'MMM d, yyyy')}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Location</p>
            <p>{event.location || '-'}</p>
          </div>
        </div>
        {eventVendors.length > 0 && (
          <div className="mt-2 pt-2 border-t">
            <div className="flex flex-wrap gap-1">
              {eventVendors.slice(0, 3).map((ev: any) => (
                <Badge key={ev.vendor_id} variant="outline" className="text-xs">
                  <Store className="h-3 w-3 mr-1" />
                  {ev.vendor?.vendor_name}
                </Badge>
              ))}
              {eventVendors.length > 3 && (
                <Badge variant="outline" className="text-xs">+{eventVendors.length - 3} more</Badge>
              )}
            </div>
          </div>
        )}
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Events Calendar</h1>
          <p className="text-muted-foreground">Manage and track all events</p>
        </div>
        <div className="flex gap-2">
          <div className="flex border rounded-lg">
            <Button
              variant={viewMode === 'calendar' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('calendar')}
              className="rounded-r-none"
            >
              <CalendarIcon className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
              className="rounded-l-none"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
          {canManage && (
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
              <DialogTrigger asChild>
                <Button onClick={resetForm} size="sm" className="sm:size-default">
                  <Plus className="h-4 w-4 sm:mr-2" />
                  <span className="hidden sm:inline">Add Event</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Create New Event</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <EventFormFields
                    formData={formData}
                    onFieldChange={handleFieldChange}
                    clients={clients}
                    isSuperAdmin={isSuperAdmin}
                    vendors={vendors}
                    selectedVendorIds={selectedVendorIds}
                    onVendorSelectionChange={setSelectedVendorIds}
                  />
                  <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 pt-4 border-t">
                    <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={createEvent.isPending}>
                      {createEvent.isPending ? 'Creating...' : 'Create Event'}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      {/* Calendar View - Primary */}
      {viewMode === 'calendar' && (
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <Button variant="outline" size="icon" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <CardTitle>{format(currentMonth, 'MMMM yyyy')}</CardTitle>
              <Button variant="outline" size="icon" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-2 sm:p-6">
            {/* Day headers */}
            <div className="grid grid-cols-7 gap-1 mb-1">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="text-center font-medium text-muted-foreground py-2 text-xs sm:text-sm">
                  <span className="hidden sm:inline">{day}</span>
                  <span className="sm:hidden">{day.charAt(0)}</span>
                </div>
              ))}
            </div>
            {/* Calendar grid */}
            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map((day, i) => {
                const dayEvents = getEventsForDay(day);
                const isToday = isSameDay(day, new Date());
                const isCurrentMonth = isSameMonth(day, currentMonth);
                return (
                  <div
                    key={i}
                    className={`min-h-[60px] sm:min-h-[100px] border rounded-lg p-1 transition-colors ${
                      isToday ? 'bg-primary/10 border-primary' : ''
                    } ${!isCurrentMonth ? 'opacity-40 bg-muted/30' : 'hover:bg-muted/50'}`}
                  >
                    <div className={`text-xs sm:text-sm font-medium ${isToday ? 'text-primary' : ''}`}>
                      {format(day, 'd')}
                    </div>
                    <div className="space-y-0.5 mt-0.5">
                      {dayEvents.slice(0, 2).map(event => {
                        const eventVendors = getEventVendors(event.id);
                        return (
                          <div
                            key={event.id}
                            onClick={() => handleEventClick(event)}
                            className={`text-[10px] sm:text-xs p-0.5 sm:p-1 rounded text-white cursor-pointer hover:opacity-80 transition-opacity ${statusColors[event.status]}`}
                            title={`${event.title} - ${event.clients?.name}${eventVendors.length > 0 ? ` • ${eventVendors.map((ev: any) => ev.vendor?.vendor_name).join(', ')}` : ''}`}
                          >
                            <span className="truncate block">{event.title}</span>
                            {eventVendors.length > 0 && (
                              <span className="hidden sm:flex items-center gap-0.5 text-[9px] opacity-90 mt-0.5">
                                <Store className="h-2.5 w-2.5" />
                                {eventVendors.length}
                              </span>
                            )}
                          </div>
                        );
                      })}
                      {dayEvents.length > 2 && (
                        <div className="text-[10px] sm:text-xs text-muted-foreground">
                          +{dayEvents.length - 2} more
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* List View - Secondary */}
      {viewMode === 'list' && (
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search events..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={vendorFilter} onValueChange={setVendorFilter}>
                <SelectTrigger className="w-[180px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filter by vendor" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Vendors</SelectItem>
                  {vendors?.map((vendor) => (
                    <SelectItem key={vendor.id} value={vendor.id}>
                      {vendor.vendor_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">Loading...</div>
            ) : filteredEvents?.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <CalendarIcon className="mx-auto h-12 w-12 mb-4 opacity-50" />
                <p>No events found</p>
              </div>
            ) : (
              <>
                {/* Mobile card view */}
                <div className="space-y-4 sm:hidden">
                  {filteredEvents?.map((event) => (
                    <EventCard key={event.id} event={event} />
                  ))}
                </div>

                {/* Desktop table view */}
                <div className="hidden sm:block overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Event</TableHead>
                        <TableHead>Client</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Vendors</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Region</TableHead>
                        {canManage && <TableHead className="w-[150px]">Actions</TableHead>}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredEvents?.map((event) => {
                        const eventVendors = getEventVendors(event.id);
                        return (
                          <TableRow 
                            key={event.id} 
                            className="cursor-pointer hover:bg-muted/50"
                            onClick={() => handleEventClick(event)}
                          >
                            <TableCell>
                              <div className="font-medium">{event.title}</div>
                              {event.location && (
                                <div className="text-xs text-muted-foreground">{event.location}</div>
                              )}
                            </TableCell>
                            <TableCell>{event.clients?.name}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                                {format(parseISO(event.event_date), 'MMM d, yyyy')}
                              </div>
                            </TableCell>
                            <TableCell>
                              {eventVendors.length === 0 ? (
                                <span className="text-muted-foreground">-</span>
                              ) : (
                                <div className="flex flex-wrap gap-1">
                                  {eventVendors.slice(0, 2).map((ev: any) => (
                                    <Badge key={ev.vendor_id} variant="outline" className="text-xs">
                                      <Store className="h-3 w-3 mr-1" />
                                      {ev.vendor?.vendor_name}
                                    </Badge>
                                  ))}
                                  {eventVendors.length > 2 && (
                                    <Badge variant="secondary" className="text-xs">
                                      +{eventVendors.length - 2}
                                    </Badge>
                                  )}
                                </div>
                              )}
                            </TableCell>
                            <TableCell>
                              <Badge className={`${statusColors[event.status]} text-white`}>
                                {event.status}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">{event.region}</Badge>
                            </TableCell>
                            {canManage && (
                              <TableCell onClick={(e) => e.stopPropagation()}>
                              <div className="flex gap-1">
                                {event.status === 'pending' && (
                                  <>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => approveEvent.mutate({ id: event.id, status: 'approved' })}
                                      title="Approve"
                                    >
                                      <CheckCircle className="h-4 w-4 text-emerald-500" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => approveEvent.mutate({ id: event.id, status: 'rejected' })}
                                      title="Reject"
                                    >
                                      <XCircle className="h-4 w-4 text-red-500" />
                                    </Button>
                                  </>
                                )}
                                {event.status === 'approved' && (
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => approveEvent.mutate({ id: event.id, status: 'completed' })}
                                    title="Mark Completed"
                                  >
                                    <Clock className="h-4 w-4 text-blue-500" />
                                  </Button>
                                )}
                                <Button variant="ghost" size="icon" onClick={() => handleEdit(event)}>
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
                                      <AlertDialogTitle>Delete Event</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        Are you sure you want to delete "{event.title}"? This action cannot be undone.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                                      <AlertDialogAction
                                        onClick={() => deleteEvent.mutate(event.id)}
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
                        )
                      })}
                    </TableBody>
                  </Table>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}

      {/* Edit Event Dialog */}
      <Dialog open={!!editingEvent} onOpenChange={(open) => !open && setEditingEvent(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Event</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <EventFormFields
              formData={formData}
              onFieldChange={handleFieldChange}
              clients={clients}
              isSuperAdmin={isSuperAdmin}
              vendors={vendors}
              selectedVendorIds={selectedVendorIds}
              onVendorSelectionChange={setSelectedVendorIds}
            />
            <div className="flex flex-col-reverse sm:flex-row justify-between gap-2 pt-4 border-t">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button type="button" variant="destructive" className="gap-2">
                    <Trash2 className="h-4 w-4" />
                    Delete Event
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Event</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete "{editingEvent?.title}"? This action cannot be undone and will remove all associated materials and vendor links.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => {
                        if (editingEvent) {
                          deleteEvent.mutate(editingEvent.id);
                          setEditingEvent(null);
                        }
                      }}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
              <div className="flex flex-col-reverse sm:flex-row gap-2">
                <Button type="button" variant="outline" onClick={() => setEditingEvent(null)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={updateEvent.isPending}>
                  {updateEvent.isPending ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Event Control Center (Side Panel) */}
      <EventControlCenter
        event={selectedEvent}
        isOpen={isControlCenterOpen}
        onClose={() => {
          setIsControlCenterOpen(false);
          setSelectedEvent(null);
        }}
        onEdit={handleEdit}
        canManage={canManage}
      />
    </div>
  );
}
