
## Client Import Feature

**ImportClientsDialog Component:**

- Multi-step dialog with three main options: download template, import CSV, or import JSON
- Preview step showing all clients to be imported with duplicate detection
- Results step confirming successful imports with duplicate count
- Proper error handling and validation at each step


**CSV Template Download:**

- Pre-configured template with all client fields (name, email, phone, company, industry, website, notes, status)
- One-click download functionality from the dialog
- Example rows included for user reference


**Import Functions (lib/import-clients.ts):**

- `downloadCSVTemplate()` - generates and downloads CSV template file
- `importClientsFromCSV()` - parses CSV with field mapping, validates required fields, detects duplicates
- `importClientsFromJSON()` - supports both single object and array formats, comprehensive field support including billing info
- Both return clients array, duplicate count, and detailed error messages for each invalid row


**Updated AllClientsPage:**

- New "Import Clients" button next to "Add Client" button
- Opens import dialog which handles file upload, preview, and confirmation
- Auto-refreshes client list after successful import
- Seamless integration with existing client management


The system detects duplicates by email address and skips them during import, shows a summary of what will be imported before confirmation, and provides clear error messages for validation issues. Users can download a template, fill it in locally, and import multiple clients at once from either CSV or JSON files.