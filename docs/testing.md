# Testing Guide

Step-by-step guide to start the API locally and run a minimum set of requests to verify everything works.

---

## 1. Prerequisites

- Node.js >= 18
- Docker & Docker Compose (for PostgreSQL + Redis)

---

## 2. Environment setup

```bash
cp .env.example .env
```

Edit `.env` and set the required values:

| Variable              | Required | Notes                                              |
|-----------------------|----------|----------------------------------------------------|
| `DATABASE_URL`        | ✅       | Already set in `.env.example` for local Docker     |
| `BETTER_AUTH_SECRET`  | ✅       | Run: `openssl rand -base64 32`                     |
| `BETTER_AUTH_URL`     | ⚠️       | Defaults to `http://localhost:3001` if not set     |
| `RESEND`              | ❌       | Optional – emails logged to console when absent    |
| `EMAIL_FROM`          | ❌       | Optional – defaults to `noreply@lifepilot.app`     |

---

## 3. Start dependencies (PostgreSQL + Redis)

```bash
# Start only the postgres and redis containers (not the api container)
docker compose up -d postgres redis
```

Wait until both containers are healthy:

```bash
docker compose ps
```

---

## 4. Install dependencies and migrate the database

```bash
npm install
npm run prisma:migrate
```

> First time: this creates the initial migration and applies it.
> Subsequent times: only new migrations are applied.

---

## 5. Start the API

```bash
npm run start:dev
```

You should see:

```
[Bootstrap] Application is running on: http://localhost:3001
```

---

## 6. Smoke tests (curl)

### Health check

```bash
curl -s http://localhost:3001/health | jq
```

Expected response (`200 OK`):

```json
{
  "status": "ok",
  "info": {
    "database": { "status": "up" }
  },
  "error": {},
  "details": {
    "database": { "status": "up" }
  }
}
```

---

### Auth: Sign-up with email + password

```bash
curl -s -X POST http://localhost:3001/api/auth/sign-up/email \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPassword123!",
    "name": "Test User"
  }' | jq
```

> Expected: `200` with user object.
> If `RESEND` is not configured, a verification email is logged to the console instead of sent.

---

### Auth: Request email OTP for sign-in

```bash
curl -s -X POST http://localhost:3001/api/auth/email-otp/send-verification-otp \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "type": "sign-in"
  }' | jq
```

> Expected: `200`. The OTP code is printed in the API console logs if `RESEND` is not configured.

---

### Auth: Sign-in with OTP

```bash
curl -s -X POST http://localhost:3001/api/auth/email-otp/sign-in \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "otp": "123456"
  }' | jq
```

> Replace `123456` with the OTP from the console log.
> Expected: `200` with session token in `Set-Cookie` and/or response body.

---

### Auth: List active sessions (cookie-based)

```bash
# Replace <SESSION_TOKEN> with the token returned on sign-in
curl -s http://localhost:3001/api/auth/list-sessions \
  -H "Cookie: better-auth.session_token=<SESSION_TOKEN>" | jq
```

Or using Bearer token:

```bash
curl -s http://localhost:3001/api/auth/list-sessions \
  -H "Authorization: Bearer <SESSION_TOKEN>" | jq
```

---

### Auth: Sign-in with email + password (after email verification)

If `requireEmailVerification` is `true`, complete email verification first (via link or OTP), then:

```bash
curl -s -X POST http://localhost:3001/api/auth/sign-in/email \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPassword123!"
  }' | jq
```

---

## 7. Docker (full stack)

To test the production build:

```bash
# Copy and edit .env with real values (BETTER_AUTH_SECRET at minimum)
cp .env.example .env

docker compose up --build
```

The entrypoint automatically runs `prisma migrate deploy` before starting the API.

Verify:

```bash
curl -s http://localhost:3001/health | jq
```

---

## 8. Useful Prisma commands

```bash
# View data in browser UI
npm run prisma:studio

# Generate client after schema changes
npm run prisma:generate

# Create a new migration during development
npm run prisma:migrate

# Apply pending migrations in production/CI
npm run prisma:deploy
```
