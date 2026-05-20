# Prisma Setup Guide

## Overview

This project uses [Prisma](https://www.prisma.io/) (v7) as the ORM for database access. Prisma provides type-safe database queries, schema management, and migrations for the PostgreSQL database hosted on Supabase.

---

## Prerequisites

- Node.js 18+
- pnpm installed
- A PostgreSQL database (see [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) for Supabase setup)

---

## Installation

Prisma is already installed in this project. If starting fresh:

```bash
pnpm add prisma @prisma/client @prisma/adapter-pg pg dotenv
pnpm add -D @types/pg
```

---

## Project Structure

```
├── prisma/
│   ├── schema.prisma             # Schema definition (models, datasource)
│   └── migrations/               # Migration files (created by prisma migrate)
├── prisma.config.ts              # Prisma CLI config (connection URLs, migration path)
├── lib/
│   ├── prisma.ts                 # Prisma client singleton (import this in your app)
│   └── generated/prisma/         # Auto-generated client code (gitignored)
└── .env                          # DATABASE_URL and DIRECT_URL
```

---

## Configuration Files

### `prisma/schema.prisma`

Defines your database models and generator settings:

```prisma
generator client {
  provider = "prisma-client"
  output   = "../lib/generated/prisma"
}

datasource db {
  provider = "postgresql"
}

model Contact {
  id             String   @id @default(cuid())
  contactId      String   @unique
  name           String
  email          String
  // ... other fields
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt

  @@map("contacts")   // maps to "contacts" table in the database
}
```

### `prisma.config.ts`

Prisma 7 uses this file for CLI configuration (connection URLs, migration directory):

```typescript
import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: process.env["DATABASE_URL"],
    directUrl: process.env["DIRECT_URL"],
  },
});
```

### `lib/prisma.ts`

The Prisma client singleton used throughout the app:

```typescript
import { PrismaClient } from '@/lib/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'

const connectionString = process.env.DATABASE_URL!

const globalForPrisma = globalThis as unknown as {
  prisma: InstanceType<typeof PrismaClient> | undefined
}

function createPrismaClient() {
  const pool = new pg.Pool({ connectionString })
  const adapter = new PrismaPg(pool)
  return new PrismaClient({ adapter })
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
```

**Why a singleton?** In development, Next.js hot-reloads modules frequently. Without a singleton, each reload creates a new connection pool, eventually exhausting database connections.

---

## Environment Variables

Create a `.env` file in the project root:

```bash
# Pooled connection (used by the app at runtime)
DATABASE_URL="postgresql://postgres.[REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true"

# Direct connection (used by Prisma CLI for migrations)
DIRECT_URL="postgresql://postgres.[REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:5432/postgres"
```

- **DATABASE_URL** — Used by the app at runtime. Goes through PgBouncer (port 6543) for connection pooling.
- **DIRECT_URL** — Used by Prisma CLI for migrations and introspection. Direct connection (port 5432) required for DDL operations.

---

## Common Commands

### Generate the Prisma Client

Run this after any schema change:

```bash
npx prisma generate
```

This regenerates the TypeScript client at `lib/generated/prisma/`. You must run this before building or after pulling schema changes.

### Push Schema to Database (Development)

Applies schema changes directly without creating migration files:

```bash
npx prisma db push
```

Use this during development for quick iteration. Does not create migration history.

### Create a Migration (Production)

Creates a versioned migration file and applies it:

```bash
npx prisma migrate dev --name description_of_change
```

Example:
```bash
npx prisma migrate dev --name add_phone_field_to_contacts
```

This creates a SQL file in `prisma/migrations/` that can be version-controlled and applied in production.

### Apply Migrations in Production

```bash
npx prisma migrate deploy
```

Runs all pending migrations. Use this in CI/CD pipelines and production deployments.

### Open Prisma Studio

Visual database browser:

```bash
npx prisma studio
```

Opens at `http://localhost:5555`. Lets you view, create, edit, and delete records.

### Pull Schema from Database

Introspect an existing database and update your schema:

```bash
npx prisma db pull
```

### Reset Database

**Warning: Deletes all data!**

```bash
npx prisma migrate reset
```

Drops the database, recreates it, and runs all migrations.

### Validate Schema

Check schema syntax without running anything:

```bash
npx prisma validate
```

### Format Schema

Auto-format the schema file:

```bash
npx prisma format
```

---

## Adding a New Model

1. **Edit `prisma/schema.prisma`**:

```prisma
model Domain {
  id             String   @id @default(cuid())
  name           String
  registrar      String
  contactId      String?
  contact        Contact? @relation(fields: [contactId], references: [id])
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt

  @@map("domains")
}
```

2. **Add the relation to the existing model** (if needed):

```prisma
model Contact {
  // ... existing fields
  domains        Domain[]
}
```

3. **Generate the client**:

```bash
npx prisma generate
```

4. **Push to database** (development):

```bash
npx prisma db push
```

Or create a migration (production):

```bash
npx prisma migrate dev --name add_domains_table
```

---

## Using Prisma in API Routes

Import the singleton client and use it in your route handlers:

```typescript
import { prisma } from '@/lib/prisma'

// Find all
const contacts = await prisma.contact.findMany({
  orderBy: { createdAt: 'desc' },
})

// Find one
const contact = await prisma.contact.findUnique({
  where: { id: 'some-id' },
})

// Create
const newContact = await prisma.contact.create({
  data: {
    contactId: 'CL0001',
    name: 'John Doe',
    email: 'john@example.com',
    status: 'active',
    customFields: [],
  },
})

// Update
const updated = await prisma.contact.update({
  where: { id: 'some-id' },
  data: { name: 'Jane Doe' },
})

// Delete
await prisma.contact.delete({
  where: { id: 'some-id' },
})

// Count
const count = await prisma.contact.count()

// Filter
const activeContacts = await prisma.contact.findMany({
  where: { status: 'active' },
})

// Search
const results = await prisma.contact.findMany({
  where: {
    OR: [
      { name: { contains: 'search', mode: 'insensitive' } },
      { email: { contains: 'search', mode: 'insensitive' } },
    ],
  },
})
```

---

## Prisma 7 Specifics

This project uses Prisma 7, which has some differences from earlier versions:

### Adapter-based connections

Prisma 7 uses driver adapters instead of built-in connection handling:

```typescript
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'

const pool = new pg.Pool({ connectionString })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })
```

### Configuration in `prisma.config.ts`

Connection URLs are defined in `prisma.config.ts` (not in `schema.prisma`):

```typescript
export default defineConfig({
  datasource: {
    url: process.env["DATABASE_URL"],
    directUrl: process.env["DIRECT_URL"],
  },
});
```

### Generated output path

The client is generated to a custom path (`lib/generated/prisma/`) instead of `node_modules`. Import from:

```typescript
import { PrismaClient } from '@/lib/generated/prisma/client'
```

---

## Troubleshooting

### "Cannot find module '@/lib/generated/prisma/client'"

The Prisma client hasn't been generated yet:
```bash
npx prisma generate
```

### "PrismaClientInitializationError: Can't reach database server"

- Verify `.env` has correct DATABASE_URL
- Check that your database is running / Supabase project isn't paused
- Ensure your network can reach the database (no firewall blocking)

### "P2002: Unique constraint violation"

You're trying to create a record with a `contactId` that already exists. Generate a unique one.

### "P2025: Record not found"

The record you're trying to update or delete doesn't exist. Check the ID.

### Type errors after schema change

Regenerate the client:
```bash
npx prisma generate
```

### Migration drift / schema out of sync

```bash
npx prisma db push --force-reset   # WARNING: Drops all data
```

Or for a non-destructive fix:
```bash
npx prisma migrate dev
```

### Too many database connections in development

This is handled by the singleton pattern in `lib/prisma.ts`. If you still see issues, restart the dev server.

---

## Useful Resources

- [Prisma Documentation](https://www.prisma.io/docs)
- [Prisma 7 Migration Guide](https://www.prisma.io/docs/orm/more/upgrade-guides/upgrading-versions/upgrading-to-prisma-7)
- [Prisma + Supabase Guide](https://www.prisma.io/docs/guides/database/supabase)
- [Prisma Schema Reference](https://www.prisma.io/docs/orm/reference/prisma-schema-reference)
- [Prisma Client API](https://www.prisma.io/docs/orm/reference/prisma-client-reference)
