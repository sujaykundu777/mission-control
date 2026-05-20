import { NextRequest, NextResponse } from 'next/server'
import { Contact } from '@/lib/types'

// In-memory store for server-side contacts (mirrors client IndexedDB)
// This will be replaced with a real database in the future
const contactsStore: Map<string, Contact> = new Map()

export function getContactsStore() {
  return contactsStore
}

// GET /api/contacts - List all contacts
export async function GET() {
  try {
    const contacts = Array.from(contactsStore.values())
    return NextResponse.json(contacts)
  } catch (error) {
    console.error('Error fetching contacts:', error)
    return NextResponse.json(
      { error: 'Failed to fetch contacts' },
      { status: 500 }
    )
  }
}

// POST /api/contacts - Create a new contact
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate required fields
    if (!body.name?.trim()) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      )
    }

    if (!body.email?.trim()) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    const contactCount = contactsStore.size + 1
    const newContact: Contact = {
      id: `contact-${Date.now()}`,
      contactId: `CL000${contactCount}`,
      name: body.name,
      email: body.email,
      phone: body.phone || undefined,
      gender: body.gender || undefined,
      dob: body.dob || undefined,
      jobTitle: body.jobTitle || undefined,
      company: body.company || undefined,
      industry: body.industry || undefined,
      website: body.website || undefined,
      billingAddress: body.billingAddress || undefined,
      billingEmail: body.billingEmail || undefined,
      billingPhone: body.billingPhone || undefined,
      status: body.status || 'active',
      customFields: body.customFields?.filter(
        (cf: { key: string; value: string }) => cf.key && cf.value
      ) || [],
      notes: body.notes || undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    contactsStore.set(newContact.id, newContact)

    return NextResponse.json(newContact, { status: 201 })
  } catch (error) {
    console.error('Error creating contact:', error)
    return NextResponse.json(
      { error: 'Failed to create contact' },
      { status: 500 }
    )
  }
}
