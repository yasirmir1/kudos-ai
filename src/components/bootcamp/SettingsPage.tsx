import React, { useState } from 'react';
import { Bell, User, Shield, Volume2, FileText, Sun, Users, Target, Download, Trash2, CreditCard, ChevronRight, Gem, Check } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';

interface SettingsState {
  profile: {
    displayName: string;
    email: string;
    avatar: string;
    grade: string;
    school: string;
  };
  notifications: {
    practiceReminders: boolean;
    achievementAlerts: boolean;
    weeklyReports: boolean;
    emailUpdates: boolean;
    reminderTime: string;
    reminderDays: string[];
  };
  learning: {
    difficultyLevel: string;
    practiceGoal: number;
    timePerSession: number;
    showHints: boolean;
    audioFeedback: boolean;
    fontSize: string;
    dyslexiaFont: boolean;
    highContrast: boolean;
  };
  privacy: {
    shareProgress: string;
    showOnLeaderboard: boolean;
    allowChallenges: boolean;
  };
}

const SettingsPage: React.FC = () => {
  const [settings, setSettings] = useState<SettingsState>({
    profile: {
      displayName: 'Alex Thompson',
      email: 'alex.thompson@email.com',
      avatar: '/avatars/alex.png',
      grade: 'Year 6',
      school: 'Riverside Primary School'
    },
    notifications: {
      practiceReminders: true,
      achievementAlerts: true,
      weeklyReports: false,
      emailUpdates: true,
      reminderTime: '16:00',
      reminderDays: ['monday', 'wednesday', 'friday']
    },
    learning: {
      difficultyLevel: 'adaptive',
      practiceGoal: 20,
      timePerSession: 15,
      showHints: true,
      audioFeedback: false,
      fontSize: 'medium',
      dyslexiaFont: false,
      highContrast: false
    },
    privacy: {
      shareProgress: 'parents',
      showOnLeaderboard: true,
      allowChallenges: true
    }
  });

  const updateSetting = (category: keyof SettingsState, key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value
      }
    }));
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Settings</h1>
        <p className="text-muted-foreground">Manage your account and learning preferences</p>
      </div>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="learning">Learning</TabsTrigger>
          <TabsTrigger value="privacy">Privacy</TabsTrigger>
          <TabsTrigger value="subscription">Subscription</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="mt-6">
          <ProfileSettings settings={settings.profile} updateSetting={updateSetting} />
        </TabsContent>

        <TabsContent value="notifications" className="mt-6">
          <NotificationSettings settings={settings.notifications} updateSetting={updateSetting} />
        </TabsContent>

        <TabsContent value="learning" className="mt-6">
          <LearningSettings settings={settings.learning} updateSetting={updateSetting} />
        </TabsContent>

        <TabsContent value="privacy" className="mt-6">
          <PrivacySettings settings={settings.privacy} updateSetting={updateSetting} />
        </TabsContent>

        <TabsContent value="subscription" className="mt-6">
          <SubscriptionSettings />
        </TabsContent>
      </Tabs>
    </div>
  );
};

