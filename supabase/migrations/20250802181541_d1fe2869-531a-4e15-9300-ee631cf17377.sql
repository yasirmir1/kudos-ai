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
      "estimated_duration_minutes": 75,
      "prerequisites": ["place_value", "counting"],
      "learning_objectives": [
        "Read numbers up to 10 million",
        "Write numbers up to 10 million in digits and words",
        "Understand place value in large numbers",
        "Compare and order large numbers"
      ]
    },
    {
      "id": "npv2",
      "topic_name": "Rounding Numbers",
      "topic_order": 2,
      "module_id": "mod1",
      "difficulty": "foundation",
      "estimated_duration_minutes": 60,
      "prerequisites": ["place_value", "number_line"],
      "learning_objectives": [
        "Round numbers to nearest 10, 100, 1000, 10000",
        "Understand when to round up or down",
        "Apply rounding in real-world contexts",
        "Estimate using rounding"
      ]
    },
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
    },
    {
      "id": "npv5",
      "topic_name": "Negative Numbers",
      "topic_order": 5,
      "module_id": "mod1",
      "difficulty": "intermediate",
      "estimated_duration_minutes": 80,
      "prerequisites": ["number_line", "ordering"],
      "learning_objectives": [
        "Understand negative numbers on a number line",
        "Order positive and negative numbers",
        "Apply negative numbers to temperature",
        "Calculate with negative numbers"
      ]
    },
    {
      "id": "ao1",
      "topic_name": "Mental Addition and Subtraction",
      "topic_order": 1,
      "module_id": "mod2",
      "difficulty": "foundation",
      "estimated_duration_minutes": 65,
      "prerequisites": ["number_bonds", "place_value"],
      "learning_objectives": [
        "Add and subtract multiples of 10, 100, 1000",
        "Use compensation strategies",
        "Apply near doubles",
        "Develop mental calculation speed"
      ]
    },
    {
      "id": "ao2",
      "topic_name": "Column Addition",
      "topic_order": 2,
      "module_id": "mod2",
      "difficulty": "foundation",
      "estimated_duration_minutes": 70,
      "prerequisites": ["place_value", "carrying"],
      "learning_objectives": [
        "Add numbers with up to 5 digits",
        "Carry correctly between columns",
        "Add decimal numbers",
        "Check answers using estimation"
      ]
    },
    {
      "id": "fdp1",
      "topic_name": "Understanding Fractions",
      "topic_order": 1,
      "module_id": "mod3",
      "difficulty": "foundation",
      "estimated_duration_minutes": 85,
      "prerequisites": ["division", "parts_of_whole"],
      "learning_objectives": [
        "Identify parts of a whole",
        "Understand fraction notation",
        "Recognize unit fractions",
        "Create and interpret fraction diagrams"
      ]
    },
    {
      "id": "fdp2",
      "topic_name": "Equivalent Fractions",
      "topic_order": 2,
      "module_id": "mod3",
      "difficulty": "foundation",
      "estimated_duration_minutes": 75,
      "prerequisites": ["fractions_basics", "multiplication"],
      "learning_objectives": [
        "Find equivalent fractions",
        "Simplify fractions to lowest terms",
        "Find common denominators",
        "Use fraction walls effectively"
      ]
    },
    {
      "id": "alg1",
      "topic_name": "Introduction to Algebra",
      "topic_order": 1,
      "module_id": "mod5",
      "difficulty": "intermediate",
      "estimated_duration_minutes": 90,
      "prerequisites": ["arithmetic", "patterns"],
      "learning_objectives": [
        "Use letters to represent numbers",
        "Understand algebraic notation",
        "Identify terms and expressions",
        "Perform basic substitution"
      ]
    },
    {
      "id": "geo1",
      "topic_name": "2D Shape Properties",
      "topic_order": 1,
      "module_id": "mod6",
      "difficulty": "foundation",
      "estimated_duration_minutes": 70,
      "prerequisites": ["shape_recognition"],
      "learning_objectives": [
        "Identify properties of triangles",
        "Classify quadrilaterals",
        "Understand regular polygons",
        "Name parts of circles"
      ]
    }
  ],
  "curriculum_content": [
    {
      "topic_id": "npv1",
      "stage_type": "concept_introduction",
      "stage_order": 1,
      "title": "Understanding Large Numbers",
      "description": "Learn the fundamentals of reading and writing numbers up to 10 million",
      "estimated_time_minutes": 20,
      "content": {
        "learning_objective": "Understand how large numbers work and why they are important in everyday life",
        "introduction": "Let us explore how to read and write really big numbers! Numbers can get huge - up to 10 million and beyond. Once you understand the pattern, it becomes much easier.",
        "concepts": [
          "Every digit has a place value - units, tens, hundreds, thousands, etc.",
          "Numbers are read from left to right in groups of three digits",
          "Commas help us separate groups of thousands to make reading easier",
          "The position of each digit tells us its value"
        ],
        "key_example": "234,567 reads as two hundred thirty-four thousand, five hundred sixty-seven",
        "visual_aids": [
          "Place value chart showing millions, thousands, and units",
          "Number line with large numbers marked",
          "Real-world examples like population signs"
        ],
        "real_world_connections": [
          "Population of cities and countries",
          "Distances in kilometers",
          "Money values in large businesses",
          "YouTube video views and subscribers"
        ]
      },
      "media_urls": [
        "/images/place-value-chart.png",
        "/videos/large-numbers-intro.mp4"
      ]
    },
    {
      "topic_id": "npv1",
      "stage_type": "guided_practice",
      "stage_order": 2,
      "title": "Working Through Examples Together",
      "description": "Step-by-step practice with reading and writing large numbers",
      "estimated_time_minutes": 25,
      "content": {
        "introduction": "Let us practice reading and writing large numbers together, step by step.",
        "activities": [
          {
            "title": "Reading 1,234,567",
            "type": "step_by_step",
            "example": "1,234,567",
            "steps": [
              "Start from the left: 1 million",
              "Next group: 234 thousand",
              "Last group: 567 units",
              "Put together: One million, two hundred thirty-four thousand, five hundred sixty-seven"
            ],
            "description": "Break large numbers into manageable groups"
          },
          {
            "title": "Writing Numbers from Words",
            "type": "conversion",
            "example": "Three million, five hundred thousand, twenty-one",
            "steps": [
              "Identify millions: 3,000,000",
              "Identify thousands: 500,000",
              "Identify units: 21",
              "Combine: 3,500,021"
            ],
            "description": "Convert word form to standard form"
          }
        ],
        "interactive_elements": [
          {
            "type": "drag_and_drop",
            "title": "Place Value Sorting",
            "description": "Drag digits to correct place value positions"
          },
          {
            "type": "fill_in_blanks",
            "title": "Complete the Number",
            "description": "Fill in missing digits in large numbers"
          }
        ],
        "checkpoints": [
          {
            "question": "In 5,426,789, what does the 4 represent?",
            "answer": "4 hundred thousand (400,000)",
            "explanation": "The 4 is in the hundred thousands place"
          }
        ]
      }
    },
    {
      "topic_id": "npv1",
      "stage_type": "independent_practice",
      "stage_order": 3,
      "title": "Practice on Your Own",
      "description": "Independent practice problems to build confidence",
      "estimated_time_minutes": 20,
      "content": {
        "introduction": "Now it is your turn! Practice reading and writing large numbers independently.",
        "exercises": [
          {
            "title": "Number Recognition",
            "instruction": "Write these numbers in words",
            "problems": [
              "1,234,567",
              "5,000,042",
              "9,876,543",
              "2,500,000"
            ]
          },
          {
            "title": "Word to Number Conversion",
            "instruction": "Write these word numbers as digits",
            "problems": [
              "Four million, three hundred thousand, fifty-six",
              "Seven million, eight hundred ninety thousand, one hundred twenty-three",
              "One million, five hundred thousand",
              "Six million, forty-seven"
            ]
          },
          {
            "title": "Place Value Questions",
            "instruction": "Answer these place value questions",
            "problems": [
              "What is the value of 7 in 3,724,891?",
              "What digit is in the ten thousands place in 8,639,254?",
              "How many millions are in 4,567,890?"
            ]
          }
        ],
        "self_check": [
          "Can you read any 7-digit number confidently?",
          "Do you understand what each digit position represents?",
          "Can you write numbers from words without help?"
        ],
        "extensions": [
          "Find large numbers in newspapers and practice reading them",
          "Look up population numbers of different countries",
          "Practice with calculator display numbers"
        ]
      }
    },
    {
      "topic_id": "npv1",
      "stage_type": "assessment",
      "stage_order": 4,
      "title": "Show What You Know",
      "description": "Assessment to demonstrate mastery of large numbers",
      "estimated_time_minutes": 10,
      "content": {
        "introduction": "Time to show what you have learned about reading and writing large numbers!",
        "assessment_questions": [
          {
            "id": "q1",
            "question": "Write 3,456,789 in words",
            "type": "text_entry",
            "correct_answer": "Three million, four hundred fifty-six thousand, seven hundred eighty-nine",
            "points": 2,
            "explanation": "Break into groups: 3 million + 456 thousand + 789"
          },
          {
            "id": "q2",
            "question": "What is the value of the digit 5 in 8,521,347?",
            "type": "multiple_choice",
            "options": ["5", "50", "500", "500,000"],
            "correct_answer": "500,000",
            "points": 1,
            "explanation": "The 5 is in the hundred thousands place"
          },
          {
            "id": "q3",
            "question": "Write Two million, seven hundred thousand, forty-three in digits",
            "type": "text_entry",
            "correct_answer": "2,700,043",
            "points": 2,
            "explanation": "2 million + 700 thousand + 43 = 2,700,043"
          }
        ],
        "success_criteria": {
          "passing_score": 80,
          "total_points": 5,
          "minimum_correct": 4
        },
        "feedback": {
          "excellent": "Outstanding! You have mastered large numbers! 🎉",
          "good": "Great work! You understand large numbers well! 👍",
          "needs_work": "Good try! Let us practice a bit more. 💪"
        }
      }
    },
    {
      "topic_id": "npv2",
      "stage_type": "concept_introduction",
      "stage_order": 1,
      "title": "The Art of Rounding",
      "description": "Master the skill of rounding numbers to different place values",
      "estimated_time_minutes": 15,
      "content": {
        "learning_objective": "Understand when and how to round numbers for estimation and practical use",
        "introduction": "Rounding helps us work with simpler numbers. It is like saying about instead of being exact - super useful for quick calculations!",
        "concepts": [
          "Look at the digit to the right of your rounding place",
          "If it is 5 or more, round up",
          "If it is less than 5, round down",
          "All digits to the right become zeros"
        ],
        "key_example": "Rounding 3,456 to nearest hundred: Look at 5 (tens place), it is 5 or more, so round up to 3,500",
        "visual_aids": [
          "Number line showing rounding decisions",
          "Rounding rules chart",
          "Real-world rounding examples"
        ],
        "real_world_connections": [
          "Estimating shopping totals",
          "Rounding times for schedules",
          "Population statistics",
          "Sports scores and statistics"
        ]
      },
      "media_urls": [
        "/images/rounding-number-line.png",
        "/videos/rounding-explained.mp4"
      ]
    },
    {
      "topic_id": "npv2",
      "stage_type": "guided_practice",
      "stage_order": 2,
      "title": "Rounding Step by Step",
      "description": "Practice rounding with guided examples",
      "estimated_time_minutes": 20,
      "content": {
        "introduction": "Let us round numbers together, starting simple and building up!",
        "activities": [
          {
            "title": "Round to Nearest 10",
            "type": "step_by_step",
            "example": "Round 47 to nearest 10",
            "steps": [
              "Identify the tens place: 4",
              "Look at the ones place: 7",
              "Is 7 ≥ 5? Yes!",
              "Round up: 47 → 50"
            ],
            "description": "Master rounding to tens first"
          },
          {
            "title": "Round to Nearest 1000",
            "type": "step_by_step",
            "example": "Round 3,456 to nearest 1000",
            "steps": [
              "Identify the thousands place: 3",
              "Look at the hundreds place: 4",
              "Is 4 ≥ 5? No",
              "Round down: 3,456 → 3,000"
            ],
            "description": "Apply same rules to larger places"
          }
        ],
        "interactive_elements": [
          {
            "type": "slider",
            "title": "Rounding Explorer",
            "description": "Move the slider to see how numbers round"
          },
          {
            "type": "sorting_game",
            "title": "Round and Sort",
            "description": "Sort numbers by their rounded values"
          }
        ],
        "checkpoints": [
          {
            "question": "Round 6,789 to the nearest hundred",
            "answer": "6,800",
            "explanation": "Look at tens digit (8), which is ≥ 5, so round up"
          }
        ]
      }
    },
    {
      "topic_id": "npv2",
      "stage_type": "independent_practice",
      "stage_order": 3,
      "title": "Rounding Challenge",
      "description": "Practice rounding independently",
      "estimated_time_minutes": 15,
      "content": {
        "introduction": "Show your rounding skills! Work through these problems at your own pace.",
        "exercises": [
          {
            "title": "Round to Nearest 10",
            "instruction": "Round these numbers to the nearest 10",
            "problems": [
              "34",
              "67",
              "85",
              "92"
            ]
          },
          {
            "title": "Round to Nearest 100",
            "instruction": "Round these numbers to the nearest 100",
            "problems": [
              "456",
              "234",
              "789",
              "550"
            ]
          },
          {
            "title": "Mixed Rounding",
            "instruction": "Round as instructed",
            "problems": [
              "Round 4,567 to nearest 1000",
              "Round 23,456 to nearest 10",
              "Round 789,234 to nearest 10000",
              "Round 45.67 to nearest whole number"
            ]
          }
        ],
        "self_check": [
          "Do you check the correct digit for rounding?",
          "Can you round to any place value?",
          "Do you remember when to round up vs down?"
        ],
        "extensions": [
          "Create a rounding game with dice",
          "Estimate your weekly spending using rounding",
          "Round sports statistics in the newspaper"
        ]
      }
    },
    {
      "topic_id": "npv2",
      "stage_type": "assessment",
      "stage_order": 4,
      "title": "Rounding Assessment",
      "description": "Test your rounding skills",
      "estimated_time_minutes": 10,
      "content": {
        "introduction": "Let us check your rounding expertise!",
        "assessment_questions": [
          {
            "id": "q1",
            "question": "Round 3,456 to the nearest hundred",
            "type": "multiple_choice",
            "options": ["3,400", "3,500", "3,450", "3,460"],
            "correct_answer": "3,500",
            "points": 1,
            "explanation": "The tens digit is 5, so round up"
          },
          {
            "id": "q2",
            "question": "Round 67,892 to the nearest thousand",
            "type": "text_entry",
            "correct_answer": "68,000",
            "points": 2,
            "explanation": "Hundreds digit is 8 (≥5), so round up"
          },
          {
            "id": "q3",
            "question": "Which number rounds to 500 when rounded to the nearest hundred?",
            "type": "multiple_choice",
            "options": ["445", "455", "545", "555"],
            "correct_answer": "455",
            "points": 2,
            "explanation": "Numbers from 450-549 round to 500"
          }
        ],
        "success_criteria": {
          "passing_score": 80,
          "total_points": 5,
          "minimum_correct": 4
        },
        "feedback": {
          "excellent": "Rounding master! You have got this! 🎯",
          "good": "Nice rounding skills! Well done! ✨",
          "needs_work": "Keep practicing - you are getting there! 📈"
        }
      }
    },
    {
      "topic_id": "npv3",
      "stage_type": "concept_introduction",
      "stage_order": 1,
      "title": "Comparing and Ordering Numbers",
      "description": "Learn to compare numbers and put them in order",
      "estimated_time_minutes": 15,
      "content": {
        "learning_objective": "Master comparison symbols and ordering techniques for any size numbers",
        "introduction": "Comparing numbers is like being a judge - you decide which is bigger, smaller, or if they are equal!",
        "concepts": [
          "< means less than (smaller number first)",
          "> means greater than (bigger number first)",
          "= means equal to (same value)",
          "Compare digits from left to right"
        ],
        "key_example": "345 < 354 because when we compare left to right, 4 < 5 in the tens place",
        "visual_aids": [
          "Comparison symbol memory tricks",
          "Number line comparisons",
          "Place value comparison chart"
        ],
        "real_world_connections": [
          "Comparing prices when shopping",
          "Ordering race times",
          "Ranking game scores",
          "Comparing heights or weights"
        ]
      },
      "media_urls": [
        "/images/comparison-symbols.png",
        "/animations/number-comparison.gif"
      ]
    },
    {
      "topic_id": "npv3",
      "stage_type": "guided_practice",
      "stage_order": 2,
      "title": "Compare and Order Together",
      "description": "Practice comparing and ordering with guidance",
      "estimated_time_minutes": 20,
      "content": {
        "introduction": "Let us practice comparing numbers step by step!",
        "activities": [
          {
            "title": "Comparing Large Numbers",
            "type": "step_by_step",
            "example": "Compare 3,456 and 3,465",
            "steps": [
              "Line up by place value",
              "Compare thousands: 3 = 3",
              "Compare hundreds: 4 = 4",
              "Compare tens: 5 < 6",
              "Therefore: 3,456 < 3,465"
            ],
            "description": "Compare digit by digit from left to right"
          },
          {
            "title": "Ordering Multiple Numbers",
            "type": "step_by_step",
            "example": "Order: 234, 342, 243",
            "steps": [
              "Compare hundreds first",
              "234 and 243 both start with 2",
              "342 starts with 3 (biggest)",
              "Compare 234 and 243: 3 < 4",
              "Order: 234, 243, 342"
            ],
            "description": "Use systematic comparison"
          }
        ],
        "interactive_elements": [
          {
            "type": "drag_to_order",
            "title": "Number Line Ordering",
            "description": "Drag numbers to correct positions"
          },
          {
            "type": "comparison_game",
            "title": "Greater or Less?",
            "description": "Quick-fire comparison practice"
          }
        ],
        "checkpoints": [
          {
            "question": "Which symbol makes this true: 4,567 ___ 4,576?",
            "answer": "<",
            "explanation": "Compare tens: 6 < 7"
          }
        ]
      }
    }
  ]
}'::jsonb);