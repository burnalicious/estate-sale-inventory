# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Estate sale inventory management app. Spring Boot 3.2 (Java 17) backend with React frontend, Postgres database. API-first design — the OpenAPI spec at `spec/openapi.yaml` is the source of truth.

## Architecture

- `spec/openapi.yaml` — OpenAPI 3.0 contract defining all endpoints and schemas
- `backend/` — Spring Boot app (layered: controller → service → repository → JPA entities)
- `frontend/` — React app (not yet scaffolded)
- `docker-compose.yaml` — Postgres 16 for local development

## Running Locally

### 1. Start Postgres
```
docker compose up -d
```

### 2. Run the backend
```
cd backend
./mvnw spring-boot:run
```
API is at http://localhost:8080/api

### 3. Run the frontend (when scaffolded)
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
