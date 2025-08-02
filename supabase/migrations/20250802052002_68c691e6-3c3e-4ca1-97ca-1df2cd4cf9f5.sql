-- Create missing bootcamp_ prefixed tables based on the provided schema

-- bootcamp_answer_options table
CREATE TABLE bootcamp_answer_options (
    answer_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question_id VARCHAR(20) NOT NULL,
    option_letter CHAR(1) CHECK (option_letter IN ('A', 'B', 'C', 'D')),
    answer_value TEXT NOT NULL,
    is_correct BOOLEAN DEFAULT FALSE,
    misconception_code VARCHAR(10),
    error_category VARCHAR(10),
    diagnostic_feedback TEXT,
    remedial_topic VARCHAR(50),
    selection_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(question_id, option_letter)
);

-- bootcamp_misconceptions table (standardized version)
CREATE TABLE bootcamp_misconceptions (
    misconception_code VARCHAR(10) PRIMARY KEY,
    misconception_type VARCHAR(50),
    description TEXT,
    diagnostic_indicators TEXT[],
    remediation_pathway_id VARCHAR(20),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- bootcamp_remediation_pathways table
CREATE TABLE bootcamp_remediation_pathways (
    pathway_id VARCHAR(20) PRIMARY KEY,
    misconception_code VARCHAR(10),
    pathway_name VARCHAR(100),
    stages JSONB, -- Stores the structured pathway with activities and criteria
    estimated_duration_days INTEGER,
    success_rate DECIMAL(5,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- bootcamp_achievements table
CREATE TABLE bootcamp_achievements (
    achievement_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL,
    achievement_type VARCHAR(50),
    achievement_name VARCHAR(100),
    earned_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    points_awarded INTEGER,
    badge_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- bootcamp_adaptive_recommendations table
CREATE TABLE bootcamp_adaptive_recommendations (
    recommendation_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL,
    generated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    recommendation_type VARCHAR(30), -- practice_set, intervention, challenge
    priority INTEGER,
    content JSONB, -- Stores question IDs, topics, and rationale
    expires_at TIMESTAMP WITH TIME ZONE,
    completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add foreign key constraint for remediation pathways
ALTER TABLE bootcamp_remediation_pathways 
ADD CONSTRAINT fk_remediation_misconception 
FOREIGN KEY (misconception_code) REFERENCES bootcamp_misconceptions(misconception_code);

-- Create indexes for performance
CREATE INDEX idx_bootcamp_answer_options_question ON bootcamp_answer_options(question_id);
CREATE INDEX idx_bootcamp_achievements_student ON bootcamp_achievements(student_id);
CREATE INDEX idx_bootcamp_achievements_type ON bootcamp_achievements(achievement_type);
CREATE INDEX idx_bootcamp_adaptive_recommendations_student ON bootcamp_adaptive_recommendations(student_id);
CREATE INDEX idx_bootcamp_adaptive_recommendations_type ON bootcamp_adaptive_recommendations(recommendation_type);
CREATE INDEX idx_bootcamp_remediation_pathways_misconception ON bootcamp_remediation_pathways(misconception_code);

-- Add RLS policies for bootcamp_answer_options
ALTER TABLE bootcamp_answer_options ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view bootcamp answer options"
ON bootcamp_answer_options FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can add bootcamp answer options"
ON bootcamp_answer_options FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

-- Add RLS policies for bootcamp_misconceptions
ALTER TABLE bootcamp_misconceptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view bootcamp misconceptions"
ON bootcamp_misconceptions FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can add bootcamp misconceptions"
ON bootcamp_misconceptions FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

-- Add RLS policies for bootcamp_remediation_pathways
ALTER TABLE bootcamp_remediation_pathways ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view bootcamp remediation pathways"
ON bootcamp_remediation_pathways FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can add bootcamp remediation pathways"
ON bootcamp_remediation_pathways FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

-- Add RLS policies for bootcamp_achievements
ALTER TABLE bootcamp_achievements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own bootcamp achievements"
ON bootcamp_achievements FOR SELECT
USING (student_id IN (SELECT student_id FROM bootcamp_students WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert their own bootcamp achievements"
ON bootcamp_achievements FOR INSERT
WITH CHECK (student_id IN (SELECT student_id FROM bootcamp_students WHERE user_id = auth.uid()));

-- Add RLS policies for bootcamp_adaptive_recommendations
ALTER TABLE bootcamp_adaptive_recommendations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own bootcamp recommendations"
ON bootcamp_adaptive_recommendations FOR SELECT
USING (student_id IN (SELECT student_id FROM bootcamp_students WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert their own bootcamp recommendations"
ON bootcamp_adaptive_recommendations FOR INSERT
WITH CHECK (student_id IN (SELECT student_id FROM bootcamp_students WHERE user_id = auth.uid()));

CREATE POLICY "Users can update their own bootcamp recommendations"
ON bootcamp_adaptive_recommendations FOR UPDATE
USING (student_id IN (SELECT student_id FROM bootcamp_students WHERE user_id = auth.uid()));

-- Add trigger for updated_at on bootcamp_remediation_pathways
CREATE TRIGGER update_bootcamp_remediation_pathways_updated_at
    BEFORE UPDATE ON bootcamp_remediation_pathways
    FOR EACH ROW
    EXECUTE FUNCTION update_bootcamp_updated_at_column();