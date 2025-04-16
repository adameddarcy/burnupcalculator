
/**
 * Export chart as an image file
 */
export const exportChartAsImage = (chartId: string, fileName: string = 'chart') => {
  const canvas = document.getElementById(chartId) as HTMLCanvasElement;
  if (!canvas) return;
  
  // Get current date in YYYY-MM-DD format
  const dateStr = new Date().toISOString().split('T')[0];
  
  // Create a temporary link element
  const link = document.createElement('a');
  link.download = `${fileName}-${dateStr}.png`;
  link.href = canvas.toDataURL('image/png');
  link.click();
  link.remove();
};

/**
 * Export data as CSV file
 */
export const exportDataAsCSV = (data: any[], fileName: string = 'data') => {
  // Convert data to CSV format
  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(','),
    ...data.map(row => 
      headers.map(header => {
        let cell = row[header] || '';
        // Escape commas and quotes
        if (cell && typeof cell === 'string' && (cell.includes(',') || cell.includes('"'))) {
          cell = `"${cell.replace(/"/g, '""')}"`;
        }
        return cell;
      }).join(',')
    )
  ].join('\n');

  // Get current date in YYYY-MM-DD format
  const dateStr = new Date().toISOString().split('T')[0];

  // Create a temporary link element
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `${fileName}-${dateStr}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
