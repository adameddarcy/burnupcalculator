
import { useState } from "react";
import { JiraIssue, ProcessedData } from "@/types/jira";
import { processJiraData } from "@/utils/jiraDataProcessor";
import { exportChartAsImage, exportDataAsCSV } from "@/utils/exportUtils";
import { Separator } from "@/components/ui/separator";
import { Header } from "@/components/Header";
import { FileUploadSection } from "@/components/FileUploadSection";
import { SummaryMetrics } from "@/components/SummaryMetrics";
import { TabsContainer } from "@/components/TabsContainer";
import { Footer } from "@/components/Footer";

export default function Index() {
  const [jiraData, setJiraData] = useState<JiraIssue[] | null>(null);
  const [processedData, setProcessedData] = useState<ProcessedData | null>(null);
  const [customTeamMembers, setCustomTeamMembers] = useState<number | null>(null);

  const handleDataLoaded = (data: JiraIssue[]) => {
    setJiraData(data);
    const processed = processJiraData(data);
    setProcessedData(processed);
    setCustomTeamMembers(null);
  };

  const handleTeamMembersChange = (teamMembers: number) => {
    setCustomTeamMembers(teamMembers);
    
    if (jiraData) {
      const updatedProcessedData = processJiraData(jiraData, teamMembers);
      setProcessedData(updatedProcessedData);
    }
  };

  const handleExportChart = (chartType: 'burnup' | 'burndown' | 'assignee' | 'cumulative' | 'cycle' | 'velocity') => {
    const chartId = chartType === 'burnup' 
      ? 'burnup-chart' 
      : chartType === 'burndown' 
        ? 'burndown-chart' 
        : chartType === 'assignee'
          ? 'assignee-chart'
          : chartType === 'cumulative'
            ? 'cumulative-flow-chart'
            : chartType === 'cycle'
              ? 'cycle-time-chart'
              : 'velocity-chart';
    exportChartAsImage(chartId, `jira-${chartType}-chart`);
  };

  const handleExportData = () => {
    if (!jiraData) return;
    exportDataAsCSV(jiraData, 'jira-data-export');
  };

  const handleResetData = () => {
    setJiraData(null);
    setProcessedData(null);
  };

  const completionPercentage = processedData 
    ? (processedData.completedPoints / processedData.totalPoints) * 100 
    : 0;

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <Header />

        {!jiraData ? (
          <FileUploadSection onDataLoaded={handleDataLoaded} />
        ) : (
          <>
            <div className="mt-6 mb-8">
              <SummaryMetrics 
                totalPoints={processedData?.totalPoints || 0}
                completedPoints={processedData?.completedPoints || 0}
                totalIssues={jiraData.length}
                completionPercentage={completionPercentage}
                totalAssignees={processedData?.totalAssignees || 0}
                projectedCompletionDate={processedData?.projectedCompletionDate || null}
                velocity={processedData?.velocity}
                onTeamMembersChange={handleTeamMembersChange}
              />
            </div>

            <Separator className="my-8" />
            
            {processedData && (
              <TabsContainer 
                jiraData={jiraData}
                processedData={processedData}
                customTeamMembers={customTeamMembers}
                onExportChart={handleExportChart}
                onExportData={handleExportData}
                onNewUpload={handleResetData}
              />
            )}
          </>
        )}
        
        <Footer />
      </div>
    </div>
  );
}
