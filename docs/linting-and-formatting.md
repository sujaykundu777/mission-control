# Linting, Formatting & Git Hooks

This document describes the ESLint, Prettier, and Husky setup for the `client/` workspace.

## Overview

| Tool | Purpose | Config file |
| --- | --- | --- |
| ESLint 9 | Code quality / static analysis | `client/eslint.config.mjs` |
| Prettier 3 | Code formatting | `client/.prettierrc.json` |
| Husky 9 | Git hook runner | `client/.husky/` |
| lint-staged 17 | Run linters only on staged files | `client/package.json` (`lint-staged` key) |

## Repository layout note

The git root is the monorepo root (`mission-control/`), not `client/`. Husky is configured with `core.hooksPath = client/.husky/_`, and the hook scripts `cd client` before running their commands. This means hooks only act on changes inside `client/`.

If you ever need to reinstall hooks, run from `client/`:

```bash
pnpm install   # triggers the "prepare" script
```

The `prepare` script does `cd .. && husky client/.husky`, which (re)wires `core.hooksPath`.

## NPM scripts

Run from `client/`:

```bash
pnpm run lint          # eslint .
pnpm run lint:fix      # eslint . --fix
pnpm run format        # prettier --write .
pnpm run format:check  # prettier --check .
pnpm test              # vitest run
```

## ESLint

Flat config (`client/eslint.config.mjs`) composes:

- `eslint-config-next` — base Next.js rules
- `eslint-config-next/core-web-vitals` — perf-sensitive rules
- `eslint-config-next/typescript` — TypeScript rules
- `eslint-config-prettier` — disables stylistic rules that conflict with Prettier

### Local rule overrides

```js
"@typescript-eslint/no-explicit-any": "off"
"@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }]
"react/react-in-jsx-scope": "off"
"react/prop-types": "off"
"import/no-anonymous-default-export": "off"
```

To silence an unused variable, prefix it with `_` (e.g. `_unusedArg`).

### Ignored paths

Build output, deps, lockfile, and a few WIP files with unresolved JSX syntax errors:

- `app/login/**`
- `app/register/**`
- `app/terms-and-conditions/**`
- `components/landing/**`

Re-enable these (remove from both `eslint.config.mjs` and `.prettierignore`) once the underlying JSX is fixed.

## Prettier

`client/.prettierrc.json`:

```json
{
  "semi": true,
  "singleQuote": false,
  "trailingComma": "all",
  "printWidth": 100,
  "tabWidth": 2,
  "arrowParens": "always",
  "endOfLine": "lf",
  "plugins": ["prettier-plugin-tailwindcss"],
  "tailwindFunctions": ["clsx", "cn", "cva", "tw"]
}
```

`prettier-plugin-tailwindcss` auto-sorts Tailwind class names in JSX `className` props and in the listed utility functions (`cn(...)`, `clsx(...)`, `cva(...)`, `tw...`).

## Git hooks

### pre-commit

`client/.husky/pre-commit`:

```sh
cd client && pnpm exec lint-staged
```

`lint-staged` runs only against files staged in `git`:

```json
"lint-staged": {
  "*.{js,jsx,ts,tsx,mjs,cjs}": ["eslint --fix", "prettier --write"],
  "*.{json,md,css,yml,yaml}": ["prettier --write"]
}
```

A staged file that fails ESLint and can't be auto-fixed will block the commit.

### pre-push

`client/.husky/pre-push`:

```sh
cd client && pnpm run lint && pnpm test
```

Pushes are blocked if either the full lint check or the test suite fails. This is the slower but stricter gate.

### Bypassing hooks

Don't, except for genuine emergencies:

```bash
git commit --no-verify
git push --no-verify
```

If you find yourself reaching for `--no-verify`, the right move is usually to fix the underlying lint/test failure or to narrow the rule.

## Editor setup

### VS Code

Install the **ESLint** and **Prettier - Code formatter** extensions, then add to `.vscode/settings.json`:

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit"
  },
  "eslint.workingDirectories": [{ "pattern": "client" }]
}
```

### Other editors

Point your editor's ESLint integration at `client/` as the working directory so it picks up `eslint.config.mjs`. Prettier is auto-discovered from `.prettierrc.json`.

## Troubleshooting

**Hooks aren't firing.** Check `git config --get core.hooksPath` from the repo root — it should print `client/.husky/_`. If empty, run `cd client && pnpm install` to re-trigger `prepare`.

**`husky - command not found in PATH=...`** — usually means a hook is trying to run a binary that isn't installed. Re-run `pnpm install` inside `client/`.

**ESLint can't find the config.** Make sure you're running `pnpm run lint` from `client/`, or pass `--config client/eslint.config.mjs` if running from the repo root.

**Prettier and ESLint disagree on formatting.** `eslint-config-prettier` is the last entry in the flat-config chain to disable stylistic ESLint rules. If you add a new shareable config after it, re-add `prettierConfig` at the end.
