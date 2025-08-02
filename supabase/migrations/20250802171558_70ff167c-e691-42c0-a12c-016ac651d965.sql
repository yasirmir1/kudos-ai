-- Clear existing curriculum content
DELETE FROM bootcamp_curriculum_content;
DELETE FROM bootcamp_curriculum_topics;

-- Insert comprehensive curriculum topics
INSERT INTO bootcamp_curriculum_topics (
    id, topic_name, topic_order, module_id, difficulty, 
    estimated_duration_minutes, prerequisites, learning_objectives
) VALUES 
-- Module 1: Numbers and Place Value
('npv1', 'Reading and Writing Large Numbers', 1, 'mod1', 'foundation', 75, 
 ARRAY['place_value', 'counting'], 
 ARRAY['Read numbers up to 10 million', 'Write numbers up to 10 million in digits and words', 'Understand place value in large numbers', 'Compare and order large numbers']),

('npv2', 'Rounding Numbers', 2, 'mod1', 'foundation', 60, 
 ARRAY['place_value', 'number_line'], 
 ARRAY['Round numbers to nearest 10, 100, 1000, 10000', 'Understand when to round up or down', 'Apply rounding in real-world contexts', 'Estimate using rounding']),

('npv3', 'Comparing and Ordering', 3, 'mod1', 'foundation', 55, 
 ARRAY['place_value', 'number_recognition'], 
 ARRAY['Use comparison symbols <, >, =', 'Order large numbers from smallest to largest', 'Position numbers on a number line', 'Compare numbers with different digits']),

('npv4', 'Roman Numerals', 4, 'mod1', 'intermediate', 70, 
 ARRAY['number_recognition'], 
 ARRAY['Read Roman numerals up to 1000 (M)', 'Convert between Roman and Arabic numerals', 'Understand the rules of Roman numeral formation', 'Apply Roman numerals in real contexts']),

('npv5', 'Negative Numbers', 5, 'mod1', 'intermediate', 80, 
 ARRAY['number_line', 'ordering'], 
 ARRAY['Understand negative numbers on a number line', 'Order positive and negative numbers', 'Apply negative numbers to temperature', 'Calculate with negative numbers']),

-- Module 2: Arithmetic Operations  
('ao1', 'Mental Addition and Subtraction', 1, 'mod2', 'foundation', 65, 
 ARRAY['number_bonds', 'place_value'], 
 ARRAY['Add and subtract multiples of 10, 100, 1000', 'Use compensation strategies', 'Apply near doubles', 'Develop mental calculation speed']),

('ao2', 'Written Methods for Addition', 2, 'mod2', 'foundation', 70, 
 ARRAY['place_value', 'carrying'], 
 ARRAY['Use column addition method', 'Add numbers with different digits', 'Handle carrying across multiple columns', 'Check answers using inverse operations']),

('ao3', 'Written Methods for Subtraction', 3, 'mod2', 'foundation', 75, 
 ARRAY['place_value', 'borrowing'], 
 ARRAY['Use column subtraction method', 'Subtract with borrowing', 'Handle zeros in subtraction', 'Apply decomposition method']),

('ao4', 'Multiplication Tables', 4, 'mod2', 'foundation', 60, 
 ARRAY['repeated_addition', 'skip_counting'], 
 ARRAY['Know multiplication facts up to 12x12', 'Understand multiplication as repeated addition', 'Apply commutative property', 'Use multiplication in problem solving']),

-- Module 3: Fractions, Decimals, Percentages
('fdp1', 'Understanding Fractions', 1, 'mod3', 'foundation', 80, 
 ARRAY['division_concepts', 'part_whole'], 
 ARRAY['Recognize fractions as parts of a whole', 'Read and write fractions', 'Compare fractions with same denominator', 'Find equivalent fractions']),

('fdp2', 'Adding and Subtracting Fractions', 2, 'mod3', 'intermediate', 85, 
 ARRAY['equivalent_fractions', 'common_denominators'], 
 ARRAY['Add fractions with same denominator', 'Subtract fractions with same denominator', 'Find common denominators', 'Simplify fraction answers']),

('fdp3', 'Mixed Numbers and Improper Fractions', 3, 'mod3', 'intermediate', 70, 
 ARRAY['fractions_concepts', 'whole_numbers'], 
 ARRAY['Convert between mixed numbers and improper fractions', 'Add and subtract mixed numbers', 'Compare mixed numbers', 'Apply to real-world problems']),

-- Module 4: Geometry
('geo1', 'Properties of 2D Shapes', 1, 'mod4', 'foundation', 60, 
 ARRAY['shape_recognition'], 
 ARRAY['Identify properties of triangles, quadrilaterals, pentagons, hexagons', 'Classify shapes by properties', 'Understand angles in shapes', 'Recognize regular and irregular shapes']),

