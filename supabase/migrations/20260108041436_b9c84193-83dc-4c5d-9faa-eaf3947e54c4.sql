-- =====================================================
-- 7 STAR INTERNATIONAL EVENT OPERATIONS SYSTEM
-- Complete Database Schema
-- =====================================================

-- 1. ENUMS
-- =====================================================
CREATE TYPE public.app_role AS ENUM ('super_admin', 'manager', 'supervisor', 'accountant', 'staff');
CREATE TYPE public.region AS ENUM ('UAE', 'SAUDI');
CREATE TYPE public.event_status AS ENUM ('pending', 'approved', 'rejected', 'completed');
CREATE TYPE public.payment_mode AS ENUM ('bank_transfer', 'cash', 'credit_card', 'cheque', 'other');
CREATE TYPE public.document_status AS ENUM ('draft', 'sent', 'approved', 'rejected');

-- 2. PROFILES TABLE
-- =====================================================
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  phone TEXT,
  avatar_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 3. USER ROLES TABLE (Separate from profiles for security)
-- =====================================================
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  region region NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE (user_id, role, region)
);

-- 4. CLIENTS TABLE
-- =====================================================
CREATE TABLE public.clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  company_name TEXT,
  representative_name TEXT,
  representative_phone TEXT,
  email TEXT,
  address TEXT,
  region region NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 5. EMPLOYEES TABLE
-- =====================================================
CREATE TABLE public.employees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  emirates_id TEXT,
  emirates_id_expiry DATE,
  emirates_id_image_url TEXT,
  passport_number TEXT,
  passport_expiry DATE,
  passport_image_url TEXT,
  visa_number TEXT,
  visa_expiry DATE,
  position TEXT,
  region region NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 6. EVENTS TABLE
-- =====================================================
CREATE TABLE public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  client_id UUID REFERENCES public.clients(id) NOT NULL,
  event_date DATE NOT NULL,
  event_end_date DATE,
  location TEXT,
  status event_status DEFAULT 'pending' NOT NULL,
  staff_count INTEGER DEFAULT 0,
  region region NOT NULL,
  approved_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMPTZ,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 7. EVENT EMPLOYEES (Junction Table)
-- =====================================================
CREATE TABLE public.event_employees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE NOT NULL,
  employee_id UUID REFERENCES public.employees(id) ON DELETE CASCADE NOT NULL,
  assigned_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  assigned_by UUID REFERENCES auth.users(id),
  UNIQUE (event_id, employee_id)
);

-- 8. MATERIALS TABLE
-- =====================================================
CREATE TABLE public.materials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  size TEXT,
  unit_price DECIMAL(12, 2) DEFAULT 0,
  region region NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 9. EVENT MATERIALS (Junction Table)
-- =====================================================
CREATE TABLE public.event_materials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE NOT NULL,
  material_id UUID REFERENCES public.materials(id) NOT NULL,
  quantity INTEGER DEFAULT 1 NOT NULL,
  unit_price DECIMAL(12, 2) NOT NULL,
  total_price DECIMAL(12, 2) GENERATED ALWAYS AS (quantity * unit_price) STORED,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 10. QUOTATIONS TABLE
-- =====================================================
CREATE TABLE public.quotations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quotation_number TEXT NOT NULL UNIQUE,
  client_id UUID REFERENCES public.clients(id) NOT NULL,
  event_id UUID REFERENCES public.events(id),
  element TEXT,
  quotation_date DATE DEFAULT CURRENT_DATE NOT NULL,
  net_amount DECIMAL(12, 2) DEFAULT 0 NOT NULL,
  vat_amount DECIMAL(12, 2) DEFAULT 0 NOT NULL,
  total_amount DECIMAL(12, 2) DEFAULT 0 NOT NULL,
  status document_status DEFAULT 'draft' NOT NULL,
  notes TEXT,
  region region NOT NULL,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 11. QUOTATION ITEMS TABLE
