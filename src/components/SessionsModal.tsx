import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Calendar, Target } from 'lucide-react';

interface SessionsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface SessionData {
  session_date: string;
  total_questions: number;
  correct_answers: number;
  accuracy: number;
}

export function SessionsModal({ open, onOpenChange }: SessionsModalProps) {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<SessionData[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && user) {
      loadSessions();
    }
  }, [open, user]);

  const loadSessions = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('student_answers')
        .select('answered_at, is_correct')
        .eq('student_id', user?.id)
        .order('answered_at', { ascending: false });

      if (error) {
        console.error('Error loading sessions:', error);
        return;
      }

      // Group answers by session (same day)
      const sessionMap = new Map<string, { correct: number; total: number }>();
      
      data?.forEach(answer => {
        const sessionDate = new Date(answer.answered_at).toDateString();
        const existing = sessionMap.get(sessionDate) || { correct: 0, total: 0 };
        existing.total += 1;
        if (answer.is_correct) {
          existing.correct += 1;
        }
        sessionMap.set(sessionDate, existing);
      });

      // Convert to array and calculate accuracy
      const sessionArray: SessionData[] = Array.from(sessionMap.entries()).map(([date, stats]) => ({
        session_date: date,
        total_questions: stats.total,
        correct_answers: stats.correct,
        accuracy: stats.total > 0 ? (stats.correct / stats.total) * 100 : 0
      }));

      setSessions(sessionArray);
    } catch (error) {
      console.error('Error loading sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  const getAccuracyColor = (accuracy: number) => {
    if (accuracy >= 80) return 'bg-green-100 text-green-800 border-green-200';
    if (accuracy >= 60) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    return 'bg-red-100 text-red-800 border-red-200';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Calendar className="h-5 w-5" />
            <span>Your Learning Sessions</span>
          </DialogTitle>
          <DialogDescription>
            View your performance across all practice sessions
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <span className="ml-3 text-muted-foreground">Loading sessions...</span>
            </div>
          ) : sessions.length > 0 ? (
            <>
              <div className="text-sm text-muted-foreground mb-4">
                Total sessions: {sessions.length}
              </div>
              {sessions.map((session, index) => (
                <Card key={session.session_date} className="hover:shadow-sm transition-shadow">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center justify-between">
                      <span className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>{new Date(session.session_date).toLocaleDateString()}</span>
                      </span>
                      <Badge className={getAccuracyColor(session.accuracy)}>
                        {Math.round(session.accuracy)}%
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-1">
                          <Target className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">
                            {session.correct_answers}/{session.total_questions} correct
                          </span>
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Session #{sessions.length - index}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No practice sessions yet.</p>
              <p className="text-sm">Start practicing to see your session history!</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}