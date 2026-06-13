# Mission Control

Building a PWA, offline-first app For Freelancers 


Features Roadmap:

- Contacts Manager (in progress)
- Drag and drop Pipeline for sales
- Clients
- Projects Tracking
- Time Tracking
- Proposals, Contracts, Estimates
- Invoicing & Payments


Tech :
- Next.JS (app router with SSR)
- React 19 
- Vitest for tests
- IndexedDB
- Sync Queues
- Background Sync
- Backend with Supabase REST
- React Query Orchestration
- Clerk for Authentication
- Resend for Emails
- Docker 

Ref:
https://www.wellally.tech/blog/build-offline-first-pwa-nextjs-indexeddb
https://oluwadaprof.medium.com/building-an-offline-first-pwa-notes-app-with-next-js-indexeddb-and-supabase-f861aa3a06f9 
https://benmukebo.medium.com/build-an-offline-ready-pwa-with-next-js-14-using-ducanh2912-next-pwa-17851765fa6b
https://github.com/oluwadaprof/pullus-note

Local AI:

```sh
ollama pull qwen3-coder
ollama launch opencode --model qwen3-coder
```

```sh
ollama pull gpt-oss:20b
ollama launch opencode --model gpt-oss:20b
```
Future vision:

👉 Control panel + finance tracker + infra dashboard + automation hub for freelancers, agencies, and indie devs.
👉 “Single source of truth for developer infra + recurring costs.”

“Developer Business OS”
“Infra + Finance Control Panel for Web Devs”
“Mission Control for Freelancers”

🧠 Core Vision — Dev Business OS

“Where is my money, infrastructure, clients, and subscriptions — all in one place?”

### Run the App Locally:

##### Tech Stack :
- Next.JS
- IndexDB 
- Vitest
- Docker

1. Using Docker 

**Dockerfile**: Uses a multi-stage build with Node.js 20 Alpine for a lightweight production image. The builder stage compiles your Next.js app, and the runtime stage includes only production dependencies for optimal image size.

**docker-compose.yml**: Orchestrates running your containerized app with port 3000 exposed, automatic restarts, and a health check to ensure the service is running properly.

**.dockerignore**: Prevents unnecessary files from being copied into the Docker image, reducing build time and image size.

