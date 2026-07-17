import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/domains/[id] - Get a single domain
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const domain = await prisma.domain.findUnique({ where: { id } });

    if (!domain) {
      return NextResponse.json({ error: "Domain not found" }, { status: 404 });
    }

    return NextResponse.json(domain);
  } catch (error) {
    console.error("Error fetching domain:", error);
    return NextResponse.json({ error: "Failed to fetch domain" }, { status: 500 });
  }
}

// PUT /api/domains/[id] - Update a domain
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();

    const domain = await prisma.domain.update({
      where: { id },
      data: {
        name: body.name,
        registrar: body.registrar,
        registrarUrl: body.registrarUrl || null,
        purchaseDate: body.purchaseDate,
        expirationDate: body.expirationDate,
        renewalPrice: body.renewalPrice,
        renewalCurrency: body.renewalCurrency,
        autoRenew: body.autoRenew,
        status: body.status,
        services: body.services,
        dnsRecords: body.dnsRecords,
        contactInfo: body.contactInfo ?? undefined,
        notes: body.notes || null,
        currency: body.currency || null,
        contactId: body.contactId || null,
      },
    });

    return NextResponse.json(domain);
  } catch (error: any) {
    if (error?.code === "P2025") {
      return NextResponse.json({ error: "Domain not found" }, { status: 404 });
    }
    console.error("Error updating domain:", error);
    return NextResponse.json({ error: "Failed to update domain" }, { status: 500 });
  }
}

// DELETE /api/domains/[id] - Delete a domain
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    await prisma.domain.delete({ where: { id } });
    return new NextResponse(null, { status: 204 });
  } catch (error: any) {
    if (error?.code === "P2025") {
      return NextResponse.json({ error: "Domain not found" }, { status: 404 });
    }
    console.error("Error deleting domain:", error);
    return NextResponse.json({ error: "Failed to delete domain" }, { status: 500 });
  }
}
