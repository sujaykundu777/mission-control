import { defineConfig } from "cypress";
import * as fs from "fs";
import * as path from "path";

// Load NEXTAUTH_SECRET from the project's .env.local if not set in the environment.
// The Cypress process runs from the worktree but the Next.js dev server runs from
// the main project directory, so we probe several locations.
function getNextAuthSecret(): string {
  if (process.env.NEXTAUTH_SECRET) return process.env.NEXTAUTH_SECRET;

  const candidates = [
    path.resolve(__dirname, ".env.local"),
    path.resolve(__dirname, "../../../../client/.env.local"), // main repo relative to worktree
    path.resolve(process.cwd(), ".env.local"),
  ];

  for (const envFile of candidates) {
    if (fs.existsSync(envFile)) {
      const content = fs.readFileSync(envFile, "utf8");
      const match = content.match(/^NEXTAUTH_SECRET=["']?([^"'\r\n]+)["']?/m);
      if (match) return match[1].trim();
    }
  }

  return "your-generated-secret-here";
}

const NEXTAUTH_SECRET = getNextAuthSecret();

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
          return encode({
            token: {
              sub: "test-user-id",
              id: "test-user-id",
              email,
              name,
              role: "user",
            },
            secret: NEXTAUTH_SECRET,
            // NextAuth v5 uses the cookie name as the salt for key derivation
            salt: "authjs.session-token",
          });
        },
      });
    },
  },
});
