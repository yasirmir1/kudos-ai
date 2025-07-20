-- Remove conflicting RLS policy that requires admin privileges
DROP POLICY IF EXISTS "Admins and service can add curriculum" ON curriculum;

-- The "Authenticated users can add curriculum" policy should handle all imports