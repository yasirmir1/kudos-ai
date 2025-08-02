-- Insert Statistics topics into bootcamp_curriculum_topics
INSERT INTO bootcamp_curriculum_topics (id, topic_name, module_id, topic_order, difficulty, learning_objectives, prerequisites, estimated_duration_minutes) VALUES
('stat1', 'Data Representation', 'statistics', 1, 'foundation', ARRAY['Identify different types of graphs', 'Read values from bar charts and pictograms', 'Interpret line graphs', 'Understand pie chart sectors'], ARRAY[]::text[], 45),
('stat2', 'Averages', 'statistics', 2, 'intermediate', ARRAY['Calculate the mean of a list', 'Find the median value', 'Identify the mode', 'Determine the range'], ARRAY['stat1'], 45),
('stat3', 'Data Analysis', 'statistics', 3, 'intermediate', ARRAY['Interpret data sets', 'Compare two data sets', 'Use two-way tables', 'Draw conclusions from data'], ARRAY['stat1', 'stat2'], 45),
('stat4', 'Probability', 'statistics', 4, 'advanced', ARRAY['Understand the probability scale', 'Calculate simple probabilities', 'Explore experimental probability', 'Solve probability problems'], ARRAY['stat2'], 45);

-- Insert content stages for stat1 (Data Representation)
INSERT INTO bootcamp_curriculum_content (topic_id, stage_type, title, description, content, stage_order, estimated_time_minutes) VALUES
('stat1', 'concept_introduction', 'Introduction to Data Representation', 'Understanding different ways to display data', '{"text": "Data can be shown in different types of graphs like bar charts, pictograms, line graphs, and pie charts."}', 1, 10),
('stat1', 'complete_step', 'Complete Step Example', 'Example of data representation', '{"example": "A bar chart shows quantities using bars of different lengths."}', 2, 5),
('stat1', 'guided_practice', 'Guided Practice', 'Practice with teacher support', '{"activities": ["Identify different types of graphs", "Read values from bar charts and pictograms", "Interpret line graphs", "Understand pie chart sectors"]}', 3, 15),
('stat1', 'independent_practice', 'Independent Practice', 'Solo practice activities', '{"activities": ["Draw a bar chart from given data", "Interpret a pictogram and answer questions", "Describe trends from a line graph", "Calculate percentages for pie chart sectors"]}', 4, 10),
('stat1', 'assessment', 'Assessment', 'Check understanding', '{"questions": [{"question": "Which graph shows data using sectors of a circle?", "type": "multiple_choice", "options": ["Bar chart", "Pictogram", "Pie chart", "Line graph"]}, {"question": "How many items are represented by the tallest bar on a given bar chart?", "type": "numeric_entry"}]}', 5, 5);

-- Insert content stages for stat2 (Averages)
INSERT INTO bootcamp_curriculum_content (topic_id, stage_type, title, description, content, stage_order, estimated_time_minutes) VALUES
('stat2', 'concept_introduction', 'Introduction to Averages', 'Understanding different types of averages', '{"text": "Averages summarize a set of numbers using mean, median, mode, or range."}', 1, 10),
('stat2', 'complete_step', 'Complete Step Example', 'Example of calculating averages', '{"example": "Mean is the sum of numbers divided by the count."}', 2, 5),
('stat2', 'guided_practice', 'Guided Practice', 'Practice with teacher support', '{"activities": ["Calculate the mean of a list", "Find the median value", "Identify the mode", "Determine the range"]}', 3, 15),
('stat2', 'independent_practice', 'Independent Practice', 'Solo practice activities', '{"activities": ["Find the mean of: 3, 5, 7, 9", "Identify the median of: 4, 8, 6, 5, 7", "Find the mode of: 2, 2, 3, 4, 4, 4, 5", "Calculate the range of: 10, 15, 20, 5, 25"]}', 4, 10),
('stat2', 'assessment', 'Assessment', 'Check understanding', '{"questions": [{"question": "What is the median of 1, 3, 3, 6, 7, 8, 9?", "type": "numeric_entry"}, {"question": "Find the range of: 12, 15, 22, 10, 18.", "type": "numeric_entry"}]}', 5, 5);

-- Insert content stages for stat3 (Data Analysis)
INSERT INTO bootcamp_curriculum_content (topic_id, stage_type, title, description, content, stage_order, estimated_time_minutes) VALUES
('stat3', 'concept_introduction', 'Introduction to Data Analysis', 'Understanding how to analyze data', '{"text": "Data analysis involves interpreting data to find patterns and make conclusions."}', 1, 10),
('stat3', 'complete_step', 'Complete Step Example', 'Example of data analysis', '{"example": "Comparing sales figures from two different months to see trends."}', 2, 5),
('stat3', 'guided_practice', 'Guided Practice', 'Practice with teacher support', '{"activities": ["Interpret data sets", "Compare two data sets", "Use two-way tables", "Draw conclusions from data"]}', 3, 15),
('stat3', 'independent_practice', 'Independent Practice', 'Solo practice activities', '{"activities": ["Compare data from two bar charts", "Answer questions using two-way tables", "Identify trends from data", "Explain conclusions based on data analysis"]}', 4, 10),
('stat3', 'assessment', 'Assessment', 'Check understanding', '{"questions": [{"question": "What trend can you identify from a given data set?", "type": "written_answer"}, {"question": "Use the two-way table to find the total number of students who like sports.", "type": "numeric_entry"}]}', 5, 5);

