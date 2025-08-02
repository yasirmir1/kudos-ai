-- Insert all curriculum topics from the provided JSON data

-- Insert all topics
INSERT INTO bootcamp_curriculum_topics (id, topic_name, topic_order, difficulty, estimated_duration_minutes) VALUES
('npv1', 'Reading and Writing Large Numbers', 1, 'foundation', 45),
('npv2', 'Rounding Numbers', 2, 'foundation', 40),
('npv3', 'Comparing and Ordering', 3, 'foundation', 35),
('npv4', 'Roman Numerals', 4, 'intermediate', 40),
('npv5', 'Negative Numbers', 5, 'intermediate', 45),
('npv6', 'Prime Numbers and Factors', 6, 'intermediate', 50),
('npv7', 'Square and Cube Numbers', 7, 'intermediate', 40),
('npv8', 'Prime Factorization', 8, 'advanced', 55)
ON CONFLICT (id) DO UPDATE SET
    topic_name = EXCLUDED.topic_name,
    topic_order = EXCLUDED.topic_order,
    difficulty = EXCLUDED.difficulty,
    estimated_duration_minutes = EXCLUDED.estimated_duration_minutes;

-- Insert all content stages for NPV1
INSERT INTO bootcamp_curriculum_content (topic_id, stage_type, stage_order, title, description, content, estimated_time_minutes) VALUES
('npv1', 'concept_introduction', 1, 'Understanding Large Numbers', 'Learn the fundamental concepts', 
 '{"introduction": "Learn to read and write large numbers up to 10,000,000, understanding place value and how to write numbers in standard and word forms.", "example": "The number 5,203,014 is read as five million, two hundred three thousand, fourteen."}', 10),
('npv1', 'guided_practice', 1, 'Guided Practice', 'Practice with guidance', 
 '{"exercises": ["Write the following numbers in words: 3,405; 48,219; 1,302,058"]}', 15),
('npv1', 'independent_practice', 1, 'Independent Practice', 'Practice independently', 
 '{"exercises": ["Write these numbers in numerals: Two thousand, six hundred and five; Forty-five thousand and eighty-nine; One million, three hundred twenty-two thousand, seventeen"]}', 15),
('npv1', 'assessment', 1, 'Assessment', 'Test your knowledge', 
 '{"instructions": "Demonstrate your mastery"}', 5),

-- NPV2 - Rounding Numbers
('npv2', 'concept_introduction', 1, 'Understanding Rounding', 'Learn rounding concepts', 
 '{"introduction": "Rounding is simplifying numbers by adjusting them to the nearest 10, 100, 1000, or 10000, to make calculations easier.", "example": "Round 3,276 to the nearest 100: look at the tens digit (7), since it is 5 or more, round up → 3,300"}', 10),
('npv2', 'guided_practice', 1, 'Guided Rounding Practice', 'Practice with guidance', 
 '{"exercises": ["Round 4,513 to the nearest 100", "Round 8,219 to the nearest 100", "Round 6,850 to the nearest 100"]}', 15),
('npv2', 'independent_practice', 1, 'Independent Rounding Practice', 'Practice independently', 
 '{"exercises": ["Round 1,467 to the nearest 10", "Round 2,348 to the nearest 100", "Round 6,899 to the nearest 1000"]}', 10),
('npv2', 'assessment', 1, 'Rounding Assessment', 'Test your rounding skills', 
 '{"instructions": "Show your rounding mastery"}', 5),

-- NPV3 - Comparing and Ordering
('npv3', 'concept_introduction', 1, 'Comparing Numbers', 'Learn to compare and order', 
 '{"introduction": "Learn to compare and order numbers using symbols like <, >, = and arrange numbers on number lines.", "example": "Compare 4,321 and 4,312: Since 321 > 312, 4,321 > 4,312."}', 10),
('npv3', 'guided_practice', 1, 'Guided Comparison Practice', 'Practice with guidance', 
 '{"exercises": ["Order these numbers from smallest to largest: 12,345; 13,456; 12,999", "Use <, > or = to compare: 5,432 __ 5,423"]}', 10),
('npv3', 'independent_practice', 1, 'Independent Comparison Practice', 'Practice independently', 
 '{"exercises": ["Put these numbers in order: 1,234; 1,243; 1,234", "Fill in the blanks with > or <: 10,001 __ 9,999"]}', 10),
('npv3', 'assessment', 1, 'Comparison Assessment', 'Test your comparison skills', 
 '{"instructions": "Show your comparison mastery"}', 5),

-- NPV4 - Roman Numerals
('npv4', 'concept_introduction', 1, 'Understanding Roman Numerals', 'Learn Roman numeral basics', 
 '{"introduction": "Learn the basics of Roman numerals and how to convert between Roman numerals and numbers up to 1000.", "example": "The Roman numeral for 50 is L, and for 100 is C."}', 10),
