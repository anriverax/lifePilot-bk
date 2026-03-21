# lifePilot
Take control of your life

## Backend

NestJS backend with Prisma (PostgreSQL), Redis, and Better Auth.

### Requirements

- Node.js >= 18
- PostgreSQL
- Redis

### Setup

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env
# Edit .env with your database, Redis, and auth credentials

# Generate Prisma client
npm run prisma:generate

# Run database migrations
npm run prisma:migrate

# Start development server
npm run start:dev
```

### Environment Variables

#### Core

| Variable           | Description                              | Default     |
|--------------------|------------------------------------------|-------------|
| `NODE_ENV`         | Application environment                  | development |
| `PORT`             | HTTP port                                | 3001        |
| `DATABASE_URL`     | PostgreSQL connection string (required)  | —           |
| `CORS_ORIGINS`     | Comma-separated allowed origins          | http://localhost:3000 |

#### PostgreSQL (used by docker-compose)

| Variable            | Description        | Default    |
|---------------------|--------------------|------------|
| `POSTGRES_USER`     | DB username        | postgres   |
| `POSTGRES_PASSWORD` | DB password        | postgres   |
| `POSTGRES_DB`       | DB name            | lifepilot  |

#### Redis

| Variable        | Description                       | Default              |
|-----------------|-----------------------------------|----------------------|
| `REDIS`         | Redis connection URL               | redis://localhost:6379 |

#### Better Auth

| Variable              | Description                                    | Default |
|-----------------------|------------------------------------------------|---------|
| `BETTER_AUTH_SECRET`  | Secret key (min 32 chars, **required**)        | —       |
| `BETTER_AUTH_URL`     | Public base URL of the API server              | —       |

#### Email (OTP & Verification)

Better Auth sends OTP codes on sign-up (email verification) and sign-in (second-factor).
Emails are delivered via [Resend](https://resend.com).

| Variable      | Description                                   | Default               |
|---------------|-----------------------------------------------|-----------------------|
| `RESEND`      | Resend API key (`sk_...`)                     | — (email skipped if absent) |
| `EMAIL_FROM`  | Verified sender address for outgoing emails   | noreply@lifepilot.app |

> **Important**: The default `noreply@lifepilot.app` sender must be a **verified domain** in your Resend account before emails can be delivered in production. Set `EMAIL_FROM` to an address on a domain you have verified with Resend.

> **Local development**: if `RESEND` is not set, all outgoing emails are logged to the console instead of being sent. This allows the app to start without a real email provider.

#### Rate limiting / throttle

| Variable        | Description                | Default |
|-----------------|----------------------------|---------|
| `THROTTLE_TTL`  | Window size in ms          | 60000   |
| `THROTTLE_LIMIT`| Max requests per window    | 100     |

### Auth Flows

#### Sign-up with email verification
1. `POST /api/auth/sign-up/email` — create account (email + password)
2. Better Auth sends a verification **link** to the user's email (via `emailAndPassword.sendVerificationEmail`)
3. User clicks the link to activate their account

   Additionally, the `emailOTP` plugin can send a 6-digit OTP for email verification:
   - `POST /api/auth/email-otp/send-verification-otp` `{ email, type: "email-verification" }` — request OTP
   - `POST /api/auth/email-otp/verify-email` — submit the OTP to activate the account

#### Sign-in with OTP second factor
1. `POST /api/auth/email-otp/send-verification-otp` `{ email, type: "sign-in" }` — request OTP (6 digits, 10-min expiry)
2. `POST /api/auth/email-otp/sign-in` `{ email, otp }` — complete sign-in

#### Password reset
1. `POST /api/auth/forget-password`
2. OTP sent to email (`type: "forget-password"`)
3. `POST /api/auth/reset-password` with OTP

#### Session management (built-in Better Auth endpoints)

| Endpoint                                  | Description                    |
|-------------------------------------------|--------------------------------|
| `GET  /api/auth/list-sessions`            | List all active sessions       |
| `POST /api/auth/revoke-session`           | Revoke a specific session      |
| `POST /api/auth/revoke-other-sessions`    | Revoke all sessions except current |

Sessions are persisted in the PostgreSQL `session` table and cached in Redis for performance.
The `Authorization: Bearer <token>` header is also accepted (Bearer plugin).

### Available Scripts

| Script                    | Description                        |
|---------------------------|------------------------------------|
| `npm run start:dev`       | Start in watch mode (port 3001)    |
| `npm run build`           | Compile TypeScript                 |
| `npm run start:prod`      | Run compiled app                   |
| `npm run format`          | Format source files with Prettier  |
| `npm run lint`            | Lint source files                  |
| `npm run lint:fix`        | Lint and auto-fix source files     |
| `npm run prisma:generate` | Regenerate Prisma client           |
| `npm run prisma:migrate`  | Run migrations (dev)               |
| `npm run prisma:deploy`   | Deploy migrations (prod)           |
| `npm run prisma:studio`   | Open Prisma Studio                 |

### Health Check

```
GET /health
```

Returns the status of connected services (PostgreSQL via Prisma).
