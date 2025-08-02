import React, { useState } from 'react';
import { Search, HelpCircle, Play, Brain, Settings, CreditCard, MessageCircle, Mail, FileText, ChevronRight, Check, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

interface FAQItem {
  category: string;
  question: string;
  answer: string;
  helpful: number;
  notHelpful: number;
}

interface HelpCategory {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
}

const helpCategories: HelpCategory[] = [
  { id: 'all', name: 'All Topics', icon: HelpCircle },
  { id: 'getting-started', name: 'Getting Started', icon: Play },
  { id: 'practice', name: 'Practice & Learning', icon: Brain },
  { id: 'technical', name: 'Technical Issues', icon: Settings },
  { id: 'subscription', name: 'Subscription', icon: CreditCard }
];

const faqItems: FAQItem[] = [
  {
    category: 'getting-started',
    question: 'How do I create a practice schedule?',
    answer: 'Go to Settings > Learning Preferences to set up daily reminders and customize your practice schedule. You can choose the time, days, and number of questions for your daily practice goals.',
    helpful: 45,
    notHelpful: 2
  },
  {
    category: 'practice',
    question: 'What are diagnostic questions?',
    answer: 'Diagnostic questions are specially designed to identify specific misconceptions and provide targeted feedback. They help us understand exactly where you might be struggling and provide personalized help.',
    helpful: 67,
    notHelpful: 5
  },
  {
    category: 'subscription',
    question: 'Can I change my subscription plan?',
    answer: 'Yes, you can upgrade or downgrade your plan at any time from Settings > Subscription. Changes will take effect on your next billing cycle.',
    helpful: 23,
    notHelpful: 1
  },
  {
    category: 'practice',
    question: 'How does the adaptive difficulty work?',
    answer: 'Our adaptive system tracks your performance and adjusts question difficulty in real-time. If you\'re getting questions right consistently, we\'ll give you harder ones. If you\'re struggling, we\'ll provide more practice at your current level.',
    helpful: 34,
    notHelpful: 3
  },
  {
    category: 'technical',
    question: 'The app is running slowly on my device',
    answer: 'Try closing other apps, restarting your browser, or clearing your browser cache. If problems persist, contact our support team with details about your device and browser.',
    helpful: 18,
    notHelpful: 7
  }
];

const HelpCenter: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const filteredFAQs = faqItems.filter(item => {
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesSearch = searchQuery === '' || 
      item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="max-w-6xl mx-auto p-6">
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">How can we help?</h1>
            <p className="text-muted-foreground">Search our help center or browse by category</p>
          </div>

          <div className="max-w-2xl mx-auto mb-8">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search for help..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-2 mb-8">
            {helpCategories.map(cat => (
              <Button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                variant={selectedCategory === cat.id ? "default" : "outline"}
                size="sm"
                className="flex items-center space-x-2"
              >
                <cat.icon className="h-4 w-4" />
                <span>{cat.name}</span>
              </Button>
            ))}
          </div>

          <div className="max-w-3xl mx-auto space-y-4">
            {filteredFAQs.length > 0 ? (
              filteredFAQs.map((item, index) => (
                <FAQItemComponent key={index} item={item} />
              ))
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No articles found matching your search.</p>
                <Button variant="outline" className="mt-4" onClick={() => setSearchQuery('')}>
                  Clear Search
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <ContactCard
          icon={MessageCircle}
          title="Live Chat"
          description="Chat with our support team"
          action="Start Chat"
          available={true}
        />
        <ContactCard
          icon={Mail}
          title="Email Support"
          description="Get help via email"
          action="Send Email"
          available={true}
        />
        <ContactCard
          icon={FileText}
          title="User Guide"
          description="Browse our documentation"
          action="View Guide"
          available={true}
        />
      </div>
    </div>
  );
};

interface FAQItemComponentProps {
  item: FAQItem;
}

const FAQItemComponent: React.FC<FAQItemComponentProps> = ({ item }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [feedback, setFeedback] = useState<'helpful' | 'not-helpful' | null>(null);

  return (
    <Card className="border border-border">
      <CardContent className="p-0">
        <Button
          onClick={() => setIsExpanded(!isExpanded)}
          variant="ghost"
          className="w-full p-4 justify-between text-left h-auto"
        >
          <div className="flex items-start space-x-3">
            <Badge variant="secondary" className="mt-0.5">
              {item.category.replace('-', ' ')}
            </Badge>
            <h3 className="font-medium text-foreground">{item.question}</h3>
          </div>
          <ChevronRight className={`h-5 w-5 text-muted-foreground transform transition-transform ${
            isExpanded ? 'rotate-90' : ''
          }`} />
        </Button>
        
        {isExpanded && (
          <div className="p-4 pt-0 border-t border-border">
            <p className="text-muted-foreground mb-4">{item.answer}</p>
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">Was this helpful?</p>
              <div className="flex items-center space-x-2">
                <Button
                  onClick={() => setFeedback('helpful')}
                  variant={feedback === 'helpful' ? 'default' : 'outline'}
                  size="sm"
                  className="flex items-center space-x-1"
                >
                  <Check className="h-3 w-3" />
                  <span className="text-xs">{item.helpful}</span>
                </Button>
                <Button
                  onClick={() => setFeedback('not-helpful')}
                  variant={feedback === 'not-helpful' ? 'destructive' : 'outline'}
                  size="sm"
                  className="flex items-center space-x-1"
                >
                  <X className="h-3 w-3" />
                  <span className="text-xs">{item.notHelpful}</span>
                </Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

interface ContactCardProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  action: string;
  available: boolean;
}

const ContactCard: React.FC<ContactCardProps> = ({ icon: Icon, title, description, action, available }) => {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6 text-center">
        <Icon className="h-8 w-8 text-primary mx-auto mb-4" />
        <h3 className="font-semibold text-foreground mb-2">{title}</h3>
        <p className="text-sm text-muted-foreground mb-4">{description}</p>
        <Button 
          variant={available ? "default" : "outline"}
          disabled={!available}
          className="w-full"
        >
          {action}
        </Button>
        {available && (
          <p className="text-xs text-muted-foreground mt-2">Available 9am-6pm GMT</p>
        )}
      </CardContent>
    </Card>
  );
};

export default HelpCenter;