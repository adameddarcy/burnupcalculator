
import { BurnupChart } from "@/components/BurnupChart";
import { BurndownChart } from "@/components/BurndownChart";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

interface CoreChartsTabProps {
  burnupData: any;
  burndownData: any;
  projectedCompletionDate: Date | null;
  onExportChart: (chartType: 'burnup' | 'burndown') => void;
}

export function CoreChartsTab({ 
  burnupData, 
  burndownData, 
  projectedCompletionDate,
  onExportChart 
}: CoreChartsTabProps) {
  return (
    <div className="grid gap-6">
      <div className="flex justify-end space-x-2">
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => onExportChart('burnup')}
          className="flex items-center gap-2"
        >
          <Download className="h-4 w-4" />
          Export Burnup
        </Button>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => onExportChart('burndown')}
          className="flex items-center gap-2"
        >
          <Download className="h-4 w-4" />
          Export Burndown
        </Button>
      </div>
      
      <div className="grid md:grid-cols-1 lg:grid-cols-2 gap-6">
        <div id="burnup-chart-container">
          <BurnupChart 
            data={burnupData} 
            projectedCompletionDate={projectedCompletionDate}
          />
        </div>
        <div id="burndown-chart-container">
          <BurndownChart data={burndownData} />
        </div>
      </div>
    </div>
  );
}
