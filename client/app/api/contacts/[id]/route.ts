import { NextRequest, NextResponse } from 'next/server'
import { getContactsStore } from '../route'

// GET /api/contacts/[id] - Get a single contact
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const contactsStore = getContactsStore()
    const contact = contactsStore.get(id)

    if (!contact) {
      return NextResponse.json(
        { error: 'Contact not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(contact)
  } catch (error) {
    console.error('Error fetching contact:', error)
    return NextResponse.json(
      { error: 'Failed to fetch contact' },
      { status: 500 }
    )
  }
}

// PUT /api/contacts/[id] - Update a contact
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const contactsStore = getContactsStore()
    const existingContact = contactsStore.get(id)

    if (!existingContact) {
      return NextResponse.json(
        { error: 'Contact not found' },
        { status: 404 }
      )
    }

    const body = await request.json()

    const updatedContact = {
      ...existingContact,
      ...body,
      id: existingContact.id,
      contactId: existingContact.contactId,
      createdAt: existingContact.createdAt,
      updatedAt: new Date().toISOString(),
    }

    contactsStore.set(id, updatedContact)

    return NextResponse.json(updatedContact)
  } catch (error) {
    console.error('Error updating contact:', error)
    return NextResponse.json(
      { error: 'Failed to update contact' },
      { status: 500 }
    )
  }
}

// DELETE /api/contacts/[id] - Delete a contact
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const contactsStore = getContactsStore()

    if (!contactsStore.has(id)) {
      return NextResponse.json(
        { error: 'Contact not found' },
        { status: 404 }
      )
    }

    contactsStore.delete(id)

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error('Error deleting contact:', error)
    return NextResponse.json(
      { error: 'Failed to delete contact' },
      { status: 500 }
    )
  }
}
