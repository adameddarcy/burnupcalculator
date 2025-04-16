import jsPDF from 'jspdf';

/**
 * Initializes a new PDF document with header and title
 */
export const initializePdfDocument = (): {
  doc: jsPDF;
  pageWidth: number;
  margin: number;
  contentWidth: number;
  yPos: number;
} => {
  // Create a new PDF document
  const doc = new jsPDF('p', 'mm', 'a4');
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  const contentWidth = pageWidth - margin * 2;
  
  // Get current date in YYYY-MM-DD format
  const dateStr = new Date().toISOString().split('T')[0];
  
  // Add title with emoji
  const title = '📈 Jira Epic Metrics Report 📊';
  doc.setFontSize(20);
  doc.text(title, pageWidth / 2, 20, { align: 'center' });
  
  // Add date
  doc.setFontSize(10);
  doc.text(`Generated: ${new Date().toLocaleDateString()}`, pageWidth / 2, 27, { align: 'center' });

  // Add horizontal line
  doc.setDrawColor(200, 200, 200);
  doc.line(margin, 30, pageWidth - margin, 30);

  // Initial vertical position
  const yPos = 40;

  return { doc, pageWidth, margin, contentWidth, yPos };
};

/**
 * Adds page numbers to all pages in the PDF document
 */
export const addPageNumbersToPdf = (doc: jsPDF): void => {
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.text(
      `Page ${i} of ${totalPages}`, 
      doc.internal.pageSize.getWidth() / 2, 
      doc.internal.pageSize.getHeight() - 10, 
      { align: 'center' }
    );
  }
};

/**
 * Saves the PDF document with a formatted filename
 */
export const savePdfDocument = (doc: jsPDF, prefix: string = 'jira-epic-report'): void => {
  // Get current date in YYYY-MM-DD format
  const dateStr = new Date().toISOString().split('T')[0];
  doc.save(`${prefix}-${dateStr}.pdf`);
};
