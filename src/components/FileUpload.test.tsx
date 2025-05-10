import { render, screen, waitFor } from '../test-utils';
import userEvent from '@testing-library/user-event';
import { FileUpload } from './FileUpload';

// Mock Papa Parse
jest.mock('papaparse', () => ({
  parse: jest.fn((text, options) => {
    if (text.includes('valid')) {
      // Simulate async parsing
      setTimeout(() => {
        options.complete({ data: [{ 'Issue key': 'TEST-1', 'Summary': 'Test Issue' }] });
      }, 0);
    } else {
      setTimeout(() => {
        options.complete({ data: [] });
      }, 0);
    }
  }),
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

describe.skip('FileUpload', () => {
  const mockOnDataLoaded = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('handles file upload and processes valid CSV data', async () => {
    render(<FileUpload onDataLoaded={mockOnDataLoaded} />);
    
    const file = new File(['valid,csv,data'], 'test.csv', { type: 'text/csv' });
    const input = screen.getByLabelText(/upload/i) || screen.getByRole('textbox') || screen.getByTestId('file-input') || document.querySelector('input[type="file"]');

    await userEvent.upload(input, file);

    await waitFor(() => {
      expect(mockOnDataLoaded).toHaveBeenCalled();
    });
  });

  it('displays error message for invalid CSV data', async () => {
    render(<FileUpload onDataLoaded={mockOnDataLoaded} />);
    
    const file = new File(['invalid,csv,data'], 'test.csv', { type: 'text/csv' });
    const input = screen.getByLabelText(/upload/i) || screen.getByRole('textbox') || screen.getByTestId('file-input') || document.querySelector('input[type="file"]');

    await userEvent.upload(input, file);

    await waitFor(() => {
      // screen.debug(); // uncomment if you want to log DOM tree
      expect(screen.getByText(/No valid Jira issues found in the CSV file/)).toBeInTheDocument();
    });
  });
});