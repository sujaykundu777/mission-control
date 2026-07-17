-- CreateTable
CREATE TABLE "domains" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "registrar" TEXT NOT NULL,
    "registrarUrl" TEXT,
    "purchaseDate" TEXT NOT NULL,
    "expirationDate" TEXT NOT NULL,
    "renewalPrice" DOUBLE PRECISION NOT NULL,
    "renewalCurrency" TEXT NOT NULL DEFAULT 'USD',
    "autoRenew" BOOLEAN NOT NULL DEFAULT false,
    "status" TEXT NOT NULL DEFAULT 'active',
    "services" JSONB NOT NULL DEFAULT '[]',
    "dnsRecords" JSONB NOT NULL DEFAULT '[]',
    "contactInfo" JSONB,
    "notes" TEXT,
    "currency" TEXT,
    "contactId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "domains_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "domains" ADD CONSTRAINT "domains_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "contacts"("id") ON DELETE SET NULL ON UPDATE CASCADE;
