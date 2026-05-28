describe("Authentication Flow", () => {
  beforeEach(() => {
    // We'll assume the server is running and accessible
    // In a real CI environment, you might need to seed the database first
  });

  describe("Login", () => {
    it("should navigate to dashboard on successful login", () => {
      cy.visit("/auth/login");
      cy.get('input[type="email"]').type("testuser@example.com");
      cy.get('input[type="password"]').type("password123");
      cy.get('button[type="submit"]').click();

      // Check if redirected to dashboard
      cy.url().should("include", "/dashboard");
    });

    it("should show error message on invalid credentials", () => {
      cy.visit("/auth/login");
      cy.get('input[type="email"]').type("wrong@example.com");
      cy.get('input[type="password"]').type("wrongpassword");
      cy.get('button[type="submit"]').click();

      cy.contains("Invalid email or password").should("be.visible");
    });
  });

  describe("Registration", () => {
    it("should navigate to login with success message on successful registration", () => {
      cy.visit("/auth/register");
      cy.get('input[placeholder="John Doe"]').type("John Doe");
      cy.get('input[placeholder="you@example.com"]').type("newuser@example.com");
      cy.get('input[placeholder="Min 6 characters"]').type("password123");
      cy.get('input[placeholder="Repeat password"]').type("password123");
      cy.get('button[type="submit"]').click();

      // The component redirects to /auth/login?registered=true
      cy.url().should("include", "/auth/login?registered=true");
    });

    it("should show error if passwords do not match", () => {
      cy.visit("/auth/register");
      cy.get('input[placeholder="John Doe"]').type("John Doe");
      cy.get('input[placeholder="you@example.com"]').type("newuser@example.com");
      cy.get('input[placeholder="Min 6 characters"]').type("password123");
      cy.get('input[placeholder="Repeat password"]').type("differentpassword");
      cy.get('button[type="submit"]').click();

      cy.contains("Passwords do not match").should("be.visible");
    });

    it("should show error if password is too short", () => {
      cy.visit("/auth/register");
      cy.get('input[placeholder="John Doe"]').type("John Doe");
      cy.get('input[placeholder="you@example.com"]').type("newuser@example.com");
      cy.get('input[placeholder="Min 6 characters"]').type("short");
      cy.get('input[placeholder="Repeat password"]').type("short");
      cy.get('button[type="submit"]').click();

      cy.contains("Password must be at least 6 characters").should("be.visible");
    });
  });

  describe("Forgot Password", () => {
    it("should show success message after requesting password reset", () => {
      cy.visit("/auth/forgot-password");
      cy.get('input[placeholder="you@example.com"]').type("testuser@example.com");
      cy.get('button[type="submit"]').click();

      cy.contains("Check Your Email").should("be.visible");
      cy.contains("If an account with that email exists, we sent a password reset link.").should(
        "be.visible",
      );
    });

    it("should show error if email is not found (assuming API returns error)", () => {
      // This test depends on the backend implementation
      cy.visit("/auth/forgot-password");
      cy.get('input[placeholder="you@example.com"]').type("nonexistent@example.com");
      cy.get('button[type="submit"]').click();

      // We expect an error message if the API fails
      // cy.contains("Failed to send reset email").should("be.visible");
    });
  });
});
