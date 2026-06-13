const TEST_EMAIL = "test@example.com";
const TEST_PASSWORD = "password123";
const TEST_NAME = "Test User";

describe("Authentication Flow", () => {
  describe("Login Page", () => {
    beforeEach(() => {
      cy.visit("/auth/login");
    });

    it("renders the login form", () => {
      cy.get("#email").should("be.visible");
      cy.get("#password").should("be.visible");
      cy.get('button[type="submit"]').should("contain", "Sign In");
    });

    it("redirects to dashboard on successful login", () => {
      // Generate a real signed NextAuth v5 JWT via Cypress task so the server-side
      // middleware accepts the session when it navigates to /dashboard.
      cy.task("generateNextAuthJwt", { email: TEST_EMAIL, name: TEST_NAME }).then((jwt) => {
        cy.intercept("POST", "/api/auth/callback/credentials*", {
          statusCode: 200,
          // Return the JWT as Set-Cookie so the browser stores it before the
          // middleware checks it on the /dashboard navigation.
          headers: {
            "Set-Cookie": `authjs.session-token=${jwt}; Path=/; HttpOnly; SameSite=Lax`,
          },
          body: { url: "http://localhost:3000/dashboard" },
        }).as("loginRequest");

        cy.intercept("GET", "/api/auth/session", {
          body: {
            user: { name: TEST_NAME, email: TEST_EMAIL, id: "test-user-id", role: "user" },
            expires: "2099-01-01",
          },
        });

        cy.get("#email").type(TEST_EMAIL);
        cy.get("#password").type(TEST_PASSWORD);
        cy.get('button[type="submit"]').click();

        cy.wait("@loginRequest");
        cy.url().should("include", "/dashboard");
      });
    });

    it("shows error message on invalid credentials", () => {
      // Return a non-null URL so NextAuth's `new URL(data.url)` doesn't throw.
      cy.intercept("POST", "/api/auth/callback/credentials*", {
        statusCode: 200,
        body: {
          error: "CredentialsSignin",
          url: "http://localhost:3000/auth/login?error=CredentialsSignin",
        },
      });

      cy.get("#email").type("wrong@example.com");
      cy.get("#password").type("wrongpassword");
      cy.get('button[type="submit"]').click();

      cy.contains("Invalid email or password").should("be.visible");
    });

    it("shows success banner when redirected from registration", () => {
      cy.visit("/auth/login?registered=true");
      cy.contains("Account created successfully! Please sign in.").should("be.visible");
    });

    it("has a link to forgot password", () => {
      cy.contains("Forgot password?").should("have.attr", "href", "/auth/forgot-password");
    });

    it("has a link to create account", () => {
      cy.contains("Create account").should("have.attr", "href", "/auth/register");
    });
  });

  describe("Registration Page", () => {
    beforeEach(() => {
      cy.visit("/auth/register");
    });

    it("renders the registration form", () => {
      cy.get("#name").should("be.visible");
      cy.get("#email").should("be.visible");
      cy.get("#password").should("be.visible");
      cy.get("#confirmPassword").should("be.visible");
      cy.get('button[type="submit"]').should("contain", "Create Account");
    });

    it("redirects to login with registered=true on successful registration", () => {
      cy.intercept("POST", "/api/auth/register", {
        statusCode: 201,
        body: { message: "Account created successfully", userId: "mock-user-id" },
      }).as("registerRequest");

      cy.get("#name").type(TEST_NAME);
      cy.get("#email").type(TEST_EMAIL);
      cy.get("#password").type(TEST_PASSWORD);
      cy.get("#confirmPassword").type(TEST_PASSWORD);
      cy.get('button[type="submit"]').click();

      cy.wait("@registerRequest");
      cy.url().should("include", "/auth/login?registered=true");
    });

    it("shows error when passwords do not match", () => {
      cy.get("#name").type(TEST_NAME);
      cy.get("#email").type(TEST_EMAIL);
      cy.get("#password").type(TEST_PASSWORD);
      cy.get("#confirmPassword").type("differentpassword");
      cy.get('button[type="submit"]').click();

      cy.contains("Passwords do not match").should("be.visible");
    });

    it("shows error when password is too short", () => {
      cy.get("#name").type(TEST_NAME);
      cy.get("#email").type(TEST_EMAIL);
      cy.get("#password").type("short");
      cy.get("#confirmPassword").type("short");
      cy.get('button[type="submit"]').click();

      cy.contains("Password must be at least 6 characters").should("be.visible");
    });

    it("shows error when email already exists", () => {
      cy.intercept("POST", "/api/auth/register", {
        statusCode: 409,
        body: { error: "An account with this email already exists" },
      }).as("registerRequest");

      cy.get("#name").type(TEST_NAME);
      cy.get("#email").type(TEST_EMAIL);
      cy.get("#password").type(TEST_PASSWORD);
      cy.get("#confirmPassword").type(TEST_PASSWORD);
      cy.get('button[type="submit"]').click();

      cy.wait("@registerRequest");
      cy.contains("An account with this email already exists").should("be.visible");
    });

    it("has a link to sign in", () => {
      cy.contains("Sign in").should("have.attr", "href", "/auth/login");
    });
  });

  describe("Registration API", () => {
    it("POST /api/auth/register returns 201 for new user", () => {
      // Use a unique email to avoid conflicts with real DB state
      const uniqueEmail = `test-${Date.now()}@example.com`;
      cy.request({
        method: "POST",
        url: "/api/auth/register",
        body: { name: TEST_NAME, email: uniqueEmail, password: TEST_PASSWORD },
        failOnStatusCode: false,
      }).then((res) => {
        expect(res.status).to.eq(201);
        expect(res.body).to.have.property("message", "Account created successfully");
      });
    });

    it("POST /api/auth/register returns 400 when email is missing", () => {
      cy.request({
        method: "POST",
        url: "/api/auth/register",
        body: { password: TEST_PASSWORD },
        failOnStatusCode: false,
      }).then((res) => {
        expect(res.status).to.eq(400);
        expect(res.body).to.have.property("error", "Email and password are required");
      });
    });

    it("POST /api/auth/register returns 400 when password is too short", () => {
      cy.request({
        method: "POST",
        url: "/api/auth/register",
        body: { email: `short-${Date.now()}@example.com`, password: "abc" },
        failOnStatusCode: false,
      }).then((res) => {
        expect(res.status).to.eq(400);
        expect(res.body).to.have.property("error", "Password must be at least 6 characters");
      });
    });
  });
});
