export const sampleBootcampQuestions = [
  {
    question_id: "DQ001",
    module: "mod1",
    topic: "place_value",
    subtopic: "rounding_thousands",
    category: "arithmetic",
    cognitive_level: "application",
    difficulty: "foundation",
    question_text: "Round 3,847 to the nearest hundred",
    option_a: "3,800",
    option_b: "3,850", 
    option_c: "3,900",
    option_d: "4,000",
    correct_answer: "A",
    a_misconception: "correct",
    b_misconception: "PV1-rounded_to_tens",
    c_misconception: "CE6-rounding_error",
    d_misconception: "PV1-rounded_to_thousands",
    a_feedback: "Correct! You identified the hundreds place (8), looked at the tens digit (4), and since 4 < 5, rounded down.",
    b_feedback: "You rounded to the nearest ten instead of hundred. Remember: for nearest hundred, ignore everything after the tens place.",
    c_feedback: "You rounded up when you should round down. The tens digit (4) is less than 5, so keep the hundreds digit the same.",
    d_feedback: "You rounded to the nearest thousand instead of hundred. Check which place value the question asks for.",
    skills_tested: "place_value,rounding_rules",
    marks: 1,
    time_seconds: 45
  },
  {
    question_id: "DQ002",
    module: "mod3",
    topic: "fractions",
    subtopic: "adding_different_denominators",
    category: "arithmetic",
    cognitive_level: "application",
    difficulty: "intermediate",
    question_text: "Calculate: 1/3 + 1/4",
    option_a: "7/12",
    option_b: "2/7",
    option_c: "1/7",
    option_d: "5/12",
    correct_answer: "A",
    a_misconception: "correct",
    b_misconception: "FR1-add_num_denom",
    c_misconception: "FR1-add_denom_only",
    d_misconception: "CE1-conversion_error",
    a_feedback: "Excellent! You found the common denominator (12), converted both fractions (4/12 + 3/12), and added correctly.",
    b_feedback: "You added numerators (1+1=2) and denominators (3+4=7) separately. Fractions need a common denominator before adding.",
    c_feedback: "You may have added denominators (3+4=7) but kept numerator as 1. Remember: find common denominator first, then add numerators only.",
    d_feedback: "You found the correct common denominator (12) but made an error converting: 1/3 = 4/12 (not 2/12) and 1/4 = 3/12.",
    skills_tested: "equivalent_fractions,common_denominators,fraction_addition",
    marks: 2,
    time_seconds: 90
  },
  {
    question_id: "DQ003",
    module: "mod6",
    topic: "geometry",
    subtopic: "area_composite",
    category: "reasoning",
    cognitive_level: "analysis",
    difficulty: "advanced",
    question_text: "A rectangle measures 8cm by 6cm. A square of side 3cm is cut from one corner. What is the area of the remaining shape?",
    option_a: "39 cm²",
    option_b: "45 cm²",
    option_c: "30 cm²",
    option_d: "42 cm²",
    correct_answer: "A",
    a_misconception: "correct",
    b_misconception: "ME4-squared_units",
    c_misconception: "ME3-perimeter_confusion",
    d_misconception: "CE1-arithmetic_error",
    a_feedback: "Perfect! Rectangle area (8×6=48) minus square area (3×3=9) equals 39 cm².",
    b_feedback: "You subtracted 3 instead of 3². The cut-out is a square with area 3×3=9, not just 3.",
    c_feedback: "You may have subtracted from perimeter thinking or used 5×6. Remember: this is about area, not perimeter.",
    d_feedback: "Calculation error: 48-9=39, not 42. Always double-check subtraction, especially under time pressure.",
    skills_tested: "area_rectangle,area_square,subtraction,visualization",
    marks: 3,
    time_seconds: 120
  },
  {
    question_id: "DQ004",
    module: "mod5",
    topic: "algebra",
    subtopic: "sequences",
    category: "reasoning",
    cognitive_level: "analysis",
    difficulty: "intermediate",
    question_text: "Find the next number in the sequence: 3, 7, 15, 31, ?",
    option_a: "63",
    option_b: "47",
    option_c: "62",
    option_d: "55",
    correct_answer: "A",
    a_misconception: "correct",
    b_misconception: "PA1-additive_pattern",
    c_misconception: "CE1-calc_error",
    d_misconception: "PA2-local_pattern",
    a_feedback: "Excellent pattern recognition! Each term is (previous term × 2) + 1. So 31 × 2 + 1 = 63.",
    b_feedback: "You added 16 (continuing 4, 8, 16). But check: differences are 4, 8, 16... they double! Next difference should be 32.",
    c_feedback: "Close! You correctly found the pattern (×2 + 1) but made a calculation error: 31 × 2 = 62, then + 1 = 63.",
    d_feedback: "You may have seen 3→7 (+4), 15→31 (+16) and thought to add 24. But check the full pattern more carefully.",
    skills_tested: "pattern_recognition,doubling,addition",
    marks: 2,
    time_seconds: 90
  },
  {
    question_id: "DQ005",
    module: "mod9",
    topic: "problem_solving",
    subtopic: "multi_step_fractions",
    category: "reasoning",
    cognitive_level: "synthesis",
    difficulty: "advanced",
    question_text: "Sarah has £24. She spends 1/3 on a book and 1/4 of what remains on sweets. How much does she have left?",
    option_a: "£12",
    option_b: "£10",
    option_c: "£8",
    option_d: "£14",
    correct_answer: "A",
    a_misconception: "correct",
    b_misconception: "RE5-sequential_error",
    c_misconception: "RE2-incomplete",
    d_misconception: "FR2-fraction_calc",
    a_feedback: "Perfect! Book: £24 ÷ 3 = £8, leaving £16. Sweets: £16 ÷ 4 = £4, leaving £12.",
    b_feedback: "You calculated 1/3 + 1/4 = 7/12 of £24. But the 1/4 is of the REMAINING money after buying the book, not the original £24.",
    c_feedback: "You found what she spent on the book (£8) but the question asks what's LEFT after both purchases.",
    d_feedback: "Check your calculation of 1/4 of £16. It should be £4, not £2. So £16 - £4 = £12 remaining.",
    skills_tested: "fractions_of_amounts,multi_step_problems,money",
    marks: 3,
    time_seconds: 150
  }
];

export async function importSampleData() {
  const { BootcampAPI } = await import('./bootcamp-api');
  
  try {
    console.log('Importing sample bootcamp questions...');
    const result = await BootcampAPI.importQuestions(sampleBootcampQuestions);
    console.log('Import successful:', result);
    return result;
  } catch (error) {
    console.error('Import failed:', error);
    throw error;
  }
}

// Auto-import sample data when this module is loaded
importSampleData();