-- Update trial duration to 7 days for consistency across all systems
UPDATE subscription_plans 
SET trial_days = 7 
WHERE trial_days = 30;