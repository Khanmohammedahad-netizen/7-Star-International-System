-- ==============================================================
-- MIGRATION 000005: PWA Push Subscriptions
-- Creates table to securely capture Web Push subscription endpoints
-- ==============================================================

CREATE TABLE IF NOT EXISTS push_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL UNIQUE,
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Index for querying by user
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_user 
  ON push_subscriptions(user_id);

-- Enforce RLS
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;

-- Allow users to insert their own subscriptions
DROP POLICY IF EXISTS "Users can insert their own subscriptions" ON push_subscriptions;
CREATE POLICY "Users can insert their own subscriptions" ON push_subscriptions 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Allow users to view their own subscriptions
DROP POLICY IF EXISTS "Users can view their own subscriptions" ON push_subscriptions;
CREATE POLICY "Users can view their own subscriptions" ON push_subscriptions 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Allow users to delete their own subscriptions
DROP POLICY IF EXISTS "Users can delete their own subscriptions" ON push_subscriptions;
CREATE POLICY "Users can delete their own subscriptions" ON push_subscriptions 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Wait, the web push API on the server running as service role bypasses RLS,
-- so the server api/push/send can fetch all subscriptions globally.
