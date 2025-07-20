-- Final cleanup with correct available IDs

-- Update the 11P entries with random number suffixes to proper format
UPDATE curriculum SET question_id = '11PALG024' WHERE question_id = '11PALG233670566';
UPDATE curriculum SET question_id = '11PALG025' WHERE question_id = '11PALG321193288';
UPDATE curriculum SET question_id = '11PALG026' WHERE question_id = '11PALG388562915';
UPDATE curriculum SET question_id = '11PGEO024' WHERE question_id = '11PGEO496809791';

-- Also update any corresponding student_answers records
UPDATE student_answers SET question_id = '11PALG024' WHERE question_id = '11PALG233670566';
UPDATE student_answers SET question_id = '11PALG025' WHERE question_id = '11PALG321193288';
UPDATE student_answers SET question_id = '11PALG026' WHERE question_id = '11PALG388562915';
UPDATE student_answers SET question_id = '11PGEO024' WHERE question_id = '11PGEO496809791';