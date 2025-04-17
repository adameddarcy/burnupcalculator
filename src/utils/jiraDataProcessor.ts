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
  
  return 1;
};

/**
 * Process Jira issues into burnup and burndown chart data
 * with focus on assignees, created dates, and resolved dates
 */
export const processJiraData = (
  issues: JiraIssue[], 
  customTeamMembers?: number, 
  customVelocity?: number
): ProcessedData => {
  const sortedIssues = [...issues].sort((a, b) => 
    new Date(a.created).getTime() - new Date(b.created).getTime()
  );

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

  const allDates = new Set<string>();
  sortedIssues.forEach(issue => {
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

  const dateLabels = Array.from(allDates).sort();

  const totalPoints = sortedIssues.reduce((sum, issue) => sum + (issue.storyPoints || 1), 0);
  let completedPoints = 0;

  const burnupData = dateLabels.map(date => {
    const dateTime = new Date(date).getTime();
    
    const completedByDate = sortedIssues
      .filter(issue => issue.resolved && new Date(issue.resolved).getTime() <= dateTime)
      .reduce((sum, issue) => sum + (issue.storyPoints || 1), 0);
    
    const scopeByDate = sortedIssues
      .filter(issue => new Date(issue.created).getTime() <= dateTime)
      .reduce((sum, issue) => sum + (issue.storyPoints || 1), 0);
    
    completedPoints = completedByDate;
    
    return { date, completed: completedByDate, scope: scopeByDate };
  });

  const resolvedIssues = sortedIssues.filter(issue => issue.resolved);
  let velocity = 0;
  let originalVelocity = 0;
  let projectedCompletionDate: Date | null = null;
  
  if (resolvedIssues.length > 0) {
    const sortedResolved = [...resolvedIssues].sort((a, b) => 
      new Date(a.resolved!).getTime() - new Date(b.resolved!).getTime()
    );
    
    const firstResolvedDate = new Date(sortedResolved[0].resolved!);
    const lastResolvedDate = new Date(sortedResolved[sortedResolved.length - 1].resolved!);
    
    const durationDays = Math.max(1, (lastResolvedDate.getTime() - firstResolvedDate.getTime()) / (1000 * 60 * 60 * 24));
    
    const resolvedPoints = resolvedIssues.reduce((sum, issue) => sum + (issue.storyPoints || 1), 0);
    originalVelocity = resolvedPoints / durationDays;
    
    velocity = customVelocity !== undefined ? customVelocity : originalVelocity;
    
    const remainingPoints = totalPoints - completedPoints;
    
    let adjustedVelocity = velocity;
    const actualTeamMembers = customTeamMembers !== undefined ? customTeamMembers : assigneeMap.size;
    
    if (customTeamMembers !== undefined && assigneeMap.size > 0 && customVelocity === undefined) {
      adjustedVelocity = velocity * (customTeamMembers / assigneeMap.size);
    }
    
    const daysToCompletion = adjustedVelocity > 0 ? Math.ceil(remainingPoints / adjustedVelocity) : 0;
    
    if (adjustedVelocity > 0) {
      projectedCompletionDate = new Date();
      projectedCompletionDate.setDate(projectedCompletionDate.getDate() + daysToCompletion);
    }
  }

  let extendedDateLabels = [...dateLabels];
  if (projectedCompletionDate && !dateLabels.includes(projectedCompletionDate.toISOString().split('T')[0])) {
    const lastDate = new Date(dateLabels[dateLabels.length - 1]);
    const projectedDate = projectedCompletionDate;
    
    for (let d = new Date(lastDate); d <= projectedDate; d.setDate(d.getDate() + 7)) {
      const dateString = d.toISOString().split('T')[0];
      if (!extendedDateLabels.includes(dateString) && d < projectedDate) {
        extendedDateLabels.push(dateString);
      }
    }
    
    extendedDateLabels.push(projectedCompletionDate.toISOString().split('T')[0]);
    extendedDateLabels.sort();
  }
  
  const projectedData: number[] = [];
  
  if (velocity > 0) {
    let adjustedVelocity = velocity;
    if (customTeamMembers !== undefined && assigneeMap.size > 0 && customVelocity === undefined) {
      adjustedVelocity = velocity * (customTeamMembers / assigneeMap.size);
    }
    
    extendedDateLabels.forEach(date => {
      const currentDate = new Date(date);
      const lastKnownDate = new Date(dateLabels[dateLabels.length - 1]);
      
      if (currentDate <= lastKnownDate) {
        projectedData.push(NaN);
      } else {
        const daysSinceLastKnown = (currentDate.getTime() - lastKnownDate.getTime()) / (1000 * 60 * 60 * 24);
        const projectedPoints = completedPoints + (adjustedVelocity * daysSinceLastKnown);
        projectedData.push(Math.min(projectedPoints, totalPoints));
      }
    });
  }

  const burndownData = dateLabels.map(date => {
    const dateTime = new Date(date).getTime();
    
    const completedByDate = sortedIssues
      .filter(issue => issue.resolved && new Date(issue.resolved).getTime() <= dateTime)
      .reduce((sum, issue) => sum + (issue.storyPoints || 1), 0);
    
    const remainingPoints = totalPoints - completedByDate;
    
    return { date, remaining: remainingPoints };
  });

  const assigneeData = Array.from(assigneeMap.entries()).map(([name, data]) => ({
    name,
    ...data
  }));

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

  const burnupChartData: ChartData = {
    labels: extendedDateLabels,
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
        data: extendedDateLabels.map(date => {
          const matchingData = burnupData.find(d => d.date === date);
          return matchingData ? matchingData.scope : totalPoints;
        }),
        borderColor: 'rgba(0, 82, 204, 1)',
        backgroundColor: 'rgba(0, 82, 204, 0.1)',
        fill: false,
      },
      {
        label: 'Projected Completion',
        data: projectedData,
        borderColor: 'rgba(255, 145, 0, 1)',
        borderDash: [5, 5],
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

  const effectiveTeamMembers = customTeamMembers !== undefined ? customTeamMembers : assigneeMap.size;

  const allStatuses = new Set<string>();
  sortedIssues.forEach(issue => allStatuses.add(issue.status));
  const statusList = Array.from(allStatuses);
  
  const cumulativeFlowData = dateLabels.map(date => {
    const dateTime = new Date(date).getTime();
    const statusCounts: Record<string, number> = {};
    
    statusList.forEach(status => {
      statusCounts[status] = sortedIssues.filter(issue => 
        new Date(issue.created).getTime() <= dateTime && 
        (issue.status === status || 
         (status === 'Done' && issue.resolved && new Date(issue.resolved).getTime() <= dateTime))
      ).length;
    });
    
    return { date, ...statusCounts };
  });
  
  const cumulativeFlowChartData: ChartData = {
    labels: dateLabels,
    datasets: statusList.map((status, index) => {
      const hue = (index * 137) % 360;
      const color = `hsla(${hue}, 70%, 60%, 0.7)`;
      
      return {
        label: status,
        data: cumulativeFlowData.map(d => d[status] || 0),
        backgroundColor: color,
        borderColor: color,
        fill: true,
      };
    }),
  };
  
  const cycleTimeData = resolvedIssues.map(issue => {
    const createdDate = new Date(issue.created);
    const resolvedDate = new Date(issue.resolved!);
    const cycleTimeDays = (resolvedDate.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24);
    
    return {
      issue: issue.key,
      cycleTime: cycleTimeDays,
      resolvedDate: resolvedDate,
      storyPoints: issue.storyPoints || 1
    };
  });
  
  const cycleTimeChartData: ChartData = {
    labels: cycleTimeData.map(d => d.resolvedDate.toISOString().split('T')[0]),
    datasets: [{
      label: 'Cycle Time (days)',
      data: cycleTimeData.map(d => ({
        x: d.resolvedDate,
        y: d.cycleTime,
        r: Math.sqrt(d.storyPoints) * 5,
      })),
      backgroundColor: 'rgba(75, 192, 192, 0.6)',
    }],
  };
  
  const timePeriodsMap = new Map<string, number>();
  
  resolvedIssues.forEach(issue => {
    if (!issue.resolved) return;
    
    const resolvedDate = new Date(issue.resolved);
    const weekStart = new Date(resolvedDate);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    const weekKey = weekStart.toISOString().split('T')[0];
    
    const points = issue.storyPoints || 1;
    const currentPoints = timePeriodsMap.get(weekKey) || 0;
    timePeriodsMap.set(weekKey, currentPoints + points);
  });
  
  const velocityData = Array.from(timePeriodsMap.entries())
    .map(([date, points]) => ({ date, points }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  
  const movingAverageWindow = 3;
  const movingAverages = velocityData.map((_, index, array) => {
    if (index < movingAverageWindow - 1) return null;
    
    const sum = array
      .slice(index - movingAverageWindow + 1, index + 1)
      .reduce((acc, curr) => acc + curr.points, 0);
    
    return sum / movingAverageWindow;
  });
  
  const velocityChartData: ChartData = {
    labels: velocityData.map(d => {
      const date = new Date(d.date);
      return `${date.getMonth()+1}/${date.getDate()}`;
    }),
    datasets: [
      {
        label: 'Points Completed',
        data: velocityData.map(d => d.points),
        backgroundColor: 'rgba(54, 162, 235, 0.5)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1,
        type: 'bar'
      },
      {
        label: 'Moving Average',
        data: movingAverages,
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        borderColor: 'rgba(255, 99, 132, 1)',
        borderWidth: 2,
        type: 'line',
        fill: false
      }
    ],
  };

  return {
    burnup: burnupChartData,
    burndown: burndownChartData,
    completedPoints,
    totalPoints,
    issues: sortedIssues,
    assigneeData,
    totalAssignees: effectiveTeamMembers,
    assigneeChartData,
    projectedCompletionDate,
    velocity,
    originalVelocity,
    cumulativeFlow: cumulativeFlowChartData,
    cycleTime: cycleTimeChartData,
    velocityChart: velocityChartData
  };
};

/**
 * Basic validation to check if data looks like a Jira CSV export
 * focusing on the key fields specified by the user
 */
export const validateJiraCSV = (data: any[]): boolean => {
  if (data.length === 0) return false;
  
  const firstRow = data[0];
  const requiredFields = ['Summary', 'Issue key', 'Status', 'Created'];
  
  const foundFieldsCount = requiredFields.filter(field => 
    Object.keys(firstRow).some(key => key === field)
  ).length;
  
  return foundFieldsCount >= 3;
};
