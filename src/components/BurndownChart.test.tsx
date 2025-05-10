
import { render, screen } from '../test-utils';
import { BurndownChart } from './BurndownChart';
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

describe('BurndownChart', () => {
  const mockData: ChartData = {
    labels: ['2023-01-01', '2023-01-02', '2023-01-03'],
    datasets: [
      {
        label: 'Remaining',
        data: [10, 8, 5],
        backgroundColor: 'rgba(53, 162, 235, 0.5)',
        borderColor: 'rgb(53, 162, 235)',
      },
    ],
  };

  it('renders the chart component with title', () => {
    render(<BurndownChart data={mockData} />);
    
    // Check that the title is rendered
    expect(screen.getByText('Epic Burndown')).toBeInTheDocument();
    
    // Check that the canvas element is created
    expect(document.getElementById('burndown-chart')).toBeInTheDocument();
  });

  it('applies custom height when provided', () => {
    const customHeight = 500;
    render(<BurndownChart data={mockData} height={customHeight} />);
    
    const container = document.querySelector('[style*="height"]');
    expect(container).toHaveStyle(`height: ${customHeight}px`);
  });
});
