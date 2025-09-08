# TaskBoard Assessment

A monorepo task management application designed for QA/Test Engineer assessment. This project intentionally contains subtle defects to evaluate manual testing, exploratory testing, and automated testing skills.

## Project Overview

This is a full-stack TypeScript application built with:
- **API**: NestJS 10 with JSON file storage
- **Web**: Next.js 15 with App Router
- **Monorepo**: Turborepo with pnpm
- **Testing**: Jest (API) + Playwright (E2E)

### Domain Model

- **Users**: admin@test.io (ADMIN) / tester@test.io (TESTER)
- **Projects**: Website Revamp, Mobile App
- **Tasks**: With status (todo/in_progress/done), priority (low/med/high), assignee, due date
- **Activity Logs**: Track task create/update/delete operations

## Getting Started

### Prerequisites
- Node.js 20.x
- pnpm 8.x

### Installation

```bash
# Clone and install dependencies
git clone <repository-url>
cd taskboard-assessment
pnpm install

# Copy environment files
cp env.example .env
cp apps/api/env.example apps/api/.env
cp apps/web/env.local.example apps/web/.env.local

# Start development servers (data is pre-seeded in JSON files)
pnpm run dev
```

### Access the Application

- **Web App**: http://localhost:3000
- **API**: http://localhost:3333
- **API Docs**: http://localhost:3333/docs

### Login Credentials

- **Admin**: admin@test.io / Password@123 (can create/edit/delete projects)
- **Tester**: tester@test.io / Password@123 (can create/edit tasks only)

## API Specification

### Authentication
- **POST /auth/login**: Returns JWT token valid for 60 minutes
- All protected endpoints require `Authorization: Bearer <token>`

### Projects
- **GET /projects**: List all projects
- **POST /projects**: Create project (ADMIN only)
- **PATCH /projects/:id**: Update project (ADMIN only)
- **DELETE /projects/:id**: Delete project (ADMIN only)

### Tasks
- **GET /projects/:id/tasks**: List tasks with filters and pagination
  - Query params: `status`, `priority`, `assigneeEmail`, `page`, `size`, `sortBy`, `order`
  - Default sort: dueDate DESC
  - Default pagination: page=1, size=10
  - Invalid size (≤0) should return 400
- **POST /projects/:id/tasks**: Create task
- **PATCH /tasks/:id**: Update task
- **DELETE /tasks/:id**: Delete task

### Activity
- **GET /tasks/:id/activity**: Get activity log for task

### Rate Limiting
- 60 requests per minute
- Headers: `X-RateLimit-Limit: 60`, `X-RateLimit-Remaining: <count>`

## Testing

### Run All Tests
```bash
# Run API tests
pnpm test:api

# Run E2E tests  
pnpm test:ui

# Run all tests
pnpm test
```

### API Tests (Jest + Supertest)
```bash
cd apps/api
pnpm test        # Unit tests
pnpm test:e2e    # Integration tests
pnpm test:cov    # With coverage
```

### E2E Tests (Playwright)
```bash
cd apps/web
pnpm test:e2e
```

### Known Issues Flag

Set `KNOWN_ISSUES=false` to run tests that expose seeded defects:

```bash
# In .env files, change:
KNOWN_ISSUES=false

# Then run tests to see failures
pnpm test
```

## What to Test

### Manual Testing Focus Areas

1. **Authentication & Authorization**
   - Login with valid/invalid credentials
   - Token expiry behavior
   - Role-based access control (ADMIN vs TESTER permissions)

2. **Task Management**
   - CRUD operations for tasks
   - Filtering by status, priority, assignee
   - Pagination behavior with edge cases
   - Sorting functionality
   - Form validations

3. **Data Integrity**
   - Activity logging for all task operations
   - Proper error handling and user feedback
   - Data persistence across sessions

4. **UI/UX & Accessibility**
   - Modal behavior and focus management
   - Keyboard navigation
   - Form validation feedback
   - Dark mode functionality
   - Screen reader compatibility

### Automated Testing Areas

1. **API Contract Testing**
   - Response schemas and status codes
   - Authentication and authorization
   - Input validation and error handling
   - Rate limiting behavior

2. **End-to-End Workflows**
   - Complete user journeys
   - Cross-browser compatibility
   - Accessibility compliance

## Submission Requirements

Please provide:

1. **Test Plan**: Strategy and scope for testing this application
2. **Test Cases**: Detailed manual test cases for key scenarios
3. **Bug Reports**: Any defects found with reproduction steps
4. **Automation Results**: Output from running the test suites
5. **Summary Report**: Overall assessment and recommendations

### Bug Report Template

```
Title: Brief description
Severity: Critical/High/Medium/Low
Steps to Reproduce:
1. 
2. 
3. 
Expected Result: 
Actual Result: 
Environment: Browser/API
```

## Development Commands

```bash
# Start development
pnpm dev

# Build all apps
pnpm build

# Lint all code
pnpm lint

# Data operations (in apps/api)
# Data is stored in src/data/*.json files
# Edit JSON files directly to modify seed data
```

## Architecture Notes

- **Monorepo**: Shared ESLint and TypeScript configs
- **API**: NestJS with JSON storage, JWT auth, OpenAPI docs
- **Web**: Next.js App Router, Tailwind CSS, React Query
- **Database**: JSON files for simplicity
- **Testing**: Jest for API, Playwright for E2E

---

<!--
MAINTAINER NOTES - SEEDED DEFECTS:

1. JWT expiry bug: Code sets 10m instead of 60m despite config/spec
2. RBAC bug: RolesGuard allows TESTER to DELETE projects (critical)
3. Validation gap: API allows empty task title, UI blocks it
4. Priority filter bug: priority=high returns some med tasks
5. Pagination bug: size=0 returns all items instead of 400
6. Default sort bug: dueDate ASC instead of DESC
7. Activity log omission: assigneeEmail-only updates don't log
8. Rate limit header bug: X-RateLimit-Remaining doesn't decrement
9. A11y gap: Task modal missing aria-labelledby
10. Date validation bug: Client accepts invalid dates like 2025-13-40

These defects are intentional for assessment purposes.
-->

## Support

For questions about this assessment, please contact the evaluation team.
