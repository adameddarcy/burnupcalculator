
import { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ChartData } from '@/types/jira';
import { ZoomIn, ZoomOut } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface GanttChartProps {
  data: ChartData;
  height?: number;
}

export function GanttChart({ data, height = 400 }: GanttChartProps) {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<any>(null);
  const [zoomLevel, setZoomLevel] = useState(1);

  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev * 1.2, 3));
  };

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev / 1.2, 0.5));
  };

  useEffect(() => {
    if (!chartRef.current || !data) return;

    const renderChart = async () => {
      try {
        // Dynamically import Chart.js and required adapters
        const { Chart, registerables } = await import('chart.js');
        
        // Import and register date adapter
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

        // Create a new horizontal bar chart
        chartInstance.current = new Chart(ctx, {
          type: 'bar',
          data: {
            labels: data.labels,
            datasets: [{
              label: 'Average Duration (days)',
              data: data.datasets[0].data.map(item => Number(item.y)),
              backgroundColor: data.datasets[0].backgroundColor,
              borderColor: 'rgba(0, 0, 0, 0.1)',
              borderWidth: 1,
              barThickness: Math.max(40, 120 / zoomLevel),
            }]
          },
          options: {
            indexAxis: 'y' as const,
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              title: {
                display: true,
                text: 'Average Task Duration by Status',
                font: {
                  size: 16,
                  weight: 'bold'
                }
              },
              tooltip: {
                enabled: true,
                mode: 'nearest',
                intersect: false,
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                titleColor: '#333',
                bodyColor: '#666',
                borderColor: '#ddd',
                borderWidth: 1,
                padding: 10,
                cornerRadius: 4,
                callbacks: {
                  label: function(context) {
                    const index = context.dataIndex;
                    const customData = data.datasets[0].data[index]._custom;
                    
                    return [
                      `Status: ${customData.status}`,
                      `Average Duration: ${customData.duration} days`,
                      `Number of Tasks: ${customData.count}`
                    ];
                  }
                }
              },
              legend: {
                display: false,
              }
            },
            scales: {
              x: {
                title: {
                  display: true,
                  text: 'Duration (days)',
                  color: '#666',
                  font: {
                    weight: 'bold'
                  }
                },
                beginAtZero: true,
                grid: {
                  color: 'rgba(0, 0, 0, 0.05)',
                  tickColor: 'rgba(0, 0, 0, 0.15)'
                }
              },
              y: {
                title: {
                  display: true,
                  text: 'Task Status',
                  color: '#666',
                  font: {
                    weight: 'bold'
                  }
                },
                ticks: {
                  color: '#333',
                  font: {
                    size: 13,
                    weight: 'bold'
                  }
                }
              }
            },
            animation: {
              duration: 300
            }
          }
        });
      } catch (error) {
        console.error('Error rendering average duration chart:', error);
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
  }, [data, zoomLevel]);

  return (
    <Card className="w-full shadow-md border-gray-200">
      <CardHeader className="pb-2">
        <div className="flex flex-row justify-between items-center">
          <div>
            <CardTitle className="text-lg font-semibold text-gray-800">Task Duration Analysis</CardTitle>
            <CardDescription>Average duration of tasks by their current status</CardDescription>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleZoomOut}
              title="Zoom out"
            >
              <ZoomOut className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleZoomIn}
              title="Zoom in"
            >
              <ZoomIn className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div style={{ height: `${height}px` }} className="relative">
          <canvas id="gantt-chart" ref={chartRef} />
          {(!data || data.datasets[0]?.data?.length === 0) && (
            <div className="absolute inset-0 flex items-center justify-center text-gray-500">
              No task duration data available
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
