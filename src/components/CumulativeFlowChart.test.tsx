
import { render, screen } from '../test-utils';
import { CumulativeFlowChart } from './CumulativeFlowChart';
import { ChartData } from '@/types/jira';

// Mock Chart.js
jest.mock('chart.js', () => ({
  Chart: jest.fn(),
  registerables: [],
}));

// Mock chartjs-plugin-annotation
jest.mock('chartjs-plugin-annotation', () => ({
  default: jest.fn(),
}));

describe('CumulativeFlowChart', () => {
  const mockData: ChartData = {
    labels: ['2023-01-01', '2023-01-02', '2023-01-03'],
    datasets: [
      {
        label: 'To Do',
        data: [5, 4, 3],
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
        borderColor: 'rgb(255, 99, 132)',
      },
      {
        label: 'In Progress',
        data: [2, 3, 2],
        backgroundColor: 'rgba(255, 205, 86, 0.5)',
        borderColor: 'rgb(255, 205, 86)',
      },
      {
        label: 'Done',
        data: [3, 3, 5],
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
        borderColor: 'rgb(75, 192, 192)',
      },
    ],
  };

  it('renders the chart component with title', () => {
    render(<CumulativeFlowChart data={mockData} />);
    
    // Check that the title is rendered
    expect(screen.getByText('Cumulative Flow')).toBeInTheDocument();
    
    // Check that the canvas element is created
    expect(document.getElementById('cumulative-flow-chart')).toBeInTheDocument();
  });

  it('applies custom height when provided', () => {
    const customHeight = 500;
    render(<CumulativeFlowChart data={mockData} height={customHeight} />);
    
    const container = document.querySelector('[style*="height"]');
    expect(container).toHaveStyle(`height: ${customHeight}px`);
  });
});
