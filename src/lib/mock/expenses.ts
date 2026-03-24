import { faker } from '@faker-js/faker'
import { EventExpense } from '@/modules/events/types'

export function generateMockExpenses(eventId: string): EventExpense[] {
  return Array.from({ length: 5 }, () => ({
    id: faker.string.uuid(),
    event_id: eventId,
    vendor_id: faker.string.uuid(),
    category: faker.helpers.arrayElement(['catering', 'venue', 'av_tech', 'decoration', 'staff']),
    description: faker.commerce.productName(),
    amount: faker.number.int({ min: 500, max: 20000 }),
    currency: 'AED',
    status: faker.helpers.arrayElement(['pending', 'approved', 'paid']),
    paid_at: faker.date.recent().toISOString(),
    receipt_url: null,
    created_at: faker.date.recent().toISOString(),
  }))
}

export const mockExpenses = generateMockExpenses('mock-event-1')
