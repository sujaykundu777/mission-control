import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { clearStore, DB_STORES, initDB, saveToDB } from "../indexeddb";
import { Domain } from "../types";

// Mock window for SSR checks
const mockWindow = () => {
  vi.stubGlobal("window", {});
};

const removeWindow = () => {
  vi.unstubAllGlobals();
};

// Create a test domain
const createTestDomain = (overrides: Partial<Domain> = {}): Domain => ({
  id: `test-${Date.now()}-${Math.random().toString(36).substring(7)}`,
  name: "test-domain.com",
  registrar: "GoDaddy",
  purchaseDate: "2024-01-01",
  expirationDate: "2025-01-01",
  renewalPrice: 10.99,
  autoRenew: true,
  status: "active",
  services: [],
  dnsRecords: [],
  contactInfo: {
    id: "1",
    name: "Test User",
    email: "test@example.com",
  },
  ...overrides,
});

describe("storage", () => {
  beforeEach(async () => {
    vi.resetModules();
    mockWindow();

    // Clear the stores before each test
    await initDB();
    await clearStore(DB_STORES.DOMAINS);
    await clearStore(DB_STORES.SETTINGS);
  });

  afterEach(() => {
    removeWindow();
  });

  describe("getDomains", () => {
    it("should return empty array when window is undefined (SSR)", async () => {
      removeWindow();
      vi.stubGlobal("window", undefined);

      const { storage } = await import("../storage");
      const result = storage.getDomains();
      expect(result).toEqual([]);
    });

    it("should return cached domains if available", async () => {
      const { storage } = await import("../storage");

      // First call initializes cache
      storage.getDomains();

      // Add a domain via saveDomains to update cache
      const testDomain = createTestDomain({ id: "cached-domain" });
      storage.saveDomains([testDomain]);

      // Subsequent call should return cached data
      const result = storage.getDomains();
      expect(result).toContainEqual(testDomain);
    });
  });

  describe("saveDomains", () => {
    it("should do nothing when window is undefined (SSR)", async () => {
      removeWindow();
      vi.stubGlobal("window", undefined);

      const { storage } = await import("../storage");
      const testDomain = createTestDomain();

      // Should not throw
      expect(() => storage.saveDomains([testDomain])).not.toThrow();
    });

    it("should save domains and update cache", async () => {
      const { storage } = await import("../storage");
      const domain1 = createTestDomain({ id: "save-test-1", name: "domain1.com" });
      const domain2 = createTestDomain({ id: "save-test-2", name: "domain2.com" });

      storage.saveDomains([domain1, domain2]);

      const result = storage.getDomains();
      expect(result).toHaveLength(2);
      expect(result).toContainEqual(domain1);
      expect(result).toContainEqual(domain2);
    });
  });

  describe("addDomain", () => {
    it("should add a domain and return updated list", async () => {
      const { storage } = await import("../storage");

      // Initialize with empty state
      storage.saveDomains([]);

      const newDomain = createTestDomain({ id: "add-test", name: "new-domain.com" });
      const result = storage.addDomain(newDomain);

      // addDomain stamps a syncStatus on the stored domain for offline sync tracking
      expect(result).toContainEqual(expect.objectContaining({ ...newDomain }));
      expect(storage.getDomains()).toContainEqual(expect.objectContaining({ ...newDomain }));
    });

    it("should append to existing domains", async () => {
      const { storage } = await import("../storage");

      const existingDomain = createTestDomain({ id: "existing", name: "existing.com" });
      storage.saveDomains([existingDomain]);

      const newDomain = createTestDomain({ id: "new", name: "new.com" });
      const result = storage.addDomain(newDomain);

      expect(result).toHaveLength(2);
      expect(result).toContainEqual(existingDomain);
      expect(result).toContainEqual(expect.objectContaining({ ...newDomain }));
    });
  });

  describe("updateDomain", () => {
    it("should update an existing domain", async () => {
      const { storage } = await import("../storage");

      const domain = createTestDomain({ id: "update-test", name: "original.com" });
      storage.saveDomains([domain]);

      const result = storage.updateDomain("update-test", { name: "updated.com" });

      expect(result.find((d) => d.id === "update-test")?.name).toBe("updated.com");
    });

    it("should not modify domains if id not found", async () => {
      const { storage } = await import("../storage");

      const domain = createTestDomain({ id: "existing", name: "existing.com" });
      storage.saveDomains([domain]);

      const result = storage.updateDomain("non-existent", { name: "updated.com" });

      expect(result).toHaveLength(1);
      expect(result[0].name).toBe("existing.com");
    });

    it("should preserve other properties when updating", async () => {
      const { storage } = await import("../storage");

      const domain = createTestDomain({
        id: "partial-update",
        name: "original.com",
        renewalPrice: 15.99,
        status: "active",
      });
      storage.saveDomains([domain]);

      storage.updateDomain("partial-update", { name: "updated.com" });

      const updated = storage.getDomainById("partial-update");
      expect(updated?.name).toBe("updated.com");
      expect(updated?.renewalPrice).toBe(15.99);
      expect(updated?.status).toBe("active");
    });
  });

  describe("deleteDomain", () => {
    it("should delete a domain by id", async () => {
      const { storage } = await import("../storage");

      const domain1 = createTestDomain({ id: "keep", name: "keep.com" });
      const domain2 = createTestDomain({ id: "delete", name: "delete.com" });
      storage.saveDomains([domain1, domain2]);

      const result = storage.deleteDomain("delete");

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe("keep");
      expect(storage.getDomainById("delete")).toBeNull();
    });

    it("should return unchanged list if id not found", async () => {
      const { storage } = await import("../storage");

      const domain = createTestDomain({ id: "existing", name: "existing.com" });
      storage.saveDomains([domain]);

      const result = storage.deleteDomain("non-existent");

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe("existing");
    });
  });

  describe("getDomainById", () => {
    it("should return a domain by id", async () => {
      const { storage } = await import("../storage");

      const domain = createTestDomain({ id: "find-me", name: "findme.com" });
      storage.saveDomains([domain]);

      const result = storage.getDomainById("find-me");

      expect(result).toEqual(domain);
    });

    it("should return null if domain not found", async () => {
      const { storage } = await import("../storage");

      storage.saveDomains([]);

      const result = storage.getDomainById("non-existent");

      expect(result).toBeNull();
    });
  });

  describe("getStats", () => {
    it("should return correct statistics for empty domains", async () => {
      const { storage } = await import("../storage");

      storage.saveDomains([]);

      const stats = storage.getStats();

      expect(stats).toEqual({
        totalDomains: 0,
        activeDomains: 0,
        expiredDomains: 0,
        totalServices: 0,
        totalCosts: 0,
      });
    });

    it("should calculate correct statistics", async () => {
      const { storage } = await import("../storage");

      const domains: Domain[] = [
        createTestDomain({
          id: "stats-1",
          status: "active",
          services: [
            {
              id: "s1",
              name: "Hosting",
              type: "hosting",
              status: "active",
              billingCycle: "monthly",
              cost: 10,
            },
            {
              id: "s2",
              name: "SSL",
              type: "ssl",
              status: "active",
              billingCycle: "annual",
              cost: 5,
            },
          ],
        }),
        createTestDomain({
          id: "stats-2",
          status: "active",
          services: [
            {
              id: "s3",
              name: "CDN",
              type: "cdn",
              status: "active",
              billingCycle: "monthly",
              cost: 20,
            },
          ],
        }),
        createTestDomain({
          id: "stats-3",
          status: "expired",
          services: [],
        }),
      ];

      storage.saveDomains(domains);

      const stats = storage.getStats();

      expect(stats).toEqual({
        totalDomains: 3,
        activeDomains: 2,
        expiredDomains: 1,
        totalServices: 3,
        totalCosts: 35, // 10 + 5 + 20
      });
    });

    it("should count pending-renewal status separately from active/expired", async () => {
      const { storage } = await import("../storage");

      const domains: Domain[] = [
        createTestDomain({ id: "active-1", status: "active" }),
        createTestDomain({ id: "expired-1", status: "expired" }),
        createTestDomain({ id: "pending-1", status: "pending-renewal" }),
      ];

      storage.saveDomains(domains);

      const stats = storage.getStats();

      expect(stats.totalDomains).toBe(3);
      expect(stats.activeDomains).toBe(1);
      expect(stats.expiredDomains).toBe(1);
      // pending-renewal is not counted in active or expired
    });
  });
});
