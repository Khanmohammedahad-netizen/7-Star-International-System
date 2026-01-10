-- Allow new users to insert their own role with 'pending' status during signup
CREATE POLICY "Users can create own pending role" 
ON public.user_roles 
FOR INSERT 
WITH CHECK (
  auth.uid() = user_id 
  AND role = 'pending'
);