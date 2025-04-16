
import { CumulativeFlowChart } from "@/components/CumulativeFlowChart";
import { CycleTimeChart } from "@/components/CycleTimeChart";
import { VelocityChart } from "@/components/VelocityChart";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

interface AdvancedChartsTabProps {
  cumulativeFlowData: any;
  cycleTimeData: any;
  velocityChartData: any;
  onExportChart: (chartType: 'cumulative' | 'cycle' | 'velocity') => void;
}

export function AdvancedChartsTab({
  cumulativeFlowData,
  cycleTimeData,
  velocityChartData,
  onExportChart
}: AdvancedChartsTabProps) {
  return (
    <div className="grid gap-6">
      <div className="flex justify-end space-x-2">
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => onExportChart('cumulative')}
          className="flex items-center gap-2"
        >
          <Download className="h-4 w-4" />
          Export Cumulative Flow
        </Button>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => onExportChart('cycle')}
          className="flex items-center gap-2"
        >
          <Download className="h-4 w-4" />
          Export Cycle Time
        </Button>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => onExportChart('velocity')}
          className="flex items-center gap-2"
        >
          <Download className="h-4 w-4" />
          Export Velocity
        </Button>
      </div>
      
      <div className="grid md:grid-cols-1 lg:grid-cols-2 gap-6">
        {cumulativeFlowData && (
          <>
            <div id="cumulative-flow-chart-container">
              <CumulativeFlowChart data={cumulativeFlowData} />
            </div>
            <div id="cycle-time-chart-container">
              <CycleTimeChart data={cycleTimeData} />
            </div>
            <div id="velocity-chart-container">
              <VelocityChart data={velocityChartData} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
