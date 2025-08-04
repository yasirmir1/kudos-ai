-- Add subscription exemption for full access
INSERT INTO subscription_exemptions (
  user_id, 
  email, 
  exemption_type, 
  is_active, 
  expires_at, 
  notes
) 
SELECT 
  auth.uid(),
  (SELECT email FROM auth.users WHERE id = auth.uid()),
  'full_access',
  true,
  NULL, -- No expiration
  'Administrative access grant'
WHERE NOT EXISTS (
  SELECT 1 FROM subscription_exemptions 
  WHERE user_id = auth.uid() 
  AND is_active = true
);