
import jsPDF from 'jspdf';
import { ProcessedData } from '@/types/jira';
import { addFunFactsToPdf } from './pdfFunFactsUtils';
import { addAssigneeTableToPdf } from './pdfAssigneeTableUtils';

/**
 * Adds summary metrics to the PDF report
 */
export const addSummaryMetricsToPdf = (
  doc: jsPDF,
  processedData: ProcessedData,
  customTeamMembers: number | null,
  margin: number,
  yPos: number
): number => {
  doc.setFontSize(16);
  doc.text('Summary Metrics', margin, yPos);
  yPos += 10;
  
  doc.setFontSize(12);
  doc.text(`Total Story Points: ${processedData.totalPoints}`, margin, yPos);
  yPos += 7;
  
  doc.text(`Completed Points: ${processedData.completedPoints}`, margin, yPos);
  yPos += 7;
  
  doc.text(`Completion: ${Math.round((processedData.completedPoints / processedData.totalPoints) * 100)}%`, margin, yPos);
  yPos += 7;
  
  doc.text(`Total Issues: ${processedData.issues.length}`, margin, yPos);
  yPos += 7;
  
  const effectiveTeamMembers = customTeamMembers !== null 
    ? customTeamMembers
    : processedData?.totalAssignees || 0;
  
  doc.text(`Team Members: ${effectiveTeamMembers}`, margin, yPos);
  yPos += 7;

  if (processedData.velocity) {
    doc.text(`Team Velocity: ${processedData.velocity.toFixed(1)} points/day`, margin, yPos);
    yPos += 7;
  }

  if (processedData.projectedCompletionDate) {
    const today = new Date();
    const daysToCompletion = Math.ceil((processedData.projectedCompletionDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    doc.text(`Projected Completion: ${processedData.projectedCompletionDate.toLocaleDateString()}`, margin, yPos);
    yPos += 7;
    
    doc.text(`Days until completion: ${daysToCompletion > 0 ? daysToCompletion : 'Overdue!'}`, margin, yPos);
    yPos += 7;
  }
  
  // Add fun facts section
  yPos = addFunFactsToPdf(doc, processedData, margin, yPos);
  
  // Add horizontal line
  doc.setDrawColor(200, 200, 200);
  doc.line(margin, yPos + 3, doc.internal.pageSize.getWidth() - margin, yPos + 3);
  yPos += 10;

  return yPos;
};

// Re-export addAssigneeTableToPdf to maintain the same public API
export { addAssigneeTableToPdf } from './pdfAssigneeTableUtils';
