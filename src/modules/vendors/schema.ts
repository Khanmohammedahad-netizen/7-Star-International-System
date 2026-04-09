import { z } from 'zod'

export const createVendorSchema = z.object({
  name:         z.string().min(2, 'Company name is required'),
  category:     z.string().min(1, 'Service category is required'),
  contact:      z.string().optional().nullable(),
  email:        z.string().email('Invalid email').optional().nullable().or(z.literal('')),
  phone:        z.string().optional().nullable(),
  rating:       z.coerce.number().int().min(0).max(5).default(0),
  notes:        z.string().optional().nullable(),
})
