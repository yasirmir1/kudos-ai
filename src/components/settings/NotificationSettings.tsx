import React from 'react';
import { Bell } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';

interface NotificationSettingsProps {
  settings: {
    practiceReminders: boolean;
    achievementAlerts: boolean;
    weeklyReports: boolean;
    emailUpdates: boolean;
    reminderTime: string;
    reminderDays: string[];
  };
  updateSetting: (category: string, key: string, value: any) => void;
}

export const NotificationSettings: React.FC<NotificationSettingsProps> = ({ settings, updateSetting }) => {
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