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
    try {
      // Import supabase client
      const { supabase } = await import('@/integrations/supabase/client');
      
      // Fetch topic information - use maybeSingle() to handle missing topics gracefully
      const { data: topicData, error: topicError } = await supabase
        .from('bootcamp_curriculum_topics')
        .select('*')
        .eq('id', topicId)
        .maybeSingle();
      
      if (topicError) {
        console.error('Error fetching topic:', topicError);
        return null;
      }
      
      // If no topic found in database, create a fallback topic structure
      if (!topicData) {
        console.log(`Topic ${topicId} not found in database, using fallback content`);
        return this.createFallbackTopicContent(topicId);
      }
      
      // Fetch curriculum content for this topic
      const { data: contentData, error: contentError } = await supabase
        .from('bootcamp_curriculum_content')
        .select('*')
        .eq('topic_id', topicId)
        .order('stage_order');
      
      if (contentError) {
        console.error('Error fetching content:', contentError);
        return null;
      }
      
      // Transform database content to our format
      const subtopics = this.transformDatabaseContent(topicData, contentData || []);
      
      return {
        topicId: topicData.id,
        topicName: topicData.topic_name,
        subtopics
      };
    } catch (error) {
      console.error('Error in loadFromAPI:', error);
      return null;
    }
  }

  private static transformDatabaseContent(topicData: any, contentData: any[]): SubtopicLearningContent[] {
    // Create a default subtopic based on the topic
    const defaultSubtopic: SubtopicLearningContent = {
      subtopicId: topicData.id,
      subtopicName: topicData.topic_name,
      estimatedDuration: topicData.estimated_duration_minutes || 45,
      prerequisites: topicData.prerequisites || [],
      learningObjectives: topicData.learning_objectives || [],
      stages: {
        concept: this.createConceptStage(contentData),
        guided: this.createGuidedStage(contentData),
        independent: this.createIndependentStage(contentData),
        assessment: this.createAssessmentStage(contentData)
      }
    };
    
    return [defaultSubtopic];
  }
  
  private static createConceptStage(contentData: any[]) {
    const conceptContent = contentData.find(c => c.stage_type === 'concept_introduction');
    const content = conceptContent?.content || {};
    
    return {
      introduction: content.learning_objective || "Let's learn about this important mathematical concept!",
      keyPoints: content.concepts || [
        "Understanding the fundamental principles",
        "Learning the key terminology",
        "Seeing how it applies in real situations"
      ],
      examples: content.visual_aids ? content.visual_aids.map((aid: string, index: number) => ({
        title: `Example ${index + 1}`,
        description: aid,
        explanation: content.key_example || "This example demonstrates the concept clearly."
      })) : [
        {
          title: "Basic Example",
          description: "A fundamental example to illustrate the concept",
          explanation: content.key_example || "This shows how the concept works in practice."
        }
      ],
      realWorldApplications: [
        "Practical applications in everyday life",
        "Mathematical problem solving",
        "Building foundation for advanced topics"
      ]
    };
  }
  
  private static createGuidedStage(contentData: any[]) {
    const guidedContent = contentData.find(c => c.stage_type === 'guided_practice');
    const content = guidedContent?.content || {};
    
    return {
      introduction: "Let's work through examples together step by step.",
      stepByStepExamples: content.activities ? content.activities.map((activity: any, index: number) => ({
        title: activity.title || `Example ${index + 1}`,
        problem: activity.example || "Practice problem",
        steps: activity.steps ? activity.steps.map((step: string, stepIndex: number) => ({
          stepNumber: stepIndex + 1,
          instruction: step,
          working: activity.example || "",
          explanation: `Step ${stepIndex + 1} explanation`
        })) : [
          {
            stepNumber: 1,
            instruction: "Follow the first step",
            working: "",
            explanation: "This step introduces the approach"
          }
        ],
        finalAnswer: "Solution",
        explanation: activity.description || "This guided example helps build understanding."
      })) : [
        {
          title: "Guided Example",
          problem: "Let's solve this together",
          steps: [
            {
              stepNumber: 1,
              instruction: "Start with the first step",
              working: "Work through the problem systematically",
              explanation: "This approach helps you understand the process"
            }
          ],
          finalAnswer: "Final solution",
          explanation: "Working together helps build confidence."
        }
      ],
      checkpoints: []
    };
  }
  
  private static createIndependentStage(contentData: any[]) {
    const independentContent = contentData.find(c => c.stage_type === 'independent_practice');
    const content = independentContent?.content || {};
    
    return {
      introduction: "Now it's your turn to practice independently!",
      practiceProblems: content.exercises ? content.exercises.map((exercise: any, index: number) => ({
        id: `practice-${index + 1}`,
        question: exercise.instruction || "Practice question",
        type: "multiple-choice" as const,
        options: exercise.problems?.slice(0, 4) || ["Option A", "Option B", "Option C", "Option D"],
        correctAnswer: exercise.problems?.[0] || "Option A",
        explanation: exercise.title || "This problem tests your understanding.",
        difficulty: "medium" as const
      })) : [
        {
          id: "practice-1",
          question: "Practice what you've learned",
          type: "multiple-choice" as const,
          options: ["Answer A", "Answer B", "Answer C", "Answer D"],
          correctAnswer: "Answer A",
          explanation: "This helps reinforce your learning.",
          difficulty: "medium" as const
        }
      ],
      selfCheckQuestions: [
        "Do you feel confident with this concept?",
        "Can you solve similar problems on your own?",
        "Are you ready to move to the next stage?"
      ]
    };
  }
  
  private static createAssessmentStage(contentData: any[]) {
    return {
      introduction: "Time to show what you've learned!",
      questions: [
        {
          id: "assess-1",
          question: "Assessment question to test your understanding",
          type: "multiple-choice" as const,
          options: ["Option A", "Option B", "Option C", "Option D"],
          correctAnswer: "Option A",
          explanation: "This tests your mastery of the concept.",
          points: 1
        }
      ],
      passingCriteria: {
        minimumScore: 80,
        totalQuestions: 3
      },
      feedbackMessages: {
        excellent: "Excellent work! You've mastered this concept! 🎉",
        good: "Great job! You understand this well! 👍",
        needsImprovement: "Keep practicing - you're making progress! 💪"
      }
    };
  }

  private static createFallbackTopicContent(topicId: string): TopicLearningContent {
    // Create fallback content when topic is not found in database
    const topicNameMap: { [key: string]: string } = {
      'Metric Units': 'Metric Units',
      'metric-units': 'Metric Units',
      'metric_units': 'Metric Units',
    };
    
    const topicName = topicNameMap[topicId] || topicId.replace(/[-_]/g, ' ').replace(/\w\S*/g, (txt) => 
      txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
    );
    
    return {
      topicId,
      topicName,
      subtopics: [
        {
          subtopicId: "1",
          subtopicName: `${topicName} Basics`,
          estimatedDuration: 30,
          prerequisites: [],
          learningObjectives: [
            `Understand ${topicName} concepts`,
            `Apply ${topicName} in real situations`,
            `Solve problems involving ${topicName}`
          ],
          stages: {
            concept: {
              introduction: `Let's explore ${topicName}! This is an important mathematical concept that you'll use often.`,
              keyPoints: [
                `Understanding the fundamental principles of ${topicName}`,
                "Learning the key terminology and definitions",
                "Seeing how it applies in real-world situations",
                "Building a strong foundation for further learning"
              ],
              examples: [
                {
                  title: "Basic Example",
                  description: `A fundamental example showing how ${topicName} works`,
                  explanation: "This example helps you understand the core concept"
                },
                {
                  title: "Real-World Application",
                  description: `How ${topicName} is used in everyday life`,
                  explanation: "This shows the practical importance of what you're learning"
                }
              ],
              realWorldApplications: [
                "Practical problem solving",
                "Mathematical reasoning",
                "Building analytical skills",
                "Preparing for advanced topics"
              ]
            },
            guided: {
              introduction: "Let's work through examples together, step by step.",
              stepByStepExamples: [
                {
                  title: "Guided Practice Example",
                  problem: `Let's solve a ${topicName} problem together`,
                  steps: [
                    {
                      stepNumber: 1,
                      instruction: "Start by understanding what we need to find",
                      working: "Identify the key information given",
                      explanation: "This helps us know what approach to take"
                    },
                    {
                      stepNumber: 2,
                      instruction: "Apply the method we learned",
                      working: "Use the correct technique or formula",
                      explanation: "This is where we put our knowledge into practice"
                    },
                    {
                      stepNumber: 3,
                      instruction: "Check our answer makes sense",
                      working: "Verify the solution is reasonable",
                      explanation: "Always check your work to catch any mistakes"
                    }
                  ],
                  finalAnswer: "Solution found successfully",
                  explanation: "Working together helps build confidence and understanding"
                }
              ],
              checkpoints: []
            },
            independent: {
              introduction: "Now it's your turn to practice what you've learned!",
              practiceProblems: [
                {
                  id: "practice-1",
                  question: `Practice applying ${topicName} concepts`,
                  type: "multiple-choice",
                  options: ["Option A", "Option B", "Option C", "Option D"],
                  correctAnswer: "Option A",
                  explanation: "This problem helps reinforce your understanding",
                  difficulty: "medium"
                }
              ],
              selfCheckQuestions: [
                "Do you understand the main concept?",
                "Can you solve similar problems independently?",
                "Are you ready for the assessment?"
              ]
            },
            assessment: {
              introduction: "Time to show what you've learned!",
              questions: [
                {
                  id: "assess-1",
                  question: `Assessment question for ${topicName}`,
                  type: "multiple-choice",
                  options: ["Option A", "Option B", "Option C", "Option D"],
                  correctAnswer: "Option A",
                  explanation: "This tests your mastery of the concept",
                  points: 1
                }
              ],
              passingCriteria: {
                minimumScore: 80,
                totalQuestions: 3
              },
              feedbackMessages: {
                excellent: "Excellent work! You've mastered this concept! 🎉",
                good: "Great job! You understand this well! 👍",
                needsImprovement: "Keep practicing - you're making great progress! 💪"
              }
            }
          }
        }
      ]
    };
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