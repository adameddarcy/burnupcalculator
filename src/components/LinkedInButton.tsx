
import { Linkedin } from 'lucide-react';
import { Button } from "@/components/ui/button";

interface LinkedInButtonProps {
  profileUrl: string;
}

export function LinkedInButton({ profileUrl }: LinkedInButtonProps) {
  const handleClick = () => {
    window.open(profileUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <Button 
      variant="outline" 
      size="sm" 
      onClick={handleClick}
      className="flex items-center gap-2"
    >
      <Linkedin className="h-4 w-4" />
      LinkedIn
    </Button>
  );
}
