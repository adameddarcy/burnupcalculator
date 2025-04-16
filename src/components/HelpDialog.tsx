
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { HelpCircle } from "lucide-react";

export function HelpDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center gap-2">
          <HelpCircle className="h-4 w-4" />
          <span>Help</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>How to Use Jira Epic Metrics Calculator</DialogTitle>
          <DialogDescription>
            Follow these steps to get started with analyzing your epics
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[70vh]">
          <div className="space-y-6 pr-4">
            <section>
              <h3 className="text-lg font-medium mb-2">How to Get a CSV for Calculation</h3>
              
              <h4 className="text-md font-medium mt-4 mb-1">Step-by-Step Guide to Export Jira Epic CSV</h4>
              <ol className="list-decimal pl-5 space-y-3">
                <li>
                  <strong>Log in to Jira</strong>
                  <p className="text-sm text-muted-foreground">Navigate to your Jira project</p>
                </li>
                <li>
                  <strong>Find Your Epic</strong>
                  <p className="text-sm text-muted-foreground">
                    Use the search bar or navigate to the epic you want to analyze. 
                    You can also use JQL (Jira Query Language) to filter epics.
                  </p>
                </li>
                <li>
                  <strong>Export Epic Issues</strong>
                  <p className="text-sm text-muted-foreground">
                    Click on the "..." (more options) menu and select "Export" &gt; "Export to CSV"
                  </p>
                  <div className="mt-2">
                    <strong>Alternative Method:</strong>
                    <p className="text-sm text-muted-foreground">
                      Go to the "Issues" view, apply a filter for your specific epic using the search bar or JQL, 
                      and click on "Export" &gt; "Export to CSV (All Fields)"
                    </p>
                  </div>
                </li>
                <li>
                  <strong>Recommended JQL Filters</strong>
                  <p className="text-sm text-muted-foreground">
                    For a single epic: <code className="bg-muted px-1 py-0.5 rounded">"Epic Link" = EPIC-123</code><br />
                    For all issues in an epic: <code className="bg-muted px-1 py-0.5 rounded">"Epic Link" = EPIC-123 OR "Epic Link" = EPIC-123</code>
                  </p>
                </li>
              </ol>
            </section>

            <section>
              <h3 className="text-lg font-medium mb-2">CSV Export Tips</h3>
              <ul className="list-disc pl-5 space-y-1">
                <li>Ensure you export ALL fields for comprehensive analysis</li>
                <li>
                  The export should include columns like:
                  <ul className="list-disc pl-5 mt-1 space-y-1">
                    <li>Issue key</li>
                    <li>Summary</li>
                    <li>Status</li>
                    <li>Created date</li>
                    <li>Resolved date (if applicable)</li>
                    <li>Story Points</li>
                    <li>Assignee</li>
                  </ul>
                </li>
              </ul>
            </section>

            <section>
              <h3 className="text-lg font-medium mb-2">CSV Format Requirements</h3>
              <p className="mb-2">The application expects a standard Jira CSV export with at least these fields:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Issue key (or Key)</li>
                <li>Summary</li>
                <li>Status</li>
                <li>Created</li>
                <li>Resolved (optional)</li>
                <li>Story Points (or Story point estimate)</li>
                <li>Epic Link (optional)</li>
              </ul>
            </section>

            <section>
              <h3 className="text-lg font-medium mb-2">Tips for Best Results</h3>
              <ul className="list-disc pl-5 space-y-1">
                <li>Export the entire epic's history for most accurate metrics</li>
                <li>Include all issue statuses (not just completed issues)</li>
                <li>Ensure story points are consistently populated</li>
              </ul>
            </section>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
