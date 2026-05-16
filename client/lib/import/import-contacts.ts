import { ImportCSVResult, Client, Contact } from "../types";
import { storage } from "../storage";

export function downloadCSVTemplate() {
    const template = `name,email,phone,gender,dob,company,industry,website,notes,status,jobTitle
John Doe,john@example.com,+1-666-123-4567,Male,15-9-1985,Acme Corp,Technology,https://www.acme.com,"Important contact",active,Software Engineer
Jane Smith,jane@example.com,+1-666-987-6543,Female,15-10-1995,Globex Inc,Finance,https://www.globex.com,"Follow up next week",active,Product Manager
    `

    const blob = new Blob([template], { type: 'text/csv;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'contact-import-template.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

export async function importContactsFromCSV(csvContent: string): Promise<ImportCSVResult> {
    const lines = csvContent.trim().split('\n');
    const contacts: Contact[] = []
    const errors: string[] = []

    let duplicateCount = 0

    if (lines.length < 2) {
        errors.push('CSV file must contain at least a header row and one data row')
        return { 
            contacts: [],
            duplicates: 0,
            errors
        }
    }

    const headers = lines[0].split(',').map((h) => h.trim().toLowerCase().replace(/"/g, ''));
    // fetch existing emails
    const existingEmails = new Set((await storage.getContacts()).map((c) => c.email.toLowerCase()));

    // expected headers
    const nameIndex = headers.indexOf('name');
    const emailIndex = headers.indexOf('email');
    const phoneIndex = headers.indexOf('phone');
    const genderIndex = headers.indexOf('gender');
    const dobIndex = headers.indexOf('dob');
    const companyIndex = headers.indexOf('company')
    const industryIndex = headers.indexOf('industry')
    const websiteIndex = headers.indexOf('website')
    const notesIndex = headers.indexOf('notes')
    const statusIndex = headers.indexOf('status')
    const jobTitleIndex = headers.indexOf('jobTitle')

    if (nameIndex === -1 || emailIndex === -1) {
        errors.push('CSV must contain at least "name" and "email" columns')
        return {
            contacts: [],
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
            const gender = genderIndex !== -1 ? values[genderIndex] : undefined
            const dob = genderIndex !== -1 ? values[dobIndex] : undefined
            const company = companyIndex !== -1 ? values[companyIndex] : undefined
            const industry = industryIndex !== -1 ? values[industryIndex] : undefined
            const website = websiteIndex !== -1 ? values[websiteIndex] : undefined
            const notes = notesIndex !== -1 ? values[notesIndex] : undefined
            const status = (statusIndex !== -1 ? values[statusIndex] : 'active') as 'active' | 'inactive' | 'archived'
            const jobTitle = jobTitleIndex !== -1 ? values[jobTitleIndex] : undefined

            if (!name || !email) {
                errors.push(`Row ${i + 1}: Name and email are required`)
                continue
            }

            if (existingEmails.has(email.toLowerCase())) {
                duplicateCount++
                continue
            }
            const existingContacts = await storage.getContacts();
            const newContactCount = `CN000` + (existingContacts.length + 1); 
            const newContact: Contact = {
                id: `contact-${Date.now()}-${i}`,
                contactId: newContactCount,
                name,
                email,
                phone: phone || undefined,
                gender: gender || undefined,
                dob: dob || undefined,
                company: company || undefined,
                industry: industry || undefined,
                website: website || undefined,
                status,
                jobTitle: jobTitle || undefined,
                customFields: [],
                notes: notes || undefined,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            }
            contacts.push(newContact)
            existingEmails.add(email.toLowerCase())
        } catch (error) {
            errors.push(`Row ${i + 1}: ${(error as Error).message}`)
        }
    }

    return { contacts, duplicates: duplicateCount, errors};
}

export function downloadJSONTemplate() {
  const template = [
    {
      name: 'John Doe',
      email: 'john@example.com',
      phone: '+1-555-0123',
      gender: 'Male',
      dob: '15-9-1985',
      company: 'Acme Corp',
      industry: 'Technology',
      website: 'https://example.com',
      billingAddress: '123 Main St, New York, NY 10001',
      billingEmail: 'billing@example.com',
      billingPhone: '+1-555-0100',
      notes: 'Primary contact',
      status: 'active',
      jobTitle: 'Software Engineer',
      customFields: [],
    },
    {
      name: 'Jane Smith',
      email: 'jane@example.com',
      phone: '+1-555-0124',
      gender: 'Female',
      dob: '15-10-1995',
      company: 'Tech Solutions',
      industry: 'Software',
      website: 'https://tech.com',
      billingAddress: '456 Oak Ave, San Francisco, CA 94102',
      billingEmail: 'billing@tech.com',
      billingPhone: '+1-555-0200',
      notes: 'Billing contact',
      status: 'active',
      jobTitle: 'Product Manager',
      customFields: [],
    },
  ]

  const jsonString = JSON.stringify(template, null, 2)
  const blob = new Blob([jsonString], { type: 'application/json;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)

  link.setAttribute('href', url)
  link.setAttribute('download', 'contacts-template.json')
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

export async function importContactsFromJSON(jsonContent: string): Promise<ImportCSVResult> {
  const contacts: Contact[] = []
  const errors: string[] = []
  let duplicateCount = 0

  try {
    const data = JSON.parse(jsonContent)
    const contactsData = Array.isArray(data) ? data : [data]
    const existingEmails = new Set(await (await storage.getContacts()).map((c) => c.email.toLowerCase()))

    for (let i = 0; i < contactsData.length; i++) {
      try {
        const contactData = contactsData[i]

        if (!contactData.name || !contactData.email) {
          errors.push(`Item ${i + 1}: Name and email are required`)
          continue
        }

        if (existingEmails.has(contactData.email.toLowerCase())) {
          duplicateCount++
          continue
        }
        const existingContacts = await storage.getContacts();
        const newContactCount = `CL000` + (existingContacts.length + 1); 
        const newContact: Contact = {
          id: `contact-${Date.now()}-${i}`,
          contactId: newContactCount,
          name: contactData.name,
          email: contactData.email,
          phone: contactData.phone || undefined,
          gender: contactData.gender || undefined,
          dob: contactData.dob || undefined,
          company: contactData.company || undefined,
          industry: contactData.industry || undefined,
          website: contactData.website || undefined,
          billingAddress: contactData.billingAddress || undefined,
          billingEmail: contactData.billingEmail || undefined,
          billingPhone: contactData.billingPhone || undefined,
          status: contactData.status || 'active',
          jobTitle: contactData.jobTitle || undefined,
          customFields: contactData.customFields || [],
          notes: contactData.notes || undefined,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }

        contacts.push(newContact)
        existingEmails.add(contactData.email.toLowerCase())
      } catch (error) {
        errors.push(`Item ${i + 1}: ${(error as Error).message}`)
      }
    }
  } catch (error) {
    errors.push(`Invalid JSON format: ${(error as Error).message}`)
  }

  return { contacts, duplicates: duplicateCount, errors }
}