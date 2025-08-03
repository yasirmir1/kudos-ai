import React from 'react';
import { Target, CreditCard, ChevronRight, Gem, Check } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { useAccessibility } from '@/contexts/AccessibilityContext';

interface LearningSubscriptionSettingsProps {
  settings: {
    difficultyLevel: string;
    practiceGoal: number;
    timePerSession: number;
    showHints: boolean;
    audioFeedback: boolean;
  };
  updateSetting: (category: string, key: string, value: any) => void;
}

export const LearningSubscriptionSettings: React.FC<LearningSubscriptionSettingsProps> = ({ settings, updateSetting }) => {
  const { settings: accessibilitySettings, updateSetting: updateAccessibilitySetting } = useAccessibility();

  const subscription = {
    plan: 'Premium',
    price: '£9.99/month',
    nextBilling: '2024-02-15',
    features: [
      'Unlimited practice questions',
      'Detailed progress analytics',
      'Video tutorials',
      'Parent dashboard',
      'Priority support'
    ]
  };

  return (
    <div className="space-y-6">
      {/* Learning Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Target className="h-5 w-5" />
            <span>Learning Preferences</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Difficulty Level</Label>
              <Select value={settings.difficultyLevel} onValueChange={(value) => updateSetting('learning', 'difficultyLevel', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="beginner">Beginner</SelectItem>
                  <SelectItem value="intermediate">Intermediate</SelectItem>
                  <SelectItem value="advanced">Advanced</SelectItem>
                  <SelectItem value="adaptive">Adaptive (Recommended)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Daily Practice Goal</Label>
              <Select value={settings.practiceGoal.toString()} onValueChange={(value) => updateSetting('learning', 'practiceGoal', parseInt(value))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10 questions</SelectItem>
                  <SelectItem value="20">20 questions</SelectItem>
                  <SelectItem value="30">30 questions</SelectItem>
                  <SelectItem value="50">50 questions</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Show Hints</Label>
                <p className="text-sm text-muted-foreground">Get helpful hints when you're stuck</p>
              </div>
              <Switch
                checked={settings.showHints}
                onCheckedChange={(checked) => updateSetting('learning', 'showHints', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Audio Feedback</Label>
                <p className="text-sm text-muted-foreground">Play sounds for correct/incorrect answers</p>
              </div>
              <Switch
                checked={settings.audioFeedback}
                onCheckedChange={(checked) => updateSetting('learning', 'audioFeedback', checked)}
              />
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <h4 className="font-medium text-foreground">Accessibility</h4>
            
            <div className="space-y-2">
              <Label>Font Size</Label>
              <Select 
                value={accessibilitySettings.fontSize} 
                onValueChange={(value: any) => updateAccessibilitySetting('fontSize', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="small">Small</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="large">Large</SelectItem>
                  <SelectItem value="extra-large">Extra Large</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Dyslexia-Friendly Font</Label>
                <p className="text-sm text-muted-foreground">Use OpenDyslexic font for better readability</p>
              </div>
              <Switch
                checked={accessibilitySettings.dyslexiaFont}
                onCheckedChange={(checked) => updateAccessibilitySetting('dyslexiaFont', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>High Contrast Mode</Label>
                <p className="text-sm text-muted-foreground">Increase contrast for better visibility</p>
              </div>
              <Switch
                checked={accessibilitySettings.highContrast}
                onCheckedChange={(checked) => updateAccessibilitySetting('highContrast', checked)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Subscription */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <CreditCard className="h-5 w-5" />
            <span>Subscription & Billing</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-gradient-to-r from-primary/10 to-primary-glow/10 rounded-lg p-6 border border-primary/20">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="text-lg font-semibold text-foreground">{subscription.plan} Plan</h4>
                <p className="text-primary">{subscription.price}</p>
              </div>
              <div className="flex items-center space-x-2 text-green-600">
                <Check className="h-4 w-4" />
                <span className="text-sm font-medium">Active</span>
              </div>
            </div>
            
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">Next billing: {subscription.nextBilling}</p>
              
              <div className="space-y-2">
                <h5 className="font-medium text-foreground">Plan Features:</h5>
                <ul className="space-y-1">
                  {subscription.features.map((feature, index) => (
                    <li key={index} className="flex items-center space-x-2 text-sm">
                      <Check className="h-3 w-3 text-green-600" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button variant="outline" className="flex items-center space-x-2">
              <span>Manage Subscription</span>
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button variant="outline" className="flex items-center space-x-2">
              <span>Billing History</span>
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button variant="outline" className="flex items-center space-x-2">
              <Gem className="h-4 w-4" />
              <span>Upgrade Plan</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};