# Local Development Setup Guide

Step-by-step instructions to set up the database and seed it with dummy data so you can run the app locally.

---

## Prerequisites

- Node.js 18+
- pnpm installed (`npm install -g pnpm`)
- A Supabase account ([supabase.com](https://supabase.com))

---

## Step 1: Install Dependencies

```bash
pnpm install
```

If prompted to approve builds (for Prisma/Cypress postinstall scripts):

```bash
pnpm approve-builds
pnpm install
```

---

## Step 2:

### Local Supabase Setup

Local development with Supabase allows you to work on your projects in a self-contained environment on your local machine. Working locally has several advantages:

- Faster development: You can make changes and see results instantly without waiting for remote deployments.

- Offline work: You can continue development even without an internet connection.

- Cost-effective: Local development is free and doesn't consume your project's quota.

- Enhanced privacy: Sensitive data remains on your local machine during development.

- Easy testing: You can experiment with different configurations and features without affecting your production environment.

http://supabase.com/docs/guides/local-development?queryGroups=package-manager&package-manager=pnpm#quickstart

As a prerequisite, you must install a container runtime compatible with Docker APIs.

- Docker Desktop (macOS, Windows, Linux)

Install supabase cli:

`pnpm add supabase --save-dev --allow-build=supabase`

In your repo, initialize the Supabase project:

`pnpx supabase init`

Start the supabase project:

`pnpm supabase start`

View your local supbase instance at http://localhost:54323

```
╭──────────────────────────────────────╮
│ 🔧 Development Tools                 │
├─────────┬────────────────────────────┤
│ Studio  │ http://127.0.0.1:54323     │
│ Mailpit │ http://127.0.0.1:54324     │
│ MCP     │ http://127.0.0.1:54321/mcp │
╰─────────┴────────────────────────────╯

╭──────────────────────────────────────────────────────╮
│ 🌐 APIs                                              │
├────────────────┬─────────────────────────────────────┤
│ Project URL    │ http://127.0.0.1:54321              │
│ REST           │ http://127.0.0.1:54321/rest/v1      │
│ GraphQL        │ http://127.0.0.1:54321/graphql/v1   │
│ Edge Functions │ http://127.0.0.1:54321/functions/v1 │
╰────────────────┴─────────────────────────────────────╯

╭───────────────────────────────────────────────────────────────╮
│ ⛁ Database                                                    │
├─────┬─────────────────────────────────────────────────────────┤
│ URL │ postgresql://postgres:postgres@127.0.0.1:54322/postgres │
╰─────┴─────────────────────────────────────────────────────────╯


```

Create a env.local

```
# Local Supabase

DATABASE_URL="postgresql://postgres:postgres@127.0.0.1:54322/postgres"


```

### On Cloud (supabase.com)

Create a Supabase Project

1. Go to [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Click **"New Project"**
3. Set a **database password** (save it — you'll need it below)
4. Choose a region close to you
5. Wait ~2 minutes for provisioning

---

## Step 3: Configure Environment Variables

Copy `.env` and fill in your credentials:

```bash
cp .env .env.local
```

Edit `.env` (or `.env.local`) with your Supabase values:

```bash
# Supabase PostgreSQL — get from: Project Settings > Database > Connection string > URI tab

# Pooled connection (port 6543) — used by the app at runtime
DATABASE_URL="postgresql://postgres.[YOUR-PROJECT-REF]:[YOUR-PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true"

# Direct connection (port 5432) — used by Prisma for migrations/schema push
DIRECT_URL="postgresql://postgres.[YOUR-PROJECT-REF]:[YOUR-PASSWORD]@aws-0-[REGION].pooler.supabase.com:5432/postgres"

# NextAuth — generate secret with: openssl rand -base64 32
NEXTAUTH_SECRET="your-generated-secret-here"
NEXTAUTH_URL="http://localhost:3000"

# Resend (optional — only needed for password reset emails)
RESEND_API_KEY="re_your_resend_api_key"

# Mistral AI (optional — only needed for contact summary feature)
MISTRAL_API_KEY="your-mistral-api-key"
```

**Where to find your Supabase values:**

- **Project ref:** Project Settings → General → Reference ID
- **Password:** The one you set when creating the project
- **Region:** Visible in the connection string (e.g., `us-east-1`, `ap-south-1`)

---

## Step 4: Generate the Prisma Client

```bash
pnpm db:generate
```

This creates the TypeScript client at `lib/generated/prisma/` based on your schema.

---

## Step 5: Push the Schema to Your Database

```bash
pnpm db:push
```

This creates all the tables in your Supabase PostgreSQL database:

- `users` — Authentication accounts
- `accounts` — OAuth provider accounts
- `sessions` — Session records
- `verification_tokens` — Email verification
- `password_reset_tokens` — Password reset flow
- `contacts` — CRM contacts

You should see: `Your database is now in sync with your Prisma schema.`

---

## Step 6: Seed Dummy Data

```bash
pnpm db:seed
```

This creates a test superadmin user:

| Field    | Value              |
| -------- | ------------------ |
| Email    | `test@example.com` |
| Password | `password123`      |
| Role     | `superadmin`       |
| Name     | `Test User`        |

---

## Step 7: Start the Dev Server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) — you'll be redirected to the login page.

---

## Step 8: Login

Use the seeded credentials:

- **Email:** `test@example.com`
- **Password:** `password123`

After login you'll land on the Dashboard with full access including the Admin panel.

---

## Quick Reference — All Commands

| Command                    | Description                                      |
| -------------------------- | ------------------------------------------------ |
| `pnpm install`             | Install dependencies                             |
| `pnpm db:generate`         | Regenerate Prisma client after schema changes    |
| `pnpm db:push`             | Push schema to database (creates/updates tables) |
| `pnpm db:seed`             | Seed the database with dummy test user           |
| `pnpm dev`                 | Start dev server at localhost:3000               |
| `npx prisma studio`        | Open visual database browser at localhost:5555   |
| `npx prisma migrate reset` | Reset database (drops all data + re-applies)     |

---

## Database Schema Overview

```
┌──────────────────────┐     ┌──────────────────────┐
│ users                │     │ contacts             │
├──────────────────────┤     ├──────────────────────┤
│ id (PK)              │     │ id (PK)              │
│ name                 │     │ contactId (unique)   │
│ email (unique)       │     │ name                 │
│ password (hashed)    │     │ email                │
│ role (user/superadmin)│    │ phone, company, etc. │
│ createdAt            │     │ status               │
│ updatedAt            │     │ customFields (JSON)  │
└──────────────────────┘     │ createdAt, updatedAt │
         │                   └──────────────────────┘
         │ 1:N
         ▼
┌──────────────────────┐
│ accounts             │
│ sessions             │
│ password_reset_tokens│
│ verification_tokens  │
└──────────────────────┘
```

---

## Troubleshooting

### "Can't reach database server"

- Verify your `DATABASE_URL` and `DIRECT_URL` in `.env`
- Check that your Supabase project is active (not paused)
- Ensure port 5432 and 6543 aren't blocked by your network

### "Password authentication failed"

- Double-check your database password in the connection string
- Reset it: Supabase → Project Settings → Database → Reset password

### "Cannot find module '@/lib/generated/prisma/client'"

```bash
pnpm db:generate
```

### "relation does not exist" errors at runtime

```bash
pnpm db:push
```

### "Invalid email or password" on login

The test user hasn't been seeded:

```bash
pnpm db:seed
```

### Prisma postinstall not running

```bash
pnpm approve-builds
pnpm install
pnpm db:generate
```

---

## Adding More Seed Data

Edit `prisma/seed.ts` to add more dummy data. Example — adding a regular user:

```typescript
await prisma.user.upsert({
  where: { email: "user@example.com" },
  update: {},
  create: {
    name: "Regular User",
    email: "user@example.com",
    password: await bcrypt.hash("password123", 12),
    role: "user",
  },
});
```

Then re-run:

```bash
pnpm db:seed
```

---

## Resetting Everything

If you need a completely fresh start:

```bash
npx prisma migrate reset    # Drops and recreates all tables
pnpm db:seed                # Re-seed dummy data
```

> **Warning:** This deletes ALL data in your database.
