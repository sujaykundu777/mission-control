# Offline Sync

## Overview

ContactOS is meant to work offline-first: reads and writes should work with no network, and once connectivity returns, anything that happened offline should reconcile with the server automatically. This document covers what was built for that, file by file, and what's still open.

The architecture is adapted from [pullus-note](https://github.com/oluwadaprof/pullus-note), the reference implementation linked in `plan/day2.md` ("Contacts Sync Functionality"). The core idea: every write goes to IndexedDB first (optimistic), the network call is attempted opportunistically, and anything that can't reach the server is queued and replayed later - either when the browser fires an `online` event, when the Background Sync API wakes the service worker, or when someone hits "Sync now."

Contacts and domains both have this now, but they're not implemented identically - see [Contacts vs. domains](#contacts-vs-domains) below for why.

---

## Architecture

```
UI component
   |
   v
storage.ts  ---optimistic write--->  IndexedDB (lib/indexeddb.ts)
   |
   |--- online? --- yes ---> api client (contacts-client.ts / domains-client.ts) ---> /api/contacts | /api/domains
   |                          |
   |                          success -> reconcile cache, mark synced
   |                          failure -> push to sync queue, mark failed
   |
   `--- online? --- no  ---> push to sync queue, mark pending

sync queue (IndexedDB)
   |
   v
lib/sync.ts  ---drains queue in order--->  api client  --->  server

Trigger points for draining the queue:
  - window 'online' event               (components/online-status-provider.tsx)
  - on mount, if already online          (components/online-status-provider.tsx)
  - manual "Sync now" button             (components/layout/sync-status-indicator.tsx)
  - service worker 'sync' event          (public/sw.js -> postMessage -> provider)
```

---

## What changed

### IndexedDB (`lib/indexeddb.ts`)

- Bumped `DB_VERSION` from 1 to 3.
- Added a `syncQueue` object store (v2) for queued contact operations, and a separate `domainSyncQueue` store (v3) for domains. They're kept separate rather than sharing one discriminated store, so the contacts path didn't need to change shape once it was working.
- Added helper functions scoped to each queue: `addToSyncQueue`, `getSyncQueue`, `getSyncQueueByContactId`, `removeSyncQueueItem`, `updateSyncQueueItem`, `clearSyncQueueForContact`, and the domain equivalents (`addToDomainSyncQueue`, `getDomainSyncQueue`, etc.).

### Types (`lib/types.ts`)

- `Contact.syncStatus` and `SyncQueueItem` already existed before this work started (someone had laid the groundwork).
- Added `Domain.syncStatus` and a `DomainSyncQueueItem` interface, mirroring `SyncQueueItem` but keyed by `domainId`.

### API clients

- `lib/api/contacts-client.ts` - `fetchAllContactsApi` / `createContactApi` / `updateContactApi` / `deleteContactApi`, thin wrappers around `/api/contacts`. Only forwards the fields the Prisma `Contact` model actually has - `Contact` (the client type) carries extra fields (`workEmail`, `workPhone`, `martialStatus`, `relationshipType`, `profileImage`, `address`, `summary`) that aren't in the database yet, so those stay local-only for now.
- `lib/api/domains-client.ts` - same shape, for `/api/domains`. No field mismatch here since the Prisma `Domain` model was designed to match the client type exactly.

### `lib/storage.ts`

- `addContact` / `updateContact` / `deleteContact` are `async` and network-aware: optimistic IndexedDB write, then an API call if online (queued on failure), or straight to the queue if offline. Each tags the record's `syncStatus`.
- `refreshContactsFromServer()` - reads local, fetches server list if online, merges by `updatedAt` (last-write-wins), skips server records that have a delete still queued, persists the result. Deliberately separate from `getContacts()` so the mutation methods (which call `getContacts()` internally) don't trigger a network round trip on every optimistic write.
- `addDomain` / `updateDomain` / `deleteDomain` stay **synchronous** - see [Contacts vs. domains](#contacts-vs-domains). The network call and queueing happen fire-and-forget in the background.
- `refreshDomainsFromServer()` - same idea as the contacts version, but merge is dirty-flag-only (no `updatedAt` on the client `Domain` type).
- `queueSync()` / `queueDomainSync()` - push a queue entry and register Background Sync.

### Sync engine (`lib/sync.ts`)

- `syncPendingOperations()` - drains the contact queue in timestamp order, replays each op, retries up to 3 times, then marks the contact `failed` and drops the entry.
- `syncPendingDomainOperations()` - identical shape for the domain queue.
- `syncAllPending()` - runs both and combines the counts; this is what the UI actually calls.

### Background Sync (`lib/background-sync.ts`)

- `registerBackgroundSync(tag)` registers a one-off Background Sync request (`sync-contacts` or `sync-domains`) so Chrome/Edge/Android can wake the service worker even with no tab open. Safari and Firefox don't support this API - the `online` event listener is the fallback there.

### Service worker & PWA (`public/sw.js`, `public/manifest.json`, `components/service-worker-registration.tsx`)

- Cache-first for same-origin static assets, network-first (falls back to cache) for `/api/*` GETs. Non-GET requests are ignored by the fetch handler - writes go through the sync queue, not the SW cache.
- `sync` event listener handles both `sync-contacts` and `sync-domains` tags, posting a `SYNC_QUEUES` message to all clients either way (the app decides what actually needs draining).
- `ServiceWorkerRegistration` registers `/sw.js` from the root layout, so it's active on both the marketing/auth pages and the authenticated app.
- `manifest.json` icons currently point at `public/placeholder-logo.png` at the wrong sizes - see [Open items](#open-items).

### Online status & manual sync UI

- `lib/context/online-status-context.ts` + `components/online-status-provider.tsx` - tracks `isOnline`, `pendingCount` (sum of both queues), `isSyncing`, and exposes `syncNow()`. Mounted in `components/layout/dashboard-layout.tsx`.
- `hooks/use-online-status.tsx` - context accessor hook.
- `components/layout/sync-status-indicator.tsx` - online/offline badge, pending count pill, and a manual sync button; mounted in `components/layout/top-nav.tsx`.
- Sync results surface as `sonner` toasts ("Synced N items" / "Failed to sync N items").

### Domains backend (new - didn't exist before)

- `prisma/schema.prisma` - added a `Domain` model. Nested collections (`services`, `dnsRecords`, `contactInfo`) are stored as JSON columns rather than their own tables, matching the precedent set by `Contact.customFields`. Added the inverse `domains Domain[]` relation on `Contact`.
- `prisma/migrations/20260717120000_add_domains/migration.sql` - hand-written migration SQL (this sandbox couldn't reach `binaries.prisma.sh` to run the Prisma CLI, so it wasn't generated automatically - see [Open items](#open-items)).
- `app/api/domains/route.ts` and `app/api/domains/[id]/route.ts` - GET/POST/PUT/DELETE, mirroring `app/api/contacts/`.

### Read-path wiring

- `components/contacts/all-contacts-page.tsx` and `components/domains/all-domains-page.tsx` both now paint from the local cache immediately, then call `refreshContactsFromServer()` / `refreshDomainsFromServer()` in the background and re-render with the merged result.

---

## Contacts vs. domains

The two entities aren't implemented quite the same way, and it's worth knowing why:

Contact mutations (`addContact`, `updateContact`, `deleteContact`) were already `async` before this work, so making them properly network-aware was a drop-in change.

Domain mutations (`addDomain`, `updateDomain`, `deleteDomain`) were **synchronous** functions returning `Domain[]` directly, called from roughly a dozen components that destructure the return value immediately (`edit-domain-form.tsx`, `add-service-form.tsx`, `dns-records-list.tsx`, `add-dns-form.tsx`, `domain-detail-page.tsx`, `services-list.tsx`, `add-domain-form.tsx`, plus the full `storage.test.ts` suite asserting on synchronous behavior). Converting these to `async` would have meant updating every one of those call sites and rewriting the test suite, without a way to run the app or the test suite end-to-end in this sandbox to verify nothing broke.

Instead, the domain mutations keep their exact synchronous signature - the optimistic IndexedDB write happens immediately as before, and the network call + queueing happen in a fire-and-forget `.then()/.catch()` chain in the background. The practical consequence: a component that calls `storage.addDomain(...)` gets the optimistic (unsynced) result back, and won't see the reconciled server record (synced `syncStatus`, or a temp ID swapped for the server's real ID) unless it later calls `refreshDomainsFromServer()` or the page reloads. This is a real gap, not just a style choice - see the item below.

---

## Open items

Things flagged during the build that are still outstanding, roughly in priority order:

- **Temp-ID reconciliation on create isn't wired into routing.** When a contact or domain is created offline (or the create request fails), it's stored under a temporary local ID. Once it syncs, the record gets the server's real ID - but `add-contact-form.tsx` navigates to `/contacts/${newContact.id}` using the temp ID captured before the sync resolves. If the sync completes before or during that navigation, the temp ID no longer exists in the cache. Needs either a stable local ID that's separate from the server ID, or routing that re-resolves after sync.
- **Domain mutations don't reactively update open UI after a background sync.** Per the section above - any screen showing a domain's `syncStatus` or ID won't update until `refreshDomainsFromServer()` runs again. Worth revisiting once there's bandwidth to update the ~10 call sites and the test suite together.
- **No delete tombstones / no cross-device delete propagation.** If a contact or domain is deleted on one device, another device's local cache won't know to remove it until it also deletes that record - `mergeContacts`/`mergeDomains` only guard against _resurrecting_ a delete that's still in this device's own queue, not deletes that already happened elsewhere. Would need a `deletedAt` tombstone (or a soft-delete flag) on both the server model and the client cache to do this properly.
- **Domain merge is coarser than contact merge.** `Domain` has no `updatedAt` field client-side, so `mergeDomains` can only use the `syncStatus` dirty flag, not a timestamp comparison. If two devices edit the same domain while both offline, whichever syncs first can get silently overwritten by the second. Adding `updatedAt` to the client `Domain` type (it already exists on the Prisma model) would let `mergeDomains` do real last-write-wins like `mergeContacts` does.
- **Prisma client needs regenerating.** `prisma.domain` shows a type error in `app/api/domains/*` right now because this sandbox couldn't reach `binaries.prisma.sh` to run `prisma generate`. Run `npx prisma generate` and apply the migration (`npx prisma migrate dev` or `db push`, whichever this project's workflow uses) against the local Supabase Postgres instance - the errors go away once the generated client knows about the `Domain` model.
- **Manifest icons are placeholders.** `public/manifest.json` points both icon sizes at `public/placeholder-logo.png`, which isn't actually 192x192 or 512x512. Needs real icon assets before this is installable as a proper PWA.
- **Contact API payload is missing fields.** `Contact` (client type) has `workEmail`, `workPhone`, `martialStatus`, `relationshipType`, `profileImage`, `address`, and `summary` that the Prisma `Contact` model and `/api/contacts` routes don't support yet. They're silently dropped on sync. Either extend the schema/API, or explicitly document them as local-only.
- **No retry backoff.** Both sync engines retry a failed operation immediately on the next drain, up to 3 times, with no delay between attempts. A server that's rate-limiting or briefly degraded will get hit 3 times in quick succession. Worth adding exponential backoff (e.g. skip an item until its `timestamp + backoff` has passed).
- **Sync queue has no size cap.** If a device stays offline for a long time with heavy editing, the queue can grow unbounded. Not a problem at prototype scale, but worth a sanity limit (or de-duplication of repeated edits to the same record) before this sees real usage.
- **No conflict UI.** When `syncStatus` becomes `failed` after exhausting retries, that's currently only visible as a status flag on the record - there's no surfaced "this couldn't sync, here's what happened" affordance beyond the toast at the time of failure.
- **`getSyncQueueByContactId` / `getDomainSyncQueueByDomainId` do a full-table scan.** They call `getAll()` and filter in memory rather than using an IndexedDB index. Fine at current data volumes; if queues get large, add a `by-contactId`/`by-domainId` index like the pullus-note reference does for `notes`.
- **No automated test coverage for any of this.** The new sync/merge/queue logic (`lib/sync.ts`, `mergeContacts`, `mergeDomains`, `queueSync`/`queueDomainSync`) has no unit tests yet. `lib/__tests__/indexeddb.test.ts` and `storage.test.ts` exist and use `fake-indexeddb`, but weren't extended to cover the new stores or merge behavior - do that before relying on this in production.

---

## Files touched

**New:**
`lib/api/contacts-client.ts`, `lib/api/domains-client.ts`, `lib/context/online-status-context.ts`, `components/online-status-provider.tsx`, `hooks/use-online-status.tsx`, `lib/sync.ts`, `lib/background-sync.ts`, `components/layout/sync-status-indicator.tsx`, `components/service-worker-registration.tsx`, `public/sw.js`, `public/manifest.json`, `app/api/domains/route.ts`, `app/api/domains/[id]/route.ts`, `prisma/migrations/20260717120000_add_domains/migration.sql`

**Modified:**
`lib/indexeddb.ts`, `lib/types.ts`, `lib/storage.ts`, `prisma/schema.prisma`, `app/layout.tsx`, `components/layout/dashboard-layout.tsx`, `components/layout/top-nav.tsx`, `components/contacts/all-contacts-page.tsx`, `components/domains/all-domains-page.tsx`
