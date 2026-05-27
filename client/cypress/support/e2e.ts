import "./commands";

// Ignore React hydration mismatch errors from the app
// (caused by date formatting differences between server and client)
Cypress.on("uncaught:exception", (err) => {
  if (err.message.includes("Hydration failed") || err.message.includes("hydration mismatch")) {
    return false;
  }
});