-- Insert content stages for stat4 (Probability)
INSERT INTO bootcamp_curriculum_content (topic_id, stage_type, title, description, content, stage_order, estimated_time_minutes) VALUES
('stat4', 'concept_introduction', 'Introduction to Probability', 'Understanding probability concepts', '{"text": "Probability tells us how likely an event is to happen, between 0 (impossible) and 1 (certain)."}', 1, 10),
('stat4', 'complete_step', 'Complete Step Example', 'Example of probability calculation', '{"example": "The chance of rolling a 6 on a dice is 1 out of 6."}', 2, 5),
('stat4', 'guided_practice', 'Guided Practice', 'Practice with teacher support', '{"activities": ["Understand the probability scale", "Calculate simple probabilities", "Explore experimental probability", "Solve probability problems"]}', 3, 15),
('stat4', 'independent_practice', 'Independent Practice', 'Solo practice activities', '{"activities": ["Find the probability of flipping heads on a coin", "Calculate probability of drawing a red card from a deck", "Record results of dice rolls and calculate experimental probability", "Answer word problems involving probability"]}', 4, 10),
('stat4', 'assessment', 'Assessment', 'Check understanding', '{"questions": [{"question": "What is the probability of rolling a 3 on a fair six-sided dice?", "type": "numeric_entry"}, {"question": "If you flip a coin 10 times and get 7 heads, what is the experimental probability of heads?", "type": "numeric_entry"}]}', 5, 5);

-- Insert assessment questions for stat1
INSERT INTO bootcamp_curriculum_questions (content_id, question_order, question_type, question_text, options, correct_answer, explanation, difficulty, points) VALUES
((SELECT id FROM bootcamp_curriculum_content WHERE topic_id = 'stat1' AND stage_type = 'assessment'), 1, 'multiple_choice', 'Which graph shows data using sectors of a circle?', '["Bar chart", "Pictogram", "Pie chart", "Line graph"]', 'Pie chart', 'A pie chart displays data as sectors (slices) of a circle.', 'easy', 1),
((SELECT id FROM bootcamp_curriculum_content WHERE topic_id = 'stat1' AND stage_type = 'assessment'), 2, 'numeric_entry', 'How many items are represented by the tallest bar on a given bar chart?', '[]', 'Variable', 'Read the value from the y-axis corresponding to the tallest bar.', 'easy', 1);

-- Insert assessment questions for stat2
INSERT INTO bootcamp_curriculum_questions (content_id, question_order, question_type, question_text, options, correct_answer, explanation, difficulty, points) VALUES
((SELECT id FROM bootcamp_curriculum_content WHERE topic_id = 'stat2' AND stage_type = 'assessment'), 1, 'numeric_entry', 'What is the median of 1, 3, 3, 6, 7, 8, 9?', '[]', '6', 'The median is the middle value when numbers are arranged in order.', 'medium', 1),
((SELECT id FROM bootcamp_curriculum_content WHERE topic_id = 'stat2' AND stage_type = 'assessment'), 2, 'numeric_entry', 'Find the range of: 12, 15, 22, 10, 18.', '[]', '12', 'Range = highest value - lowest value = 22 - 10 = 12.', 'medium', 1);

-- Insert assessment questions for stat3
INSERT INTO bootcamp_curriculum_questions (content_id, question_order, question_type, question_text, options, correct_answer, explanation, difficulty, points) VALUES
((SELECT id FROM bootcamp_curriculum_content WHERE topic_id = 'stat3' AND stage_type = 'assessment'), 1, 'written_answer', 'What trend can you identify from a given data set?', '[]', 'Variable', 'Look for patterns such as increasing, decreasing, or cyclical trends.', 'medium', 2),
((SELECT id FROM bootcamp_curriculum_content WHERE topic_id = 'stat3' AND stage_type = 'assessment'), 2, 'numeric_entry', 'Use the two-way table to find the total number of students who like sports.', '[]', 'Variable', 'Add up all values in the sports column or row of the table.', 'medium', 1);

-- Insert assessment questions for stat4
INSERT INTO bootcamp_curriculum_questions (content_id, question_order, question_type, question_text, options, correct_answer, explanation, difficulty, points) VALUES
((SELECT id FROM bootcamp_curriculum_content WHERE topic_id = 'stat4' AND stage_type = 'assessment'), 1, 'numeric_entry', 'What is the probability of rolling a 3 on a fair six-sided dice?', '[]', '1/6', 'There is 1 favorable outcome (rolling a 3) out of 6 possible outcomes.', 'medium', 1),
((SELECT id FROM bootcamp_curriculum_content WHERE topic_id = 'stat4' AND stage_type = 'assessment'), 2, 'numeric_entry', 'If you flip a coin 10 times and get 7 heads, what is the experimental probability of heads?', '[]', '7/10', 'Experimental probability = number of successes / number of trials = 7/10.', 'medium', 1);