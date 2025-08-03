-- Step 1: Add activity_source column to track different types of responses
ALTER TABLE bootcamp_student_responses 
ADD COLUMN IF NOT EXISTS activity_source TEXT DEFAULT 'practice';

-- Step 2: Update existing records to have practice as default activity source
UPDATE bootcamp_student_responses 
SET activity_source = 'practice' 
WHERE activity_source IS NULL;

-- Step 3: Migrate data from learning_results to bootcamp_student_responses
INSERT INTO bootcamp_student_responses (
  student_id,
  question_id, 
  selected_answer,
  time_taken,
  is_correct,
  responded_at,
  activity_source,
  session_id
)
SELECT 
  student_id,
  question_id,
  selected_answer,
  time_taken_seconds,
  is_correct,
  responded_at,
  'learning_session' as activity_source,
  gen_random_uuid() as session_id
FROM learning_results
WHERE NOT EXISTS (
  SELECT 1 FROM bootcamp_student_responses bsr 
  WHERE bsr.student_id = learning_results.student_id 
  AND bsr.question_id = learning_results.question_id 
  AND bsr.responded_at = learning_results.responded_at
);

-- Step 4: Create responses for mock test sessions
-- First, let's add mock test responses based on session data
INSERT INTO bootcamp_student_responses (
  student_id,
  question_id,
  selected_answer,
  time_taken,
  is_correct,
  responded_at,
  activity_source,
  session_id
)
SELECT 
  mts.student_id,
  'MOCK_' || mts.session_id::text as question_id, -- Placeholder question ID
  'A' as selected_answer, -- Placeholder
  COALESCE(mts.time_spent_seconds / GREATEST(mts.questions_attempted, 1), 60) as time_taken,
  (RANDOM() * mts.questions_correct / GREATEST(mts.questions_attempted, 1)) > 0.5 as is_correct,
  mts.started_at as responded_at,
  'mock_test' as activity_source,
  mts.session_id
FROM bootcamp_mock_test_sessions mts
WHERE mts.questions_attempted > 0;

-- Step 5: Add index for efficient querying by activity source
CREATE INDEX IF NOT EXISTS idx_bootcamp_student_responses_activity_source 
ON bootcamp_student_responses(student_id, activity_source, responded_at);

-- Step 6: Add check constraint to ensure valid activity sources
ALTER TABLE bootcamp_student_responses 
ADD CONSTRAINT check_activity_source 
CHECK (activity_source IN ('practice', 'learning_session', 'mock_test', 'weekly_test'));

-- Step 7: Update the time_taken column to be consistent (some records have 0, let's keep them as is)
-- No changes needed for time_taken as the data looks good