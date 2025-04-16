
import { useState } from "react";
import { FileUpload } from "@/components/FileUpload";
import { BurnupChart } from "@/components/BurnupChart";
import { BurndownChart } from "@/components/BurndownChart";
import { JiraIssuesTable } from "@/components/JiraIssuesTable";
import { SummaryMetrics } from "@/components/SummaryMetrics";
import { AssigneeMetricsChart } from "@/components/AssigneeMetrics";
import { CumulativeFlowChart } from "@/components/CumulativeFlowChart";
import { CycleTimeChart } from "@/components/CycleTimeChart";
import { VelocityChart } from "@/components/VelocityChart";
import { JiraIssue, ProcessedData } from "@/types/jira";
import { processJiraData } from "@/utils/jiraDataProcessor";
import { exportChartAsImage, exportDataAsCSV } from "@/utils/exportUtils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { BarChart3, Users, ChartBarStacked, Clock, TrendingUp, Download } from "lucide-react";

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

  const completionPercentage = processedData 
    ? (processedData.completedPoints / processedData.totalPoints) * 100 
    : 0;

  const effectiveTeamMembers = customTeamMembers !== null 
    ? customTeamMembers
    : processedData?.totalAssignees || 0;

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col items-center justify-center mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight">
            Jira Epic Metrics Calculator
          </h1>
          <p className="text-muted-foreground mt-2">
            Upload a Jira CSV export to visualize burnup and burndown charts for your epics
          </p>
        </div>

        {!jiraData ? (
          <div className="mt-10">
            <FileUpload onDataLoaded={handleDataLoaded} />
          </div>
        ) : (
          <>
            <div className="mt-6 mb-8">
              <SummaryMetrics 
                totalPoints={processedData?.totalPoints || 0}
                completedPoints={processedData?.completedPoints || 0}
                totalIssues={jiraData.length}
                completionPercentage={completionPercentage}
                totalAssignees={processedData?.totalAssignees || 0}
                projectedCompletionDate={processedData?.projectedCompletionDate}
                velocity={processedData?.velocity}
                onTeamMembersChange={handleTeamMembersChange}
              />
            </div>

            <Separator className="my-8" />
            
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
                    onClick={handleExportData}
                    className="flex items-center gap-2"
                  >
                    <Download className="h-4 w-4" />
                    Export Data
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      setJiraData(null);
                      setProcessedData(null);
                    }}
                  >
                    New Upload
                  </Button>
                </div>
              </div>
              
              <TabsContent value="charts">
                <div className="grid gap-6">
                  <div className="flex justify-end space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleExportChart('burnup')}
                      className="flex items-center gap-2"
                    >
                      <Download className="h-4 w-4" />
                      Export Burnup
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleExportChart('burndown')}
                      className="flex items-center gap-2"
                    >
                      <Download className="h-4 w-4" />
                      Export Burndown
                    </Button>
                  </div>
                  
                  <div className="grid md:grid-cols-1 lg:grid-cols-2 gap-6">
                    {processedData && (
                      <>
                        <div id="burnup-chart-container">
                          <BurnupChart 
                            data={processedData.burnup} 
                            projectedCompletionDate={processedData.projectedCompletionDate}
                          />
                        </div>
                        <div id="burndown-chart-container">
                          <BurndownChart 
                            data={processedData.burndown} 
                            projectedCompletionDate={processedData.projectedCompletionDate}
                          />
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="advanced">
                <div className="grid gap-6">
                  <div className="flex justify-end space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleExportChart('cumulative')}
                      className="flex items-center gap-2"
                    >
                      <Download className="h-4 w-4" />
                      Export Cumulative Flow
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleExportChart('cycle')}
                      className="flex items-center gap-2"
                    >
                      <Download className="h-4 w-4" />
                      Export Cycle Time
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleExportChart('velocity')}
                      className="flex items-center gap-2"
                    >
                      <Download className="h-4 w-4" />
                      Export Velocity
                    </Button>
                  </div>
                  
                  <div className="grid md:grid-cols-1 lg:grid-cols-2 gap-6">
                    {processedData && processedData.cumulativeFlow && (
                      <>
                        <div id="cumulative-flow-chart-container">
                          <CumulativeFlowChart data={processedData.cumulativeFlow} />
                        </div>
                        <div id="cycle-time-chart-container">
                          <CycleTimeChart data={processedData.cycleTime || { labels: [], datasets: [] }} />
                        </div>
                        <div id="velocity-chart-container">
                          <VelocityChart data={processedData.velocityChart || { labels: [], datasets: [] }} />
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="assignees">
                {processedData && processedData.assigneeData.length > 0 && (
                  <div id="assignee-chart-container">
                    <div className="flex justify-end mb-4">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleExportChart('assignee')}
                        className="flex items-center gap-2"
                      >
                        <Download className="h-4 w-4" />
                        Export Chart
                      </Button>
                    </div>
                    <AssigneeMetricsChart 
                      data={processedData.assigneeData} 
                      totalPoints={processedData.totalPoints} 
                      chartData={processedData.assigneeChartData}
                    />
                    <div className="mt-4 text-sm text-muted-foreground">
                      <p>Total Assignees: {effectiveTeamMembers}</p>
                    </div>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="data">
                <JiraIssuesTable issues={jiraData} />
              </TabsContent>
            </Tabs>
          </>
        )}
        
        <footer className="mt-16 text-center text-sm text-muted-foreground">
          <p>
            Jira Epic Metrics Calculator - Upload a CSV export from Jira to generate burnup and burndown charts
          </p>
        </footer>
      </div>
    </div>
  );
}
