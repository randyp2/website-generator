# PortfolioAI

An AI-powered portfolio generator that transforms your resume, media, and personal info into a fully responsive, styled portfolio website — no coding required.

![Hero Screenshot](docs/images/hero.png)

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [API Reference](#api-reference)

---

## Overview

PortfolioAI lets users create professional portfolio websites in minutes. Users fill out a multi-step form, upload their resume and media files, pick a design style, and the app uses OpenAI to generate a unique, production-ready HTML/CSS portfolio. Portfolios can be previewed live, shared via email, and saved to their account.

![App Demo](docs/images/demo.gif)

---

## Features

### AI Portfolio Generation
Powered by OpenAI GPT. Each portfolio is uniquely generated from your personal info, resume content, and chosen style — no two portfolios look the same.

### Design Themes
Choose from 5 distinct visual styles:
- **Apple** — Clean, minimal, whitespace-forward
- **Neon** — Dark background with vibrant glowing accents
- **Zen** — Calm, balanced, nature-inspired
- **Minimal** — Typography-first, no distractions
- **Cyberpunk** — Bold, futuristic, high contrast

### Multi-Step Form Workflow
Guided creation flow covering personal info, skills, custom sections, file uploads, and style selection.

![Form Workflow](docs/images/form-flow.png)

### Resume & Media Upload
Upload a PDF or DOCX resume and any images or videos. Files are stored in Supabase Storage and parsed into the generation prompt automatically.

### Multi-Step Creation Flow
Guided step-by-step process to build your portfolio:

| Step | Description |
|---|---|
| Template | Pick a base layout |
| Style | Choose your visual theme and customize the look |
| Resume | Upload your resume and media files |
| Refine | Fine-tune sections and preview the result |

![Step 1 — Template](docs/images/step-template.png)
![Step 2 — Style](docs/images/step-style.png)
![Step 3 — Resume](docs/images/step-resume.png)
![Step 4 — Refine](docs/images/step-refine.png)

### Live Preview
Instantly preview your generated portfolio in the browser. View the source code or share a preview link via email with a verification code.

![Preview](docs/images/preview.png)

### Portfolio Dashboard
Manage all your portfolios in one place. Edit, version, and track the status of each one.

![Dashboard](docs/images/dashboard.png)

### Authentication
Secure sign-in via Supabase Auth. JWT tokens are validated server-side against Supabase's public JWKS endpoint — no secrets stored client-side.

### Rate Limiting
API routes are rate-limited via Upstash Redis to protect against abuse.

---

## Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| Next.js 15 | App framework (App Router) |
| React 19 | UI |
| TypeScript | Type safety |
| Tailwind CSS 4 | Styling |
| Zustand | Client state management |
| Framer Motion | Animations |
| Supabase SSR | Auth + database client |
| Upstash Redis | Rate limiting |
| Resend | Email (preview sharing) |

### Backend
| Technology | Purpose |
|---|---|
| Spring Boot 3.5 | REST API framework |
| Spring AI | OpenAI integration |
| Spring Security | JWT authentication |
| Spring Data JPA | ORM / database access |
| PostgreSQL | Relational database |
| Flyway | Database migrations |
| Nimbus JOSE + JWT | JWKS token validation |
| Lombok | Boilerplate reduction |

### Infrastructure
| Service | Purpose |
|---|---|
| Supabase | Auth, database, file storage |
| OpenAI | Portfolio generation (GPT) |
| Vercel | Frontend deployment |
| Upstash | Redis (rate limiting) |
| Resend | Transactional email |

---

## Architecture

```
User Browser
     │
     ▼
Next.js Frontend (Vercel)
     │
     ├── /api routes (server-side)
     │       ├── portfolio CRUD → Supabase DB
     │       ├── file uploads → Supabase Storage
     │       └── email → Resend
     │
     └── /api/generate → Spring Boot Backend
                               │
                               └── OpenAI GPT
                                   (generates HTML/CSS)

Auth: Supabase JWT → validated by Spring Boot via JWKS
DB:   Supabase PostgreSQL (prod) / local PostgreSQL (dev)
```

### Key Design Decisions
- **Stateless backend** — Spring Boot uses no sessions; every request is authenticated via JWT
- **Layered database** — Local PostgreSQL for dev, Supabase PostgreSQL for prod, managed by Flyway migrations
- **JWKS-based auth** — Backend fetches Supabase's public keys dynamically, no shared secrets
- **Spring AI abstraction** — Swappable AI provider layer over OpenAI
- **Next.js API as proxy** — Frontend API routes handle Supabase operations server-side, keeping service role keys off the client

---

## Getting Started

### Prerequisites
- Node.js 20+
- pnpm
- Java 21+
- Maven
- PostgreSQL (for local dev)
- Supabase project
- OpenAI API key

### Frontend

```bash
cd website-generator-app/frontend
pnpm install
cp .env.local.example .env.local   # fill in your values
pnpm dev
```

Frontend runs at `http://localhost:3000`

### Backend

```bash
cd website-generator-app/webgen-backend
cp secrets.properties.example secrets.properties   # fill in your values
./mvnw spring-boot:run -Dspring-boot.run.profiles=dev
```

Backend runs at `http://localhost:8080`

### Database

Start local PostgreSQL via Docker:

```bash
cd website-generator-app/webgen-backend
docker-compose up -d
```

Flyway will apply migrations automatically on startup.

---

## Environment Variables

### Frontend — `.env.local`

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SECRET_KEY=
RESEND_API_KEY=
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
```

### Backend — `secrets.properties`

```env
SPRING_AI_OPENAI_API_KEY=
SUPABASE_PROJECT_URL=
SUPABASE_DB_PASSWORD=
```

---

## API Reference

### Backend (Spring Boot — `localhost:8080`)

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/generate/ping` | None | Health check |
| GET | `/api/generate/secure` | JWT | Auth test |
| POST | `/api/generate` | None | Generate portfolio HTML from form data |

### Frontend API Routes (Next.js — `/api/*`)

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/portfolio/create` | Create portfolio, upload files |
| GET | `/api/portfolio/list` | List user portfolios |
| GET | `/api/portfolio/[id]/get` | Get portfolio by ID |
| POST | `/api/portfolio/[id]/update` | Update portfolio |
| POST | `/api/sendPreviewVerification` | Send preview email |
| POST | `/api/verifyPreviewCode` | Verify preview code |
| POST | `/api/uploadPreview` | Upload preview HTML |