('geo2', 'Properties of 3D Shapes', 2, 'mod4', 'foundation', 65, 
 ARRAY['shape_recognition', '2d_shapes'], 
 ARRAY['Identify cubes, cuboids, pyramids, prisms, spheres, cylinders', 'Count faces, edges, vertices', 'Recognize nets of 3D shapes', 'Understand relationship between 2D and 3D shapes']),

('geo3', 'Area and Perimeter', 3, 'mod4', 'intermediate', 75, 
 ARRAY['measurement', 'rectangles'], 
 ARRAY['Calculate area of rectangles and squares', 'Calculate perimeter of regular and irregular shapes', 'Understand difference between area and perimeter', 'Apply to real-world problems']);

-- Insert comprehensive curriculum content for each learning stage
INSERT INTO bootcamp_curriculum_content (
    topic_id, stage_type, stage_order, title, description, 
    estimated_time_minutes, content, media_urls
) VALUES 
-- NPV1: Reading and Writing Large Numbers
('npv1', 'concept_introduction', 1, 'Understanding Large Numbers', 
 'Discover the world of large numbers and their importance in daily life', 25,
 '{
   "learning_objective": "Understand how large numbers work and why they are important in our world",
   "introduction": "Large numbers are everywhere! From the population of countries to YouTube video views, understanding how to read and write big numbers is essential.",
   "concepts": [
     "Place value: Each position represents a different value (units, tens, hundreds, thousands, etc.)",
     "Reading: Break numbers into groups of three digits from right to left",
     "Writing: Use commas to separate groups for easier reading",
     "Word form: Express numbers using words instead of digits"
   ],
   "key_example": "1,234,567 = One million, two hundred thirty-four thousand, five hundred sixty-seven",
   "visual_aids": [
     "Place value chart showing millions, thousands, and units",
     "Number line with large number markers",
     "Real-world examples with large numbers"
   ],
   "real_world_connections": [
     "Population of cities and countries",
     "Distances in kilometers", 
     "Money values in large businesses",
     "YouTube video views and subscribers"
   ]
 }',
 ARRAY['/images/place-value-chart.png', '/videos/large-numbers-intro.mp4']),

('npv1', 'guided_practice', 2, 'Working Through Examples Together',
 'Step-by-step practice with reading and writing large numbers', 25,
 '{
   "introduction": "Let''s practice reading and writing large numbers together, step by step.",
   "activities": [
     {
       "title": "Reading 1,234,567",
       "type": "step_by_step",
       "example": "1,234,567",
       "steps": [
         "Start from the left: 1 million",
         "Next group: 234 thousand", 
         "Last group: 567 units",
         "Put together: One million, two hundred thirty-four thousand, five hundred sixty-seven"
       ],
       "description": "Break large numbers into manageable groups"
     },
     {
       "title": "Writing Numbers from Words",
       "type": "conversion",
       "example": "Three million, five hundred thousand, twenty-one",
       "steps": [
         "Identify millions: 3,000,000",
         "Identify thousands: 500,000",
         "Identify units: 21",
         "Combine: 3,500,021"
       ],
       "description": "Convert word form to standard form"
     }
   ],
   "interactive_elements": [
     {
       "type": "drag_and_drop",
       "title": "Place Value Sorting",
       "description": "Drag digits to correct place value positions"
     },
     {
       "type": "fill_in_blanks",
       "title": "Complete the Number",
       "description": "Fill in missing digits in large numbers"
     }
   ],
   "checkpoints": [
     {
       "question": "In 5,426,789, what does the 4 represent?",
       "answer": "4 hundred thousand (400,000)",
       "explanation": "The 4 is in the hundred thousands place"
     }
   ]
 }',
 ARRAY['/videos/guided-large-numbers.mp4']),

('npv1', 'independent_practice', 3, 'Practice on Your Own',
 'Independent practice problems to build confidence', 20,
 '{
   "introduction": "Now it''s your turn! Practice reading and writing large numbers independently.",
   "exercises": [
     {
       "title": "Number Recognition",
       "instruction": "Write these numbers in words",
       "problems": ["1,234,567", "5,000,042", "9,876,543", "2,500,000"]
     },
     {
       "title": "Word to Number Conversion", 
       "instruction": "Write these word numbers as digits",
       "problems": [
         "Four million, three hundred thousand, fifty-six",
         "Seven million, eight hundred ninety thousand, one hundred twenty-three",
         "One million, five hundred thousand",
         "Six million, forty-seven"
       ]
     },
     {
       "title": "Place Value Questions",
       "instruction": "Answer these place value questions",
       "problems": [
         "What is the value of 7 in 3,724,891?",
         "What digit is in the ten thousands place in 8,639,254?",
         "How many millions are in 4,567,890?"
       ]
     }
   ],
   "self_check": [
     "Can you read any 7-digit number confidently?",
     "Do you understand what each digit position represents?",
     "Can you write numbers from words without help?"
   ],
   "extensions": [
     "Find large numbers in newspapers and practice reading them",
     "Look up population numbers of different countries", 
     "Practice with calculator display numbers"
   ]
 }',
 ARRAY[]),

