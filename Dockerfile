# Etapa 1: Builder
FROM node:20-alpine3.21 AS builder

WORKDIR /lifePilot

# Copiamos solo los archivos necesarios para instalar dependencias
COPY package*.json ./

# IMPORTANTE: Copiar prisma ANTES de npm install
# para que el postinstall script (npx prisma generate) encuentre el schema
COPY prisma ./prisma

RUN npm install

# Copiamos el código fuente
COPY . .

RUN npm run build

# -------------------------------------

# Fase 2: Runner
FROM node:20-alpine3.21 AS runner

WORKDIR /lifePilot

# Variables de entorno
ENV NODE_ENV=production
ENV PORT=3001

COPY --from=builder /lifePilot/prisma ./prisma
COPY --from=builder /lifePilot/prisma.config.ts ./prisma.config.ts
COPY --from=builder /lifePilot/node_modules ./node_modules
COPY --from=builder /lifePilot/dist ./dist

COPY package*.json ./

# Copiar entrypoint y wait-for-it desde repo
COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
COPY wait-for-it.sh /usr/local/bin/wait-for-it.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh /usr/local/bin/wait-for-it.sh

RUN chown -R node:node /lifePilot
# Usamos usuario no-root
USER node

EXPOSE 3001

CMD ["/usr/local/bin/docker-entrypoint.sh"]