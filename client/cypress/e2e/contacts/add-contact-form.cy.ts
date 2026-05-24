describe("Add Contact Form", () => {
  beforeEach(() => {
    cy.visit("/contacts/add");
    // Wait for React hydration to fully complete
    cy.get('input[placeholder="Contact name"]').should("be.visible");
    cy.wait(500);
  });

  it("renders all form sections and fields", () => {
    // Header
    cy.contains("Add New Contact").should("be.visible");
    cy.contains("Basic Information").should("be.visible");
    cy.contains("Work Information").should("be.visible");
    cy.contains("Billing Information").should("be.visible");
    cy.contains("Additional Notes").should("be.visible");
    cy.contains("Custom Fields").should("be.visible");

    // Required fields
    cy.get('input[placeholder="Contact name"]').should("be.visible");
    cy.get('input[placeholder="johndoe@gmail.com"]').should("be.visible");

    // Optional fields
    cy.get('input[placeholder="+91 9430000032"]').should("be.visible");
    cy.get('input[placeholder="Software Engineer"]').should("be.visible");
    cy.get('input[placeholder="Acme Corp"]').should("be.visible");
    cy.get('input[placeholder="Technology"]').should("be.visible");
    cy.get('input[placeholder="https://example.com"]').should("be.visible");
    cy.get('textarea[placeholder="Full billing address"]').should("be.visible");
    cy.get('input[placeholder="billing@example.com"]').should("be.visible");
    cy.get('input[placeholder="+1 (555) 000-0000"]').should("be.visible");
    cy.get('textarea[placeholder*="additional notes" i]').should("be.visible");

    // Buttons
    cy.contains("button", "Add Contact").should("be.visible");
    cy.contains("button", "Cancel").should("be.visible");
    cy.contains("button", "Add Field").should("be.visible");
  });

  it("can fill and submit the form with required fields", () => {
    cy.get('input[placeholder="Contact name"]').type("Jane Doe");
    cy.get('input[placeholder="johndoe@gmail.com"]').type("jane@example.com");

    cy.contains("button", "Add Contact").click();

    // Should navigate to the contact detail page
    cy.url().should("match", /\/contacts\/contact-/);
  });

  it("saves the contact to IndexedDB after submission", () => {
    const contactName = "IndexedDB Test User";
    const contactEmail = "indexeddb-test@example.com";

    cy.get('input[placeholder="Contact name"]').type(contactName);
    cy.get('input[placeholder="johndoe@gmail.com"]').type(contactEmail);
    cy.get('input[placeholder="+91 9430000032"]').type("+1-555-000-1111");
    cy.get('input[placeholder="Software Engineer"]').type("QA Engineer");
    cy.get('input[placeholder="Acme Corp"]').type("TestCorp");

    cy.contains("button", "Add Contact").click();

    // Wait for navigation to confirm submission completed
    cy.url().should("match", /\/contacts\/contact-/);

    // Verify the contact was saved to IndexedDB
    cy.window().then((win) => {
      return new Cypress.Promise((resolve, reject) => {
        const request = win.indexedDB.open("mission-control-db", 1);

        request.onerror = () => reject(request.error);
        request.onsuccess = () => {
          const db = request.result;
          const transaction = db.transaction("contacts", "readonly");
          const store = transaction.objectStore("contacts");
          const getAllRequest = store.getAll();

          getAllRequest.onerror = () => reject(getAllRequest.error);
          getAllRequest.onsuccess = () => {
            const contacts = getAllRequest.result;
            const savedContact = contacts.find(
              (c: any) => c.name === contactName && c.email === contactEmail,
            );

            expect(savedContact).to.not.be.undefined;
            expect(savedContact.name).to.equal(contactName);
            expect(savedContact.email).to.equal(contactEmail);
            expect(savedContact.phone).to.equal("+1-555-000-1111");
            expect(savedContact.jobTitle).to.equal("QA Engineer");
            expect(savedContact.company).to.equal("TestCorp");
            expect(savedContact.status).to.equal("active");
            expect(savedContact.id).to.match(/^contact-/);
            expect(savedContact.contactId).to.match(/^CL000/);
            expect(savedContact.createdAt).to.be.a("string");
            expect(savedContact.updatedAt).to.be.a("string");

            resolve(savedContact);
          };
        };
      });
    });
  });

  it("can fill all fields and submit", () => {
    // Required fields
    cy.get('input[placeholder="Contact name"]').type("Jane Doe");
    cy.get('input[placeholder="johndoe@gmail.com"]').type("jane@example.com");

    // Optional fields
    cy.get('input[placeholder="+91 9430000032"]').type("+1-555-123-4567");
    cy.get('input[placeholder="Software Engineer"]').type("Product Manager");
    cy.get('input[placeholder="Acme Corp"]').type("TechCo");
    cy.get('input[placeholder="Technology"]').type("SaaS");
    cy.get('input[placeholder="https://example.com"]').type("https://techco.io");
    cy.get('textarea[placeholder="Full billing address"]').type("123 Main St, City");
    cy.get('input[placeholder="billing@example.com"]').type("billing@techco.io");
    cy.get('input[placeholder="+1 (555) 000-0000"]').type("+1-555-999-0000");
    cy.get('textarea[placeholder*="additional notes" i]').type("Important client");

    cy.contains("button", "Add Contact").click();

    // Should navigate to the contact detail page
    cy.url().should("match", /\/contacts\/contact-/);
  });

  it("shows validation when required fields are empty", () => {
    // Submit without filling anything - browser native validation kicks in
    cy.contains("button", "Add Contact").click();

    // The name input has 'required' attr, so the browser prevents submission
    cy.get('input[placeholder="Contact name"]').then(($input) => {
      expect(($input[0] as HTMLInputElement).validity.valid).to.be.false;
    });

    // Should stay on the same page
    cy.url().should("include", "/contacts/add");
  });

  it("can add and remove custom fields", () => {
    // Add a custom field
    cy.contains("button", "Add Field").click();

    // Custom field inputs should appear
    cy.get('input[placeholder="Field name"]').should("have.length", 1);
    cy.get('input[placeholder="Field value"]').should("have.length", 1);

    // Fill the custom field
    cy.get('input[placeholder="Field name"]').first().type("LinkedIn");
    cy.get('input[placeholder="Field value"]').first().type("https://linkedin.com/in/jane");

    // Add another custom field
    cy.contains("button", "Add Field").click();
    cy.get('input[placeholder="Field name"]').should("have.length", 2);

    // Fill second field
    cy.get('input[placeholder="Field name"]').last().type("Twitter");
    cy.get('input[placeholder="Field value"]').last().type("@janedoe");

    // Delete the first custom field (click the trash button in the first row)
    cy.get('input[placeholder="Field name"]').first().parent().find("button").click();

    // Should now have only 1 custom field
    cy.get('input[placeholder="Field name"]').should("have.length", 1);
  });

  it("can cancel and navigate back to contacts", () => {
    cy.get('input[placeholder="Contact name"]').type("Jane Doe");

    cy.contains("button", "Cancel").click();

    cy.url().should("include", "/contacts");
    cy.url().should("not.include", "/add");
  });
});
