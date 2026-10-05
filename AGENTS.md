# AGENTS.md: Engineering Rules & Collaboration Guidelines for PromptForge

Welcome to the **PromptForge** codebase. This document outlines mandatory architectural patterns, coding standards, testing requirements, and git commit rules for all AI agents and human contributors working on this project.

---

## 1. Project Philosophy & Core Architecture

* **Modular Monolith**: We avoid premature microservices. The backend is an **Express 5.1 modular monolith** organized into distinct domain modules (`auth`, `prompts`, `orders`, `payments`, `reviews`, `creator`).
* **Zero-Knowledge Asset Security**: Prompt intellectual property (`fullPromptText`, model parameters, negative prompts, seeds) must **never** be exposed via public API endpoints. Data must be sanitized at the database projection layer (`.select('-fullPromptText')`) and unlocked strictly via verified entitlements.
* **Dual-Channel Financial Settlement**: All payment workflows must support both synchronous client verification (HMAC-SHA256) and asynchronous, idempotent webhook reconciliation (`payment.captured`, `payment.failed`) with atomic MongoDB transactions.
* **No Client-Side In-Memory Dumps**: Database queries must use compound indexes, projection, and server-side cursor or offset pagination (`{ limit, skip }`). Never fetch unbounded collections into React memory.

---

## 2. Commit Discipline & Rules

To maintain a clean, bisectable git history, follow these strict commit rules:

### A. When to Commit (Trigger Criteria)
**Commit immediately after completing a single, meaningful, and self-contained task or sub-phase.**
* **DO NOT** accumulate unrelated changes across multiple domains into a single monolithic commit.
* **DO NOT** commit broken or half-implemented code where tests fail or linting errors exist.
* **DO NOT** commit when the local build or server fails to start.

### B. Verification Checklist Before Every Commit
Before executing `git commit`, verify:
1. All newly written code conforms to ESLint rules without warnings (`npm run lint`).
2. Server boots cleanly without syntax errors or runtime exceptions.
3. Unit and integration tests for the modified module pass (`npm test`).
4. Only relevant files are staged (`git status`); temporary artifacts, logs, `.env`, and `node_modules` must never be staged.

### C. Conventional Commit Format
All commit messages must adhere to the **Conventional Commits** specification:

```
<type>(<scope>): <short imperative summary>

[optional body explaining context, non-obvious design decisions, or trade-offs]

[optional footer(s), e.g., Closes #12]
```

#### Allowed Types:
* `feat`: A new user-facing feature or API endpoint (e.g., `feat(payments): implement razorpay order verification and webhook reconciliation`).
* `fix`: A bug fix or security patch (e.g., `fix(auth): resolve undefined user id token issue during signup`).
* `refactor`: Code change that neither fixes a bug nor adds a feature (e.g., `refactor(prompts): migrate prompt author from raw string to user objectid ref`).
* `perf`: Performance improvement (e.g., `perf(search): add compound index on category, aiModel, and pricePaise`).
* `test`: Adding or updating automated tests (e.g., `test(orders): add idempotency and signature tamper unit tests`).
* `docs`: Documentation updates (e.g., `docs: update api reference with razorpay webhook payload format`).
* `chore`: Build tasks, dependency updates, or docker configurations (e.g., `chore: add docker-compose configuration for mongo and redis`).

#### Granularity Examples:
* **Good Commit**: `feat(orders): add razorpay signature verification endpoint with timing-safe comparison`
* **Bad Commit**: `updated code and fixed some bugs and added payments and styling`

---

## 3. Backend Standards (Node.js / Express 5 / Mongoose)

1. **Native ESM**: Use standard `import` / `export` syntax exclusively. Never use CommonJS `require()`.
2. **Schema Validation with Zod**: Every route receiving `req.body`, `req.query`, or `req.params` must pass through a strict Zod validation middleware before reaching the controller.
3. **HTTP Status Codes**:
   * `200 OK`: Successful read or update.
   * `201 Created`: Successful resource creation.
   * `400 Bad Request`: Validation failure or missing input.
   * `401 Unauthorized`: Missing, expired, or invalid session token.
   * `403 Forbidden`: Authenticated user lacks ownership/entitlement permissions.
   * `404 Not Found`: Resource does not exist.
   * `409 Conflict`: Duplicate key, duplicate order, or race condition violation.
   * `500 Internal Server Error`: Unhandled server exception (caught by central error middleware).
4. **No Trust on Client Identity**: Never accept `userId` from `req.body` or `req.query`. Always resolve identity from `req.user.id` set by `verifyJWT`.
5. **Atomic Operations**: Financial state changes, balances, and entitlement grants must execute inside MongoDB sessions (`mongoose.startSession()`) with transaction rollbacks on failure.

---

## 4. Frontend Standards (React 19 / Vite / Tailwind v4)

1. **SPA Navigation**: Never use `<a href="...">` or `window.location.href = ...` for internal routing. Use React Router's `<Link to="...">` or `navigate()`.
2. **Session Initialization**: Asynchronous authentication checks (`checkAuthStatus`) must be awaited before releasing loading states to avoid layout shifts or unauthorized redirects.
3. **Component Modularity**: Keep page components thin. Separate business logic and API requests into custom hooks or dedicated API service files (`src/api/*`).
4. **Tailwind v4 Conventions**: Use standard CSS variables and Tailwind utility classes. Maintain consistent color tokens defined in the design system (`#0A0F1E` dark canvas, `#111827` surface cards, `#5b85f9` accent primary).
5. **User Feedback**: Every asynchronous user action (like, purchase, upload, review) must provide immediate visual feedback (loading spinners, disabled buttons, toast confirmations).

---

## 5. Security & Configuration Best Practices

1. **Environment Variables**:
   * Never commit `.env` files.
   * Always maintain updated `.env.example` templates in both `client/` and `server/`.
2. **CORS Configuration**: Origin whitelists must be dynamically read from `process.env.ALLOWED_ORIGINS` rather than hardcoded URLs.
3. **Cookie Security**:
   * Production (`NODE_ENV === 'production'`): `{ httpOnly: true, secure: true, sameSite: 'none' }`.
   * Development: `{ httpOnly: true, secure: false, sameSite: 'lax' }`.
4. **Razorpay Secrets**:
   * Public key (`RAZORPAY_KEY_ID`) is safe for frontend client exposure.
   * Private secret (`RAZORPAY_KEY_SECRET`) and webhook secret (`RAZORPAY_WEBHOOK_SECRET`) must **never** be passed to the client.
