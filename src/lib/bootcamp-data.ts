// Bootcamp data structure and configuration
export const skillsHierarchy = {
  foundational_skills: {
    number_sense: {
      components: ["place_value", "ordering", "estimation", "number_bonds"],
      diagnostic_indicators: {
        strong: ["quick_recognition", "accurate_estimation", "flexible_strategies"],
        weak: ["place_value_errors", "comparison_confusion", "poor_estimation"]
      }
    },
    calculation_fluency: {
      components: ["mental_math", "written_methods", "checking_strategies"],
      diagnostic_indicators: {
        strong: ["accurate_recall", "efficient_methods", "self_correction"],
        weak: ["calculation_errors", "slow_processing", "no_checking"]
      }
    },
    conceptual_understanding: {
      components: ["mathematical_relationships", "visual_models", "connections"],
      diagnostic_indicators: {
        strong: ["explains_reasoning", "uses_multiple_methods", "sees_patterns"],
        weak: ["rote_only", "single_method_dependency", "missing_connections"]
      }
    }
  },
  topic_specific_skills: {
    arithmetic_skills: {
      addition_subtraction: {
        subskills: ["mental_strategies", "column_methods", "regrouping", "decimals"],
        common_errors: ["carrying_errors", "borrowing_errors", "alignment_issues"]
      },
      multiplication_division: {
        subskills: ["times_tables", "short_methods", "long_methods", "remainders"],
        common_errors: ["place_value_errors", "partial_products", "remainder_interpretation"]
      },
      fractions_decimals_percentages: {
        subskills: ["equivalence", "operations", "conversions", "applications"],
        common_errors: ["denominator_addition", "decimal_places", "percentage_base"]
      }
    },
    reasoning_skills: {
      pattern_recognition: {
        subskills: ["sequences", "relationships", "generalizations", "predictions"],
        common_errors: ["local_patterns", "additive_thinking", "incomplete_rules"]
      },
      problem_decomposition: {
        subskills: ["identifying_steps", "sequencing", "choosing_operations", "checking"],
        common_errors: ["missing_steps", "wrong_order", "operation_confusion"]
      },
      logical_thinking: {
        subskills: ["deduction", "elimination", "systematic_approach", "proof"],
        common_errors: ["assumptions", "incomplete_logic", "circular_reasoning"]
      }
    }
  }
};

export const misconceptionPaths = {
  place_value_misconceptions: {
    PV1: {
      description: "Digit position confusion",
      diagnostic_signs: ["rounds_to_wrong_place", "misreads_large_numbers", "decimal_confusion"],
      remediation_sequence: [
        {
          step: 1,
          activity: "place_value_charts",
          practice_questions: ["identify_digit_values", "build_numbers_from_parts"],
          success_criteria: "90%_accuracy"
        },
        {
          step: 2,
          activity: "number_expansion",
          practice_questions: ["expanded_form", "standard_to_word_form"],
          success_criteria: "85%_accuracy"
        },
        {
          step: 3,
          activity: "comparison_exercises",
          practice_questions: ["order_large_numbers", "find_between_numbers"],
          success_criteria: "85%_accuracy"
        }
      ]
    },
    PV2: {
      description: "Zero as placeholder ignored",
      diagnostic_signs: ["writes_305_as_35", "multiplies_incorrectly", "misaligns_columns"],
      remediation_sequence: [
        {
          step: 1,
          activity: "zero_importance_demos",
          practice_questions: ["identify_missing_zeros", "place_value_with_zeros"],
          success_criteria: "95%_accuracy"
        },
        {
          step: 2,
          activity: "column_alignment_practice",
          practice_questions: ["aligned_addition", "aligned_subtraction"],
          success_criteria: "90%_accuracy"
        }
      ]
    }
  },
  fraction_misconceptions: {
    FR1: {
      description: "Denominator addition error",
      diagnostic_signs: ["adds_denominators", "treats_fractions_as_whole_numbers"],
      remediation_sequence: [
        {
          step: 1,
          activity: "visual_fraction_models",
          practice_questions: ["shade_fractions", "compare_visual_fractions"],
          success_criteria: "understand_part_whole"
        },
        {
          step: 2,
          activity: "common_denominator_finding",
          practice_questions: ["find_lcm", "convert_to_common_denominator"],
          success_criteria: "85%_accuracy"
        },
        {
          step: 3,
          activity: "fraction_addition_steps",
          practice_questions: ["same_denominator_addition", "different_denominator_addition"],
          success_criteria: "80%_accuracy"
        }
      ]
    },
    FR3: {
      description: "Fraction size misconception",
      diagnostic_signs: ["thinks_1/8_bigger_than_1/4", "denominator_size_confusion"],
      remediation_sequence: [
        {
          step: 1,
          activity: "fraction_bars_comparison",
          practice_questions: ["order_unit_fractions", "visual_comparison"],
          success_criteria: "conceptual_understanding"
        },
        {
          step: 2,
          activity: "benchmark_fractions",
          practice_questions: ["compare_to_half", "compare_to_one"],
          success_criteria: "90%_accuracy"
        }
      ]
    }
  },
  operation_misconceptions: {
    OP1: {
      description: "Inverse operation confusion",
      diagnostic_signs: ["adds_when_should_subtract", "wrong_operation_in_equations"],
      remediation_sequence: [
        {
          step: 1,
          activity: "operation_relationships",
          practice_questions: ["fact_families", "inverse_pairs"],
          success_criteria: "understand_relationships"
        },
        {
          step: 2,
          activity: "word_problem_keywords",
          practice_questions: ["identify_operation_from_context", "translate_words_to_operations"],
          success_criteria: "85%_accuracy"
        }
      ]
    }
  }
};

