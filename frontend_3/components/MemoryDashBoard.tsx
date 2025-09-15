import React from 'react';
import { Calendar, Camera, TrendingUp, Lightbulb, Star } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Todo } from './TodoItem';

interface MemoryDashboardProps {
  todos: Todo[];
  onCreateSlideshow: () => void;
}

export const MemoryDashboard: React.FC<MemoryDashboardProps> = ({ todos, onCreateSlideshow }) => {
  const completedTodos = todos.filter(todo => todo.completed);
  const todosWithImages = todos.filter(todo => todo.image);
  const recentCompletions = completedTodos
    .filter(todo => todo.completedAt && new Date(todo.completedAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000))
    .length;

  const getAIRecommendations = () => {
    const recommendations = [
      {
        type: 'productivity',
        title: 'Try time-blocking',
        description: 'Based on your completion patterns, consider dedicating specific time blocks to similar tasks.',
        icon: TrendingUp
      },
      {
        type: 'memory',
        title: 'Weekly photo review',
        description: 'You have great visual progress! Set a weekly reminder to review your photo memories.',
        icon: Camera
      },
      {
        type: 'motivation',
        title: 'Celebrate small wins',
        description: 'You\'ve completed several tasks recently. Take a moment to acknowledge your progress!',
        icon: Star
      }
    ];

    return recommendations.slice(0, 2);
  };

  const recommendations = getAIRecommendations();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm">Visual Memories</CardTitle>
          <Camera className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl mb-1">{todosWithImages.length}</div>
          <p className="text-xs text-muted-foreground">
            Photos captured
          </p>
          {todosWithImages.length >= 3 && (
            <Button
              variant="outline"
              size="sm"
              onClick={onCreateSlideshow}
              className="mt-3 w-full"
            >
              Create Slideshow
            </Button>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm">This Week</CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl mb-1">{recentCompletions}</div>
          <p className="text-xs text-muted-foreground">
            Tasks completed
          </p>
          {recentCompletions > 5 && (
            <Badge variant="secondary" className="mt-2">
              On fire! 🔥
            </Badge>
          )}
        </CardContent>
      </Card>

      <Card className="md:col-span-2 lg:col-span-1">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm">AI Insights</CardTitle>
          <Lightbulb className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recommendations.map((rec, index) => (
              <div key={index} className="flex items-start gap-2">
                <rec.icon className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm">{rec.title}</p>
                  <p className="text-xs text-muted-foreground">{rec.description}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};