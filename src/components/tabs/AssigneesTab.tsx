
import { AssigneeMetricsChart } from "@/components/AssigneeMetrics";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

interface AssigneesTabProps {
  assigneeData: any[];
  totalPoints: number;
  chartData: any;
  effectiveTeamMembers: number;
  onExportChart: (chartType: 'assignee') => void;
}

export function AssigneesTab({
  assigneeData,
  totalPoints,
  chartData,
  effectiveTeamMembers,
  onExportChart
}: AssigneesTabProps) {
  return (
    <div id="assignee-chart-container">
      <div className="flex justify-end mb-4">
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => onExportChart('assignee')}
          className="flex items-center gap-2"
        >
          <Download className="h-4 w-4" />
          Export Chart
        </Button>
      </div>
      <AssigneeMetricsChart 
        data={assigneeData} 
        totalPoints={totalPoints} 
        chartData={chartData}
      />
      <div className="mt-4 text-sm text-muted-foreground">
        <p>Total Assignees: {effectiveTeamMembers}</p>
      </div>
    </div>
  );
}
