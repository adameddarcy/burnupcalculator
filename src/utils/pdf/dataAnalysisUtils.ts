
import { ProcessedData, AssigneeMetrics, JiraIssue } from '@/types/jira';

/**
 * Finds the week with the most completed points
 */
export const findWeekWithMostPoints = (processedData: ProcessedData): { weekStart: Date; weekEnd: Date; points: number } | null => {
  const resolvedIssues = processedData.issues.filter(issue => issue.resolved);
  if (resolvedIssues.length === 0) return null;
  
  // Group by week
  const weekMap = new Map<string, { points: number; weekStart: Date; weekEnd: Date }>();
  
  resolvedIssues.forEach(issue => {
    if (!issue.resolved) return;
    
    const resolvedDate = new Date(issue.resolved);
    const weekStart = new Date(resolvedDate);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay()); // Go to start of week (Sunday)
    weekStart.setHours(0, 0, 0, 0);
    
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6); // End of week (Saturday)
    weekEnd.setHours(23, 59, 59, 999);
    
    const weekKey = weekStart.toISOString();
    
    if (!weekMap.has(weekKey)) {
      weekMap.set(weekKey, { points: 0, weekStart, weekEnd });
    }
    
    const weekData = weekMap.get(weekKey)!;
    weekData.points += issue.storyPoints || 1;
  });
  
  // Find week with most points
  let maxPoints = 0;
  let bestWeek = null;
  
  weekMap.forEach(week => {
    if (week.points > maxPoints) {
      maxPoints = week.points;
      bestWeek = week;
    }
  });
  
  return bestWeek ? { 
    weekStart: bestWeek.weekStart, 
    weekEnd: bestWeek.weekEnd, 
    points: maxPoints 
  } : null;
};

/**
 * Finds the most productive team member
 */
export const findMostProductiveAssignee = (assigneeData: AssigneeMetrics[]): AssigneeMetrics | null => {
  if (assigneeData.length === 0) return null;
  
  return assigneeData.reduce((most, current) => {
    return (current.completedPoints > most.completedPoints) ? current : most;
  }, assigneeData[0]);
};

/**
 * Calculates the average time from "in progress" to completion
 */
export const calculateAverageTimeToCompletion = (issues: JiraIssue[]): number => {
  const completedIssues = issues.filter(issue => 
    issue.resolved && 
    issue.statusChanges && 
    issue.statusChanges.some(change => 
      change.toStatus.toLowerCase().includes('progress') || 
      change.toStatus.toLowerCase() === 'in progress'
    )
  );
  
  if (completedIssues.length === 0) {
    return calculateAverageCycleTime(issues);
  }
  
  const totalDays = completedIssues.reduce((total, issue) => {
    const inProgressChange = issue.statusChanges
      .find(change => 
        change.toStatus.toLowerCase().includes('progress') || 
        change.toStatus.toLowerCase() === 'in progress'
      );
    
    if (!inProgressChange || !inProgressChange.date) {
      const createdDate = new Date(issue.created);
      const resolvedDate = new Date(issue.resolved);
      return total + (resolvedDate.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24);
    }
    
    const inProgressDate = new Date(inProgressChange.date);
    const resolvedDate = new Date(issue.resolved);
    const days = (resolvedDate.getTime() - inProgressDate.getTime()) / (1000 * 60 * 60 * 24);
    return total + days;
  }, 0);
  
  return totalDays / completedIssues.length;
};

/**
 * Calculates the average cycle time (days from creation to resolution)
 */
export const calculateAverageCycleTime = (issues: JiraIssue[]): number => {
  const resolvedIssues = issues.filter(issue => issue.resolved);
  if (resolvedIssues.length === 0) return 0;
  
  const totalDays = resolvedIssues.reduce((total, issue) => {
    const createdDate = new Date(issue.created);
    const resolvedDate = new Date(issue.resolved!);
    const days = (resolvedDate.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24);
    return total + days;
  }, 0);
  
  return totalDays / resolvedIssues.length;
};
