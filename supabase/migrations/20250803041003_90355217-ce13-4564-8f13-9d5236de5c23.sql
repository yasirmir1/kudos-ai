-- Fix security issues by adding SET search_path to critical functions
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.student_profiles (id, email, age_group)
  VALUES (
    NEW.id, 
    NEW.email, 
    COALESCE(
      CASE (NEW.raw_user_meta_data ->> 'age_group')
        WHEN '6-7' THEN 'year 2-3'::public.age_group
        WHEN 'year 2-3' THEN 'year 2-3'::public.age_group
        WHEN '8-9' THEN 'year 4-5'::public.age_group
        WHEN 'year 4-5' THEN 'year 4-5'::public.age_group
        WHEN '10-11' THEN '11+'::public.age_group
        WHEN '11+' THEN '11+'::public.age_group
        ELSE 'year 4-5'::public.age_group
      END,
      'year 4-5'::public.age_group
    )
  );
  RETURN NEW;
END;
$function$;

-- Fix bootcamp user creation function
CREATE OR REPLACE FUNCTION public.bootcamp_handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
    INSERT INTO bootcamp_students (user_id, email, username, created_at, last_active)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
        NOW(),
        NOW()
    );
    RETURN NEW;
END;
$function$;

-- Fix get_current_student_id function
CREATE OR REPLACE FUNCTION public.get_current_student_id()
RETURNS uuid
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT student_id FROM public.bootcamp_students WHERE user_id = auth.uid();
$function$;