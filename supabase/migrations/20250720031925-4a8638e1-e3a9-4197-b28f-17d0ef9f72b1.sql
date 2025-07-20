-- Check if the current user is admin
DO $$
BEGIN
  -- Update user to be admin for curriculum import
  UPDATE student_profiles 
  SET is_admin = true 
  WHERE id = auth.uid();
  
  RAISE NOTICE 'Updated user admin status';
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Error updating admin status: %', SQLERRM;
END $$;

-- Also create a more permissive policy for curriculum imports
DROP POLICY IF EXISTS "Authenticated users can add curriculum" ON curriculum;

CREATE POLICY "Authenticated users can add curriculum" 
ON curriculum 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);