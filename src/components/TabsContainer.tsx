
import { useState } from "react";
import { CoreChartsTab } from "./tabs/CoreChartsTab";
import { AdvancedChartsTab } from "./tabs/AdvancedChartsTab";
import { AssigneesTab } from "./tabs/AssigneesTab";
import { DataTableTab } from "./tabs/DataTableTab";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { BarChart3, Users, ChartBarStacked, Download, FileText } from "lucide-react";
import { JiraIssue, ProcessedData } from "@/types/jira";
import { generateFullReport } from "@/utils/pdfExport";
import { toast } from "@/components/ui/use-toast";

interface TabsContainerProps {
  jiraData: JiraIssue[];
  processedData: ProcessedData;
  customTeamMembers: number | null;
  onExportChart: (chartType: 'burnup' | 'burndown' | 'assignee' | 'cumulative' | 'cycle' | 'velocity') => void;
  onExportData: () => void;
  onNewUpload: () => void;
}

export function TabsContainer({ 
  jiraData, 
  processedData, 
  customTeamMembers,
  onExportChart,
  onExportData,
  onNewUpload
}: TabsContainerProps) {
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const effectiveTeamMembers = customTeamMembers !== null 
    ? customTeamMembers
    : processedData?.totalAssignees || 0;

  const handleExportPdf = async () => {
    try {
      setIsGeneratingPdf(true);
      toast({
        title: "Generating PDF report",
        description: "Please wait while we generate your report...",
      });
      
      // Small delay to ensure toast is displayed
      await new Promise(resolve => setTimeout(resolve, 200));
      
      await generateFullReport(processedData, customTeamMembers);
      
      toast({
        title: "Report generated successfully",
        description: "Your PDF report has been downloaded.",
        variant: "default", // Changed from "success" to "default"
      });
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast({
        title: "Error generating report",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  return (
    <Tabs defaultValue="charts" className="w-full">
      <div className="flex justify-between items-center mb-6">
        <TabsList>
          <TabsTrigger value="charts" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Core Charts
          </TabsTrigger>
          <TabsTrigger value="advanced" className="flex items-center gap-2">
            <ChartBarStacked className="h-4 w-4" />
            Advanced Charts
          </TabsTrigger>
          <TabsTrigger value="assignees" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Assignees
          </TabsTrigger>
          <TabsTrigger value="data">Data Table</TabsTrigger>
        </TabsList>

        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleExportPdf}
            disabled={isGeneratingPdf}
            className="flex items-center gap-2"
          >
            <FileText className="h-4 w-4" />
            {isGeneratingPdf ? "Generating PDF..." : "Export PDF Report"}
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={onExportData}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Export Data
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={onNewUpload}
          >
            New Upload
          </Button>
        </div>
      </div>
      
      <TabsContent value="charts">
        <CoreChartsTab 
          burnupData={processedData.burnup}
          burndownData={processedData.burndown}
          projectedCompletionDate={processedData.projectedCompletionDate}
          onExportChart={onExportChart}
        />
      </TabsContent>

      <TabsContent value="advanced">
        <AdvancedChartsTab 
          cumulativeFlowData={processedData.cumulativeFlow}
          cycleTimeData={processedData.cycleTime || { labels: [], datasets: [] }}
          velocityChartData={processedData.velocityChart || { labels: [], datasets: [] }}
          onExportChart={onExportChart}
        />
      </TabsContent>

      <TabsContent value="assignees">
        {processedData && processedData.assigneeData.length > 0 && (
          <AssigneesTab 
            assigneeData={processedData.assigneeData}
            totalPoints={processedData.totalPoints}
            chartData={processedData.assigneeChartData}
            effectiveTeamMembers={effectiveTeamMembers}
            onExportChart={onExportChart}
          />
        )}
      </TabsContent>
      
      <TabsContent value="data">
        <DataTableTab issues={jiraData} />
      </TabsContent>
    </Tabs>
  );
}
