
import { useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartData } from '@/types/jira';

interface VelocityChartProps {
  data: ChartData;
  height?: number;
}

export function VelocityChart({ data, height = 350 }: VelocityChartProps) {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<any>(null);

  useEffect(() => {
    if (!chartRef.current || !data) return;

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
          data: data as any, // Cast to any to avoid TypeScript errors
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              title: {
                display: true,
                text: 'Velocity Chart'
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
                  text: 'Time Period'
                }
              },
              y: {
                title: {
                  display: true,
                  text: 'Story Points Completed'
                },
                beginAtZero: true
              }
            }
          }
        });
      } catch (error) {
        console.error('Error rendering Velocity chart:', error);
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
        <CardTitle>Velocity Chart</CardTitle>
      </CardHeader>
      <CardContent>
        <div style={{ height: `${height}px` }}>
          <canvas id="velocity-chart" ref={chartRef} />
        </div>
      </CardContent>
    </Card>
  );
}
