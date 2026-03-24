import { faker } from '@faker-js/faker'

const EVENT_TYPES = ['corporate','wedding','gala','conference','product_launch','private'] as const
const EVENT_STATUSES = ['planning','confirmed','in_progress','completed'] as const
const VENUES = [
  'Atlantis The Palm', 'Burj Al Arab', 'DIFC Conference Centre',
  'Madinat Jumeirah', 'Dubai World Trade Centre', 'Emirates Palace',
  'Address Downtown', 'Armani Hotel', 'Jumeirah Beach Hotel'
]

export const mockEvents = Array.from({ length: 20 }, (_, i) => {
  const startDate = faker.date.between({
    from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    to:   new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)
  })
  const endDate = new Date(startDate)
  endDate.setHours(endDate.getHours() + faker.number.int({ min: 4, max: 12 }))

  return {
    id:              faker.string.uuid(),
    org_id:          'mock-org',
    name:            `${faker.company.name()} ${faker.helpers.arrayElement(['Gala','Summit','Forum','Launch','Celebration','Conference'])}`,
    type:            faker.helpers.arrayElement(EVENT_TYPES),
    status:          faker.helpers.arrayElement(EVENT_STATUSES),
    start_date:      startDate.toISOString().split('T')[0],
    end_date:        endDate.toISOString().split('T')[0],
    start_time:      `${faker.number.int({min:8,max:20}).toString().padStart(2, '0')}:00`,
    end_time:        `${faker.number.int({min:20,max:23}).toString().padStart(2, '0')}:00`,
    setup_date:      null,
    breakdown_date:  null,
    venue_name:      faker.helpers.arrayElement(VENUES),
    venue_address:   faker.location.streetAddress(),
    venue_city:      'Dubai',
    venue_country:   'UAE',
    client_id:       faker.string.uuid(),
    coordinator_id:  'mock-user',
    team_members:    [],
    expected_guests: faker.number.int({ min: 50, max: 800 }),
    actual_guests:   null,
    budget_total:    faker.number.int({ min: 50000, max: 500000 }),
    color:           faker.helpers.arrayElement(['#C9A84C','#3B82F6','#22C55E','#A855F7','#EF4444']),
    notes:           faker.helpers.maybe(() => faker.lorem.paragraph()) ?? null,
    internal_notes:  null,
    created_at:      faker.date.past().toISOString(),
    updated_at:      new Date().toISOString(),
  }
})

// Generate today's events
export const mockTodayEvents = mockEvents
  .filter(e => e.start_date === new Date().toISOString().split('T')[0])
  .slice(0, 3)