-- =====================================================
CREATE TABLE public.quotation_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quotation_id UUID REFERENCES public.quotations(id) ON DELETE CASCADE NOT NULL,
  serial_no INTEGER NOT NULL,
  description TEXT NOT NULL,
  size TEXT,
  quantity INTEGER DEFAULT 1 NOT NULL,
  rate DECIMAL(12, 2) NOT NULL,
  amount DECIMAL(12, 2) GENERATED ALWAYS AS (quantity * rate) STORED,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 12. INVOICES TABLE
-- =====================================================
CREATE TABLE public.invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_number TEXT NOT NULL UNIQUE,
  quotation_id UUID REFERENCES public.quotations(id),
  client_id UUID REFERENCES public.clients(id) NOT NULL,
  event_id UUID REFERENCES public.events(id),
  invoice_date DATE DEFAULT CURRENT_DATE NOT NULL,
  net_amount DECIMAL(12, 2) DEFAULT 0 NOT NULL,
  vat_amount DECIMAL(12, 2) DEFAULT 0 NOT NULL,
  total_amount DECIMAL(12, 2) DEFAULT 0 NOT NULL,
  amount_paid DECIMAL(12, 2) DEFAULT 0 NOT NULL,
  balance DECIMAL(12, 2) GENERATED ALWAYS AS (total_amount - amount_paid) STORED,
  status document_status DEFAULT 'draft' NOT NULL,
  notes TEXT,
  region region NOT NULL,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 13. INVOICE ITEMS TABLE
-- =====================================================
CREATE TABLE public.invoice_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID REFERENCES public.invoices(id) ON DELETE CASCADE NOT NULL,
  serial_no INTEGER NOT NULL,
  description TEXT NOT NULL,
  size TEXT,
  quantity INTEGER DEFAULT 1 NOT NULL,
  rate DECIMAL(12, 2) NOT NULL,
  amount DECIMAL(12, 2) GENERATED ALWAYS AS (quantity * rate) STORED,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 14. PAYMENTS TABLE
-- =====================================================
CREATE TABLE public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID REFERENCES public.invoices(id) NOT NULL,
  payment_date DATE DEFAULT CURRENT_DATE NOT NULL,
  amount DECIMAL(12, 2) NOT NULL,
  payment_mode payment_mode NOT NULL,
  reference_number TEXT,
  notes TEXT,
  region region NOT NULL,
  received_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 15. COMPANY ACCOUNTS TABLE (Ledger)
-- =====================================================
CREATE TABLE public.company_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entry_date DATE DEFAULT CURRENT_DATE NOT NULL,
  project_name TEXT,
  expense_head TEXT,
  description TEXT,
  amount DECIMAL(12, 2) DEFAULT 0,
  vat DECIMAL(12, 2) DEFAULT 0,
  total DECIMAL(12, 2) GENERATED ALWAYS AS (amount + vat) STORED,
  e7_bank_transfer DECIMAL(12, 2) DEFAULT 0,
  e7_cash DECIMAL(12, 2) DEFAULT 0,
  shaji_bank_transfer DECIMAL(12, 2) DEFAULT 0,
  shaji_cash DECIMAL(12, 2) DEFAULT 0,
  shaji_credit_card DECIMAL(12, 2) DEFAULT 0,
  others DECIMAL(12, 2) DEFAULT 0,
  mode_of_payment payment_mode,
  invoice_available BOOLEAN DEFAULT false,
  invoice_date DATE,
  person_responsible TEXT,
  remarks TEXT,
  region region NOT NULL,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 16. PERSONAL ACCOUNTS TABLE (Shaji's Private - Super Admin Only)
-- =====================================================
CREATE TABLE public.personal_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entry_date DATE DEFAULT CURRENT_DATE NOT NULL,
  description TEXT NOT NULL,
  credit DECIMAL(12, 2) DEFAULT 0,
  debit DECIMAL(12, 2) DEFAULT 0,
  mode_of_payment payment_mode,
  remarks TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 17. INVOICE NUMBER SEQUENCE TABLE
-- =====================================================
CREATE TABLE public.invoice_sequences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prefix TEXT NOT NULL DEFAULT '7SI',
  current_number INTEGER NOT NULL DEFAULT 0,
  region region NOT NULL,
  UNIQUE (prefix, region)
);

