
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { ProcessedData } from '@/types/jira';

/**
 * Creates and downloads a complete PDF report with all charts and metrics
 */
export const generateFullReport = async (
  processedData: ProcessedData,
  customTeamMembers: number | null = null
) => {
  // Create a new PDF document
  const doc = new jsPDF('p', 'mm', 'a4');
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  const contentWidth = pageWidth - margin * 2;
  
  // Get current date in YYYY-MM-DD format
  const dateStr = new Date().toISOString().split('T')[0];
  
  // Add title
  const title = 'Jira Epic Metrics Report';
  doc.setFontSize(20);
  doc.text(title, pageWidth / 2, 20, { align: 'center' });
  
  // Add date
  doc.setFontSize(10);
  doc.text(`Generated: ${new Date().toLocaleDateString()}`, pageWidth / 2, 27, { align: 'center' });

  // Add horizontal line
  doc.setDrawColor(200, 200, 200);
  doc.line(margin, 30, pageWidth - margin, 30);

  // Initial vertical position
  let yPos = 40;
  
  // Add summary metrics
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
    doc.text(`Projected Completion: ${processedData.projectedCompletionDate.toLocaleDateString()}`, margin, yPos);
    yPos += 7;
  }
  
  // Add horizontal line
  doc.setDrawColor(200, 200, 200);
  doc.line(margin, yPos + 3, pageWidth - margin, yPos + 3);
  yPos += 10;

  // Function to capture chart and add to PDF
  const addChartToPdf = async (chartId: string, title: string) => {
    try {
      const canvas = document.getElementById(chartId) as HTMLCanvasElement;
      if (!canvas) return null;
      
      const chart = await html2canvas(canvas, {
        scale: 2,
        backgroundColor: null,
        logging: false
      });
      
      const imgData = chart.toDataURL('image/png');
      const imgWidth = contentWidth;
      const imgHeight = (chart.height * imgWidth) / chart.width;
      
      // Check if we need a new page (if less than 60mm space left)
      if (yPos > doc.internal.pageSize.getHeight() - 60) {
        doc.addPage();
        yPos = 20;
      }
      
      // Add chart title
      doc.setFontSize(14);
      doc.text(title, margin, yPos);
      yPos += 8;
      
      // Add chart image
      doc.addImage(imgData, 'PNG', margin, yPos, imgWidth, imgHeight);
      yPos += imgHeight + 15;
      
      return true;
    } catch (error) {
      console.error(`Error capturing ${chartId}:`, error);
      return null;
    }
  };

  // Core charts
  await addChartToPdf('burnup-chart', 'Burnup Chart');
  await addChartToPdf('burndown-chart', 'Burndown Chart');
  
  // Advanced charts
  await addChartToPdf('cumulative-flow-chart', 'Cumulative Flow Chart');
  await addChartToPdf('cycle-time-chart', 'Cycle Time Chart');
  await addChartToPdf('velocity-chart', 'Velocity Chart');
  
  // Assignee chart
  await addChartToPdf('assignee-chart', 'Assignee Distribution Chart');
  
  // Add assignee data table if space allows
  if (processedData.assigneeData.length > 0) {
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
    processedData.assigneeData.forEach((assignee, index) => {
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
  }
  
  // Add footer with page numbers
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.text(
      `Page ${i} of ${totalPages}`, 
      pageWidth / 2, 
      doc.internal.pageSize.getHeight() - 10, 
      { align: 'center' }
    );
  }
  
  // Save the PDF with a formatted filename
  doc.save(`jira-epic-report-${dateStr}.pdf`);
};
