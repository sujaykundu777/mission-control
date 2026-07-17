import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/domains - List all domains
export async function GET() {
  try {
    const domains = await prisma.domain.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(domains);
  } catch (error) {
    console.error("Error fetching domains:", error);
    return NextResponse.json({ error: "Failed to fetch domains" }, { status: 500 });
  }
}

// POST /api/domains - Create a new domain
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.name?.trim()) {
      return NextResponse.json({ error: "Domain name is required" }, { status: 400 });
    }
    if (!body.registrar) {
      return NextResponse.json({ error: "Registrar is required" }, { status: 400 });
    }

    const domain = await prisma.domain.create({
      data: {
        name: body.name,
        registrar: body.registrar,
        registrarUrl: body.registrarUrl || null,
        purchaseDate: body.purchaseDate,
        expirationDate: body.expirationDate,
        renewalPrice: body.renewalPrice,
        renewalCurrency: body.renewalCurrency || "USD",
        autoRenew: body.autoRenew ?? false,
        status: body.status || "active",
        services: body.services ?? [],
        dnsRecords: body.dnsRecords ?? [],
        contactInfo: body.contactInfo ?? undefined,
        notes: body.notes || null,
        currency: body.currency || null,
        contactId: body.contactId || null,
      },
    });

    return NextResponse.json(domain, { status: 201 });
  } catch (error) {
    console.error("Error creating domain:", error);
    return NextResponse.json({ error: "Failed to create domain" }, { status: 500 });
  }
}
