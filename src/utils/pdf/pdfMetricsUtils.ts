import jsPDF from 'jspdf';
import { ProcessedData, AssigneeMetrics } from '@/types/jira';

/**
 * Adds summary metrics to the PDF report
 */
export const addSummaryMetricsToPdf = (
  doc: jsPDF,
  processedData: ProcessedData,
  customTeamMembers: number | null,
  margin: number,
  yPos: number
): number => {
  doc.setFontSize(16);
  doc.text('Summary Metrics', margin, yPos);
  yPos += 10;
  
  doc.setFontSize(12);
  doc.text(`Total Story Points: ${processedData.totalPoints}`, margin, yPos);
  yPos += 7;
  
  doc.text(`Completed Points: ${processedData.completedPoints}`, margin, yPos);
  yPos += 7;
  
  doc.text(`Completion: ${Math.round((processedData.completedPoints / processedData.totalPoints) * 100)}%`, margin, yPos);
  yPos += 7;
  
  doc.text(`Total Issues: ${processedData.issues.length}`, margin, yPos);
  yPos += 7;
  
  const effectiveTeamMembers = customTeamMembers !== null 
    ? customTeamMembers
    : processedData?.totalAssignees || 0;
  
  doc.text(`Team Members: ${effectiveTeamMembers}`, margin, yPos);
  yPos += 7;

  if (processedData.velocity) {
    doc.text(`Team Velocity: ${processedData.velocity.toFixed(1)} points/day`, margin, yPos);
    yPos += 7;
  }

  if (processedData.projectedCompletionDate) {
    const today = new Date();
    const daysToCompletion = Math.ceil((processedData.projectedCompletionDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    doc.text(`Projected Completion: ${processedData.projectedCompletionDate.toLocaleDateString()}`, margin, yPos);
    yPos += 7;
    
    doc.text(`Days until completion: ${daysToCompletion > 0 ? daysToCompletion : 'Overdue!'}`, margin, yPos);
    yPos += 7;
  }
  
  // Add fun facts section
  yPos = addFunFactsToPdf(doc, processedData, margin, yPos);
  
  // Add horizontal line
  doc.setDrawColor(200, 200, 200);
  doc.line(margin, yPos + 3, doc.internal.pageSize.getWidth() - margin, yPos + 3);
  yPos += 10;

  return yPos;
};

/**
 * Adds fun facts section to the PDF report
 */
const addFunFactsToPdf = (
  doc: jsPDF,
  processedData: ProcessedData,
  margin: number,
  yPos: number
): number => {
  doc.setFontSize(14);
  doc.text("Fun Facts", margin, yPos);
  yPos += 8;
  
  doc.setFontSize(10);
  
  // Find the week with most completed points
  const weeklyCompletion = findWeekWithMostPoints(processedData);
  if (weeklyCompletion) {
    doc.text(`During the week of ${formatDateRange(weeklyCompletion.weekStart, weeklyCompletion.weekEnd)},`, margin, yPos);
    yPos += 5;
    doc.text(`the team crushed it with ${weeklyCompletion.points} story points!`, margin, yPos);
    yPos += 8;
  }
  
  return yPos;
};

/**
 * Finds the week with the most completed points
 */
const findWeekWithMostPoints = (processedData: ProcessedData): { weekStart: Date; weekEnd: Date; points: number } | null => {
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
 * Helper to format a date range as a string
 */
const formatDateRange = (start: Date, end: Date): string => {
  const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
  return `${start.toLocaleDateString(undefined, options)} - ${end.toLocaleDateString(undefined, options)}`;
};

/**
 * Finds the most productive team member
 */
const findMostProductiveAssignee = (assigneeData: AssigneeMetrics[]): AssigneeMetrics | null => {
  if (assigneeData.length === 0) return null;
  
  return assigneeData.reduce((most, current) => {
    return (current.completedPoints > most.completedPoints) ? current : most;
  }, assigneeData[0]);
};

/**
 * Calculates the average time from "in progress" to completion
 */
const calculateAverageTimeToCompletion = (issues: any[]): number => {
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
const calculateAverageCycleTime = (issues: any[]): number => {
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

/**
 * Adds assignee data table to the PDF report
 */
export const addAssigneeTableToPdf = (
  doc: jsPDF,
  assigneeData: AssigneeMetrics[],
  margin: number,
  contentWidth: number,
  yPos: number
): number => {
  // Check if we need a new page
  if (yPos > doc.internal.pageSize.getHeight() - 60) {
    doc.addPage();
    yPos = 20;
  }
  
  // Add table title
  doc.setFontSize(14);
  doc.text('Assignee Data', margin, yPos);
  yPos += 8;
  
  // Set up table
  doc.setFontSize(10);
  const headers = ['Assignee', 'Completed Points', 'Assigned Points', 'Issues'];
  const colWidths = [contentWidth * 0.4, contentWidth * 0.2, contentWidth * 0.2, contentWidth * 0.2];
  
  // Draw table header
  doc.setFillColor(240, 240, 240);
  doc.setDrawColor(200, 200, 200);
  doc.rect(margin, yPos, contentWidth, 7, 'FD');
  
  let xPos = margin;
  headers.forEach((header, index) => {
    doc.text(header, xPos + 2, yPos + 5);
    xPos += colWidths[index];
  });
  
  yPos += 7;
  
  // Draw table rows
  doc.setFillColor(255, 255, 255);
  assigneeData.forEach((assignee, index) => {
    // Check if we need a new page
    if (yPos > doc.internal.pageSize.getHeight() - 20) {
      doc.addPage();
      yPos = 20;
      
      // Redraw header on new page
      doc.setFontSize(10);
      doc.setFillColor(240, 240, 240);
      doc.rect(margin, yPos, contentWidth, 7, 'FD');
      
      xPos = margin;
      headers.forEach((header, index) => {
        doc.text(header, xPos + 2, yPos + 5);
        xPos += colWidths[index];
      });
      
      yPos += 7;
      doc.setFillColor(255, 255, 255);
    }
    
    // Row background (alternate colors)
    doc.setFillColor(index % 2 === 0 ? 255 : 248, index % 2 === 0 ? 255 : 248, index % 2 === 0 ? 255 : 248);
    doc.rect(margin, yPos, contentWidth, 7, 'FD');
    
    // Row data
    xPos = margin;
    doc.text(assignee.name || 'Unassigned', xPos + 2, yPos + 5, { maxWidth: colWidths[0] - 4 });
    xPos += colWidths[0];
    
    doc.text(assignee.completedPoints.toString(), xPos + 2, yPos + 5);
    xPos += colWidths[1];
    
    doc.text(assignee.assignedPoints.toString(), xPos + 2, yPos + 5);
    xPos += colWidths[2];
    
    doc.text(assignee.issueCount.toString(), xPos + 2, yPos + 5);
    
    yPos += 7;
  });

  return yPos;
};
