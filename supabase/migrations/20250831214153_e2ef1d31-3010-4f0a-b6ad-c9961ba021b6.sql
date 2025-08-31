-- Create misconception processing queue for batch API calls
CREATE TABLE public.bootcamp_misconception_queue (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL,
    question_id TEXT NOT NULL,
    student_answer TEXT NOT NULL,
    correct_answer TEXT NOT NULL,
    misconception_code TEXT,
    priority INTEGER DEFAULT 1,
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    processed_at TIMESTAMP WITH TIME ZONE,
    retry_count INTEGER DEFAULT 0
);

-- Create pattern cache for local misconception detection
CREATE TABLE public.bootcamp_misconception_patterns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pattern_key TEXT UNIQUE NOT NULL,
    pattern_data JSONB NOT NULL,
    hit_count INTEGER DEFAULT 0,
    last_used TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create explanation cache for API response caching
CREATE TABLE public.bootcamp_explanation_cache (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cache_key TEXT UNIQUE NOT NULL,
    explanation TEXT NOT NULL,
    api_source TEXT,
    usage_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_accessed TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enhanced answer options with misconception detection
ALTER TABLE bootcamp_answer_options 
ADD COLUMN IF NOT EXISTS detection_confidence DECIMAL(3,2) DEFAULT 0.0,
ADD COLUMN IF NOT EXISTS pattern_rules JSONB DEFAULT '{}';

-- Indexes for performance (skip if exists)
CREATE INDEX IF NOT EXISTS idx_misconception_queue_status ON bootcamp_misconception_queue(status, priority);
CREATE INDEX IF NOT EXISTS idx_misconception_patterns_key ON bootcamp_misconception_patterns(pattern_key);
CREATE INDEX IF NOT EXISTS idx_explanation_cache_key ON bootcamp_explanation_cache(cache_key);

-- Enable RLS
ALTER TABLE bootcamp_misconception_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE bootcamp_misconception_patterns ENABLE ROW LEVEL SECURITY;
ALTER TABLE bootcamp_explanation_cache ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can access their own misconception queue" 
ON bootcamp_misconception_queue FOR ALL 
USING (student_id IN (
    SELECT student_id FROM bootcamp_students 
    WHERE user_id = auth.uid()
));

CREATE POLICY "Anyone can view misconception patterns" 
ON bootcamp_misconception_patterns FOR SELECT 
USING (true);

CREATE POLICY "System can manage patterns" 
ON bootcamp_misconception_patterns FOR ALL 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Anyone can view explanation cache" 
ON bootcamp_explanation_cache FOR SELECT 
USING (true);

CREATE POLICY "System can manage explanation cache" 
ON bootcamp_explanation_cache FOR ALL 
USING (auth.uid() IS NOT NULL);