const ProfileSettings: React.FC<{ settings: any; updateSetting: any }> = ({ settings, updateSetting }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <User className="h-5 w-5" />
          <span>Profile Information</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center space-x-6">
          <Avatar className="h-20 w-20">
            <AvatarImage src={settings.avatar} alt={settings.displayName} />
            <AvatarFallback>
              {settings.displayName.split(' ').map((n: string) => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
          <div className="space-y-2">
            <Button variant="outline" size="sm">Change Photo</Button>
            <Button variant="ghost" size="sm" className="text-destructive">Remove Photo</Button>
          </div>
        </div>

        <Separator />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="displayName">Display Name</Label>
            <Input
              id="displayName"
              value={settings.displayName}
              onChange={(e) => updateSetting('profile', 'displayName', e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              value={settings.email}
              onChange={(e) => updateSetting('profile', 'email', e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="grade">Grade/Year</Label>
            <Select value={settings.grade} onValueChange={(value) => updateSetting('profile', 'grade', value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Year 5">Year 5</SelectItem>
                <SelectItem value="Year 6">Year 6</SelectItem>
                <SelectItem value="Year 7">Year 7</SelectItem>
                <SelectItem value="Year 8">Year 8</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="school">School</Label>
            <Input
              id="school"
              value={settings.school}
              onChange={(e) => updateSetting('profile', 'school', e.target.value)}
            />
          </div>
        </div>

        <div className="pt-4">
          <Button>Save Changes</Button>
        </div>
      </CardContent>
    </Card>
  );
};

const NotificationSettings: React.FC<{ settings: any; updateSetting: any }> = ({ settings, updateSetting }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Bell className="h-5 w-5" />
          <span>Notification Preferences</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Practice Reminders</Label>
              <p className="text-sm text-muted-foreground">Get notified when it's time to practice</p>
            </div>
            <Switch
              checked={settings.practiceReminders}
              onCheckedChange={(checked) => updateSetting('notifications', 'practiceReminders', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Achievement Alerts</Label>
              <p className="text-sm text-muted-foreground">Celebrate when you unlock achievements</p>
            </div>
            <Switch
              checked={settings.achievementAlerts}
              onCheckedChange={(checked) => updateSetting('notifications', 'achievementAlerts', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Weekly Reports</Label>
              <p className="text-sm text-muted-foreground">Summary of your weekly progress</p>
            </div>
            <Switch
              checked={settings.weeklyReports}
              onCheckedChange={(checked) => updateSetting('notifications', 'weeklyReports', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Email Updates</Label>
              <p className="text-sm text-muted-foreground">Important updates via email</p>
            </div>
            <Switch
              checked={settings.emailUpdates}
              onCheckedChange={(checked) => updateSetting('notifications', 'emailUpdates', checked)}
            />
          </div>
        </div>

        {settings.practiceReminders && (
          <>
            <Separator />
            <div className="space-y-4">
              <h4 className="font-medium text-foreground">Reminder Schedule</h4>
              
              <div className="space-y-2">
                <Label>Reminder Time</Label>
                <Input
                  type="time"
                  value={settings.reminderTime}
                  onChange={(e) => updateSetting('notifications', 'reminderTime', e.target.value)}
                />
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

const LearningSettings: React.FC<{ settings: any; updateSetting: any }> = ({ settings, updateSetting }) => {
  return (
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
            <Select value={settings.fontSize} onValueChange={(value) => updateSetting('learning', 'fontSize', value)}>
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
              checked={settings.dyslexiaFont}
              onCheckedChange={(checked) => updateSetting('learning', 'dyslexiaFont', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>High Contrast Mode</Label>
              <p className="text-sm text-muted-foreground">Increase contrast for better visibility</p>
            </div>
            <Switch
              checked={settings.highContrast}
              onCheckedChange={(checked) => updateSetting('learning', 'highContrast', checked)}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const PrivacySettings: React.FC<{ settings: any; updateSetting: any }> = ({ settings, updateSetting }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Shield className="h-5 w-5" />
          <span>Privacy Settings</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label>Share Progress With</Label>
          <Select value={settings.shareProgress} onValueChange={(value) => updateSetting('privacy', 'shareProgress', value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">No One</SelectItem>
              <SelectItem value="parents">Parents Only</SelectItem>
              <SelectItem value="friends">Friends</SelectItem>
              <SelectItem value="everyone">Everyone</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Show on Leaderboard</Label>
              <p className="text-sm text-muted-foreground">Allow others to see your ranking</p>
            </div>
            <Switch
              checked={settings.showOnLeaderboard}
              onCheckedChange={(checked) => updateSetting('privacy', 'showOnLeaderboard', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Allow Challenges</Label>
              <p className="text-sm text-muted-foreground">Let friends challenge you to practice battles</p>
            </div>
            <Switch
              checked={settings.allowChallenges}
              onCheckedChange={(checked) => updateSetting('privacy', 'allowChallenges', checked)}
            />
          </div>
        </div>

        <Separator />

        <div className="space-y-4">
          <h4 className="font-medium text-foreground">Data & Account</h4>
          <div className="space-y-3">
            <Button variant="outline" className="flex items-center space-x-2">
              <Download className="h-4 w-4" />
              <span>Download My Data</span>
            </Button>
            <Button variant="destructive" className="flex items-center space-x-2">
              <Trash2 className="h-4 w-4" />
              <span>Delete Account</span>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const SubscriptionSettings: React.FC = () => {
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
            <Gem className="h-8 w-8 text-primary" />
          </div>
          
          <div className="space-y-2 mb-4">
            {subscription.features.map((feature, index) => (
              <div key={index} className="flex items-center space-x-2">
                <Check className="h-4 w-4 text-primary" />
                <span className="text-sm text-foreground">{feature}</span>
              </div>
            ))}
          </div>
          
          <div className="flex items-center justify-between pt-4 border-t border-primary/20">
            <p className="text-sm text-muted-foreground">Next billing date: {subscription.nextBilling}</p>
            <Button variant="outline" size="sm">
              Manage Subscription
            </Button>
          </div>
        </div>

        <div className="space-y-4">
          <Button variant="outline" className="w-full justify-between">
            <div className="flex items-center space-x-3">
              <CreditCard className="h-5 w-5" />
              <div className="text-left">
                <p className="font-medium">Payment Method</p>
                <p className="text-sm text-muted-foreground">•••• •••• •••• 4242</p>
              </div>
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
          </Button>
          
          <Button variant="outline" className="w-full justify-between">
            <div className="flex items-center space-x-3">
              <FileText className="h-5 w-5" />
              <div className="text-left">
                <p className="font-medium">Billing History</p>
                <p className="text-sm text-muted-foreground">View past invoices</p>
              </div>
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default SettingsPage;