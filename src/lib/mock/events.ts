import { faker } from '@faker-js/faker'
export const mockEvents = Array.from({ length: 8 }, (_, i) => {
  const budget = faker.number.float({min:5000,max:100000,fractionDigits:2}); const spent = budget * faker.number.float({min:0.3,max:0.9,fractionDigits:2})
  return { id: faker.string.uuid(), name: faker.helpers.arrayElement(['Tech Summit 2026','Annual Gala Dinner','Product Launch','Wellness Workshop','Corporate Retreat','Design Conference','Startup Pitch Night','Charity Run']),
    type: faker.helpers.arrayElement(['conference','corporate','workshop','gala','product_launch','concert'] as const),
    status: faker.helpers.weightedArrayElement([{weight:2,value:'planning' as const},{weight:3,value:'confirmed' as const},{weight:1,value:'completed' as const},{weight:1,value:'active' as const}]),
    start_date: faker.date.soon({days:60}).toISOString().split('T')[0], end_date: faker.date.soon({days:62}).toISOString().split('T')[0],
    location: faker.location.city(), venue: faker.company.name() + ' Hall',
    expected_attendees: faker.number.int({min:50,max:500}), actual_attendees: faker.number.int({min:30,max:400}),
    budget, spent: Math.round(spent*100)/100, revenue: faker.number.float({min:budget*0.5,max:budget*2,fractionDigits:2}),
    manager: faker.person.fullName(), created_at: faker.date.past({years:1}).toISOString(),
  }
})
export const mockRegistrations = Array.from({ length: 20 }, () => ({
  id: faker.string.uuid(), event: faker.helpers.arrayElement(mockEvents).name, name: faker.person.fullName(), email: faker.internet.email().toLowerCase(),
  ticket_type: faker.helpers.arrayElement(['vip','general','speaker','staff'] as const),
  status: faker.helpers.weightedArrayElement([{weight:3,value:'confirmed' as const},{weight:2,value:'registered' as const},{weight:1,value:'attended' as const},{weight:1,value:'cancelled' as const}]),
  amount_paid: faker.number.float({min:0,max:500,fractionDigits:2}), registered_at: faker.date.recent({days:14}).toISOString(),
}))
export const mockVendors = Array.from({ length: 10 }, () => ({
  id: faker.string.uuid(), name: faker.company.name(), category: faker.helpers.arrayElement(['catering','av_tech','decoration','photography','security','entertainment','transport'] as const),
  contact: faker.person.fullName(), phone: faker.phone.number(), email: faker.internet.email().toLowerCase(), rating: faker.number.int({min:3,max:5}),
}))
export const mockVenues = Array.from({ length: 5 }, () => ({
  id: faker.string.uuid(), name: faker.company.name() + ' Center', type: faker.helpers.arrayElement(['hotel','convention','outdoor','restaurant','theater']),
  city: faker.location.city(), capacity: faker.number.int({min:50,max:2000}), daily_rate: faker.number.float({min:1000,max:15000,fractionDigits:2}),
  contact: faker.person.fullName(), phone: faker.phone.number(),
}))
