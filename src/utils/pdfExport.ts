
import jsPDF from 'jspdf';
import { ProcessedData } from '@/types/jira';
import { initializePdfDocument, addPageNumbersToPdf, savePdfDocument } from './pdf/pdfDocumentUtils';
import { addChartToPdf } from './pdf/pdfChartUtils';
import { addSummaryMetricsToPdf, addAssigneeTableToPdf } from './pdf/pdfMetricsUtils';

export const generateFullReport = async (
  processedData: ProcessedData, 
  customTeamMembers: number | null
): Promise<void> => {
  const { doc, pageWidth, margin, contentWidth, yPos: initialYPos } = initializePdfDocument();
  
  let yPos = initialYPos;

  // Add summary metrics
  yPos = addSummaryMetricsToPdf(doc, processedData, customTeamMembers, margin, yPos);

  // Add charts
  const chartIds = [
    { id: 'burnup-chart', title: 'Burnup Chart' },
    { id: 'burndown-chart', title: 'Burndown Chart' },
    { id: 'cumulative-flow-chart', title: 'Cumulative Flow Chart' },
    { id: 'cycle-time-chart', title: 'Cycle Time Chart' },
    { id: 'velocity-chart', title: 'Velocity Chart' }
  ];

  for (const chart of chartIds) {
    const result = await addChartToPdf(doc, chart.id, chart.title, margin, contentWidth, yPos);
    if (result) {
      yPos = result.newYPos;
    }
  }

  // Add assignee table
  if (processedData.assigneeData.length > 0) {
    yPos = addAssigneeTableToPdf(doc, processedData.assigneeData, margin, contentWidth, yPos);
  }

  // Add page numbers and save
  addPageNumbersToPdf(doc);
  savePdfDocument(doc);
};

