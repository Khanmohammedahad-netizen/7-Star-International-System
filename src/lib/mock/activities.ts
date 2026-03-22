import { faker } from '@faker-js/faker'

const TYPES = ['email', 'call', 'meeting', 'note', 'task']

export const mockActivities = Array.from({ length: 80 }, () => ({
  id:           faker.string.uuid(),
  org_id:       'mock-org',
  type:         faker.helpers.arrayElement(TYPES),
  title:        faker.helpers.arrayElement([
    'Follow-up email sent',
    'Discovery call completed',
    'Proposal presented',
    'Contract negotiation',
    'Demo scheduled',
    'Onboarding meeting',
    'Left voicemail',
    'Sent pricing document',
  ]),
  description:  faker.helpers.maybe(() => faker.lorem.sentence()),
  contact_id:   faker.string.uuid(),
  deal_id:      faker.helpers.maybe(() => faker.string.uuid()),
  company_id:   faker.helpers.maybe(() => faker.string.uuid()),
  owner_id:     'mock-user',
  is_completed: faker.datatype.boolean({ probability: 0.65 }),
  due_at:       faker.helpers.maybe(() => faker.date.soon({ days: 14 }).toISOString()),
  created_at:   faker.date.recent({ days: 30 }).toISOString(),
}))
