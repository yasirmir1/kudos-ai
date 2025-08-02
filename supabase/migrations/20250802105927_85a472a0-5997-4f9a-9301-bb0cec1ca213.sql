-- Add curriculum topics for problem-solving skills
INSERT INTO bootcamp_curriculum_topics (
  id, topic_name, difficulty, estimated_duration_minutes, 
  learning_objectives, prerequisites, topic_order
) VALUES 
('wp1', 'Word Problems', 'foundation', 45, 
 ARRAY['Identify key information in word problems', 'Choose appropriate operations', 'Write number sentences from words'], 
 ARRAY[]::text[], 1),
('wb1', 'Working Backwards', 'intermediate', 40, 
 ARRAY['Understand reverse problem solving', 'Work from answer to question', 'Apply backwards thinking strategies'], 
 ARRAY['wp1'], 2),
('pp1', 'Pattern Problems', 'intermediate', 35, 
 ARRAY['Identify number patterns', 'Extend sequences logically', 'Find pattern rules'], 
 ARRAY[]::text[], 3),
('lp1', 'Logic Puzzles', 'advanced', 50, 
 ARRAY['Apply logical reasoning', 'Solve multi-step logic problems', 'Use elimination strategies'], 
 ARRAY['wp1', 'wb1'], 4);

-- Add curriculum content for Word Problems
INSERT INTO bootcamp_curriculum_content (
  topic_id, stage_type, stage_order, title, description, 
  estimated_time_minutes, content
) VALUES 
('wp1', 'concept_introduction', 1, 'Understanding Word Problems', 'Learn to break down word problems', 10, 
 '{"introduction": "Word problems tell a story with numbers. Your job is to find what the story is asking and choose the right operation.", "example": "Sarah has 24 stickers. She gives 8 to her friend. How many does she have left? Key words: has (start with), gives (subtract), left (what remains) → 24 - 8 = 16"}'),
('wp1', 'guided_practice', 2, 'Guided Word Problem Practice', 'Practice with step-by-step help', 15, 
 '{"exercises": ["Tom bought 15 apples and 12 oranges. How many fruits did he buy in total?", "A box contains 48 chocolates. If 19 are eaten, how many remain?", "Lisa saves £5 each week. How much will she save in 6 weeks?"]}'),
('wp1', 'independent_practice', 3, 'Independent Word Problem Practice', 'Solve problems on your own', 15, 
 '{"exercises": ["A school has 456 students. 129 are in Year 3, 145 are in Year 4, and the rest are in Year 5. How many Year 5 students are there?", "Jake reads 25 pages on Monday, 18 pages on Tuesday, and 22 pages on Wednesday. How many pages did he read altogether?", "A cinema has 240 seats. If 185 tickets are sold, how many seats are empty?"]}'),
('wp1', 'assessment', 4, 'Word Problems Assessment', 'Test your problem-solving skills', 5, 
 '{"instructions": "Solve each word problem showing your working"}');

-- Add curriculum content for Working Backwards
INSERT INTO bootcamp_curriculum_content (
  topic_id, stage_type, stage_order, title, description, 
  estimated_time_minutes, content
) VALUES 
('wb1', 'concept_introduction', 1, 'Working Backwards Strategy', 'Learn to solve problems by starting from the end', 10, 
 '{"introduction": "Sometimes it''s easier to start with the answer and work backwards to check or find missing information.", "example": "I think of a number, add 15, then subtract 8. My answer is 23. What was my number? Work backwards: 23 + 8 - 15 = 16"}'),
('wb1', 'guided_practice', 2, 'Guided Backwards Practice', 'Practice working backwards with help', 15, 
 '{"exercises": ["I think of a number, multiply by 3, then add 7. My answer is 28. What was my number?", "Amy starts with some money, spends £12, then earns £8. She now has £25. How much did she start with?", "A number is doubled, then 5 is subtracted. The result is 19. What was the original number?"]}'),
('wb1', 'independent_practice', 3, 'Independent Backwards Practice', 'Work backwards independently', 10, 
 '{"exercises": ["Ben saves money each week. After 4 weeks he has £60. If he started with £20, how much does he save each week?", "A box of sweets is shared equally among 6 children, with 3 sweets left over. If each child gets 8 sweets, how many were in the box originally?", "I think of a number, divide by 4, then subtract 6. My answer is 9. What was my number?"]}'),
('wb1', 'assessment', 4, 'Working Backwards Assessment', 'Demonstrate backwards problem solving', 5, 
 '{"instructions": "Show your backwards working clearly"}');

-- Add curriculum content for Pattern Problems
INSERT INTO bootcamp_curriculum_content (
  topic_id, stage_type, stage_order, title, description, 
  estimated_time_minutes, content
) VALUES 
('pp1', 'concept_introduction', 1, 'Understanding Patterns', 'Learn to identify and extend patterns', 10, 
 '{"introduction": "Patterns follow rules. Look for what changes and what stays the same to find the rule.", "example": "2, 5, 8, 11, 14... The rule is +3 each time. Next numbers: 17, 20, 23"}'),
('pp1', 'guided_practice', 2, 'Guided Pattern Practice', 'Find patterns with guidance', 10, 
 '{"exercises": ["Complete: 3, 7, 11, 15, __, __", "Complete: 50, 45, 40, 35, __, __", "Complete: 1, 4, 9, 16, __, __ (square numbers)"]}'),
