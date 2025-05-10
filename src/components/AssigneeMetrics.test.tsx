
import { render, screen } from '../test-utils';
import { AssigneeMetricsChart } from './AssigneeMetrics';
import { AssigneeMetrics } from '@/types/jira';

// Mock Chart.js
jest.mock('chart.js', () => ({
  Chart: jest.fn(),
  registerables: [],
}));

describe('AssigneeMetricsChart', () => {
  const mockAssigneeData: AssigneeMetrics[] = [
    { name: 'John', completedPoints: 10, assignedPoints: 15, issueCount: 5 },
    { name: 'Jane', completedPoints: 8, assignedPoints: 8, issueCount: 3 },
    { name: 'Bob', completedPoints: 5, assignedPoints: 12, issueCount: 4 },
  ];

  const mockChartData = {
    labels: ['John', 'Jane', 'Bob'],
    datasets: [
      {
        label: 'Completed Points',
        data: [10, 8, 5],
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
      },
      {
        label: 'Assigned Points',
        data: [15, 8, 12],
        backgroundColor: 'rgba(153, 102, 255, 0.5)',
      },
    ],
  };

  it('renders the chart component with title', () => {
    render(
      <AssigneeMetricsChart 
        data={mockAssigneeData} 
        totalPoints={35} 
        chartData={mockChartData} 
      />
    );
    
    // Check that the title is rendered
    expect(screen.getByText('Assignee Distribution')).toBeInTheDocument();
    
    // Check that the canvas element is created
    expect(document.getElementById('assignee-chart')).toBeInTheDocument();
    
    // Check that assignee names are displayed
    expect(screen.getByText('John')).toBeInTheDocument();
    expect(screen.getByText('Jane')).toBeInTheDocument();
    expect(screen.getByText('Bob')).toBeInTheDocument();
  });

  it('displays completed and assigned points for each assignee', () => {
    render(
      <AssigneeMetricsChart 
        data={mockAssigneeData} 
        totalPoints={35} 
        chartData={mockChartData} 
      />
    );
    
    // Check that we show the completed and assigned points for John
    expect(screen.getByText('Completed: 10')).toBeInTheDocument();
    expect(screen.getByText('Assigned: 15')).toBeInTheDocument();
    
    // Check for Jane's points
    expect(screen.getByText('Completed: 8')).toBeInTheDocument();
    expect(screen.getByText('Assigned: 8')).toBeInTheDocument();
    
    // Check for Bob's points
    expect(screen.getByText('Completed: 5')).toBeInTheDocument();
    expect(screen.getByText('Assigned: 12')).toBeInTheDocument();
  });

  it('applies custom height when provided', () => {
    const customHeight = 500;
    render(
      <AssigneeMetricsChart 
        data={mockAssigneeData} 
        totalPoints={35} 
        chartData={mockChartData}
        height={customHeight} 
      />
    );
    
    const container = document.querySelector('[style*="height"]');
    expect(container).toHaveStyle(`height: ${customHeight}px`);
  });
});
