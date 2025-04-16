
import { HelpDialog } from "@/components/HelpDialog";
import { LinkedInButton } from '@/components/LinkedInButton';

export function Header() {
  return (
    <div className="flex flex-col items-center justify-center mb-8 text-center">
      <div className="flex justify-between w-full items-center mb-4">
        <h1 className="text-3xl font-bold tracking-tight">
          Jira Epic Metrics Calculator
        </h1>
        <div className="flex items-center space-x-2">
          <HelpDialog />
          <LinkedInButton profileUrl="https://www.linkedin.com/in/adamedarcy/" />
        </div>
      </div>
      <p className="text-muted-foreground mt-2">
        Upload a Jira CSV export to visualize burnup and burndown charts for your epics
      </p>
    </div>
  );
}
