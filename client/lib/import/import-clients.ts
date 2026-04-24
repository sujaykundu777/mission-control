import { ImportCSVResult, Client } from "../types";
import { storage } from "../storage";

export function downloadCSVTemplate() {
    const template = `name,email,phone,company,industry,website,notes,status
John Doe,john@example.com,+1-666-123-4567,Acme Corp,Technology,https://www.acme.com,"Important client",active
Jane Smith,jane@example.com,+1-666-987-6543,Globex Inc,Finance,https://www.globex.com,"Follow up next week",active
    `

    const blob = new Blob([template], { type: 'text/csv;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'client-import-template.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

export function importClientsFromCSV(csvContent: string): ImportCSVResult {
    const lines = csvContent.trim().split('\n');
    const clients: Client[] = []
    const errors: string[] = []

    let duplicateCount = 0

    if (lines.length < 2) {
        errors.push('CSV file must contain at least a header row and one data row')
        return { 
            clients: [],
            duplicates: 0,
            errors
        }
    }

    const headers = lines[0].split(',').map((h) => h.trim().toLowerCase().replace(/"/g, ''));
    // fetch existing emails
    const existingEmails = new Set(storage.getClients().map((c) => c.email.toLowerCase()));

    // expected headers
    const nameIndex = headers.indexOf('name');
    const emailIndex = headers.indexOf('email');
    const phoneIndex = headers.indexOf('phone');
    const companyIndex = headers.indexOf('company')
    const industryIndex = headers.indexOf('industry')
    const websiteIndex = headers.indexOf('website')
    const notesIndex = headers.indexOf('notes')
    const statusIndex = headers.indexOf('status')

    if (nameIndex === -1 || emailIndex === -1) {
        errors.push('CSV must contain at least "name" and "email" columns')
        return {
            clients: [],
            duplicates: 0,
            errors
        }
    }
    // Process data rows
    for (let i = 1; i < lines.length; i++) {
        try {
            const values = lines[i].split(',').map((v) => v.trim().replace(/"/g, ''))

            if (values.length < 2 || !values[nameIndex] || !values[emailIndex]) {
                continue
            }

            const name = values[nameIndex]
            const email = values[emailIndex]
            const phone = phoneIndex !== -1 ? values[phoneIndex] : undefined
            const company = companyIndex !== -1 ? values[companyIndex] : undefined
            const industry = industryIndex !== -1 ? values[industryIndex] : undefined
            const website = websiteIndex !== -1 ? values[websiteIndex] : undefined
            const notes = notesIndex !== -1 ? values[notesIndex] : undefined
            const status = (statusIndex !== -1 ? values[statusIndex] : 'active') as 'active' | 'inactive' | 'archived'

            if (!name || !email) {
                errors.push(`Row ${i + 1}: Name and email are required`)
                continue
            }

            if (existingEmails.has(email.toLowerCase())) {
                duplicateCount++
                continue
            }

            const newClient: Client = {
                id: `client-${Date.now()}-${i}`,
                name,
                email,
                phone: phone || undefined,
                company: company || undefined,
                industry: industry || undefined,
                website: website || undefined,
                status,
                customFields: [],
                notes: notes || undefined,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            }
            clients.push(newClient)
            existingEmails.add(email.toLowerCase())
        } catch (error) {
            errors.push(`Row ${i + 1}: ${(error as Error).message}`)
        }
    }

    return { clients, duplicates: duplicateCount, errors};

}

export function downloadJSONTemplate() {
  const template = [
    {
      name: 'John Doe',
      email: 'john@example.com',
      phone: '+1-555-0123',
      company: 'Acme Corp',
      industry: 'Technology',
      website: 'https://example.com',
      billingAddress: '123 Main St, New York, NY 10001',
      billingEmail: 'billing@example.com',
      billingPhone: '+1-555-0100',
      notes: 'Primary contact',
      status: 'active',
      customFields: [],
    },
    {
      name: 'Jane Smith',
      email: 'jane@example.com',
      phone: '+1-555-0124',
      company: 'Tech Solutions',
      industry: 'Software',
      website: 'https://tech.com',
      billingAddress: '456 Oak Ave, San Francisco, CA 94102',
      billingEmail: 'billing@tech.com',
      billingPhone: '+1-555-0200',
      notes: 'Billing contact',
      status: 'active',
      customFields: [],
    },
  ]

  const jsonString = JSON.stringify(template, null, 2)
  const blob = new Blob([jsonString], { type: 'application/json;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)

  link.setAttribute('href', url)
  link.setAttribute('download', 'clients-template.json')
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

export function importClientsFromJSON(jsonContent: string): ImportCSVResult {
  const clients: Client[] = []
  const errors: string[] = []
  let duplicateCount = 0

  try {
    const data = JSON.parse(jsonContent)
    const clientsData = Array.isArray(data) ? data : [data]
    const existingEmails = new Set(storage.getClients().map((c) => c.email.toLowerCase()))

    for (let i = 0; i < clientsData.length; i++) {
      try {
        const clientData = clientsData[i]

        if (!clientData.name || !clientData.email) {
          errors.push(`Item ${i + 1}: Name and email are required`)
          continue
        }

        if (existingEmails.has(clientData.email.toLowerCase())) {
          duplicateCount++
          continue
        }

        const newClient: Client = {
          id: `client-${Date.now()}-${i}`,
          name: clientData.name,
          email: clientData.email,
          phone: clientData.phone || undefined,
          company: clientData.company || undefined,
          industry: clientData.industry || undefined,
          website: clientData.website || undefined,
          billingAddress: clientData.billingAddress || undefined,
          billingEmail: clientData.billingEmail || undefined,
          billingPhone: clientData.billingPhone || undefined,
          status: clientData.status || 'active',
          customFields: clientData.customFields || [],
          notes: clientData.notes || undefined,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }

        clients.push(newClient)
        existingEmails.add(clientData.email.toLowerCase())
      } catch (error) {
        errors.push(`Item ${i + 1}: ${(error as Error).message}`)
      }
    }
  } catch (error) {
    errors.push(`Invalid JSON format: ${(error as Error).message}`)
  }

  return { clients, duplicates: duplicateCount, errors }
}