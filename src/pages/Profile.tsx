import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Calendar, Target, Save, Bell, CreditCard, Gem, Check, ChevronRight, Download, Trash2, Shield, LogOut, Settings, Lock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ResetProgressModal } from '@/components/ResetProgressModal';
import { useAgeGroup, updateAgeGroupFromProfile } from '@/contexts/AgeGroupContext';
import { AgeGroupSelector } from '@/components/AgeGroupSelector';
import { useAccessibility } from '@/contexts/AccessibilityContext';
import { useSubscription } from '@/hooks/useSubscription';
import BillingHistoryModal from '@/components/BillingHistoryModal';
type AgeGroup = '11+';
type DatabaseAgeGroup = 'year 2-3' | 'year 4-5' | '11+';
interface Profile {
  id: string;
  email: string;
  current_level: string;
  age_group: DatabaseAgeGroup;
  target_exam_date: string | null;
  created_at: string;
}
const Profile = () => {
  const {
    user,
    signOut
  } = useAuth();
  const {
    selectedAgeGroup
  } = useAgeGroup();
  const {
    settings: accessibilitySettings,
    updateSetting: updateAccessibilitySetting
  } = useAccessibility();
  const {
    userState,
    loading: subscriptionLoading,
    isTrialActive,
    trialDaysRemaining,
    openCustomerPortal,
    createCheckoutSession,
    refetch: refetchSubscription
  } = useSubscription();
  const navigate = useNavigate();
  const {
    toast
  } = useToast();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [billingHistoryOpen, setBillingHistoryOpen] = useState(false);
  const [formData, setFormData] = useState<{
    current_level: string;
    age_group: AgeGroup;
    target_exam_date: string;
  }>({
    current_level: 'beginner',
    age_group: '11+',
    target_exam_date: ''
  });

  // Helper function to migrate old age groups to new system
  const migrateAgeGroup = (ageGroup: DatabaseAgeGroup): AgeGroup => {
    return '11+'; // All users now use 11+ regardless of previous setting
  };

  // Learning and subscription settings
  const [learningSettings, setLearningSettings] = useState({
    difficultyLevel: 'adaptive',
    practiceGoal: 20,
    showHints: true,
    audioFeedback: false,
    practiceReminders: true,
    achievementAlerts: true,
    weeklyReports: false,
    emailUpdates: true,
    reminderTime: '16:00'
  });
  const [privacySettings, setPrivacySettings] = useState({
    shareProgress: 'parents',
    allowChallenges: true
  });
  // Get subscription info based on current state
  const getSubscriptionInfo = () => {
    switch (userState) {
      case 'trial':
        return {
          plan: 'Pass Plus',
          price: 'Free Trial',
          status: `${trialDaysRemaining} days remaining`,
          features: ['All Pass Plus features included', 'Unlimited bootcamp access', 'Daily practice mode', 'Advanced analytics', 'Priority support', 'Mock tests'],
          isActive: true,
          isTrial: true
        };
      case 'pass':
        return {
          plan: 'Pass',
          price: '£7.99/month',
          status: 'Active Subscription',
          features: ['Daily practice mode', 'Progress tracking', 'Basic analytics', 'Email support'],
          isActive: true,
          isTrial: false
        };
      case 'pass_plus':
        return {
          plan: 'Pass Plus',
          price: '£14.99/month', 
          status: 'Active Subscription',
          features: ['All Pass features', 'Unlimited bootcamp access', 'Advanced analytics', 'Priority support', 'Mock tests'],
          isActive: true,
          isTrial: false
        };
      case 'expired':
        return {
          plan: 'Trial Expired',
          price: 'Upgrade needed',
          status: 'Expired',
          features: ['Trial has ended - Limited access only'],
          isActive: false,
          isTrial: false
        };
      default:
        return {
          plan: 'No Subscription',
          price: 'Free account',
          status: 'Limited Access',
          features: ['Basic features only', 'Upgrade to unlock full access'],
          isActive: false,
          isTrial: false
        };
    }
  };

  const subscription = getSubscriptionInfo();

  const handleManageSubscription = async () => {
    if (userState === 'no_access' || userState === 'expired') {
      // Redirect to pricing for new subscriptions
      navigate('/pricing');
      return;
    }

    try {
      // Open customer portal for existing subscribers
      const result = await openCustomerPortal();
      if (result.url) {
        window.open(result.url, '_blank');
        // Refresh subscription data when they return
        setTimeout(() => {
          refetchSubscription();
        }, 5000);
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to open subscription management",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error", 
        description: "Unable to access subscription management. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleUpgradePlan = async () => {
    if (userState === 'pass') {
      // Upgrade from Pass to Pass Plus
      const result = await createCheckoutSession('pass_plus_monthly');
      if (result.url) {
        window.open(result.url, '_blank');
      } else {
        toast({
          title: "Error", 
          description: result.error || "Failed to create checkout session",
          variant: "destructive"
        });
      }
    } else {
      // Redirect to pricing for other cases
      navigate('/pricing');
    }
  };

  const handleBillingHistory = () => {
    setBillingHistoryOpen(true);
  };
  useEffect(() => {
    if (user) {
      loadProfile();
    }
  }, [user]);

  // Sync with age group context
  useEffect(() => {
    if (selectedAgeGroup && formData.age_group !== selectedAgeGroup) {
      setFormData(prev => ({
        ...prev,
        age_group: selectedAgeGroup as AgeGroup
      }));
    }
  }, [selectedAgeGroup]);
  const loadProfile = async () => {
    try {
      const {
        data,
        error
      } = await supabase.from('student_profiles').select('*').eq('id', user?.id).maybeSingle();
      if (error && error.code !== 'PGRST116') {
        console.error('Error loading profile:', error);
        return;
      }
      if (data) {
        setProfile(data);
        setFormData({
          current_level: data.current_level || 'beginner',
          age_group: migrateAgeGroup(data.age_group || '11+'),
          target_exam_date: data.target_exam_date || ''
        });
      } else {
        // Create profile if it doesn't exist
        const {
          data: newProfile,
          error: createError
        } = await supabase.from('student_profiles').insert({
          id: user?.id,
          email: user?.email || '',
          current_level: 'beginner'
        }).select().single();
        if (createError) {
          console.error('Error creating profile:', createError);
        } else {
          setProfile(newProfile);
        }
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };
  const handleSaveProfile = async () => {
    if (!user || !profile) return;
    setSaving(true);
    try {
      const {
        error
      } = await supabase.from('student_profiles').update({
        current_level: formData.current_level,
        age_group: formData.age_group,
        target_exam_date: formData.target_exam_date || null
      }).eq('id', user.id);
      if (error) {
        throw error;
      }

      // Update the age group context if it changed
      if (formData.age_group !== profile.age_group) {
        updateAgeGroupFromProfile(formData.age_group);
      }
      toast({
        title: "Profile updated",
        description: "Your profile has been saved successfully."
      });

      // Reload profile to get updated data
      await loadProfile();
    } catch (error) {
      console.error('Error saving profile:', error);
      toast({
        title: "Error",
        description: "Failed to save profile. Please try again.",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };
  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };
  if (loading) {
    return <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-2">
          <User className="h-8 w-8 mx-auto animate-pulse text-primary" />
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </div>;
  }
  return <div className="min-h-screen bg-background">
      {/* Header with Sign Out Button */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <User className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Profile Settings</h1>
                <p className="text-sm text-muted-foreground">Manage your account and preferences</p>
              </div>
            </div>
            <Button variant="outline" onClick={handleSignOut} className="flex items-center space-x-2">
              <LogOut className="h-4 w-4" />
              <span>Sign Out</span>
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="profile" className="flex items-center space-x-2">
              <User className="h-4 w-4" />
              <span>Profile</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center space-x-2">
              <Settings className="h-4 w-4" />
              <span>Settings</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center space-x-2">
              <Bell className="h-4 w-4" />
              <span>Notifications</span>
            </TabsTrigger>
            <TabsTrigger value="privacy" className="flex items-center space-x-2">
              <Lock className="h-4 w-4" />
              <span>Privacy</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-6 mt-6">
            {/* Personal Information */}
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>Your basic account details and learning profile</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input id="email" type="email" value={user?.email || ''} disabled className="bg-muted" />
                  <p className="text-xs text-muted-foreground">
                    Email cannot be changed from this interface
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="level">Current Level</Label>
                  <Select value={formData.current_level} onValueChange={value => setFormData(prev => ({
                  ...prev,
                  current_level: value
                }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your current level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">Beginner - Just starting out</SelectItem>
                      <SelectItem value="intermediate">Intermediate - Making good progress</SelectItem>
                      <SelectItem value="advanced">Advanced - Nearly exam ready</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="age-group">School Year</Label>
                  <div className="flex items-center space-x-2">
                    <div className="flex-1 p-3 bg-muted rounded-md">
                      <span className="font-medium">11+ Preparation</span>
                      <p className="text-xs text-muted-foreground mt-1">
                        All content is now optimized for 11+ exam preparation
                      </p>
                    </div>
                    <div className="px-3 py-2 bg-green-100 text-green-800 rounded-md text-sm font-medium">
                      Current
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Questions and curriculum are tailored for 11+ exam preparation
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="exam-date">Target Exam Date</Label>
                  <Input id="exam-date" type="date" value={formData.target_exam_date} onChange={e => setFormData(prev => ({
                  ...prev,
                  target_exam_date: e.target.value
                }))} />
                  <p className="text-xs text-muted-foreground">
                    Optional: Set your target exam date to help personalize your learning plan
                  </p>
                </div>

                <div className="pt-4">
                  <Button onClick={handleSaveProfile} disabled={saving} className="w-full">
                    {saving ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Account Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Calendar className="h-5 w-5" />
                  <span>Account Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between py-2 border-b">
                  <span className="text-muted-foreground">Member since</span>
                  <span className="font-medium">
                    {user?.created_at ? new Date(user.created_at).toLocaleDateString('en-GB', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  }) : 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-muted-foreground">Account ID</span>
                  <span className="font-mono text-xs">{user?.id}</span>
                </div>
              </CardContent>
            </Card>

            {/* Danger Zone */}
            <Card className="border-destructive/20">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-destructive">
                  <Target className="h-5 w-5" />
                  <span>Danger Zone</span>
                </CardTitle>
                <CardDescription>
                  Irreversible actions that will permanently affect your account
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between p-4 border border-destructive/20 rounded-lg bg-destructive/5">
                  <div>
                    <h4 className="font-medium text-destructive">Reset All Progress</h4>
                    <p className="text-sm text-muted-foreground">
                      Permanently delete all your learning progress and start over
                    </p>
                  </div>
                  <ResetProgressModal onResetComplete={loadProfile} />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6 mt-6">

            {/* Learning Preferences */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Target className="h-5 w-5" />
                  <span>Learning Preferences</span>
                </CardTitle>
                <CardDescription>
                  Customize your learning experience and practice settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Difficulty Level</Label>
                    <Select value={learningSettings.difficultyLevel} onValueChange={value => setLearningSettings(prev => ({
                    ...prev,
                    difficultyLevel: value
                  }))}>
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
                    <Select value={learningSettings.practiceGoal.toString()} onValueChange={value => setLearningSettings(prev => ({
                    ...prev,
                    practiceGoal: parseInt(value)
                  }))}>
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
                    <Switch checked={learningSettings.showHints} onCheckedChange={checked => setLearningSettings(prev => ({
                    ...prev,
                    showHints: checked
                  }))} />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Audio Feedback</Label>
                      <p className="text-sm text-muted-foreground">Play sounds for correct/incorrect answers</p>
                    </div>
                    <Switch checked={learningSettings.audioFeedback} onCheckedChange={checked => setLearningSettings(prev => ({
                    ...prev,
                    audioFeedback: checked
                  }))} />
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h4 className="font-medium text-foreground">Accessibility</h4>
                  
                  <div className="space-y-2">
                    <Label>Font Size</Label>
                    <Select value={accessibilitySettings.fontSize} onValueChange={(value: any) => updateAccessibilitySetting('fontSize', value)}>
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
                    <Switch checked={accessibilitySettings.dyslexiaFont} onCheckedChange={checked => updateAccessibilitySetting('dyslexiaFont', checked)} />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>High Contrast Mode</Label>
                      <p className="text-sm text-muted-foreground">Increase contrast for better visibility</p>
                    </div>
                    <Switch checked={accessibilitySettings.highContrast} onCheckedChange={checked => updateAccessibilitySetting('highContrast', checked)} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6 mt-6">
            <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Bell className="h-5 w-5" />
                <span>Notification Preferences</span>
              </CardTitle>
              <CardDescription>
                Manage how and when you receive notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Practice Reminders</Label>
                  <p className="text-sm text-muted-foreground">Get notified when it's time to practice</p>
                </div>
                <Switch checked={learningSettings.practiceReminders} onCheckedChange={checked => setLearningSettings(prev => ({
                  ...prev,
                  practiceReminders: checked
                }))} />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Achievement Alerts</Label>
                  <p className="text-sm text-muted-foreground">Celebrate when you unlock achievements</p>
                </div>
                <Switch checked={learningSettings.achievementAlerts} onCheckedChange={checked => setLearningSettings(prev => ({
                  ...prev,
                  achievementAlerts: checked
                }))} />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Weekly Reports</Label>
                  <p className="text-sm text-muted-foreground">Summary of your weekly progress</p>
                </div>
                <Switch checked={learningSettings.weeklyReports} onCheckedChange={checked => setLearningSettings(prev => ({
                  ...prev,
                  weeklyReports: checked
                }))} />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Email Updates</Label>
                  <p className="text-sm text-muted-foreground">Important updates via email</p>
                </div>
                <Switch checked={learningSettings.emailUpdates} onCheckedChange={checked => setLearningSettings(prev => ({
                  ...prev,
                  emailUpdates: checked
                }))} />
              </div>

              {learningSettings.practiceReminders && <>
                  <Separator />
                  <div className="space-y-4">
                    <h4 className="font-medium text-foreground">Reminder Schedule</h4>
                    
                    <div className="space-y-2">
                      <Label>Reminder Time</Label>
                      <Input type="time" value={learningSettings.reminderTime} onChange={e => setLearningSettings(prev => ({
                      ...prev,
                      reminderTime: e.target.value
                    }))} />
                    </div>
                  </div>
                </>}
            </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="privacy" className="space-y-6 mt-6">
            {/* Subscription */}
            <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CreditCard className="h-5 w-5" />
                <span>Subscription & Billing</span>
              </CardTitle>
              <CardDescription>
                Manage your subscription plan and billing preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {subscriptionLoading ? (
                <div className="text-center py-8">
                  <CreditCard className="h-8 w-8 mx-auto animate-pulse text-primary mb-2" />
                  <p className="text-muted-foreground">Loading subscription details...</p>
                </div>
              ) : (
                <div className={`rounded-lg p-6 border ${
                  subscription.isActive 
                    ? 'bg-gradient-to-r from-primary/10 to-primary-glow/10 border-primary/20' 
                    : 'bg-muted/50 border-muted-foreground/20'
                }`}>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h4 className="text-lg font-semibold text-foreground">{subscription.plan}</h4>
                      <p className={`font-medium ${subscription.isActive ? 'text-primary' : 'text-muted-foreground'}`}>
                        {subscription.price}
                      </p>
                    </div>
                    <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium ${
                      subscription.isActive && !subscription.isTrial
                        ? 'bg-green-100 text-green-800 border border-green-200'
                        : subscription.isTrial
                          ? 'bg-blue-100 text-blue-800 border border-blue-200'
                          : userState === 'expired' 
                            ? 'bg-orange-100 text-orange-800 border border-orange-200'
                            : 'bg-gray-100 text-gray-600 border border-gray-200'
                    }`}>
                      <Check className="h-3 w-3" />
                      <span>{subscription.status}</span>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    {isTrialActive && (
                      <div className="bg-gradient-to-r from-blue-50 to-primary/5 border border-blue-200 rounded-lg p-4">
                        <div className="flex items-center space-x-2 mb-2">
                          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                          <h5 className="font-medium text-blue-900">Free Trial Active</h5>
                        </div>
                        <p className="text-sm text-blue-800">
                          {trialDaysRemaining > 1 
                            ? `${trialDaysRemaining} days remaining` 
                            : trialDaysRemaining === 1 
                              ? '1 day remaining - Don\'t miss out!' 
                              : 'Trial expires today'
                          }
                        </p>
                        <p className="text-xs text-blue-700 mt-1">
                          Upgrade anytime to continue with uninterrupted access to all features.
                        </p>
                      </div>
                    )}
                    
                    {userState === 'expired' && (
                      <div className="bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 rounded-lg p-4">
                        <div className="flex items-center space-x-2 mb-2">
                          <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                          <h5 className="font-medium text-orange-900">Subscription Required</h5>
                        </div>
                        <p className="text-sm text-orange-800">
                          Your trial has ended. Subscribe now to regain full access to all features.
                        </p>
                      </div>
                    )}
                    
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
              )}

              <div className="flex flex-wrap gap-3">
                <Button 
                  variant="outline" 
                  className="flex items-center space-x-2"
                  onClick={handleManageSubscription}
                  disabled={subscriptionLoading}
                >
                  <span>
                    {userState === 'no_access' || userState === 'expired' 
                      ? 'Get Subscription' 
                      : 'Manage Subscription'
                    }
                  </span>
                  <ChevronRight className="h-4 w-4" />
                </Button>
                
                {(userState === 'pass' || userState === 'pass_plus' || userState === 'trial') && (
                  <Button 
                    variant="outline" 
                    className="flex items-center space-x-2"
                    onClick={handleBillingHistory}
                    disabled={subscriptionLoading}
                  >
                    <span>Billing History</span>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                )}
                
                {(userState === 'pass' || userState === 'no_access' || userState === 'expired') && (
                  <Button 
                    variant="outline" 
                    className="flex items-center space-x-2"
                    onClick={handleUpgradePlan}
                    disabled={subscriptionLoading}
                  >
                    <Gem className="h-4 w-4" />
                    <span>
                      {userState === 'pass' ? 'Upgrade to Pass Plus' : 'View Plans'}
                    </span>
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Privacy Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="h-5 w-5" />
                <span>Privacy Settings</span>
              </CardTitle>
              <CardDescription>
                Control your privacy and data sharing preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h4 className="text-foreground text-xl mx-0 my-0 font-medium">Data & Account</h4>
                <div className="flex gap-3">
                  <Button variant="outline" className="flex items-center space-x-2 my-[10px]">
                    <Download className="h-4 w-4" />
                    <span className="mx-[10px]">Download My Data</span>
                  </Button>
                  <Button variant="destructive" className="flex items-center space-x-2 mx-[20px] my-[10px]">
                    <Trash2 className="h-4 w-4" />
                    <span className="mx-[10px]">Delete Account</span>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex justify-end space-x-3">
            <Button variant="outline" onClick={() => navigate('/dashboard')}>
              Cancel
            </Button>
            <Button onClick={handleSaveProfile} disabled={saving}>
              <Save className="mr-2 h-4 w-4" />
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>
      
      <BillingHistoryModal 
        isOpen={billingHistoryOpen} 
        onClose={() => setBillingHistoryOpen(false)} 
      />
    </div>;
};
export default Profile;