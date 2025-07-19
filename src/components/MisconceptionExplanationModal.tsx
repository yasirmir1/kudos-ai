import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, Lightbulb, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

interface MisconceptionExplanationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  misconception: {
    red_herring: string;
    frequency: number;
    topics: string[];
  } | null;
}

export const MisconceptionExplanationModal: React.FC<MisconceptionExplanationModalProps> = ({
  open,
  onOpenChange,
  misconception
}) => {
  const [explanation, setExplanation] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const getExplanation = async () => {
    if (!misconception) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('explain-misconceptions', {
        body: {
          misconception: misconception.red_herring,
          topics: misconception.topics
        }
      });

      if (error) {
        console.error('Error getting explanation:', error);
        toast({
          title: "Error",
          description: "Failed to get AI explanation. Please try again.",
          variant: "destructive",
        });
        return;
      }

      if (data?.explanation) {
        setExplanation(data.explanation);
      } else {
        toast({
          title: "Error",
          description: "No explanation received. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "Failed to get AI explanation. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatMisconceptionName = (name: string) => {
    return name?.replace(/_/g, ' ').replace(/([A-Z])/g, ' $1').trim();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Lightbulb className="h-5 w-5 text-yellow-500" />
            <span>Understanding Your Misconception</span>
          </DialogTitle>
          <DialogDescription>
            Get AI-powered explanations to help you overcome common mistakes
          </DialogDescription>
        </DialogHeader>

        {misconception && (
          <div className="space-y-6">
            {/* Misconception Details */}
            <Card className="border-orange-200 bg-orange-50/50">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <AlertCircle className="h-5 w-5 text-orange-500" />
                    <h3 className="font-semibold text-orange-800">
                      {formatMisconceptionName(misconception.red_herring)}
                    </h3>
                  </div>
                  <Badge variant="outline" className="bg-orange-100 text-orange-700 border-orange-300">
                    {misconception.frequency}x encountered
                  </Badge>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  <span className="text-sm text-orange-700">Related topics:</span>
                  {misconception.topics?.map((topic, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {topic}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* AI Explanation Section */}
            <div className="space-y-4">
              {!explanation && !loading && (
                <div className="text-center py-8">
                  <Lightbulb className="h-12 w-12 mx-auto text-yellow-500 mb-4" />
                  <p className="text-muted-foreground mb-4">
                    Get an AI-powered explanation to understand this misconception better
                  </p>
                  <Button onClick={getExplanation} className="bg-gradient-to-r from-primary to-primary-glow">
                    <Lightbulb className="mr-2 h-4 w-4" />
                    Get AI Explanation
                  </Button>
                </div>
              )}

              {loading && (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin mr-2" />
                  <span>Generating explanation...</span>
                </div>
              )}

              {explanation && (
                <Card className="border-blue-200 bg-blue-50/50">
                  <CardContent className="pt-6">
                    <div className="flex items-center space-x-2 mb-4">
                      <Lightbulb className="h-5 w-5 text-blue-500" />
                      <h3 className="font-semibold text-blue-800">AI Explanation</h3>
                    </div>
                    <div className="prose prose-sm max-w-none text-blue-900">
                      <div className="whitespace-pre-wrap">{explanation}</div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-blue-200">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={getExplanation}
                        disabled={loading}
                        className="border-blue-300 text-blue-700 hover:bg-blue-100"
                      >
                        {loading ? (
                          <>
                            <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                            Generating...
                          </>
                        ) : (
                          <>
                            <Lightbulb className="mr-2 h-3 w-3" />
                            Get New Explanation
                          </>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};