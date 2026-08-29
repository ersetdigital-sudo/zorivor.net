-- Add is_popular and is_hot columns to games table
ALTER TABLE public.games
ADD COLUMN IF NOT EXISTS is_popular boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS is_hot boolean DEFAULT false;