('npv4', 'guided_practice', 1, 'Guided Roman Numeral Practice', 'Practice with guidance', 
 '{"exercises": ["Write these numbers in Roman numerals: 25, 44, 99", "Convert these Roman numerals to numbers: XL, XC, LX"]}', 15),
('npv4', 'independent_practice', 1, 'Independent Roman Numeral Practice', 'Practice independently', 
 '{"exercises": ["Write 234 in Roman numerals", "Convert DCCCXC (890) to a number"]}', 15),
('npv4', 'assessment', 1, 'Roman Numerals Assessment', 'Test your Roman numeral skills', 
 '{"instructions": "Show your Roman numeral mastery"}', 5),

-- NPV5 - Negative Numbers
('npv5', 'concept_introduction', 1, 'Understanding Negative Numbers', 'Learn about negative numbers', 
 '{"introduction": "Understand negative numbers, how they are used on number lines, and in contexts like temperature.", "example": "On a number line, -3 is three steps to the left of 0, less than 0."}', 10),
('npv5', 'guided_practice', 1, 'Guided Negative Number Practice', 'Practice with guidance', 
 '{"exercises": ["Order these numbers: -5, 0, 3, -2", "Calculate: -4 + 3, -2 - 5"]}', 15),
('npv5', 'independent_practice', 1, 'Independent Negative Number Practice', 'Practice independently', 
 '{"exercises": ["Plot -7, 0, and 5 on a number line", "If the temperature is -3°C and rises by 5°C, what is the new temperature?"]}', 15),
('npv5', 'assessment', 1, 'Negative Numbers Assessment', 'Test your negative number skills', 
 '{"instructions": "Show your negative number mastery"}', 5),

-- NPV6 - Prime Numbers and Factors
('npv6', 'concept_introduction', 1, 'Understanding Prime Numbers and Factors', 'Learn about primes and factors', 
 '{"introduction": "Learn to identify prime numbers, find factors and multiples, and understand common factors and multiples.", "example": "7 is a prime number because it has only 1 and 7 as factors."}', 10),
('npv6', 'guided_practice', 1, 'Guided Prime and Factor Practice', 'Practice with guidance', 
 '{"exercises": ["List the factors of 12", "Identify if 13 is prime or not"]}', 20),
('npv6', 'independent_practice', 1, 'Independent Prime and Factor Practice', 'Practice independently', 
 '{"exercises": ["Find all multiples of 5 up to 50", "Find common factors of 18 and 24"]}', 15),
('npv6', 'assessment', 1, 'Prime Numbers and Factors Assessment', 'Test your knowledge', 
 '{"instructions": "Show your prime number mastery"}', 5),

-- NPV7 - Square and Cube Numbers
('npv7', 'concept_introduction', 1, 'Understanding Square and Cube Numbers', 'Learn about squares and cubes', 
 '{"introduction": "Understand square numbers (numbers multiplied by themselves) and cube numbers (numbers multiplied three times).", "example": "5 squared (5²) is 25, 3 cubed (3³) is 27."}', 10),
('npv7', 'guided_practice', 1, 'Guided Square and Cube Practice', 'Practice with guidance', 
 '{"exercises": ["Calculate: 4², 6², 3³", "Recognise patterns in square numbers up to 144"]}', 15),
('npv7', 'independent_practice', 1, 'Independent Square and Cube Practice', 'Practice independently', 
 '{"exercises": ["List the first 10 square numbers", "Find the cube of 7"]}', 10),
('npv7', 'assessment', 1, 'Square and Cube Numbers Assessment', 'Test your knowledge', 
 '{"instructions": "Show your square and cube mastery"}', 5),

-- NPV8 - Prime Factorization
('npv8', 'concept_introduction', 1, 'Understanding Prime Factorization', 'Learn about prime factorization', 
 '{"introduction": "Break numbers down into their prime factors using factor trees and use these to find Highest Common Factor (HCF) and Lowest Common Multiple (LCM).", "example": "Prime factors of 18: 2 × 3 × 3"}', 15),
('npv8', 'guided_practice', 1, 'Guided Prime Factorization Practice', 'Practice with guidance', 
 '{"exercises": ["Create a factor tree for 24", "Find HCF of 12 and 18 using prime factors"]}', 20),
('npv8', 'independent_practice', 1, 'Independent Prime Factorization Practice', 'Practice independently', 
 '{"exercises": ["Find LCM of 4 and 6", "Write prime factorization of 36"]}', 15),
('npv8', 'assessment', 1, 'Prime Factorization Assessment', 'Test your knowledge', 
 '{"instructions": "Show your prime factorization mastery"}', 5)
ON CONFLICT (topic_id, stage_type, stage_order) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    content = EXCLUDED.content,
    estimated_time_minutes = EXCLUDED.estimated_time_minutes;