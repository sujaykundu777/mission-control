import { describe, it, expect, beforeAll } from "vitest";
import {
  initDB,
  getFromDB,
  getAllFromDB,
  saveToDB,
  deleteFromDB,
  clearStore,
  DB_STORES,
} from "../indexeddb";

describe("indexeddb", () => {
  // Clear store before running tests
  beforeAll(async () => {
    await initDB();
    await clearStore(DB_STORES.DOMAINS);
    await clearStore(DB_STORES.SETTINGS);
  });

  describe("initDB", () => {
    it("should initialize and return a database connection", async () => {
      const db = await initDB();
      expect(db).toBeDefined();
      expect(db.name).toBe("mission-control-db");
      expect(db.version).toBe(1);
    });

    it("should create domains and settings object stores", async () => {
      const db = await initDB();
      expect(db.objectStoreNames.contains("domains")).toBe(true);
      expect(db.objectStoreNames.contains("settings")).toBe(true);
    });

    it("should return the same instance on subsequent calls", async () => {
      const db1 = await initDB();
      const db2 = await initDB();
      expect(db1).toBe(db2);
    });
  });

  describe("saveToDB and getFromDB", () => {
    it("should save and retrieve data from domains store", async () => {
      const testDomain = {
        id: "test-save-get",
        name: "example.com",
        registrar: "GoDaddy",
        status: "active",
      };

      await saveToDB(DB_STORES.DOMAINS, testDomain);
      const result = await getFromDB(DB_STORES.DOMAINS, "test-save-get");

      expect(result).toEqual(testDomain);

      // Cleanup
      await deleteFromDB(DB_STORES.DOMAINS, "test-save-get");
    });

    it("should save and retrieve data from settings store", async () => {
      const testSetting = {
        key: "test-theme",
        value: "dark",
      };

      await saveToDB(DB_STORES.SETTINGS, testSetting);
      const result = await getFromDB(DB_STORES.SETTINGS, "test-theme");

      expect(result).toEqual(testSetting);

      // Cleanup
      await deleteFromDB(DB_STORES.SETTINGS, "test-theme");
    });

    it("should return undefined for non-existent key", async () => {
      const result = await getFromDB(DB_STORES.DOMAINS, "non-existent-key");
      expect(result).toBeUndefined();
    });

    it("should update existing data with put", async () => {
      const domain = { id: "update-test-id", name: "old.com" };
      await saveToDB(DB_STORES.DOMAINS, domain);

      const updatedDomain = { id: "update-test-id", name: "new.com" };
      await saveToDB(DB_STORES.DOMAINS, updatedDomain);

      const result = await getFromDB(DB_STORES.DOMAINS, "update-test-id");
      expect(result).toEqual(updatedDomain);

      // Cleanup
      await deleteFromDB(DB_STORES.DOMAINS, "update-test-id");
    });
  });

  describe("getAllFromDB", () => {
    it("should return all items from a store", async () => {
      // Clear first
      await clearStore(DB_STORES.DOMAINS);

      const domains = [
        { id: "all-1", name: "one.com" },
        { id: "all-2", name: "two.com" },
        { id: "all-3", name: "three.com" },
      ];

      for (const domain of domains) {
        await saveToDB(DB_STORES.DOMAINS, domain);
      }

      const result = await getAllFromDB(DB_STORES.DOMAINS);
      expect(result).toHaveLength(3);
      expect(result).toEqual(expect.arrayContaining(domains));

      // Cleanup
      await clearStore(DB_STORES.DOMAINS);
    });

    it("should return empty array for empty store", async () => {
      await clearStore(DB_STORES.DOMAINS);
      const result = await getAllFromDB(DB_STORES.DOMAINS);
      expect(result).toEqual([]);
    });
  });

  describe("deleteFromDB", () => {
    it("should delete an item from the store", async () => {
      const domain = { id: "delete-test-id", name: "delete.com" };
      await saveToDB(DB_STORES.DOMAINS, domain);

      await deleteFromDB(DB_STORES.DOMAINS, "delete-test-id");
      const result = await getFromDB(DB_STORES.DOMAINS, "delete-test-id");

      expect(result).toBeUndefined();
    });

    it("should not throw when deleting non-existent key", async () => {
      await expect(deleteFromDB(DB_STORES.DOMAINS, "non-existent-delete")).resolves.not.toThrow();
    });
  });

  describe("clearStore", () => {
    it("should remove all items from a store", async () => {
      const domains = [
        { id: "clear-1", name: "one.com" },
        { id: "clear-2", name: "two.com" },
      ];

      for (const domain of domains) {
        await saveToDB(DB_STORES.DOMAINS, domain);
      }

      await clearStore(DB_STORES.DOMAINS);
      const result = await getAllFromDB(DB_STORES.DOMAINS);

      expect(result).toEqual([]);
    });
  });

  describe("DB_STORES", () => {
    it("should export correct store names", () => {
      expect(DB_STORES.DOMAINS).toBe("domains");
      expect(DB_STORES.SETTINGS).toBe("settings");
    });
  });
});
