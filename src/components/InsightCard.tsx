import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { ParsedInsight, InsightSection } from '@/lib/insightParser';

interface InsightCardProps {
  insight: ParsedInsight;
  isExpanded?: boolean;
  onToggle?: () => void;
}

export const InsightCard = ({ insight, isExpanded = false, onToggle }: InsightCardProps) => {
  const [expanded, setExpanded] = useState(isExpanded);

  // Sync with parent's isExpanded prop
  useEffect(() => {
    setExpanded(isExpanded);
  }, [isExpanded]);

  const handleToggle = () => {
    setExpanded(!expanded);
    onToggle?.();
  };

  const getSectionVariant = (type: InsightSection['type']) => {
    switch (type) {
      case 'what-happens':
        return 'bg-blue-50 border-blue-200 text-blue-800';
      case 'why-tricky':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'how-to-tackle':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'shows-up-in':
        return 'bg-purple-50 border-purple-200 text-purple-800';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  return (
    <Card className="w-full transition-all duration-200 hover:shadow-md">
      <Collapsible open={expanded} onOpenChange={handleToggle}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-gray-50/50 transition-colors">
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{insight.emoji}</span>
                <span className="text-lg font-semibold">{insight.title}</span>
              </div>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                {expanded ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </Button>
            </CardTitle>
          </CardHeader>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <CardContent className="pt-0">
            <div className="space-y-4">
              {insight.sections.map((section, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg border ${getSectionVariant(section.type)}`}
                >
                  <div className="flex items-start gap-2 mb-2">
                    <span className="text-lg">{section.icon}</span>
                    <h4 className="font-medium text-sm uppercase tracking-wide">
                      {section.title}
                    </h4>
                  </div>
                  <div className="ml-6">
                    {section.content.split('\n').map((line, lineIndex) => (
                      <p key={lineIndex} className="text-sm leading-relaxed mb-1">
                        {line}
                      </p>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};