# Authentication System

## Overview

This project uses [NextAuth.js v5](https://authjs.dev/) (Auth.js) for authentication with the following features:

- **Credentials provider** — Email/password login
- **Prisma adapter** — User data stored in Supabase PostgreSQL
- **JWT sessions** — Stateless session management
- **Protected routes** — Middleware-based route protection
- **Password reset** — Via Resend transactional emails
- **Registration** — Self-service account creation

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│ Client (Browser)                                         │
│                                                         │
│  Login Page ──► signIn("credentials") ──► NextAuth API  │
│  Register   ──► POST /api/auth/register                 │
│  Forgot PW  ──► POST /api/auth/forgot-password          │
│  Reset PW   ──► POST /api/auth/reset-password           │
└─────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────┐
│ Server (Next.js)                                         │
│                                                         │
│  middleware.ts ──► Protects all routes except /auth/*    │
│  lib/auth.ts   ──► NextAuth config + Credentials logic  │
│  lib/resend.ts ──► Resend email client                  │
└─────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────┐
│ Database (Supabase PostgreSQL via Prisma)                │
│                                                         │
│  users, accounts, sessions, verification_tokens,        │
│  password_reset_tokens                                  │
└─────────────────────────────────────────────────────────┘
```

---

## Quick Start

### 1. Environment Variables

Add these to your `.env` file:

```bash
# NextAuth (required)
NEXTAUTH_SECRET="generate-with: openssl rand -base64 32"
NEXTAUTH_URL="http://localhost:3000"

# Resend (for password reset emails)
RESEND_API_KEY="re_your_api_key_here"
```

### 2. Push Schema & Seed

```bash
npx prisma db push          # Create tables in Supabase
pnpm db:seed                # Create test user (test@example.com / password123)
```

### 3. Start Dev Server

```bash
pnpm dev
```

Visit `http://localhost:3000` — you'll be redirected to the login page.

### 4. Test Credentials

| Email | Password |
|-------|----------|
| `test@example.com` | `password123` |

---

## File Structure

```
├── lib/
│   ├── auth.ts                          # NextAuth v5 configuration
│   └── resend.ts                        # Resend email client
├── app/
│   ├── api/auth/
│   │   ├── [...nextauth]/route.ts       # NextAuth route handler
│   │   ├── register/route.ts            # POST - create account
│   │   ├── forgot-password/route.ts     # POST - send reset email
│   │   └── reset-password/route.ts      # POST - reset password with token
│   ├── auth/
│   │   ├── login/page.tsx               # Login form
│   │   ├── register/page.tsx            # Registration form
│   │   ├── forgot-password/page.tsx     # Forgot password form
│   │   └── reset-password/page.tsx      # Reset password form (with token)
│   └── profile/page.tsx                 # User profile page
├── middleware.ts                         # Route protection
└── prisma/
    ├── schema.prisma                    # User, Account, Session, etc. models
    └── seed.ts                          # Seed test user
```

---

## Auth Configuration (`lib/auth.ts`)

The auth system is configured with:

- **Credentials Provider** — Validates email/password against bcrypt-hashed passwords in the database
- **Prisma Adapter** — Stores users, accounts, sessions in Supabase via Prisma
- **JWT Strategy** — Uses JWT tokens instead of database sessions for performance
- **Authorized callback** — Handles redirect logic:
  - Unauthenticated users → redirected to `/auth/login`
  - Authenticated users on `/auth/*` → redirected to `/` (dashboard)

---

## Middleware (`middleware.ts`)

The middleware protects all routes except:
- `/auth/*` — Login, register, forgot/reset password pages
- `/api/auth/*` — NextAuth API endpoints
- `/_next/*` — Next.js static assets
- `/favicon.ico`

```typescript
export { auth as middleware } from "@/lib/auth"

export const config = {
  matcher: ["/((?!auth|api/auth|_next/static|_next/image|favicon.ico).*)"],
}
```

---

## Database Models

### User

| Field | Type | Notes |
|-------|------|-------|
| id | String | CUID primary key |
| name | String? | Display name |
| email | String | Unique |
| password | String? | Bcrypt-hashed |
| emailVerified | DateTime? | For email verification |
| image | String? | Avatar URL |
| createdAt | DateTime | Auto-set |
| updatedAt | DateTime | Auto-updated |

### PasswordResetToken

| Field | Type | Notes |
|-------|------|-------|
| id | String | CUID primary key |
| email | String | User's email |
| token | String | Unique, random 32-byte hex |
| expires | DateTime | 1 hour from creation |

---

## API Routes

### POST `/api/auth/register`

Create a new user account.

**Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepassword"
}
```

**Responses:**
- `201` — Account created
- `400` — Missing fields or password too short
- `409` — Email already exists

---

### POST `/api/auth/forgot-password`

Send a password reset email.

**Body:**
```json
{
  "email": "john@example.com"
}
```

**Response:** Always returns `200` with a generic message (prevents email enumeration).

The reset email contains a link to `/auth/reset-password?token=<token>` that expires in 1 hour.

---

### POST `/api/auth/reset-password`

Reset a user's password using a valid token.

**Body:**
```json
{
  "token": "abc123...",
  "password": "newpassword"
}
```

**Responses:**
- `200` — Password reset successfully
- `400` — Invalid/expired token or password too short

---

## Password Reset Flow

1. User clicks "Forgot password?" on login page
2. User enters email → POST `/api/auth/forgot-password`
3. Server generates a random token, stores in `password_reset_tokens` table (expires in 1 hour)
4. Server sends email via Resend with a reset link
5. User clicks link → lands on `/auth/reset-password?token=<token>`
6. User enters new password → POST `/api/auth/reset-password`
7. Server validates token, hashes new password, updates user, deletes token
8. User redirected to login

---

## Session & Client Usage

### Getting the session (client components)

```typescript
"use client"
import { useSession } from "next-auth/react"

export function MyComponent() {
  const { data: session, status } = useSession()

  if (status === "loading") return <p>Loading...</p>
  if (!session) return <p>Not authenticated</p>

  return <p>Hello, {session.user.name}</p>
}
```

### Getting the session (server components / API routes)

```typescript
import { auth } from "@/lib/auth"

export default async function Page() {
  const session = await auth()

  if (!session) redirect("/auth/login")

  return <p>Hello, {session.user.name}</p>
}
```

### Sign out

```typescript
import { signOut } from "next-auth/react"

<button onClick={() => signOut({ callbackUrl: "/auth/login" })}>
  Sign Out
</button>
```

---

## Resend Setup

1. Create a [Resend](https://resend.com) account
2. Get your API key from the dashboard
3. Add to `.env`: `RESEND_API_KEY="re_your_api_key"`

During development, you can use `onboarding@resend.dev` as the sender (Resend's test domain). For production, verify your own domain in Resend.

---

## Adding New Protected API Routes

All pages are already protected by middleware. For API routes that need auth:

```typescript
import { auth } from "@/lib/auth"

export async function GET() {
  const session = await auth()

  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }

  // Authenticated logic here
  return Response.json({ user: session.user })
}
```

---

## Troubleshooting

### "NEXTAUTH_SECRET is not set"

Generate one and add to `.env`:
```bash
openssl rand -base64 32
```

### Redirect loop on login

Make sure the matcher in `middleware.ts` excludes `/auth` paths.

### "PrismaClientInitializationError" on login

Run `npx prisma generate` and restart the dev server.

### Password reset email not received

- Check `RESEND_API_KEY` is set correctly
- Check Resend dashboard for delivery logs
- In dev, emails to non-verified addresses may be blocked — use Resend's test mode

### "Invalid email or password" with correct credentials

The test user may not exist yet. Run:
```bash
pnpm db:seed
```

---

## Admin Panel

### Overview

The admin panel is accessible at `/admin` and is restricted to users with `role: "superadmin"`. It provides user management capabilities including viewing, editing roles, and deleting users.

### Access Control

- **Route protection:** The middleware in `lib/auth.config.ts` redirects non-superadmins away from `/admin`
- **API protection:** All `/api/admin/*` routes check `session.user.role === "superadmin"` and return 403 if not authorized
- **Sidebar visibility:** The "Admin" nav link only appears for superadmin users

### User Roles

| Role | Permissions |
|------|-------------|
| `user` | Default role. Access to all standard features (Dashboard, Contacts, Domains, Profile) |
| `superadmin` | Full access including the Admin Panel. Can manage all users. |

### Admin API Routes

#### GET `/api/admin/users`
List all users (id, name, email, role, createdAt).

#### POST `/api/admin/users`
Create a new user.

**Body:**
```json
{
  "name": "New User",
  "email": "newuser@example.com",
  "password": "securepassword",
  "role": "user"
}
```

#### GET `/api/admin/users/[id]`
Get a single user by ID.

#### PUT `/api/admin/users/[id]`
Update a user's name or role.

**Body:**
```json
{
  "name": "Updated Name",
  "role": "superadmin"
}
```

**Constraints:**
- Superadmins cannot demote themselves (returns 400)

#### DELETE `/api/admin/users/[id]`
Delete a user.

**Constraints:**
- Superadmins cannot delete themselves (returns 400)

### Files

```
├── app/admin/page.tsx                        # Admin panel page
├── app/api/admin/users/route.ts              # GET (list), POST (create)
├── app/api/admin/users/[id]/route.ts         # GET, PUT, DELETE
├── components/admin/user-table.tsx           # Users data table
├── components/admin/edit-user-dialog.tsx     # Edit user dialog
└── components/admin/delete-user-dialog.tsx   # Delete confirmation
```

### Testing

1. Login as `test@example.com` / `password123` (seeded as superadmin)
2. Click "Admin" in the sidebar
3. View user list, edit roles, delete users
4. Register a new user at `/auth/register` — they won't see the Admin link

---

## Security Notes

- Passwords are hashed with bcrypt (12 rounds)
- Password reset tokens expire after 1 hour
- Forgot password endpoint prevents email enumeration (always returns success)
- JWT sessions are signed with NEXTAUTH_SECRET
- Middleware enforces auth on all non-public routes
- Admin routes enforce role-based access control (superadmin only)
- Superadmins cannot demote or delete themselves (prevents lockout)