-- Insert initial sequences for both regions
INSERT INTO public.invoice_sequences (prefix, current_number, region) VALUES ('7SI', 0, 'UAE');
INSERT INTO public.invoice_sequences (prefix, current_number, region) VALUES ('7SI', 0, 'SAUDI');

-- 18. USER INVITATIONS TABLE
-- =====================================================
CREATE TABLE public.user_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  role app_role NOT NULL,
  region region NOT NULL,
  token TEXT NOT NULL UNIQUE,
  invited_by UUID REFERENCES auth.users(id) NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '7 days'),
  accepted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- =====================================================
-- SECURITY DEFINER FUNCTIONS
-- =====================================================

-- Function to check if user has a specific role
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Function to check if user is super admin
CREATE OR REPLACE FUNCTION public.is_super_admin(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = 'super_admin'
  )
$$;

-- Function to get user's region
CREATE OR REPLACE FUNCTION public.get_user_region(_user_id UUID)
RETURNS region
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT region
  FROM public.user_roles
  WHERE user_id = _user_id
  LIMIT 1
$$;

-- Function to check region access
CREATE OR REPLACE FUNCTION public.has_region_access(_user_id UUID, _region region)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND (role = 'super_admin' OR region = _region)
  )
$$;

-- Function to get next invoice number
CREATE OR REPLACE FUNCTION public.get_next_invoice_number(_region region)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  next_num INTEGER;
  result TEXT;
BEGIN
  UPDATE public.invoice_sequences
  SET current_number = current_number + 1
  WHERE prefix = '7SI' AND region = _region
  RETURNING current_number INTO next_num;
  
  result := '7SI-' || LPAD(next_num::TEXT, 4, '0');
  RETURN result;
END;
$$;

-- Function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- =====================================================
-- TRIGGERS FOR UPDATED_AT
-- =====================================================
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON public.clients FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_employees_updated_at BEFORE UPDATE ON public.employees FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON public.events FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_materials_updated_at BEFORE UPDATE ON public.materials FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_quotations_updated_at BEFORE UPDATE ON public.quotations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_invoices_updated_at BEFORE UPDATE ON public.invoices FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON public.payments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_company_accounts_updated_at BEFORE UPDATE ON public.company_accounts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_personal_accounts_updated_at BEFORE UPDATE ON public.personal_accounts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger to create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email));
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- ENABLE RLS ON ALL TABLES
-- =====================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quotations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quotation_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.personal_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoice_sequences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_invitations ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- RLS POLICIES
-- =====================================================

-- PROFILES POLICIES
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Super admin can view all profiles" ON public.profiles FOR SELECT USING (public.is_super_admin(auth.uid()));
CREATE POLICY "Super admin can update all profiles" ON public.profiles FOR UPDATE USING (public.is_super_admin(auth.uid()));

-- USER ROLES POLICIES (Only super admin can manage roles)
CREATE POLICY "Super admin can view all roles" ON public.user_roles FOR SELECT USING (public.is_super_admin(auth.uid()));
CREATE POLICY "Super admin can insert roles" ON public.user_roles FOR INSERT WITH CHECK (public.is_super_admin(auth.uid()));
CREATE POLICY "Super admin can update roles" ON public.user_roles FOR UPDATE USING (public.is_super_admin(auth.uid()));
CREATE POLICY "Super admin can delete roles" ON public.user_roles FOR DELETE USING (public.is_super_admin(auth.uid()));
CREATE POLICY "Users can view own role" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);

