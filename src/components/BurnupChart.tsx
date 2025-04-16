
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

      // Create vertical line annotation if we have a projected completion date
      const annotations: any = {};
      
      if (projectedDateIndex !== -1) {
        annotations.projectedCompletion = {
          type: 'line',
          xMin: projectedDateIndex,
          xMax: projectedDateIndex,
          borderColor: 'rgba(255, 99, 132, 0.8)',
          borderWidth: 2,
          borderDash: [5, 5],
          label: {
            enabled: true,
            content: 'Projected Completion',
            position: 'start',
            backgroundColor: 'rgba(255, 99, 132, 0.8)',
            font: {
              weight: 'bold',
            }
          }
        };
      }

      chartInstance.current = new Chart(ctx, {
        type: 'line',
        data: data,
        options: {
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
            },
            annotation: annotations && Object.keys(annotations).length > 0 ? {
              annotations: annotations
            } : undefined,
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
        }
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
