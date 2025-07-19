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
  session_id: number;
  session_start: string;
  session_end: string;
  total_questions: number;
  correct_answers: number;
  accuracy: number;
  date: string;
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
        .order('answered_at', { ascending: true });

      if (error) {
        console.error('Error loading sessions:', error);
        return;
      }

      if (!data || data.length === 0) {
        setSessions([]);
        return;
      }

      // Group answers into sessions based on time gaps
      const sessions: SessionData[] = [];
      let currentSession: { answers: any[], start: Date, end: Date } | null = null;
      const SESSION_GAP_MINUTES = 30; // If more than 30 minutes between answers, it's a new session

      data.forEach((answer, index) => {
        const answerTime = new Date(answer.answered_at);
        
        if (!currentSession) {
          // Start first session
          currentSession = {
            answers: [answer],
            start: answerTime,
            end: answerTime
          };
        } else {
          const timeDiff = (answerTime.getTime() - currentSession.end.getTime()) / (1000 * 60); // minutes
          
          if (timeDiff > SESSION_GAP_MINUTES) {
            // Save current session and start new one
            const correctAnswers = currentSession.answers.filter(a => a.is_correct).length;
            sessions.push({
              session_id: sessions.length + 1,
              session_start: currentSession.start.toISOString(),
              session_end: currentSession.end.toISOString(),
              total_questions: currentSession.answers.length,
              correct_answers: correctAnswers,
              accuracy: currentSession.answers.length > 0 ? (correctAnswers / currentSession.answers.length) * 100 : 0,
              date: currentSession.start.toDateString()
            });
            
            currentSession = {
              answers: [answer],
              start: answerTime,
              end: answerTime
            };
          } else {
            // Add to current session
            currentSession.answers.push(answer);
            currentSession.end = answerTime;
          }
        }
      });

      // Don't forget the last session
      if (currentSession) {
        const correctAnswers = currentSession.answers.filter(a => a.is_correct).length;
        sessions.push({
          session_id: sessions.length + 1,
          session_start: currentSession.start.toISOString(),
          session_end: currentSession.end.toISOString(),
          total_questions: currentSession.answers.length,
          correct_answers: correctAnswers,
          accuracy: currentSession.answers.length > 0 ? (correctAnswers / currentSession.answers.length) * 100 : 0,
          date: currentSession.start.toDateString()
        });
      }

      // Reverse to show most recent first
      setSessions(sessions.reverse());
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
            View your performance across all practice sessions (sessions are split when there's more than 30 minutes between questions)
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
                Total practice sessions: {sessions.length}
              </div>
              {sessions.map((session, index) => {
                const sessionStart = new Date(session.session_start);
                const sessionEnd = new Date(session.session_end);
                const duration = Math.round((sessionEnd.getTime() - sessionStart.getTime()) / (1000 * 60)); // minutes
                
                return (
                <Card key={session.session_id} className="hover:shadow-sm transition-shadow">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center justify-between">
                      <span className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>
                          {sessionStart.toLocaleDateString()} at {sessionStart.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
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
                        <div className="text-xs text-muted-foreground">
                          Duration: {duration} min{duration !== 1 ? 's' : ''}
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Session #{session.session_id}
                      </div>
                    </div>
                  </CardContent>
                </Card>
                );
              })}
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