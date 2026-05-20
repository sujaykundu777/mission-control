import "fake-indexeddb/auto";
import "@testing-library/jest-dom/vitest";

// Create toast spies that tests can assert on
export const toastSpies = {
  success: vi.fn(),
  error: vi.fn(),
  warning: vi.fn(),
  info: vi.fn(),
};

// Mock sonner
vi.mock("sonner", () => ({
  toast: {
    success: toastSpies.success,
    error: toastSpies.error,
    warning: toastSpies.warning,
    info: toastSpies.info,
  },
}));
