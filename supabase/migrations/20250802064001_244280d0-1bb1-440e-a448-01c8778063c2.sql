-- Create curriculum content tables for structured learning materials

-- Main curriculum topics table
CREATE TABLE IF NOT EXISTS bootcamp_curriculum_topics (
    id TEXT PRIMARY KEY,
    topic_name TEXT NOT NULL,
    topic_order INTEGER NOT NULL DEFAULT 0,
    module_id TEXT REFERENCES bootcamp_modules(id),
    difficulty TEXT NOT NULL DEFAULT 'foundation',
    estimated_duration_minutes INTEGER DEFAULT 45,
    prerequisites TEXT[] DEFAULT '{}',
    learning_objectives TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Curriculum content stages (concept, practice, assessment, etc.)
CREATE TABLE IF NOT EXISTS bootcamp_curriculum_content (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    topic_id TEXT NOT NULL REFERENCES bootcamp_curriculum_topics(id) ON DELETE CASCADE,
    stage_type TEXT NOT NULL CHECK (stage_type IN ('concept_introduction', 'guided_practice', 'independent_practice', 'assessment')),
    stage_order INTEGER NOT NULL DEFAULT 0,
    title TEXT,
    description TEXT,
    content JSONB NOT NULL DEFAULT '{}',
    media_urls TEXT[] DEFAULT '{}',
    estimated_time_minutes INTEGER DEFAULT 10,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(topic_id, stage_type, stage_order)
);

-- Assessment questions table for detailed question management
CREATE TABLE IF NOT EXISTS bootcamp_curriculum_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    content_id UUID NOT NULL REFERENCES bootcamp_curriculum_content(id) ON DELETE CASCADE,
    question_text TEXT NOT NULL,
    question_type TEXT NOT NULL CHECK (question_type IN ('multiple_choice', 'numeric_entry', 'written_answer', 'drag_drop', 'matching')),
    question_order INTEGER NOT NULL DEFAULT 0,
    options JSONB DEFAULT '[]', -- For multiple choice options
    correct_answer TEXT,
    points INTEGER DEFAULT 1,
    difficulty TEXT DEFAULT 'medium',
    explanation TEXT,
    hints TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE bootcamp_curriculum_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE bootcamp_curriculum_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE bootcamp_curriculum_questions ENABLE ROW LEVEL SECURITY;

-- RLS Policies - Allow reading for authenticated users, admin control for writing
CREATE POLICY "Anyone can view curriculum topics" ON bootcamp_curriculum_topics FOR SELECT USING (true);
CREATE POLICY "Anyone can view curriculum content" ON bootcamp_curriculum_content FOR SELECT USING (true);
CREATE POLICY "Anyone can view curriculum questions" ON bootcamp_curriculum_questions FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert curriculum topics" ON bootcamp_curriculum_topics FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can insert curriculum content" ON bootcamp_curriculum_content FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can insert curriculum questions" ON bootcamp_curriculum_questions FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Create indexes for performance
CREATE INDEX idx_curriculum_topics_module ON bootcamp_curriculum_topics(module_id);
CREATE INDEX idx_curriculum_topics_order ON bootcamp_curriculum_topics(topic_order);
CREATE INDEX idx_curriculum_content_topic ON bootcamp_curriculum_content(topic_id);
CREATE INDEX idx_curriculum_content_stage ON bootcamp_curriculum_content(stage_type, stage_order);
CREATE INDEX idx_curriculum_questions_content ON bootcamp_curriculum_questions(content_id);
CREATE INDEX idx_curriculum_questions_order ON bootcamp_curriculum_questions(question_order);

-- Add triggers for updated_at timestamps
CREATE TRIGGER update_curriculum_topics_updated_at
    BEFORE UPDATE ON bootcamp_curriculum_topics
    FOR EACH ROW
    EXECUTE FUNCTION update_bootcamp_updated_at_column();

CREATE TRIGGER update_curriculum_content_updated_at
    BEFORE UPDATE ON bootcamp_curriculum_content
    FOR EACH ROW
    EXECUTE FUNCTION update_bootcamp_updated_at_column();

CREATE TRIGGER update_curriculum_questions_updated_at
    BEFORE UPDATE ON bootcamp_curriculum_questions
    FOR EACH ROW
    EXECUTE FUNCTION update_bootcamp_updated_at_column();