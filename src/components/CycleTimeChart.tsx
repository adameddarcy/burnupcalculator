
import { useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartData } from '@/types/jira';

interface CycleTimeChartProps {
  data: ChartData;
  height?: number;
}

export function CycleTimeChart({ data, height = 350 }: CycleTimeChartProps) {
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
          type: 'scatter',
          data: data,
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              title: {
                display: true,
                text: 'Cycle Time Chart'
              },
              tooltip: {
                callbacks: {
                  label: function(context) {
                    const label = context.dataset.label || '';
                    const value = context.parsed.y;
                    return `${label}: ${value.toFixed(1)} days`;
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
                  unit: 'day'
                },
                title: {
                  display: true,
                  text: 'Date Completed'
                }
              },
              y: {
                title: {
                  display: true,
                  text: 'Days to Complete'
                },
                min: 0
              }
            }
          }
        });
      } catch (error) {
        console.error('Error rendering Cycle Time chart:', error);
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
        <CardTitle>Cycle Time</CardTitle>
      </CardHeader>
      <CardContent>
        <div style={{ height: `${height}px` }}>
          <canvas id="cycle-time-chart" ref={chartRef} />
        </div>
      </CardContent>
    </Card>
  );
}
