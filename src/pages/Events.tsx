import { useState, useMemo } from 'react';
import { Plus, Search, Calendar as CalendarIcon, List, ChevronLeft, ChevronRight, Edit, Trash2, CheckCircle, XCircle, Clock } from 'lucide-react';
import { useEvents, useCreateEvent, useUpdateEvent, useDeleteEvent, useApproveEvent, Event } from '@/hooks/useEvents';
import { useClients } from '@/hooks/useClients';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, parseISO } from 'date-fns';

const statusColors: Record<string, string> = {
  pending: 'bg-amber-500',
  approved: 'bg-emerald-500',
  rejected: 'bg-red-500',
  completed: 'bg-blue-500',
};

export default function Events() {
  const { data: events, isLoading } = useEvents();
  const { data: clients } = useClients();
  const createEvent = useCreateEvent();
  const updateEvent = useUpdateEvent();
  const deleteEvent = useDeleteEvent();
  const approveEvent = useApproveEvent();
  const { userRole, isSuperAdmin, hasPermission } = useAuth();
  
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('list');
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
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

  const filteredEvents = events?.filter(event =>
    event.title.toLowerCase().includes(search.toLowerCase()) ||
    event.clients?.name.toLowerCase().includes(search.toLowerCase())
  );

  const resetForm = () => {
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
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      ...formData,
      event_end_date: formData.event_end_date || null,
      staff_count: Number(formData.staff_count),
    };
    if (editingEvent) {
      await updateEvent.mutateAsync({ id: editingEvent.id, ...data });
      setEditingEvent(null);
    } else {
      await createEvent.mutateAsync(data as any);
      setIsCreateOpen(false);
    }
    resetForm();
  };

  const handleEdit = (event: Event) => {
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
  };

  const canManage = hasPermission('canManageEvents');

  // Calendar logic
  const calendarDays = useMemo(() => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    return eachDayOfInterval({ start, end });
  }, [currentMonth]);

  const getEventsForDay = (day: Date) => {
    return events?.filter(event => {
      const eventDate = parseISO(event.event_date);
      return isSameDay(eventDate, day);
    }) || [];
  };

  const FormFields = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Event Title *</Label>
          <Input
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
          />
        </div>
        <div className="space-y-2">
          <Label>Client *</Label>
          <Select
            value={formData.client_id}
            onValueChange={(value) => setFormData({ ...formData, client_id: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select client" />
            </SelectTrigger>
            <SelectContent>
              {clients?.map(client => (
                <SelectItem key={client.id} value={client.id}>{client.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Event Date *</Label>
          <Input
            type="date"
            value={formData.event_date}
            onChange={(e) => setFormData({ ...formData, event_date: e.target.value })}
            required
          />
        </div>
        <div className="space-y-2">
          <Label>End Date</Label>
          <Input
            type="date"
            value={formData.event_end_date}
            onChange={(e) => setFormData({ ...formData, event_end_date: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label>Location</Label>
          <Input
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label>Staff Count</Label>
          <Input
            type="number"
            value={formData.staff_count}
            onChange={(e) => setFormData({ ...formData, staff_count: parseInt(e.target.value) || 0 })}
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
        <Label>Description</Label>
        <Textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        />
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Events Calendar</h1>
          <p className="text-muted-foreground">Manage and track all events</p>
        </div>
        <div className="flex gap-2">
          <div className="flex border rounded-lg">
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
              className="rounded-r-none"
            >
              <List className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'calendar' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('calendar')}
              className="rounded-l-none"
            >
              <CalendarIcon className="h-4 w-4" />
            </Button>
          </div>
          {canManage && (
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
              <DialogTrigger asChild>
                <Button onClick={resetForm}>
                  <Plus className="mr-2 h-4 w-4" /> Add Event
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Create New Event</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <FormFields />
                  <div className="flex justify-end gap-2">
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

      {viewMode === 'calendar' ? (
        <Card>
          <CardHeader>
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
          <CardContent>
            <div className="grid grid-cols-7 gap-1">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="text-center font-medium text-muted-foreground py-2">
                  {day}
                </div>
              ))}
              {calendarDays.map((day, i) => {
                const dayEvents = getEventsForDay(day);
                const isToday = isSameDay(day, new Date());
                return (
                  <div
                    key={i}
                    className={`min-h-[100px] border rounded-lg p-1 ${
                      isToday ? 'bg-primary/10 border-primary' : ''
                    } ${!isSameMonth(day, currentMonth) ? 'opacity-50' : ''}`}
                  >
                    <div className={`text-sm font-medium ${isToday ? 'text-primary' : ''}`}>
                      {format(day, 'd')}
                    </div>
                    <div className="space-y-1 mt-1">
                      {dayEvents.slice(0, 2).map(event => (
                        <div
                          key={event.id}
                          className={`text-xs p-1 rounded truncate text-white ${statusColors[event.status]}`}
                          title={`${event.title} - ${event.clients?.name}`}
                        >
                          {event.title}
                        </div>
                      ))}
                      {dayEvents.length > 2 && (
                        <div className="text-xs text-muted-foreground">+{dayEvents.length - 2} more</div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-4">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search events..."
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
            ) : filteredEvents?.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <CalendarIcon className="mx-auto h-12 w-12 mb-4 opacity-50" />
                <p>No events found</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Event</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Region</TableHead>
                    {canManage && <TableHead className="w-[150px]">Actions</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEvents?.map((event) => (
                    <TableRow key={event.id}>
                      <TableCell>
                        <div className="font-medium">{event.title}</div>
                        {event.description && (
                          <div className="text-xs text-muted-foreground line-clamp-1">{event.description}</div>
                        )}
                      </TableCell>
                      <TableCell>{event.clients?.name}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                          {format(parseISO(event.event_date), 'MMM d, yyyy')}
                        </div>
                      </TableCell>
                      <TableCell>{event.location || '-'}</TableCell>
                      <TableCell>
                        <Badge className={`${statusColors[event.status]} text-white`}>
                          {event.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{event.region}</Badge>
                      </TableCell>
                      {canManage && (
                        <TableCell>
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
                            <Dialog open={editingEvent?.id === event.id} onOpenChange={(open) => !open && setEditingEvent(null)}>
                              <DialogTrigger asChild>
                                <Button variant="ghost" size="icon" onClick={() => handleEdit(event)}>
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-2xl">
                                <DialogHeader>
                                  <DialogTitle>Edit Event</DialogTitle>
                                </DialogHeader>
                                <form onSubmit={handleSubmit} className="space-y-4">
                                  <FormFields />
                                  <div className="flex justify-end gap-2">
                                    <Button type="button" variant="outline" onClick={() => setEditingEvent(null)}>
                                      Cancel
                                    </Button>
                                    <Button type="submit" disabled={updateEvent.isPending}>
                                      {updateEvent.isPending ? 'Saving...' : 'Save Changes'}
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
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
