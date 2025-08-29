-- Phase 1: Enhanced Misconception Tracking Database Updates

-- Add confidence rating and misconception severity to student responses
ALTER TABLE bootcamp_student_responses 
ADD COLUMN confidence_rating DECIMAL(3,2) DEFAULT 0.5 CHECK (confidence_rating >= 0 AND confidence_rating <= 1),
ADD COLUMN misconception_severity TEXT CHECK (misconception_severity IN ('low', 'medium', 'high', 'critical'));

-- Add intervention mapping to misconceptions catalog
ALTER TABLE bootcamp_misconceptions_catalog
ADD COLUMN intervention_type TEXT DEFAULT 'explanation' CHECK (intervention_type IN ('explanation', 'worked_example', 'visual_aid', 'guided_practice')),
ADD COLUMN intervention_data JSONB DEFAULT '{}';

-- Create index for better performance on misconception queries
CREATE INDEX idx_student_responses_misconception ON bootcamp_student_responses(misconception_detected) WHERE misconception_detected IS NOT NULL;
CREATE INDEX idx_student_responses_confidence ON bootcamp_student_responses(confidence_rating);

-- Add confidence trend tracking to student progress
ALTER TABLE bootcamp_student_progress
ADD COLUMN confidence_trend DECIMAL[] DEFAULT '{}',
ADD COLUMN weak_misconceptions TEXT[] DEFAULT '{}',
ADD COLUMN last_confidence_update TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- Insert some sample misconception intervention data
INSERT INTO bootcamp_misconceptions_catalog (
    misconception_id, misconception_name, description, category, 
    intervention_type, intervention_data, remediation_strategy
) VALUES 
(
    'algebra_wrong_operation', 
    'Incorrect Algebraic Operation', 
    'Student applies wrong operation when solving algebraic equations',
    'algebra',
    'worked_example',
    '{"steps": ["Identify the operation needed", "Apply inverse operation", "Check solution"], "example": "If x + 5 = 12, subtract 5 from both sides"}',
    'Show step-by-step worked examples with clear operation identification'
),
(
    'fractions_denominator_add', 
    'Adding Denominators in Fraction Addition', 
    'Student incorrectly adds denominators when adding fractions',
    'fractions',
    'visual_aid',
    '{"visual_type": "fraction_bars", "explanation": "Visual fraction bars show why denominators stay the same"}',
    'Use visual fraction representations to show common denominators'
),
(
    'place_value_digit_confusion',
    'Place Value Digit Confusion',
    'Student confuses digit position values',
    'number_sense',
    'guided_practice',
    '{"practice_steps": ["Identify place value columns", "Practice with place value chart", "Apply to real numbers"]}',
    'Structured practice with place value charts and real examples'
)
ON CONFLICT (misconception_id) DO UPDATE SET
    intervention_type = EXCLUDED.intervention_type,
    intervention_data = EXCLUDED.intervention_data,
    remediation_strategy = EXCLUDED.remediation_strategy;