import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Calendar, Target, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ResetProgressModal } from '@/components/ResetProgressModal';
import { useAgeGroup } from '@/contexts/AgeGroupContext';
import { AgeGroupSelector } from '@/components/AgeGroupSelector';

type AgeGroup = 'year 2-3' | 'year 4-5' | '11+';

interface Profile {
  id: string;
  email: string;
  current_level: string;
  age_group: AgeGroup;
  target_exam_date: string | null;
  created_at: string;
}

const Profile = () => {
  const { user, signOut } = useAuth();
  const { selectedAgeGroup } = useAgeGroup();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<{
    current_level: string;
    age_group: AgeGroup;
    target_exam_date: string;
  }>({
    current_level: 'beginner',
    age_group: 'year 4-5',
    target_exam_date: ''
  });

  useEffect(() => {
    if (user) {
      loadProfile();
    }
  }, [user]);

  const loadProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('student_profiles')
        .select('*')
        .eq('id', user?.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading profile:', error);
        return;
      }

      if (data) {
        setProfile(data);
        setFormData({
          current_level: data.current_level || 'beginner',
          age_group: data.age_group || 'year 4-5',
          target_exam_date: data.target_exam_date || ''
        });
      } else {
        // Create profile if it doesn't exist
        const { data: newProfile, error: createError } = await supabase
          .from('student_profiles')
          .insert({
            id: user?.id,
            email: user?.email || '',
            current_level: 'beginner'
          })
          .select()
          .single();

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
      const { error } = await supabase
        .from('student_profiles')
        .update({
          current_level: formData.current_level,
          age_group: formData.age_group,
          target_exam_date: formData.target_exam_date || null
        })
        .eq('id', user.id);

      if (error) {
        throw error;
      }

      toast({
        title: "Profile updated",
        description: "Your profile has been saved successfully.",
      });

      // Reload profile to get updated data
      await loadProfile();
    } catch (error) {
      console.error('Error saving profile:', error);
      toast({
        title: "Error",
        description: "Failed to save profile. Please try again.",
        variant: "destructive",
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
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-2">
          <User className="h-8 w-8 mx-auto animate-pulse text-primary" />
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/10">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Button variant="ghost" onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <User className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Profile Settings</h1>
              <p className="text-sm text-muted-foreground">{selectedAgeGroup} - {user?.email}</p>
            </div>
          </div>
          <div className="flex items-center space-x-6">
            <AgeGroupSelector />
            <Button variant="outline" onClick={handleSignOut}>
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="space-y-6">
          {/* Profile Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="h-5 w-5" />
                <span>Personal Information</span>
              </CardTitle>
              <CardDescription>
                Manage your account details and learning preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className="bg-muted"
                />
                <p className="text-xs text-muted-foreground">
                  Email cannot be changed from this interface
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="level">Current Level</Label>
                <Select 
                  value={formData.current_level} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, current_level: value }))}
                >
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
                <Select 
                  value={formData.age_group} 
                  onValueChange={(value: AgeGroup) => setFormData(prev => ({ ...prev, age_group: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select your school year" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="year 2-3">Year 2-3</SelectItem>
                    <SelectItem value="year 4-5">Year 4-5</SelectItem>
                    <SelectItem value="11+">11+</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Questions and curriculum will be tailored to your school year
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="exam-date">Target Exam Date</Label>
                <Input
                  id="exam-date"
                  type="date"
                  value={formData.target_exam_date}
                  onChange={(e) => setFormData(prev => ({ ...prev, target_exam_date: e.target.value }))}
                />
                <p className="text-xs text-muted-foreground">
                  Optional: Set your target exam date to help personalize your learning plan
                </p>
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
                  {profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : 'N/A'}
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
        </div>
      </div>
    </div>
  );
};

export default Profile;