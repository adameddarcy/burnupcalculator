
import Papa from 'papaparse';
import { JiraIssue, ProcessedData, ChartData } from '@/types/jira';

/**
 * Parse CSV data from Jira export
 */
export const parseJiraCSV = (csvData: string): JiraIssue[] => {
  const result = Papa.parse(csvData, {
    header: true,
    skipEmptyLines: true,
  });
  
  if (result.errors.length > 0) {
    throw new Error(`CSV parsing error: ${result.errors.map(e => e.message).join(', ')}`);
  }

  // Map CSV columns to our JiraIssue interface
  return result.data.map((row: any) => {
    // Support standard Jira export column names
    return {
      key: row['Issue key'] || '',
      summary: row['Summary'] || '',
      status: row['Status'] || '',
      created: row['Created'] || '',
      resolved: row['Resolved'] || null,
      // Look for Story Points in various possible column names
      storyPoints: parseStoryPoints(row),
      epic: row['Epic Link'] || row['Epic'] || '',
      // Handle assignee from various possible column names
      assignee: row['Assignee'] || row['Assigned To'] || row['Assigned'] || '',
    };
  }).filter((issue: JiraIssue) => issue.key !== '');
};

/**
 * Helper function to parse story points from various column formats
 */
const parseStoryPoints = (row: any): number => {
  // Check multiple possible column names for Story Points
  const storyPointFields = [
    'Story Points', 
    'Story point estimate', 
    'Story Points Estimate',
    'Story Point Estimate',
    'Custom field (Story Points)'
  ];
  
  for (const field of storyPointFields) {
    if (row[field] && !isNaN(parseFloat(row[field]))) {
      return parseFloat(row[field]);
    }
  }
  
  return 0; // Default to 0 if no story points found
};

/**
 * Process Jira issues into burnup and burndown chart data
 */
export const processJiraData = (issues: JiraIssue[]): ProcessedData => {
  // Sort issues by created date
  const sortedIssues = [...issues].sort((a, b) => 
    new Date(a.created).getTime() - new Date(b.created).getTime()
  );

  // Get unique dates from the issues (created and resolved)
  const allDates = new Set<string>();
  sortedIssues.forEach(issue => {
    // Format date to YYYY-MM-DD
    const createdDate = new Date(issue.created).toISOString().split('T')[0];
    allDates.add(createdDate);
    
    if (issue.resolved) {
      const resolvedDate = new Date(issue.resolved).toISOString().split('T')[0];
      allDates.add(resolvedDate);
    }
  });

  // Convert to array and sort dates
  const dateLabels = Array.from(allDates).sort();

  // Calculate cumulative story points for burnup and burndown
  const totalPoints = sortedIssues.reduce((sum, issue) => sum + (issue.storyPoints || 0), 0);
  let completedPoints = 0;

  // Generate data for burnup chart
  const burnupData = dateLabels.map(date => {
    const dateTime = new Date(date).getTime();
    
    // Count completed points up to this date
    const completedByDate = sortedIssues
      .filter(issue => issue.resolved && new Date(issue.resolved).getTime() <= dateTime)
      .reduce((sum, issue) => sum + (issue.storyPoints || 0), 0);
    
    // Count scope (total points) added by this date
    const scopeByDate = sortedIssues
      .filter(issue => new Date(issue.created).getTime() <= dateTime)
      .reduce((sum, issue) => sum + (issue.storyPoints || 0), 0);
    
    completedPoints = completedByDate; // Update for the latest date
    
    return { date, completed: completedByDate, scope: scopeByDate };
  });

  // Generate data for burndown chart
  const burndownData = dateLabels.map(date => {
    const dateTime = new Date(date).getTime();
    
    // Count remaining points after this date
    const completedByDate = sortedIssues
      .filter(issue => issue.resolved && new Date(issue.resolved).getTime() <= dateTime)
      .reduce((sum, issue) => sum + (issue.storyPoints || 0), 0);
    
    const remainingPoints = totalPoints - completedByDate;
    
    return { date, remaining: remainingPoints };
  });

  // Process assignee data
  const assigneeMap = new Map<string, { 
    completedPoints: number; 
    assignedPoints: number; 
    issueCount: number; 
  }>();

  sortedIssues.forEach(issue => {
    const assignee = issue.assignee || 'Unassigned';
    
    if (!assigneeMap.has(assignee)) {
      assigneeMap.set(assignee, { 
        completedPoints: 0, 
        assignedPoints: 0, 
        issueCount: 0 
      });
    }
    
    const assigneeData = assigneeMap.get(assignee)!;
    assigneeData.issueCount++;
    assigneeData.assignedPoints += issue.storyPoints || 0;
    
    if (issue.resolved) {
      assigneeData.completedPoints += issue.storyPoints || 0;
    }
  });

  // Convert assignee map to array for the response
  const assigneeData = Array.from(assigneeMap.entries()).map(([name, data]) => ({
    name,
    ...data
  }));

  // Format for chart display
  const burnupChartData: ChartData = {
    labels: dateLabels,
    datasets: [
      {
        label: 'Completed',
        data: burnupData.map(d => d.completed),
        backgroundColor: 'rgba(54, 179, 126, 0.2)',
        borderColor: 'rgba(54, 179, 126, 1)',
        fill: true,
      },
      {
        label: 'Total Scope',
        data: burnupData.map(d => d.scope),
        borderColor: 'rgba(0, 82, 204, 1)',
        backgroundColor: 'rgba(0, 82, 204, 0.1)',
        fill: false,
      }
    ],
  };

  const burndownChartData: ChartData = {
    labels: dateLabels,
    datasets: [
      {
        label: 'Remaining',
        data: burndownData.map(d => d.remaining),
        backgroundColor: 'rgba(255, 171, 0, 0.2)',
        borderColor: 'rgba(255, 171, 0, 1)',
        fill: true,
      },
    ],
  };

  return {
    burnup: burnupChartData,
    burndown: burndownChartData,
    completedPoints,
    totalPoints,
    issues: sortedIssues,
    assigneeData,
    totalAssignees: assigneeMap.size,
  };
};

/**
 * Basic validation to check if data looks like a Jira CSV export
 */
export const validateJiraCSV = (data: any[]): boolean => {
  if (data.length === 0) return false;
  
  // Check for required Jira fields in the first row
  const firstRow = data[0];
  const requiredFields = ['Summary', 'Issue key', 'Status', 'Created'];
  
  // Count how many required fields exist in the CSV
  const foundFieldsCount = requiredFields.filter(field => 
    Object.keys(firstRow).some(key => key === field)
  ).length;
  
  // If we found at least 3 of 4 required fields, consider it valid
  return foundFieldsCount >= 3;
};
