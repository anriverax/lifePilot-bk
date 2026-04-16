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





auth/application
auth/application/create-auth.command.ts
auth/application/create-auth.handler.ts
auth/infrastructure
auth/infrastructure/auth.controller.ts
auth/infrastructure/auth.repository.ts
auth/infrastructure/security/password-hasher.port.ts
auth/infrastructure/security/argon-password-hasher.adapter.ts
auth/infrastructure/email/email-sender.port.ts
auth/infrastructure/email/resend-email.adapter.ts















BORRAR
Route Handler
// app/api/auth/login/route.ts (Next.js App Router)
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { AES } from "crypto-js";

const PLAIN_TEXT = process.env.PLAIN_TEXT!; // misma clave que el backend

export async function POST(request: Request) {
  const { email, password } = await request.json();

  // Cifrar antes de enviar al backend
  const body = {
    [AES.encrypt("email",  PLAIN_TEXT).toString()]: AES.encrypt(email,    PLAIN_TEXT).toString(),
    [AES.encrypt("passwd", PLAIN_TEXT).toString()]: AES.encrypt(password, PLAIN_TEXT).toString(),
  };

  const res = await fetch("http://localhost:3001/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const error = await res.json();
    return NextResponse.json(error, { status: res.status });
  }

  const { data } = await res.json(); // { token, user }

  // Setear cookie httpOnly en el navegador desde Next.js
  const cookieStore = await cookies();
  cookieStore.set("session_token", data.token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 7 días (igual que tu config de better-auth)
    path: "/",
  });

  return NextResponse.json({ user: data.user });
}
Middleware
// middleware.ts (raíz del proyecto Next.js)
import { NextRequest, NextResponse } from "next/server";

const PUBLIC_ROUTES = ["/login", "/register", "/verify-email"];

export function middleware(req: NextRequest) {
  const token = req.cookies.get("session_token")?.value;
  const isPublic = PUBLIC_ROUTES.some(r => req.nextUrl.pathname.startsWith(r));

  if (!token && !isPublic) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next|favicon.ico|api/auth).*)"],
};

// lib/api.ts
// lib/api.ts
export async function fetchProtected(path: string, options?: RequestInit) {
  const { cookies } = await import("next/headers");
  const cookieStore = await cookies();
  const token = cookieStore.get("session_token")?.value;

  return fetch(`http://localhost:3001/api${path}`, {
    ...options,
    headers: {
      ...options?.headers,
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
}