-- CLIENTS POLICIES (Region-based access)
CREATE POLICY "Super admin can manage all clients" ON public.clients FOR ALL USING (public.is_super_admin(auth.uid()));
CREATE POLICY "Users can view clients in their region" ON public.clients FOR SELECT USING (public.has_region_access(auth.uid(), region));
CREATE POLICY "Users can insert clients in their region" ON public.clients FOR INSERT WITH CHECK (public.has_region_access(auth.uid(), region));
CREATE POLICY "Users can update clients in their region" ON public.clients FOR UPDATE USING (public.has_region_access(auth.uid(), region));

-- EMPLOYEES POLICIES (Region-based access, restricted by role)
CREATE POLICY "Super admin can manage all employees" ON public.employees FOR ALL USING (public.is_super_admin(auth.uid()));
CREATE POLICY "Manager can manage employees in their region" ON public.employees FOR ALL USING (
  public.has_role(auth.uid(), 'manager') AND public.has_region_access(auth.uid(), region)
);
CREATE POLICY "Supervisor can view employees in their region" ON public.employees FOR SELECT USING (
  public.has_role(auth.uid(), 'supervisor') AND public.has_region_access(auth.uid(), region)
);

-- EVENTS POLICIES (Region-based, all authenticated users can view)
CREATE POLICY "Super admin can manage all events" ON public.events FOR ALL USING (public.is_super_admin(auth.uid()));
CREATE POLICY "Users can view events in their region" ON public.events FOR SELECT USING (public.has_region_access(auth.uid(), region));
CREATE POLICY "Manager can manage events in their region" ON public.events FOR ALL USING (
  public.has_role(auth.uid(), 'manager') AND public.has_region_access(auth.uid(), region)
);
CREATE POLICY "Supervisor can view events in their region" ON public.events FOR SELECT USING (
  public.has_role(auth.uid(), 'supervisor') AND public.has_region_access(auth.uid(), region)
);
CREATE POLICY "Staff can view events in their region" ON public.events FOR SELECT USING (
  public.has_role(auth.uid(), 'staff') AND public.has_region_access(auth.uid(), region)
);

-- EVENT EMPLOYEES POLICIES
CREATE POLICY "Super admin can manage all event employees" ON public.event_employees FOR ALL USING (public.is_super_admin(auth.uid()));
CREATE POLICY "Users can view event employees for accessible events" ON public.event_employees FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.events e WHERE e.id = event_id AND public.has_region_access(auth.uid(), e.region))
);
CREATE POLICY "Manager can manage event employees" ON public.event_employees FOR ALL USING (
  EXISTS (SELECT 1 FROM public.events e WHERE e.id = event_id AND public.has_role(auth.uid(), 'manager') AND public.has_region_access(auth.uid(), e.region))
);

-- MATERIALS POLICIES
CREATE POLICY "Super admin can manage all materials" ON public.materials FOR ALL USING (public.is_super_admin(auth.uid()));
CREATE POLICY "Users can view materials in their region" ON public.materials FOR SELECT USING (public.has_region_access(auth.uid(), region));
CREATE POLICY "Manager can manage materials in their region" ON public.materials FOR ALL USING (
  public.has_role(auth.uid(), 'manager') AND public.has_region_access(auth.uid(), region)
);

-- EVENT MATERIALS POLICIES
CREATE POLICY "Super admin can manage all event materials" ON public.event_materials FOR ALL USING (public.is_super_admin(auth.uid()));
CREATE POLICY "Users can view event materials for accessible events" ON public.event_materials FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.events e WHERE e.id = event_id AND public.has_region_access(auth.uid(), e.region))
);
CREATE POLICY "Manager can manage event materials" ON public.event_materials FOR ALL USING (
  EXISTS (SELECT 1 FROM public.events e WHERE e.id = event_id AND public.has_role(auth.uid(), 'manager') AND public.has_region_access(auth.uid(), e.region))
);

-- QUOTATIONS POLICIES (Accountant and Super Admin only)
CREATE POLICY "Super admin can manage all quotations" ON public.quotations FOR ALL USING (public.is_super_admin(auth.uid()));
CREATE POLICY "Accountant can manage quotations in their region" ON public.quotations FOR ALL USING (
  public.has_role(auth.uid(), 'accountant') AND public.has_region_access(auth.uid(), region)
);

