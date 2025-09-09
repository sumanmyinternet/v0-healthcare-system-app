-- Create default admin profile
-- Note: You must first sign up with suman.myinternet@gmail.com through the UI, then run this script
-- Default credentials: suman.myinternet@gmail.com / Admincdpr##

-- This script updates an existing user to admin role
-- First, sign up normally at /auth/sign-up with:
-- Email: suman.myinternet@gmail.com
-- Password: Admincdpr##
-- Role: Admin
-- Full Name: System Administrator

-- Then run this script to ensure admin privileges
UPDATE public.profiles 
SET 
  role = 'admin',
  full_name = 'System Administrator',
  phone = '+1-555-0100',
  updated_at = NOW()
WHERE email = 'suman.myinternet@gmail.com';

-- Ensure admin has a wallet with initial balance
INSERT INTO public.wallets (
  user_id,
  balance,
  created_at,
  updated_at
) 
SELECT 
  id,
  1000.00,
  NOW(),
  NOW()
FROM public.profiles 
WHERE email = 'suman.myinternet@gmail.com'
ON CONFLICT (user_id) DO UPDATE SET
  balance = 1000.00,
  updated_at = NOW();
