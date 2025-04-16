
import jsPDF from 'jspdf';
import { ProcessedData } from '@/types/jira';
import { findWeekWithMostPoints } from './dataAnalysisUtils';
import { formatDateRange } from './dateFormatUtils';

/**
 * Adds fun facts section to the PDF report
 */
export const addFunFactsToPdf = (
  doc: jsPDF,
  processedData: ProcessedData,
  margin: number,
  yPos: number
): number => {
  doc.setFontSize(14);
  doc.text("Fun Facts", margin, yPos);
  yPos += 8;
  
  doc.setFontSize(10);
  
  // Find the week with most completed points
  const weeklyCompletion = findWeekWithMostPoints(processedData);
  if (weeklyCompletion) {
    doc.text(`During the week of ${formatDateRange(weeklyCompletion.weekStart, weeklyCompletion.weekEnd)},`, margin, yPos);
    yPos += 5;
    doc.text(`the team crushed it with ${weeklyCompletion.points} story points!`, margin, yPos);
    yPos += 8;
  }
  
  return yPos;
};
