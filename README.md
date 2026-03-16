# lifePilot
Take control of your life

## Backend

NestJS backend with Prisma (PostgreSQL) and Redis.

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
# Edit .env with your database and Redis credentials

# Generate Prisma client
npm run prisma:generate

# Run database migrations
npm run prisma:migrate

# Start development server
npm run start:dev
```

### Environment Variables

| Variable          | Description                        | Default     |
|-------------------|------------------------------------|-------------|
| `NODE_ENV`        | Application environment            | development |
| `PORT`            | HTTP port                          | 3000        |
| `DATABASE_URL`    | PostgreSQL connection string       | —           |
| `REDIS_HOST`      | Redis host                         | localhost   |
| `REDIS_PORT`      | Redis port                         | 6379        |
| `REDIS_PASSWORD`  | Redis password (optional)          | —           |
| `REDIS_TTL`       | Default cache TTL in seconds       | 3600        |

### Available Scripts

| Script                    | Description                        |
|---------------------------|------------------------------------|
| `npm run start:dev`       | Start in watch mode                |
| `npm run build`           | Compile TypeScript                 |
| `npm run start:prod`      | Run compiled app                   |
| `npm test`                | Run unit tests                     |
| `npm run test:cov`        | Run tests with coverage            |
| `npm run lint`            | Lint source files                  |
| `npm run prisma:generate` | Regenerate Prisma client           |
| `npm run prisma:migrate`  | Run migrations (dev)               |
| `npm run prisma:deploy`   | Deploy migrations (prod)           |
| `npm run prisma:studio`   | Open Prisma Studio                 |

### Health Check

```
GET /health
```

Returns the status of connected services (PostgreSQL via Prisma).
