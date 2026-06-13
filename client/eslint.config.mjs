import nextConfig from "eslint-config-next";
import nextWebVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";
import prettierConfig from "eslint-config-prettier";

const ignores = [
  ".next/**",
  "node_modules/**",
  "coverage/**",
  "dist/**",
  "build/**",
  "next-env.d.ts",
  "public/**",
  "pnpm-lock.yaml",
  // WIP files with syntax errors — re-enable once fixed
  "app/login/**",
  "app/register/**",
  "app/terms-and-conditions/**",
  "components/landing/**",
];

export default [
  { ignores },
  ...nextConfig,
  ...nextWebVitals,
  ...nextTypescript,
  prettierConfig,
  {
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      "react/react-in-jsx-scope": "off",
      "react/prop-types": "off",
      "import/no-anonymous-default-export": "off",
    },
  },
  {
    // Vendored shadcn-ui primitives — written for React 18 conventions.
    // React 19's stricter hooks rules aren't worth rewriting upstream code for.
    files: ["components/ui/**/*.{ts,tsx}", "hooks/use-mobile.tsx", "hooks/use-toast.ts"],
    rules: {
      "react-hooks/set-state-in-effect": "off",
      "react-hooks/purity": "off",
      "react/no-children-prop": "off",
    },
  },
];
