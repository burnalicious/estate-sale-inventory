# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Estate sale inventory management app. Spring Boot 3.2 (Java 17) backend with React + TypeScript frontend, Postgres database. API-first design — the OpenAPI spec at `spec/openapi.yaml` is the source of truth.

## Architecture

- `spec/openapi.yaml` — OpenAPI 3.0 contract defining all endpoints and schemas
- `backend/` — Spring Boot app (layered: controller → service → repository → JPA entities)
- `frontend/` — React + TypeScript app (Vite, React Router)
- `docker-compose.yaml` — Postgres 16 for local development

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

The project uses **Playwright E2E tests** as the primary test suite. Tests live in `e2e/` at the project root.

### Running tests
```
cd e2e
npx playwright test
```

Prerequisites: Docker Postgres must be running (`docker compose up -d`). Playwright auto-starts the backend and frontend via `webServer` config, or reuses them if already running.

### Test structure (`e2e/tests/`)
- `auth.spec.ts` — Login/logout, auth enforcement
- `sales-crud.spec.ts` — Sale create, read, update, delete, filtering
- `items-crud.spec.ts` — Item CRUD, tags, conditions, statuses
- `items-filtering.spec.ts` — Status/category filtering, pagination
- `sale-summary.spec.ts` — Pricing summary accuracy
- `helpers.ts` — Shared login, API setup helpers, form field locator
