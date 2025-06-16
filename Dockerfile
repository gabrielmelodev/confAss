# Etapa 1 – Build
FROM node:20-slim AS builder

WORKDIR /app

# Instala dependências necessárias para Prisma e Next.js
RUN apt-get update && apt-get install -y openssl git libssl-dev

# Copia apenas o necessário inicialmente (para cache de npm install)
COPY package.json package-lock.json ./
RUN npm install

# Copia o restante da aplicação
COPY . .

# Gera o Prisma Client (usa os engines corretos para o Debian, sem precisar de binaryTargets especiais)
RUN npx prisma generate

# Build do Next.js
RUN npm run build


# Etapa 2 – Runner (Imagem de Produção)
FROM node:20-slim AS runner

WORKDIR /app

RUN apt-get update && apt-get install -y openssl libssl-dev

# Copia apenas os arquivos necessários para execução em produção
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/prisma ./prisma
COPY .env .env

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV NEXT_DISABLE_ESLINT=true

EXPOSE 9000

CMD ["npm", "start"]
