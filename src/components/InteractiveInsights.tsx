import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { parseInsights } from '@/lib/insightParser';
import { InsightCard } from './InsightCard';
import { Expand, Minimize2, RotateCcw } from 'lucide-react';

interface InteractiveInsightsProps {
  explanation: string;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export const InteractiveInsights = ({ 
  explanation, 
  onRefresh, 
  isRefreshing = false 
}: InteractiveInsightsProps) => {
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<'compact' | 'expanded'>('compact');

  const insights = useMemo(() => parseInsights(explanation), [explanation]);

  const toggleCard = (id: string) => {
    const newExpanded = new Set(expandedCards);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedCards(newExpanded);
  };

  const toggleAllCards = () => {
    if (viewMode === 'compact') {
      setExpandedCards(new Set(insights.map(insight => insight.id)));
      setViewMode('expanded');
    } else {
      setExpandedCards(new Set());
      setViewMode('compact');
    }
  };

  if (!insights.length) {
    return (
      <div className="text-center py-8">
        <div className="text-muted-foreground mb-4">
          No insights available yet. Complete some practice sessions to get personalized analysis.
        </div>
        {onRefresh && (
          <Button 
            onClick={onRefresh} 
            disabled={isRefreshing}
            variant="outline"
            className="gap-2"
          >
            <RotateCcw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            {isRefreshing ? 'Generating...' : 'Generate Insights'}
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="gap-1">
            <span className="font-medium">{insights.length}</span>
            {insights.length === 1 ? 'Insight' : 'Insights'}
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={toggleAllCards}
            variant="outline"
            size="sm"
            className="gap-2"
          >
            {viewMode === 'compact' ? (
              <>
                <Expand className="h-4 w-4" />
                Expand All
              </>
            ) : (
              <>
                <Minimize2 className="h-4 w-4" />
                Collapse All
              </>
            )}
          </Button>
          {onRefresh && (
            <Button 
              onClick={onRefresh} 
              disabled={isRefreshing}
              variant="outline"
              size="sm"
              className="gap-2"
            >
              <RotateCcw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              {isRefreshing ? 'Updating...' : 'Refresh'}
            </Button>
          )}
        </div>
      </div>

      {/* Insights */}
      <div className="space-y-3">
        {insights.map((insight) => (
          <InsightCard
            key={insight.id}
            insight={insight}
            isExpanded={expandedCards.has(insight.id)}
            onToggle={() => toggleCard(insight.id)}
          />
        ))}
      </div>
    </div>
  );
};