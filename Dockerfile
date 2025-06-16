# Etapa 1 – Instala dependências e compila
FROM node:20-alpine AS builder

WORKDIR /app

# Copia arquivos de configuração
COPY package.json package-lock.json ./
RUN npm install

# Copia o restante do código
COPY . .

ENV PRISMA_CLI_QUERY_ENGINE_TYPE=binary
ENV PRISMA_GENERATE_BINARY_TARGETS=linux-musl

# Gera o Prisma Client já com as binaries certas
RUN npx prisma generate

# Compila o Next.js
RUN npm run build


# Etapa 2 – Imagem final para produção
FROM node:20-alpine AS runner

WORKDIR /app

# Copia apenas o necessário para produção
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/prisma ./prisma


COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV NEXT_DISABLE_ESLINT=true

EXPOSE 9000

CMD ["next", "start"]
