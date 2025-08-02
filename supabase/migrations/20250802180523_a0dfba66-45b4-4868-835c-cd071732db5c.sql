-- Import the complete curriculum content provided by the user
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
        "introduction": "Now it is your turn! Practice reading and writing large numbers independently."
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
        "introduction": "Time to show what you have learned about reading and writing large numbers!"
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
        ]
      }
    },
    {
      "topic_id": "npv2",
      "stage_type": "guided_practice",
      "stage_order": 2,
      "title": "Rounding Step by Step",
      "description": "Practice rounding with guided examples",
      "estimated_time_minutes": 20,
      "content": {
        "introduction": "Let us round numbers together, starting simple and building up!"
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
        "introduction": "Show your rounding skills! Work through these problems at your own pace."
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
        "introduction": "Let us check your rounding expertise!"
      }
    }
  ]
}'::jsonb);

-- Verify the import
SELECT 
  COUNT(*) as total_content_items,
  COUNT(DISTINCT topic_id) as unique_topics_with_content,
  COUNT(DISTINCT stage_type) as stage_types
FROM bootcamp_curriculum_content;

-- Check what topics were imported
SELECT 
  id,
  topic_name,
  difficulty,
  estimated_duration_minutes
FROM bootcamp_curriculum_topics
ORDER BY topic_order;