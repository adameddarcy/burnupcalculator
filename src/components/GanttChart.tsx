
import { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ChartData } from '@/types/jira';
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface GanttChartProps {
  data: ChartData;
  height?: number;
}

export function GanttChart({ data, height = 400 }: GanttChartProps) {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<any>(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  // Initialize default view dates
  useEffect(() => {
    if (data && data.datasets && data.datasets[0]?.data?.length) {
      // Get all dates from the data
      const allDates = data.datasets[0].data
        .filter(item => item._custom)
        .map(item => {
          const customData = (item as any)._custom;
          return [new Date(customData.start), new Date(customData.end)];
        })
        .flat();
      
      // Find min and max dates
      if (allDates.length > 0) {
        const minDate = new Date(Math.min(...allDates.map(d => d.getTime())));
        const maxDate = new Date(Math.max(...allDates.map(d => d.getTime())));
        
        // Add buffer days
        minDate.setDate(minDate.getDate() - 7);
        maxDate.setDate(maxDate.getDate() + 7);
        
        setStartDate(minDate);
        setEndDate(maxDate);
      }
    }
  }, [data]);

  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev * 1.5, 4));
  };

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev / 1.5, 0.5));
  };

  const moveTimeframe = (direction: 'left' | 'right') => {
    if (!startDate || !endDate) return;
    
    const timeframe = endDate.getTime() - startDate.getTime();
    const moveAmount = timeframe * 0.25; // Move 25% of the visible timeframe
    
    if (direction === 'left') {
      setStartDate(new Date(startDate.getTime() - moveAmount));
      setEndDate(new Date(endDate.getTime() - moveAmount));
    } else {
      setStartDate(new Date(startDate.getTime() + moveAmount));
      setEndDate(new Date(endDate.getTime() + moveAmount));
    }
  };

  useEffect(() => {
    if (!chartRef.current || !data || !startDate || !endDate) return;

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

        // Calculate the visible range based on zoom level
        const visibleTimeframe = endDate.getTime() - startDate.getTime();
        const zoomedTimeframe = visibleTimeframe / zoomLevel;
        const midpoint = (startDate.getTime() + endDate.getTime()) / 2;
        const zoomedStartDate = new Date(midpoint - zoomedTimeframe / 2);
        const zoomedEndDate = new Date(midpoint + zoomedTimeframe / 2);

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
                text: 'Project Timeline'
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
                // Removed the invalid boxShadow property
                callbacks: {
                  label: function(context) {
                    const dataPoint = context.raw as any;
                    if (dataPoint && dataPoint._custom) {
                      const start = new Date(dataPoint._custom.start);
                      const end = new Date(dataPoint._custom.end);
                      const startStr = start.toLocaleDateString();
                      const endStr = end.toLocaleDateString();
                      const days = Math.round((end.getTime() - start.getTime()) / (24*60*60*1000));
                      return [
                        `Start: ${startStr}`,
                        `End: ${endStr}`,
                        `Duration: ${days} days`
                      ];
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
                  unit: 'day',
                  displayFormats: {
                    day: 'MMM d'
                  }
                },
                min: zoomedStartDate.toISOString(),
                max: zoomedEndDate.toISOString(),
                title: {
                  display: true,
                  text: 'Timeline',
                  color: '#666',
                  font: {
                    weight: 'bold'
                  }
                },
                grid: {
                  color: 'rgba(0, 0, 0, 0.05)',
                  tickColor: 'rgba(0, 0, 0, 0.15)'
                }
              },
              y: {
                title: {
                  display: true,
                  text: 'Tasks',
                  color: '#666',
                  font: {
                    weight: 'bold'
                  }
                },
                ticks: {
                  autoSkip: false,
                  color: '#333',
                  font: {
                    size: 11
                  },
                  callback: function(value) {
                    // Truncate long task names
                    const label = this.getLabelForValue(value as number);
                    if (label && label.length > 30) {
                      return label.substring(0, 27) + '...';
                    }
                    return label;
                  }
                }
              }
            },
            animation: {
              duration: 300
            },
            hover: {
              mode: 'nearest',
              intersect: false
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
  }, [data, startDate, endDate, zoomLevel]);

  return (
    <Card className="w-full shadow-md border-gray-200">
      <CardHeader className="pb-2">
        <div className="flex flex-row justify-between items-center">
          <div>
            <CardTitle className="text-lg font-semibold text-gray-800">Project Timeline</CardTitle>
            <CardDescription>Gantt chart showing project tasks and their durations</CardDescription>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => moveTimeframe('left')}
              title="Move timeline left"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
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
            <Button
              variant="outline"
              size="sm"
              onClick={() => moveTimeframe('right')}
              title="Move timeline right"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div style={{ height: `${height}px` }} className="relative">
          <canvas id="gantt-chart" ref={chartRef} />
          {data?.datasets[0]?.data?.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center text-gray-500">
              No timeline data available
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
