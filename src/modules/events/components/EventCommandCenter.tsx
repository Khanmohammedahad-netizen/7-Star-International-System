import { useEvent } from '../hooks/useEvent'
import { EventHeader } from './EventHeader'
import { EventOverviewTab } from './EventOverviewTab'
import { EventTimeline } from '@/modules/timeline/components/EventTimeline'
import { EventVendorList } from '@/modules/vendors/components/EventVendorList'
import { EventFinanceTab } from '@/modules/finance/components/EventFinanceTab'
import { Card, CardContent } from '@/components/ui/card'
import { useState } from 'react'
import { Loader2 } from 'lucide-react'

// Tab definitions
type TabId = 'overview' | 'timeline' | 'vendors' | 'finance' | 'notes' | 'activity'

interface EventCommandCenterProps {
  eventId: string
}

export function EventCommandCenter({ eventId }: EventCommandCenterProps) {
  const { data: event, isLoading } = useEvent(eventId)
  const [activeTab, setActiveTab] = useState<TabId>('overview')

  if (isLoading) {
    return (
      <div className="h-[50vh] flex items-center justify-center text-muted-foreground">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    )
  }

  if (!event) {
    return (
      <Card className="mt-8 border-dashed bg-muted/50 p-12 text-center text-muted-foreground">
        Event not found or has been removed.
      </Card>
    )
  }

  const tabs: { id: TabId; label: string }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'timeline', label: 'Timeline' },
    { id: 'vendors',  label: 'Vendors' },
    { id: 'finance',  label: 'Finance' },
    { id: 'notes',    label: 'Notes' },
    { id: 'activity', label: 'Activity' },
  ]

  return (
    <div className="flex flex-col min-h-full">
      <EventHeader event={event} />

      {/* Tab Bar */}
      <div className="border-b border-border/50 sticky top-[88px] z-10 bg-background/95 backdrop-blur -mx-6 px-6 pt-2 mb-6 shadow-sm">
        <nav className="-mb-px flex space-x-6 overflow-x-auto scrollbar-hide">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`whitespace-nowrap pb-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? 'border-primary text-foreground'
                  : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="flex-1 pb-12">
        {activeTab === 'overview' && <EventOverviewTab event={event} />}
        {activeTab === 'timeline' && <EventTimeline eventId={eventId} />}
        {activeTab === 'vendors' && <EventVendorList eventId={eventId} />}
        {activeTab === 'finance' && <EventFinanceTab eventId={eventId} />}
        {activeTab === 'notes' && (
          <textarea 
            className="w-full h-96 p-4 rounded-xl resize-none bg-muted/20 border-border/50 focus:bg-background transition-colors focus:ring-1 ring-primary outline-none" 
            placeholder="Type shared event notes here. Supports markdown syntax..."
          />
        )}
        {activeTab === 'activity' && <div className="p-8 text-center text-muted">Audit Log Pending</div>}
      </div>
    </div>
  )
}
