-- First, create profiles for any existing auth users who don't have profiles yet
INSERT INTO public.student_profiles (id, email, current_level)
SELECT 
    au.id,
    au.email,
    'beginner'
FROM auth.users au
LEFT JOIN public.student_profiles sp ON au.id = sp.id
WHERE sp.id IS NULL;

-- Create a function to automatically create a student profile when a user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.student_profiles (id, email, current_level)
  VALUES (NEW.id, NEW.email, 'beginner');
  RETURN NEW;
END;
$$;

-- Create a trigger that runs the function every time a user is created
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();