-- QUOTATION ITEMS POLICIES
CREATE POLICY "Super admin can manage all quotation items" ON public.quotation_items FOR ALL USING (public.is_super_admin(auth.uid()));
CREATE POLICY "Accountant can manage quotation items" ON public.quotation_items FOR ALL USING (
  EXISTS (SELECT 1 FROM public.quotations q WHERE q.id = quotation_id AND public.has_role(auth.uid(), 'accountant') AND public.has_region_access(auth.uid(), q.region))
);

-- INVOICES POLICIES (Accountant and Super Admin only)
CREATE POLICY "Super admin can manage all invoices" ON public.invoices FOR ALL USING (public.is_super_admin(auth.uid()));
CREATE POLICY "Accountant can manage invoices in their region" ON public.invoices FOR ALL USING (
  public.has_role(auth.uid(), 'accountant') AND public.has_region_access(auth.uid(), region)
);

-- INVOICE ITEMS POLICIES
CREATE POLICY "Super admin can manage all invoice items" ON public.invoice_items FOR ALL USING (public.is_super_admin(auth.uid()));
CREATE POLICY "Accountant can manage invoice items" ON public.invoice_items FOR ALL USING (
  EXISTS (SELECT 1 FROM public.invoices i WHERE i.id = invoice_id AND public.has_role(auth.uid(), 'accountant') AND public.has_region_access(auth.uid(), i.region))
);

-- PAYMENTS POLICIES (Accountant and Super Admin only)
CREATE POLICY "Super admin can manage all payments" ON public.payments FOR ALL USING (public.is_super_admin(auth.uid()));
CREATE POLICY "Accountant can manage payments in their region" ON public.payments FOR ALL USING (
  public.has_role(auth.uid(), 'accountant') AND public.has_region_access(auth.uid(), region)
);

-- COMPANY ACCOUNTS POLICIES (Accountant and Super Admin only)
CREATE POLICY "Super admin can manage all company accounts" ON public.company_accounts FOR ALL USING (public.is_super_admin(auth.uid()));
CREATE POLICY "Accountant can manage company accounts in their region" ON public.company_accounts FOR ALL USING (
  public.has_role(auth.uid(), 'accountant') AND public.has_region_access(auth.uid(), region)
);

-- PERSONAL ACCOUNTS POLICIES (Super Admin ONLY)
CREATE POLICY "Only super admin can manage personal accounts" ON public.personal_accounts FOR ALL USING (public.is_super_admin(auth.uid()));

-- INVOICE SEQUENCES POLICIES
CREATE POLICY "Super admin can manage invoice sequences" ON public.invoice_sequences FOR ALL USING (public.is_super_admin(auth.uid()));
CREATE POLICY "Accountant can view and update invoice sequences" ON public.invoice_sequences FOR SELECT USING (
  public.has_role(auth.uid(), 'accountant')
);

-- USER INVITATIONS POLICIES
CREATE POLICY "Super admin can manage all invitations" ON public.user_invitations FOR ALL USING (public.is_super_admin(auth.uid()));
CREATE POLICY "Anyone can view invitation by token" ON public.user_invitations FOR SELECT USING (true);

-- =====================================================
-- STORAGE BUCKET FOR EMPLOYEE DOCUMENTS
-- =====================================================
INSERT INTO storage.buckets (id, name, public) VALUES ('employee-documents', 'employee-documents', false);

-- Storage policies
CREATE POLICY "Super admin can manage all employee documents" ON storage.objects FOR ALL USING (bucket_id = 'employee-documents' AND public.is_super_admin(auth.uid()));
CREATE POLICY "Manager can upload employee documents" ON storage.objects FOR INSERT WITH CHECK (
  bucket_id = 'employee-documents' AND public.has_role(auth.uid(), 'manager')
);
CREATE POLICY "Authenticated users can view employee documents" ON storage.objects FOR SELECT USING (bucket_id = 'employee-documents' AND auth.role() = 'authenticated');