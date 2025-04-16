
export interface JiraIssue {
  key: string;
  summary: string;
  status: string;
  created: string;
  resolved?: string;
  storyPoints?: number;
  epic?: string;
  assignee?: string;
}

export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string;
    borderColor?: string;
    fill?: boolean;
  }[];
}

export interface ProcessedData {
  burnup: ChartData;
  burndown: ChartData;
  completedPoints: number;
  totalPoints: number;
  issues: JiraIssue[];
  assigneeData: {
    name: string;
    completedPoints: number;
    assignedPoints: number;
    issueCount: number;
  }[];
  totalAssignees: number;
}
