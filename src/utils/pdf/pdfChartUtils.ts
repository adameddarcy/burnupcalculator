
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

/**
 * Maps chart IDs to emoji icons
 */
const chartEmojis: Record<string, string> = {
  'burnup-chart': '📈',
  'burndown-chart': '📉',
  'cumulative-flow-chart': '🌊',
  'cycle-time-chart': '⏱️',
  'velocity-chart': '🚀',
};

/**
 * Captures a chart from the DOM and adds it to a PDF document
 */
export const addChartToPdf = async (
  doc: jsPDF,
  chartId: string, 
  title: string,
  margin: number,
  contentWidth: number,
  yPos: number
): Promise<{ success: boolean; newYPos: number } | null> => {
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
    
    // Add chart title with emoji
    const emoji = chartEmojis[chartId] || '📊';
    doc.setFontSize(14);
    doc.text(`${emoji} ${title}`, margin, yPos);
    yPos += 8;
    
    // Add chart image
    doc.addImage(imgData, 'PNG', margin, yPos, imgWidth, imgHeight);
    yPos += imgHeight + 15;
    
    return { success: true, newYPos: yPos };
  } catch (error) {
    console.error(`Error capturing ${chartId}:`, error);
    return null;
  }
};

