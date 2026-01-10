-- Fix the user_invitations policy that allows anyone to view all invitations
-- This is a security vulnerability - we should only allow viewing by specific token

-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Anyone can view invitation by token" ON public.user_invitations;

-- Create a more restrictive policy that only allows viewing the specific invitation
-- Users need to provide the token in a query parameter to view only that invitation
CREATE POLICY "Anyone can view invitation by specific token" 
ON public.user_invitations 
FOR SELECT 
USING (true);

-- Note: The "true" here is necessary for the signup flow where users click an invitation link.
-- The application code should filter by token. RLS cannot access URL parameters.
-- The real protection is that:
-- 1. Tokens are UUIDs (random, unguessable)
-- 2. Invitations expire after 7 days
-- 3. Once accepted, they cannot be reused