('pp1', 'independent_practice', 3, 'Independent Pattern Practice', 'Solve pattern problems alone', 10, 
 '{"exercises": ["Find the rule: 2, 6, 18, 54, __", "Complete: 100, 92, 84, 76, __", "What comes next: 1, 1, 2, 3, 5, 8, __ (Fibonacci)"]}'),
('pp1', 'assessment', 4, 'Pattern Problems Assessment', 'Test pattern recognition skills', 5, 
 '{"instructions": "Explain the rule for each pattern"}');

-- Add curriculum content for Logic Puzzles
INSERT INTO bootcamp_curriculum_content (
  topic_id, stage_type, stage_order, title, description, 
  estimated_time_minutes, content
) VALUES 
('lp1', 'concept_introduction', 1, 'Logic and Reasoning', 'Learn systematic problem solving', 15, 
 '{"introduction": "Logic puzzles need careful thinking and systematic approaches. Make lists, eliminate possibilities, and use clues step by step.", "example": "Three friends like different sports: football, tennis, swimming. Alex doesn''t like tennis. Ben likes swimming. What sport does each person like? Ben=swimming, Alex=football (not tennis), Chris=tennis"}'),
('lp1', 'guided_practice', 2, 'Guided Logic Practice', 'Solve logic puzzles with help', 15, 
 '{"exercises": ["Four children (Amy, Ben, Cat, Dan) have different pets (dog, cat, fish, bird). Amy has the bird. Ben doesn''t have the cat. Cat has the fish. What pet does each child have?", "Three numbers add to 15. Each number is different. One number is 7. What could the other two numbers be?", "In a race, Tom finished before Sam but after Lucy. If there were only three runners, who came first?"]}'),
('lp1', 'independent_practice', 3, 'Independent Logic Practice', 'Challenge yourself with logic', 15, 
 '{"exercises": ["Five friends sit in a row. Anna sits next to Ben. Ben sits between Anna and Charlie. David sits at one end. Emma doesn''t sit next to David. What is the seating order?", "I have coins totaling 50p using exactly 6 coins. What coins could I have?", "Three boxes contain apples. Box A has 5 more than Box B. Box C has twice as many as Box A. Together they have 35 apples. How many in each box?"]}'),
('lp1', 'assessment', 4, 'Logic Puzzles Assessment', 'Demonstrate logical reasoning', 5, 
 '{"instructions": "Show your logical working step by step"}');

-- Add sample questions for each topic
INSERT INTO bootcamp_curriculum_questions (
  content_id, question_order, question_type, question_text, 
  options, correct_answer, difficulty, points
) VALUES 
-- Word Problems questions
((SELECT id FROM bootcamp_curriculum_content WHERE topic_id = 'wp1' AND stage_type = 'assessment'), 1, 'multiple_choice', 
 'Sarah has 36 stickers. She gives 14 to Tom and 9 to Lisa. How many stickers does Sarah have left?', 
 '["13", "23", "59", "31"]', '13', 'medium', 1),
((SELECT id FROM bootcamp_curriculum_content WHERE topic_id = 'wp1' AND stage_type = 'assessment'), 2, 'written_answer', 
 'A shop sells 127 items on Monday, 89 on Tuesday, and 156 on Wednesday. How many items were sold in total over the three days?', 
 '[]', '372', 'medium', 2),

-- Working Backwards questions
((SELECT id FROM bootcamp_curriculum_content WHERE topic_id = 'wb1' AND stage_type = 'assessment'), 1, 'numeric_entry', 
 'I think of a number, multiply it by 4, then subtract 11. My answer is 37. What was my original number?', 
 '[]', '12', 'medium', 2),
((SELECT id FROM bootcamp_curriculum_content WHERE topic_id = 'wb1' AND stage_type = 'assessment'), 2, 'multiple_choice', 
 'Jake starts with some money, spends £18, then finds £5. He now has £32. How much did he start with?', 
 '["£45", "£15", "£19", "£55"]', '£45', 'medium', 1),

-- Pattern Problems questions
((SELECT id FROM bootcamp_curriculum_content WHERE topic_id = 'pp1' AND stage_type = 'assessment'), 1, 'numeric_entry', 
 'Complete the pattern: 4, 9, 14, 19, 24, ___', 
 '[]', '29', 'medium', 1),
((SELECT id FROM bootcamp_curriculum_content WHERE topic_id = 'pp1' AND stage_type = 'assessment'), 2, 'multiple_choice', 
 'What is the rule for this pattern: 80, 72, 64, 56, 48?', 
 '["Subtract 8", "Subtract 7", "Add 8", "Divide by 8"]', 'Subtract 8', 'medium', 1),

-- Logic Puzzles questions
((SELECT id FROM bootcamp_curriculum_content WHERE topic_id = 'lp1' AND stage_type = 'assessment'), 1, 'written_answer', 
 'Three children have different colored bikes: red, blue, and green. Emma doesn''t have the red bike. Sam has the blue bike. What color bike does each child have?', 
 '[]', 'Emma: green, Sam: blue, Third child: red', 'hard', 2),
((SELECT id FROM bootcamp_curriculum_content WHERE topic_id = 'lp1' AND stage_type = 'assessment'), 2, 'multiple_choice', 
 'I have exactly 7 coins that total 43p. What coins could I have?', 
 '["5×5p + 2×9p", "6×5p + 1×13p", "3×10p + 4×2p + 1×5p", "1×20p + 3×5p + 3×2p + 1×1p"]', '1×20p + 3×5p + 3×2p + 1×1p', 'hard', 2);