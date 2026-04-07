# Website Generator

AI-powered portfolio generator monorepo.

## Monorepo Layout

- `website-generator-app/frontend`: Next.js frontend (App Router, API routes, auth, dashboard UI)
- `website-generator-app/webgen-backend`: Spring Boot backend (portfolio generation, resume parsing, export pipeline)

## Prerequisites

- Node.js (current LTS recommended)
- npm
- Java 25 (configured in backend `pom.xml`)
- Docker (for local Postgres/Redis/RabbitMQ in dev mode)

## Environment Setup

Set up env files before running either app.

### Frontend env

Use:

- `website-generator-app/frontend/.env.example`

Copy and fill:

```bash
cp website-generator-app/frontend/.env.example website-generator-app/frontend/.env.local
```

### Backend env

Use:

- `website-generator-app/webgen-backend/.env.dev.example` (local/dev)
- `website-generator-app/webgen-backend/.env.prod.example` (prod template)

Copy and fill:

```bash
cp website-generator-app/webgen-backend/.env.dev.example website-generator-app/webgen-backend/.env.dev
cp website-generator-app/webgen-backend/.env.prod.example website-generator-app/webgen-backend/.env.prod
```

## Run Locally (Dev)

1. Start local infra (Postgres, Redis, RabbitMQ):

```bash
cd website-generator-app/webgen-backend
docker compose up -d
```

2. Start backend:

```bash
cd website-generator-app/webgen-backend
./start-backend.sh dev
```

3. Start frontend in a second terminal:

```bash
cd website-generator-app/frontend
npm install
npm run dev
```

4. Open `http://localhost:3000`

Backend defaults to `http://localhost:8080` unless overridden.

## Useful Commands

### Frontend

```bash
cd website-generator-app/frontend
npm run dev
npm run build
npm test
```

### Backend

```bash
cd website-generator-app/webgen-backend
./mvnw test
./start-backend.sh dev
```
