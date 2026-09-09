# 🚀 Krello Backend

> **Enterprise-grade Trello Clone RESTful API & Real-time WebSockets Engine** built with **NestJS**, **TypeScript**, **PostgreSQL**, **Prisma ORM**, **Redis**, and **Socket.io**.

[![NestJS](https://img.shields.io/badge/NestJS-v11.0-E0234E?logo=nestjs&logoColor=white)](https://nestjs.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-4169E1?logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Prisma](https://img.shields.io/badge/Prisma-6.17-2D3748?logo=prisma&logoColor=white)](https://www.prisma.io/)
[![Redis](https://img.shields.io/badge/Redis-7.0-DC382D?logo=redis&logoColor=white)](https://redis.io/)
[![Socket.io](https://img.shields.io/badge/Socket.io-4.8-010101?logo=socketdotio&logoColor=white)](https://socket.io/)
[![Swagger](https://img.shields.io/badge/Swagger-OpenAPI%203.0-85EA2D?logo=swagger&logoColor=black)](https://swagger.io/)
[![License: UNLICENSED](https://img.shields.io/badge/License-UNLICENSED-yellow.svg)](#license)

---

## 📖 Table of Contents

- [Overview](#-overview)
- [Key Features](#-key-features)
- [Tech Stack & Architecture](#-tech-stack--architecture)
- [Prerequisites](#-prerequisites)
- [Getting Started](#-getting-started)
  - [1. Clone Repository](#1-clone-repository)
  - [2. Install Dependencies](#2-install-dependencies)
  - [3. Configure Environment Variables](#3-configure-environment-variables)
  - [4. Start Infrastructure (Docker)](#4-start-infrastructure-docker)
  - [5. Run Database Migrations & Seeds](#5-run-database-migrations--seeds)
  - [6. Launch Application](#6-launch-application)
- [Environment Variables Guide](#-environment-variables-guide)
- [API Documentation](#-api-documentation)
- [Database Schema & Models](#-database-schema--models)
- [Testing & Code Quality](#-testing--code-quality)
- [Security & Production Guidelines](#-security--production-guidelines)
- [Folder Structure](#-folder-structure)

---

## 📌 Overview

**Krello Backend** provides a complete backend infrastructure for modern collaborative kanban board applications. It features high-performance data modeling, real-time board sync via WebSockets, role-based access control, file attachment handling with image optimization, third-party integrations (Google Auth, Unsplash, Firebase FCM), and automated cron scheduling.

---

## ✨ Key Features

### 🔐 Authentication & Access Control
- **Authentication**: JWT Access & Refresh Token flow with automatic token rotation and multi-device session management (`Device` tracking).
- **OAuth2 Integration**: One-click login with Google OAuth2 using `google-auth-library` and Passport strategies.
- **Password Management**: Secure password hashing with `bcrypt` + salt, and token-based password reset via email.
- **RBAC (Role-Based Access Control)**: Granular workspace permissions (`owner`, `editor`, `viewer`).

### 📋 Board, List & Card Management
- **Boards**: Dynamic workspace creation, background image fetch via **Unsplash API**, invitation system with expiring email tokens.
- **Lists & Cards**: Full CRUD operations with position-based reordering for fluid drag-and-drop mechanics.
- **Card Enhancements**: 
  - Card member assignments & color-coded labels (`CardLabel`).
  - Interactive Checklists with completion state tracking.
  - File attachments supporting image dynamic resizing (`Sharp`) and Multer storage.
  - Dynamic user comment threads.

### ⚡ Real-Time Collaboration & Notifications
- **WebSockets (Socket.io)**: Live updates for real-time board messaging, active card edits, and dynamic board changes.
- **Audit Activity Logs**: Automated tracking of actions (`Activity` entity) for detailed board audit histories.
- **Notifications**: In-app notification system paired with push notifications via **Firebase Cloud Messaging (FCM)**.

### 🛡️ Security & Performance
- **Rate Limiting**: Built-in request throttling using `@nestjs/throttler` to mitigate DDoS and brute-force attacks.
- **HTTP Security**: HTTP header security configured with `Helmet` middleware.
- **Caching**: High-throughput Redis caching layer powered by `ioredis` and `redis`.
- **Validation**: Global `ValidationPipe` with payload sanitization (`whitelist`, `forbidNonWhitelisted`, dynamic type conversion).
- **Error Handling**: Standardized global exception filter (`HttpExceptionFilter`).

---

## 🛠️ Tech Stack & Architecture

| Layer | Technology |
| :--- | :--- |
| **Framework** | [NestJS v11](https://nestjs.com/) (Node.js framework) |
| **Language** | [TypeScript v5.7](https://www.typescriptlang.org/) |
| **Database** | [PostgreSQL 15](https://www.postgresql.org/) |
| **ORM** | [Prisma v6](https://www.prisma.io/) |
| **Cache & Store** | [Redis 7](https://redis.io/) (via `ioredis`) |
| **Real-Time** | [Socket.io](https://socket.io/) (`@nestjs/websockets`) |
| **Authentication** | Passport.js (JWT, Google OAuth2), Bcrypt |
| **Image & File Storage** | Sharp (resizing), Multer (uploads) |
| **Task Scheduling** | `@nestjs/schedule` (Cron jobs) |
| **Push Notifications** | Firebase Admin SDK (FCM) |
| **API Docs** | Swagger (OpenAPI 3.0) |

---

## 📋 Prerequisites

Before running the application, ensure you have the following installed on your local system:

- **Node.js**: `>= 18.x`
- **npm**: `>= 9.x`
- **Docker & Docker Compose**: (Optional, recommended for PostgreSQL & Redis setup)
- **PostgreSQL**: `>= 15.x` (if running locally without Docker)
- **Redis**: `>= 7.x` (if running locally without Docker)

---

## 🚀 Getting Started

### 1. Clone Repository

```bash
git clone https://github.com/vubaokhanh2311/Krello-backend.git
cd Krello-backend
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Copy the example environment configuration to create your local `.env` file:

```bash
cp .env.example .env
```

*Refer to the [Environment Variables Guide](#-environment-variables-guide) to update secret keys and service credentials.*

### 4. Start Infrastructure (Docker)

Spin up PostgreSQL and Redis instances instantly using Docker Compose:

```bash
docker-compose up -d
```

Verify services are running:
- **PostgreSQL**: `localhost:5432`
- **Redis**: `localhost:6379`

### 5. Run Database Migrations & Seeds

Execute Prisma database migrations and seed default administrative/test data:

```bash
# Run database migrations
npx prisma migrate dev

# Seed database with initial data
npx prisma db seed
```

### 6. Launch Application

```bash
# Development mode with Hot Reloading
npm run start:dev

# Production build & start
npm run build
npm run start:prod

# Debug mode
npm run start:debug
```

Once launched, the API server will be available at `http://localhost:3000/api` (or configured `PORT` and `APP_GLOBAL_PREFIX`).

---

## ⚙️ Environment Variables Guide

| Variable | Description | Default / Example |
| :--- | :--- | :--- |
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://postgres:123456@localhost:5432/trello?schema=public` |
| `PORT` | Application HTTP server port | `3000` |
| `FRONTEND_URL` | Allowed CORS origin(s) (comma-separated) | `http://localhost:5173` |
| `APP_NAME` | Name of the application | `"Krello Backend"` |
| `APP_GLOBAL_PREFIX` | Global API route prefix | `api` |
| `SWAGGER_ENABLE` | Toggle Swagger UI (`true`/`false`) | `true` |
| `SWAGGER_PATH` | Endpoint path for Swagger UI | `api-docs` |
| `SWAGGER_SERVER_URL` | Base URL used in Swagger specification | `http://localhost:3000` |
| `REDIS_HOST` | Hostname for Redis instance | `127.0.0.1` |
| `REDIS_PORT` | Port for Redis instance | `6379` |
| `REDIS_DB` | Database index for Redis instance | `0` |
| `JWT_SECRET` | Secret key for Access Token signing | `your_jwt_secret` |
| `JWT_EXPIRES_IN` | Access Token expiration duration | `1d` |
| `REFRESH_JWT_SECRET` | Secret key for Refresh Token signing | `your_refresh_secret` |
| `REFRESH_JWT_EXPIRES_IN` | Refresh Token expiration duration | `7d` |
| `UNSPLASH_ACCESS_KEY` | Unsplash API Access Key for board wallpapers | `your_unsplash_access_key` |
| `GOOGLE_CLIENT_ID` | Google OAuth2 Client ID | `your_google_client_id` |
| `EMAIL_HOST` | SMTP server host for sending emails | `smtp.example.com` |
| `EMAIL_PORT` | SMTP server port | `587` |
| `EMAIL_USERNAME` | SMTP account username | `no-reply@example.com` |
| `EMAIL_PASSWORD` | SMTP account password | `your_email_password` |
| `FB_PROJECT_ID` | Firebase project ID (Optional) | `your_firebase_project_id` |
| `FB_CLIENT_EMAIL` | Firebase client email (Optional) | `your_firebase_client_email` |
| `FB_PRIVATE_KEY` | Firebase private key (Optional) | `your_firebase_private_key` |

---

## 📚 API Documentation

Interactive OpenAPI 3.0 documentation is generated automatically via `@nestjs/swagger`.

- **Swagger UI URL**: `http://localhost:3000/api-docs` (when `SWAGGER_ENABLE=true`)
- **Features**: Live endpoint testing, DTO schema inspection, JWT Bearer authentication header injection.

---

## 🗄️ Database Schema & Models

The backend leverages PostgreSQL managed through Prisma ORM. Key database entities include:

```mermaid
erDiagram
    User ||--o{ Board : "owns"
    User ||--o{ BoardMember : "member of"
    User ||--o{ CardMember : "assigned to"
    User ||--o{ Device : "has devices"
    Board ||--o{ BoardMember : "contains"
    Board ||--o{ List : "contains"
    Board ||--o{ Label : "has labels"
    Board ||--o{ Activity : "tracks"
    List ||--o{ Card : "contains"
    Card ||--o{ Comment : "has comments"
    Card ||--o{ Attachment : "has attachments"
    Card ||--o{ Checklist : "has checklist items"
    Card ||--o{ CardLabel : "tagged with"
    Card ||--o{ CardMember : "assigned to"
    Label ||--o{ CardLabel : "linked to"
```

### Core Entities Summary
- **User**: User profiles, credentials, Google OAuth mapping, associated roles.
- **Board & BoardMember**: Workspaces with ownership and granular access roles (`owner`, `editor`, `viewer`).
- **BoardInvitation**: Invitation tokens for onboarding board members via email.
- **List & Card**: Kanban column structure and cards ordered via `position` integer fields.
- **CardMember & CardLabel**: Member assignment and color label tagging for cards.
- **Checklist**: Sub-tasks with boolean completion states.
- **Attachment & Comment**: Uploaded file metadata and discussion threads per card.
- **Activity & BoardMessage**: System audit trail and real-time chat messages.
- **Device & Notification**: Active user devices (`jti`, `fcmToken`) and push notifications.

---

## 🧪 Testing & Code Quality

### Running Tests

```bash
# Unit tests
npm run test

# Unit tests in watch mode
npm run test:watch

# End-to-End (E2E) integration tests
npm run test:e2e

# Test coverage report
npm run test:cov
```

### Code Formatting & Linting

```bash
# Run ESLint fix
npm run lint

# Format code with Prettier
npm run format
```

---

## 🔒 Security & Production Guidelines

1. **Swagger UI in Production**: Set `SWAGGER_ENABLE=false` in production environments or place it behind authentication / reverse proxies.
2. **CORS Restrictions**: Configure `FRONTEND_URL` strictly with trusted origins (comma-separated if multiple domains).
3. **File Upload Bounds**: Ensure file uploads under `public/uploads/` are limited by file size and MIME type checks configured in Multer and reverse proxies (e.g. Nginx).
4. **Environment Secrets**: Never commit actual JWT secrets, database passwords, or private keys to source control. Always use environment injection in production.

---

## 📁 Folder Structure

```
Krello-backend/
├── prisma/
│   ├── schema.prisma      # Database schema definitions
│   └── seed.ts            # Database seed script
├── public/
│   └── uploads/           # Static asset upload storage (avatars, attachments)
├── src/
│   ├── common/            # Global filters, guards, pipes, interceptors
│   ├── config/            # Application & configuration loaders
│   ├── constants/         # Constant declarations & enums
│   ├── helpers/           # Helper functions & data transformers
│   ├── modules/           # Feature modules
│   │   ├── activity/      # Board activity tracking module
│   │   ├── attachment/    # File upload & storage management
│   │   ├── auth/          # Authentication & Google OAuth
│   │   ├── board/         # Board & Workspace management
│   │   ├── card/          # Kanban Card operations
│   │   ├── card-label/    # Label attachment logic
│   │   ├── card-member/   # Member card assignment
│   │   ├── comment/       # Card discussion comments
│   │   ├── device/        # FCM token & device sessions
│   │   ├── firebase/      # Firebase Admin integration
│   │   ├── label/         # Board labels management
│   │   ├── list/          # Board lists/columns
│   │   ├── notification/  # Notification center module
│   │   ├── socket/        # Real-time Socket.io Gateway
│   │   ├── unsplash/      # Unsplash background image API
│   │   └── user/          # Profile & User administration
│   ├── shared/            # Shared services (Prisma, Redis, Mailer)
│   ├── utils/             # Utilities (Swagger setup, logger, formatters)
│   ├── app.module.ts      # Root Application Module
│   └── main.ts            # Entrypoint file
├── test/                  # E2E test suites
├── docker-compose.yml     # Docker infrastructure (PostgreSQL & Redis)
├── package.json           # Dependencies and scripts
└── README.md              # Project documentation
```

---

## 📄 License

This project is [UNLICENSED](LICENSE). All rights reserved.
