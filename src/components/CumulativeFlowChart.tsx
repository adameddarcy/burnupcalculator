
import { useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartData } from '@/types/jira';

interface CumulativeFlowChartProps {
  data: ChartData;
  height?: number;
}

export function CumulativeFlowChart({ data, height = 350 }: CumulativeFlowChartProps) {
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
          type: 'line',
          data: data,
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              title: {
                display: true,
                text: 'Cumulative Flow Diagram'
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
                stacked: true,
                title: {
                  display: true,
                  text: 'Number of Issues'
                },
                beginAtZero: true
              }
            },
            elements: {
              line: {
                tension: 0.4
              }
            }
          }
        });
      } catch (error) {
        console.error('Error rendering Cumulative Flow chart:', error);
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
        <CardTitle>Cumulative Flow</CardTitle>
      </CardHeader>
      <CardContent>
        <div style={{ height: `${height}px` }}>
          <canvas id="cumulative-flow-chart" ref={chartRef} />
        </div>
      </CardContent>
    </Card>
  );
}
