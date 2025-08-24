import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Calendar, Target, BarChart3, Brain, Trophy, BookOpen, 
  Users, Clock, CheckCircle, ArrowRight, Play, FileText,
  GraduationCap, PenTool, Lightbulb, TrendingUp, Zap,
  Star, Shield, Award, Eye, Settings, HelpCircle, X, AlertTriangle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Tutorial = () => {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('overview');

  const FeatureHighlight = ({ title, description, icon, benefits, example, badge }: {
    title: string;
    description: string;
    icon: React.ReactNode;
    benefits: string[];
    example?: { title: string; content: React.ReactNode };
    badge?: string;
  }) => (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 p-3 bg-primary/10 rounded-lg">
            {icon}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <CardTitle>{title}</CardTitle>
              {badge && <Badge variant="secondary">{badge}</Badge>}
            </div>
            <CardDescription>{description}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h4 className="mb-3">Key Benefits:</h4>
          <ul className="space-y-2">
            {benefits.map((benefit, index) => (
              <li key={index} className="flex items-start gap-2 text-sm">
                <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                <span>{benefit}</span>
              </li>
            ))}
          </ul>
        </div>
        
        {example && (
          <div className="bg-muted/50 rounded-lg p-4">
            <h4 className="mb-3">{example.title}</h4>
            {example.content}
          </div>
        )}
      </CardContent>
    </Card>
  );

  const ComparisonTable = () => {
    const features = [
      {
        feature: "Adaptive Question System",
        dailyMode: true,
        bootcampMode: true,
        description: "Questions adapt to your performance level"
      },
      {
        feature: "Structured 52-Week Course",
        dailyMode: false,
        bootcampMode: true,
        description: "Progressive curriculum designed for 11+ preparation"
      },
      {
        feature: "Topic Coverage",
        dailyMode: "All topics randomly",
        bootcampMode: "Weekly progression",
        description: "How learning content is organized"
      },
      {
        feature: "Misconception Tracking",
        dailyMode: true,
        bootcampMode: true,
        description: "Identifies and helps fix common mistakes"
      },
      {
        feature: "Performance Analytics",
        dailyMode: "Basic insights",
        bootcampMode: "Comprehensive reports",
        description: "Detailed progress tracking and analysis"
      },
      {
        feature: "Mock Tests",
        dailyMode: false,
        bootcampMode: true,
        description: "Full CEM/GL assessment simulations"
      },
      {
        feature: "Weekly Quizzes",
        dailyMode: false,
        bootcampMode: true,
        description: "Regular assessments building on previous topics"
      },
      {
        feature: "Flexible Schedule",
        dailyMode: true,
        bootcampMode: "Structured",
        description: "How learning is scheduled"
      },
      {
        feature: "Learning Stages",
        dailyMode: "Question-based",
        bootcampMode: "4-stage system",
        description: "Concept introduction, guided practice, independent practice, assessment"
      }
    ];

    const renderFeatureValue = (value: boolean | string) => {
      if (typeof value === "boolean") {
        return value ? (
          <CheckCircle className="w-5 h-5 text-green-600" />
        ) : (
          <X className="w-5 h-5 text-red-500" />
        );
      }
      return <Badge variant="outline">{value}</Badge>;
    };

    return (
      <Card>
        <CardHeader>
          <CardTitle>Daily Mode vs Bootcamp Mode</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-4">Feature</th>
                  <th className="text-center p-4">Daily Mode</th>
                  <th className="text-center p-4">Bootcamp Mode</th>
                </tr>
              </thead>
              <tbody>
                {features.map((feature, index) => (
                  <tr key={index} className="border-b hover:bg-muted/50">
                    <td className="p-4">
                      <div>
                        <div>{feature.feature}</div>
                        {feature.description && (
                          <div className="text-sm text-muted-foreground mt-1">
                            {feature.description}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      {renderFeatureValue(feature.dailyMode)}
                    </td>
                    <td className="p-4 text-center">
                      {renderFeatureValue(feature.bootcampMode)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    );
  };

  const StepGuide = ({ title, steps }: { title: string; steps: Array<{ number: number; title: string; description: string; tips?: string[] }> }) => (
    <div className="space-y-6">
      <h3>{title}</h3>
      <div className="space-y-4">
        {steps.map((step) => (
          <Card key={step.number} className="relative">
            <CardContent className="p-6">
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <Badge variant="secondary" className="w-8 h-8 rounded-full flex items-center justify-center">
                    {step.number}
                  </Badge>
                </div>
                <div className="flex-1">
                  <h4 className="mb-2">{step.title}</h4>
                  <p className="text-muted-foreground mb-4">{step.description}</p>
                  {step.tips && step.tips.length > 0 && (
                    <div className="bg-muted/50 rounded-lg p-4">
                      <div className="text-sm mb-2">💡 Tips:</div>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        {step.tips.map((tip, index) => (
                          <li key={index}>• {tip}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeSection) {
      case 'overview':
        return (
          <div className="space-y-12">
            {/* Hero Section */}
            <div className="bg-primary text-primary-foreground py-20 rounded-2xl">
              <div className="max-w-4xl mx-auto px-6 text-center space-y-8">
                <h1 className="text-5xl max-w-4xl mx-auto leading-tight">
                  The 11+ Prep Platform That Actually Understands How Your Child Learns
                </h1>
                <p className="text-xl opacity-90">
                  Stop guessing what your child needs to work on. Our AI identifies exactly where they're struggling and why.
                </p>
                <Button 
                  onClick={() => navigate('/dashboard')}
                  size="lg" 
                  variant="secondary"
                  className="bg-background text-foreground hover:bg-background/90"
                >
                  Start Free Assessment
                </Button>
                <div className="text-sm opacity-75">No credit card required • See results in 10 minutes</div>
              </div>
            </div>

            {/* What Makes Us Different */}
            <section className="space-y-12">
              <div className="text-center space-y-4">
                <h2 className="text-4xl">Finally, 11+ Prep That Makes Sense</h2>
                <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                  Traditional 11+ practice gives you a score. We tell you exactly what your child got wrong and why they got it wrong.
                </p>
              </div>

              <div className="grid lg:grid-cols-2 gap-12 items-center">
                <div className="space-y-6">
                  <div className="bg-destructive/10 border border-destructive/20 p-6 rounded-xl">
                    <h4 className="mb-3 text-destructive">Traditional Approach:</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <X className="w-4 h-4 text-destructive" />
                        <span className="line-through">3 × 5 = 8</span>
                      </div>
                      <p className="text-destructive">❌ Incorrect. Try again.</p>
                    </div>
                  </div>
                  
                  <div className="bg-green-50 border border-green-200 p-6 rounded-xl">
                    <h4 className="mb-3 text-green-800">Our Approach:</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <X className="w-4 h-4 text-destructive" />
                        <span className="line-through">3 × 5 = 8</span>
                      </div>
                      <div className="bg-green-100 p-3 rounded-lg">
                        <p className="text-green-800">
                          <strong>Misconception detected:</strong> Your child is adding (3 + 5) instead of multiplying. 
                          We'll focus on multiplication concepts and provide targeted practice.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <h3>The result?</h3>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-600 mt-1" />
                      <span>Targeted practice that actually fixes the problem</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-600 mt-1" />
                      <span>No more repetitive practice of concepts they already know</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-600 mt-1" />
                      <span>Clear understanding of why mistakes happen</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-600 mt-1" />
                      <span>Faster improvement with less frustration</span>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Two Learning Modes */}
            <section className="space-y-16">
              <div className="text-center space-y-6">
                <h2 className="text-4xl">Two Ways to Prepare - Choose What Works for Your Child</h2>
              </div>
              
              <div className="space-y-8">
                <div className="grid lg:grid-cols-2 gap-12">
                  <Card className="border-2 border-blue-200 bg-blue-50/30 h-full">
                    <CardHeader className="pb-6">
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 p-3 bg-blue-600/10 rounded-lg">
                          <Target className="w-8 h-8 text-blue-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-xl mb-3">Daily Mode: Smart Practice for Busy Families</CardTitle>
                          <CardDescription className="text-blue-600 text-base leading-relaxed">
                            Perfect for children who know the basics but need to strengthen weak spots
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="space-y-8 pt-0">
                      <div className="space-y-5">
                        <div className="flex items-start gap-4">
                          <CheckCircle className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                          <span className="text-sm leading-relaxed">
                            <strong>15-30 minutes daily</strong> - fits around school and activities
                          </span>
                        </div>
                        <div className="flex items-start gap-4">
                          <CheckCircle className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                          <span className="text-sm leading-relaxed">
                            <strong>Questions adapt in real-time</strong> - gets harder when they're doing well, focuses on struggles
                          </span>
                        </div>
                        <div className="flex items-start gap-4">
                          <CheckCircle className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                          <span className="text-sm leading-relaxed">
                            <strong>All topics covered systematically</strong> - ensures nothing gets forgotten
                          </span>
                        </div>
                        <div className="flex items-start gap-4">
                          <CheckCircle className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                          <span className="text-sm leading-relaxed">
                            <strong>Identifies specific mistakes</strong> - understand if it's careless error or genuine knowledge gap
                          </span>
                        </div>
                      </div>
                      
                      <div className="bg-blue-100/80 p-5 rounded-lg border border-blue-200">
                        <p className="text-sm text-blue-800 leading-relaxed">
                          <strong>Best for:</strong> Children already familiar with 11+ topics who need targeted improvement
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="border-2 border-orange-200 bg-orange-50/30 h-full">
                    <CardHeader className="pb-6">
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 p-3 bg-orange-600/10 rounded-lg">
                          <Zap className="w-8 h-8 text-orange-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-xl mb-3">Bootcamp Mode: Complete 11+ Mastery Course</CardTitle>
                          <CardDescription className="text-orange-600 text-base leading-relaxed">
                            Comprehensive preparation from start to finish
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="space-y-8 pt-0">
                      <div className="space-y-5">
                        <div className="flex items-start gap-4">
                          <CheckCircle className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                          <span className="text-sm leading-relaxed">
                            <strong>52-week structured curriculum</strong> - one full year of preparation
                          </span>
                        </div>
                        <div className="flex items-start gap-4">
                          <CheckCircle className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                          <span className="text-sm leading-relaxed">
                            <strong>Weekly quizzes</strong> covering everything learned so far
                          </span>
                        </div>
                        <div className="flex items-start gap-4">
                          <CheckCircle className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                          <span className="text-sm leading-relaxed">
                            <strong>Full mock papers</strong> that simulate real CEM and GL exams
                          </span>
                        </div>
                        <div className="flex items-start gap-4">
                          <CheckCircle className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                          <span className="text-sm leading-relaxed">
                            <strong>Step-by-step progression</strong> - builds confidence systematically
                          </span>
                        </div>
                      </div>
                      
                      <div className="bg-orange-100/80 p-5 rounded-lg border border-orange-200">
                        <p className="text-sm text-orange-800 leading-relaxed">
                          <strong>Best for:</strong> Starting 11+ preparation from scratch or want comprehensive coverage
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* CTA Buttons Row */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center max-w-lg mx-auto">
                  <Button 
                    onClick={() => navigate('/dashboard')}
                    className="w-full sm:w-auto h-12 text-base px-8"
                    size="lg"
                  >
                    Try Daily Mode <ArrowRight className="h-5 w-5 ml-2" />
                  </Button>
                  
                  <Button 
                    onClick={() => navigate('/bootcamp')}
                    className="w-full sm:w-auto h-12 text-base px-8"
                    size="lg"
                    variant="outline"
                  >
                    Enter Bootcamp <ArrowRight className="h-5 w-5 ml-2" />
                  </Button>
                </div>
              </div>
            </section>

            <ComparisonTable />
          </div>
        );

      case 'daily-mode':
        return (
          <div className="space-y-8">
            <FeatureHighlight
              title="Daily Mode: Smart Practice for Busy Families"
              description="Flexible daily practice designed to identify and strengthen learning areas"
              icon={<Calendar className="w-6 h-6" />}
              badge="15-30 min daily"
              benefits={[
                "Questions adapt in real-time to your child's performance",
                "All topics covered systematically to ensure nothing is forgotten", 
                "Misconception tracking identifies specific learning gaps",
                "Performance analytics show detailed progress by topic and subtopic",
                "Flexible schedule that fits around school and activities"
              ]}
              example={{
                title: "How it works",
                content: (
                  <div className="space-y-3 text-sm">
                    <div className="flex items-start gap-3">
                      <Zap className="h-5 w-5 mt-1 text-primary" />
                      <div>
                        <strong>Adaptive Questions:</strong> The system presents questions from all topics, adapting difficulty based on your performance
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Brain className="h-5 w-5 mt-1 text-primary" />
                      <div>
                        <strong>Misconception Tracking:</strong> Each incorrect answer is analyzed to identify specific learning gaps
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <BarChart3 className="h-5 w-5 mt-1 text-primary" />
                      <div>
                        <strong>Performance Insights:</strong> Detailed analytics show progress by topic, subtopic, and common mistakes
                      </div>
                    </div>
                  </div>
                )
              }}
            />

            <Card className="border-l-4 border-primary">
              <CardContent className="p-6">
                <h4 className="mb-3">For Parents</h4>
                <p className="text-muted-foreground">
                  Monitor your child's progress through detailed reports showing strengths, weaknesses, 
                  and specific areas that need attention. Set daily practice goals and track consistency.
                </p>
              </CardContent>
            </Card>
          </div>
        );

      case 'bootcamp-mode':
        return (
          <div className="space-y-8">
            <FeatureHighlight
              title="Bootcamp Mode: Complete 11+ Mastery Course"
              description="Complete 52-week interactive course for 11+ grammar school entrance exam preparation"
              icon={<Target className="w-6 h-6" />}
              badge="52-week course"
              benefits={[
                "Structured 52-week curriculum designed specifically for 11+ preparation",
                "Interactive learning stages: concept introduction, guided practice, independent practice, assessment",
                "Weekly quizzes that progressively cover all topics learned so far",
                "Full mock papers that closely simulate CEM and GL assessment formats",
                "Comprehensive analytics tracking weekly progress and mock test performance"
              ]}
              example={{
                title: "Learning Journey Structure",
                content: (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                      { icon: Lightbulb, title: 'Concept Introduction', desc: 'Learn new topics with clear explanations' },
                      { icon: Users, title: 'Guided Practice', desc: 'Practice with step-by-step support' },
                      { icon: PenTool, title: 'Independent Practice', desc: 'Apply knowledge on your own' },
                      { icon: CheckCircle, title: 'Assessment', desc: 'Test understanding and track progress' }
                    ].map((stage, index) => (
                      <div key={index} className="text-center">
                        <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mx-auto mb-3">
                          <stage.icon className="h-6 w-6 text-primary-foreground" />
                        </div>
                        <h4 className="font-semibold text-sm mb-1">{stage.title}</h4>
                        <p className="text-xs text-muted-foreground">{stage.desc}</p>
                      </div>
                    ))}
                  </div>
                )
              }}
            />

            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Trophy className="h-5 w-5" />
                    Weekly Quizzes
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  <p>Progressive testing that covers all topics learned so far. Each week builds on previous knowledge, ensuring comprehensive understanding.</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <GraduationCap className="h-5 w-5" />
                    Mock Tests
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  <p>Practice papers that closely simulate CEM and GL assessment formats, providing realistic exam experience and preparation.</p>
                </CardContent>
              </Card>
            </div>

            <Card className="border-l-4 border-primary">
              <CardContent className="p-6">
                <h4 className="mb-3">11+ Exam Focus</h4>
                <p className="text-muted-foreground">
                  Specifically designed for students preparing for 11+ grammar school entrance exams. 
                  Covers all mathematical concepts tested by major exam boards including CEM and GL Assessment.
                </p>
              </CardContent>
            </Card>
          </div>
        );

      case 'getting-started':
        return (
          <div className="space-y-8">
            <div className="grid md:grid-cols-2 gap-8">
              <StepGuide
                title="For Students"
                steps={[
                  {
                    number: 1,
                    title: "Create your account and set your age group",
                    description: "Sign up and tell us your current year level so we can provide age-appropriate questions",
                    tips: ["Choose your correct school year for best results", "You can change this later in settings"]
                  },
                  {
                    number: 2,
                    title: "Choose between Daily Mode or Bootcamp",
                    description: "Select the learning approach that best fits your goals and schedule",
                    tips: ["Daily Mode for flexible practice", "Bootcamp for structured 11+ preparation"]
                  },
                  {
                    number: 3,
                    title: "Start with a few practice questions",
                    description: "Take the initial assessment to help us understand your current level",
                    tips: ["Answer honestly for best results", "Don't worry about getting everything right"]
                  },
                  {
                    number: 4,
                    title: "Review your performance in the analytics section",
                    description: "Check your progress and see which topics you're strongest and weakest in",
                    tips: ["Look for patterns in your mistakes", "Focus on understanding, not just scores"]
                  }
                ]}
              />

              <StepGuide
                title="For Parents"
                steps={[
                  {
                    number: 1,
                    title: "Set up your child's account with appropriate age group",
                    description: "Help your child create their account and ensure the correct year level is selected",
                    tips: ["Supervise the initial setup", "Verify the age group matches their school year"]
                  },
                  {
                    number: 2,
                    title: "Explore the analytics dashboard",
                    description: "Understand how to read the reports and what they tell you about your child's progress",
                    tips: ["Focus on misconception patterns", "Look for trends over time, not just daily scores"]
                  },
                  {
                    number: 3,
                    title: "Review misconception tracking",
                    description: "Learn how to identify weak areas and support your child's learning at home",
                    tips: ["Discuss mistakes without judgment", "Use insights to guide additional practice"]
                  },
                  {
                    number: 4,
                    title: "Set daily practice goals and routines",
                    description: "Establish consistent practice habits and celebrate progress",
                    tips: ["Start with achievable goals", "Consistency is more important than duration"]
                  }
                ]}
              />
            </div>

            <Card className="bg-muted/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <HelpCircle className="h-5 w-5" />
                  Need Help?
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm mb-4">
                  If you need assistance getting started or have questions about using the platform, 
                  we're here to help. Contact our support team or explore our detailed help resources.
                </p>
                <div className="flex gap-3">
                  <Button variant="outline" size="sm">
                    <FileText className="h-4 w-4 mr-2" />
                    Help Center
                  </Button>
                  <Button variant="outline" size="sm">
                    <Settings className="h-4 w-4 mr-2" />
                    Account Settings
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl mb-4">
            How to Use Kudos Academy
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Master mathematics with our two powerful learning modes designed for different goals and learning styles
          </p>
        </div>

        {/* Navigation */}
        <div className="flex flex-wrap gap-2 justify-center mb-8">
          {[
            { id: 'overview', label: 'Overview', icon: Eye },
            { id: 'daily-mode', label: 'Daily Mode', icon: Calendar },
            { id: 'bootcamp-mode', label: 'Bootcamp', icon: Target },
            { id: 'getting-started', label: 'Getting Started', icon: Play }
          ].map(({ id, label, icon: Icon }) => (
            <Button
              key={id}
              variant={activeSection === id ? "default" : "outline"}
              onClick={() => setActiveSection(id)}
              className="flex items-center gap-2"
            >
              <Icon className="h-4 w-4" />
              {label}
            </Button>
          ))}
        </div>

        {/* Content */}
        <div className="max-w-6xl mx-auto">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default Tutorial;