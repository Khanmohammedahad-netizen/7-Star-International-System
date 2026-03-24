import { z } from 'zod'

export const createEventSchema = z.object({
  name:            z.string().min(2, 'Event name is required'),
  type:            z.enum(['corporate','wedding','gala','conference',
                           'exhibition','product_launch','private','concert','other']),
  status:          z.enum(['planning','confirmed','in_progress','completed','cancelled','postponed'])
                    .default('planning'),
  start_date:      z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date'),
  end_date:        z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date'),
  start_time:      z.string().optional().nullable(),
  end_time:        z.string().optional().nullable(),
  setup_date:      z.string().optional().nullable(),
  breakdown_date:  z.string().optional().nullable(),
  venue_name:      z.string().optional().nullable(),
  venue_address:   z.string().optional().nullable(),
  venue_city:      z.string().default('Dubai'),
  venue_country:   z.string().default('UAE'),
  client_id:       z.string().uuid().optional().nullable(),
  coordinator_id:  z.string().uuid().optional().nullable(),
  expected_guests: z.number().int().positive().optional().nullable(),
  budget_total:    z.number().positive().optional().nullable(),
  color:           z.string().default('#C9A84C'),
  notes:           z.string().optional().nullable(),
}).refine(
  data => data.end_date >= data.start_date,
  { message: 'End date must be after start date', path: ['end_date'] }
)

export const createTimelineItemSchema = z.object({
  time:           z.string().regex(/^\d{2}:\d{2}$/, 'Time must be HH:MM'),
  title:          z.string().min(1, 'Title is required'),
  category:       z.enum(['setup','arrival','ceremony','meal','entertainment',
                          'speech','breakdown','vendor','general','other']),
  description:    z.string().optional().nullable(),
  duration_mins:  z.number().int().min(1).default(30),
  assigned_to:    z.array(z.string().uuid()).default([]),
  vendor_id:      z.string().uuid().optional().nullable(),
  is_critical:    z.boolean().default(false),
})

export const createVendorSchema = z.object({
  name:         z.string().min(2),
  category:     z.string().min(1),
  contact_name: z.string().optional().nullable(),
  phone:        z.string().optional().nullable(),
  email:        z.string().email().optional().nullable(),
  website:      z.string().url().optional().nullable(),
  rating:       z.number().int().min(1).max(5).optional().nullable(),
  is_preferred: z.boolean().default(false),
})

export const createExpenseSchema = z.object({
  category:     z.string().min(1),
  description:  z.string().min(1),
  amount:       z.number().positive(),
  currency:     z.string().default('AED'),
  vendor_id:    z.string().uuid().optional().nullable(),
  receipt_url:  z.string().url().optional().nullable(),
})
