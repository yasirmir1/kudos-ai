import { TopicLearningContent, SubtopicLearningContent } from '@/components/bootcamp/types/LearningContent';

// This will load learning content from JSON files or API
export class LearningContentLoader {
  private static contentCache: Map<string, TopicLearningContent> = new Map();

  static async loadTopicContent(topicId: string): Promise<TopicLearningContent | null> {
    // Check cache first
    if (this.contentCache.has(topicId)) {
      return this.contentCache.get(topicId)!;
    }

    try {
      // For now, return placeholder content structure
      // Later, this will load from your provided JSON files
      const content = await this.loadFromAPI(topicId) || this.generatePlaceholderContent(topicId);
      
      if (content) {
        this.contentCache.set(topicId, content);
      }
      
      return content;
    } catch (error) {
      console.error('Error loading topic content:', error);
      return null;
    }
  }

  static async loadSubtopicContent(topicId: string, subtopicId: string): Promise<SubtopicLearningContent | null> {
    const topicContent = await this.loadTopicContent(topicId);
    
    if (!topicContent) return null;
    
    return topicContent.subtopics.find(subtopic => subtopic.subtopicId === subtopicId) || null;
  }

  private static async loadFromAPI(topicId: string): Promise<TopicLearningContent | null> {
    // This will later make API calls to load JSON content
    // For now, return null to use placeholder content
    return null;
  }

