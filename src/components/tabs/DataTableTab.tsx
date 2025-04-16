
import { JiraIssuesTable } from "@/components/JiraIssuesTable";
import { JiraIssue } from "@/types/jira";

interface DataTableTabProps {
  issues: JiraIssue[];
}

export function DataTableTab({ issues }: DataTableTabProps) {
  return <JiraIssuesTable issues={issues} />;
}
