
import Papa from 'papaparse';
import { JiraIssue, ProcessedData, ChartData, AssigneeMetrics } from '@/types/jira';

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

  // Map CSV columns to our JiraIssue interface, focusing on the fields specified
  return result.data.map((row: any) => {
    return {
      key: row['Issue key'] || '',
      summary: row['Summary'] || '',
      status: row['Status'] || '',
      created: row['Created'] || '',
      updated: row['Updated'] || '',
      resolved: row['Resolved'] || null,
      storyPoints: parseStoryPoints(row),
      epic: row['Custom field (Epic Link)'] || row['Epic Link'] || row['Epic'] || '',
      assignee: row['Assignee'] || row['Assigned To'] || row['Assigned'] || '',
      description: row['Description'] || '',
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
    'Custom field (Story Points)',
    'Custom field (Original story points)'
  ];
  
  for (const field of storyPointFields) {
    if (row[field] && !isNaN(parseFloat(row[field]))) {
      return parseFloat(row[field]);
    }
  }
  
  return 1; // Default to 1 if no story points found (treat each issue as 1 point)
};

/**
 * Process Jira issues into burnup and burndown chart data
 * with focus on assignees, created dates, and resolved dates
 */
export const processJiraData = (issues: JiraIssue[]): ProcessedData => {
  // Sort issues by created date
  const sortedIssues = [...issues].sort((a, b) => 
    new Date(a.created).getTime() - new Date(b.created).getTime()
  );

  // Get unique dates from the issues (created, updated and resolved)
  const allDates = new Set<string>();
  sortedIssues.forEach(issue => {
    // Format date to YYYY-MM-DD
    const createdDate = new Date(issue.created).toISOString().split('T')[0];
    allDates.add(createdDate);
    
    if (issue.updated) {
      const updatedDate = new Date(issue.updated).toISOString().split('T')[0];
      allDates.add(updatedDate);
    }
    
    if (issue.resolved) {
      const resolvedDate = new Date(issue.resolved).toISOString().split('T')[0];
      allDates.add(resolvedDate);
    }
  });

  // Convert to array and sort dates
  const dateLabels = Array.from(allDates).sort();

  // Calculate cumulative story points for burnup and burndown
  const totalPoints = sortedIssues.reduce((sum, issue) => sum + (issue.storyPoints || 1), 0);
  let completedPoints = 0;

  // Generate data for burnup chart
  const burnupData = dateLabels.map(date => {
    const dateTime = new Date(date).getTime();
    
    // Count completed points up to this date
    const completedByDate = sortedIssues
      .filter(issue => issue.resolved && new Date(issue.resolved).getTime() <= dateTime)
      .reduce((sum, issue) => sum + (issue.storyPoints || 1), 0);
    
    // Count scope (total points) added by this date
    const scopeByDate = sortedIssues
      .filter(issue => new Date(issue.created).getTime() <= dateTime)
      .reduce((sum, issue) => sum + (issue.storyPoints || 1), 0);
    
    completedPoints = completedByDate; // Update for the latest date
    
    return { date, completed: completedByDate, scope: scopeByDate };
  });

  // Generate data for burndown chart
  const burndownData = dateLabels.map(date => {
    const dateTime = new Date(date).getTime();
    
    // Count remaining points after this date
    const completedByDate = sortedIssues
      .filter(issue => issue.resolved && new Date(issue.resolved).getTime() <= dateTime)
      .reduce((sum, issue) => sum + (issue.storyPoints || 1), 0);
    
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
    assigneeData.assignedPoints += issue.storyPoints || 1;
    
    if (issue.resolved) {
      assigneeData.completedPoints += issue.storyPoints || 1;
    }
  });

  // Convert assignee map to array for the response
  const assigneeData = Array.from(assigneeMap.entries()).map(([name, data]) => ({
    name,
    ...data
  }));

  // Create assignee chart data - showing points per assignee
  const assigneeChartData: ChartData = {
    labels: assigneeData.map(a => a.name),
    datasets: [
      {
        label: 'Assigned Points',
        data: assigneeData.map(a => a.assignedPoints),
        backgroundColor: 'rgba(0, 82, 204, 0.6)',
      },
      {
        label: 'Completed Points',
        data: assigneeData.map(a => a.completedPoints),
        backgroundColor: 'rgba(54, 179, 126, 0.6)',
      }
    ]
  };

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
    assigneeChartData,
  };
};

/**
 * Basic validation to check if data looks like a Jira CSV export
 * focusing on the key fields specified by the user
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
