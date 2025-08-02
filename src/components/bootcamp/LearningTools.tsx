import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Calculator, 
  Shapes, 
  BarChart3, 
  Play, 
  Grid, 
  Ruler,
  Brain,
  BookOpen
} from 'lucide-react';
import { FractionBarTool } from './tools/FractionBarTool';

// Placeholder components for other tools
const NumberLineTool = () => (
  <div className="bg-muted rounded-xl p-6">
    <h3 className="text-lg font-semibold mb-4">Interactive Number Line</h3>
    <div className="bg-background rounded-lg p-8 text-center">
      <BarChart3 className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
      <p className="text-muted-foreground">Number Line Tool - Interactive number positioning and comparison</p>
    </div>
  </div>
);

const Base10Blocks = () => (
  <div className="bg-muted rounded-xl p-6">
    <h3 className="text-lg font-semibold mb-4">Base-10 Blocks</h3>
    <div className="bg-background rounded-lg p-8 text-center">
      <Grid className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
      <p className="text-muted-foreground">Base-10 Blocks - Place value and number representation</p>
    </div>
  </div>
);

const VideoTutorialPlayer = () => (
  <div className="bg-muted rounded-xl p-6">
    <h3 className="text-lg font-semibold mb-4">Video Tutorials</h3>
    <div className="bg-background rounded-lg p-8 text-center">
      <Play className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
      <p className="text-muted-foreground">Interactive video player with chapters and transcripts</p>
    </div>
  </div>
);

const AlgebraTiles = () => (
  <div className="bg-muted rounded-xl p-6">
    <h3 className="text-lg font-semibold mb-4">Algebra Tiles</h3>
    <div className="bg-background rounded-lg p-8 text-center">
      <Calculator className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
      <p className="text-muted-foreground">Visual algebra manipulatives for equations and expressions</p>
    </div>
  </div>
);

const ShapePatternBuilder = () => (
  <div className="bg-muted rounded-xl p-6">
    <h3 className="text-lg font-semibold mb-4">Pattern Builder</h3>
    <div className="bg-background rounded-lg p-8 text-center">
      <Shapes className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
      <p className="text-muted-foreground">Create and analyze visual patterns with shapes and colors</p>
    </div>
  </div>
);

const GeometryCanvas = () => (
  <div className="bg-muted rounded-xl p-6">
    <h3 className="text-lg font-semibold mb-4">Geometry Canvas</h3>
    <div className="bg-background rounded-lg p-8 text-center">
      <Ruler className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
      <p className="text-muted-foreground">Interactive drawing and measurement tools for geometry</p>
    </div>
  </div>
);

interface LearningToolsProps {
  setCurrentView: (view: string) => void;
}

export const LearningTools: React.FC<LearningToolsProps> = ({ setCurrentView }) => {
  const [selectedTool, setSelectedTool] = useState<string | null>(null);

  const tools = [
    {
      id: 'fractions',
      name: 'Fraction Bars',
      description: 'Visual fraction comparison and manipulation',
      icon: BarChart3,
      category: 'number',
      component: FractionBarTool
    },
    {
      id: 'numberline',
      name: 'Number Line',
      description: 'Interactive number positioning',
      icon: BarChart3,
      category: 'number',
      component: NumberLineTool
    },
    {
      id: 'base10',
      name: 'Base-10 Blocks',
      description: 'Place value understanding',
      icon: Grid,
      category: 'number',
      component: Base10Blocks
    },
    {
      id: 'algebra',
      name: 'Algebra Tiles',
      description: 'Visual algebra with manipulatives',
      icon: Calculator,
      category: 'algebra',
      component: AlgebraTiles
    },
    {
      id: 'patterns',
      name: 'Pattern Builder',
      description: 'Create and analyze patterns',
      icon: Shapes,
      category: 'geometry',
      component: ShapePatternBuilder
    },
    {
      id: 'geometry',
      name: 'Geometry Canvas',
      description: 'Interactive drawing and measuring',
      icon: Ruler,
      category: 'geometry',
      component: GeometryCanvas
    },
    {
      id: 'videos',
      name: 'Video Tutorials',
      description: 'Interactive learning videos',
      icon: Play,
      category: 'multimedia',
      component: VideoTutorialPlayer
    }
  ];

  const categories = [
    { id: 'all', name: 'All Tools', icon: Brain },
    { id: 'number', name: 'Number & Operations', icon: Calculator },
    { id: 'algebra', name: 'Algebra', icon: Calculator },
    { id: 'geometry', name: 'Geometry', icon: Ruler },
    { id: 'multimedia', name: 'Video Learning', icon: Play }
  ];

  const [selectedCategory, setSelectedCategory] = useState('all');

  const filteredTools = selectedCategory === 'all' 
    ? tools 
    : tools.filter(tool => tool.category === selectedCategory);

  if (selectedTool) {
    const tool = tools.find(t => t.id === selectedTool);
    const ToolComponent = tool?.component;
    
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">{tool?.name}</h2>
            <p className="text-muted-foreground">{tool?.description}</p>
          </div>
          <Button 
            variant="outline" 
            onClick={() => setSelectedTool(null)}
          >
            ← Back to Tools
          </Button>
        </div>
        
        {ToolComponent && <ToolComponent />}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Learning Tools</h2>
          <p className="text-muted-foreground">Interactive manipulatives and educational tools</p>
        </div>
        <Button 
          variant="outline" 
          onClick={() => setCurrentView('practice')}
        >
          Practice Questions
        </Button>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2">
        {categories.map(category => {
          const Icon = category.icon;
          return (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? "default" : "outline"}
              onClick={() => setSelectedCategory(category.id)}
              className="flex items-center gap-2"
            >
              <Icon className="h-4 w-4" />
              {category.name}
            </Button>
          );
        })}
      </div>

      {/* Tools Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTools.map(tool => {
          const Icon = tool.icon;
          return (
            <Card 
              key={tool.id} 
              className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105"
              onClick={() => setSelectedTool(tool.id)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <Icon className="h-8 w-8 text-primary" />
                  <Badge variant="secondary" className="text-xs">
                    {tool.category}
                  </Badge>
                </div>
                <CardTitle className="text-lg">{tool.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  {tool.description}
                </p>
                <Button variant="outline" className="w-full">
                  Open Tool
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick Access */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Quick Access
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Button 
              variant="outline" 
              onClick={() => setSelectedTool('fractions')}
              className="h-auto py-3 flex flex-col gap-1"
            >
              <BarChart3 className="h-5 w-5" />
              <span className="text-xs">Fractions</span>
            </Button>
            <Button 
              variant="outline" 
              onClick={() => setSelectedTool('algebra')}
              className="h-auto py-3 flex flex-col gap-1"
            >
              <Calculator className="h-5 w-5" />
              <span className="text-xs">Algebra</span>
            </Button>
            <Button 
              variant="outline" 
              onClick={() => setSelectedTool('geometry')}
              className="h-auto py-3 flex flex-col gap-1"
            >
              <Ruler className="h-5 w-5" />
              <span className="text-xs">Geometry</span>
            </Button>
            <Button 
              variant="outline" 
              onClick={() => setSelectedTool('videos')}
              className="h-auto py-3 flex flex-col gap-1"
            >
              <Play className="h-5 w-5" />
              <span className="text-xs">Videos</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};