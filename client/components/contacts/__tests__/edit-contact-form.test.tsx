import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { EditContactForm } from "@/components/contacts/edit-contact-form";
import "@testing-library/jest-dom";
import { toastSpies } from "@/lib/__tests__/setup";

const mockPush = vi.fn();
const mockRouter = { push: mockPush, back: vi.fn(), prefetch: vi.fn() };
const mockParams = { id: "contact-1" };
vi.mock("next/navigation", () => ({
  useRouter: () => mockRouter,
  useParams: () => mockParams,
  usePathname: () => "/contacts/contact-1/edit",
}));

const sampleContact = {
  id: "contact-1",
  contactId: "CL0001",
  name: "Jane Smith",
  email: "jane@example.com",
  phone: "+11234567890",
  status: "active" as const,
  martialStatus: "Single" as const,
  customFields: [],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

vi.mock("@/lib/storage", () => ({
  storage: {
    getContactById: vi.fn(async () => sampleContact),
    updateContact: vi.fn(async () => undefined),
    deleteContact: vi.fn(async () => undefined),
    getContactDomains: vi.fn(() => []),
    disassociateDomainFromClient: vi.fn(),
  },
}));

beforeEach(() => {
  mockPush.mockClear();
  toastSpies.success.mockClear();
  toastSpies.error.mockClear();
  toastSpies.warning.mockClear();
  vi.spyOn(globalThis.console, "error").mockImplementation(() => {});
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("EditContactForm", () => {
  it("loads and renders the contact's existing data", async () => {
    render(<EditContactForm />);
    await waitFor(() => {
      expect(screen.getByLabelText(/^Name/i)).toHaveValue("Jane Smith");
    });
    expect(screen.getByLabelText(/^Email/i)).toHaveValue("jane@example.com");
  });

  it("renders the profile picture upload input", async () => {
    render(<EditContactForm />);
    await waitFor(() => {
      expect(screen.getByLabelText(/profile picture/i)).toBeInTheDocument();
    });
  });

  it("renders the Save and Delete buttons", async () => {
    render(<EditContactForm />);
    await waitFor(() => {
      expect(screen.getByRole("button", { name: /^save$/i })).toBeInTheDocument();
    });
    expect(screen.getByRole("button", { name: /delete/i })).toBeInTheDocument();
  });

  it("shows a warning toast when name is cleared before saving", async () => {
    const user = userEvent.setup();
    render(<EditContactForm />);

    const nameInput = (await screen.findByDisplayValue("Jane Smith")) as HTMLInputElement;
    await user.clear(nameInput);
    expect(nameInput).toHaveValue("");

    const saveButton = screen.getByRole("button", { name: /^save$/i });
    await user.click(saveButton);

    await waitFor(() => {
      expect(toastSpies.warning).toHaveBeenCalledWith("Name is a required field");
    });
  });

  it("submits updated data and navigates back to the contact detail page", async () => {
    const user = userEvent.setup();
    const { storage } = await import("@/lib/storage");
    render(<EditContactForm />);

    const nameInput = (await screen.findByDisplayValue("Jane Smith")) as HTMLInputElement;
    await user.clear(nameInput);
    await user.type(nameInput, "Jane Doe");

    const saveButton = screen.getByRole("button", { name: /^save$/i });
    await user.click(saveButton);

    await waitFor(() => {
      expect(storage.updateContact).toHaveBeenCalledWith(
        "contact-1",
        expect.objectContaining({ name: "Jane Doe" }),
      );
    });
    expect(toastSpies.success).toHaveBeenCalledWith("Contact updated successfully");
    expect(mockPush).toHaveBeenCalledWith("/contacts/contact-1");
  });
});
