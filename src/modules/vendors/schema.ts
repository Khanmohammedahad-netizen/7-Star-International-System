import { z } from 'zod'

export const createVendorSchema = z.object({
  name:         z.string().min(2, 'Company name is required'),
  category:     z.enum(['catering', 'av_production', 'decor', 'photography', 'entertainment', 'venue', 'other'])
                 .default('catering'),
  contact_name: z.string().optional().nullable(),
  phone:        z.string().optional().nullable(),
  email:        z.string().email('Invalid email address').optional().nullable(),
  website:      z.string().url('Invalid URL').optional().nullable().or(z.literal('')),
  is_preferred: z.boolean().default(false),
})
