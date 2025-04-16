
export interface JiraIssue {
  key: string;
  summary: string;
  status: string;
  created: string;
  updated?: string;
  resolved?: string;
  storyPoints?: number;
  epic?: string;
  assignee?: string;
  description?: string;
}

// Modified ChartData to align with Chart.js expected format
export interface ChartDataset {
  label: string;
  data: number[] | any[];
  backgroundColor?: string | string[];
  borderColor?: string | string[];
  fill?: boolean;
  borderDash?: number[];
  type?: string;
  tension?: number;
  borderWidth?: number;
}

export interface ChartData {
  labels: string[];
  datasets: ChartDataset[];
}

export interface AssigneeMetrics {
  name: string;
  completedPoints: number;
  assignedPoints: number;
  issueCount: number;
}

export interface ProcessedData {
  burnup: ChartData;
  burndown: ChartData;
  completedPoints: number;
  totalPoints: number;
  issues: JiraIssue[];
  assigneeData: AssigneeMetrics[];
  totalAssignees: number;
  assigneeChartData?: ChartData;
  projectedCompletionDate: Date | null;
  velocity?: number;
  // Add new chart properties
  cumulativeFlow?: ChartData;
  cycleTime?: ChartData;
  velocityChart?: ChartData;
}