  private static generatePlaceholderContent(topicId: string): TopicLearningContent {
    // Generate placeholder content for all possible subtopics
    // This will be dynamically matched with actual subtopic data
    return {
      topicId,
      topicName: "Topic Name",
      subtopics: [
        // Generate multiple placeholder subtopics that can match any subtopic
        {
          subtopicId: "1", // Match database ID
          subtopicName: "Numbers to 10,000,000",
          estimatedDuration: 30,
          prerequisites: [],
          learningObjectives: [
            "Read and write numbers up to 10,000,000",
            "Understand place value in large numbers",
            "Compare and order large numbers"
          ],
          stages: {
            concept: {
              introduction: "Let's explore how to read and write really big numbers! Numbers can get huge - up to 10 million and beyond. Once you understand the pattern, it becomes much easier.",
              keyPoints: [
                "Every digit has a place value - units, tens, hundreds, thousands, etc.",
                "Numbers are read from left to right in groups of three digits",
                "Commas help us separate groups of thousands to make reading easier",
                "The position of each digit tells us its value"
              ],
              examples: [
                {
                  title: "Reading 1,234,567",
                  description: "Let's break down this 7-digit number step by step",
                  explanation: "This reads as 'one million, two hundred thirty-four thousand, five hundred sixty-seven'"
                },
                {
                  title: "Writing 'Three million, five hundred thousand'",
                  description: "Converting words to numbers",
                  explanation: "This would be written as 3,500,000"
                }
              ],
              realWorldApplications: [
                "Population of cities and countries",
                "Distances between planets in kilometers",
                "Number of cells in the human body",
                "Money values in large businesses"
              ]
            },
            guided: {
              introduction: "Let's practice reading and writing large numbers together, step by step.",
              stepByStepExamples: [
                {
                  title: "Reading the number 2,847,135",
                  problem: "How do we read the number 2,847,135?",
                  steps: [
                    {
                      stepNumber: 1,
                      instruction: "Start from the left and identify the millions",
                      working: "2,847,135 - The '2' is in the millions place",
                      explanation: "The first digit represents 2 million"
                    },
                    {
                      stepNumber: 2,
                      instruction: "Next, identify the thousands",
                      working: "2,847,135 - The '847' represents 847 thousand",
                      explanation: "The middle three digits show how many thousands"
                    },
                    {
                      stepNumber: 3,
                      instruction: "Finally, read the hundreds, tens, and units",
                      working: "2,847,135 - The '135' represents 135 units",
                      explanation: "The last three digits are just like a regular 3-digit number"
                    }
                  ],
                  finalAnswer: "Two million, eight hundred forty-seven thousand, one hundred thirty-five",
                  explanation: "We read large numbers by breaking them into groups of three digits from right to left"
                }
              ],
              checkpoints: [
                {
                  question: "What does the digit 5 represent in the number 1,502,847?",
                  correctAnswer: "5 hundred thousand (500,000)",
                  explanation: "The 5 is in the hundred thousands place, so it represents 500,000"
                }
              ]
            },
            independent: {
              introduction: "Now it's your turn! Practice reading and writing large numbers on your own.",
              practiceProblems: [
                {
                  id: "practice-1",
                  question: "What is 4,682,913 written in words?",
                  type: "multiple-choice",
                  options: [
                    "Four million, six hundred eighty-two thousand, nine hundred thirteen",
                    "Four thousand, six hundred eighty-two million, nine hundred thirteen",
                    "Forty-six million, eight hundred twenty-nine thousand, thirteen",
                    "Four million, six hundred eighty-two, nine hundred thirteen"
                  ],
                  correctAnswer: "Four million, six hundred eighty-two thousand, nine hundred thirteen",
                  explanation: "Break it into groups: 4 million + 682 thousand + 913",
                  difficulty: "medium"
                },
                {
                  id: "practice-2",
                  question: "Write 'Seven million, three hundred thousand, forty-five' as a number.",
                  type: "multiple-choice",
                  options: ["7,300,045", "7,030,045", "7,300,450", "7,003,045"],
                  correctAnswer: "7,300,045",
                  explanation: "7 million = 7,000,000, plus 300 thousand = 300,000, plus 45 = 45",
                  difficulty: "medium"
                }
              ],
              selfCheckQuestions: [
                "Can you read any 7-digit number confidently?",
                "Do you understand what each digit position represents?",
                "Can you write numbers from words without help?"
              ]
            },
            assessment: {
              introduction: "Time to show what you know about large numbers!",
              questions: [
                {
                  id: "assess-1",
                  question: "In the number 9,246,781, what is the value of the digit 4?",
                  type: "multiple-choice",
                  options: ["4", "40", "40,000", "400,000"],
                  correctAnswer: "40,000",
                  explanation: "The 4 is in the ten thousands place, so its value is 40,000",
                  points: 1
                },
                {
                  id: "assess-2",
                  question: "Which number is largest?",
                  type: "multiple-choice",
                  options: ["9,999,999", "10,000,000", "9,000,000", "999,999"],
                  correctAnswer: "10,000,000",
                  explanation: "10 million is larger than any 7-digit number",
                  points: 1
                }
              ],
              passingCriteria: {
                minimumScore: 80,
                totalQuestions: 5
              },
              feedbackMessages: {
                excellent: "Amazing! You're a master of large numbers! 🎉",
                good: "Great work! You understand large numbers well! 👍",
                needsImprovement: "Keep practicing - you'll get there! 💪"
              }
            }
          }
        },
        {
          subtopicId: "2",
          subtopicName: "Place value understanding",
          estimatedDuration: 25,
          prerequisites: [],
          learningObjectives: [
            "Understand the value of digits in different positions",
            "Identify place values up to millions",
            "Use place value to compare numbers"
          ],
          stages: {
            concept: {
              introduction: "Place value is like a number's address system - each digit lives in a specific 'house' that tells us its value!",
              keyPoints: [
                "Each position in a number has a different value",
                "Moving left makes each position 10 times bigger",
                "The same digit can have different values in different positions",
                "Place value helps us understand what numbers really mean"
              ],
              examples: [
                {
                  title: "The digit 5 in different places",
                  description: "See how the same digit can mean different amounts",
                  explanation: "In 5,432 the 5 means 5,000. In 1,542 the 5 means 500. In 1,325 the 5 means 5."
                }
              ],
              realWorldApplications: [
                "Understanding money amounts",
                "Reading measurements and distances",
                "Comparing statistics and data"
              ]
            },
            guided: {
              introduction: "Let's explore place value together with hands-on examples.",
              stepByStepExamples: [
                {
                  title: "Finding the place value of 7 in 3,765,429",
                  problem: "What is the place value of the digit 7?",
                  steps: [
                    {
                      stepNumber: 1,
                      instruction: "Locate the digit 7 in the number",
                      working: "3,765,429 - The 7 is the second digit from the left",
                      explanation: "We need to count positions to find where the 7 sits"
                    },
                    {
                      stepNumber: 2,
                      instruction: "Count the position from right to left",
                      working: "Starting from right: 9(units), 2(tens), 4(hundreds), 5(thousands), 6(ten thousands), 7(hundred thousands)",
                      explanation: "The 7 is in the hundred thousands place"
                    }
                  ],
                  finalAnswer: "The 7 represents 700,000 (seven hundred thousand)",
                  explanation: "Place value tells us not just which digit, but what that digit is worth"
                }
              ],
              checkpoints: []
            },
            independent: {
              introduction: "Practice identifying place values in different numbers.",
              practiceProblems: [
                {
                  id: "practice-1",
                  question: "In 8,194,673, what place value is the digit 9?",
                  type: "multiple-choice",
                  options: ["Thousands", "Ten thousands", "Hundred thousands", "Millions"],
                  correctAnswer: "Ten thousands",
                  explanation: "Counting from right: 3(units), 7(tens), 6(hundreds), 4(thousands), 9(ten thousands)",
                  difficulty: "easy"
                }
              ],
              selfCheckQuestions: [
                "Can you identify any digit's place value quickly?",
                "Do you understand how place value affects a number's size?"
              ]
            },
            assessment: {
              introduction: "Show your place value mastery!",
              questions: [
                {
                  id: "assess-1",
                  question: "What is the place value of 6 in 2,631,485?",
                  type: "multiple-choice",
                  options: ["Thousands", "Ten thousands", "Hundred thousands", "Millions"],
                  correctAnswer: "Hundred thousands",
                  explanation: "The 6 is in the hundred thousands position",
                  points: 1
                }
              ],
              passingCriteria: {
                minimumScore: 80,
                totalQuestions: 3
              },
              feedbackMessages: {
                excellent: "Perfect! You understand place value completely! 🌟",
                good: "Well done! Place value makes sense to you! ✅",
                needsImprovement: "Keep practicing place value - you're getting there! 📚"
              }
            }
          }
        },
        {
          subtopicId: "3",
          subtopicName: "Standard and word form",
          estimatedDuration: 20,
          prerequisites: [],
          learningObjectives: [
            "Convert between standard form and word form",
            "Write numbers in both formats correctly",
            "Understand the relationship between the two forms"
          ],
          stages: {
            concept: {
              introduction: "Numbers can be written in different ways - with digits (standard form) or with words (word form). Both tell us the same amount!",
              keyPoints: [
                "Standard form uses digits: 1,234,567",
                "Word form uses words: one million, two hundred thirty-four thousand, five hundred sixty-seven",
                "Both forms represent exactly the same quantity",
                "Converting between them helps us understand numbers better"
              ],
              examples: [
                {
                  title: "Same number, different forms",
                  description: "5,280,000 and 'five million, two hundred eighty thousand'",
                  explanation: "These both represent the exact same amount - just written differently"
                }
              ],
              realWorldApplications: [
                "Writing checks and legal documents",
                "Reading news articles about large numbers",
                "Understanding scientific measurements"
              ]
            },
            guided: {
              introduction: "Practice converting between standard and word forms together.",
              stepByStepExamples: [
                {
                  title: "Converting 4,065,200 to word form",
                  problem: "Write 4,065,200 in words",
                  steps: [
                    {
                      stepNumber: 1,
                      instruction: "Break the number into groups of three",
                      working: "4,065,200 becomes 4 | 065 | 200",
                      explanation: "This helps us see millions, thousands, and units clearly"
                    },
                    {
                      stepNumber: 2,
                      instruction: "Read each group and add the place value word",
                      working: "4 = four (million), 065 = sixty-five (thousand), 200 = two hundred",
                      explanation: "Each group gets its own place value word"
                    }
                  ],
                  finalAnswer: "Four million, sixty-five thousand, two hundred",
                  explanation: "Always read from left to right, adding place value words"
                }
              ],
              checkpoints: []
            },
            independent: {
              introduction: "Practice converting between standard and word forms on your own.",
              practiceProblems: [
                {
                  id: "practice-1",
                  question: "Write 'six million, forty thousand, three hundred' in standard form",
                  type: "multiple-choice",
                  options: ["6,040,300", "6,400,300", "6,043,000", "60,040,300"],
                  correctAnswer: "6,040,300",
                  explanation: "6 million + 40 thousand + 300 = 6,000,000 + 40,000 + 300 = 6,040,300",
                  difficulty: "medium"
                }
              ],
              selfCheckQuestions: [
                "Can you convert any number to word form?",
                "Can you write word form numbers as digits?"
              ]
            },
            assessment: {
              introduction: "Demonstrate your skills with standard and word forms!",
              questions: [
                {
                  id: "assess-1",
                  question: "What is 7,506,008 in word form?",
                  type: "multiple-choice",
                  options: [
                    "Seven million, five hundred six thousand, eight",
                    "Seven million, fifty-six thousand, eight",
                    "Seven thousand, five hundred six, eight",
                    "Seventy-five million, six thousand, eight"
                  ],
                  correctAnswer: "Seven million, five hundred six thousand, eight",
                  explanation: "Break it down: 7 million + 506 thousand + 8",
                  points: 1
                }
              ],
              passingCriteria: {
                minimumScore: 80,
                totalQuestions: 3
              },
              feedbackMessages: {
                excellent: "Excellent! You can switch between number forms like a pro! 🎯",
                good: "Great job! You understand both forms well! 👏",
                needsImprovement: "Keep practicing - you're making good progress! 💫"
              }
            }
          }
        }
      ]
    };
  }

  // Method to load JSON content from external source
  static async loadFromJSON(jsonContent: TopicLearningContent): Promise<void> {
    this.contentCache.set(jsonContent.topicId, jsonContent);
  }

  // Clear cache if needed
  static clearCache(): void {
    this.contentCache.clear();
  }
}