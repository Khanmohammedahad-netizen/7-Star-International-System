import { faker } from '@faker-js/faker'

const INDUSTRIES = ['Technology', 'Healthcare', 'Finance', 'Education', 'Manufacturing', 'Retail', 'Real Estate']
const SIZES      = ['startup', 'small', 'medium', 'large', 'enterprise']

export const mockCompanies = Array.from({ length: 30 }, () => ({
  id:          faker.string.uuid(),
  org_id:      'mock-org',
  name:        faker.company.name(),
  website:     faker.internet.url(),
  industry:    faker.helpers.arrayElement(INDUSTRIES),
  size:        faker.helpers.arrayElement(SIZES),
  revenue:     faker.number.int({ min: 100000, max: 100000000 }),
  currency:    'USD',
  country:     faker.location.country(),
  city:        faker.location.city(),
  phone:       faker.phone.number(),
  email:       faker.internet.email().toLowerCase(),
  description: faker.helpers.maybe(() => faker.lorem.paragraph()),
  owner_id:    'mock-user',
  tags:        faker.helpers.arrayElements(['Strategic', 'Enterprise', 'SMB', 'Partner', 'At Risk'], { min: 0, max: 2 }),
  created_at:  faker.date.past({ years: 2 }).toISOString(),
  updated_at:  faker.date.recent({ days: 30 }).toISOString(),
}))
