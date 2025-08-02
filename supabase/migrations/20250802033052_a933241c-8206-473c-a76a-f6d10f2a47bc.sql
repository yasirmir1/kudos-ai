-- Triggers for Data Consistency and Automation

-- Function to update question statistics automatically
CREATE OR REPLACE FUNCTION bootcamp_update_question_statistics() 
RETURNS TRIGGER AS $$
BEGIN
    UPDATE bootcamp_enhanced_questions 
    SET usage_count = usage_count + 1,
        success_rate = (
            SELECT ROUND(AVG(CASE WHEN is_correct THEN 1 ELSE 0 END) * 100, 2)
            FROM bootcamp_enhanced_student_responses
            WHERE question_id = NEW.question_id
        )
    WHERE question_id = NEW.question_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update question stats when student responds
CREATE TRIGGER trigger_bootcamp_update_question_stats
AFTER INSERT ON bootcamp_enhanced_student_responses
FOR EACH ROW
EXECUTE FUNCTION bootcamp_update_question_statistics();

-- Function to automatically create student profile on user registration
CREATE OR REPLACE FUNCTION bootcamp_handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO bootcamp_students (user_id, email, username, created_at, last_active)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
        NOW(),
        NOW()
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create student profile on user registration
CREATE TRIGGER trigger_bootcamp_handle_new_user
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION bootcamp_handle_new_user();

-- Function to update student last active timestamp
CREATE OR REPLACE FUNCTION bootcamp_update_last_active()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE bootcamp_students
    SET last_active = CURRENT_TIMESTAMP
    WHERE student_id = NEW.student_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update last active on any student activity
CREATE TRIGGER trigger_bootcamp_update_last_active
AFTER INSERT ON bootcamp_enhanced_student_responses
FOR EACH ROW
EXECUTE FUNCTION bootcamp_update_last_active();

-- Sample Data for the Enhanced Bootcamp System

-- Insert sample modules
INSERT INTO bootcamp_enhanced_modules (module_id, module_name, module_order, weeks_allocated, description) VALUES
('MOD001', 'Number & Place Value', 1, 4, 'Understanding numbers, place value, and number operations'),
('MOD002', 'Arithmetic Operations', 2, 4, 'Addition, subtraction, multiplication, and division strategies'),
('MOD003', 'Fractions, Decimals & Percentages', 3, 4, 'Working with fractions, decimals, and percentage conversions'),
('MOD004', 'Ratio & Proportion', 4, 2, 'Understanding ratios, proportions, and scaling'),
('MOD005', 'Algebra Basics', 5, 4, 'Introduction to algebraic thinking and expressions'),
('MOD006', 'Geometry & Shapes', 6, 6, 'Properties of shapes, angles, and spatial reasoning'),
('MOD007', 'Measurement', 7, 2, 'Units, conversions, and practical measurement skills'),
('MOD008', 'Data & Statistics', 8, 2, 'Reading graphs, averages, and basic probability'),
('MOD009', 'Problem Solving', 9, 4, 'Strategic problem-solving approaches and techniques'),
('MOD010', 'Exam Technique', 10, 4, 'Test-taking strategies and time management')
ON CONFLICT (module_id) DO NOTHING;

-- Insert sample topics
INSERT INTO bootcamp_enhanced_topics (topic_id, module_id, topic_name, topic_order, difficulty_level, estimated_questions) VALUES
('TOP001', 'MOD001', 'Place Value to 1,000,000', 1, 'foundation', 25),
('TOP002', 'MOD001', 'Rounding Numbers', 2, 'foundation', 20),
('TOP003', 'MOD001', 'Negative Numbers', 3, 'intermediate', 30),
('TOP004', 'MOD002', 'Mental Addition & Subtraction', 1, 'foundation', 35),
('TOP005', 'MOD002', 'Written Methods', 2, 'intermediate', 40),
('TOP006', 'MOD002', 'BODMAS Order', 3, 'intermediate', 25),
('TOP007', 'MOD003', 'Equivalent Fractions', 1, 'foundation', 30),
('TOP008', 'MOD003', 'Adding & Subtracting Fractions', 2, 'intermediate', 35),
('TOP009', 'MOD003', 'Decimal Place Value', 3, 'foundation', 25),
('TOP010', 'MOD004', 'Understanding Ratios', 1, 'intermediate', 20)
ON CONFLICT (topic_id) DO NOTHING;

-- Insert sample misconceptions
INSERT INTO bootcamp_enhanced_misconceptions (misconception_code, misconception_type, description, diagnostic_indicators, remediation_pathway_id) VALUES
('PV001', 'Place Value', 'Confusion about digit position and value', ARRAY['Misreads large numbers', 'Incorrect rounding'], 'PATH001'),
('FR001', 'Fractions', 'Adding denominators when adding fractions', ARRAY['Adds denominators directly', 'Treats fractions as separate numbers'], 'PATH002'),
('OP001', 'Operations', 'Confusion about operation order', ARRAY['Ignores BODMAS', 'Left-to-right only'], 'PATH003'),
('DEC001', 'Decimals', 'Misunderstanding decimal place value', ARRAY['Treats decimals as whole numbers', 'Alignment errors'], 'PATH004'),
('NEG001', 'Negative Numbers', 'Confusion with negative number operations', ARRAY['Addition/subtraction errors', 'Number line confusion'], 'PATH005')
ON CONFLICT (misconception_code) DO NOTHING;

-- Insert sample remediation pathways
INSERT INTO bootcamp_enhanced_remediation_pathways (pathway_id, misconception_code, pathway_name, stages, estimated_duration_days, success_rate) VALUES
('PATH001', 'PV001', 'Place Value Mastery', 
    '{"stages": [
        {"step": 1, "activity": "place_value_charts", "success_criteria": "90% accuracy"},
        {"step": 2, "activity": "number_expansion", "success_criteria": "85% accuracy"},
        {"step": 3, "activity": "practical_applications", "success_criteria": "80% accuracy"}
    ]}'::jsonb, 
    7, 85.5),
('PATH002', 'FR001', 'Fraction Operations Foundation',
    '{"stages": [
        {"step": 1, "activity": "visual_fraction_models", "success_criteria": "understand_concept"},
        {"step": 2, "activity": "equivalent_fractions", "success_criteria": "85% accuracy"},
        {"step": 3, "activity": "addition_practice", "success_criteria": "80% accuracy"}
    ]}'::jsonb,
    10, 78.2)
ON CONFLICT (pathway_id) DO NOTHING;