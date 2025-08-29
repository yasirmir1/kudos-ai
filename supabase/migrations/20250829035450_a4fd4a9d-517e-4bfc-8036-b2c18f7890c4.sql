-- Simplified Phase 1: Only add columns that don't exist yet

-- Check if confidence_rating column exists, if not add it
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='bootcamp_student_responses' 
                   AND column_name='confidence_rating') THEN
        ALTER TABLE bootcamp_student_responses 
        ADD COLUMN confidence_rating DECIMAL(3,2) DEFAULT 0.5 
        CHECK (confidence_rating >= 0 AND confidence_rating <= 1);
    END IF;
END $$;

-- Check if misconception_severity column exists, if not add it
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='bootcamp_student_responses' 
                   AND column_name='misconception_severity') THEN
        ALTER TABLE bootcamp_student_responses 
        ADD COLUMN misconception_severity TEXT 
        CHECK (misconception_severity IN ('low', 'medium', 'high', 'critical'));
    END IF;
END $$;

-- Check if intervention columns exist in misconceptions catalog
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='bootcamp_misconceptions_catalog' 
                   AND column_name='intervention_type') THEN
        ALTER TABLE bootcamp_misconceptions_catalog
        ADD COLUMN intervention_type TEXT DEFAULT 'explanation',
        ADD COLUMN intervention_data JSONB DEFAULT '{}';
    END IF;
END $$;

-- Check if confidence trend columns exist in progress table
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='bootcamp_student_progress' 
                   AND column_name='confidence_trend') THEN
        ALTER TABLE bootcamp_student_progress
        ADD COLUMN confidence_trend DECIMAL[] DEFAULT '{}',
        ADD COLUMN weak_misconceptions TEXT[] DEFAULT '{}',
        ADD COLUMN last_confidence_update TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
    END IF;
END $$;

-- Create indexes for better performance (only if they don't exist)
CREATE INDEX IF NOT EXISTS idx_student_responses_misconception 
ON bootcamp_student_responses(misconception_detected) 
WHERE misconception_detected IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_student_responses_confidence 
ON bootcamp_student_responses(confidence_rating);