import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Settings, BookOpen } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface SessionStartModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStart: (questionCount: number, difficulty?: string) => void;
}

export const SessionStartModal = ({ isOpen, onClose, onStart }: SessionStartModalProps) => {
  const [selectedCount, setSelectedCount] = useState<number>(10);
  const [showSettings, setShowSettings] = useState(false);
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('mixed');

  const handleStart = () => {
    onStart(selectedCount, selectedDifficulty === 'mixed' ? undefined : selectedDifficulty);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="relative">
          <Button
            variant="ghost"
            size="sm"
            className="absolute -top-2 -left-2 h-8 w-8 p-0"
            onClick={() => setShowSettings(!showSettings)}
          >
            <Settings className="h-4 w-4" />
          </Button>
          <DialogTitle className="text-center">Start Practice Session</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 pt-4">
          {showSettings && (
            <Card className="bg-muted/30">
              <CardContent className="p-4">
                <div className="space-y-3">
                  <label className="text-sm font-medium">Difficulty Level</label>
                  <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mixed">Mixed (Recommended)</SelectItem>
                      <SelectItem value="Easy">Easy</SelectItem>
                      <SelectItem value="Medium">Medium</SelectItem>
                      <SelectItem value="Hard">Hard</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="space-y-4">
            <h3 className="text-base font-medium text-center">Choose number of questions</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <Card 
                className={`cursor-pointer transition-all hover:bg-accent/50 ${
                  selectedCount === 10 ? 'ring-2 ring-primary bg-primary/5' : ''
                }`}
                onClick={() => setSelectedCount(10)}
              >
                <CardContent className="p-6 text-center">
                  <div className="space-y-2">
                    <div className="text-2xl font-bold text-primary">10</div>
                    <div className="text-sm text-muted-foreground">Questions</div>
                    <Badge variant="secondary" className="text-xs">Quick session</Badge>
                  </div>
                </CardContent>
              </Card>

              <Card 
                className={`cursor-pointer transition-all hover:bg-accent/50 ${
                  selectedCount === 20 ? 'ring-2 ring-primary bg-primary/5' : ''
                }`}
                onClick={() => setSelectedCount(20)}
              >
                <CardContent className="p-6 text-center">
                  <div className="space-y-2">
                    <div className="text-2xl font-bold text-primary">20</div>
                    <div className="text-sm text-muted-foreground">Questions</div>
                    <Badge variant="secondary" className="text-xs">Full session</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground">
            <BookOpen className="h-4 w-4" />
            <span>Personalized questions based on your progress</span>
          </div>

          <div className="flex space-x-3">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button onClick={handleStart} className="flex-1">
              Start Practice
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};