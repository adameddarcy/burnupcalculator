
import { useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartData } from '@/types/jira';

interface BurnupChartProps {
  data: ChartData;
  height?: number;
  projectedCompletionDate?: string;
}

export function BurnupChart({ data, height = 350, projectedCompletionDate }: BurnupChartProps) {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<any>(null);

  useEffect(() => {
    if (!chartRef.current || !data) return;

    const renderChart = async () => {
      // Dynamically import Chart.js to avoid SSR issues
      const { Chart, registerables } = await import('chart.js');
      Chart.register(...registerables);
      
      // Import and register annotation plugin properly
      const { Annotation } = await import('chartjs-plugin-annotation');
      Chart.register(Annotation);

      // Destroy previous chart if it exists
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }

      const ctx = chartRef.current.getContext('2d');
      if (!ctx) return;

      // Find the index of the projected completion date in the labels array
      const projectedDateIndex = projectedCompletionDate 
        ? data.labels.findIndex(label => label === projectedCompletionDate)
        : -1;

      // Create chart options
      const chartOptions: any = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: 'Epic Burnup Chart'
          },
          tooltip: {
            mode: 'index',
            intersect: false,
          },
          legend: {
            position: 'top',
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
              text: 'Story Points'
            },
            beginAtZero: true
          }
        }
      };
      
      // Add annotations if we have a projected completion date
      if (projectedDateIndex !== -1) {
        chartOptions.plugins.annotation = {
          annotations: {
            projectedCompletion: {
              type: 'line',
              xMin: projectedDateIndex,
              xMax: projectedDateIndex,
              borderColor: 'rgba(255, 99, 132, 0.8)',
              borderWidth: 2,
              borderDash: [5, 5],
              label: {
                display: true,
                content: 'Projected Completion',
                position: 'start',
                backgroundColor: 'rgba(255, 99, 132, 0.8)',
                font: {
                  weight: 'bold'
                }
              }
            }
          }
        };
      }

      chartInstance.current = new Chart(ctx, {
        type: 'line',
        data: data,
        options: chartOptions
      });
    };

    renderChart();

    // Cleanup function
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [data, projectedCompletionDate]);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Epic Burnup</CardTitle>
      </CardHeader>
      <CardContent>
        <div style={{ height: `${height}px` }}>
          <canvas id="burnup-chart" ref={chartRef} />
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
