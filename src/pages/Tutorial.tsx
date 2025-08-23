import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Calendar, Target, BarChart3, Brain, Trophy, BookOpen, 
  Users, Clock, CheckCircle, ArrowRight, Play, FileText,
  GraduationCap, PenTool, Lightbulb, TrendingUp, Zap,
  Star, Shield, Award, Eye, Settings, HelpCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Tutorial = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');

  const features = {
    dailyMode: [
      { icon: Calendar, title: 'Daily Questions', desc: 'Answer questions across all topics every day' },
      { icon: Brain, title: 'Misconception Tracking', desc: 'Identify and address specific learning gaps' },
      { icon: BarChart3, title: 'Performance Analytics', desc: 'Detailed insights by topic and subtopic' },
      { icon: TrendingUp, title: 'Adaptive Learning', desc: 'Questions adapt to your strengths and weaknesses' }
    ],
    bootcamp: [
      { icon: Target, title: '52-Week Course', desc: 'Structured programme for 11+ exam preparation' },
      { icon: BookOpen, title: 'Interactive Learning', desc: 'Concept introduction, practice, and assessment' },
      { icon: Trophy, title: 'Weekly Quizzes', desc: 'Progressive testing covering all learned topics' },
      { icon: GraduationCap, title: 'Mock Tests', desc: 'CEM and GL assessment simulation' }
    ]
  };

  const learningStages = [
    { icon: Lightbulb, title: 'Concept Introduction', desc: 'Learn new topics with clear explanations' },
    { icon: Users, title: 'Guided Practice', desc: 'Practice with step-by-step support' },
    { icon: PenTool, title: 'Independent Practice', desc: 'Apply knowledge on your own' },
    { icon: CheckCircle, title: 'Assessment', desc: 'Test understanding and track progress' }
  ];

  const FeatureCard = ({ icon: Icon, title, desc }: { icon: any, title: string, desc: string }) => (
    <Card className="h-full hover:shadow-lg transition-all duration-300 hover:scale-105">
      <CardContent className="p-6 text-center">
        <Icon className="h-12 w-12 mx-auto mb-4 text-primary" />
        <h3 className="font-semibold mb-2">{title}</h3>
        <p className="text-sm text-muted-foreground">{desc}</p>
      </CardContent>
    </Card>
  );

  const ComparisonTable = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Eye className="h-5 w-5" />
          Feature Comparison
        </CardTitle>
        <CardDescription>
          Choose the learning mode that best fits your needs
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b">
                <th className="text-left p-4 font-medium">Feature</th>
                <th className="text-center p-4 font-medium">
                  <Badge variant="outline" className="bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700">
                    Daily Mode
                  </Badge>
                </th>
                <th className="text-center p-4 font-medium">
                  <Badge variant="outline" className="bg-gradient-to-r from-emerald-50 to-emerald-100 text-emerald-700">
                    Bootcamp
                  </Badge>
                </th>
              </tr>
            </thead>
            <tbody>
              {[
                ['Question Pool', 'All topics mixed', '52-week curriculum'],
                ['Learning Structure', 'Flexible daily practice', 'Sequential weekly modules'],
                ['Analytics', 'Topic performance tracking', 'Weekly progress + mock tests'],
                ['Target Audience', 'General practice', '11+ exam preparation'],
                ['Time Commitment', '15-30 minutes daily', '1-2 hours weekly'],
                ['Assessment Style', 'Continuous evaluation', 'Weekly quizzes + mock papers']
              ].map(([feature, daily, bootcamp], index) => (
                <tr key={index} className="border-b hover:bg-muted/30">
                  <td className="p-4 font-medium">{feature}</td>
                  <td className="p-4 text-center text-sm">{daily}</td>
                  <td className="p-4 text-center text-sm">{bootcamp}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gradient-learning">
      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-primary bg-clip-text text-transparent">
            How to Use Kudos Academy
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Master mathematics with our two powerful learning modes designed for different goals and learning styles
          </p>
        </div>

        {/* Quick Navigation */}
        <div className="flex flex-wrap gap-2 justify-center mb-8">
          {[
            { id: 'overview', label: 'Overview', icon: Eye },
            { id: 'daily', label: 'Daily Mode', icon: Calendar },
            { id: 'bootcamp', label: 'Bootcamp', icon: Target },
            { id: 'getting-started', label: 'Getting Started', icon: Play }
          ].map(({ id, label, icon: Icon }) => (
            <Button
              key={id}
              variant={activeTab === id ? "default" : "outline"}
              onClick={() => setActiveTab(id)}
              className="flex items-center gap-2"
            >
              <Icon className="h-4 w-4" />
              {label}
            </Button>
          ))}
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <TabsList className="hidden">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="daily">Daily Mode</TabsTrigger>
            <TabsTrigger value="bootcamp">Bootcamp</TabsTrigger>
            <TabsTrigger value="getting-started">Getting Started</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-8">
            <ComparisonTable />
            
            <div className="grid md:grid-cols-2 gap-8">
              <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-blue-700">
                    <Calendar className="h-5 w-5" />
                    Daily Mode
                  </CardTitle>
                  <CardDescription className="text-blue-600">
                    Perfect for ongoing practice and skill maintenance
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    {features.dailyMode.map((feature, index) => (
                      <div key={index} className="text-center">
                        <feature.icon className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                        <h4 className="font-medium text-sm text-blue-800">{feature.title}</h4>
                      </div>
                    ))}
                  </div>
                  <Button 
                    onClick={() => navigate('/dashboard')}
                    className="w-full bg-blue-600 hover:bg-blue-700"
                  >
                    Try Daily Mode <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-emerald-700">
                    <Target className="h-5 w-5" />
                    Bootcamp
                  </CardTitle>
                  <CardDescription className="text-emerald-600">
                    Structured 52-week course for 11+ exam success
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    {features.bootcamp.map((feature, index) => (
                      <div key={index} className="text-center">
                        <feature.icon className="h-8 w-8 mx-auto mb-2 text-emerald-600" />
                        <h4 className="font-medium text-sm text-emerald-800">{feature.title}</h4>
                      </div>
                    ))}
                  </div>
                  <Button 
                    onClick={() => navigate('/bootcamp')}
                    className="w-full bg-emerald-600 hover:bg-emerald-700"
                  >
                    Enter Bootcamp <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="daily" className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Daily Mode Guide
                </CardTitle>
                <CardDescription>
                  Flexible daily practice designed to identify and strengthen learning areas
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  {features.dailyMode.map((feature, index) => (
                    <FeatureCard key={index} {...feature} />
                  ))}
                </div>
                
                <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-6 rounded-lg">
                  <h3 className="font-semibold mb-4 text-blue-800">How Daily Mode Works</h3>
                  <div className="space-y-3 text-sm text-blue-700">
                    <div className="flex items-start gap-3">
                      <Zap className="h-5 w-5 mt-1 text-blue-600" />
                      <div>
                        <strong>Adaptive Questions:</strong> The system presents questions from all topics, adapting difficulty based on your performance
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Brain className="h-5 w-5 mt-1 text-blue-600" />
                      <div>
                        <strong>Misconception Tracking:</strong> Each incorrect answer is analyzed to identify specific learning gaps
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <BarChart3 className="h-5 w-5 mt-1 text-blue-600" />
                      <div>
                        <strong>Performance Insights:</strong> Detailed analytics show progress by topic, subtopic, and common mistakes
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border-l-4 border-blue-500 pl-4">
                  <h4 className="font-semibold text-blue-800">For Parents</h4>
                  <p className="text-sm text-blue-700 mt-1">
                    Monitor your child's progress through detailed reports showing strengths, weaknesses, 
                    and specific areas that need attention. Set daily practice goals and track consistency.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="bootcamp" className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Bootcamp Guide
                </CardTitle>
                <CardDescription>
                  Complete 52-week interactive course for 11+ grammar school entrance exam preparation
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  {features.bootcamp.map((feature, index) => (
                    <FeatureCard key={index} {...feature} />
                  ))}
                </div>

                <Card className="bg-gradient-to-r from-emerald-50 to-emerald-100 border-emerald-200">
                  <CardHeader>
                    <CardTitle className="text-emerald-800">Learning Journey Structure</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-4 gap-4">
                      {learningStages.map((stage, index) => (
                        <div key={index} className="text-center">
                          <div className="w-12 h-12 bg-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3">
                            <stage.icon className="h-6 w-6 text-white" />
                          </div>
                          <h4 className="font-semibold text-sm text-emerald-800 mb-1">{stage.title}</h4>
                          <p className="text-xs text-emerald-700">{stage.desc}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <div className="grid md:grid-cols-2 gap-6">
                  <Card className="border-emerald-200">
                    <CardHeader>
                      <CardTitle className="text-emerald-800 flex items-center gap-2">
                        <Trophy className="h-5 w-5" />
                        Weekly Quizzes
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm text-emerald-700">
                      <p>Progressive testing that covers all topics learned so far. Each week builds on previous knowledge, ensuring comprehensive understanding.</p>
                    </CardContent>
                  </Card>

                  <Card className="border-emerald-200">
                    <CardHeader>
                      <CardTitle className="text-emerald-800 flex items-center gap-2">
                        <GraduationCap className="h-5 w-5" />
                        Mock Tests
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm text-emerald-700">
                      <p>Practice papers that closely simulate CEM and GL assessment formats, providing realistic exam experience and preparation.</p>
                    </CardContent>
                  </Card>
                </div>

                <div className="border-l-4 border-emerald-500 pl-4">
                  <h4 className="font-semibold text-emerald-800">11+ Exam Focus</h4>
                  <p className="text-sm text-emerald-700 mt-1">
                    Specifically designed for students preparing for 11+ grammar school entrance exams. 
                    Covers all mathematical concepts tested by major exam boards including CEM and GL Assessment.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="getting-started" className="space-y-8">
            <div className="grid md:grid-cols-2 gap-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    For Students
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    {[
                      'Create your account and set your age group',
                      'Choose between Daily Mode or Bootcamp',
                      'Start with a few practice questions',
                      'Review your performance in the analytics section',
                      'Use the visual math tools when needed',
                      'Track your progress and celebrate achievements'
                    ].map((step, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-xs text-white font-bold">
                          {index + 1}
                        </div>
                        <span className="text-sm">{step}</span>
                      </div>
                    ))}
                  </div>
                  <Button onClick={() => navigate('/dashboard')} className="w-full">
                    Start Learning <Play className="h-4 w-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    For Parents
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    {[
                      'Set up your child\'s account with appropriate age group',
                      'Explore the analytics dashboard to understand reports',
                      'Review misconception tracking to identify weak areas',
                      'Set daily practice goals and routines',
                      'Monitor weekly progress and celebrate improvements',
                      'Use insights to support learning at home'
                    ].map((step, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-xs text-white font-bold">
                          {index + 1}
                        </div>
                        <span className="text-sm">{step}</span>
                      </div>
                    ))}
                  </div>
                  <Button onClick={() => navigate('/analytics')} variant="outline" className="w-full">
                    View Analytics <BarChart3 className="h-4 w-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-gradient-focus bg-opacity-10 border-primary">
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
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Tutorial;