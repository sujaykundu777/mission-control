describe("Contact Detail Page", () => {
  const testContactId = "test-client-1";

  beforeEach(() => {
    cy.loginAsTestUser();
    cy.visit(`/contacts/${testContactId}`);
    cy.contains("Ethnic Trousseau").should("be.visible");
    cy.wait(500);
  });

  it("displays contact name and status", () => {
    cy.get("h1").should("contain.text", "Ethnic Trousseau");
    cy.contains("Active").should("be.visible");
    cy.contains("CN-001").should("be.visible");
  });

  it("displays back button and edit button", () => {
    cy.contains("Back to Contacts").should("be.visible");
    cy.contains("button", "Edit").should("be.visible");
  });

  it("shows the overview tab by default with contact information", () => {
    // Contact information card
    cy.contains("info@ethnictrousseau.com").should("be.visible");
    cy.contains("+91 8368751211").should("be.visible");
  });

  it("displays company information", () => {
    cy.contains("Ethnic Trousseau").should("be.visible");
    cy.contains("Designer Boutique").should("be.visible");
  });

  it("displays billing information", () => {
    cy.contains("#87/1 K.S.R.P Road").should("be.visible");
  });

  it("displays custom fields", () => {
    cy.contains("timezone").should("be.visible");
    cy.contains("GMT +5.30").should("be.visible");
    cy.contains("currency").should("be.visible");
    cy.contains("Rupees").should("be.visible");
  });

  it("can switch to Notes tab", () => {
    cy.contains("button", "Notes").click();
    cy.contains("A Fashion Designer Boutique in Bangalore").should("be.visible");
  });

  it("can switch to Subscriptions tab", () => {
    cy.contains("button", "Subscriptions").click();
    cy.contains("Associated Domains").should("be.visible");
  });

  it("can switch to Other tab and shows metadata", () => {
    cy.contains("button", "Other").click();
    cy.contains("Created").should("be.visible");
    cy.contains("Last Updated").should("be.visible");
  });

  it("has a Generate Summary button", () => {
    cy.contains("Contact Summary").should("be.visible");
    cy.contains("button", "Generate Summary").should("be.visible");
  });

  it("navigates to edit page when clicking Edit", () => {
    cy.contains("button", "Edit").click();
    cy.url().should("include", `/contacts/${testContactId}/edit`);
  });

  it("navigates back to contacts list", () => {
    cy.contains("Back to Contacts").click();
    cy.url().should("eq", Cypress.config().baseUrl + "/contacts");
  });
});
