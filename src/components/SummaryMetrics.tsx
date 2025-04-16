
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, Clock, FileBarChart, Users } from 'lucide-react';

interface SummaryMetricsProps {
  totalPoints: number;
  completedPoints: number;
  totalIssues: number;
  completionPercentage: number;
  totalAssignees?: number;
}

export function SummaryMetrics({ 
  totalPoints, 
  completedPoints, 
  totalIssues, 
  completionPercentage,
  totalAssignees = 0
}: SummaryMetricsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <FileBarChart className="h-4 w-4" /> 
            <span className="text-sm font-medium">Total Story Points</span>
          </div>
          <div className="text-2xl font-bold">{totalPoints}</div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <CheckCircle className="h-4 w-4" />
            <span className="text-sm font-medium">Completed Points</span>
          </div>
          <div className="text-2xl font-bold">{completedPoints}</div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <Clock className="h-4 w-4" /> 
            <span className="text-sm font-medium">Total Issues</span>
          </div>
          <div className="text-2xl font-bold">{totalIssues}</div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <Users className="h-4 w-4" /> 
            <span className="text-sm font-medium">Team Members</span>
          </div>
          <div className="text-2xl font-bold">{totalAssignees}</div>
        </CardContent>
      </Card>

      <Card className="md:col-span-2 lg:col-span-4">
        <CardContent className="pt-6">
          <div className="flex flex-col space-y-2">
            <div className="flex justify-between">
              <span className="text-sm font-medium">Epic Progress</span>
              <span className="text-sm">{Math.round(completionPercentage)}%</span>
            </div>
            <Progress value={completionPercentage} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