('npv1', 'assessment', 4, 'Show What You Know',
 'Assessment to demonstrate mastery of large numbers', 10,
 '{
   "introduction": "Time to show what you''ve learned about reading and writing large numbers!",
   "assessment_questions": [
     {
       "id": "q1",
       "question": "Write 3,456,789 in words",
       "type": "text_entry",
       "correct_answer": "Three million, four hundred fifty-six thousand, seven hundred eighty-nine",
       "points": 2,
       "explanation": "Break into groups: 3 million + 456 thousand + 789"
     },
     {
       "id": "q2",
       "question": "What is the value of the digit 5 in 8,521,347?",
       "type": "multiple_choice",
       "options": ["5", "50", "500", "500,000"],
       "correct_answer": "500,000",
       "points": 1,
       "explanation": "The 5 is in the hundred thousands place"
     },
     {
       "id": "q3",
       "question": "Write ''Two million, seven hundred thousand, forty-three'' in digits",
       "type": "text_entry",
       "correct_answer": "2,700,043",
       "points": 2,
       "explanation": "2 million + 700 thousand + 43 = 2,700,043"
     }
   ],
   "success_criteria": {
     "passing_score": 80,
     "total_points": 5,
     "minimum_correct": 4
   },
   "feedback": {
     "excellent": "Outstanding! You''ve mastered large numbers! 🎉",
     "good": "Great work! You understand large numbers well! 👍",
     "needs_work": "Good try! Let''s practice a bit more. 💪"
   }
 }',
 ARRAY[]);

-- Continue with NPV2: Rounding Numbers
INSERT INTO bootcamp_curriculum_content (
    topic_id, stage_type, stage_order, title, description, 
    estimated_time_minutes, content, media_urls
) VALUES 
('npv2', 'concept_introduction', 1, 'The Art of Rounding',
 'Master the skill of rounding numbers to different place values', 15,
 '{
   "learning_objective": "Understand when and how to round numbers for estimation and practical use",
   "introduction": "Rounding helps us work with simpler numbers. It''s like saying ''about'' instead of being exact - super useful for quick calculations!",
   "concepts": [
     "Look at the digit to the right of your rounding place",
     "If it''s 5 or more, round up",
     "If it''s less than 5, round down", 
     "All digits to the right become zeros"
   ],
   "key_example": "Rounding 3,456 to nearest hundred: Look at 5 (tens place), it''s 5 or more, so round up to 3,500",
   "visual_aids": [
     "Number line showing rounding decisions",
     "Rounding rules chart",
     "Real-world rounding examples"
   ],
   "real_world_connections": [
     "Estimating shopping totals",
     "Rounding times for schedules",
     "Population statistics",
     "Sports scores and statistics"
   ]
 }',
 ARRAY['/images/rounding-number-line.png', '/videos/rounding-explained.mp4']),

('npv2', 'guided_practice', 2, 'Rounding Practice Together',
 'Work through rounding examples step by step', 20,
 '{
   "introduction": "Let''s practice rounding together, building your confidence step by step.",
   "activities": [
     {
       "title": "Rounding to Nearest 10",
       "examples": [
         {"number": "47", "rounded": "50", "explanation": "7 ≥ 5, so round up"},
         {"number": "83", "rounded": "80", "explanation": "3 < 5, so round down"},
         {"number": "25", "rounded": "30", "explanation": "5 = 5, so round up"}
       ]
     },
     {
       "title": "Rounding to Nearest 100", 
       "examples": [
         {"number": "456", "rounded": "500", "explanation": "Look at tens place: 5 ≥ 5, round up"},
         {"number": "623", "rounded": "600", "explanation": "Look at tens place: 2 < 5, round down"},
         {"number": "1,350", "rounded": "1,400", "explanation": "Look at tens place: 5 ≥ 5, round up"}
       ]
     }
   ],
   "guided_questions": [
     "Round 3,847 to the nearest thousand",
     "Round 15,294 to the nearest hundred",
     "Round 7,651 to the nearest ten"
   ]
 }',
 ARRAY['/videos/guided-rounding.mp4']);

-- Continue with more curriculum content...
-- This is a sample of the comprehensive content structure
-- The full migration would include all topics and stages