-- Drop unused bootcamp tables that have redundant functionality

-- Drop bootcamp_answers (replaced by bootcamp_answer_options)
DROP TABLE IF EXISTS bootcamp_answers CASCADE;

-- Drop bootcamp_misconceptions (replaced by bootcamp_misconceptions_catalog) 
DROP TABLE IF EXISTS bootcamp_misconceptions CASCADE;

-- Drop bootcamp_student_profiles (replaced by bootcamp_students)
DROP TABLE IF EXISTS bootcamp_student_profiles CASCADE;