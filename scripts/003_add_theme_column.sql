-- Add theme column to users_profile table
ALTER TABLE public.users_profile 
ADD COLUMN IF NOT EXISTS theme TEXT DEFAULT 'light' CHECK (theme IN ('light', 'dark'));
