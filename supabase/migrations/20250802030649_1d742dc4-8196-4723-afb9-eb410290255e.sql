-- Create bootcamp curriculum tables

-- Main curriculum info
CREATE TABLE public.bootcamp_curricula (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    version TEXT NOT NULL,
    total_weeks INTEGER NOT NULL,
    exam_boards TEXT[] NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Modules within curriculum
CREATE TABLE public.bootcamp_modules (
    id TEXT PRIMARY KEY,
    curriculum_id TEXT NOT NULL REFERENCES public.bootcamp_curricula(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    weeks INTEGER[] NOT NULL,
    module_order INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Topics within modules
CREATE TABLE public.bootcamp_topics (
    id TEXT PRIMARY KEY,
    module_id TEXT NOT NULL REFERENCES public.bootcamp_modules(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    difficulty TEXT NOT NULL,
    skills TEXT[] NOT NULL,
    topic_order INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Subtopics within topics
CREATE TABLE public.bootcamp_subtopics (
    id SERIAL PRIMARY KEY,
    topic_id TEXT NOT NULL REFERENCES public.bootcamp_topics(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    subtopic_order INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Difficulty levels
CREATE TABLE public.bootcamp_difficulty_levels (
    level_name TEXT PRIMARY KEY,
    description TEXT NOT NULL,
    score_range_min INTEGER NOT NULL,
    score_range_max INTEGER NOT NULL,
    typical_age TEXT NOT NULL,
    color TEXT NOT NULL
);

-- Question types
CREATE TABLE public.bootcamp_question_types (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    boards TEXT[] NOT NULL,
    format TEXT NOT NULL,
    timing TEXT NOT NULL
);

-- Skills framework
CREATE TABLE public.bootcamp_skills (
    category TEXT NOT NULL,
    skill_name TEXT NOT NULL,
    skill_order INTEGER NOT NULL,
    PRIMARY KEY (category, skill_name)
);

-- Assessment criteria
CREATE TABLE public.bootcamp_assessment_criteria (
    mastery_level TEXT PRIMARY KEY,
    accuracy_range TEXT NOT NULL,
    speed_level TEXT NOT NULL,
    confidence_level TEXT NOT NULL
);

-- Enable RLS on all tables
ALTER TABLE public.bootcamp_curricula ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bootcamp_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bootcamp_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bootcamp_subtopics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bootcamp_difficulty_levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bootcamp_question_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bootcamp_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bootcamp_assessment_criteria ENABLE ROW LEVEL SECURITY;

-- Create policies for viewing (public read access)
CREATE POLICY "Anyone can view bootcamp curricula" ON public.bootcamp_curricula FOR SELECT USING (true);
CREATE POLICY "Anyone can view bootcamp modules" ON public.bootcamp_modules FOR SELECT USING (true);
CREATE POLICY "Anyone can view bootcamp topics" ON public.bootcamp_topics FOR SELECT USING (true);
CREATE POLICY "Anyone can view bootcamp subtopics" ON public.bootcamp_subtopics FOR SELECT USING (true);
CREATE POLICY "Anyone can view bootcamp difficulty levels" ON public.bootcamp_difficulty_levels FOR SELECT USING (true);
CREATE POLICY "Anyone can view bootcamp question types" ON public.bootcamp_question_types FOR SELECT USING (true);
CREATE POLICY "Anyone can view bootcamp skills" ON public.bootcamp_skills FOR SELECT USING (true);
CREATE POLICY "Anyone can view bootcamp assessment criteria" ON public.bootcamp_assessment_criteria FOR SELECT USING (true);

-- Create policies for admin insert/update
CREATE POLICY "Authenticated users can insert bootcamp curricula" ON public.bootcamp_curricula FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can insert bootcamp modules" ON public.bootcamp_modules FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can insert bootcamp topics" ON public.bootcamp_topics FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can insert bootcamp subtopics" ON public.bootcamp_subtopics FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can insert bootcamp difficulty levels" ON public.bootcamp_difficulty_levels FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can insert bootcamp question types" ON public.bootcamp_question_types FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can insert bootcamp skills" ON public.bootcamp_skills FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can insert bootcamp assessment criteria" ON public.bootcamp_assessment_criteria FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Create update triggers
CREATE TRIGGER update_bootcamp_curricula_updated_at
    BEFORE UPDATE ON public.bootcamp_curricula
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Insert the curriculum data from JSON

-- Insert main curriculum
INSERT INTO public.bootcamp_curricula (id, name, version, total_weeks, exam_boards)
VALUES ('11plus-maths-2024', '11+ Mathematics Complete Curriculum', '1.0', 36, ARRAY['GL', 'CEM', 'ISEB', 'Regional']);

-- Insert difficulty levels
INSERT INTO public.bootcamp_difficulty_levels (level_name, description, score_range_min, score_range_max, typical_age, color) VALUES
('foundation', 'Basic concepts and fundamental skills', 0, 40, '9-10', '#48bb78'),
('intermediate', 'Developing skills and problem application', 41, 70, '10-11', '#4299e1'),
('advanced', 'Complex problems and exam-level questions', 71, 100, '10-11', '#9f7aea');

-- Insert question types
INSERT INTO public.bootcamp_question_types (id, name, boards, format, timing) VALUES
('multiple_choice', 'Multiple Choice', ARRAY['GL', 'CEM'], '4 options (A, B, C, D)', '45-60 seconds per question'),
('numeric_entry', 'Numeric Entry', ARRAY['GL', 'CEM'], 'Type in number answer', '60-90 seconds per question'),
('written_answer', 'Written Answer', ARRAY['ISEB', 'Regional'], 'Show working and final answer', '2-3 minutes per question'),
('drag_drop', 'Drag and Drop', ARRAY['GL'], 'Drag items to correct positions', '60-90 seconds per question');

-- Insert skills framework
INSERT INTO public.bootcamp_skills (category, skill_name, skill_order) VALUES
('computational', 'mental_maths', 1),
('computational', 'written_methods', 2),
('computational', 'estimation', 3),
('computational', 'accuracy', 4),
('computational', 'speed', 5),
('conceptual', 'number_sense', 1),
('conceptual', 'spatial_reasoning', 2),
('conceptual', 'pattern_recognition', 3),
('conceptual', 'algebraic_thinking', 4),
('conceptual', 'proportional_reasoning', 5),
('problem_solving', 'comprehension', 1),
('problem_solving', 'strategy_selection', 2),
('problem_solving', 'working_backwards', 3),
('problem_solving', 'logical_reasoning', 4),
('problem_solving', 'checking_solutions', 5),
('exam_skills', 'time_management', 1),
('exam_skills', 'question_prioritization', 2),
('exam_skills', 'stress_management', 3),
('exam_skills', 'accuracy_under_pressure', 4),
('exam_skills', 'self_checking', 5);

-- Insert assessment criteria
INSERT INTO public.bootcamp_assessment_criteria (mastery_level, accuracy_range, speed_level, confidence_level) VALUES
('learning', '< 60%', 'Slow', 'Building'),
('developing', '60-79%', 'Moderate', 'Growing'),
('secure', '80-94%', 'Good', 'Strong'),
('mastery', '95%+', 'Excellent', 'Very Strong');

-- Insert modules
INSERT INTO public.bootcamp_modules (id, curriculum_id, name, weeks, module_order) VALUES
('mod1', '11plus-maths-2024', 'Number & Place Value', ARRAY[1, 2, 3, 4], 1),
('mod2', '11plus-maths-2024', 'Arithmetic Operations', ARRAY[5, 6, 7, 8], 2),
('mod3', '11plus-maths-2024', 'Fractions, Decimals & Percentages', ARRAY[9, 10, 11, 12], 3),
('mod4', '11plus-maths-2024', 'Ratio & Proportion', ARRAY[13, 14], 4),
('mod5', '11plus-maths-2024', 'Algebra', ARRAY[15, 16, 17, 18], 5),
('mod6', '11plus-maths-2024', 'Geometry', ARRAY[19, 20, 21, 22, 23, 24], 6),
('mod7', '11plus-maths-2024', 'Measurement', ARRAY[25, 26], 7),
('mod8', '11plus-maths-2024', 'Statistics', ARRAY[27, 28], 8),
('mod9', '11plus-maths-2024', 'Problem Solving Strategies', ARRAY[29, 30, 31, 32], 9),
('mod10', '11plus-maths-2024', 'Exam Technique', ARRAY[33, 34, 35, 36], 10);

-- Insert topics for Module 1 (Number & Place Value)
INSERT INTO public.bootcamp_topics (id, module_id, name, difficulty, skills, topic_order) VALUES
('npv1', 'mod1', 'Reading and Writing Large Numbers', 'foundation', ARRAY['number_recognition', 'place_value'], 1),
('npv2', 'mod1', 'Rounding Numbers', 'foundation', ARRAY['estimation', 'place_value'], 2),
('npv3', 'mod1', 'Comparing and Ordering', 'foundation', ARRAY['comparison', 'ordering'], 3),
('npv4', 'mod1', 'Roman Numerals', 'intermediate', ARRAY['conversion', 'historical_maths'], 4),
('npv5', 'mod1', 'Negative Numbers', 'intermediate', ARRAY['negative_numbers', 'temperature'], 5),
('npv6', 'mod1', 'Prime Numbers and Factors', 'advanced', ARRAY['prime_numbers', 'factorization'], 6),
('npv7', 'mod1', 'Square and Cube Numbers', 'advanced', ARRAY['powers', 'mental_maths'], 7),
('npv8', 'mod1', 'Prime Factorization', 'advanced', ARRAY['factorization', 'problem_solving'], 8);

-- Insert topics for Module 2 (Arithmetic Operations)
INSERT INTO public.bootcamp_topics (id, module_id, name, difficulty, skills, topic_order) VALUES
('ao1', 'mod2', 'Mental Addition and Subtraction', 'foundation', ARRAY['mental_maths', 'speed'], 1),
('ao2', 'mod2', 'Column Addition', 'foundation', ARRAY['written_methods', 'accuracy'], 2),
('ao3', 'mod2', 'Column Subtraction', 'foundation', ARRAY['written_methods', 'borrowing'], 3),
('ao4', 'mod2', 'Multiplication Tables', 'foundation', ARRAY['times_tables', 'recall'], 4),
('ao5', 'mod2', 'Short Multiplication', 'intermediate', ARRAY['multiplication', 'written_methods'], 5),
('ao6', 'mod2', 'Long Multiplication', 'intermediate', ARRAY['multiplication', 'complex_calculation'], 6),
('ao7', 'mod2', 'Division Methods', 'advanced', ARRAY['division', 'remainders'], 7),
('ao8', 'mod2', 'Order of Operations', 'advanced', ARRAY['bodmas', 'complex_calculation'], 8);

-- Insert topics for Module 3 (Fractions, Decimals & Percentages)
INSERT INTO public.bootcamp_topics (id, module_id, name, difficulty, skills, topic_order) VALUES
('fdp1', 'mod3', 'Understanding Fractions', 'foundation', ARRAY['fractions', 'visual_understanding'], 1),
('fdp2', 'mod3', 'Equivalent Fractions', 'foundation', ARRAY['fractions', 'equivalence'], 2),
('fdp3', 'mod3', 'Mixed Numbers', 'intermediate', ARRAY['fractions', 'conversion'], 3),
('fdp4', 'mod3', 'Adding and Subtracting Fractions', 'intermediate', ARRAY['fractions', 'operations'], 4),
('fdp5', 'mod3', 'Multiplying and Dividing Fractions', 'advanced', ARRAY['fractions', 'complex_operations'], 5),
('fdp6', 'mod3', 'Decimal Place Value', 'foundation', ARRAY['decimals', 'place_value'], 6),
('fdp7', 'mod3', 'Converting FDP', 'intermediate', ARRAY['conversion', 'relationships'], 7),
('fdp8', 'mod3', 'Percentage Calculations', 'advanced', ARRAY['percentages', 'problem_solving'], 8);

-- Insert topics for Module 4 (Ratio & Proportion)
INSERT INTO public.bootcamp_topics (id, module_id, name, difficulty, skills, topic_order) VALUES
('rp1', 'mod4', 'Understanding Ratio', 'intermediate', ARRAY['ratio', 'comparison'], 1),
('rp2', 'mod4', 'Simplifying Ratios', 'intermediate', ARRAY['ratio', 'simplification'], 2),
('rp3', 'mod4', 'Sharing in Ratios', 'advanced', ARRAY['ratio', 'division'], 3),
('rp4', 'mod4', 'Direct Proportion', 'advanced', ARRAY['proportion', 'scaling'], 4);

-- Insert topics for Module 5 (Algebra)
INSERT INTO public.bootcamp_topics (id, module_id, name, difficulty, skills, topic_order) VALUES
('alg1', 'mod5', 'Introduction to Algebra', 'intermediate', ARRAY['algebra', 'abstraction'], 1),
('alg2', 'mod5', 'Simplifying Expressions', 'intermediate', ARRAY['algebra', 'simplification'], 2),
('alg3', 'mod5', 'Simple Equations', 'advanced', ARRAY['algebra', 'equations'], 3),
('alg4', 'mod5', 'Sequences and Patterns', 'advanced', ARRAY['patterns', 'nth_term'], 4);

-- Insert topics for Module 6 (Geometry)
INSERT INTO public.bootcamp_topics (id, module_id, name, difficulty, skills, topic_order) VALUES
('geo1', 'mod6', '2D Shape Properties', 'foundation', ARRAY['shapes', 'properties'], 1),
('geo2', 'mod6', 'Perimeter', 'foundation', ARRAY['measurement', 'calculation'], 2),
('geo3', 'mod6', 'Area', 'intermediate', ARRAY['area', 'formulae'], 3),
('geo4', 'mod6', '3D Shapes', 'intermediate', ARRAY['3d_shapes', 'visualization'], 4),
('geo5', 'mod6', 'Volume', 'advanced', ARRAY['volume', '3d_calculation'], 5),
('geo6', 'mod6', 'Angles', 'intermediate', ARRAY['angles', 'measurement'], 6),
('geo7', 'mod6', 'Angle Calculations', 'advanced', ARRAY['angles', 'reasoning'], 7),
('geo8', 'mod6', 'Coordinates and Transformations', 'advanced', ARRAY['coordinates', 'transformations'], 8);

-- Insert topics for Module 7 (Measurement)
INSERT INTO public.bootcamp_topics (id, module_id, name, difficulty, skills, topic_order) VALUES
('meas1', 'mod7', 'Metric Units', 'foundation', ARRAY['units', 'conversion'], 1),
('meas2', 'mod7', 'Imperial Units', 'intermediate', ARRAY['imperial', 'conversion'], 2),
('meas3', 'mod7', 'Time', 'intermediate', ARRAY['time', 'calculation'], 3),
('meas4', 'mod7', 'Speed, Distance, Time', 'advanced', ARRAY['compound_measures', 'problem_solving'], 4);

-- Insert topics for Module 8 (Statistics)
INSERT INTO public.bootcamp_topics (id, module_id, name, difficulty, skills, topic_order) VALUES
('stat1', 'mod8', 'Data Representation', 'foundation', ARRAY['graphs', 'interpretation'], 1),
('stat2', 'mod8', 'Averages', 'intermediate', ARRAY['statistics', 'calculation'], 2),
('stat3', 'mod8', 'Data Analysis', 'advanced', ARRAY['analysis', 'comparison'], 3),
('stat4', 'mod8', 'Probability', 'advanced', ARRAY['probability', 'fractions'], 4);

-- Insert topics for Module 9 (Problem Solving Strategies)
INSERT INTO public.bootcamp_topics (id, module_id, name, difficulty, skills, topic_order) VALUES
('ps1', 'mod9', 'Word Problems', 'intermediate', ARRAY['comprehension', 'strategy'], 1),
('ps2', 'mod9', 'Working Backwards', 'advanced', ARRAY['reverse_thinking', 'logic'], 2),
('ps3', 'mod9', 'Pattern Problems', 'advanced', ARRAY['patterns', 'prediction'], 3),
('ps4', 'mod9', 'Logic Puzzles', 'advanced', ARRAY['logic', 'reasoning'], 4);

-- Insert topics for Module 10 (Exam Technique)
INSERT INTO public.bootcamp_topics (id, module_id, name, difficulty, skills, topic_order) VALUES
('ex1', 'mod10', 'Time Management', 'all', ARRAY['speed', 'efficiency'], 1),
('ex2', 'mod10', 'Common Mistakes', 'all', ARRAY['accuracy', 'awareness'], 2),
('ex3', 'mod10', 'Mental Strategies', 'all', ARRAY['mental_maths', 'shortcuts'], 3),
('ex4', 'mod10', 'Mock Exams', 'all', ARRAY['exam_practice', 'stamina'], 4);