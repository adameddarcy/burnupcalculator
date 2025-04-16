
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AssigneeMetrics } from "@/types/jira";
import { useEffect, useRef } from 'react';

interface AssigneeMetricsProps {
  data: AssigneeMetrics[];
  totalPoints: number;
  chartData?: any;
  height?: number;
}

export function AssigneeMetricsChart({ data, totalPoints, chartData, height = 350 }: AssigneeMetricsProps) {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<any>(null);

  useEffect(() => {
    if (!chartRef.current || !chartData) return;

    const renderChart = async () => {
      try {
        // Dynamically import Chart.js to avoid SSR issues
        const { Chart, registerables } = await import('chart.js');
        Chart.register(...registerables);

        // Destroy previous chart if it exists
        if (chartInstance.current) {
          chartInstance.current.destroy();
        }

        const ctx = chartRef.current.getContext('2d');
        if (!ctx) {
          console.error('Failed to get canvas context');
          return;
        }

        chartInstance.current = new Chart(ctx, {
          type: 'bar',
          data: chartData,
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              title: {
                display: true,
                text: 'Assignee Metrics'
              },
              tooltip: {
                mode: 'index',
                intersect: false,
              },
              legend: {
                position: 'top',
              },
            },
            scales: {
              x: {
                title: {
                  display: true,
                  text: 'Assignee'
                }
              },
              y: {
                title: {
                  display: true,
                  text: 'Story Points'
                },
                beginAtZero: true
              }
            }
          }
        });
      } catch (error) {
        console.error('Error rendering Assignee chart:', error);
      }
    };

    // Add a small delay to ensure DOM is ready
    const timer = setTimeout(() => {
      renderChart();
    }, 100);

    // Cleanup function
    return () => {
      clearTimeout(timer);
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [chartData]);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Assignee Distribution</CardTitle>
      </CardHeader>
      <CardContent>
        <div style={{ height: `${height}px` }} className="mb-4">
          <canvas id="assignee-chart" ref={chartRef} />
        </div>
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.map((assignee) => (
            <div key={assignee.name} className="p-3 border rounded-md">
              <div className="font-medium">{assignee.name}</div>
              <div className="text-sm text-muted-foreground">
                {assignee.issueCount} issues ({Math.round((assignee.issueCount / data.reduce((sum, a) => sum + a.issueCount, 0)) * 100)}%)
              </div>
              <div className="flex justify-between mt-1">
                <span className="text-sm">Completed: {assignee.completedPoints}</span>
                <span className="text-sm">Assigned: {assignee.assignedPoints}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5 mt-1">
                <div 
                  className="bg-primary h-2.5 rounded-full" 
                  style={{ width: `${assignee.assignedPoints > 0 ? (assignee.completedPoints / assignee.assignedPoints * 100) : 0}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
