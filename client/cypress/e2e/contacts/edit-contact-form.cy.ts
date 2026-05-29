describe("Edit Contact Form", () => {
  const testContactId = "test-client-1";

  beforeEach(() => {
    cy.loginAsTestUser();
    cy.visit(`/contacts/${testContactId}/edit`);
    // Wait for hydration and data loading to complete
    cy.contains("Edit Contact").should("be.visible");
    cy.wait(500);
  });

  it("loads and displays the existing contact data", () => {
    // Verify form sections
    cy.contains("Basic Information").should("be.visible");
    cy.contains("Company Information").should("be.visible");
    cy.contains("Billing Information").should("be.visible");
    cy.contains("Custom Fields").should("be.visible");
    cy.contains("Associated Domains").should("be.visible");
    cy.contains("Additional Notes").should("be.visible");

    // Verify pre-filled values from TEST_CONTACT
    cy.get('input[name="name"]').should("have.value", "Ethnic Trousseau");
    cy.get('input[name="email"]').should("have.value", "info@ethnictrousseau.com");
    cy.get('input[name="phone"]').should("have.value", "+91 8368751211");
    cy.get('input[name="company"]').should("have.value", "Ethnic Trousseau");
    cy.get('input[name="industry"]').should("have.value", "Designer Boutique");
    cy.get('input[name="website"]').should("have.value", "https://ethnictrousseau.com");

    // Billing info
    cy.get('textarea[name="billingAddress"]').should("contain.value", "#87/1 K.S.R.P Road");
    cy.get('input[name="billingEmail"]').should("have.value", "info@ethnictrousseau.com");
    cy.get('input[name="billingPhone"]').should("have.value", "+91 8368751211");

    // Notes
    cy.get('textarea[name="notes"]').should(
      "have.value",
      "A Fashion Designer Boutique in Bangalore",
    );

    // Custom fields should be pre-filled
    cy.get('input[placeholder="Field name"]').first().should("have.value", "timezone");
    cy.get('input[placeholder="Field value"]').first().should("have.value", "GMT +5.30");

    // Buttons
    cy.contains("button", "Save").should("be.visible");
    cy.contains("button", "Cancel").should("be.visible");
    cy.contains("button", "Delete").should("be.visible");
  });

  it("can update contact fields and save", () => {
    // Clear and update name
    cy.get('input[name="name"]').clear().type("Updated Contact Name");
    cy.get('input[name="phone"]').clear().type("+1-999-888-7777");
    cy.get('input[name="company"]').clear().type("New Company Inc");

    // Submit the form
    cy.contains("button", "Save").click();

    // Should navigate to the contact detail page
    cy.url().should("include", `/contacts/${testContactId}`);
    cy.url().should("not.include", "/edit");
  });

  it("persists updated contact data in IndexedDB", () => {
    const updatedName = "Cypress Updated Contact";
    const updatedPhone = "+1-111-222-3333";

    // Update fields
    cy.get('input[name="name"]').clear().type(updatedName);
    cy.get('input[name="phone"]').clear().type(updatedPhone);

    // Submit the form
    cy.contains("button", "Save").click();

    // Wait for navigation
    cy.url().should("include", `/contacts/${testContactId}`);
    cy.url().should("not.include", "/edit");

    // Verify in IndexedDB
    cy.window().then((win) => {
      return new Cypress.Promise((resolve, reject) => {
        const request = win.indexedDB.open("mission-control-db", 1);

        request.onerror = () => reject(request.error);
        request.onsuccess = () => {
          const db = request.result;
          const transaction = db.transaction("contacts", "readonly");
          const store = transaction.objectStore("contacts");
          const getRequest = store.get(testContactId);

          getRequest.onerror = () => reject(getRequest.error);
          getRequest.onsuccess = () => {
            const contact = getRequest.result;

            expect(contact).to.not.be.undefined;
            expect(contact.name).to.equal(updatedName);
            expect(contact.phone).to.equal(updatedPhone);
            expect(contact.email).to.equal("info@ethnictrousseau.com");
            expect(contact.updatedAt).to.be.a("string");

            resolve(contact);
          };
        };
      });
    });
  });

  it("can add and remove custom fields", () => {
    // Should already have 2 custom fields from test data
    cy.get('input[placeholder="Field name"]').should("have.length", 2);

    // Add a new custom field
    cy.contains("button", "Add Field").click();
    cy.get('input[placeholder="Field name"]').should("have.length", 3);

    // Fill the new field
    cy.get('input[placeholder="Field name"]').last().type("LinkedIn");
    cy.get('input[placeholder="Field value"]').last().type("https://linkedin.com/in/test");

    // Remove the first custom field
    cy.get('input[placeholder="Field name"]').first().parent().find("button").click();

    // Should now have 2 fields
    cy.get('input[placeholder="Field name"]').should("have.length", 2);
  });

  it("shows delete confirmation dialog and can cancel", () => {
    // Click delete button
    cy.contains("button", "Delete").click();

    // Alert dialog should appear
    cy.get('[role="alertdialog"]').should("be.visible");
    cy.get('[role="alertdialog"]').contains("Delete Contact").should("be.visible");
    cy.get('[role="alertdialog"]')
      .contains("Are you sure you want to delete this contact?")
      .should("be.visible");

    // Cancel the delete (use force since dialog locks body pointer-events)
    cy.get('[role="alertdialog"]').contains("button", "Cancel").click({ force: true });

    // Should still be on edit page
    cy.url().should("include", "/edit");
  });

  it("can cancel editing and go back", () => {
    // Make some changes
    cy.get('input[name="name"]').clear().type("Should Not Save");

    // Click cancel
    cy.contains("a", "Cancel").click();

    // Should navigate to contact detail page
    cy.url().should("include", `/contacts/${testContactId}`);
    cy.url().should("not.include", "/edit");
  });

  it("validates that name is required", () => {
    // Clear the name field
    cy.get('input[name="name"]').clear();

    // Try to submit - use the "Save Changes" button at the bottom
    cy.get('button[type="submit"]').last().click();

    // Browser native validation should prevent submission
    cy.get('input[name="name"]').then(($input) => {
      expect(($input[0] as HTMLInputElement).validity.valid).to.be.false;
    });

    // Should stay on edit page
    cy.url().should("include", "/edit");
  });

  it("redirects to contacts list if contact not found", () => {
    cy.visit("/contacts/non-existent-id/edit");

    // Should redirect to contacts list
    cy.url().should("eq", Cypress.config().baseUrl + "/contacts");
  });

  // Delete test should run last since it removes the test contact
  it("can delete a contact", () => {
    // Click delete button
    cy.contains("button", "Delete").click();

    // Confirm the delete in the dialog
    cy.get('[role="alertdialog"]').contains("button", "Delete").click({ force: true });

    // Should navigate to contacts list
    cy.url().should("eq", Cypress.config().baseUrl + "/contacts");
  });
});
