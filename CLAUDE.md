# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Estate sale inventory management app. Spring Boot 3.2 (Java 17) backend with React + TypeScript frontend, Postgres database. API-first design — the OpenAPI spec at `spec/openapi.yaml` is the source of truth.

## Architecture

- `spec/openapi.yaml` — OpenAPI 3.0 contract defining all endpoints and schemas
- `backend/` — Spring Boot app (layered: controller → service → repository → JPA entities)
- `frontend/` — React + TypeScript app (Vite, React Router)
- `e2e/` — Playwright end-to-end tests
- `docker-compose.yaml` — Postgres 16 for local dev; backend/frontend services for production
- `.github/workflows/ci.yml` — GitHub Actions CI (backend build + frontend build)

### Backend structure (`backend/src/main/java/com/estatesale/inventory/`)
- `controller/` — REST endpoints: SaleController, ItemController (includes photo upload)
- `service/` — Business logic: SaleService, ItemService (pagination support)
- `repository/` — Spring Data JPA repos with paginated query methods
- `model/` — JPA entities (Sale, Item) and enums (SaleStatus, ItemStatus, ItemCondition)
- `config/` — WebConfig (CORS, static file serving for uploads), SecurityConfig (HTTP Basic auth)
- `exception/` — GlobalExceptionHandler, ResourceNotFoundException

### Frontend structure (`frontend/src/`)
- `api/client.ts` — Typed API client mirroring the OpenAPI spec (includes auth header management)
- `api/types.ts` — TypeScript interfaces matching spec schemas (includes PaginatedResponse)
- `pages/` — SalesListPage, SaleDetailPage, SaleFormPage, ItemFormPage
- `components/` — LoginBar

## Running Locally

### 1. Start Postgres
```
docker compose up -d
```

### 2. Run the backend
```
cd backend
mvn spring-boot:run
```
API is at http://localhost:8080/api

### 3. Run the frontend
```
cd frontend
npm run dev
```
UI is at http://localhost:5173

## Key Conventions

- Database migrations use Flyway (SQL files in `backend/src/main/resources/db/migration/`)
- Hibernate is set to `validate` — schema changes must go through Flyway migrations
- Items are nested under Sales: `/api/sales/{saleId}/items`
- Items cascade-delete when a Sale is deleted (DB-level `ON DELETE CASCADE`)
- CORS is configured to allow `localhost:5173` (Vite dev server)
- Uploaded photos are stored in `uploads/` at project root, served via `/uploads/**`

## Authentication

- Spring Security with HTTP Basic auth
- GET requests are public (no auth required)
- POST, PUT, DELETE require authentication
- Default credentials: `admin` / `admin` (in-memory, defined in SecurityConfig)
- Frontend stores auth header in module-level variable in `api/client.ts`

## API Features

- **Pagination**: Items list returns `{content, totalElements, totalPages, page, size}` — default page size is 20
- **Filtering**: Sales filterable by status; Items filterable by status and category via query params
- **Photo upload**: `POST /api/sales/{saleId}/items/{itemId}/photo` accepts multipart file
- **Sale summary**: `GET /api/sales/{saleId}/summary` returns item counts and pricing totals
- **Item tags**: Items support a `tags` field (comma-separated in DB, array in API)

## Testing

**Always use Playwright for automated testing.** When asked to run tests, write tests, or verify changes, use the Playwright E2E suite in `e2e/`. Do not use JUnit/MockMvc or Vitest — all tests are Playwright.

Tests live in `e2e/` at the project root.

### Running tests
```
cd e2e
npx playwright test
```

Prerequisites: Docker Postgres must be running (`docker compose up -d`). Playwright auto-starts the backend and frontend via `webServer` config, or reuses them if already running.

### Test conventions
- **Cleanup**: Every test must clean up sales/items it creates. Use `deleteSaleViaAPI()` in `afterEach`/`afterAll` — items cascade-delete with the sale.
- **Locators**: Use semantic Playwright locators, not CSS selectors:
  - `page.getByLabel('Field Name')` for form inputs (all labels have `htmlFor`/`id` linking)
  - `page.getByTestId('...')` for structural elements (summary cards, item cards, filter bar)
  - `page.getByRole(...)` for buttons, links, headings
  - `page.getByPlaceholder(...)` for inputs with placeholder text
- **Test data**: Use `createSaleViaAPI()` / `createItemViaAPI()` helpers for setup, not UI interactions.
- **Data-testid reference**: `summary-bar`, `summary-total-items`, `summary-total-value`, `summary-sold`, `summary-available`, `summary-withdrawn`, `items-list`, `item-card`, `filter-bar`, `sale-form`, `item-form`

### Test structure (`e2e/tests/`)
- `auth.spec.ts` — Login/logout, auth enforcement (6 tests)
- `sales-crud.spec.ts` — Sale create, read, update, delete, filtering (7 tests)
- `items-crud.spec.ts` — Item CRUD, tags, conditions, statuses (7 tests)
- `items-filtering.spec.ts` — Status/category filtering, pagination (4 tests)
- `sale-summary.spec.ts` — Pricing summary accuracy (1 test)
- `helpers.ts` — Shared helpers: `login`, `createSaleViaAPI`, `createItemViaAPI`, `deleteSaleViaAPI`, `acceptNextDialog`

## Deployment

- `backend/Dockerfile` — Multi-stage: Maven build → Eclipse Temurin JRE 17
- `frontend/Dockerfile` — Multi-stage: Node 20 build → nginx:alpine
- `frontend/nginx.conf` — SPA routing, proxies `/api/` and `/uploads/` to backend
- `docker-compose.yaml` — Full stack (postgres, backend, frontend) for production
- `docker-compose.override.yaml` — Dev override: only postgres starts (backend/frontend run via CLI)
