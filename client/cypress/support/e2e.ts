import "./commands";

// Ignore React hydration mismatch errors from the app
// (caused by date formatting differences between server and client)
Cypress.on("uncaught:exception", (err) => {
  if (
    err.message.includes("Hydration failed") ||
    err.message.includes("hydration mismatch") ||
    // NextAuth v5 throws when the mocked callback response has a null/invalid url
    err.message.includes("Invalid URL") ||
    err.message.includes("Failed to construct 'URL'")
  ) {
    return false;
  }
});
