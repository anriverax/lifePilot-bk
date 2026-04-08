#!/bin/sh
set -e


npx prisma migrate deploy --schema ./prisma/schema.prisma

# npx prisma db seed || echo "⚠️ No seed script found, skipping..."

exec npm run start:prod