import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/contacts - List all contacts
export async function GET() {
  try {
    const contacts = await prisma.contact.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(contacts);
  } catch (error) {
    console.error("Error fetching contacts:", error);
    return NextResponse.json({ error: "Failed to fetch contacts" }, { status: 500 });
  }
}

// POST /api/contacts - Create a new contact
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.name?.trim()) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    if (!body.email?.trim()) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // Generate contactId
    const count = await prisma.contact.count();
    const contactId = `CL000${count + 1}`;

    const contact = await prisma.contact.create({
      data: {
        contactId,
        name: body.name,
        email: body.email,
        phone: body.phone || null,
        gender: body.gender || null,
        dob: body.dob || null,
        jobTitle: body.jobTitle || null,
        company: body.company || null,
        industry: body.industry || null,
        website: body.website || null,
        billingAddress: body.billingAddress || null,
        billingEmail: body.billingEmail || null,
        billingPhone: body.billingPhone || null,
        status: body.status || "active",
        customFields:
          body.customFields?.filter((cf: { key: string; value: string }) => cf.key && cf.value) ||
          [],
        notes: body.notes || null,
      },
    });

    return NextResponse.json(contact, { status: 201 });
  } catch (error) {
    console.error("Error creating contact:", error);
    return NextResponse.json({ error: "Failed to create contact" }, { status: 500 });
  }
}
