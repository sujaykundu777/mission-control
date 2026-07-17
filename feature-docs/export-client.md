**Export Utility (lib/export-clients.ts):**

- `exportClientsAsCSV()` - exports all clients to CSV with proper escaping for special characters (commas, quotes, newlines)
- `exportClientsAsJSON()` - exports all clients as prettified JSON with 2-space indentation
- Helper function for file download with proper MIME types and cleanup


**Export Dialog Component:**

- Two-step dialog with format selection (CSV or JSON)
- Visual cards for each format with descriptions and icons
- Smart button state - shows relevant export button only after format selection
- Disables export when no clients exist


**Updated AllClientsPage:**

- New "Export" button in the header toolbar (disabled when no clients)
- Export functionality exports filtered clients based on current search and status filters
- Both Export and Import buttons with clear icons for easy identification


The export feature exports all visible clients including all fields (name, email, phone, company, industry, website, billing info, status, notes, and timestamps). CSV format properly handles special characters and is compatible with spreadsheet applications, while JSON preserves the complete data structure for programmatic use.
