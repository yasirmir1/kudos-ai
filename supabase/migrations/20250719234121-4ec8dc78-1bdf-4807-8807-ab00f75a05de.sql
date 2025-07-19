-- Add the missing Y5NPV questions from the JSON
INSERT INTO curriculum (
  question_id, topic, subtopic, example_question, question_type, 
  options, correct_answer, difficulty, red_herring_tag, 
  red_herring_explanation, pedagogical_notes, age_group
) VALUES 
('Y5NPV001', 'Number - Number and Place Value', 'Read, write, order and compare numbers to at least 1,000,000', 'Which number is larger: 456,789 or 456,879?', 'Multiple Choice', '["456,879", "456,789", "They are equal", "Cannot tell"]', '456,879', 'Medium', ARRAY['LargeNumber_DigitPositionError'], 'Student may compare wrong place values in large numbers.', 'Year 5: Comparing 6-digit numbers.', 'year 4-5'),
('Y5NPV002', 'Number - Number and Place Value', 'Count forwards or backwards in steps of powers of 10', 'What is 34,500 + 1,000?', 'Multiple Choice', '["35,500", "34,600", "44,500", "34,510"]', '35,500', 'Easy', ARRAY['PowersOf10_PlaceValueError'], 'Student may add to wrong place value column.', 'Year 5: Adding powers of 10.', 'year 4-5'),
('Y5NPV003', 'Number - Number and Place Value', 'Interpret negative numbers in context, count forwards and backwards with positive and negative whole numbers', 'The temperature is -5°C. It rises by 8°C. What is the new temperature?', 'Multiple Choice', '["3°C", "-13°C", "13°C", "-3°C"]', '3°C', 'Medium', ARRAY['NegativeNumbers_OperationError'], 'Student may subtract instead of add (-5-8=-13) or mishandle crossing zero.', 'Year 5: Working with negative numbers in context.', 'year 4-5'),
('Y5NPV004', 'Number - Number and Place Value', 'Round any number up to 1,000,000 to the nearest 10, 100, 1000, 10,000 and 100,000', 'Round 654,321 to the nearest 10,000.', 'Multiple Choice', '["650,000", "660,000", "654,000", "700,000"]', '650,000', 'Hard', ARRAY['Rounding_LargePlaceValue'], 'Student may round to wrong place value or round up incorrectly.', 'Year 5: Rounding large numbers to ten thousands.', 'year 4-5')
ON CONFLICT (question_id) DO NOTHING;