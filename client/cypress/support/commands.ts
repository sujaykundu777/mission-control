/// <reference types="cypress" />

/* eslint-disable @typescript-eslint/no-namespace */
declare global {
  namespace Cypress {
    interface Chainable {
      loginAsTestUser(): Chainable<void>;
    }
  }
}
/* eslint-enable @typescript-eslint/no-namespace */

Cypress.Commands.add("loginAsTestUser", () => {
  cy.task("generateNextAuthJwt", {
    email: "test@example.com",
    name: "Test User",
  }).then((jwt) => {
    cy.setCookie("authjs.session-token", jwt as string, {
      httpOnly: true,
      path: "/",
      sameSite: "lax",
    });
  });
});
