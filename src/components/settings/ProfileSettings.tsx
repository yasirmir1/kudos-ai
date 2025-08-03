import React from 'react';
import { User } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';

interface ProfileSettingsProps {
  settings: {
    displayName: string;
    email: string;
    avatar: string;
    grade: string;
    school: string;
  };
  updateSetting: (category: string, key: string, value: any) => void;
}

export const ProfileSettings: React.FC<ProfileSettingsProps> = ({ settings, updateSetting }) => {
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