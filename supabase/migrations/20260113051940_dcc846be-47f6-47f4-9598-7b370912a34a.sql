-- Fix 1: Replace overly permissive user_invitations policy
-- The current policy allows anyone to view all invitations, which is a security risk
DROP POLICY IF EXISTS "Anyone can view invitation by specific token" ON user_invitations;
DROP POLICY IF EXISTS "Anyone can view invitation by token" ON user_invitations;

-- Create a new policy that only allows viewing invitations that are:
-- 1. Not yet accepted (accepted_at IS NULL)
-- 2. Not expired (expires_at > now())
-- This is still permissive for signup flow but limits exposure
CREATE POLICY "View valid pending invitations only" 
ON user_invitations 
FOR SELECT 
TO anon, authenticated
USING (
  accepted_at IS NULL 
  AND expires_at > now()
);

-- Fix 2: Add authorization checks to get_next_invoice_number
CREATE OR REPLACE FUNCTION public.get_next_invoice_number(_region region)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  next_num INTEGER;
  result TEXT;
  caller_role app_role;
BEGIN
  -- Check if user is authenticated
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;
  
  -- Get user role
  SELECT role INTO caller_role
  FROM public.user_roles
  WHERE user_id = auth.uid()
  LIMIT 1;
  
  -- Only accountants, admins, and super_admins can generate invoice numbers
  IF caller_role IS NULL OR caller_role NOT IN ('super_admin', 'admin', 'accountant') THEN
    RAISE EXCEPTION 'Insufficient permissions to generate invoice numbers';
  END IF;
  
  -- Verify region access (super_admin has access to all regions)
  IF NOT public.has_region_access(auth.uid(), _region) THEN
    RAISE EXCEPTION 'No access to region %', _region;
  END IF;
  
  -- Generate number
  UPDATE public.invoice_sequences
  SET current_number = current_number + 1
  WHERE prefix = '7SI' AND region = _region
  RETURNING current_number INTO next_num;
  
  result := '7SI-' || LPAD(next_num::TEXT, 4, '0');
  RETURN result;
END;
$$;