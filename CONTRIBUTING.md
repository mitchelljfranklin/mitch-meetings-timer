# Contributing

Thanks for your interest in improving the Meeting Timer Teams app!

## Prerequisites

- [Node.js](https://nodejs.org) 20+ (see `.nvmrc`; run `nvm use`).
- npm 10+.

## Setup

```bash
npm ci
```

## Common scripts

| Script               | Purpose                                            |
| -------------------- | -------------------------------------------------- |
| `npm run dev`        | Start the Vite dev server (UI preview).            |
| `npm test`           | Run the Vitest unit/component suite.               |
| `npm run test:watch` | Watch mode for tests.                              |
| `npm run lint`       | Lint with ESLint.                                  |
| `npm run format`     | Format with Prettier.                              |
| `npm run typecheck`  | Type-check with the TypeScript compiler.           |
| `npm run build`      | Production build.                                  |
| `npm run package`    | Build icons + app and produce the sideload `.zip`. |

## Before opening a pull request

Make sure these all pass locally (CI runs the same checks):

```bash
npm run format:check
npm run lint
npm run typecheck
npm test
npm run build
```

## Pull request workflow

1. Branch from `main` (e.g. `feature/...` or `fix/...`).
2. Keep changes focused; add tests for behavior changes.
3. Do not commit secrets. The app needs none.
4. Open a PR and fill in the template. CI must be green and a code owner must
   approve before merge.

## Recommended branch protection (`main`)

Configure these in GitHub repository settings:

- Require a pull request before merging, with at least one approving review.
- Require the `CI` status checks to pass.
- Require branches to be up to date before merging.
- Dismiss stale approvals on new commits.
- Disallow force pushes and deletions.

## Code style

- TypeScript + React function components.
- Prettier formatting and ESLint (including `react-hooks`) are enforced in CI.
- Avoid adding code comments unless they explain non-obvious intent.
