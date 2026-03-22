import { faker } from '@faker-js/faker'

const SOURCES  = ['web', 'referral', 'cold_outreach', 'social', 'event']
const STATUSES = ['active', 'inactive', 'prospect', 'customer']
const TITLES   = ['CEO', 'CTO', 'CFO', 'Owner', 'Manager', 'Director', 'VP Sales']

export const mockContacts = Array.from({ length: 60 }, (_, i) => ({
  id:          faker.string.uuid(),
  org_id:      'mock-org',
  first_name:  faker.person.firstName(),
  last_name:   faker.person.lastName(),
  email:       faker.internet.email().toLowerCase(),
  phone:       faker.phone.number(),
  title:       faker.helpers.arrayElement(TITLES),
  company_id:  faker.string.uuid(),
  source:      faker.helpers.arrayElement(SOURCES),
  status:      faker.helpers.arrayElement(STATUSES),
  owner_id:    'mock-user',
  avatar_url:  `https://api.dicebear.com/7.x/initials/svg?seed=${i}`,
  notes:       faker.helpers.maybe(() => faker.lorem.sentence()),
  tags:        faker.helpers.arrayElements(['VIP', 'Hot', 'Cold', 'Partner', 'Vendor'], { min: 0, max: 2 }),
  last_contacted_at: faker.helpers.maybe(() => faker.date.recent({ days: 30 }).toISOString()),
  created_at:  faker.date.past({ years: 1 }).toISOString(),
  updated_at:  faker.date.recent({ days: 7 }).toISOString(),
}))
