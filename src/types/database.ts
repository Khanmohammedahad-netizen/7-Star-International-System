// Custom types for the 7 Star International application
export type AppRole = 'super_admin' | 'admin' | 'manager' | 'supervisor' | 'accountant' | 'staff' | 'pending';
export type Region = 'UAE' | 'SAUDI';
export type EventStatus = 'pending' | 'approved' | 'rejected' | 'completed';
export type PaymentMode = 'bank_transfer' | 'cash' | 'credit_card' | 'cheque' | 'other';
export type DocumentStatus = 'draft' | 'sent' | 'approved' | 'rejected';
export type VendorType = 'decor' | 'catering' | 'lighting' | 'venue' | 'security' | 'audio_visual' | 'photography' | 'transportation' | 'florist' | 'furniture' | 'staffing' | 'other';
export type VendorStatus = 'active' | 'inactive';

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  phone?: string;
  avatar_url?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserRole {
  id: string;
  user_id: string;
  role: AppRole;
  region: Region;
  created_at: string;
}

export interface Client {
  id: string;
  name: string;
  company_name?: string;
  representative_name?: string;
  representative_phone?: string;
  email?: string;
  address?: string;
  region: Region;
  is_active: boolean;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface Employee {
  id: string;
  full_name: string;
  email?: string;
  phone?: string;
  emirates_id?: string;
  emirates_id_expiry?: string;
  emirates_id_image_url?: string;
  passport_number?: string;
  passport_expiry?: string;
  passport_image_url?: string;
  visa_number?: string;
  visa_expiry?: string;
  position?: string;
  region: Region;
  is_active: boolean;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface Event {
  id: string;
  title: string;
  description?: string;
  client_id: string;
  client?: Client;
  event_date: string;
  event_end_date?: string;
  location?: string;
  status: EventStatus;
  staff_count: number;
  region: Region;
  approved_by?: string;
  approved_at?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface Vendor {
  id: string;
  vendor_name: string;
  vendor_type: VendorType;
  facilities_provided?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  representative_name?: string;
  representative_phone?: string;
  representative_email?: string;
  notes?: string;
  status: VendorStatus;
  region: Region;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface EventVendor {
  id: string;
  event_id: string;
  vendor_id: string;
  notes?: string;
  assigned_by?: string;
  created_at: string;
  vendor?: Vendor;
  event?: Event;
}

export interface Material {
  id: string;
  name: string;
  description?: string;
  size?: string;
  unit_price: number;
  region: Region;
  is_active: boolean;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface Quotation {
  id: string;
  quotation_number: string;
  client_id: string;
  client?: Client;
  event_id?: string;
  element?: string;
  quotation_date: string;
  net_amount: number;
  vat_amount: number;
  total_amount: number;
  status: DocumentStatus;
  notes?: string;
  region: Region;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface QuotationItem {
  id: string;
  quotation_id: string;
  serial_no: number;
  description: string;
  size?: string;
  quantity: number;
  rate: number;
  amount: number;
  created_at: string;
}

export interface Invoice {
  id: string;
  invoice_number: string;
  quotation_id?: string;
  client_id: string;
  client?: Client;
  event_id?: string;
  invoice_date: string;
  net_amount: number;
  vat_amount: number;
  total_amount: number;
  amount_paid: number;
  balance: number;
  status: DocumentStatus;
  notes?: string;
  region: Region;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface InvoiceItem {
  id: string;
  invoice_id: string;
  serial_no: number;
  description: string;
  size?: string;
  quantity: number;
  rate: number;
  amount: number;
  created_at: string;
}

export interface Payment {
  id: string;
  invoice_id: string;
  invoice?: Invoice;
  payment_date: string;
  amount: number;
  payment_mode: PaymentMode;
  reference_number?: string;
  notes?: string;
  region: Region;
  received_by?: string;
  created_at: string;
  updated_at: string;
}

export interface CompanyAccount {
  id: string;
  entry_date: string;
  project_name?: string;
  expense_head?: string;
  description?: string;
  amount: number;
  vat: number;
  total: number;
  e7_bank_transfer: number;
  e7_cash: number;
  shaji_bank_transfer: number;
  shaji_cash: number;
  shaji_credit_card: number;
  others: number;
  mode_of_payment?: PaymentMode;
  invoice_available: boolean;
  invoice_date?: string;
  person_responsible?: string;
  remarks?: string;
  region: Region;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface PersonalAccount {
  id: string;
  entry_date: string;
  description: string;
  credit: number;
  debit: number;
  mode_of_payment?: PaymentMode;
  remarks?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface UserInvitation {
  id: string;
  email: string;
  role: AppRole;
  region: Region;
  token: string;
  invited_by: string;
  expires_at: string;
  accepted_at?: string;
  created_at: string;
}

// Role permissions map
export const ROLE_PERMISSIONS: Record<AppRole, {
  canViewDashboard: boolean;
  canViewEvents: boolean;
  canManageEvents: boolean;
  canViewClients: boolean;
  canManageClients: boolean;
  canViewEmployees: boolean;
  canManageEmployees: boolean;
  canViewQuotations: boolean;
  canManageQuotations: boolean;
  canViewInvoices: boolean;
  canManageInvoices: boolean;
  canViewPayments: boolean;
  canManagePayments: boolean;
  canViewAccounts: boolean;
  canManageAccounts: boolean;
  canViewUsers: boolean;
  canManageUsers: boolean;
  canViewPersonalAccounts: boolean;
  canViewVendors: boolean;
  canManageVendors: boolean;
}> = {
  super_admin: {
    canViewDashboard: true,
    canViewEvents: true,
    canManageEvents: true,
    canViewClients: true,
    canManageClients: true,
    canViewEmployees: true,
    canManageEmployees: true,
    canViewQuotations: true,
    canManageQuotations: true,
    canViewInvoices: true,
    canManageInvoices: true,
    canViewPayments: true,
    canManagePayments: true,
    canViewAccounts: true,
    canManageAccounts: true,
    canViewUsers: true,
    canManageUsers: true,
    canViewPersonalAccounts: true,
    canViewVendors: true,
    canManageVendors: true,
  },
  admin: {
    canViewDashboard: true,
    canViewEvents: true,
    canManageEvents: true,
    canViewClients: true,
    canManageClients: true,
    canViewEmployees: true,
    canManageEmployees: true,
    canViewQuotations: true,
    canManageQuotations: true,
    canViewInvoices: true,
    canManageInvoices: true,
    canViewPayments: true,
    canManagePayments: true,
    canViewAccounts: true,
    canManageAccounts: true,
    canViewUsers: false,
    canManageUsers: false,
    canViewPersonalAccounts: false,
    canViewVendors: true,
    canManageVendors: false,
  },
  manager: {
    canViewDashboard: true,
    canViewEvents: true,
    canManageEvents: true,
    canViewClients: false,
    canManageClients: false,
    canViewEmployees: true,
    canManageEmployees: true,
    canViewQuotations: false,
    canManageQuotations: false,
    canViewInvoices: false,
    canManageInvoices: false,
    canViewPayments: false,
    canManagePayments: false,
    canViewAccounts: false,
    canManageAccounts: false,
    canViewUsers: false,
    canManageUsers: false,
    canViewPersonalAccounts: false,
    canViewVendors: true,
    canManageVendors: false,
  },
  supervisor: {
    canViewDashboard: true,
    canViewEvents: true,
    canManageEvents: false,
    canViewClients: false,
    canManageClients: false,
    canViewEmployees: true,
    canManageEmployees: false,
    canViewQuotations: false,
    canManageQuotations: false,
    canViewInvoices: false,
    canManageInvoices: false,
    canViewPayments: false,
    canManagePayments: false,
    canViewAccounts: false,
    canManageAccounts: false,
    canViewUsers: false,
    canManageUsers: false,
    canViewPersonalAccounts: false,
    canViewVendors: false,
    canManageVendors: false,
  },
  accountant: {
    canViewDashboard: true,
    canViewEvents: false,
    canManageEvents: false,
    canViewClients: false,
    canManageClients: false,
    canViewEmployees: false,
    canManageEmployees: false,
    canViewQuotations: true,
    canManageQuotations: true,
    canViewInvoices: true,
    canManageInvoices: true,
    canViewPayments: true,
    canManagePayments: true,
    canViewAccounts: true,
    canManageAccounts: true,
    canViewUsers: false,
    canManageUsers: false,
    canViewPersonalAccounts: false,
    canViewVendors: false,
    canManageVendors: false,
  },
  staff: {
    canViewDashboard: true,
    canViewEvents: true,
    canManageEvents: false,
    canViewClients: false,
    canManageClients: false,
    canViewEmployees: false,
    canManageEmployees: false,
    canViewQuotations: false,
    canManageQuotations: false,
    canViewInvoices: false,
    canManageInvoices: false,
    canViewPayments: false,
    canManagePayments: false,
    canViewAccounts: false,
    canManageAccounts: false,
    canViewUsers: false,
    canManageUsers: false,
    canViewPersonalAccounts: false,
    canViewVendors: false,
    canManageVendors: false,
  },
  pending: {
    canViewDashboard: false,
    canViewEvents: false,
    canManageEvents: false,
    canViewClients: false,
    canManageClients: false,
    canViewEmployees: false,
    canManageEmployees: false,
    canViewQuotations: false,
    canManageQuotations: false,
    canViewInvoices: false,
    canManageInvoices: false,
    canViewPayments: false,
    canManagePayments: false,
    canViewAccounts: false,
    canManageAccounts: false,
    canViewUsers: false,
    canManageUsers: false,
    canViewPersonalAccounts: false,
    canViewVendors: false,
    canManageVendors: false,
  },
};

// Vendor type labels
export const VENDOR_TYPE_LABELS: Record<VendorType, string> = {
  decor: 'Decor',
  catering: 'Catering',
  lighting: 'Lighting',
  venue: 'Venue',
  security: 'Security',
  audio_visual: 'Audio/Visual',
  photography: 'Photography',
  transportation: 'Transportation',
  florist: 'Florist',
  furniture: 'Furniture',
  staffing: 'Staffing',
  other: 'Other',
};

// Role labels
export const ROLE_LABELS: Record<AppRole, string> = {
  super_admin: 'Super Admin',
  admin: 'Admin',
  manager: 'Manager',
  supervisor: 'Supervisor',
  accountant: 'Accountant',
  staff: 'Staff',
  pending: 'Pending Approval',
};
