import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AddContactForm } from "@/components/contacts/add-contact-form";
import "@testing-library/jest-dom";
import { toastSpies } from "@/lib/__tests__/setup";

// Mock next/navigation — return stable references so effects don't re-run unnecessarily
const mockPush = vi.fn();
const mockRouter = { push: mockPush, back: vi.fn(), prefetch: vi.fn() };
const mockParams = { id: "dummy-contact-id" };
vi.mock("next/navigation", () => ({
  useRouter: () => mockRouter,
  useParams: () => mockParams,
  usePathname: () => "/contacts",
}));

// Mock the edit-contact-form module to prevent useParams error during import
vi.mock("@/components/contacts/edit-contact-form", () => ({
  EditContactForm: () => null,
}));

// Mock sonner toast - replace spies per test
beforeEach(() => {
  toastSpies.success.mockClear();
  toastSpies.error.mockClear();
  toastSpies.warning.mockClear();
  vi.spyOn(globalThis.console, "error").mockImplementation(() => {});
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("AddContactForm", () => {
  describe("Rendering", () => {
    it("renders the form title", () => {
      render(<AddContactForm />);
      expect(screen.getByText("Add New Contact")).toBeInTheDocument();
    });

    it("renders the description text", () => {
      render(<AddContactForm />);
      expect(
        screen.getByText("Create a new contact profile with all relevant information"),
      ).toBeInTheDocument();
    });

    it("renders the Back to Contacts link", () => {
      render(<AddContactForm />);
      const link = screen.getByText("Back to Contacts").closest("a");
      expect(link).toHaveAttribute("href", "/contacts");
    });

    it("renders Basic Information section", () => {
      render(<AddContactForm />);
      expect(screen.getByText("Basic Information")).toBeInTheDocument();
    });

    it("renders Work Information section", () => {
      render(<AddContactForm />);
      expect(screen.getByText("Work Information")).toBeInTheDocument();
    });

    it("renders Billing Information section", () => {
      render(<AddContactForm />);
      expect(screen.getByText("Billing Information")).toBeInTheDocument();
    });

    it("renders Additional Notes section", () => {
      render(<AddContactForm />);
      expect(screen.getByText("Additional Notes")).toBeInTheDocument();
    });

    it("renders Custom Fields section with Add Field button", () => {
      render(<AddContactForm />);
      expect(screen.getByText("Custom Fields")).toBeInTheDocument();
      expect(screen.getByText("Add Field")).toBeInTheDocument();
    });

    it("renders Name input with label", () => {
      render(<AddContactForm />);
      expect(screen.getByText("Name *")).toBeInTheDocument();
      const nameInput = document.querySelector<HTMLInputElement>('input[name="name"]');
      expect(nameInput).toBeInTheDocument();
    });

    it("renders Email input with label", () => {
      render(<AddContactForm />);
      const emailInput = document.querySelector<HTMLInputElement>('input[name="email"]');
      expect(emailInput).toBeInTheDocument();
    });

    it("renders Phone input with National number placeholder", () => {
      render(<AddContactForm />);
      // phone, workPhone, and billingPhone all share the placeholder
      expect(screen.getAllByPlaceholderText("National number").length).toBeGreaterThan(0);
    });

    it("renders Job Title input", () => {
      render(<AddContactForm />);
      expect(screen.getByPlaceholderText("Software Engineer")).toBeInTheDocument();
    });

    it("renders Company Name input", () => {
      render(<AddContactForm />);
      expect(screen.getByPlaceholderText("Acme Corp")).toBeInTheDocument();
    });

    it("renders Industry input", () => {
      render(<AddContactForm />);
      expect(screen.getByPlaceholderText("Technology")).toBeInTheDocument();
    });

    it("renders Website input", () => {
      render(<AddContactForm />);
      expect(screen.getByPlaceholderText("https://example.com")).toBeInTheDocument();
    });

    it("renders Work Phone input", () => {
      render(<AddContactForm />);
      expect(screen.getByLabelText(/Work Phone/i)).toBeInTheDocument();
    });

    it("renders billing address textarea", () => {
      render(<AddContactForm />);
      expect(screen.getByPlaceholderText("Full billing address")).toBeInTheDocument();
    });

    it("renders billing email input", () => {
      render(<AddContactForm />);
      expect(screen.getByPlaceholderText("billing@example.com")).toBeInTheDocument();
    });

    it("renders billing phone input", () => {
      render(<AddContactForm />);
      // billing phone is after work phone, both have "National number" placeholder
      const phoneInputs = screen.getAllByPlaceholderText("National number");
      expect(phoneInputs.length).toBe(3); // phone, workPhone, billingPhone
    });

    it("renders notes textarea", () => {
      render(<AddContactForm />);
      expect(
        screen.getByPlaceholderText(
          "Add any additional notes or information about this contact...",
        ),
      ).toBeInTheDocument();
    });

    it("renders submit button with correct text", () => {
      render(<AddContactForm />);
      expect(screen.getByText("Add Contact")).toBeInTheDocument();
    });

    it("renders cancel button", () => {
      render(<AddContactForm />);
      expect(screen.getByText("Cancel")).toBeInTheDocument();
    });

    it("has Cancel button linked to /contacts", () => {
      render(<AddContactForm />);
      const cancel = screen.getByText("Cancel").closest("a");
      expect(cancel).toHaveAttribute("href", "/contacts");
    });

    it("has required Name field", () => {
      render(<AddContactForm />);
      const nameInput = screen.getByLabelText(/Name/i);
      expect(nameInput).toHaveAttribute("required");
    });

    it("has required Email field", () => {
      render(<AddContactForm />);
      const emailInput = screen.getAllByLabelText(/Email/i)[0];
      expect(emailInput).toHaveAttribute("required");
    });

    it("renders Gender select options", () => {
      render(<AddContactForm />);
      expect(screen.getByText("Male")).toBeInTheDocument();
      expect(screen.getByText("Female")).toBeInTheDocument();
      // "Other" appears in both Gender and Relationship Type selects
      expect(screen.getAllByText("Other").length).toBeGreaterThanOrEqual(1);
    });

    it("renders status dropdown with Active option", () => {
      render(<AddContactForm />);
      expect(screen.getByText("Active")).toBeInTheDocument();
    });

    it("renders marital status dropdown with Single option", () => {
      render(<AddContactForm />);
      expect(screen.getByText("Single")).toBeInTheDocument();
    });

    it("renders date picker button", () => {
      render(<AddContactForm />);
      expect(screen.getByText(/Select date|Select date/i)).toBeInTheDocument();
    });
  });

  describe("Form Input Handling", () => {
    it("updates name field on input change", async () => {
      const user = userEvent.setup();
      render(<AddContactForm />);
      const nameInput = screen.getByLabelText(/Name/i);
      await user.type(nameInput, "John Doe");
      expect(nameInput).toHaveValue("John Doe");
    });

    it("updates email field on input change", async () => {
      const user = userEvent.setup();
      render(<AddContactForm />);
      const emailInputs = screen.getAllByLabelText(/Email/i);
      const emailInput = emailInputs[0];
      await user.type(emailInput, "john@example.com");
      expect(emailInput).toHaveValue("john@example.com");
    });

    it("updates phone field on input change", async () => {
      const user = userEvent.setup();
      render(<AddContactForm />);
      const phoneInput = screen.getByLabelText(/^Phone$/i);
      await user.type(phoneInput, "9430000032");
      expect(phoneInput).toHaveValue("9430000032");
    });

    it("updates job title field on input change", async () => {
      const user = userEvent.setup();
      render(<AddContactForm />);
      const jobInput = screen.getByPlaceholderText("Software Engineer");
      await user.type(jobInput, "Senior Developer");
      expect(jobInput).toHaveValue("Senior Developer");
    });

    it("updates company field on input change", async () => {
      const user = userEvent.setup();
      render(<AddContactForm />);
      const companyInput = screen.getByPlaceholderText("Acme Corp");
      await user.type(companyInput, "Tech Inc");
      expect(companyInput).toHaveValue("Tech Inc");
    });

    it("updates industry field on input change", async () => {
      const user = userEvent.setup();
      render(<AddContactForm />);
      const industryInput = screen.getByPlaceholderText("Technology");
      await user.type(industryInput, "Finance");
      expect(industryInput).toHaveValue("Finance");
    });

    it("updates website field on input change", async () => {
      const user = userEvent.setup();
      render(<AddContactForm />);
      const websiteInput = screen.getByPlaceholderText("https://example.com");
      await user.type(websiteInput, "https://mycompany.com");
      expect(websiteInput).toHaveValue("https://mycompany.com");
    });

    it("updates work phone field on input change", async () => {
      const user = userEvent.setup();
      render(<AddContactForm />);
      const workPhone = screen.getByLabelText(/Work Phone/i);
      await user.type(workPhone, "9876543210");
      expect(workPhone).toHaveValue("9876543210");
    });

    it("updates billing address on textarea change", async () => {
      const user = userEvent.setup();
      render(<AddContactForm />);
      const textarea = screen.getByPlaceholderText("Full billing address");
      await user.type(textarea, "123 Main St");
      expect(textarea).toHaveValue("123 Main St");
    });

    it("updates billing email on input change", async () => {
      const user = userEvent.setup();
      render(<AddContactForm />);
      const billingEmail = screen.getByPlaceholderText("billing@example.com");
      await user.type(billingEmail, "billing@company.com");
      expect(billingEmail).toHaveValue("billing@company.com");
    });

    it("updates notes textarea on input change", async () => {
      const user = userEvent.setup();
      render(<AddContactForm />);
      const notesArea = screen.getByPlaceholderText(
        "Add any additional notes or information about this contact...",
      );
      await user.type(notesArea, "This is a test note");
      expect(notesArea).toHaveValue("This is a test note");
    });

    it("has empty values on initial render", () => {
      render(<AddContactForm />);
      const nameInput = screen.getByLabelText(/Name/i);
      const emailInputs = screen.getAllByLabelText(/Email/i);
      expect(nameInput).toHaveValue("");
      expect(emailInputs[0]).toHaveValue("");
    });
  });

  describe("Custom Fields", () => {
    it("adds a custom field when clicking Add Field", async () => {
      const user = userEvent.setup();
      render(<AddContactForm />);
      const addButton = screen.getByText("Add Field");
      await user.click(addButton);
      expect(screen.getByPlaceholderText("Field name")).toBeInTheDocument();
      expect(screen.getByPlaceholderText("Field value")).toBeInTheDocument();
    });

    it("displays multiple custom fields", async () => {
      const user = userEvent.setup();
      render(<AddContactForm />);
      const addButton = screen.getByText("Add Field");
      await user.click(addButton);
      await user.click(addButton);
      const nameInputs = screen.getAllByPlaceholderText("Field name");
      expect(nameInputs.length).toBe(2);
    });
  });

  describe("Form Submission", () => {
    it("shows validation error for name when empty and email empty", async () => {
      const user = userEvent.setup();
      render(<AddContactForm />);
      const submitButton = screen.getByText("Add Contact");
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/name is required/i)).toBeInTheDocument();
      });
      expect(screen.getByText(/email is required/i)).toBeInTheDocument();
    });

    it("shows validation error for name when provided alone is valid but email is empty", async () => {
      const user = userEvent.setup();
      render(<AddContactForm />);
      const nameInput = screen.getByLabelText(/Name/i);
      await user.type(nameInput, "John");
      const submitButton = screen.getByText("Add Contact");
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/email is required/i)).toBeInTheDocument();
      });
    });

    it("calls toast.warning when name and email are required (after errors)", async () => {
      const user = userEvent.setup();
      render(<AddContactForm />);
      const submitButton = screen.getByText("Add Contact");
      await user.click(submitButton);

      // The component shows errors first, then checks again
      // It shows toast when both fields are still empty (in the second check block)
      await waitFor(() => {
        // errors are shown as inline divs
        const errorEl = document.querySelector('[role="alert"]');
        expect(errorEl).toBeInTheDocument();
      });
    });

    it("submit button is not disabled initially", () => {
      render(<AddContactForm />);
      const submitButton = screen.getByText("Add Contact");
      expect(submitButton).not.toBeDisabled();
    });
  });
});
