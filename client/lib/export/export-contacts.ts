import { Contact } from '../types';

function downloadFile(content: string, filename: string, mimeType: string): void {
    const blob = new Blob([content], { type: mimeType});
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Clean up the URL object
    URL.revokeObjectURL(url);
}

export function exportContactsAsCSV(contacts: Contact[]): void {
    if (contacts.length === 0) {
        alert('No contacts to export');
        return;
    }

    // CSV headers
    const headers = [
        'name',
        'email',
        'phone',
        'gender',
        'dob',
        'company',
        'industry',
        'website',
        'billingAddress',
        'billingEmail',
        'billingPhone',
        'status',
        'notes',
        'createdAt',
        'updatedAt',
        'jobTitle'
    ];

    // Escape CSV values
    const escapeCSV = (value: string | undefined): string => {
        if (!value) return ''
        const stringValue = String(value);
        if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
            return `"${stringValue.replace(/"/g, '""')}"` // Escape quotes by doubling them
        }
        return stringValue;
    }

    // Build CSV rows 
    const rows = contacts.map((c) => [
        escapeCSV(c.name),
        escapeCSV(c.email),
        escapeCSV(c.phone),
        escapeCSV(c.gender),
        escapeCSV(c.dob),
        escapeCSV(c.company),
        escapeCSV(c.industry),
        escapeCSV(c.website),
        escapeCSV(c.billingAddress),
        escapeCSV(c.billingEmail),
        escapeCSV(c.billingPhone),
        escapeCSV(c.status),
        escapeCSV(c.notes),
        escapeCSV(c.createdAt),
        escapeCSV(c.updatedAt),
        escapeCSV(c.jobTitle),
    ]);

    // Combine headers and rows
    const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');

    // Download
    downloadFile(csvContent, 'contacts.csv', 'text/csv;charset=utf-8;')
}

export function exportContactsAsJSON(contacts: Contact[]): void {
  if (contacts.length === 0) {
    alert('No contacts to export')
    return
  }

  const jsonContent = JSON.stringify(contacts, null, 2)
  downloadFile(jsonContent, 'contacts.json', 'application/json;charset=utf-8;')
}


