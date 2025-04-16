
import { useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartData } from '@/types/jira';

interface GanttChartProps {
  data: ChartData;
  height?: number;
}

export function GanttChart({ data, height = 350 }: GanttChartProps) {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<any>(null);

  useEffect(() => {
    if (!chartRef.current || !data) return;

    const renderChart = async () => {
      try {
        // Dynamically import Chart.js to avoid SSR issues
        const { Chart, registerables } = await import('chart.js');
        Chart.register(...registerables);

        // Import annotation plugin
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

        chartInstance.current = new Chart(ctx, {
          type: 'bar',
          data: data,
          options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              title: {
                display: true,
                text: 'Gantt Chart'
              },
              tooltip: {
                callbacks: {
                  label: function(context) {
                    const label = context.dataset.label || '';
                    const startDate = new Date(context.parsed._custom?.start).toLocaleDateString();
                    const endDate = new Date(context.parsed._custom?.end).toLocaleDateString();
                    return `${label}: ${startDate} - ${endDate}`;
                  }
                }
              },
              legend: {
                position: 'top',
              }
            },
            scales: {
              x: {
                type: 'time',
                time: {
                  unit: 'day',
                },
                title: {
                  display: true,
                  text: 'Timeline'
                }
              },
              y: {
                title: {
                  display: true,
                  text: 'Issues'
                }
              }
            }
          }
        });
      } catch (error) {
        console.error('Error rendering Gantt chart:', error);
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
  }, [data]);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Gantt Chart</CardTitle>
      </CardHeader>
      <CardContent>
        <div style={{ height: `${height}px` }}>
          <canvas id="gantt-chart" ref={chartRef} />
        </div>
      </CardContent>
    </Card>
  );
}
