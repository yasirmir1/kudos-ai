import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { AlertTriangle, RotateCcw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface ResetProgressModalProps {
  onResetComplete: () => void;
}

export const ResetProgressModal = ({ onResetComplete }: ResetProgressModalProps) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [confirmChecked, setConfirmChecked] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  const handleReset = async () => {
    if (!user || !confirmChecked) return;

    setIsResetting(true);
    try {
      // Delete all student answers
      const { error: answersError } = await supabase
        .from('student_answers')
        .delete()
        .eq('student_id', user.id);

      if (answersError) {
        throw answersError;
      }

      // Delete all student performance data
      const { error: performanceError } = await supabase
        .from('student_performance')
        .delete()
        .eq('student_id', user.id);

      if (performanceError) {
        console.error('Error deleting performance data:', performanceError);
        // Don't throw here as answers are already deleted
      }

      toast({
        title: "Progress Reset Successfully",
        description: "All your question history and progress data has been cleared. You can start fresh!",
      });

      setOpen(false);
      setConfirmChecked(false);
      onResetComplete();
    } catch (error) {
      console.error('Error resetting progress:', error);
      toast({
        title: "Reset Failed",
        description: "Failed to reset your progress. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="destructive" size="sm" className="flex items-center space-x-2">
          <RotateCcw className="h-4 w-4" />
          <span>Reset Progress</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            <span>Reset All Progress</span>
          </DialogTitle>
          <DialogDescription className="space-y-3 pt-2">
            <p>
              This action will permanently delete <strong>all</strong> of your learning progress, including:
            </p>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>All answered questions and responses</li>
              <li>Topic performance statistics</li>
              <li>Accuracy scores and progress tracking</li>
              <li>Misconception analysis data</li>
            </ul>
            <p className="text-destructive font-medium">
              This action cannot be undone!
            </p>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-4">
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="confirm-reset" 
              checked={confirmChecked}
              onCheckedChange={(checked) => setConfirmChecked(checked as boolean)}
            />
            <label 
              htmlFor="confirm-reset" 
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              I understand this will delete all my progress permanently
            </label>
          </div>

          <div className="flex space-x-2 justify-end">
            <Button 
              variant="outline" 
              onClick={() => {
                setOpen(false);
                setConfirmChecked(false);
              }}
              disabled={isResetting}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive"
              onClick={handleReset}
              disabled={!confirmChecked || isResetting}
            >
              {isResetting ? (
                <>
                  <RotateCcw className="mr-2 h-4 w-4 animate-spin" />
                  Resetting...
                </>
              ) : (
                <>
                  <AlertTriangle className="mr-2 h-4 w-4" />
                  Reset All Progress
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};