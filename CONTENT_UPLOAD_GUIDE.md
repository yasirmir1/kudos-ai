# Learning Content Upload System

This system provides a structured way to create and upload learning content to your Supabase bootcamp database.

## Files Created

1. **`database-upload-content.json`** - Example content in database-ready format
2. **`upload-content.sql`** - Direct SQL insertion script  
3. **`upload-content.js`** - Node.js script for programmatic uploading
4. **`learning-content-structure.json`** - Complete structure reference

## Database Schema

### `bootcamp_curriculum_topics` Table
- **id**: Unique topic identifier (e.g., "npv1")
- **topic_name**: Human-readable topic name
- **topic_order**: Order within module
- **module_id**: Parent module reference
- **difficulty**: "foundation", "intermediate", or "advanced"
- **estimated_duration_minutes**: Total time for topic
- **prerequisites**: Array of prerequisite topic IDs
- **learning_objectives**: Array of learning goals

### `bootcamp_curriculum_content` Table
- **topic_id**: References topic ID
- **stage_type**: "concept_introduction", "guided_practice", "independent_practice", "assessment"
- **stage_order**: Order within topic (1-4)
- **title**: Stage title
- **description**: Stage description
- **estimated_time_minutes**: Time for this stage
- **content**: JSONB with stage-specific content
- **media_urls**: Array of media file paths (optional)

## Content Structure by Stage Type

### 1. Concept Introduction (`concept_introduction`)
```json
{
  "learning_objective": "What students will learn",
  "introduction": "Engaging introduction text",
  "concepts": ["Key concept 1", "Key concept 2"],
  "key_example": "Main example to illustrate concept",
  "visual_aids": ["Description of visual aid 1"],
  "real_world_connections": ["Application 1", "Application 2"]
}
```

### 2. Guided Practice (`guided_practice`)
```json
{
  "introduction": "Practice introduction",
  "activities": [
    {
      "title": "Activity name",
      "type": "step_by_step",
      "example": "Example problem",
      "steps": ["Step 1", "Step 2"],
      "description": "Activity description"
    }
  ],
  "checkpoints": [
    {
      "question": "Check understanding question",
      "answer": "Correct answer",
      "explanation": "Why this is correct"
    }
  ]
}
```

### 3. Independent Practice (`independent_practice`)
```json
{
  "introduction": "Independent practice intro",
  "exercises": [
    {
      "title": "Exercise name",
      "instruction": "What to do",
      "problems": ["Problem 1", "Problem 2"]
    }
  ],
  "self_check": ["Self-assessment question 1"],
  "extensions": ["Extension activity 1"]
}
```

### 4. Assessment (`assessment`)
```json
{
  "introduction": "Assessment introduction",
  "assessment_questions": [
    {
      "id": "q1",
      "question": "Question text",
      "type": "multiple_choice" | "text_entry",
      "options": ["A", "B", "C", "D"], // For multiple choice
      "correct_answer": "Correct answer",
      "points": 2,
      "explanation": "Explanation of answer"
    }
  ],
  "success_criteria": {
    "passing_score": 80,
    "total_points": 10,
    "minimum_correct": 8
  },
  "feedback": {
    "excellent": "High score message",
    "good": "Good score message", 
    "needs_work": "Low score message"
  }
}
```

## Upload Methods

### Method 1: Direct SQL (Recommended for one-time uploads)

1. Edit `upload-content.sql` with your content
2. Run in Supabase SQL Editor:
```sql
-- Copy and paste the SQL content
```

### Method 2: Node.js Script (Recommended for batch uploads)

1. Install dependencies:
```bash
npm install @supabase/supabase-js
```

2. Update service role key in `upload-content.js`:
```javascript
const SUPABASE_SERVICE_KEY = 'your_service_role_key_here';
```

3. Run the script:
```bash
# Upload specific file
node upload-content.js database-upload-content.json

# Generate template
node upload-content.js --template
```

### Method 3: JSON + Manual Insert

1. Create content using `database-upload-content.json` as template
2. Use Supabase dashboard to insert records manually

## Content Creation Workflow

1. **Plan Your Topic**
   - Define learning objectives
   - Break into 4 stages
   - Estimate time requirements

2. **Create JSON Structure**
   - Start with template
   - Fill in topic details
   - Add stage-specific content

3. **Validate Content**
   - Check required fields
   - Verify JSON structure
   - Test content flow

4. **Upload to Database**
   - Choose upload method
   - Run upload script/SQL
   - Verify in database

5. **Test in Application**
   - Navigate to bootcamp section
   - Open topic learning modal
   - Test all 4 stages

## Content Guidelines

### Writing Effective Content

- **Introductions**: Engaging, clear, age-appropriate
- **Examples**: Concrete, relatable, progressive difficulty
- **Instructions**: Step-by-step, actionable
- **Questions**: Clear, unambiguous, properly formatted
- **Feedback**: Encouraging, informative, helpful

### Technical Considerations

- **JSON Escaping**: Use double quotes, escape single quotes as `''`
- **Array Format**: Use proper JSON array syntax
- **File Paths**: Use relative paths for media files
- **IDs**: Use consistent, meaningful identifiers

## Troubleshooting

### Common Issues

1. **JSON Syntax Errors**: Validate JSON before uploading
2. **Missing Required Fields**: Check schema requirements
3. **Foreign Key Errors**: Ensure topic exists before adding content
4. **RLS Policies**: Use service role key for uploads

### Debugging

1. Check Supabase logs for detailed error messages
2. Validate JSON structure with online tools
3. Test uploads with small batches first
4. Verify database schema matches expectations

## Example Usage

```bash
# Create new content file
cp database-upload-content.json my-topic-content.json

# Edit content for your topic
# ... edit JSON content ...

# Upload to database
node upload-content.js my-topic-content.json
```

This system provides a robust, scalable way to manage learning content for your bootcamp application!