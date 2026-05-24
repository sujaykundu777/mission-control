# Supabase + Prisma Setup Guide

## Prerequisites

- A [Supabase](https://supabase.com) account
- Node.js 18+ installed
- This project cloned and dependencies installed (`pnpm install`)

---

## 1. Create a Supabase Project

1. Go to [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Click **"New Project"**
3. Choose your organization
4. Fill in:
   - **Project name**: `mission-control` (or your preferred name)
   - **Database password**: Generate a strong password and **save it somewhere safe**
   - **Region**: Choose the closest to your users
5. Click **"Create new project"** and wait for it to provision (~2 minutes)

---

## 2. Get Your Connection Strings

1. In your Supabase project dashboard, go to **Project Settings** → **Database**
2. Scroll to **Connection string** section
3. Select the **URI** tab
4. You'll need two URLs:

### Transaction Mode (Pooled - port 6543)

Used for your app's runtime connections via PgBouncer:

```
postgresql://postgres.[YOUR-PROJECT-REF]:[YOUR-PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true
```

### Session Mode (Direct - port 5432)

Used for migrations and schema pushes:

```
postgresql://postgres.[YOUR-PROJECT-REF]:[YOUR-PASSWORD]@aws-0-[REGION].pooler.supabase.com:5432/postgres
```

---

## 3. Configure Environment Variables

Copy the `.env.example` or update the `.env` file in the project root:

```bash
# .env

# Pooled connection (runtime - used by the app)
DATABASE_URL="postgresql://postgres.[YOUR-PROJECT-REF]:[YOUR-PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true"

# Direct connection (migrations - used by Prisma CLI)
DIRECT_URL="postgresql://postgres.[YOUR-PROJECT-REF]:[YOUR-PASSWORD]@aws-0-[REGION].pooler.supabase.com:5432/postgres"

# Mistral AI key (for contact summary feature)
MISTRAL_API_KEY="your-mistral-api-key"
```

Replace:

- `[YOUR-PROJECT-REF]` — your Supabase project reference (found in Project Settings → General)
- `[YOUR-PASSWORD]` — the database password you set when creating the project
- `[REGION]` — your project's region (e.g., `us-east-1`, `ap-south-1`)

---

## 4. Push the Schema to Supabase

This creates the `contacts` table in your Supabase PostgreSQL database:

```bash
npx prisma db push
```

You should see output like:

```
Your database is now in sync with your Prisma schema.
```

---

## 5. Verify in Supabase Dashboard

1. Go to your Supabase project → **Table Editor**
2. You should see a `contacts` table with these columns:
   - `id` (text, primary key)
   - `contactId` (text, unique)
   - `name`, `email` (text, required)
   - `phone`, `gender`, `dob`, `jobTitle`, `company`, `industry`, `website` (text, nullable)
   - `billingAddress`, `billingEmail`, `billingPhone` (text, nullable)
   - `status` (text, default: "active")
   - `customFields` (jsonb, default: [])
   - `notes`, `summary` (text, nullable)
   - `createdAt` (timestamp, auto-set)
   - `updatedAt` (timestamp, auto-updated)

---

## 6. Test the API

Start the dev server:

```bash
pnpm dev
```

### Create a contact:

```bash
curl -X POST http://localhost:3000/api/contacts \
  -H "Content-Type: application/json" \
  -d '{"name": "John Doe", "email": "john@example.com", "company": "Acme Corp"}'
```

### List all contacts:

```bash
curl http://localhost:3000/api/contacts
```

### Get a single contact:

```bash
curl http://localhost:3000/api/contacts/[CONTACT_ID]
```

### Update a contact:

```bash
curl -X PUT http://localhost:3000/api/contacts/[CONTACT_ID] \
  -H "Content-Type: application/json" \
  -d '{"name": "Jane Doe", "email": "jane@example.com", "status": "active"}'
```

### Delete a contact:

```bash
curl -X DELETE http://localhost:3000/api/contacts/[CONTACT_ID]
```

---

## 7. Common Commands

| Command                  | Description                                              |
| ------------------------ | -------------------------------------------------------- |
| `npx prisma generate`    | Regenerate the Prisma client after schema changes        |
| `npx prisma db push`     | Push schema changes to the database (no migration files) |
| `npx prisma migrate dev` | Create a migration file and apply it                     |
| `npx prisma studio`      | Open a visual database browser at localhost:5555         |
| `npx prisma db pull`     | Pull the current database schema into your Prisma schema |

---

## 8. Schema Changes

When you need to update the database schema:

1. Edit `prisma/schema.prisma`
2. Run `npx prisma generate` to update the TypeScript client
3. Run `npx prisma db push` (development) or `npx prisma migrate dev` (production-ready)

---

## Troubleshooting

### "Can't reach database server"

- Check that your Supabase project is active (not paused)
- Verify the connection string in `.env` is correct
- Ensure your IP isn't blocked (Supabase → Database → Network)

### "Password authentication failed"

- Double-check your database password in the connection string
- Reset it in Supabase → Project Settings → Database → Reset database password

### "Prisma client not generated"

```bash
npx prisma generate
```

### "relation does not exist"

The table hasn't been created yet:

```bash
npx prisma db push
```

---

## Project Structure

```
├── prisma/
│   └── schema.prisma        # Database schema definition
├── prisma.config.ts          # Prisma CLI configuration
├── lib/
│   ├── prisma.ts             # Prisma client singleton
│   └── generated/prisma/     # Auto-generated Prisma client (gitignored)
├── app/api/contacts/
│   ├── route.ts              # GET /api/contacts, POST /api/contacts
│   └── [id]/route.ts         # GET/PUT/DELETE /api/contacts/:id
└── .env                      # Database credentials (gitignored)
```
