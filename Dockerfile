# Etapa 1: Builder
FROM node:20-alpine3.21 AS builder

WORKDIR /lifePilot

# Copiamos solo los archivos necesarios para instalar dependencias
COPY package*.json ./

# Instalamos dependencias
RUN npm install

# Copiamos el código fuente
COPY . .

# Compilamos la aplicación
RUN npm run build

# -------------------------------------

# Fase 2: Runner
FROM node:20-alpine3.21 AS runner

WORKDIR /lifePilot

# Variables de entorno
ENV NODE_ENV=production
ENV PORT=3000
COPY --from=builder /lifePilot/prisma ./prisma
COPY --from=builder /lifePilot/node_modules ./node_modules
COPY --from=builder /lifePilot/dist ./dist

COPY package*.json ./

# Copiar entrypoint desde repo
COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

RUN chown -R node:node /lifePilot
# Usamos usuario no-root
USER node

EXPOSE 3000

CMD ["/usr/local/bin/docker-entrypoint.sh"]