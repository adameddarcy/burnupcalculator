
import jsPDF from 'jspdf';
import { AssigneeMetrics } from '@/types/jira';

/**
 * Adds assignee data table to the PDF report
 */
export const addAssigneeTableToPdf = (
  doc: jsPDF,
  assigneeData: AssigneeMetrics[],
  margin: number,
  contentWidth: number,
  yPos: number
): number => {
  // Check if we need a new page
  if (yPos > doc.internal.pageSize.getHeight() - 60) {
    doc.addPage();
    yPos = 20;
  }
  
  // Add table title
  doc.setFontSize(14);
  doc.text('Assignee Data', margin, yPos);
  yPos += 8;
  
  // Set up table
  doc.setFontSize(10);
  const headers = ['Assignee', 'Completed Points', 'Assigned Points', 'Issues'];
  const colWidths = [contentWidth * 0.4, contentWidth * 0.2, contentWidth * 0.2, contentWidth * 0.2];
  
  // Draw table header
  doc.setFillColor(240, 240, 240);
  doc.setDrawColor(200, 200, 200);
  doc.rect(margin, yPos, contentWidth, 7, 'FD');
  
  let xPos = margin;
  headers.forEach((header, index) => {
    doc.text(header, xPos + 2, yPos + 5);
    xPos += colWidths[index];
  });
  
  yPos += 7;
  
  // Draw table rows
  doc.setFillColor(255, 255, 255);
  assigneeData.forEach((assignee, index) => {
    // Check if we need a new page
    if (yPos > doc.internal.pageSize.getHeight() - 20) {
      doc.addPage();
      yPos = 20;
      
      // Redraw header on new page
      doc.setFontSize(10);
      doc.setFillColor(240, 240, 240);
      doc.rect(margin, yPos, contentWidth, 7, 'FD');
      
      xPos = margin;
      headers.forEach((header, index) => {
        doc.text(header, xPos + 2, yPos + 5);
        xPos += colWidths[index];
      });
      
      yPos += 7;
      doc.setFillColor(255, 255, 255);
    }
    
    // Row background (alternate colors)
    doc.setFillColor(index % 2 === 0 ? 255 : 248, index % 2 === 0 ? 255 : 248, index % 2 === 0 ? 255 : 248);
    doc.rect(margin, yPos, contentWidth, 7, 'FD');
    
    // Row data
    xPos = margin;
    doc.text(assignee.name || 'Unassigned', xPos + 2, yPos + 5, { maxWidth: colWidths[0] - 4 });
    xPos += colWidths[0];
    
    doc.text(assignee.completedPoints.toString(), xPos + 2, yPos + 5);
    xPos += colWidths[1];
    
    doc.text(assignee.assignedPoints.toString(), xPos + 2, yPos + 5);
    xPos += colWidths[2];
    
    doc.text(assignee.issueCount.toString(), xPos + 2, yPos + 5);
    
    yPos += 7;
  });

  return yPos;
};
