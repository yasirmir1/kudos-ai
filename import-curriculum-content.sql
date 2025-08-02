// Script to import complete curriculum content from GitHub
// Save this content to a file and run it in your Supabase SQL editor

-- First, let's get the current JSON content from your GitHub and import it
-- You'll need to copy the complete content from: 
-- https://raw.githubusercontent.com/yasirmir1/Kudos2/4fe39ea2af709dbce6133499316c399461687647/complete-curriculum-content.json

-- Example of how to use the function:
-- SELECT import_complete_curriculum_content('[YOUR_JSON_CONTENT_HERE]'::jsonb);

-- For now, let's import a sample of the content to test the function
SELECT import_complete_curriculum_content('{
  "curriculum_metadata": {
    "version": "1.0",
    "total_topics": 56,
    "total_subtopics": 220,
    "created_date": "2024-01-15",
    "curriculum_name": "11+ Mathematics Complete Course"
  },
  "curriculum_topics": [
    {
      "id": "npv3",
      "topic_name": "Comparing and Ordering",
      "topic_order": 3,
      "module_id": "mod1",
      "difficulty": "foundation",
      "estimated_duration_minutes": 55,
      "prerequisites": ["place_value", "number_recognition"],
      "learning_objectives": [
        "Use comparison symbols <, >, =",
        "Order large numbers from smallest to largest",
        "Position numbers on a number line",
        "Compare numbers with different digits"
      ]
    },
    {
      "id": "npv4",
      "topic_name": "Roman Numerals",
      "topic_order": 4,
      "module_id": "mod1",
      "difficulty": "intermediate",
      "estimated_duration_minutes": 70,
      "prerequisites": ["number_recognition"],
      "learning_objectives": [
        "Read Roman numerals up to 1000 (M)",
        "Convert between Roman and Arabic numerals",
        "Understand the rules of Roman numeral formation",
        "Apply Roman numerals in real contexts"
      ]
    }
  ],
  "curriculum_content": [
    {
      "topic_id": "npv3",
      "stage_type": "concept_introduction",
      "stage_order": 1,
      "title": "Understanding Comparison",
      "description": "Learn how to compare and order large numbers",
      "estimated_time_minutes": 15,
      "content": {
        "learning_objective": "Master the skills of comparing and ordering numbers",
        "introduction": "Comparing numbers is like being a detective - you need to look carefully at each digit to solve the puzzle!",
        "concepts": [
          "Start comparing from the left (highest place value)",
          "If digits are the same, move to the next place value",
          "Use symbols: > (greater than), < (less than), = (equal to)",
          "Line up place values when comparing"
        ],
        "key_example": "Compare 45,678 and 45,698: Look at thousands (same), hundreds (same), tens (7 vs 9), so 45,678 < 45,698",
        "real_world_connections": [
          "Comparing prices when shopping",
          "Ranking sports scores",
          "Organizing data by size",
          "Population comparisons"
        ]
      }
    }
  ]
}'::jsonb);

-- Check if the import was successful
SELECT * FROM bootcamp_curriculum_topics WHERE id IN ('npv3', 'npv4');
SELECT * FROM bootcamp_curriculum_content WHERE topic_id = 'npv3';