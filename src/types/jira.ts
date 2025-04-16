
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

export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string;
    borderColor?: string;
    fill?: boolean;
    borderDash?: number[];
  }[];
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
  projectedCompletionDate?: string;
  velocity?: number;
}
