-- Import complete curriculum content from GitHub into bootcamp_curriculum_content table
-- Fetching content from: https://raw.githubusercontent.com/yasirmir1/Kudos2/4fe39ea2af709dbce6133499316c399461687647/complete-curriculum-content.json

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
      "id": "npv1",
      "topic_name": "Reading and Writing Large Numbers",
      "topic_order": 1,
      "module_id": "mod1",
      "difficulty": "foundation",
      "estimated_duration_minutes": 45,
      "prerequisites": [],
      "learning_objectives": [
        "Read numbers up to 1,000,000 in figures and words",
        "Write numbers up to 1,000,000 in figures and words",
        "Understand place value in large numbers",
        "Use commas correctly in large numbers"
      ]
    },
    {
      "id": "npv2",
      "topic_name": "Place Value and Number Properties",
      "topic_order": 2,
      "module_id": "mod1",
      "difficulty": "foundation",
      "estimated_duration_minutes": 50,
      "prerequisites": ["npv1"],
      "learning_objectives": [
        "Identify the value of digits in different positions",
        "Round numbers to the nearest 10, 100, 1000",
        "Order and compare large numbers",
        "Understand odd, even, and prime numbers"
      ]
    }
  ],
  "curriculum_content": [
    {
      "topic_id": "npv1",
      "stage_type": "concept_introduction",
      "stage_order": 1,
      "title": "Understanding Large Numbers",
      "description": "Learn to read and write numbers up to 1,000,000",
      "estimated_time_minutes": 15,
      "content": {
        "learning_objective": "Master reading and writing large numbers confidently",
        "introduction": "Large numbers are everywhere around us - from population counts to distances in space. Learning to read and write them correctly is essential for mathematical success.",
        "concepts": [
          "Numbers are made up of digits in different place values",
          "Each position represents a power of 10",
          "Commas separate groups of three digits for easier reading",
          "The word form follows specific patterns"
        ],
        "key_example": "The number 456,789 is read as four hundred and fifty-six thousand, seven hundred and eighty-nine",
        "real_world_connections": [
          "Population of cities and countries",
          "Distances between planets",
          "Company profits and losses",
          "Historical dates and timelines"
        ]
      }
    },
    {
      "topic_id": "npv1",
      "stage_type": "guided_practice",
      "stage_order": 2,
      "title": "Step-by-Step Number Reading",
      "description": "Practice reading large numbers with guidance",
      "estimated_time_minutes": 15,
      "content": {
        "learning_objective": "Apply systematic approach to reading large numbers",
        "introduction": "Now lets practice reading large numbers step by step. We will break down the process into manageable chunks.",
        "step_by_step_examples": [
          {
            "title": "Reading 234,567",
            "problem": "Read the number 234,567 in words",
            "steps": [
              {
                "step_number": 1,
                "instruction": "Identify the thousands and units",
                "working": "234 thousands, 567 units",
                "explanation": "Split at the comma to see separate groups"
              },
              {
                "step_number": 2,
                "instruction": "Read the thousands part",
                "working": "Two hundred and thirty-four thousand",
                "explanation": "Read 234 as normal, then add thousand"
              },
              {
                "step_number": 3,
                "instruction": "Read the units part",
                "working": "Five hundred and sixty-seven",
                "explanation": "Read 567 as a normal three-digit number"
              }
            ],
            "final_answer": "Two hundred and thirty-four thousand, five hundred and sixty-seven",
            "explanation": "Combine both parts with proper conjunction"
          }
        ],
        "interactive_elements": [
          {
            "type": "drag-drop",
            "question": "Drag the correct word parts to form: 567,234",
            "correct_answer": "Five hundred and sixty-seven thousand, two hundred and thirty-four",
            "feedback": "Great! You correctly identified the thousands and units parts."
          }
        ],
        "checkpoints": [
          {
            "question": "What is 123,456 in words?",
            "correct_answer": "One hundred and twenty-three thousand, four hundred and fifty-six",
            "explanation": "Break it into 123 thousands and 456 units, then combine."
          }
        ]
      }
    },
    {
      "topic_id": "npv1",
      "stage_type": "independent_practice",
      "stage_order": 3,
      "title": "Practice Reading and Writing",
      "description": "Independent practice exercises",
      "estimated_time_minutes": 10,
      "content": {
        "learning_objective": "Demonstrate mastery of reading and writing large numbers",
        "introduction": "Time to practice on your own! Work through these exercises at your own pace.",
        "practice_problems": [
          {
            "id": "npv1_ip_1",
            "question": "Write 345,678 in words",
            "type": "short-answer",
            "correct_answer": "Three hundred and forty-five thousand, six hundred and seventy-eight",
            "explanation": "345 thousands + 678 units",
            "difficulty": "easy"
          },
          {
            "id": "npv1_ip_2",
            "question": "Write in figures: Two hundred and thirty-four thousand, five hundred and sixty-seven",
            "type": "short-answer",
            "correct_answer": "234,567",
            "explanation": "234 thousands + 567 units = 234,567",
            "difficulty": "medium"
          }
        ],
        "hints": [
          {
            "problem_id": "npv1_ip_1",
            "hints": [
              "Break the number at the comma",
              "Read the first part as thousands",
              "Read the second part as normal"
            ]
          }
        ],
        "self_check_questions": [
          "Can you read any 6-digit number confidently?",
          "Do you know where to place commas?",
          "Can you convert between figures and words?"
        ]
      }
    },
    {
      "topic_id": "npv1",
      "stage_type": "assessment",
      "stage_order": 4,
      "title": "Number Reading and Writing Assessment",
      "description": "Check your understanding",
      "estimated_time_minutes": 5,
      "content": {
        "learning_objective": "Demonstrate complete mastery of reading and writing large numbers",
        "introduction": "Lets check how well you have mastered reading and writing large numbers.",
        "questions": [
          {
            "id": "npv1_assess_1",
            "question": "What is 456,789 in words?",
            "type": "multiple-choice",
            "options": [
              "Four hundred and fifty-six thousand, seven hundred and eighty-nine",
              "Four hundred and fifty-six, seven hundred and eighty-nine",
              "Forty-five thousand, six hundred and seventy-eight, nine",
              "Four million, five hundred and sixty-seven thousand, eight hundred and ninety"
            ],
            "correct_answer": "Four hundred and fifty-six thousand, seven hundred and eighty-nine",
            "explanation": "456 thousands plus 789 units",
            "points": 2
          },
          {
            "id": "npv1_assess_2",
            "question": "Write in figures: Three hundred and twenty-one thousand, six hundred and fifty-four",
            "type": "fill-blank",
            "correct_answer": "321,654",
            "explanation": "321 thousands + 654 units with comma placement",
            "points": 2
          }
        ],
        "passing_criteria": {
          "minimum_score": 3,
          "total_questions": 2
        },
        "feedback_messages": {
          "excellent": "Outstanding! You have mastered reading and writing large numbers.",
          "good": "Well done! You show good understanding of large numbers.",
          "needs_improvement": "You need more practice with large numbers. Review the examples and try again."
        }
      }
    }
  ]
}'::jsonb);

-- Verify the import was successful
SELECT COUNT(*) as total_content_imported FROM bootcamp_curriculum_content;
SELECT COUNT(*) as total_topics_imported FROM bootcamp_curriculum_topics;