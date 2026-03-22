import { faker } from '@faker-js/faker'
import { PipelineStage } from '@/modules/deals/types'

const STAGES: PipelineStage[] = [
  { id: 's1', pipeline_id: 'p1', name: 'Lead',        color: '#94A3B8', position: 0, win_probability: 10 },
  { id: 's2', pipeline_id: 'p1', name: 'Qualified',   color: '#3B82F6', position: 1, win_probability: 25 },
  { id: 's3', pipeline_id: 'p1', name: 'Proposal',    color: '#A855F7', position: 2, win_probability: 50 },
  { id: 's4', pipeline_id: 'p1', name: 'Negotiation', color: '#EAB308', position: 3, win_probability: 75 },
  { id: 's5', pipeline_id: 'p1', name: 'Won',         color: '#22C55E', position: 4, win_probability: 100 },
  { id: 's6', pipeline_id: 'p1', name: 'Lost',        color: '#EF4444', position: 5, win_probability: 0 },
]

export const mockDeals = Array.from({ length: 40 }, (_, i) => ({
  id:             faker.string.uuid(),
  org_id:         'mock-org',
  title:          `${faker.company.name()} — ${faker.helpers.arrayElement(['Website', 'ERP', 'CRM', 'Mobile App', 'API Integration'])}`,
  contact_id:     faker.string.uuid(),
  company_id:     faker.string.uuid(),
  stage_id:       faker.helpers.arrayElement(STAGES).id,
  value:          faker.number.int({ min: 500, max: 50000 }),
  currency:       'USD',
  probability:    faker.number.int({ min: 10, max: 90 }),
  expected_close: faker.date.soon({ days: 90 }).toISOString().split('T')[0],
  owner_id:       'mock-user',
  status:         faker.helpers.weightedArrayElement([
    { weight: 7, value: 'open' },
    { weight: 2, value: 'won' },
    { weight: 1, value: 'lost' },
  ]),
  tags:           faker.helpers.arrayElements(['Hot', 'Cold', 'Urgent', 'Recurring'], { min: 0, max: 2 }),
  position:       i,
  created_at:     faker.date.past({ years: 1 }).toISOString(),
  updated_at:     faker.date.recent({ days: 14 }).toISOString(),
}))

export const mockStages = STAGES
