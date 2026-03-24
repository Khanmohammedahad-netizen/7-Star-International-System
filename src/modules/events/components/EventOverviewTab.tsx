// @ts-nocheck
import { Event } from '../types'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { AlertCircle, CalendarClock, Users, CheckCircle2, AlertTriangle, Wallet } from 'lucide-react'
import { DateTime } from 'luxon'

export function EventOverviewTab({ event }: { event: Event }) {
  const daysAway = DateTime.fromISO(event.start_date).toRelative()

  return (
    <div className="grid gap-6 md:grid-cols-12 animate-in fade-in duration-500">
      
      {/* Left Column: Alerts & Info */}
      <div className="md:col-span-8 space-y-6">
        
        {/* Critical Alerts Row */}
        <div className="grid gap-4 sm:grid-cols-2">
          <Card className="border-l-4 border-l-red-500 bg-red-500/5 hover:bg-red-500/10 transition-colors">
            <CardContent className="p-4 flex gap-3 items-start">
              <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-sm">2 Vendors Unconfirmed</p>
                <p className="text-xs text-muted-foreground mt-1 cursor-pointer hover:underline">Review vendor list →</p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-l-4 border-l-yellow-500 bg-yellow-500/5 hover:bg-yellow-500/10 transition-colors">
            <CardContent className="p-4 flex gap-3 items-start">
              <AlertTriangle className="w-5 h-5 text-yellow-500 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-sm">Missing Final Contract</p>
                <p className="text-xs text-muted-foreground mt-1 cursor-pointer hover:underline">Upload Al Sham contract →</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* At-a-glance Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Time to Event', value: daysAway, icon: CalendarClock },
            { label: 'Vendors Confirmed', value: '4 / 6', icon: Users },
            { label: 'Tasks Complete', value: '18 / 24', icon: CheckCircle2 },
            { label: 'Budget Utilized', value: '62%', icon: Wallet }
          ].map((stat, i) => (
            <Card key={i} className="flex flex-col items-center justify-center p-4 text-center">
              <stat.icon className="w-5 h-5 text-muted-foreground mb-3" />
              <h4 className="text-xl font-bold font-mono tracking-tight">{stat.value}</h4>
              <p className="text-xs text-muted-foreground mt-1 font-medium">{stat.label}</p>
            </Card>
          ))}
        </div>

      </div>

      {/* Right Column: Mini Timeline & Activity */}
      <div className="md:col-span-4 space-y-6">
        
        <Card className="h-full border-border/50 bg-muted/20">
          <CardHeader className="pb-4">
            <CardTitle className="text-base flex items-center justify-between">
              Upcoming Schedule
              <span className="text-xs font-normal text-muted-foreground cursor-pointer hover:underline">View All</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative pl-6 space-y-4 before:absolute before:inset-0 before:ml-2 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border before:to-transparent">
              {['08:00', '10:00', '12:00'].map((time, i) => (
                <div key={i} className="relative flex items-center justify-between mt-0 pt-0">
                  <div className="absolute -left-6 w-3 h-3 bg-background rounded-full border-2 border-primary z-10" />
                  <div>
                    <span className="text-xs font-mono text-muted-foreground">{time}</span>
                    <p className="text-sm font-medium leading-tight mt-0.5">Setup Task {i+1}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

      </div>
    
    </div>
  )
}

