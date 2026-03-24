import { faker } from '@faker-js/faker'
import { TimelineItem } from '@/modules/events/types'

const TIMELINE_CATEGORIES = ['setup','arrival','ceremony','meal','entertainment','speech','breakdown','general']

export function generateMockTimeline(eventId: string): TimelineItem[] {
  const items = [
    { time: '08:00', title: 'Venue access — setup begins', category: 'setup', duration_mins: 60 },
    { time: '09:00', title: 'Catering team arrival', category: 'vendor', duration_mins: 30 },
    { time: '10:00', title: 'AV and lighting setup', category: 'setup', duration_mins: 120 },
    { time: '12:00', title: 'Decoration team arrival', category: 'vendor', duration_mins: 180 },
    { time: '15:00', title: 'Final venue walkthrough', category: 'general', duration_mins: 30 },
    { time: '16:00', title: 'Guest registration opens', category: 'arrival', duration_mins: 60 },
    { time: '17:00', title: 'Welcome reception drinks', category: 'meal', duration_mins: 60 },
    { time: '18:00', title: 'Guests seated', category: 'arrival', duration_mins: 15 },
    { time: '18:15', title: 'Opening speech — CEO', category: 'speech', duration_mins: 10 },
    { time: '18:30', title: 'Dinner service begins', category: 'meal', duration_mins: 90 },
    { time: '20:00', title: 'Entertainment program', category: 'entertainment', duration_mins: 60 },
    { time: '21:00', title: 'Dessert and networking', category: 'meal', duration_mins: 60 },
    { time: '22:00', title: 'Event concludes — guest departure', category: 'general', duration_mins: 30 },
    { time: '22:30', title: 'Breakdown and cleanup', category: 'breakdown', duration_mins: 90 },
  ]
  return items.map((item, i) => ({
    id: faker.string.uuid(),
    org_id: 'mock-org',
    event_id: eventId,
    ...item,
    category: item.category as TimelineItem['category'],
    description: null,
    assigned_to: [],
    vendor_id: null,
    status: 'pending' as const,
    completed_at: null,
    completed_by: null,
    skip_reason: null,
    position: i,
    is_critical: i === 4 || i === 7,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }))
}

export const initialTimelineItems = generateMockTimeline('mock-event-1')
