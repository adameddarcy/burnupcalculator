
import { render, screen } from '../test-utils';
import { CycleTimeChart } from './CycleTimeChart';
import { ChartData } from '@/types/jira';

// Mock Chart.js
jest.mock('chart.js', () => ({
  Chart: jest.fn(),
  registerables: [],
  _adapters: {},
}));

// Mock date adapter
jest.mock('chartjs-adapter-date-fns', () => ({
  default: {},
}));

describe('CycleTimeChart', () => {
  const mockData: ChartData = {
    labels: [],
    datasets: [
      {
        label: 'Cycle Time',
        data: [
          { x: '2023-01-01', y: 5 },
          { x: '2023-01-05', y: 3 },
          { x: '2023-01-10', y: 7 },
        ],
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
      },
    ],
  };

  it('renders the chart component with title', () => {
    render(<CycleTimeChart data={mockData} />);
    
    // Check that the title is rendered
    expect(screen.getByText('Cycle Time')).toBeInTheDocument();
    
    // Check that the canvas element is created
    expect(document.getElementById('cycle-time-chart')).toBeInTheDocument();
  });

  it('applies custom height when provided', () => {
    const customHeight = 500;
    render(<CycleTimeChart data={mockData} height={customHeight} />);
    
    const container = document.querySelector('[style*="height"]');
    expect(container).toHaveStyle(`height: ${customHeight}px`);
  });
});
