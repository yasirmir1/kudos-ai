import React, { useState } from 'react';
import { Crown, Medal, Trophy, TrendingUp, Users, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';

interface LeaderboardEntry {
  id: string;
  name: string;
  avatar?: string;
  score: number;
  rank: number;
  change: number; // position change from last period
  streak: number;
  accuracy: number;
  questionsCompleted: number;
  timeFrame: 'week' | 'month' | 'allTime';
}

const leaderboardData: LeaderboardEntry[] = [
  {
    id: '1',
    name: 'Sarah Chen',
    avatar: '/avatars/sarah.png',
    score: 2840,
    rank: 1,
    change: 0,
    streak: 12,
    accuracy: 94,
    questionsCompleted: 156,
    timeFrame: 'week'
  },
  {
    id: '2',
    name: 'Marcus Johnson',
    avatar: '/avatars/marcus.png',
    score: 2735,
    rank: 2,
    change: 1,
    streak: 8,
    accuracy: 91,
    questionsCompleted: 142,
    timeFrame: 'week'
  },
  {
    id: '3',
    name: 'Emma Rodriguez',
    avatar: '/avatars/emma.png',
    score: 2680,
    rank: 3,
    change: -1,
    streak: 15,
    accuracy: 89,
    questionsCompleted: 138,
    timeFrame: 'week'
  },
  {
    id: '4',
    name: 'You',
    score: 2420,
    rank: 7,
    change: 2,
    streak: 6,
    accuracy: 87,
    questionsCompleted: 124,
    timeFrame: 'week'
  }
];

const Leaderboard: React.FC = () => {
  const [timeFrame, setTimeFrame] = useState<'week' | 'month' | 'allTime'>('week');
  const [viewType, setViewType] = useState<'global' | 'friends' | 'class'>('global');

  const currentUser = leaderboardData.find(entry => entry.name === 'You');

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="h-6 w-6 text-yellow-500" />;
      case 2:
        return <Medal className="h-6 w-6 text-gray-400" />;
      case 3:
        return <Trophy className="h-6 w-6 text-amber-600" />;
      default:
        return <span className="text-lg font-bold text-muted-foreground">#{rank}</span>;
    }
  };

  const getRankBadgeColor = (rank: number) => {
    if (rank <= 3) return 'bg-primary text-primary-foreground';
    if (rank <= 10) return 'bg-secondary text-secondary-foreground';
    return 'bg-muted text-muted-foreground';
  };

  const getChangeIndicator = (change: number) => {
    if (change > 0) {
      return (
        <div className="flex items-center text-green-600 text-sm">
          <TrendingUp className="h-3 w-3 mr-1" />
          +{change}
        </div>
      );
    } else if (change < 0) {
      return (
        <div className="flex items-center text-destructive text-sm">
          <TrendingUp className="h-3 w-3 mr-1 rotate-180" />
          {change}
        </div>
      );
    }
    return <div className="text-sm text-muted-foreground">—</div>;
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-4">Leaderboard</h1>
        
        {currentUser && (
          <Card className="bg-gradient-to-r from-primary/10 to-primary-glow/10 border-primary/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <Badge className={getRankBadgeColor(currentUser.rank)}>
                    #{currentUser.rank}
                  </Badge>
                  <div>
                    <p className="font-semibold text-foreground">Your Current Ranking</p>
                    <p className="text-sm text-muted-foreground">
                      {currentUser.score} points • {currentUser.accuracy}% accuracy
                    </p>
                  </div>
                </div>
                {getChangeIndicator(currentUser.change)}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <Tabs value={timeFrame} onValueChange={(value) => setTimeFrame(value as any)} className="flex-1">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="week">This Week</TabsTrigger>
            <TabsTrigger value="month">This Month</TabsTrigger>
            <TabsTrigger value="allTime">All Time</TabsTrigger>
          </TabsList>
        </Tabs>

        <Tabs value={viewType} onValueChange={(value) => setViewType(value as any)} className="flex-1">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="global">Global</TabsTrigger>
            <TabsTrigger value="friends">Friends</TabsTrigger>
            <TabsTrigger value="class">Class</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="space-y-4">
        {leaderboardData.map((entry, index) => (
          <LeaderboardCard
            key={entry.id}
            entry={entry}
            isCurrentUser={entry.name === 'You'}
          />
        ))}
      </div>

      <div className="mt-8 text-center">
        <Button variant="outline" className="flex items-center space-x-2 mx-auto">
          <Users className="h-4 w-4" />
          <span>View Full Leaderboard</span>
        </Button>
      </div>
    </div>
  );
};

interface LeaderboardCardProps {
  entry: LeaderboardEntry;
  isCurrentUser: boolean;
}

const LeaderboardCard: React.FC<LeaderboardCardProps> = ({ entry, isCurrentUser }) => {
  return (
    <Card className={`transition-all duration-200 hover:shadow-md ${
      isCurrentUser ? 'ring-2 ring-primary/20 bg-primary/5' : ''
    }`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center justify-center w-12 h-12">
              {getRankIcon(entry.rank)}
            </div>
            
            <Avatar className="h-10 w-10">
              <AvatarImage src={entry.avatar} alt={entry.name} />
              <AvatarFallback>
                {entry.name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            
            <div>
              <p className={`font-semibold ${isCurrentUser ? 'text-primary' : 'text-foreground'}`}>
                {entry.name}
              </p>
              <p className="text-sm text-muted-foreground">
                {entry.score} points
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-6">
            <div className="text-center">
              <p className="text-sm font-medium text-foreground">{entry.accuracy}%</p>
              <p className="text-xs text-muted-foreground">Accuracy</p>
            </div>
            
            <div className="text-center">
              <p className="text-sm font-medium text-foreground">{entry.streak}</p>
              <p className="text-xs text-muted-foreground">Streak</p>
            </div>
            
            <div className="text-center">
              <p className="text-sm font-medium text-foreground">{entry.questionsCompleted}</p>
              <p className="text-xs text-muted-foreground">Questions</p>
            </div>

            {getChangeIndicator(entry.change)}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  function getRankIcon(rank: number) {
    switch (rank) {
      case 1:
        return <Crown className="h-6 w-6 text-yellow-500" />;
      case 2:
        return <Medal className="h-6 w-6 text-gray-400" />;
      case 3:
        return <Trophy className="h-6 w-6 text-amber-600" />;
      default:
        return <span className="text-lg font-bold text-muted-foreground">#{rank}</span>;
    }
  }

  function getChangeIndicator(change: number) {
    if (change > 0) {
      return (
        <div className="flex items-center text-green-600 text-sm">
          <TrendingUp className="h-3 w-3 mr-1" />
          +{change}
        </div>
      );
    } else if (change < 0) {
      return (
        <div className="flex items-center text-destructive text-sm">
          <TrendingUp className="h-3 w-3 mr-1 rotate-180" />
          {change}
        </div>
      );
    }
    return <div className="text-sm text-muted-foreground">—</div>;
  }
};

export default Leaderboard;