export const achievementSystem = {
  badges: {
    accuracy_badges: [
      { name: "Sharp Shooter", requirement: "95% accuracy", icon: "target" },
      { name: "Precision Pro", requirement: "90% accuracy", icon: "crosshair" },
      { name: "Steady Hand", requirement: "85% accuracy", icon: "shield" }
    ],
    speed_badges: [
      { name: "Lightning Quick", requirement: "Top 10% speed", icon: "zap" },
      { name: "Swift Solver", requirement: "Top 25% speed", icon: "clock" },
      { name: "Time Master", requirement: "Consistent fast solving", icon: "timer" }
    ],
    streak_badges: [
      { name: "7-Day Streak", requirement: "7 consecutive days", icon: "flame" },
      { name: "30-Day Dedication", requirement: "30 consecutive days", icon: "calendar" },
      { name: "Term Champion", requirement: "Full term streak", icon: "crown" }
    ],
    mastery_badges: [
      { name: "Topic Master", requirement: "Master any topic", icon: "star" },
      { name: "Module Champion", requirement: "Complete module", icon: "award" },
      { name: "Curriculum Conqueror", requirement: "Master all topics", icon: "trophy" }
    ]
  },
  points_system: {
    correct_answer: 10,
    speed_bonus: 5,
    streak_multiplier: { min: 1.1, max: 2.0 },
    challenge_completion: 50
  },
  levels: {
    calculation_ranks: ["Apprentice", "Journeyman", "Expert", "Master", "Grandmaster"],
    problem_solving_ranks: ["Detective", "Analyst", "Strategist", "Mastermind"],
    overall_ranks: ["Bronze", "Silver", "Gold", "Platinum", "Diamond"]
  }
};

export const performanceMetrics = {
  accuracy_tracking: {
    overall_accuracy: "percentage",
    accuracy_by_topic: "percentage_per_topic",
    accuracy_by_difficulty: "percentage_per_level",
    accuracy_by_question_type: "percentage_per_type"
  },
  speed_tracking: {
    average_time_per_question: "seconds",
    time_by_topic: "seconds_per_topic", 
    time_improvement: "percentage_change",
    time_pressure_performance: "accuracy_under_time_limit"
  },
  error_analysis: {
    error_frequency: "errors_per_topic",
    error_patterns: "misconception_frequency",
    error_persistence: "repeat_error_rate",
    error_correction_rate: "improvement_after_feedback"
  }
};

// Helper functions for working with the data
export const getTopicSkills = (topicId: string) => {
  // Implementation would fetch skills for a specific topic
  return skillsHierarchy.topic_specific_skills;
};

export const getMisconceptionsByCode = (code: string) => {
  for (const category of Object.values(misconceptionPaths)) {
    if (category[code as keyof typeof category]) {
      return category[code as keyof typeof category];
    }
  }
  return null;
};

export const calculateNextBadge = (userStats: any) => {
  // Implementation would determine which badge the user is closest to earning
  return achievementSystem.badges.accuracy_badges[0];
};

export const getRecommendedPractice = (userPerformance: any) => {
  // Implementation would analyze performance and suggest targeted practice
  return {
    revision: 0.2,
    current_topic: 0.5,
    preview: 0.2,
    mixed_review: 0.1
  };
};