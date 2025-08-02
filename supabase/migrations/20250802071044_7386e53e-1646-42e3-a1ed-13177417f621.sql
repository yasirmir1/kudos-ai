-- Update existing curriculum content for Reading and Writing Large Numbers topic
UPDATE bootcamp_curriculum_content 
SET 
    content = '{
        "learning_objective": "Learn to read and write large numbers up to 10,000,000, understanding place value and how to write numbers in standard and word forms.",
        "key_example": "The number 5,203,014 is read as five million, two hundred three thousand, fourteen.",
        "concepts": [
            "Place value columns: ones, tens, hundreds, thousands, ten thousands, hundred thousands, millions",
            "Reading numbers from left to right using place value",
            "Writing numbers in word form using proper number names",
            "Understanding the importance of commas to separate groups of three digits"
        ],
        "visual_aids": [
            "Place value chart showing positions up to millions",
            "Examples of numbers written in both standard and word forms"
        ]
    }'::jsonb,
    estimated_time_minutes = 15,
    updated_at = now()
WHERE topic_id = 'npv1' AND stage_type = 'concept_introduction';

UPDATE bootcamp_curriculum_content 
SET 
    content = '{
        "activities": [
            {
                "type": "step_by_step",
                "title": "Reading Large Numbers",
                "steps": [
                    "Start from the left and identify the millions place",
                    "Read the millions group, then say million",
                    "Read the thousands group, then say thousand", 
                    "Read the ones group last"
                ],
                "example": "3,456,789 → three million, four hundred fifty-six thousand, seven hundred eighty-nine"
            },
            {
                "type": "interactive_exercise", 
                "title": "Place Value Practice",
                "description": "Identify the value of specific digits in large numbers",
                "examples": [
                    "In 2,847,193, what is the value of the digit 8? (Answer: 40,000)",
                    "In 6,205,431, what is the value of the digit 2? (Answer: 200,000)"
                ]
            }
        ]
    }'::jsonb,
    estimated_time_minutes = 20,
    updated_at = now()
WHERE topic_id = 'npv1' AND stage_type = 'guided_practice';

UPDATE bootcamp_curriculum_content 
SET 
    content = '{
        "exercises": [
            {
                "type": "conversion_practice",
                "title": "Standard to Word Form",
                "instruction": "Write these numbers in word form",
                "problems": [
                    "1,234,567",
                    "3,045,892", 
                    "7,600,003",
                    "9,087,245"
                ]
            },
            {
                "type": "conversion_practice", 
                "title": "Word to Standard Form",
                "instruction": "Write these numbers in standard form",
                "problems": [
                    "two million, five hundred thirty-four thousand, one hundred twenty-one",
                    "six million, forty thousand, seven hundred eight",
                    "eight million, nine hundred thousand, fifty-five"
                ]
            },
            {
                "type": "place_value_challenge",
                "title": "Digit Value Challenge", 
                "instruction": "Find the value of the underlined digit",
                "problems": [
                    "4,_3_27,891 (3 is underlined)", 
                    "1,582,_6_43 (6 is underlined)",
                    "_9_,234,567 (9 is underlined)"
                ]
            }
        ]
    }'::jsonb,
    estimated_time_minutes = 25,
    updated_at = now()
WHERE topic_id = 'npv1' AND stage_type = 'independent_practice';

UPDATE bootcamp_curriculum_content 
SET 
    content = '{
        "assessment_type": "mixed_questions",
        "time_limit_minutes": 15,
        "passing_score": 80,
        "questions": [
            {
                "id": 1,
                "type": "multiple_choice",
                "question": "What is 4,507,238 written in word form?",
                "options": [
                    "four million, five hundred seven thousand, two hundred thirty-eight",
                    "four thousand, five hundred seven, two hundred thirty-eight", 
                    "forty-five million, seven thousand, two hundred thirty-eight",
                    "four million, fifty-seven thousand, two hundred thirty-eight"
                ],
                "correct_answer": "A",
                "explanation": "Read each group of three digits separately: 4 million, 507 thousand, 238"
            },
            {
                "id": 2, 
                "type": "short_answer",
                "question": "Write eight million, three hundred four thousand, sixty-seven in standard form.",
                "correct_answer": "8,304,067",
                "explanation": "8 in millions place, 304 in thousands places, 067 in ones places"
            },
            {
                "id": 3,
                "type": "multiple_choice", 
                "question": "In the number 6,492,813, what is the value of the digit 9?",
                "options": ["9", "90", "900", "90,000"],
                "correct_answer": "D", 
                "explanation": "The 9 is in the ten-thousands place, so its value is 90,000"
            }
        ]
    }'::jsonb,
    estimated_time_minutes = 15,
    updated_at = now()
WHERE topic_id = 'npv1' AND stage_type = 'assessment';