To run the app with Docker, simply execute `docker-compose up --build` in your project directory. The application will be available at [http://localhost:3000](http://localhost:3000) with all data persisting in your browser's localStorage as before.

To use it: Run `docker-compose up --build` for production, or `docker-compose -f docker-compose.yml -f docker-compose.dev.yml up` for development. The app will be accessible at [http://localhost:3000](http://localhost:3000).

# Usage:

Run in development locally
```sh
docker-compose -f docker-compose.dev.yml down -v
docker-compose -f docker-compose.dev.yml up --build
```
Run in production locally
```sh
docker-compose -f docker-compose.yml down -v
docker-compose -f docker-compose.yml up --build
```

### In Progress
Before:

User says:

“I forget what domains/hosting I own and when I’m paying for them.”

Outcome/After :

User says:

👉 “Finally, I know what I’m paying for.”

### Features to build:

✅ Client Management
✅ Domain tracker
✅ Hosting/subscription tracker
✅ Renewal alerts
✅ Expense dashboard
✅ Client tagging

Tech stack:
	•	Frontend → Next.js dashboard
	•	DB → PostgreSQL
	•	Auth → Email/password
	•	Cron → Renewal alerts
    •   Docker

You know it’s working when users:

✅ Add 5+ domains
✅ Track monthly expenses
✅ Return for renewal alerts

### Phase 1 :

✅ Feature 0 — Client Management 

Admin can manage or onboard clients

- Add Clients
- Edit Clients
- Delete Clients
- View all Clients
- Client filters
- Associate Domains 
- Import clients via CSV
- Import clients via JSON
- Export clients (CSV)
- Client Summary via AI

Todo: 

- Add Validations using Yup and Zod (in progress)
- Add supabase database with prisma orm
- Need to write test cases in Jest
- Configure Playwright
- Configure Eslint 
- Configure prettier
- Configure husky
- Configure Authentication using Nextauth and email credentials


✅ Feature 1 — Domain Inventory Tracker

Core MVP pillar.

User can:
	•	Add domains manually
	•	Registrar name
	•	Renewal date
	•	Renewal cost
	•	Auto reminder flags
	•	Client association

Dashboard shows:
	•	Upcoming renewals
	•	Total domain cost/month

✅ Feature 2 — Hosting & Subscription Tracker

Generic tracker for:
	•	VPS
	•	SaaS tools
	•	APIs

Fields:
	•	Provider
	•	Monthly/yearly cost
	•	Renewal date
	•	Notes

Example providers users might track:
	•	DigitalOcean
	•	Vercel
	•	Cloudflare

Dashboard:
	•	Monthly burn rate
	•	Upcoming payments

⸻

✅ Feature 3 — Renewal Alert Engine

Simple but powerful:
	•	Email reminder
	•	Dashboard alert
	•	Renewal countdown

This creates habit + stickiness.

⸻

✅ Feature 4 — Expense Dashboard

Visual summary:
	•	Total infra cost/month
	•	Domain vs hosting breakdown
	•	Upcoming renewal calendar

No fancy analytics yet — just clarity.

⸻

✅ Feature 5 — Client Tagging

Let users:
	•	Assign domains/subscriptions to clients
	•	See cost per client

Huge win for freelancers.

### Phase 2

✅ Auto Renewal Intelligence
	•	Renewal priority alerts
	•	Risk scoring
	•	Expired asset warnings

⸻

✅ Basic Analytics
	•	Monthly spending trends
	•	Cost by provider
	•	Client profitability view

⸻

✅ Provider Templates

Quick add buttons:
	•	AWS
	•	Supabase
	•	Namecheap

Speeds onboarding.

⸻

✅ Notes + Credential Vault (Lite)

Store:
	•	Domain login notes
	•	Hosting credentials reference

(Not full password manager yet.)



### Roadmap

✅ Domain Manager
	•	Track all domains across registrars
	•	Renewal reminders
	•	Expiry risk alerts
	•	WHOIS snapshot
	•	DNS viewer
	•	Domain cost tracking
	•	Profit tracking (for resellers)

Advanced:
	•	Auto price comparison across registrars
	•	Domain portfolio analytics

✅ Hosting Infrastructure Dashboard

Central place to monitor:
	•	VPS servers
	•	Shared hosting
	•	Cloud accounts
	•	Expiry dates
	•	Monthly costs

Integrations:
	•	DigitalOcean
	•	Vercel
	•	Cloudflare
	•	AWS

Advanced:
	•	Server health tracking
	•	Deployment logs viewer
	•	Usage alerts

✅ Subscription Tracker

Track:
	•	Domains
	•	Hosting
	•	SaaS tools
	•	APIs

Features:
	•	Recurring billing calendar
	•	Monthly burn rate
	•	Expense categorization
	•	Renewal alerts

✅ Client Cost & Profit Dashboard

For freelancers/agencies:
	•	Client hosting cost tracking
	•	Domain resale margins
	•	Project profitability
	•	Invoice reminders

Advanced:
	•	Per-client infra profit analytics


### Dev Tool Integrations Hub

One login → multiple ecosystems.

Integrations:
	•	GitHub repos overview
	•	Supabase projects
	•	Stripe revenue tracking
	•	Namecheap domain sync

Think:

“Mission control for developer infrastructure”

### Renewal & Risk Intelligence

Developers lose money from:
	•	Expired domains
	•	Forgotten subscriptions
	•	Idle servers

Your OS becomes:

✅ Smart Alert System
	•	Renewal risk alerts
	•	Overspending warnings
	•	Duplicate subscription detection
	•	Idle resource detection

### Analytics & Insights

Make the dashboard feel like Bloomberg for devs.

Examples:
	•	Monthly infra spend trends
	•	Cost per client
	•	Tool ROI insights
	•	Domain portfolio valuation

### Automation OS

This is where it becomes magical.

Automation ideas:
	•	Domain expiry → auto-renew reminder workflow
	•	Client onboarding infra checklist
	•	Hosting setup templates
	•	Renewal calendar auto-sync

### Client Workspace System

For freelancers/agencies:
	•	Client vault
	•	Hosting credentials manager
	•	Domain inventory per client
	•	Expense attribution

### Credential & Asset Vault

Secure storage for:
	•	API keys
	•	Hosting credentials
	•	Domain registrar logins

### 🔥 Infra Profit Intelligence

“Which clients are costing you money?”

### 🔥 Domain Portfolio Growth Advisor

Suggest:
	•	Renewal priorities
	•	Pricing strategies
	•	Portfolio optimization

🔥 Dev Burn Rate Dashboard

“How much does your dev stack cost per month?”

🔥 Agency Ops Mode
	•	Team infra access
	•	Client cost sharing
	•	Permissions


hermes --resume 20260527_233038_b9a319

hermes --resume 20260527_233038_b9a319
  hermes -c "Fixing Top Navigation Component"