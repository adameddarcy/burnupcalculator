
import { ChangeEvent, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { parseJiraCSV, validateJiraCSV } from '@/utils/jiraDataProcessor';
import { JiraIssue } from '@/types/jira';
import { Upload } from 'lucide-react';
import Papa from 'papaparse';

interface FileUploadProps {
  onDataLoaded: (data: JiraIssue[]) => void;
}

export function FileUpload({ onDataLoaded }: FileUploadProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setIsLoading(true);
    setError(null);

    try {
      const text = await file.text();
      const parsedData = parseJiraCSV(text);
      
      if (parsedData.length === 0) {
        throw new Error('No data found in the CSV file');
      }

      // Perform additional validation
      const validation = Papa.parse(text, { header: true });
      if (!validateJiraCSV(validation.data)) {
        throw new Error('The CSV file does not appear to be a valid Jira export');
      }
      
      onDataLoaded(parsedData);
    } catch (err: any) {
      setError(err.message || 'Failed to parse CSV file');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4 w-full max-w-md mx-auto">
      <div className="flex items-center justify-center w-full">
        <label 
          htmlFor="csv-upload" 
          className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 border-gray-300"
        >
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <Upload size={24} className="mb-2 text-gray-500" />
            <p className="mb-2 text-sm text-gray-500">
              <span className="font-semibold">Click to upload</span> or drag and drop
            </p>
            <p className="text-xs text-gray-500">Jira CSV export file</p>
            {fileName && <p className="mt-2 text-sm font-medium text-primary">{fileName}</p>}
          </div>
          <Input 
            id="csv-upload" 
            type="file" 
            accept=".csv" 
            onChange={handleFileChange} 
            className="hidden" 
          />
        </label>
      </div>

      {error && (
        <Alert variant="destructive" className="w-full">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      <div className="text-sm text-gray-500 mt-2 text-center">
        Upload a CSV file exported from Jira containing epic data
      </div>
    </div>
  );
}
