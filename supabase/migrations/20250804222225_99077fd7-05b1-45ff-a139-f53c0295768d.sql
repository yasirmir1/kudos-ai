-- Add column to track trial ending notifications
ALTER TABLE public.subscribers 
ADD COLUMN IF NOT EXISTS trial_ending_notification_sent BOOLEAN DEFAULT false;