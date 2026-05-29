import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    baseUrl: "http://localhost:3000",
    specPattern: "cypress/e2e/**/*.cy.ts",
    supportFile: "cypress/support/e2e.ts",
    viewportWidth: 1280,
    viewportHeight: 720,
    defaultCommandTimeout: 10000,
    setupNodeEvents(on) {
      on("task", {
        async generateNextAuthJwt({
          email,
          name,
        }: {
          email: string;
          name: string;
        }): Promise<string> {
          // eslint-disable-next-line @typescript-eslint/no-require-imports
          const { encode } = require("next-auth/jwt");
          const secret = process.env.NEXTAUTH_SECRET || "your-generated-secret-here";
          return encode({
            token: {
              sub: "test-user-id",
              id: "test-user-id",
              email,
              name,
              role: "user",
            },
            secret,
            // NextAuth v5 uses the cookie name as the salt
            salt: "authjs.session-token",
          });
        },
      });
    },
  },
});
