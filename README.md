
# Jira Epic Metrics Calculator

A web application that generates burnup and burndown charts from Jira epic CSV exports.

## Features

- Upload Jira CSV exports
- Generate burnup and burndown charts
- View detailed issue data in a table format
- Export charts as images
- Export processed data as CSV

## How to Use

1. **Export Data from Jira**
   - In Jira, navigate to your epic or filter view
   - Click on "Export" and select "CSV (All Fields)"
   - Save the CSV file to your computer

2. **Upload CSV to the Application**
   - Click the upload area or drag and drop your CSV file
   - The application will automatically parse and validate the data

3. **View and Analyze Charts**
   - Once uploaded, you'll see burnup and burndown charts
   - The burnup chart shows completed story points vs total scope over time
   - The burndown chart shows remaining work over time

4. **Export Results**
   - Click "Export Burnup" or "Export Burndown" to save charts as images
   - Click "Export Data" to download the processed data as CSV

## CSV Format Requirements

The application expects a standard Jira CSV export with at least these fields:
- Issue key (or Key)
- Summary
- Status
- Created
- Resolved (optional)
- Story Points (or Story point estimate)
- Epic Link (optional)

## Built With

- React
- TypeScript
- Chart.js for data visualization
- Tailwind CSS and shadcn/ui for styling
- PapaParse for CSV parsing

## Project Status

This is the initial version of the Jira Epic Metrics Calculator. Future enhancements may include:
- Support for custom field mapping
- Additional chart types
- Trend analysis
- Multi-epic comparison
