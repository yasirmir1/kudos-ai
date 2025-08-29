import React from 'react';
import { TrendingUp, AlertCircle, Award, Brain, Target, BarChart3 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { EnhancedProgressInsights } from './EnhancedProgressInsights';

export const ProgressInsights: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Enhanced Analytics */}
      <EnhancedProgressInsights />
      
      {/* Quick Insights Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-5 w-5 text-success" />
              <div>
                <p className="font-medium text-success">Strong Progress</p>
                <p className="text-sm text-muted-foreground">Mental arithmetic improving</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-warning" />
              <div>
                <p className="font-medium text-warning">Needs Practice</p>
                <p className="text-sm text-muted-foreground">Review fraction concepts</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Award className="h-5 w-5 text-primary" />
              <div>
                <p className="font-medium text-primary">Achievement</p>
                <p className="text-sm text-muted-foreground">Consistent daily practice</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};