
import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, Clock, FileBarChart, Users, Calendar, TrendingUp, Edit2, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useForm } from 'react-hook-form';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
} from '@/components/ui/form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

interface SummaryMetricsProps {
  totalPoints: number;
  completedPoints: number;
  totalIssues: number;
  completionPercentage: number;
  totalAssignees?: number;
  projectedCompletionDate?: Date | null;
  velocity?: number;
  originalVelocity?: number;
  onTeamMembersChange?: (teamMembers: number) => void;
  onVelocityChange?: (velocity: number) => void;
}

const teamMembersSchema = z.object({
  teamMembers: z.number().int().positive()
});

const velocitySchema = z.object({
  velocity: z.number().positive()
});

type TeamMembersFormValues = z.infer<typeof teamMembersSchema>;
type VelocityFormValues = z.infer<typeof velocitySchema>;

export function SummaryMetrics({ 
  totalPoints, 
  completedPoints, 
  totalIssues, 
  completionPercentage,
  totalAssignees = 0,
  projectedCompletionDate,
  velocity,
  originalVelocity,
  onTeamMembersChange,
  onVelocityChange
}: SummaryMetricsProps) {
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [customTeamMembers, setCustomTeamMembers] = useState<number | undefined>(undefined);
  const [customVelocity, setCustomVelocity] = useState<number | undefined>(undefined);

  const displayedTeamMembers = customTeamMembers !== undefined ? customTeamMembers : totalAssignees;
  const displayedVelocity = customVelocity !== undefined ? customVelocity : velocity;

  const teamMembersForm = useForm<TeamMembersFormValues>({
    resolver: zodResolver(teamMembersSchema),
    defaultValues: {
      teamMembers: displayedTeamMembers
    }
  });

  const velocityForm = useForm<VelocityFormValues>({
    resolver: zodResolver(velocitySchema),
    defaultValues: {
      velocity: displayedVelocity || 0
    }
  });

  const onSubmitTeamMembers = (data: TeamMembersFormValues) => {
    setCustomTeamMembers(data.teamMembers);
    setIsEditing(null);
    
    // Notify parent component about the team members change
    if (onTeamMembersChange) {
      onTeamMembersChange(data.teamMembers);
    }
  };

  const onSubmitVelocity = (data: VelocityFormValues) => {
    setCustomVelocity(data.velocity);
    setIsEditing(null);
    
    // Notify parent component about the velocity change
    if (onVelocityChange) {
      onVelocityChange(data.velocity);
    }
  };

  const handleResetTeamMembers = () => {
    setCustomTeamMembers(undefined);
    setIsEditing(null);
    
    // Reset team members to default by passing the original value
    if (onTeamMembersChange) {
      onTeamMembersChange(totalAssignees);
    }
  };

  const handleResetVelocity = () => {
    setCustomVelocity(undefined);
    setIsEditing(null);
    
    // Reset velocity to the original calculated value
    if (onVelocityChange && originalVelocity !== undefined) {
      onVelocityChange(originalVelocity);
    }
  };

  // Format projected date if available
  const formattedDate = projectedCompletionDate 
    ? projectedCompletionDate.toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    : 'Not available';

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
            <div className="flex ml-auto">
              {customTeamMembers !== undefined && (
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-5 w-5" 
                  onClick={handleResetTeamMembers}
                  title="Reset to default"
                >
                  <RotateCcw className="h-3 w-3" />
                </Button>
              )}
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-5 w-5" 
                onClick={() => setIsEditing(isEditing === 'teamMembers' ? null : 'teamMembers')}
              >
                <Edit2 className="h-3 w-3" />
              </Button>
            </div>
          </div>
          
          {isEditing === 'teamMembers' ? (
            <Form {...teamMembersForm}>
              <form onSubmit={teamMembersForm.handleSubmit(onSubmitTeamMembers)} className="flex gap-2 items-center">
                <FormField
                  control={teamMembersForm.control}
                  name="teamMembers"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormControl>
                        <Input
                          type="number"
                          min="1"
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                          autoFocus
                          className="h-8"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <Button type="submit" size="sm" className="h-8">Save</Button>
              </form>
            </Form>
          ) : (
            <div className="text-2xl font-bold">{displayedTeamMembers}</div>
          )}
        </CardContent>
      </Card>

      <Card className="md:col-span-2">
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

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <TrendingUp className="h-4 w-4" />
            <span className="text-sm font-medium">Team Velocity</span>
            <div className="flex ml-auto">
              {customVelocity !== undefined && (
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-5 w-5" 
                  onClick={handleResetVelocity}
                  title="Reset to default"
                >
                  <RotateCcw className="h-3 w-3" />
                </Button>
              )}
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-5 w-5" 
                onClick={() => setIsEditing(isEditing === 'velocity' ? null : 'velocity')}
              >
                <Edit2 className="h-3 w-3" />
              </Button>
            </div>
          </div>
          
          {isEditing === 'velocity' ? (
            <Form {...velocityForm}>
              <form onSubmit={velocityForm.handleSubmit(onSubmitVelocity)} className="flex gap-2 items-center">
                <FormField
                  control={velocityForm.control}
                  name="velocity"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormControl>
                        <Input
                          type="number"
                          min="0.1"
                          step="0.1"
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                          autoFocus
                          className="h-8"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <Button type="submit" size="sm" className="h-8">Save</Button>
              </form>
            </Form>
          ) : (
            <div className="text-2xl font-bold">
              {displayedVelocity ? `${displayedVelocity.toFixed(1)}` : 'N/A'}
              <span className="text-sm text-muted-foreground ml-1">points/day</span>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <Calendar className="h-4 w-4" />
            <span className="text-sm font-medium">Projected Completion</span>
          </div>
          <div className="text-2xl font-bold">{formattedDate}</div>
        </CardContent>
      </Card>
    </div>
  );
}
