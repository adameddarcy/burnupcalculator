
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
        // Dynamically import Chart.js and required adapters
        const { Chart, registerables } = await import('chart.js');
        
        // Import and register date adapter - this is key for time scale
        const { _adapters } = await import('chart.js');
        const { default: AdapterDateFns } = await import('chartjs-adapter-date-fns');
        
        if (_adapters && !_adapters._date) {
          _adapters._date = AdapterDateFns;
        }
        
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
            indexAxis: 'y' as const, // Horizontal bars
            plugins: {
              title: {
                display: true,
                text: 'Gantt Chart'
              },
              tooltip: {
                callbacks: {
                  label: function(context) {
                    const dataPoint = context.raw as any;
                    if (dataPoint && dataPoint._custom) {
                      const start = new Date(dataPoint._custom.start);
                      const end = new Date(dataPoint._custom.end);
                      const startStr = start.toLocaleDateString();
                      const endStr = end.toLocaleDateString();
                      const days = Math.round((end.getTime() - start.getTime()) / (24*60*60*1000));
                      return `${startStr} to ${endStr} (${days} days)`;
                    }
                    return '';
                  }
                }
              },
              legend: {
                display: false,
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
                  text: 'Timeline'
                }
              },
              y: {
                title: {
                  display: true,
                  text: 'Issues'
                },
                ticks: {
                  autoSkip: false
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
