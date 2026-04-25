import { Client } from '../types';

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

export function exportClientsAsCSV(clients: Client[]): void {
    if (clients.length === 0) {
        alert('No clients to export');
        return;
    }

    // CSV headers
    const headers = [
        'name',
        'email',
        'phone',
        'company',
        'industry',
        'website',
        'billingAddress',
        'billingEmail',
        'billingPhone',
        'status',
        'notes',
        'createdAt',
        'updatedAt'
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
    const rows = clients.map((client) => [
        escapeCSV(client.name),
        escapeCSV(client.email),
        escapeCSV(client.phone),
        escapeCSV(client.company),
        escapeCSV(client.industry),
        escapeCSV(client.website),
        escapeCSV(client.billingAddress),
        escapeCSV(client.billingEmail),
        escapeCSV(client.billingPhone),
        escapeCSV(client.status),
        escapeCSV(client.notes),
        escapeCSV(client.createdAt),
        escapeCSV(client.updatedAt),
    ]);

    // Combine headers and rows
    const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');

    // Download
    downloadFile(csvContent, 'clients.csv', 'text/csv;charset=utf-8;')
}

export function exportClientsAsJSON(clients: Client[]): void {
  if (clients.length === 0) {
    alert('No clients to export')
    return
  }

  const jsonContent = JSON.stringify(clients, null, 2)
  downloadFile(jsonContent, 'clients.json', 'application/json;charset=utf-8;')
}
