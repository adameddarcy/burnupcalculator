
import { useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartData } from '@/types/jira';

interface BurndownChartProps {
  data: ChartData;
  height?: number;
}

export function BurndownChart({ data, height = 350 }: BurndownChartProps) {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<any>(null);
  const logoRef = useRef<HTMLImageElement>(null);

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
        
        // Create a custom logo plugin
        const logoPlugin = {
          id: 'logoPlugin',
          afterRender: (chart) => {
            const logoImage = logoRef.current;
            if (logoImage) {
              const ctx = chart.ctx;
              const logoWidth = 50;
              const logoHeight = 50;
              const margin = 10;
              
              ctx.save();
              ctx.globalCompositeOperation = 'destination-over';
              ctx.drawImage(
                logoImage, 
                chart.width - logoWidth - margin, 
                margin, 
                logoWidth, 
                logoHeight
              );
              ctx.restore();
            }
          }
        };
        
        // Register the custom plugin
        Chart.register(logoPlugin);

        chartInstance.current = new Chart(ctx, {
          type: 'line',
          data: data as any,
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
                annotations: {} // Initialize empty annotations to prevent undefined errors
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
  }, [data]);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Epic Burndown</CardTitle>
      </CardHeader>
      <CardContent>
        <div style={{ height: `${height}px` }}>
          <canvas id="burndown-chart" ref={chartRef} />
          <img 
            ref={logoRef} 
            src="/logo.png" 
            alt="Logo" 
            style={{ display: 'none' }} 
          />
        </div>
      </CardContent>
    </Card>
  );
}
