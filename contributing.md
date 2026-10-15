# Contributing to PromptForge

Thank you for contributing to PromptForge, an AI prompt marketplace built with React, Express, MongoDB, and Redis.

## Getting Started

### Prerequisites

- Node.js 20 or later
- npm 10 or later
- Docker and Docker Compose, or local MongoDB and Redis instances

### Local Setup

1. Fork the repository and clone your fork.
2. Create environment files from the provided examples:

   ```bash
   cp server/.env.example server/.env
   cp client/.env.example client/.env
   ```

3. Install dependencies:

   ```bash
   cd server && npm install
   cd ../client && npm install
   ```

4. Start the supporting services with Docker Compose, or provide local MongoDB and Redis services.
5. Start the backend and frontend in separate terminals:

   ```bash
   cd server
   npm run dev
   ```

   ```bash
   cd client
   npm run dev
   ```

See the root `README.md` for required environment variables and service configuration.

## Branches and Commits

Create a focused branch using the change type and scope:

```bash
git checkout -b feat/issue-1-react-router
# or
git checkout -b fix/issue-3-validation
```

Use Conventional Commits. Include the affected area when useful:

```text
feat(client): add prompt filtering
fix(server): validate webhook signatures
```

Keep each commit focused and avoid committing secrets, generated files, or dependency directories.

## Development Guidelines

- Use native ESM imports and exports; do not introduce CommonJS `require()`.
- Follow the existing React, Express, and Tailwind patterns in the surrounding code.
- Resolve authenticated identity from the server-side request context (`req.user`); never trust a client-supplied user ID.
- Preserve prompt-content access controls. Public catalog responses must not expose protected fields such as `fullPromptText`.
- Validate incoming request data at the API boundary and return consistent errors.
- Keep payment and entitlement changes idempotent and transaction-safe.
- Do not log credentials, tokens, payment secrets, or protected prompt content.

## Testing and Checks

Run the relevant checks before opening a pull request:

```bash
cd client
npm run lint
npm run build
```

```bash
cd server
npm test
```

For payment, authentication, authorization, webhook, or entitlement changes, add or update server tests. For UI changes, verify responsive behavior and include screenshots or a short recording in the pull request when helpful.

## Pull Requests

Before opening a pull request:

- Rebase or update your branch with the latest `main`.
- Explain what changed and why.
- Link the related issue, for example `Resolves #1`.
- Include test commands and their results.
- Document environment or migration steps.
- Call out known limitations or follow-up work.

Keep pull requests small enough to review. Maintainers may request changes to preserve security, data ownership, payment correctness, or existing API behavior.

## Reporting Security Issues

Do not report security vulnerabilities in a public issue. Contact the project maintainers privately and include reproduction steps, affected endpoints or files, and the potential impact. Never include real credentials, private keys, payment secrets, or user data in a report.
