import { faker } from '@faker-js/faker'

const VENDOR_CATEGORIES = ['catering','av_tech','decoration','photography','entertainment','transport','security']
const VENDOR_NAMES: Record<string, string[]> = {
  catering:      ['Al Sham Catering', 'Gourmet Events', 'Royal Buffet', 'Five Star Catering'],
  av_tech:       ['Vision Productions', 'Sound & Light UAE', 'AV Masters', 'TechEvent Pro'],
  decoration:    ['Floral Dreams Dubai', 'Event Decor UAE', 'Luxe Events Design'],
  photography:   ['Moments Studio', 'Golden Frame Photography', 'Dubai Lens'],
  entertainment: ['Entertainment Hub', 'Live Act UAE', 'Dubai Performers'],
  transport:     ['VIP Limo Dubai', 'Executive Transport', 'Premier Cars'],
  security:      ['Shield Security', 'Event Guard UAE', 'Pro Security Services'],
}

export const mockVendors = VENDOR_CATEGORIES.flatMap(category =>
  (VENDOR_NAMES[category] || []).map(name => ({
    id:           faker.string.uuid(),
    org_id:       'mock-org',
    name,
    category,
    contact_name: faker.person.fullName(),
    phone:        `+971 ${faker.number.int({min:50,max:58})} ${faker.number.int({min:1000000,max:9999999})}`,
    email:        faker.internet.email(),
    website:      faker.internet.url(),
    rating:       faker.number.int({ min: 3, max: 5 }),
    is_preferred: faker.datatype.boolean({ probability: 0.4 }),
    is_active:    true,
    created_at:   faker.date.past().toISOString(),
  }))
)
