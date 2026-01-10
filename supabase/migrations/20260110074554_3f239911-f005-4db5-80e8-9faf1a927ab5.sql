-- Part 2: Create tables, functions, and RLS policies

-- 1. Create vendors table
CREATE TABLE IF NOT EXISTS public.vendors (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  vendor_name TEXT NOT NULL,
  vendor_type vendor_type NOT NULL DEFAULT 'other',
  facilities_provided TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  country TEXT DEFAULT 'UAE',
  representative_name TEXT,
  representative_phone TEXT,
  representative_email TEXT,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  region region NOT NULL,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 2. Create event_vendors junction table
CREATE TABLE IF NOT EXISTS public.event_vendors (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  vendor_id UUID NOT NULL REFERENCES public.vendors(id) ON DELETE CASCADE,
  notes TEXT,
  assigned_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(event_id, vendor_id)
);

-- 3. Enable RLS on vendors table
ALTER TABLE public.vendors ENABLE ROW LEVEL SECURITY;

-- 4. Enable RLS on event_vendors table
ALTER TABLE public.event_vendors ENABLE ROW LEVEL SECURITY;

-- 5. Create helper function to check if user is admin (includes super_admin)
CREATE OR REPLACE FUNCTION public.is_admin(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role IN ('super_admin', 'admin')
  )
$$;

-- 6. Create helper function to check if user is manager or higher
CREATE OR REPLACE FUNCTION public.is_manager_or_higher(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role IN ('super_admin', 'admin', 'manager')
  )
$$;

-- 7. Create helper function to check if user has pending role
CREATE OR REPLACE FUNCTION public.is_pending_user(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = 'pending'
  )
$$;

-- 8. RLS Policies for vendors table

-- Super admin can manage all vendors
CREATE POLICY "Super admin can manage all vendors"
ON public.vendors
FOR ALL
USING (is_super_admin(auth.uid()));

-- Admin and manager can view vendors (read-only)
CREATE POLICY "Admin and manager can view vendors"
ON public.vendors
FOR SELECT
USING (is_manager_or_higher(auth.uid()) AND has_region_access(auth.uid(), region));

-- 9. RLS Policies for event_vendors table

-- Super admin can manage all event_vendors
CREATE POLICY "Super admin can manage all event_vendors"
ON public.event_vendors
FOR ALL
USING (is_super_admin(auth.uid()));

-- Admin can manage event_vendors for events in their region
CREATE POLICY "Admin can manage event_vendors"
ON public.event_vendors
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.events e 
    WHERE e.id = event_vendors.event_id 
    AND is_admin(auth.uid()) 
    AND has_region_access(auth.uid(), e.region)
  )
);

-- Manager can view event_vendors
CREATE POLICY "Manager can view event_vendors"
ON public.event_vendors
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.events e 
    WHERE e.id = event_vendors.event_id 
    AND is_manager_or_higher(auth.uid()) 
    AND has_region_access(auth.uid(), e.region)
  )
);

-- 10. Add updated_at trigger for vendors
CREATE TRIGGER update_vendors_updated_at
BEFORE UPDATE ON public.vendors
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- 11. Create function to count super admins
CREATE OR REPLACE FUNCTION public.count_super_admins()
RETURNS integer
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COUNT(*)::integer
  FROM public.user_roles
  WHERE role = 'super_admin'
$$;

-- 12. Create function to prevent deletion of last super admin
CREATE OR REPLACE FUNCTION public.prevent_last_super_admin_removal()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- If trying to delete a super_admin role or change from super_admin
  IF (TG_OP = 'DELETE' AND OLD.role = 'super_admin') OR 
     (TG_OP = 'UPDATE' AND OLD.role = 'super_admin' AND NEW.role != 'super_admin') THEN
    -- Check if this would leave no super_admins
    IF (SELECT COUNT(*) FROM public.user_roles WHERE role = 'super_admin' AND id != OLD.id) = 0 THEN
      RAISE EXCEPTION 'Cannot remove the last super admin. At least one super admin must exist.';
    END IF;
  END IF;
  
  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  END IF;
  RETURN NEW;
END;
$$;

-- 13. Create trigger to prevent last super admin removal
DROP TRIGGER IF EXISTS prevent_last_super_admin_trigger ON public.user_roles;
CREATE TRIGGER prevent_last_super_admin_trigger
BEFORE DELETE OR UPDATE ON public.user_roles
FOR EACH ROW
EXECUTE FUNCTION public.prevent_last_super_admin_removal();