# Candidate Assessment Instructions

This repository intentionally excludes tests. Your task is to add tests and improve quality while keeping the existing APIs and UI behavior intact.

## What to Implement

- Backend (NestJS):
  - Unit tests for `TodosService` (Jest)
  - E2E tests for API (Jest + SuperTest)
  - Use a temp SQLite DB (file in /tmp or memory) for tests
  - Cover validation, optimistic locking, bulk ops, authorization, and sanitization

- Frontend (Next.js App Router):
  - E2E tests with Playwright
  - Cover login, create, edit, toggle with optimistic UI and rollback, bulk ops, 401 redirect, and basic accessibility assertions

## Constraints

- Do not change existing endpoint shapes or client-visible behavior unless bug fixes are necessary.
- Keep DB schema intact. You may add test-only config.
- Keep lint passing.

## Suggested Commands (replace placeholders with real runners)

- Backend unit tests:
  - `cd backend && npm test`
- Backend e2e tests:
  - `cd backend && npm run test:e2e`
- Frontend e2e tests:
  - `cd frontend && npm run test:e2e`

## Evaluation Guidelines

- Coverage of edge cases listed in README
- Clear, deterministic tests (no flakiness)
- Maintainable test structure and utilities
- Useful failure messages

## Bonus

- Add GitHub Actions to run tests
- Add Playwright trace collection on failure
- Seed and teardown helpers for e2e environments
