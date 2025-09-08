# Full-Stack To-Do Application

A comprehensive To-Do application built with Next.js (frontend) and NestJS (backend), featuring optimistic locking, bulk operations, and comprehensive testing.

## Project Structure

```
todo-app/
├── backend/          # NestJS API with Prisma + SQLite
├── frontend/         # Next.js app with app router
├── README.md         # This file
└── .env.example      # Environment variables template
```

## Quick Start

### Prerequisites
- Node.js 18+ 
- npm (recommended) or pnpm

### Installation & Setup

**Option 1: Automated Setup (Recommended)**
```bash
# Run the setup script
./setup.sh
```

**Option 2: Manual Setup**
1. **Install dependencies:**
   ```bash
   # Root level
   npm install
   
   # Backend
   cd backend && npm install
   
   # Frontend  
   cd ../frontend && npm install
   ```

2. **Environment setup:**
   ```bash
   # Copy environment template to all locations
   cp env.example .env
   cp env.example backend/.env
   cp env.example frontend/.env
   
   # Edit .env files with your JWT secret (all files should be identical)
   ```

3. **Database setup:**
   ```bash
   # From root directory
   npm run db:setup
   
   # Or manually:
   cd backend
   npm run prisma:migrate:dev
   npm run prisma:seed
   ```

4. **Start development servers:**
   ```bash
   # From root directory - runs both backend and frontend
   npm run dev
   
   # Or run separately:
   # Terminal 1 - Backend
   cd backend && npm run start:dev
   
   # Terminal 2 - Frontend
   cd frontend && npm run dev
   ```

5. **Access the application:**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3001
   - Demo login: `demo@local.com` / `demo123`

## Testing

### Tests (Intentional for Candidates)
This repository does not include tests by design. Candidates are expected to add:
- Backend unit tests (Jest) and e2e tests (SuperTest)
- Frontend Playwright tests for E2E

Scaffold commands return success with a message to avoid CI failures. Replace them with real test runners when adding tests.

## API Documentation

### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login user

### Todos
- `GET /todos?filter=all|completed|pending` - List user's todos
- `POST /todos` - Create new todo
- `GET /todos/:id` - Get specific todo
- `PATCH /todos/:id` - Update todo (requires version for optimistic locking)
- `DELETE /todos/:id` - Delete todo
- `POST /todos/bulk-create` - Create multiple todos
- `POST /todos/bulk-delete` - Delete multiple todos

## Intentional Edge Cases for QA Testing

### Backend Edge Cases
1. **Validation Errors**
   - Empty title → 400 Bad Request
   - Title > 250 characters → 400 Bad Request
   - Missing version in PATCH → 400 Bad Request

2. **Optimistic Locking**
   - Stale version in PATCH → 409 Conflict
   - Concurrent updates simulation → Second update gets 409

3. **Authorization**
   - Access other user's todo → 403 Forbidden
   - Unauthorized access → 401 Unauthorized

4. **Bulk Operations**
   - Bulk-create with invalid item → Transaction rollback, detailed error
   - Bulk-delete with missing IDs → Partial success with notFound list

5. **Data Sanitization**
   - HTML in description → Server strips/escapes tags

### Frontend Edge Cases
1. **Optimistic UI**
   - Toggle complete → Immediate UI update, rollback on 409 conflict
   - Edit todo → Version increment after successful update

2. **Error Handling**
   - 401 → Redirect to login
   - 403/404 → User-friendly error messages
   - Network errors → Retry logic for GET requests

3. **Bulk Operations UI**
   - Bulk-create failure → Modal showing which items failed
   - Bulk-delete partial → Show deleted vs not found items

4. **Concurrent Updates**
   - Two clients editing same todo → Conflict resolution UI

## Development Scripts

### Backend
- `npm run start:dev` - Start development server
- `npm run build` - Build for production
- `npm run prisma:migrate:dev` - Run database migrations
- `npm run prisma:seed` - Seed database with demo data
- `npm test` - Run unit tests
- `npm run test:e2e` - Run e2e tests
- `npm run lint` - Run linter

### Frontend
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run lint` - Run linter

## Database Reset
```bash
# From root directory
npm run db:reset

# Or manually:
cd backend
npm run prisma:migrate:reset
npm run prisma:seed
```

## Demo Account
- Email: `demo@local.com`
- Password: `demo123`
- Pre-seeded with 5 sample todos (mix of completed/pending)
