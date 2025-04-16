
import { useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartData } from '@/types/jira';
import type { ChartData as ChartJsData, ChartTypeRegistry } from 'chart.js';

interface BurndownChartProps {
  data: ChartData;
  projectedCompletionDate?: string;
  height?: number;
}

export function BurndownChart({ data, projectedCompletionDate, height = 350 }: BurndownChartProps) {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<any>(null);

  useEffect(() => {
    if (!chartRef.current || !data) return;

    const renderChart = async () => {
      try {
        // Dynamically import Chart.js to avoid SSR issues
        const { Chart, registerables } = await import('chart.js');
        Chart.register(...registerables);

        // Import annotation plugin for consistency with BurnupChart
        const annotationPlugin = await import('chartjs-plugin-annotation');
        Chart.register(annotationPlugin.default);
        
        // Destroy previous chart if it exists
        if (chartInstance.current) {
          chartInstance.current.destroy();
        }

        const ctx = chartRef.current.getContext('2d');
        if (!ctx) {
          console.error('Failed to get canvas context');
          return;
        }

        // Create annotations for projected completion date if it exists
        const annotations: Record<string, any> = {};
        
        if (projectedCompletionDate) {
          const projectedDateIndex = data.labels.findIndex(
            label => label === projectedCompletionDate
          );
          
          if (projectedDateIndex !== -1) {
            annotations['projectedCompletion'] = {
              type: 'line',
              xMin: projectedDateIndex,
              xMax: projectedDateIndex,
              borderColor: 'rgba(255, 99, 132, 0.8)',
              borderWidth: 2,
              borderDash: [6, 6],
              label: {
                display: true,
                content: 'Projected Completion',
                position: 'start',
                backgroundColor: 'rgba(255, 99, 132, 0.8)'
              }
            };
          }
        }

        // Properly cast data to Chart.js expected type
        const chartData: ChartJsData<keyof ChartTypeRegistry, any[], unknown> = {
          labels: data.labels,
          datasets: data.datasets
        };

        chartInstance.current = new Chart(ctx, {
          type: 'line',
          data: chartData,
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              title: {
                display: true,
                text: 'Epic Burndown Chart'
              },
              tooltip: {
                mode: 'index',
                intersect: false,
              },
              legend: {
                position: 'top',
              },
              annotation: {
                annotations
              }
            },
            scales: {
              x: {
                title: {
                  display: true,
                  text: 'Date'
                }
              },
              y: {
                title: {
                  display: true,
                  text: 'Remaining Story Points'
                },
                beginAtZero: true
              }
            }
          }
        });
      } catch (error) {
        console.error('Error rendering Burndown chart:', error);
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
  }, [data, projectedCompletionDate]);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Epic Burndown</CardTitle>
      </CardHeader>
      <CardContent>
        <div style={{ height: `${height}px` }}>
          <canvas id="burndown-chart" ref={chartRef} />
        </div>
        {projectedCompletionDate && (
          <div className="mt-3 text-sm flex items-center gap-1">
            <span className="font-medium">Projected Completion:</span>
            <span>
              {new Date(projectedCompletionDate).toLocaleDateString(undefined, {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
              })}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
