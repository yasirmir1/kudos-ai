-- Clean up database question IDs with proper foreign key handling

-- First, create a temporary mapping table for ID updates
CREATE TEMP TABLE id_mappings AS
SELECT 
    question_id as old_id,
    CASE 
        -- Update Y6 to 11P format
        WHEN question_id LIKE 'Y6ALG%' THEN REPLACE(question_id, 'Y6ALG', '11PALG')
        WHEN question_id LIKE 'Y6GEO%' THEN REPLACE(question_id, 'Y6GEO', '11PGEO')
        WHEN question_id LIKE 'Y6%' THEN REPLACE(question_id, 'Y6', '11P')
        
        -- Clean up random number suffixes in Y4/Y5
        WHEN question_id = 'Y4GS07048742' THEN 'Y4GS004'
        WHEN question_id = 'Y4GS26080892' THEN 'Y4GS005'
        WHEN question_id = 'Y4GS36184655' THEN 'Y4GS006'
        WHEN question_id = 'Y4GS59314962' THEN 'Y4GS007'
        WHEN question_id = 'Y4GS70745061' THEN 'Y4GS008'
        
        WHEN question_id = 'Y4PD70042617' THEN 'Y4PD003'
        WHEN question_id = 'Y4PD81404439' THEN 'Y4PD004'
        WHEN question_id = 'Y4PD93817952' THEN 'Y4PD005'
        
        ELSE question_id
    END as new_id
FROM curriculum
WHERE question_id LIKE 'Y6%' 
   OR question_id IN ('Y4GS07048742', 'Y4GS26080892', 'Y4GS36184655', 'Y4GS59314962', 'Y4GS70745061',
                      'Y4PD70042617', 'Y4PD81404439', 'Y4PD93817952');

-- Update student_answers first to maintain referential integrity
UPDATE student_answers 
SET question_id = m.new_id
FROM id_mappings m
WHERE student_answers.question_id = m.old_id;

-- Now update curriculum question_ids
UPDATE curriculum 
SET question_id = m.new_id
FROM id_mappings m
WHERE curriculum.question_id = m.old_id;

-- Remove duplicate entries with _1, _2, etc. suffixes (only those without foreign key references)
DELETE FROM curriculum 
WHERE question_id LIKE '%_%' 
  AND question_id NOT LIKE '11P%' 
  AND question_id NOT IN (SELECT DISTINCT question_id FROM student_answers WHERE question_id IS NOT NULL);

-- Drop the temporary table
DROP TABLE id_mappings;