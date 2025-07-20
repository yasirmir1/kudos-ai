-- Clean up database question IDs to consistent format

-- First, update Y6 prefixes to 11P format
UPDATE curriculum SET question_id = REPLACE(question_id, 'Y6ALG', '11PALG') WHERE question_id LIKE 'Y6ALG%';
UPDATE curriculum SET question_id = REPLACE(question_id, 'Y6GEO', '11PGEO') WHERE question_id LIKE 'Y6GEO%';
UPDATE curriculum SET question_id = REPLACE(question_id, 'Y6', '11P') WHERE question_id LIKE 'Y6%';

-- Clean up random number suffixes in Y4/Y5 geometry and position questions
UPDATE curriculum SET question_id = 'Y4GS004' WHERE question_id = 'Y4GS07048742';
UPDATE curriculum SET question_id = 'Y4GS005' WHERE question_id = 'Y4GS26080892';
UPDATE curriculum SET question_id = 'Y4GS006' WHERE question_id = 'Y4GS36184655';
UPDATE curriculum SET question_id = 'Y4GS007' WHERE question_id = 'Y4GS59314962';
UPDATE curriculum SET question_id = 'Y4GS008' WHERE question_id = 'Y4GS70745061';

UPDATE curriculum SET question_id = 'Y4PD003' WHERE question_id = 'Y4PD70042617';
UPDATE curriculum SET question_id = 'Y4PD004' WHERE question_id = 'Y4PD81404439';
UPDATE curriculum SET question_id = 'Y4PD005' WHERE question_id = 'Y4PD93817952';

-- Remove duplicate entries with _1, _2, etc. suffixes (keep only the base versions)
DELETE FROM curriculum WHERE question_id LIKE '%_%' AND question_id NOT LIKE '11P%';

-- Standardize all 11+ entries to use consistent 11P prefix format
UPDATE curriculum SET question_id = REGEXP_REPLACE(question_id, '^11P([A-Z]+)(\d+)$', '11P\1' || LPAD('\2', 3, '0')) 
WHERE question_id LIKE '11P%' AND LENGTH(REGEXP_REPLACE(question_id, '^11P[A-Z]+(\d+)$', '\1')) < 3;