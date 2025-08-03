import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProfileSettings } from '@/components/settings/ProfileSettings';
import { NotificationSettings } from '@/components/settings/NotificationSettings';
import { LearningSubscriptionSettings } from '@/components/settings/LearningSubscriptionSettings';
import { PrivacySettings } from '@/components/settings/PrivacySettings';

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
  };
  privacy: {
    shareProgress: string;
    allowChallenges: boolean;
  };
}

const Settings: React.FC = () => {
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
      audioFeedback: false
    },
    privacy: {
      shareProgress: 'parents',
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
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="learning">Learning & Subscription</TabsTrigger>
          <TabsTrigger value="privacy">Privacy</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="mt-6">
          <ProfileSettings settings={settings.profile} updateSetting={updateSetting} />
        </TabsContent>

        <TabsContent value="notifications" className="mt-6">
          <NotificationSettings settings={settings.notifications} updateSetting={updateSetting} />
        </TabsContent>

        <TabsContent value="learning" className="mt-6">
          <LearningSubscriptionSettings settings={settings.learning} updateSetting={updateSetting} />
        </TabsContent>

        <TabsContent value="privacy" className="mt-6">
          <PrivacySettings settings={settings.privacy} updateSetting={updateSetting} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;