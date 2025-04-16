
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
    // Adjust these field mappings based on actual Jira CSV export format
    return {
      key: row['Issue key'] || row['Key'] || '',
      summary: row['Summary'] || '',
      status: row['Status'] || '',
      created: row['Created'] || '',
      resolved: row['Resolved'] || null,
      storyPoints: row['Story Points'] ? parseFloat(row['Story Points']) : 
                  row['Story point estimate'] ? parseFloat(row['Story point estimate']) : 0,
      epic: row['Epic Link'] || row['Epic'] || '',
    };
  }).filter((issue: JiraIssue) => issue.key !== '');
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
  };
};

/**
 * Basic validation to check if data looks like a Jira CSV export
 */
export const validateJiraCSV = (data: any[]): boolean => {
  if (data.length === 0) return false;
  
  // Check for common Jira fields in the first row
  const firstRow = data[0];
  const requiredFields = ['Key', 'Summary', 'Status'];
  const alternativeFields = ['Issue key', 'Issue summary', 'Status'];
  
  // Check if standard fields exist
  const hasRequiredFields = requiredFields.every(field => 
    Object.keys(firstRow).some(key => key === field)
  );
  
  // Check if alternative field names exist
  const hasAlternativeFields = alternativeFields.every(field => 
    Object.keys(firstRow).some(key => key === field)
  );
  
  return hasRequiredFields || hasAlternativeFields;
};
