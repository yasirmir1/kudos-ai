-- Final cleanup for remaining inconsistent question IDs

-- Update the 11P entries with random number suffixes to proper format
UPDATE curriculum SET question_id = '11PALG021' WHERE question_id = '11PALG233670566';
UPDATE curriculum SET question_id = '11PALG022' WHERE question_id = '11PALG321193288';
UPDATE curriculum SET question_id = '11PALG023' WHERE question_id = '11PALG388562915';
UPDATE curriculum SET question_id = '11PGEO013' WHERE question_id = '11PGEO496809791';

-- Fix the Y2ASM001 to be Y2ASM001 (this one looks correct, just checking format)
-- Fix any Y4NPV format issues (these should be Y4NPV001, Y4NPV004 which look correct)

-- Also update any corresponding student_answers records
UPDATE student_answers SET question_id = '11PALG021' WHERE question_id = '11PALG233670566';
UPDATE student_answers SET question_id = '11PALG022' WHERE question_id = '11PALG321193288';
UPDATE student_answers SET question_id = '11PALG023' WHERE question_id = '11PALG388562915';
UPDATE student_answers SET question_id = '11PGEO013' WHERE question_id = '11PGEO496809791';