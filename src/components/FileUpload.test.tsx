
import { render, screen, fireEvent, waitFor } from '../test-utils';
import { FileUpload } from './FileUpload';

// Mock Papa Parse
jest.mock('papaparse', () => ({
  parse: jest.fn((text, options) => {
    if (text.includes('valid')) {
      return { data: [{ 'Issue key': 'TEST-1', 'Summary': 'Test Issue' }] };
    }
    return { data: [] };
  })
}));

// Mock jiraDataProcessor utilities
jest.mock('@/utils/jiraDataProcessor', () => ({
  validateJiraCSV: jest.fn((data) => data.length > 0),
  parseJiraCSV: jest.fn((text) => {
    if (text.includes('valid')) {
      return [{ key: 'TEST-1', summary: 'Test Issue', status: 'Done', created: '2023-01-01' }];
    }
    return [];
  }),
}));

describe('FileUpload', () => {
  const mockOnDataLoaded = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the file upload component', () => {
    render(<FileUpload onDataLoaded={mockOnDataLoaded} />);
    
    expect(screen.getByText('Click to upload')).toBeInTheDocument();
    expect(screen.getByText('Jira CSV export file')).toBeInTheDocument();
  });

  it('handles file upload and processes valid CSV data', async () => {
    render(<FileUpload onDataLoaded={mockOnDataLoaded} />);
    
    const file = new File(['valid,csv,data'], 'test.csv', { type: 'text/csv' });
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    
    Object.defineProperty(input, 'files', {
      value: [file],
      writable: false,
    });

    fireEvent.change(input);
    
    await waitFor(() => {
      expect(mockOnDataLoaded).toHaveBeenCalled();
    });
  });

  it('displays error message for invalid CSV data', async () => {
    render(<FileUpload onDataLoaded={mockOnDataLoaded} />);
    
    const file = new File(['invalid,csv,data'], 'test.csv', { type: 'text/csv' });
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    
    Object.defineProperty(input, 'files', {
      value: [file],
      writable: false,
    });

    fireEvent.change(input);
    
    await waitFor(() => {
      expect(screen.getByText(/No valid Jira issues found in the CSV file/)).toBeInTheDocument();
    });
  });
});
