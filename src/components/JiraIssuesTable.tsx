
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { JiraIssue } from "@/types/jira";

interface JiraIssuesTableProps {
  issues: JiraIssue[];
}

export function JiraIssuesTable({ issues }: JiraIssuesTableProps) {
  if (!issues || issues.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Issues</CardTitle>
          <CardDescription>No issues to display</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Issues</CardTitle>
        <CardDescription>
          {issues.length} issue{issues.length !== 1 ? "s" : ""} found
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border overflow-auto max-h-[500px]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">Key</TableHead>
                <TableHead>Summary</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Story Points</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Resolved</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {issues.map((issue) => (
                <TableRow key={issue.key}>
                  <TableCell className="font-medium">{issue.key}</TableCell>
                  <TableCell>{issue.summary}</TableCell>
                  <TableCell>{issue.status}</TableCell>
                  <TableCell>{issue.storyPoints || "-"}</TableCell>
                  <TableCell>
                    {issue.created
                      ? new Date(issue.created).toLocaleDateString()
                      : "-"}
                  </TableCell>
                  <TableCell>
                    {issue.resolved
                      ? new Date(issue.resolved).toLocaleDateString()
                      : "-"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
