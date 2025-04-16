
import { FileUpload } from "@/components/FileUpload";
import { JiraIssue } from "@/types/jira";

interface FileUploadSectionProps {
  onDataLoaded: (data: JiraIssue[]) => void;
}

export function FileUploadSection({ onDataLoaded }: FileUploadSectionProps) {
  return (
    <div className="mt-10">
      <FileUpload onDataLoaded={onDataLoaded} />
    </div>
  );
}
