# Jira Epic Metrics Calculator

A web application that generates burnup and burndown charts from Jira epic CSV exports.

## Features

- Upload Jira CSV exports
- Generate burnup and burndown charts
- View detailed issue data in a table format
- Export charts as images
- Export processed data as CSV

## How to Get a CSV for Calculation

### Step-by-Step Guide to Export Jira Epic CSV

1. **Log in to Jira**
   - Navigate to your Jira project

2. **Find Your Epic**
   - Use the search bar or navigate to the epic you want to analyze
   - You can also use JQL (Jira Query Language) to filter epics

3. **Export Epic Issues**
   - Click on the "..." (more options) menu
   - Select "Export" > "Export to CSV"
   
   **Alternative Method:**
   - Go to the "Issues" view
   - Apply a filter for your specific epic using the search bar or JQL
   - Click on "Export" > "Export to CSV (All Fields)"

4. **Recommended JQL Filters**
   - For a single epic: `"Epic Link" = EPIC-123`
   - For all issues in an epic: `"Epic Link" = EPIC-123 OR "Epic Link" = EPIC-123`

### CSV Export Tips
- Ensure you export ALL fields for comprehensive analysis
- The export should include columns like:
  - Issue key
  - Summary
  - Status
  - Created date
  - Resolved date (if applicable)
  - Story Points
  - Assignee

## CSV Format Requirements

The application expects a standard Jira CSV export with at least these fields:
- Issue key (or Key)
- Summary
- Status
- Created
- Resolved (optional)
- Story Points (or Story point estimate)
- Epic Link (optional)

## Tips for Best Results
- Export the entire epic's history for most accurate metrics
- Include all issue statuses (not just completed issues)
- Ensure story points are consistently populated

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
