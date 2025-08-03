import React from 'react';
import { Shield, Download, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';

interface PrivacySettingsProps {
  settings: {
    shareProgress: string;
    allowChallenges: boolean;
  };
  updateSetting: (category: string, key: string, value: any) => void;
}

export const PrivacySettings: React.FC<PrivacySettingsProps> = ({ settings, updateSetting }) => {
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