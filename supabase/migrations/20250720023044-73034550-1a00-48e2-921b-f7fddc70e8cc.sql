-- Update year_level based on pedagogical notes content
UPDATE curriculum 
SET year_level = CASE 
    WHEN pedagogical_notes ILIKE 'Year 2:%' THEN 2
    WHEN pedagogical_notes ILIKE 'Year 3:%' THEN 3
    WHEN pedagogical_notes ILIKE 'Year 4:%' THEN 4
    WHEN pedagogical_notes ILIKE 'Year 5:%' THEN 5
    WHEN pedagogical_notes ILIKE 'Year 6:%' THEN 6
    WHEN pedagogical_notes ILIKE 'Year 7:%' THEN 7
    WHEN pedagogical_notes ILIKE 'Year 8:%' THEN 8
    WHEN pedagogical_notes ILIKE 'Year 9:%' THEN 9
    WHEN pedagogical_notes ILIKE 'Year 10:%' THEN 10
    WHEN pedagogical_notes ILIKE 'Year 11:%' THEN 11
    WHEN pedagogical_notes ILIKE 'Year 12:%' THEN 12
    ELSE year_level -- Keep existing value if no pattern matches
END
WHERE pedagogical_notes IS NOT NULL
    AND (pedagogical_notes ILIKE 'Year %:%' OR year_level IS NULL);