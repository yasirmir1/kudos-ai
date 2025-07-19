-- Create new enum with school year values
CREATE TYPE age_group_new AS ENUM ('year 2-3', 'year 4-5', '11+');

-- Update student_profiles table
ALTER TABLE student_profiles 
  ADD COLUMN age_group_new age_group_new DEFAULT 'year 4-5';

UPDATE student_profiles SET age_group_new = 
  CASE age_group::text
    WHEN '6-7' THEN 'year 2-3'::age_group_new
    WHEN '8-9' THEN 'year 4-5'::age_group_new
    WHEN '10-11' THEN '11+'::age_group_new
    ELSE 'year 4-5'::age_group_new
  END;

ALTER TABLE student_profiles DROP COLUMN age_group;
ALTER TABLE student_profiles RENAME COLUMN age_group_new TO age_group;

-- Update curriculum table
ALTER TABLE curriculum 
  ADD COLUMN age_group_new age_group_new DEFAULT 'year 4-5';

UPDATE curriculum SET age_group_new = 
  CASE age_group::text
    WHEN '6-7' THEN 'year 2-3'::age_group_new
    WHEN '8-9' THEN 'year 4-5'::age_group_new
    WHEN '10-11' THEN '11+'::age_group_new
    ELSE 'year 4-5'::age_group_new
  END;

ALTER TABLE curriculum DROP COLUMN age_group;
ALTER TABLE curriculum RENAME COLUMN age_group_new TO age_group;

-- Update practice_sessions table  
ALTER TABLE practice_sessions 
  ADD COLUMN age_group_new age_group_new;

UPDATE practice_sessions SET age_group_new = 
  CASE age_group::text
    WHEN '6-7' THEN 'year 2-3'::age_group_new
    WHEN '8-9' THEN 'year 4-5'::age_group_new
    WHEN '10-11' THEN '11+'::age_group_new
    ELSE 'year 4-5'::age_group_new
  END;

ALTER TABLE practice_sessions DROP COLUMN age_group;
ALTER TABLE practice_sessions RENAME COLUMN age_group_new TO age_group;

-- Update student_answers table
ALTER TABLE student_answers 
  ADD COLUMN age_group_new age_group_new;

UPDATE student_answers SET age_group_new = 
  CASE age_group::text
    WHEN '6-7' THEN 'year 2-3'::age_group_new
    WHEN '8-9' THEN 'year 4-5'::age_group_new
    WHEN '10-11' THEN '11+'::age_group_new
    ELSE 'year 4-5'::age_group_new
  END;

ALTER TABLE student_answers DROP COLUMN age_group;
ALTER TABLE student_answers RENAME COLUMN age_group_new TO age_group;

-- Drop old enum and rename new one
DROP TYPE age_group;
ALTER TYPE age_group_new RENAME TO age_group;