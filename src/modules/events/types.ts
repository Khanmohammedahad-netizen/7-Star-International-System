export type EventStatus =
  | 'planning' | 'confirmed' | 'in_progress'
  | 'completed' | 'cancelled' | 'postponed'

export type EventType =
  | 'corporate' | 'wedding' | 'gala' | 'conference'
  | 'exhibition' | 'product_launch' | 'private'
  | 'concert' | 'other'

// Assuming BillingClient and UserProfile are existing types from billing_core / auth
export interface BillingClient {
  id: string
  name: string
  company: string | null
  email: string | null
}

export interface UserProfile {
  id: string
  first_name: string | null
  last_name: string | null
  avatar_url: string | null
}

export interface Invoice {
  id: string
  event_id?: string | null
  total: number | null
  amount_paid: number | null
  // other fields omitted...
}

export interface Estimate {
  id: string
  event_id?: string | null
  total: number | null
  // other fields omitted...
}

export interface Event {
  id:               string
  org_id:           string
  name:             string
  type:             EventType
  status:           EventStatus
  start_date:       string
  end_date:         string
  start_time:       string | null
  end_time:         string | null
  setup_date:       string | null
  breakdown_date:   string | null
  venue_name:       string | null
  venue_address:    string | null
  venue_city:       string
  venue_country:    string
  client_id:        string | null
  client?:          BillingClient
  coordinator_id:   string | null
  coordinator?:     UserProfile
  team_members:     string[]
  expected_guests:  number | null
  actual_guests:    number | null
  budget_total:     number | null
  color:            string
  notes:            string | null
  internal_notes:   string | null
  created_at:       string
  updated_at:       string
}

export type TimelineItemCategory =
  | 'setup' | 'arrival' | 'ceremony' | 'meal'
  | 'entertainment' | 'speech' | 'breakdown'
  | 'vendor' | 'general' | 'other'

export type TimelineItemStatus =
  | 'pending' | 'in_progress' | 'completed' | 'skipped'

export interface TimelineItem {
  id:             string
  event_id:       string
  time:           string
  duration_mins:  number
  title:          string
  category:       TimelineItemCategory
  description:    string | null
  assigned_to:    string[]
  vendor_id:      string | null
  status:         TimelineItemStatus
  completed_at:   string | null
  completed_by:   string | null
  skip_reason:    string | null
  position:       number
  is_critical:    boolean
  created_at:     string
  updated_at:     string
}

export type VendorStatus =
  | 'contacted' | 'quote_received' | 'confirmed'
  | 'contract_signed' | 'deposit_paid' | 'final_paid'
  | 'completed' | 'cancelled'

export interface Vendor {
  id:           string
  org_id:       string
  name:         string
  category:     string
  contact_name: string | null
  phone:        string | null
  email:        string | null
  website:      string | null
  rating:       number | null
  is_preferred: boolean
  is_active:    boolean
  created_at:   string
}

export interface EventVendor {
  id:                  string
  event_id:            string
  vendor_id:           string
  vendor?:             Vendor
  service_description: string | null
  quoted_amount:       number | null
  agreed_amount:       number | null
  status:              VendorStatus
  contract_url:        string | null
  deposit_amount:      number | null
  deposit_paid_at:     string | null
  arrival_time:        string | null
  notes:               string | null
  created_at:          string
}

export interface EventExpense {
  id:             string
  event_id:       string
  vendor_id:      string | null
  category:       string
  description:    string
  amount:         number
  currency:       string
  status:         'pending' | 'approved' | 'paid' | 'rejected'
  paid_at:        string | null
  receipt_url:    string | null
  created_at:     string
}

export interface EventTask {
  id:           string
  event_id:     string
  title:        string
  description:  string | null
  category:     string
  assignee_id:  string | null
  due_date:     string | null
  due_time:     string | null
  priority:     'low' | 'medium' | 'high' | 'critical'
  status:       'todo' | 'in_progress' | 'done' | 'cancelled'
  completed_at: string | null
  position:     number
}

export interface EventFinanceSummary {
  event_id:          string
  total_quoted:      number
  total_invoiced:    number
  total_received:    number
  total_outstanding: number
  total_expenses:    number
  gross_profit:      number
  margin_percent:    number
  currency:          string
  invoices:          Invoice[]
  estimates:         Estimate[]
  expenses:          EventExpense[]
}
