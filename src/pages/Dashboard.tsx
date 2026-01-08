import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { CalendarCheck, TrendingUp, Target, Users } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

export default function Dashboard() {
  const { userRole, isSuperAdmin, profile } = useAuth();

  // Fetch events statistics
  const { data: eventsData } = useQuery({
    queryKey: ['dashboard-events', userRole?.region],
    queryFn: async () => {
      let query = supabase.from('events').select('*');
      
      if (!isSuperAdmin && userRole?.region) {
        query = query.eq('region', userRole.region);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
    enabled: !!userRole,
  });

  // Fetch clients count
  const { data: clientsData } = useQuery({
    queryKey: ['dashboard-clients', userRole?.region],
    queryFn: async () => {
      let query = supabase.from('clients').select('id');
      
      if (!isSuperAdmin && userRole?.region) {
        query = query.eq('region', userRole.region);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
    enabled: !!userRole,
  });

  // Calculate statistics
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const eventsThisMonth = eventsData?.filter(event => {
    const eventDate = new Date(event.event_date);
    return eventDate.getMonth() === currentMonth && 
           eventDate.getFullYear() === currentYear &&
           event.status === 'completed';
  }).length || 0;

  const eventsThisYear = eventsData?.filter(event => {
    const eventDate = new Date(event.event_date);
    return eventDate.getFullYear() === currentYear && event.status === 'completed';
  }).length || 0;

  const pendingEvents = eventsData?.filter(e => e.status === 'pending').length || 0;
  const approvedEvents = eventsData?.filter(e => e.status === 'approved').length || 0;
  const completedEvents = eventsData?.filter(e => e.status === 'completed').length || 0;

  // Target achievement (example: 50 events per year target)
  const yearlyTarget = 50;
  const achievementPercentage = Math.min((eventsThisYear / yearlyTarget) * 100, 100);

  // Monthly chart data
  const monthlyData = Array.from({ length: 12 }, (_, i) => {
    const monthEvents = eventsData?.filter(event => {
      const eventDate = new Date(event.event_date);
      return eventDate.getMonth() === i && 
             eventDate.getFullYear() === currentYear &&
             event.status === 'completed';
    }).length || 0;
    
    return {
      name: new Date(currentYear, i).toLocaleString('default', { month: 'short' }),
      events: monthEvents,
    };
  });

  // Status distribution for pie chart
  const statusData = [
    { name: 'Pending', value: pendingEvents, color: 'hsl(var(--chart-3))' },
    { name: 'Approved', value: approvedEvents, color: 'hsl(var(--chart-2))' },
    { name: 'Completed', value: completedEvents, color: 'hsl(var(--chart-1))' },
  ].filter(d => d.value > 0);

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">
          Welcome back, {profile?.full_name?.split(' ')[0]}
        </h1>
        <p className="text-muted-foreground">
          Here's an overview of your operations performance
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Events This Month</CardTitle>
            <CalendarCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{eventsThisMonth}</div>
            <p className="text-xs text-muted-foreground">
              Successfully completed events
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Events This Year</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{eventsThisYear}</div>
            <p className="text-xs text-muted-foreground">
              Year-to-date completions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Clients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{clientsData?.length || 0}</div>
            <p className="text-xs text-muted-foreground">
              Total registered clients
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingEvents}</div>
            <p className="text-xs text-muted-foreground">
              Events awaiting approval
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Target Achievement */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Annual Target Achievement</CardTitle>
          <CardDescription>
            Track your progress towards the yearly event target
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">
              {eventsThisYear} of {yearlyTarget} events
            </span>
            <span className="text-sm font-medium text-primary">
              {achievementPercentage.toFixed(1)}%
            </span>
          </div>
          <Progress value={achievementPercentage} className="h-3" />
          <p className="text-xs text-muted-foreground">
            {yearlyTarget - eventsThisYear > 0 
              ? `${yearlyTarget - eventsThisYear} more events needed to reach your annual target`
              : 'Congratulations! You have exceeded your annual target!'
            }
          </p>
        </CardContent>
      </Card>

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Monthly Events Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Monthly Event Completions</CardTitle>
            <CardDescription>
              Events completed per month in {currentYear}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis 
                    dataKey="name" 
                    className="text-xs fill-muted-foreground"
                    tick={{ fill: 'hsl(var(--muted-foreground))' }}
                  />
                  <YAxis 
                    className="text-xs fill-muted-foreground"
                    tick={{ fill: 'hsl(var(--muted-foreground))' }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: 'var(--radius)'
                    }}
                  />
                  <Bar 
                    dataKey="events" 
                    fill="hsl(var(--primary))" 
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Event Status Distribution</CardTitle>
            <CardDescription>
              Current breakdown of event statuses
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              {statusData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                      label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    >
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: 'var(--radius)'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground">
                  No events data available
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Executive Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Executive Summary</CardTitle>
          <CardDescription>
            Key performance indicators and insights
          </CardDescription>
        </CardHeader>
        <CardContent className="prose prose-sm max-w-none dark:prose-invert">
          <p>
            The operations team has demonstrated {eventsThisYear > 0 ? 'consistent' : 'initial'} performance 
            with <strong>{eventsThisYear} events completed</strong> this year. 
            {eventsThisMonth > 0 && (
              <> This month alone, <strong>{eventsThisMonth} events</strong> were successfully executed, 
              reflecting the team's commitment to client satisfaction.</>
            )}
          </p>
          {pendingEvents > 0 && (
            <p>
              Currently, <strong>{pendingEvents} events</strong> are pending approval. 
              Prompt review and approval of these events will ensure smooth operational workflow 
              and timely client deliveries.
            </p>
          )}
          <p>
            With <strong>{clientsData?.length || 0} active clients</strong> in the system, 
            the business maintains a healthy client base ready for future engagements.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
